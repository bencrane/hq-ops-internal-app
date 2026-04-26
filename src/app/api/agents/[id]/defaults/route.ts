import { backendProxy } from "@/lib/backend-proxy";

function path(id: string) {
  return `/agents/${encodeURIComponent(id)}/defaults`;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return backendProxy(process.env.MAGS_API_BASE_URL, path(id));
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.text();
  return backendProxy(process.env.MAGS_API_BASE_URL, path(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return backendProxy(process.env.MAGS_API_BASE_URL, path(id), {
    method: "DELETE",
  });
}
