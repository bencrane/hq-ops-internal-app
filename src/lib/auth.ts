import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, JWT_COOKIE, JWT_EXPIRY_COOKIE } from "./auth-constants";

export { SESSION_COOKIE, JWT_COOKIE, JWT_EXPIRY_COOKIE };

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const JWT_REFRESH_BUFFER_SECONDS = 120;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function auxBaseUrl(): string | null {
  const url = process.env.AUX_API_BASE_URL;
  return url ? url.replace(/\/$/, "") : null;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { ...baseCookie, maxAge: SESSION_MAX_AGE_SECONDS });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(JWT_COOKIE);
  jar.delete(JWT_EXPIRY_COOKIE);
}

async function exchangeSessionForJwt(
  sessionToken: string
): Promise<{ jwt: string; expiresAt: number } | { error: string; status: number }> {
  const base = auxBaseUrl();
  if (!base) return { error: "AUX_API_BASE_URL not configured", status: 500 };

  const res = await fetch(`${base}/api/auth/token`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text || `Token exchange failed (${res.status})`, status: res.status };
  }
  const data = (await res.json()) as { token?: string; jwt?: string; expires_at?: number; expiresAt?: number };
  const jwt = data.token ?? data.jwt;
  if (!jwt) return { error: "Token exchange returned no JWT", status: 502 };

  const expiresAt = data.expires_at ?? data.expiresAt ?? Math.floor(Date.now() / 1000) + 15 * 60;
  return { jwt, expiresAt };
}

export type JwtResult =
  | { ok: true; jwt: string }
  | { ok: false; status: number; error: string };

export async function getJwt(): Promise<JwtResult> {
  const jar = await cookies();
  const sessionToken = jar.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return { ok: false, status: 401, error: "Not signed in" };
  }

  const cachedJwt = jar.get(JWT_COOKIE)?.value;
  const cachedExp = Number(jar.get(JWT_EXPIRY_COOKIE)?.value || 0);
  const nowSec = Math.floor(Date.now() / 1000);
  if (cachedJwt && cachedExp - nowSec > JWT_REFRESH_BUFFER_SECONDS) {
    return { ok: true, jwt: cachedJwt };
  }

  const result = await exchangeSessionForJwt(sessionToken);
  if ("error" in result) {
    if (result.status === 401) await clearAuthCookies();
    return { ok: false, status: result.status, error: result.error };
  }

  const ttl = Math.max(60, result.expiresAt - nowSec);
  jar.set(JWT_COOKIE, result.jwt, { ...baseCookie, maxAge: ttl });
  jar.set(JWT_EXPIRY_COOKIE, String(result.expiresAt), { ...baseCookie, maxAge: ttl });
  return { ok: true, jwt: result.jwt };
}

export function jwtErrorResponse(result: Extract<JwtResult, { ok: false }>) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}
