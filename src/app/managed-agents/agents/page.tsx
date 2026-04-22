import Link from "next/link";
import { fetchAgents, modelLabel } from "./lib";

export const dynamic = "force-dynamic";

export default async function AgentsListPage() {
  const result = await fetchAgents();

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-zinc-500">
        All Agents
      </h2>

      {!result.ok && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
          <div className="font-medium">
            Failed to load agents ({result.status || "network error"})
          </div>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-red-400/80">
            {result.error}
          </pre>
        </div>
      )}

      {result.ok && result.data.data.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
          No managed agents found.
        </div>
      )}

      {result.ok && result.data.data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {result.data.data.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-t border-zinc-800 transition-colors hover:bg-zinc-900/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/managed-agents/agents/${encodeURIComponent(agent.id)}`}
                      className="font-medium text-white hover:text-zinc-300"
                    >
                      {agent.name || "(unnamed)"}
                    </Link>
                    {agent.archived_at && (
                      <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                        archived
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {modelLabel(agent.model)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {agent.id}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {agent.updated_at
                      ? new Date(agent.updated_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
