import { backendProxy } from "@/lib/backend-proxy";

export async function GET() {
  return backendProxy(process.env.MAGS_API_BASE_URL, "/agents");
}
