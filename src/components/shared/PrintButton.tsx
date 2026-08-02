'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--border)] bg-[var(--card)] hover:text-[var(--foreground)] hover:border-[var(--ring)] transition-all text-xs"
      title="Open print dialog"
    >
      <Printer className="h-3.5 w-3.5" />
      <span>Print Article</span>
    </button>
  );
}
