import { NextResponse } from "next/server";

export async function GET() {
  const { MAG_API_BASE_URL, MAG_AUTH_TOKEN } = process.env;
  if (!MAG_API_BASE_URL || !MAG_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "MAG_API_BASE_URL or MAG_AUTH_TOKEN not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${MAG_API_BASE_URL}/agents`, {
    headers: { Authorization: `Bearer ${MAG_AUTH_TOKEN}` },
    cache: "no-store",
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
