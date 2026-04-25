import { NextResponse } from "next/server";
import { getJwt, jwtErrorResponse } from "@/lib/auth";

export async function POST() {
  const base = process.env.MAGS_API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: "MAGS_API_BASE_URL not configured" },
      { status: 500 }
    );
  }
  const jwt = await getJwt();
  if (!jwt.ok) return jwtErrorResponse(jwt);

  const res = await fetch(`${base.replace(/\/$/, "")}/admin/sync/anthropic`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt.jwt}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
