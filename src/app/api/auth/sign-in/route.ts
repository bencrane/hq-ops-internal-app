import { NextResponse } from "next/server";

/**
 * Sign-in now happens client-side via better-auth SDK.
 * This route is no longer used — kept as a stub to avoid 404s
 * if anything still references it during migration.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Sign-in must happen client-side via the better-auth SDK" },
    { status: 410 }
  );
}
