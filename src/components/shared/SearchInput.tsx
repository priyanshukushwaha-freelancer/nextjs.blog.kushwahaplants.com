'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Sparkles, Leaf, BookOpen, GitCommit, ShieldAlert, X } from 'lucide-react';

interface Suggestion {
  title: string;
  type: 'plant' | 'family' | 'disease' | 'article';
  slug: string;
}

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to load autocomplete suggestions', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const selectSuggestion = (s: Suggestion) => {
    setIsOpen(false);
    setQuery(s.title);
    if (s.type === 'plant') {
      router.push(`/plants/${s.slug}`);
    } else if (s.type === 'family') {
      router.push(`/families/${s.slug}`);
    } else if (s.type === 'disease') {
      router.push(`/diseases/${s.slug}`);
    } else {
      router.push(`/blog/${s.slug}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'plant': return <Leaf className="h-3.5 w-3.5 text-emerald-500" />;
      case 'family': return <GitCommit className="h-3.5 w-3.5 text-blue-500" />;
      case 'disease': return <ShieldAlert className="h-3.5 w-3.5 text-red-500" />;
      default: return <BookOpen className="h-3.5 w-3.5 text-purple-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          placeholder="Search by botanical, Hindi, Sanskrit, or disease names..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-4 pl-12 pr-12 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-[var(--ring)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] shadow-sm hover:shadow-md transition-all font-sans"
        />
        <Search className="absolute left-4 top-4 h-5 w-5 text-[var(--muted-foreground)]" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-4 top-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown Drawer */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden py-2 max-h-80 overflow-y-auto">
          <div className="px-4 py-1.5 border-b border-[var(--border)] flex items-center gap-1.5 text-[10px] uppercase font-semibold text-[var(--muted-foreground)] tracking-wider">
            <Sparkles className="h-3 w-3 text-[var(--ring)]" />
            <span>Search Suggestions</span>
          </div>
          <ul className="divide-y divide-[var(--border)]/35">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--border)]/35 text-xs text-[var(--foreground)] transition-colors"
                >
                  {getIcon(s.type)}
                  <span className="font-sans font-medium flex-1 line-clamp-1">{s.title}</span>
                  <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] shrink-0">
                    {s.type}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
