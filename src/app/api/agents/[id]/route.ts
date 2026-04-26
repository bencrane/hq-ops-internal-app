import { backendProxy } from "@/lib/backend-proxy";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return backendProxy(
    process.env.MAGS_API_BASE_URL,
    `/agents/${encodeURIComponent(id)}`
  );
}
