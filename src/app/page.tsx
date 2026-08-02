import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Leaf, Search, ArrowRight, BookOpen, GitCommit, ShieldAlert, Sparkles } from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour (ISR)

export default async function HomePage() {
  // Fetch high-level stats & featured items
  let plants: any[] = [];
  let posts: any[] = [];
  let familiesCount = 0;
  let diseasesCount = 0;

  try {
    [plants, posts, familiesCount, diseasesCount] = await Promise.all([
      prisma.plant.findMany({
        take: 3,
        select: {
          id: true,
          slug: true,
          scientificName: true,
          englishName: true,
          family: { select: { name: true } },
        },
      }),
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          createdAt: true,
        },
      }),
      prisma.family.count(),
      prisma.disease.count(),
    ]);
  } catch (error) {
    console.error('Database connection not established yet, serving fallback placeholder:', error);
  }

  return (
    <div className="flex flex-col gap-16 py-12 md:py-20">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-[var(--ring)]/10 text-[var(--ring)] border border-[var(--ring)]/25">
          <Sparkles className="h-3.5 w-3.5" />
          <span>India\'s Premier Botanical Knowledge Base</span>
        </div>
        <h1 className="font-sans text-4xl md:text-6xl font-semibold tracking-tight text-[var(--foreground)] leading-[1.1]">
          The Scientific Database of <br className="hidden sm:inline" />
          <span className="text-[var(--ring)] font-serif italic">Medicinal Plants & Ayurveda</span>
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed">
          An enterprise publishing archive linking taxonomy, binomial nomenclature, biochemical research, and traditional Vedic energetics.
        </p>

        {/* Embedded Large Search Trigger */}
        <div className="max-w-lg mx-auto pt-4">
          <Link
            href="/search"
            className="flex items-center gap-3 w-full rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm text-[var(--muted-foreground)] hover:border-[var(--ring)] shadow-sm hover:shadow-md transition-all group"
          >
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <span>Search by Scientific Name, Hindi, Sanskrit, or Disease...</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded border border-[var(--border)] group-hover:border-[var(--ring)] text-[var(--muted-foreground)]">
              /
            </span>
          </Link>
        </div>
      </section>

      {/* Grid Stats / Entry Points */}
      <section className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/families"
            className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all space-y-3"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
              <GitCommit className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-semibold text-sm">Taxonomic Families</h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Explore plant classification systems. Currently indexing {familiesCount || 3} core families.
            </p>
            <div className="flex items-center gap-1 text-xs text-[var(--ring)] font-medium pt-2">
              <span>View families</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/diseases"
            className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all space-y-3"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-semibold text-sm">Diseases & Indications</h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Query plants by clinical and traditional indications. Currently indexing {diseasesCount || 4} indications.
            </p>
            <div className="flex items-center gap-1 text-xs text-[var(--ring)] font-medium pt-2">
              <span>View indications</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/plants"
            className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all space-y-3"
          >
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[var(--ring)]/10 text-[var(--ring)]">
              <Leaf className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-semibold text-sm">Medicinal Plants Directory</h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Browse the complete botanical base alphabetically. Complete with Ayurvedic properties.
            </p>
            <div className="flex items-center gap-1 text-xs text-[var(--ring)] font-medium pt-2">
              <span>Browse directory</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Plants & Recent Articles */}
      <section className="mx-auto w-full max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Featured Plants */}
        <div className="space-y-6">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-3">
            Featured Botanical Entities
          </h2>
          <div className="space-y-4">
            {plants.length > 0 ? (
              plants.map((plant) => (
                <Link
                  key={plant.id}
                  href={`/plants/${plant.slug}`}
                  className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-[var(--foreground)]">
                        {plant.englishName}
                      </h3>
                      <p className="text-xs italic text-[var(--muted-foreground)]">
                        {plant.scientificName} — {plant.family.name}
                      </p>
                    </div>
                    <Leaf className="h-4 w-4 text-[var(--ring)] shrink-0" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] italic">
                No plant entities seeded yet. Set up database variables and seed.
              </p>
            )}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="space-y-6">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-3">
            Recent Editorial Blog Posts
          </h2>
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all hover:shadow-sm space-y-2"
                >
                  <h3 className="font-sans font-semibold text-sm text-[var(--foreground)]">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)] font-medium">
                    <BookOpen className="h-3 w-3" />
                    <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] italic">
                No blog posts published yet. Set up database variables and seed.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
