# Backend proxying

The browser only ever talks to same-origin `/api/*` Route Handlers. Each
handler forwards to a backend that authenticates with a JWT minted by AUX
(auth-engine-x). The shared helper [`backendProxy`](./backend-proxy.ts)
encapsulates that pattern.

## How it works

1. The browser signs in client-side via the better-auth SDK
   ([`auth-client.ts`](./auth-client.ts)). The session token is POSTed to
   `/api/auth/session` and stored as the httpOnly cookie `aux_session`.
2. On each backend request, [`getJwt()`](./auth.ts) reads `aux_session`,
   returns a cached JWT (`aux_jwt` cookie) when fresh, or exchanges the
   session token at AUX `/api/auth/token` for a new one.
3. `backendProxy(baseUrl, path, init?)` calls `getJwt()`, attaches
   `Authorization: Bearer <jwt>`, and forwards the request.
4. **On a 401 from the backend**, the cached JWT cookie is cleared,
   `getJwt()` re-runs (forcing a fresh exchange), and the request is
   retried once. A second 401 is returned to the client unchanged.

## Adding a new backend

1. Add the base URL env var to Doppler (e.g. `FOO_API_BASE_URL`). Server
   secrets stay un-prefixed; only browser-readable values get
   `NEXT_PUBLIC_`.
2. Add a Route Handler under `src/app/api/...` that delegates:
   ```ts
   import { backendProxy } from "@/lib/backend-proxy";

   export async function GET() {
     return backendProxy(process.env.FOO_API_BASE_URL, "/things");
   }

   export async function POST(req: Request) {
     const body = await req.text();
     return backendProxy(process.env.FOO_API_BASE_URL, "/things", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body,
     });
   }
   ```
3. Call `/api/...` from the browser. Do not attach an `Authorization`
   header client-side — the JWT lives in an httpOnly cookie and is added
   by the proxy.

## Existing wrappers

- [`serxProxy`](./serx.ts) — thin wrapper for SERX. Used by
  `/api/orgs`, `/api/users`, `/api/meetings/upcoming`.
- The MAGS routes (`/api/agents/*`, `/api/sync`) call `backendProxy`
  directly with `process.env.MAGS_API_BASE_URL`.

## What the helper does **not** do

- It does not redirect the browser on 401. The route returns 401; client
  code decides whether to redirect to `/sign-in`.
- It does not parse or transform the response body — status, body bytes,
  and `content-type` are forwarded verbatim.
- It does not retry on non-401 errors.
