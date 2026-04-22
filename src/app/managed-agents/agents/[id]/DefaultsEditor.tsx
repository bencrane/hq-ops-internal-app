"use client";

import { useState } from "react";
import type { AgentDefaults } from "../lib";

type Props = {
  agentId: string;
  initial: AgentDefaults | null;
  initialError?: { status: number; error: string } | null;
};

type Saving = "idle" | "saving" | "deleting";

export function DefaultsEditor({ agentId, initial, initialError }: Props) {
  const [defaults, setDefaults] = useState<AgentDefaults | null>(initial);
  const [environmentId, setEnvironmentId] = useState(initial?.environment_id ?? "");
  const [vaultIdsText, setVaultIdsText] = useState(
    (initial?.vault_ids ?? []).join("\n")
  );
  const [state, setState] = useState<Saving>("idle");
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    initialError && initialError.status !== 404
      ? { kind: "err", msg: `Failed to load (${initialError.status}): ${initialError.error}` }
      : null
  );

  function parseVaultIds(text: string): string[] {
    return text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function save() {
    setState("saving");
    setFlash(null);
    try {
      const res = await fetch(
        `/api/agents/${encodeURIComponent(agentId)}/defaults`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            environment_id: environmentId.trim(),
            vault_ids: parseVaultIds(vaultIdsText),
          }),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFlash({
          kind: "err",
          msg: body?.detail
            ? typeof body.detail === "string"
              ? body.detail
              : JSON.stringify(body.detail)
            : `HTTP ${res.status}`,
        });
      } else {
        setDefaults(body as AgentDefaults);
        setFlash({ kind: "ok", msg: "Saved" });
      }
    } catch (err) {
      setFlash({
        kind: "err",
        msg: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setState("idle");
    }
  }

  async function remove() {
    if (!confirm("Delete defaults for this agent?")) return;
    setState("deleting");
    setFlash(null);
    try {
      const res = await fetch(
        `/api/agents/${encodeURIComponent(agentId)}/defaults`,
        { method: "DELETE" }
      );
      if (!res.ok && res.status !== 404) {
        const body = await res.text();
        setFlash({ kind: "err", msg: `HTTP ${res.status}: ${body}` });
      } else {
        setDefaults(null);
        setEnvironmentId("");
        setVaultIdsText("");
        setFlash({ kind: "ok", msg: "Deleted" });
      }
    } catch (err) {
      setFlash({
        kind: "err",
        msg: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setState("idle");
    }
  }

  const canSave =
    state === "idle" && environmentId.trim().length > 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Environment ID
        </label>
        <input
          type="text"
          value={environmentId}
          onChange={(e) => setEnvironmentId(e.target.value)}
          placeholder="env_…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Vault IDs{" "}
          <span className="font-normal text-zinc-600">
            (one per line or comma-separated)
          </span>
        </label>
        <textarea
          value={vaultIdsText}
          onChange={(e) => setVaultIdsText(e.target.value)}
          rows={4}
          placeholder="vault_…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-white placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={!canSave}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "saving" ? "Saving…" : defaults ? "Save changes" : "Create defaults"}
        </button>
        {defaults && (
          <button
            onClick={remove}
            disabled={state !== "idle"}
            className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:border-red-700 hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "deleting" ? "Deleting…" : "Delete"}
          </button>
        )}
        {flash && (
          <span
            className={`text-xs ${
              flash.kind === "ok" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {flash.kind === "ok" ? "✓" : "✗"} {flash.msg}
          </span>
        )}
      </div>
    </div>
  );
}
