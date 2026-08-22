# Jingle Jotter — single web app image (SQLite variant, same shape as
# MediaVault/filmDB). Keeps the full node_modules tree rather than Next's
# pruned "standalone" output: Prisma's CLI (needed at boot for
# `migrate deploy`) drags in its own dependency tree that standalone's trace
# doesn't pick up, and copying node_modules as a whole directory keeps
# internal symlinks (node_modules/.bin/prisma) intact. better-sqlite3 is a
# native module requiring build tools in the builder stage.

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# better-sqlite3 requires node-gyp to compile: python, make, g++.
RUN apk add --no-cache python3 make g++
RUN npm ci

RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# Apply any pending migrations, then start the server. Safe on every boot:
# migrate deploy is a no-op when the schema is already up to date.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
