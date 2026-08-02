'use client';

import { useEffect, useState } from 'react';

interface HeaderItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  selectors?: string; // e.g. 'article h2, article h3'
}

export default function TableOfContents({ selectors = 'article h2, article h3' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeaderItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Find all headings inside the selectors range
    const headingElements = Array.from(document.querySelectorAll(selectors));
    
    // Add unique IDs to headings if they don't have them
    const items: HeaderItem[] = headingElements.map((el, index) => {
      const text = el.textContent || '';
      const id = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `heading-${index}`;
      el.id = id; // Ensure element has the ID in DOM
      
      return {
        id,
        text,
        level: parseInt(el.tagName.replace('H', ''), 10),
      };
    });

    setHeadings(items);

    // IntersectionObserver to watch which heading is active
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Set active as the first visible element from top
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [selectors]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-3 sticky top-24 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4" aria-label="Table of contents">
      <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
        On This Page
      </h3>
      <ul className="space-y-2 border-l border-[var(--border)] pl-0 text-xs">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
            className="list-none"
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block -ml-px border-l pl-3 py-1 transition-colors ${
                activeId === heading.id
                  ? 'border-[var(--ring)] text-[var(--ring)] font-medium'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
