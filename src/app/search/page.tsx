import prisma from '@/lib/prisma';
import { searchPlatform } from '@/services/search';
import SearchInput from '@/components/shared/SearchInput';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Link from 'next/link';
import { Leaf, BookOpen, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    family?: string;
    part?: string;
    disease?: string;
    action?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const filters = {
    family: resolvedSearchParams.family,
    part: resolvedSearchParams.part,
    disease: resolvedSearchParams.disease,
    action: resolvedSearchParams.action,
  };

  // Perform search queries
  const { plants, posts } = query.trim()
    ? await searchPlatform(query, filters)
    : { plants: [], posts: [] };

  // Fetch taxonomic filter options for sidebar/filter lists
  let families: any[] = [];
  let diseases: any[] = [];
  let actions: any[] = [];

  try {
    [families, diseases, actions] = await Promise.all([
      prisma.family.findMany({ select: { name: true, slug: true }, take: 10 }),
      prisma.disease.findMany({ select: { name: true, slug: true }, take: 10 }),
      prisma.medicinalAction.findMany({ select: { name: true, slug: true }, take: 10 }),
    ]);
  } catch (error) {
    console.error('Error fetching filter categories:', error);
  }

  // Create helper to construct query strings for filters
  const getFilterUrl = (type: string, value: string | undefined) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    
    // Set other filters
    if (type !== 'family' && filters.family) params.set('family', filters.family);
    if (type !== 'part' && filters.part) params.set('part', filters.part);
    if (type !== 'disease' && filters.disease) params.set('disease', filters.disease);
    if (type !== 'action' && filters.action) params.set('action', filters.action);

    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    return `/search?${params.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs />
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
          Enterprise Search
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Perform high-speed taxonomy lookups and scientific literature searches.
        </p>
      </div>

      {/* Embedded Search input component */}
      <SearchInput />

      {/* Main Layout: Filters Sidebar & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 border border-[var(--border)] rounded-2xl p-5 bg-[var(--card)] space-y-6 h-fit">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Filter className="h-4 w-4 text-[var(--ring)]" />
            <h3 className="font-sans text-sm font-semibold tracking-tight">Search Filters</h3>
          </div>

          {/* Families Filter list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Family</h4>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link
                href={getFilterUrl('family', undefined)}
                className={`hover:text-[var(--ring)] py-0.5 transition-colors ${!filters.family ? 'text-[var(--ring)] font-semibold' : 'text-[var(--muted)]'}`}
              >
                All Families
              </Link>
              {families.map((f) => (
                <Link
                  key={f.slug}
                  href={getFilterUrl('family', f.slug)}
                  className={`hover:text-[var(--ring)] py-0.5 transition-colors ${filters.family === f.slug ? 'text-[var(--ring)] font-semibold' : 'text-[var(--muted)]'}`}
                >
                  {f.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Indications Filter list */}
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Indication / Disease</h4>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link
                href={getFilterUrl('disease', undefined)}
                className={`hover:text-[var(--ring)] py-0.5 transition-colors ${!filters.disease ? 'text-[var(--ring)] font-semibold' : 'text-[var(--muted)]'}`}
              >
                All Indications
              </Link>
              {diseases.map((d) => (
                <Link
                  key={d.slug}
                  href={getFilterUrl('disease', d.slug)}
                  className={`hover:text-[var(--ring)] py-0.5 transition-colors ${filters.disease === d.slug ? 'text-[var(--ring)] font-semibold' : 'text-[var(--muted)]'}`}
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions Filter list */}
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Medicinal Action</h4>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link
                href={getFilterUrl('action', undefined)}
                className={`hover:text-[var(--ring)] py-0.5 transition-colors ${!filters.action ? 'text-[var(--ring)] font-semibold' : 'text-[var(--muted)]'}`}
              >
                All Actions
              </Link>
              {actions.map((a) => (
                <Link
                  key={a.slug}
                  href={getFilterUrl('action', a.slug)}
                  className={`hover:text-[var(--ring)] py-0.5 transition-colors ${filters.action === a.slug ? 'text-[var(--ring)] font-semibold' : 'text-[var(--muted)]'}`}
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Search Results Grid */}
        <div className="lg:col-span-3 space-y-8">
          {query.trim() ? (
            <>
              {/* Botanical Plants Section */}
              <div className="space-y-4">
                <h2 className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-[var(--ring)]" />
                  Botanical Entities ({plants.length})
                </h2>
                {plants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plants.map((plant) => (
                      <Link
                        key={plant.id}
                        href={`/plants/${plant.slug}`}
                        className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h3 className="font-sans font-semibold text-sm text-[var(--foreground)]">
                            {plant.englishName}
                          </h3>
                          <p className="text-xs italic text-[var(--muted-foreground)]">
                            {plant.scientificName}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/35 mt-4 text-[10px] text-[var(--muted-foreground)]">
                          <span>Sanskrit: {plant.sanskritName || '—'}</span>
                          <span className="font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">
                            {plant.family.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    No botanical plants found matching "{query}" under current filters.
                  </p>
                )}
              </div>

              {/* Editorial Articles Section */}
              <div className="space-y-4 pt-4">
                <h2 className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Editorial Articles ({posts.length})
                </h2>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all space-y-1.5"
                      >
                        <h3 className="font-sans font-semibold text-sm text-[var(--foreground)]">
                          {post.title}
                        </h3>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <span className="inline-block text-[9px] text-[var(--muted-foreground)]">
                          {new Date(post.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] italic">
                    No publications found matching "{query}".
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl">
              <Leaf className="h-8 w-8 text-[var(--muted)] mx-auto mb-3" />
              <h3 className="font-sans font-semibold text-sm">Awaiting Search Query</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mt-1 leading-relaxed">
                Type botanical, Hindi, Sanskrit, or scientific terms in the search bar above to begin traversing the plants base.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
