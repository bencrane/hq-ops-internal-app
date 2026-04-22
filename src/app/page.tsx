import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8 sm:p-12 lg:p-16">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-10 text-2xl font-medium tracking-tight text-white">
          Internal Operations
        </h1>
        
        {/* Grid for uniform cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          <Link 
            href="/managed-agents"
            className="group flex aspect-video flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.98]"
          >
            <span className="text-lg font-medium tracking-wide text-white">
              Managed Agents
            </span>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
