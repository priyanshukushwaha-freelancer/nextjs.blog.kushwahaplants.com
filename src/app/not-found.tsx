import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6 font-sans">
      <div className="text-center space-y-4 max-w-md">
        <Leaf className="h-10 w-10 text-[var(--muted)] mx-auto" />
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Page Not Found</h1>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          The botanical resource you are looking for does not exist or has been relocated.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all"
          >
            Return Home
          </Link>
          <Link
            href="/search"
            className="px-5 py-2 rounded-full text-xs font-semibold border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--ring)] transition-all"
          >
            Search Plants
          </Link>
        </div>
      </div>
    </div>
  );
}
