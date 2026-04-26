import { backendProxy } from "@/lib/backend-proxy";

export async function POST() {
  return backendProxy(process.env.MAGS_API_BASE_URL, "/admin/sync/anthropic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
