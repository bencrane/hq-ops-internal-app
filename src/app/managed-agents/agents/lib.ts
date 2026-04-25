import "server-only";
import type { components } from "@/lib/api-types";
import { getJwt } from "@/lib/auth";

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

async function callBackend<T>(
  path: string,
  init?: RequestInit
): Promise<FetchResult<T>> {
  const baseUrl = process.env.MAGS_API_BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      status: 500,
      error: "MAGS_API_BASE_URL not configured in Doppler",
    };
  }
  const jwt = await getJwt();
  if (!jwt.ok) return { ok: false, status: jwt.status, error: jwt.error };

  let res: Response;
  try {
    res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${jwt.jwt}`,
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
