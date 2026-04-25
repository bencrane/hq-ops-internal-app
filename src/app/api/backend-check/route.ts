import { NextResponse } from "next/server";
import { getJwt, jwtErrorResponse } from "@/lib/auth";

export async function GET() {
  try {
    const BASE_URL = process.env.MAGS_API_BASE_URL;
    if (!BASE_URL) {
      return NextResponse.json(
        { error: "MAGS_API_BASE_URL is not configured" },
        { status: 500 }
      );
    }
    const jwt = await getJwt();
    if (!jwt.ok) return jwtErrorResponse(jwt);

    const base = BASE_URL.replace(/\/$/, "");

    const healthResponse = await fetch(`${base}/health`, { method: "GET" });
    if (!healthResponse.ok) {
      const errorBody = await healthResponse.text();
      return NextResponse.json(
        {
          step: "health",
          status: healthResponse.status,
          error: errorBody,
          url: `${base}/health`,
        },
        { status: healthResponse.status }
      );
    }
    const healthData = await healthResponse.json();

    const syncResponse = await fetch(`${base}/admin/sync/anthropic`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt.jwt}`,
        "Content-Type": "application/json",
      },
    });
    if (!syncResponse.ok) {
      const errorBody = await syncResponse.text();
      return NextResponse.json(
        {
          step: "sync",
          status: syncResponse.status,
          error: errorBody,
          url: `${base}/admin/sync/anthropic`,
        },
        { status: syncResponse.status }
      );
    }
    const syncData = await syncResponse.json();

    return NextResponse.json({
      backendUrl: base,
      health: healthData,
      sync: syncData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error during backend check",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
