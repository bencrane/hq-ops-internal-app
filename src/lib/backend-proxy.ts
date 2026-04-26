import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getJwt, jwtErrorResponse } from "./auth";
import { JWT_COOKIE, JWT_EXPIRY_COOKIE } from "./auth-constants";

/**
 * Forward a request to a backend that authenticates via the AUX-issued JWT.
 *
 * On a 401 from the backend, the cached JWT cookie is cleared and the
 * request is retried once with a freshly minted JWT. Persistent 401s are
 * returned to the caller verbatim.
 */
export async function backendProxy(
  baseUrl: string | undefined,
  path: string,
  init?: RequestInit
): Promise<Response> {
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Backend base URL not configured" },
      { status: 500 }
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}${path}`;

  const send = (jwt: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    });

  let jwt = await getJwt();
  if (!jwt.ok) return jwtErrorResponse(jwt);

  let upstream = await send(jwt.jwt);

  if (upstream.status === 401) {
    const jar = await cookies();
    jar.delete(JWT_COOKIE);
    jar.delete(JWT_EXPIRY_COOKIE);

    jwt = await getJwt();
    if (!jwt.ok) return jwtErrorResponse(jwt);
    upstream = await send(jwt.jwt);
  }

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
