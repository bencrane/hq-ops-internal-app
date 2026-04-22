"use client";

import { useState } from "react";

type CheckResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  async function runCheck() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/backend-check", { cache: "no-store" });
      const data = await res.json().catch(() => ({ error: "Invalid JSON response" }));
      setResult({ ok: res.ok, status: res.status, data });
    } catch (err) {
      setResult({
        ok: false,
        status: 0,
        data: { error: err instanceof Error ? err.message : String(err) },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-zinc-500">
        Debug
      </h2>

      <div className="max-w-2xl">
        <button
          onClick={runCheck}
          disabled={loading}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Testing…" : "Test backend connection"}
        </button>

        {result && (
          <div className="mt-6">
            <div
              className={`mb-2 text-sm font-medium ${
                result.ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {result.ok ? "✓ Success" : "✗ Failed"} ({result.status})
            </div>
            <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
