'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Format slug names to human-readable names (e.g. 'holy-basil' -> 'Holy Basil')
  const formatSegment = (segment: string) => {
    return decodeURIComponent(segment)
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = formatSegment(segment);
    const isLast = index === pathSegments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-sans py-4" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
        Home
      </Link>
      {breadcrumbs.map((crumb, idx) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 shrink-0" />
          {crumb.isLast ? (
            <span className="text-[var(--foreground)] font-medium" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="hover:text-[var(--foreground)] transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
