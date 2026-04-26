import { serxProxy } from "@/lib/serx";

export async function GET() {
  return serxProxy("/api/orgs", "");
}
