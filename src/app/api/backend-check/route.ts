import { NextResponse } from "next/server";

export async function GET() {
  try {
    const MAG_AUTH_TOKEN = process.env.MAG_AUTH_TOKEN;
    const BASE_URL = process.env.MAG_API_BASE_URL;

    if (!BASE_URL) {
      console.error("MAG_API_BASE_URL is missing from environment variables.");
      return NextResponse.json(
        { error: "MAG_API_BASE_URL is not configured" },
        { status: 500 }
      );
    }

    if (!MAG_AUTH_TOKEN) {
      console.error("MAG_AUTH_TOKEN is missing from environment variables.");
      return NextResponse.json(
        { error: "MAG_AUTH_TOKEN is not configured" },
        { status: 500 }
      );
    }

    console.log(`Starting backend check against ${BASE_URL}...`);

    // 1. Check Health Endpoint
    console.log("Fetching /health...");
    const healthResponse = await fetch(`${BASE_URL}/health`, {
      method: "GET",
    });

    if (!healthResponse.ok) {
      const errorBody = await healthResponse.text();
      console.error(`Health check failed: ${healthResponse.status} - ${errorBody}`);
      return NextResponse.json(
        {
          step: "health",
          status: healthResponse.status,
          error: errorBody,
          url: `${BASE_URL}/health`,
        },
        { status: healthResponse.status }
      );
    }

    const healthData = await healthResponse.json();
    console.log("Health check passed:", healthData);

    // 2. Check Authenticated Sync Endpoint
    console.log("Fetching /admin/sync/anthropic...");
    const syncResponse = await fetch(`${BASE_URL}/admin/sync/anthropic`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAG_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!syncResponse.ok) {
      const errorBody = await syncResponse.text();
      console.error(`Sync check failed: ${syncResponse.status} - ${errorBody}`);
      return NextResponse.json(
        {
          step: "sync",
          status: syncResponse.status,
          error: errorBody,
          url: `${BASE_URL}/admin/sync/anthropic`,
        },
        { status: syncResponse.status }
      );
    }

    const syncData = await syncResponse.json();
    console.log("Sync check passed:", syncData);

    // 3. Construct Success Response
    const result = {
      backendUrl: BASE_URL,
      health: healthData,
      sync: syncData,
    };

    console.log("Backend check completed successfully:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Backend check encountered an unexpected error:", error);
    return NextResponse.json(
      {
        error: "Unexpected error during backend check",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
