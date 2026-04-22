<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Secrets & Deployment

- **Doppler is the single source of truth for secrets.** Do not create `.env` or `.env.example` files in this repo.
- The runtime contract in Railway is a single env var: `DOPPLER_TOKEN` (a Doppler service token scoped to the `prd` config). The container runs `doppler run -- node server.js`, which injects all secrets at startup.
- Locally: `doppler login && doppler setup` once, then `doppler run -- npm run dev`.
- Railway uses the `Dockerfile` at the repo root (see `railway.toml`). The container listens on **port 8080**; map Railway's public networking / custom domain to 8080.
- Next.js is configured with `output: "standalone"` so the production image is minimal and does not need a full `node_modules` install at runtime.
- The app must boot successfully even when Doppler has zero secrets configured. Any new code that reads an env var must degrade gracefully (feature flags, lazy init, clear error on use — not at boot) unless that secret is truly required for the process to start.
