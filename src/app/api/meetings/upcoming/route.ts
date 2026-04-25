import { NextRequest, NextResponse } from "next/server";
import { getJwt, jwtErrorResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const base = process.env.SERX_API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: "SERX_API_BASE_URL not configured" },
      { status: 500 }
    );
  }
  const jwt = await getJwt();
  if (!jwt.ok) return jwtErrorResponse(jwt);

  const search = req.nextUrl.search || "?limit=100&within_days=30";
  const res = await fetch(
    `${base.replace(/\/$/, "")}/api/meetings/upcoming${search}`,
    {
      headers: { Authorization: `Bearer ${jwt.jwt}` },
      cache: "no-store",
    }
  );
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
