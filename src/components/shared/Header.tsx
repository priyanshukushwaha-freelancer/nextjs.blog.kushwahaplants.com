'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Leaf, Search, Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { name: 'Plants Base', href: '/plants' },
    { name: 'Families', href: '/families' },
    { name: 'Diseases', href: '/diseases' },
    { name: 'Editorial Blog', href: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Leaf className="h-6 w-6 text-[var(--ring)] transition-transform group-hover:rotate-12" />
            <span className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Kushwaha <span className="font-normal text-[var(--muted)]">Plants</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                    isActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--muted)]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Trigger / Form */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-64">
            <input
              type="text"
              placeholder="Search botanical base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-1.5 pl-9 pr-4 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          </form>

          {/* Mobile menu and search controls */}
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/search" aria-label="Search page">
              <Search className="h-5 w-5 text-[var(--muted)]" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
