import { NextRequest, NextResponse } from "next/server";
import { auxBaseUrl, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const base = auxBaseUrl();
  if (!base) {
    return NextResponse.json(
      { error: "AUX_API_BASE_URL not configured" },
      { status: 500 }
    );
  }

  let payload: { email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { email, password } = payload;
  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  const res = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || "Sign-in failed", {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "text/plain",
      },
    });
  }

  const data = (await res.json()) as { token?: string; session_token?: string; sessionToken?: string };
  const sessionToken = data.token ?? data.session_token ?? data.sessionToken;
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Sign-in returned no session token" },
      { status: 502 }
    );
  }

  await setSessionCookie(sessionToken);
  return NextResponse.json({ ok: true });
}
