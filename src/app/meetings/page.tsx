import Link from "next/link";
import { headers } from "next/headers";
import { getSelection } from "@/lib/selection";

type AccountSummary = { id?: string; name?: string } | null;
type ContactSummary = {
  id?: string;
  name?: string;
  email?: string;
} | null;
type DealSummary = { id?: string; name?: string } | null;

type Meeting = {
  id: string;
  title?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  organizer_email?: string | null;
  attendee_emails?: string[] | null;
  account?: AccountSummary;
  contact?: ContactSummary;
  deal?: DealSummary;
};

type UpcomingResponse = {
  window?: unknown;
  count?: number;
  data?: Meeting[];
};

async function fetchUpcoming(
  orgId: string,
  userId: string
): Promise<{
  meetings: Meeting[];
  error: string | null;
}> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "";

  const qs = new URLSearchParams({
    org_id: orgId,
    user_id: userId,
    limit: "100",
    within_days: "30",
  });

  try {
    const res = await fetch(`${base}/api/meetings/upcoming?${qs}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        meetings: [],
        error: `API returned ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    const json = (await res.json()) as UpcomingResponse;
    return { meetings: Array.isArray(json.data) ? json.data : [], error: null };
  } catch (err) {
    return {
      meetings: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function MeetingsPage() {
  const { orgId, userId } = await getSelection();
  const { meetings, error } = await fetchUpcoming(orgId, userId);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 sm:p-12 lg:p-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white">
            Internal Operations
          </Link>
          <span>/</span>
          <span className="text-white">Meetings</span>
        </div>

        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-2xl font-medium tracking-tight text-white">
            Meetings
          </h1>
          <span className="text-sm text-zinc-500">
            Upcoming · next 30 days
          </span>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-200">
            <div className="font-medium">Failed to load meetings</div>
            <div className="mt-1 text-red-300/80">{error}</div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Starts</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-200">
              {meetings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    {error ? "—" : "No upcoming meetings."}
                  </td>
                </tr>
              ) : (
                meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900">
                    <td className="px-4 py-3">{m.title ?? "Untitled"}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {formatDateTime(m.start_time)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {m.account?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {m.contact?.name ?? m.contact?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {m.status ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
