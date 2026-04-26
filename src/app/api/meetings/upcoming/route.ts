import { NextRequest, NextResponse } from "next/server";
import { serxProxy } from "@/lib/serx";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const orgId = params.get("org_id");
  const userId = params.get("user_id");

  if (!orgId || !userId) {
    return NextResponse.json(
      {
        detail:
          "org_id and user_id query params are required (selected via the Org/User picker).",
      },
      { status: 422 }
    );
  }

  if (!params.has("limit")) params.set("limit", "100");
  if (!params.has("within_days") && !params.has("within_hours")) {
    params.set("within_days", "30");
  }

  return serxProxy("/api/meetings/upcoming", `?${params.toString()}`);
}
