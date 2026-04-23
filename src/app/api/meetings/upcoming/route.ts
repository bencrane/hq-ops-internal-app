import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { SERX_API_URL, SERX_AUTH_TOKEN } = process.env;
  if (!SERX_API_URL || !SERX_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "SERX_API_URL or SERX_AUTH_TOKEN not configured" },
      { status: 500 }
    );
  }

  const search = req.nextUrl.search || "?limit=100&within_days=30";
  const res = await fetch(`${SERX_API_URL}/api/meetings/upcoming${search}`, {
    headers: { Authorization: `Bearer ${SERX_AUTH_TOKEN}` },
    cache: "no-store",
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
