import { NextResponse } from "next/server";

export async function POST() {
  const { MAG_API_BASE_URL, MAG_AUTH_TOKEN } = process.env;
  if (!MAG_API_BASE_URL || !MAG_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "MAG_API_BASE_URL or MAG_AUTH_TOKEN not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${MAG_API_BASE_URL}/admin/sync/anthropic`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MAG_AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
