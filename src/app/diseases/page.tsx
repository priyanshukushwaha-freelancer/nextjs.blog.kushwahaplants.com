import Link from 'next/link';
import prisma from '@/lib/prisma';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

interface DiseaseListItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  _count?: { plants: number };
}

export default async function DiseasesIndexPage() {
  let diseases: DiseaseListItem[] = [];

  try {
    diseases = await prisma.disease.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { plants: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching disease indications:', error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div>
        <Breadcrumbs />
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
          Diseases & Indications
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Explore medical indications and connect them to verified therapeutic plants.
        </p>
      </div>

      {diseases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map((disease) => (
            <Link
              key={disease.id}
              href={`/diseases/${disease.slug}`}
              className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)] transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-[var(--foreground)] group-hover:text-[var(--ring)] transition-colors">
                  {disease.name}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                  {disease.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border)]/45 pt-4 text-xs font-semibold text-[var(--ring)]">
                <span>{disease._count?.plants || 0} Recommended Species</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] italic">
            No disease indications indexed yet.
          </p>
        </div>
      )}
    </div>
  );
}
