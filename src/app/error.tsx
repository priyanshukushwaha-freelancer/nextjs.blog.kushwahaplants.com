'use client';

import { ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6 font-sans">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Something went wrong</h1>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
