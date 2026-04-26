import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, clearAuthCookies } from "@/lib/auth";

/**
 * POST: Store the session token (obtained client-side from better-auth)
 * as an httpOnly cookie on our domain so server-side code can use it
 * for JWT exchange.
 */
export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  await setSessionCookie(token);
  return NextResponse.json({ ok: true });
}

/**
 * DELETE: Clear all auth cookies (sign-out from our domain).
 */
export async function DELETE() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
