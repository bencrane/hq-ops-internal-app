import { NextResponse } from "next/server";
import { getJwt, jwtErrorResponse } from "@/lib/auth";

async function forward(
  method: "GET" | "PUT" | "DELETE",
  id: string,
  body?: string
) {
  const base = process.env.MAGS_API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: "MAGS_API_BASE_URL not configured" },
      { status: 500 }
    );
  }
  const jwt = await getJwt();
  if (!jwt.ok) return jwtErrorResponse(jwt);

  const res = await fetch(
    `${base.replace(/\/$/, "")}/agents/${encodeURIComponent(id)}/defaults`,
    {
      method,
      headers: {
        Authorization: `Bearer ${jwt.jwt}`,
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
