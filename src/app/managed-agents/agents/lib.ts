import "server-only";
import type { components } from "@/lib/api-types";

export type AgentDefaults = components["schemas"]["AgentDefaults"];
export type AgentDefaultsPayload = components["schemas"]["AgentDefaultsPayload"];

/**
 * The backend does not normalize Anthropic's agent shape — everything is
 * passthrough. We declare only the fields the UI relies on; everything else
 * is tolerated (and dumped raw in the detail view).
 */
export type Agent = {
  id: string;
  name?: string | null;
  description?: string | null;
  model?: string | { id?: string; speed?: string } | null;
  system?: string | null;
  system_prompt?: string | null;
  instructions?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  archived_at?: string | null;
  [key: string]: unknown;
};

export type AgentListResponse = { data: Agent[]; count?: number };

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

function backendConfig(): { baseUrl: string; token: string } | null {
  const { MAG_API_BASE_URL, MAG_AUTH_TOKEN } = process.env;
  if (!MAG_API_BASE_URL || !MAG_AUTH_TOKEN) return null;
  return { baseUrl: MAG_API_BASE_URL.replace(/\/$/, ""), token: MAG_AUTH_TOKEN };
}

async function callBackend<T>(
  path: string,
  init?: RequestInit
): Promise<FetchResult<T>> {
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
      ...init,
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
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
  if (!res.ok) return { ok: false, status: res.status, error: text };
  if (!text) return { ok: true, data: undefined as T };
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: res.status, error: `Invalid JSON: ${text}` };
  }
}

export function modelLabel(model: Agent["model"]): string {
  if (!model) return "—";
  if (typeof model === "string") return model;
  return model.id || "—";
}

export function safeText(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

export function fetchAgents() {
  return callBackend<AgentListResponse>("/agents");
}

export function fetchAgent(id: string) {
  return callBackend<Agent>(`/agents/${encodeURIComponent(id)}`);
}

export function fetchAgentDefaults(id: string) {
  return callBackend<AgentDefaults>(
    `/agents/${encodeURIComponent(id)}/defaults`
  );
}
