import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import Link from 'next/link';
import { Leaf, ShieldAlert } from 'lucide-react';

export const revalidate = 86400;

export async function generateStaticParams() {
  const families = await prisma.family.findMany({ select: { slug: true } });
  return families.map((f) => ({ slug: f.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let family = null;
  try {
    family = await prisma.family.findUnique({
      where: { slug: resolvedParams.slug },
    });
  } catch (e) {
    // fallback
  }

  if (!family) return {};

  return {
    title: `${family.name} Botanical Family - Kushwaha Plants`,
    description: `Directory of medicinal plants belonging to the ${family.name} family. ${family.description}`,
  };
}

export default async function FamilyPage({ params }: PageProps) {
  const resolvedParams = await params;
  let family = null;
  let connectionError = false;

  try {
    family = await prisma.family.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        plants: {
          select: {
            id: true,
            slug: true,
            englishName: true,
            scientificName: true,
            sanskritName: true,
            hindiName: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Database connection error in family details page:', error);
    connectionError = true;
  }

  if (connectionError) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-20 text-center font-sans space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Botanical Base is Temporarily Busy</h1>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
          Our botanical database is experiencing a high volume of concurrent connection requests. Please reload the page to refresh the catalog data.
        </p>
      </div>
    );
  }

  if (!family) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs />
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
          {family.name} Family
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-3xl leading-relaxed">
          {family.description}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-sans text-lg font-semibold tracking-tight">
          Medicinal Species in this Family ({family.plants.length})
        </h2>

        {family.plants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {family.plants.map((plant) => (
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
                </div>
                <Leaf className="h-5 w-5 text-[var(--ring)] shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)] italic">
            No species cataloged in this family yet.
          </p>
        )}
      </div>
    </div>
  );
}
