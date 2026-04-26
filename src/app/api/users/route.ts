import { NextRequest } from "next/server";
import { serxProxy } from "@/lib/serx";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");
  const search = orgId ? `?org_id=${encodeURIComponent(orgId)}` : "";
  return serxProxy("/api/users", search);
}
