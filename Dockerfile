# syntax=docker/dockerfile:1.7

# ---------- deps ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder ----------
FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      apt-transport-https ca-certificates curl gnupg \
 && curl -sLf --retry 3 --tlsv1.2 --proto "=https" \
      'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' \
      | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" \
      > /etc/apt/sources.list.d/doppler-cli.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends doppler \
 && apt-get purge -y --auto-remove curl gnupg \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["doppler", "run", "--", "node", "server.js"]
