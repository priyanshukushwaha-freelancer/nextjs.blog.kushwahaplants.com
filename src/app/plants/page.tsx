import Link from 'next/link';
import prisma from '@/lib/prisma';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Leaf } from 'lucide-react';

export const revalidate = 3600;

export default async function PlantsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeLetter = resolvedSearchParams.letter?.toUpperCase() || '';

  // Get all plants
  let plants: any[] = [];
  try {
    plants = await prisma.plant.findMany({
      orderBy: { englishName: 'asc' },
      select: {
        id: true,
        slug: true,
        scientificName: true,
        englishName: true,
        hindiName: true,
        sanskritName: true,
        family: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error('Error fetching plants directory:', error);
  }

  // Filter plants by initial letter if selected
  const filteredPlants = activeLetter
    ? plants.filter((p) => p.englishName.toUpperCase().startsWith(activeLetter))
    : plants;

  // Alphabet letter list
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs />
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
          Medicinal Plants Directory
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Browse our extensive botanical knowledge base of {plants.length} indexed medicinal herbs.
        </p>
      </div>

      {/* Alphabet Filter Bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--border)] pb-4 overflow-x-auto no-scrollbar">
        <Link
          href="/plants"
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            !activeLetter
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]'
          }`}
        >
          All
        </Link>
        {alphabet.map((letter) => {
          const hasPlants = plants.some((p) => p.englishName.toUpperCase().startsWith(letter));
          return (
            <Link
              key={letter}
              href={hasPlants ? `/plants?letter=${letter}` : '#'}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeLetter === letter
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : hasPlants
                  ? 'bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--ring)] border border-[var(--border)]'
                  : 'text-gray-300 pointer-events-none'
              }`}
            >
              {letter}
            </Link>
          );
        })}
      </div>

      {/* Plant Grid */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <Link
              key={plant.id}
              href={`/plants/${plant.slug}`}
              className="group p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-2">
                <div>
                  <h3 className="font-sans font-semibold text-base text-[var(--foreground)] group-hover:text-[var(--ring)] transition-colors">
                    {plant.englishName}
                  </h3>
                  <p className="text-xs italic text-[var(--muted-foreground)] font-serif">
                    {plant.scientificName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                  <span>Hindi: {plant.hindiName || '—'}</span>
                  <span>•</span>
                  <span>Sanskrit: {plant.sanskritName || '—'}</span>
                </div>
                <span className="inline-block text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
                  {plant.family.name}
                </span>
              </div>
              <Leaf className="h-5 w-5 text-[var(--ring)] shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] italic">
            No plants found starting with letter "{activeLetter}".
          </p>
        </div>
      )}
    </div>
  );
}
