import Link from 'next/link';
import prisma from '@/lib/prisma';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { BookOpen, User, Calendar } from 'lucide-react';

export const revalidate = 3600;

interface PostFeedItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  author: { name: string | null; image: string | null };
}

export default async function BlogFeedPage() {
  let posts: PostFeedItem[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, image: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching blog feed:', error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Breadcrumbs />
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
          Editorial Publications
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Explore botanical literature, Ayurvedic case studies, and research findings authored by our specialists.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col items-start justify-between border border-[var(--border)] rounded-2xl p-6 bg-[var(--card)] hover:border-[var(--ring)] transition-all space-y-4"
            >
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {post.author.name || 'Staff Botanist'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
                <h2 className="font-sans text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  <Link href={`/blog/${post.slug}`} className="hover:text-[var(--ring)] transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--ring)] font-semibold pt-2">
                <BookOpen className="h-4 w-4" />
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] italic">
            No editorial articles published yet.
          </p>
        </div>
      )}
    </div>
  );
}
