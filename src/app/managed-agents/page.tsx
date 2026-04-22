import Link from "next/link";

export default function ManagedAgentsPage() {
  return (
    <div className="min-h-screen bg-black p-8 sm:p-12 lg:p-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-wide text-white">
          Managed Agents
        </h1>
        
        <Link 
          href="/" 
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          ← Back to Operations
        </Link>
      </div>
      
      {/* Blank area for future content */}
    </div>
  );
}
