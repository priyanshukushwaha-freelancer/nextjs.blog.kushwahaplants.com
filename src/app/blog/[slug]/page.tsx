import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import TiptapRenderer from '@/components/cms/TiptapRenderer';
import TableOfContents from '@/components/shared/TableOfContents';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import PrintButton from '@/components/shared/PrintButton';
import { User, Calendar, Leaf } from 'lucide-react';

export const revalidate = 86400; // 24 hours caching (ISR)

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post) return {};

  return {
    title: `${post.seoTitle || post.title} | Kushwaha Plants Blog`,
    description: post.seoDesc || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `/blog/${post.slug}`,
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: {
        select: { name: true, image: true, email: true },
      },
      plants: {
        include: {
          plant: {
            select: {
              id: true,
              slug: true,
              englishName: true,
              scientificName: true,
            },
          },
        },
      },
    },
  });

  if (!post || post.status !== 'PUBLISHED') notFound();

  // Article JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Staff Botanist',
    },
  };

  return (
    <article className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8 print:py-0 print:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="print:hidden">
        <Breadcrumbs />
      </div>

      {/* Article Header */}
      <header className="space-y-4 border-b border-[var(--border)] pb-8">
        <h1 className="font-sans text-3xl md:text-5xl font-semibold tracking-tight text-[var(--foreground)] leading-[1.15]">
          {post.title}
        </h1>
        <p className="text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
              <User className="h-4 w-4 text-[var(--muted-foreground)]" />
              {post.author.name || 'Staff Author'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </span>
          </div>

          <PrintButton />
        </div>
      </header>

      {/* Grid: Article Body & Sidebar TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        {/* Editorial Text */}
        <div className="lg:col-span-3 space-y-8 print:col-span-4">
          <TiptapRenderer content={post.content} />

          {/* Connected Plants Panel */}
          {post.plants.length > 0 && (
            <div className="print:hidden border border-[var(--border)] rounded-2xl p-6 bg-[var(--card)] space-y-4 mt-12">
              <h3 className="font-sans text-sm font-semibold tracking-tight flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-[var(--ring)]" />
                Featured Botanical Entities in this Post
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.plants.map(({ plant }) => (
                  <Link
                    key={plant.id}
                    href={`/plants/${plant.slug}`}
                    className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--ring)] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-sans font-semibold text-xs text-[var(--foreground)]">
                        {plant.englishName}
                      </h4>
                      <p className="text-[10px] italic text-[var(--muted-foreground)]">
                        {plant.scientificName}
                      </p>
                    </div>
                    <Leaf className="h-3.5 w-3.5 text-[var(--ring)] opacity-40 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Table of Contents */}
        <aside className="lg:col-span-1 print:hidden">
          <TableOfContents />
        </aside>
      </div>
    </article>
  );
}
