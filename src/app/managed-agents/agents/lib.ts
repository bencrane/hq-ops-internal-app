import "server-only";

export type Agent = {
  id: string;
  name?: string | null;
  description?: string | null;
  model?: string | { id?: string; speed?: string } | null;
  system_prompt?: string | null;
  instructions?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  archived_at?: string | null;
  [key: string]: unknown;
};

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

function backendConfig(): { baseUrl: string; token: string } | null {
  const { MAG_API_BASE_URL, MAG_AUTH_TOKEN } = process.env;
  if (!MAG_API_BASE_URL || !MAG_AUTH_TOKEN) return null;
  return { baseUrl: MAG_API_BASE_URL.replace(/\/$/, ""), token: MAG_AUTH_TOKEN };
}

async function callBackend(path: string): Promise<FetchResult<unknown>> {
  const cfg = backendConfig();
  if (!cfg) {
    return {
      ok: false,
      status: 500,
      error: "MAG_API_BASE_URL or MAG_AUTH_TOKEN not configured in Doppler",
    };
  }

  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: `Network error reaching backend: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, error: text };
  }
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: res.status, error: `Invalid JSON: ${text}` };
  }
}

export function modelLabel(model: Agent["model"]): string {
  if (!model) return "—";
  if (typeof model === "string") return model;
  return model.id || "—";
}

/**
 * Coerce any value into something React can safely render as text.
 * Strings/numbers/booleans render as-is; objects and arrays are
 * JSON-stringified. Never throws. Use at every rendering site that
 * reads a field from an untrusted upstream response.
 */
export function safeText(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

export async function fetchAgents(): Promise<FetchResult<{ data: Agent[] }>> {
  return callBackend("/agents") as Promise<FetchResult<{ data: Agent[] }>>;
}

export async function fetchAgent(id: string): Promise<FetchResult<Agent>> {
  return callBackend(`/agents/${encodeURIComponent(id)}`) as Promise<
    FetchResult<Agent>
  >;
}
