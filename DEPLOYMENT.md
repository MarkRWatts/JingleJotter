# Deploying Jingle Jotter

Follows the house pattern in `../DOCKER-DEPLOY-PLAYBOOK.md` (shared Caddy edge
on `srvclaudedockerapps.lan`, three-file compose split, acme-dns certs), with
two deltas worth knowing:

- **DNS is managed in Cloudflare** (markrwatts.com zone), not Easyspace as the
  playbook says. The acme-dns delegation pattern is unchanged — only where the
  records live moved. LAN A records must be "DNS only" (grey cloud);
  Cloudflare forces this for RFC1918 addresses anyway.
- **SQLite, not Postgres** (MediaVault/filmDB variant): no db container. The
  database file lives in the named volume `jinglejotter_data` at
  `/app/data/jinglejotter.db`; `prisma migrate deploy` runs on every container
  boot.

## Overview

- Prod URL: `https://jinglejotter.markrwatts.com` (LAN-only — the A record
  points at the VM's LAN IP, `192.168.1.77`).
- Local dev: `npm run dev` (port 3003) or `docker compose up` → `localhost:3003`.
- Auth: Google OAuth (Google Cloud project `jinglejotter`, client "Jingle
  Jotter Web") restricted by the `ALLOWED_EMAILS` env allowlist. Redirect URIs
  registered for both localhost:3003 and the prod domain. The OAuth consent
  screen is in **Testing** mode with both household accounts as test users —
  if a third login is ever added, add them as a test user (or publish the app).

## One-time setup (already done, 2026-08-22)

1. acme-dns account registered (`curl -X POST https://auth.acme-dns.io/register`)
   — credentials live in `~/edge/.env` on the VM as `JINGLEJOTTER_ACMEDNS_*`.
2. Cloudflare DNS records (markrwatts.com):
   - `CNAME _acme-challenge.jinglejotter` → `<acme-dns fulldomain>` (DNS only)
   - `A jinglejotter` → `192.168.1.77` (DNS only)
3. Site block appended to `~/edge/Caddyfile`:

   ```
   jinglejotter.markrwatts.com {
       tls {
           dns acmedns {
               username {$JINGLEJOTTER_ACMEDNS_USERNAME}
               password {$JINGLEJOTTER_ACMEDNS_PASSWORD}
               subdomain {$JINGLEJOTTER_ACMEDNS_SUBDOMAIN}
               server_url https://auth.acme-dns.io
           }
       }
       reverse_proxy jinglejotter:3000
   }
   ```

4. `~/JingleJotter/.env.docker` created on the VM from `.env.docker.example`
   (AUTH_SECRET, Google client creds, ALLOWED_EMAILS, AUTH_URL).
5. Nightly backup: `deploy`'s crontab archives the `jinglejotter_data` volume
   to `~/backups/jinglejotter/` (14-day retention), same shape as filmDB's
   SQLite backup.

## Updating the deployed app

```bash
ssh deploy@srvclaudedockerapps.lan
cd ~/JingleJotter
git pull
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Data persistence & restore

The SQLite file is the whole state. Back up = archive the volume; restore =
untar into the volume before the container boots:

```bash
# backup (what the cron job does)
docker run --rm -v jinglejotter_data:/data -v ~/backups/jinglejotter:/backup \
  alpine tar czf /backup/jinglejotter-$(date +%F).tar.gz -C /data .

# restore
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml down
docker run --rm -v jinglejotter_data:/data -v ~/backups/jinglejotter:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/<file>.tar.gz -C /data"
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml up -d
```
