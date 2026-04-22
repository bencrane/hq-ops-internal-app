"use client";

import { useEffect } from "react";

export default function ManagedAgentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("managed-agents render error:", error);
  }, [error]);

  return (
    <div className="p-8 sm:p-12 lg:p-16">
      <div className="max-w-2xl rounded-lg border border-red-900/50 bg-red-950/20 p-6 text-sm text-red-300">
        <div className="mb-2 text-base font-medium text-red-200">
          Something went wrong rendering this page
        </div>
        <p className="mb-4 text-red-300/80">
          The backend likely returned data in an unexpected shape. The page
          itself is fine — try again, or go back.
        </p>
        <pre className="mb-4 overflow-auto whitespace-pre-wrap rounded border border-red-900/40 bg-black/40 p-3 text-xs text-red-400/80">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <button
          onClick={reset}
          className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200 transition-colors hover:border-red-700 hover:bg-red-900/40"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
