import { NextResponse } from "next/server";

async function forward(
  method: "GET" | "PUT" | "DELETE",
  id: string,
  body?: string
) {
  const { MAG_API_BASE_URL, MAG_AUTH_TOKEN } = process.env;
  if (!MAG_API_BASE_URL || !MAG_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "MAG_API_BASE_URL or MAG_AUTH_TOKEN not configured" },
      { status: 500 }
    );
  }

  const base = MAG_API_BASE_URL.replace(/\/$/, "");
  const res = await fetch(
    `${base}/agents/${encodeURIComponent(id)}/defaults`,
    {
      method,
      headers: {
        Authorization: `Bearer ${MAG_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    }
  );
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return forward("GET", id);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.text();
  return forward("PUT", id, body);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return forward("DELETE", id);
}
