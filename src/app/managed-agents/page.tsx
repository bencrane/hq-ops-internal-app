import Link from "next/link";

const cards = [
  {
    href: "/managed-agents/agents",
    title: "View All",
    description: "Browse every managed agent and inspect its system prompt & settings.",
  },
  {
    href: "/managed-agents/debug",
    title: "Debug",
    description: "Test backend connectivity and auth against managed-agents-x-api.",
  },
];

export default function ManagedAgentsPage() {
  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex aspect-video flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.98]"
          >
            <span className="text-lg font-medium tracking-wide text-white">
              {card.title}
            </span>
            <span className="text-sm leading-relaxed text-zinc-400">
              {card.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
