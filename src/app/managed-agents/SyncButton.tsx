"use client";

import { useState } from "react";

export function SyncButton() {
  const [state, setState] = useState<"idle" | "running" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string>("");

  async function runSync() {
    setState("running");
    setMessage("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("ok");
        const count =
          typeof data?.agents_synced === "number"
            ? ` (${data.agents_synced} agents)`
            : "";
        setMessage(`Synced${count}`);
      } else {
        setState("err");
        setMessage(data?.detail || data?.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setState("err");
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setTimeout(() => setState("idle"), 4000);
    }
  }

  const label =
    state === "running"
      ? "Syncing…"
      : state === "ok"
      ? `✓ ${message}`
      : state === "err"
      ? `✗ ${message}`
      : "Sync";

  const color =
    state === "ok"
      ? "border-emerald-700 text-emerald-300"
      : state === "err"
      ? "border-red-700 text-red-300"
      : "border-zinc-700 text-white hover:border-zinc-500";

  return (
    <button
      onClick={runSync}
      disabled={state === "running"}
      className={`rounded-lg border bg-zinc-900 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${color}`}
      title={message || "Trigger backend sync from Anthropic"}
    >
      {label}
    </button>
  );
}
