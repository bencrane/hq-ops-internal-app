import Link from "next/link";
import { SyncButton } from "./SyncButton";

export default function ManagedAgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-black">
      <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
        <Link
          href="/managed-agents"
          className="text-lg font-medium tracking-wide text-white transition-colors hover:text-zinc-300"
        >
          Managed Agents
        </Link>
        <SyncButton />
      </div>
      {children}
    </div>
  );
}
