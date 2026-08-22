# Suggested subreddit: r/selfhosted (also fits r/opensource)

**Title:** I replaced my family's Christmas spreadsheet with a cosy self-hosted app — Jingle Jotter (GPLv3)

---

For the last two years my wife and I have run Christmas out of an Excel
spreadsheet: a big purchase list, per-person gift budgets, and a tab for our
December city break. It worked, but it was joyless — so this weekend I replaced
it with **Jingle Jotter**, a self-hosted web app, and I'm rather pleased with
how it turned out.

**What it does:**

- Tracks every gift from *idea* → *purchased* → *arrived* → *wrapped* (with a
  small confetti burst on that last one, obviously)
- Four budgets — gifts, food, festive extras, and the December trip — with
  planned-vs-actual so "ideas" never inflate the real spend
- Per-person gift budgets on little gift-tag-shaped cards
- **Surprise masking** — my favourite bit: my wife and I both use it, and gifts
  *for* her are hidden from *her* login (shown only as "🎁 Surprise" with a
  price) while still counting toward the shared budgets. One app, no spoilers.
- A city break planner that knows which meals you haven't booked yet
  (arrival-night dinner, three on the full days, departure breakfast) and pins
  your bookings on an OpenStreetMap view, geocoded from the venue names
- Seasons: one writable "current" year; every past Christmas becomes a
  read-only archive you can flick back to from the nav
- A run-up calendar that snows over the days you've already used up, and a
  "shopping weekends left" counter that is frankly a bit menacing
- All the festive decoration sits behind a per-user toggle for when you want
  it calm

**Stack:** Next.js 16 + TypeScript + Tailwind, Prisma on **SQLite** (single
container, no database server — the whole state is one file in a Docker
volume), Google sign-in behind an email allowlist, Leaflet/OSM for the map.
Deploys with a three-file docker-compose behind whatever reverse proxy you
already run.

Full disclosure: I art-directed and product-managed while Claude Code wrote
essentially all of it over one (long) Saturday — including the hand-drawn SVG
rooftop scene in the footer. The snowman was my idea though.

GPLv3, screenshots in the README:
**https://github.com/MarkRWatts/JingleJotter**

It's built for one household rather than as a hosted service (single shared
dataset, invite-by-allowlist), but if it makes your December less
spreadsheet-shaped, it's yours.
