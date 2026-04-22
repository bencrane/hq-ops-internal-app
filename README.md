# hq-ops-internal-app

Next.js 16 app deployed to Railway via Docker, with [Doppler](https://doppler.com) as the single source of truth for secrets.

## Local development

One-time setup:

```bash
brew install dopplerhq/cli/doppler
doppler login
doppler setup   # select the project, config: prd
npm install
```

Run the dev server (secrets injected by Doppler):

```bash
doppler run -- npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production (Railway)

- Platform: Railway, Docker builder (`Dockerfile` at repo root, config in `railway.toml`).
- Runtime listens on port **8080**. Map Railway's public networking / custom domain to 8080.
- The **only** Railway env var required is `DOPPLER_TOKEN` — a Doppler service token scoped to the `prd` config. Everything else is pulled from Doppler at container start via `doppler run --`.

### Rotating secrets

1. Update the value in Doppler (`prd` config).
2. Redeploy the Railway service (Railway caches the image; a redeploy re-runs the CMD and re-fetches secrets).

### Rotating the Doppler token

1. Generate a new service token in Doppler → Project → `prd` → Service Tokens.
2. Update `DOPPLER_TOKEN` in Railway Variables.
3. Redeploy.

## Testing the Docker image locally

```bash
docker build -t hq-ops-internal-app .
docker run --rm -p 8080:8080 -e DOPPLER_TOKEN=<your-token> hq-ops-internal-app
# visit http://localhost:8080
```

## Project conventions

- No `.env` / `.env.example` in the repo. The secret contract lives in Doppler (`prd` config) plus whatever reads `process.env.*` in code.
- Do not add new Railway env vars. Add the secret to Doppler instead.
