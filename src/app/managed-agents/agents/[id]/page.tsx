import Link from "next/link";
import { headers } from "next/headers";

type Agent = {
  id: string;
  name?: string | null;
  description?: string | null;
  model?: string | null;
  system_prompt?: string | null;
  instructions?: string | null;
  tools?: unknown;
  skills?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
  archived_at?: string | null;
  [key: string]: unknown;
};

async function fetchAgent(
  id: string
): Promise<{ ok: true; agent: Agent } | { ok: false; status: number; error: string }> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(
    `${proto}://${host}/api/agents/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, status: res.status, error: text };
  }
  return { ok: true, agent: await res.json() };
}

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchAgent(id);

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <Link
        href="/managed-agents/agents"
        className="mb-6 inline-block text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        ← All agents
      </Link>

      {!result.ok && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
          <div className="font-medium">Failed to load agent ({result.status})</div>
          <pre className="mt-2 overflow-auto text-xs text-red-400/80">
            {result.error}
          </pre>
        </div>
      )}

      {result.ok && <AgentView agent={result.agent} />}
    </div>
  );
}

function AgentView({ agent }: { agent: Agent }) {
  const prompt = agent.system_prompt ?? agent.instructions ?? null;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-white">
          {agent.name || "(unnamed agent)"}
        </h1>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span className="font-mono">{agent.id}</span>
          {agent.model && <span className="font-mono">{agent.model}</span>}
          {agent.updated_at && (
            <span>Updated {new Date(agent.updated_at).toLocaleString()}</span>
          )}
          {agent.archived_at && (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 uppercase tracking-wider text-zinc-400">
              archived
            </span>
          )}
        </div>
        {agent.description && (
          <p className="mt-4 max-w-3xl text-sm text-zinc-400">{agent.description}</p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          System prompt
        </h2>
        {prompt ? (
          <pre className="overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
            {prompt}
          </pre>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-500">
            No system prompt set.
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Raw
        </h2>
        <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-400">
          {JSON.stringify(agent, null, 2)}
        </pre>
      </section>
    </div>
  );
}
