import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, LayoutGrid, FileEdit, FolderHeart, Activity, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CmsDashboardPage() {
  const session = await auth();
  
  // Guard the page: Redirect to login if user is unauthorized
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const role = (session.user as any).role;

  // Fetch counts, posts, and audit logs
  let posts: any[] = [];
  let plants: any[] = [];
  let auditLogs: any[] = [];
  let postCount = 0;
  let plantCount = 0;

  try {
    [posts, plants, auditLogs, postCount, plantCount] = await Promise.all([
      prisma.post.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { author: { select: { name: true } } },
        take: 5,
      }),
      prisma.plant.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, englishName: true, scientificName: true, slug: true },
        take: 5,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
        take: 5,
      }),
      prisma.post.count(),
      prisma.plant.count(),
    ]);
  } catch (error) {
    console.error('Error loading CMS data:', error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Workspace Console
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Logged in as <strong className="text-[var(--foreground)]">{session.user.name || session.user.email}</strong> ({role})
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/cms/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Publication</span>
          </Link>
        </div>
      </div>

      {/* Grid: Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 border border-[var(--border)] rounded-2xl bg-[var(--card)] space-y-2">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Publications</span>
          <div className="text-3xl font-semibold tracking-tight">{postCount}</div>
          <p className="text-[10px] text-[var(--muted-foreground)]">Drafts & published articles.</p>
        </div>
        <div className="p-5 border border-[var(--border)] rounded-2xl bg-[var(--card)] space-y-2">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Indexed Plants</span>
          <div className="text-3xl font-semibold tracking-tight">{plantCount}</div>
          <p className="text-[10px] text-[var(--muted-foreground)]">Botanical taxonomic entries.</p>
        </div>
        <div className="p-5 border border-[var(--border)] rounded-2xl bg-[var(--card)] space-y-2">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Access Authorization</span>
          <div className="flex items-center gap-1.5 text-emerald-500 pt-1 text-sm font-semibold">
            <ShieldCheck className="h-5 w-5" />
            <span>Authenticated Author</span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)]">Role-based privileges active.</p>
        </div>
      </div>

      {/* CMS Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Blog Manager */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
            <FileEdit className="h-4 w-4 text-[var(--ring)]" />
            Recent Publications & Drafts
          </h2>
          <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] divide-y divide-[var(--border)]">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--border)]/15 transition-colors">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-[var(--foreground)] line-clamp-1">{post.title}</h3>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      By {post.author.name || 'Staff'} • {new Date(post.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                    </p>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                    post.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {post.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-4 text-xs text-[var(--muted-foreground)] italic">No publications cataloged.</p>
            )}
          </div>
        </div>

        {/* Plant Taxonomy Manager */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
            <FolderHeart className="h-4 w-4 text-blue-500" />
            Botanical Directory Nodes
          </h2>
          <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] divide-y divide-[var(--border)]">
            {plants.length > 0 ? (
              plants.map((plant) => (
                <div key={plant.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--border)]/15 transition-colors">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-[var(--foreground)]">{plant.englishName}</h3>
                    <p className="text-[10px] italic text-[var(--muted-foreground)]">{plant.scientificName}</p>
                  </div>
                  <Link
                    href={`/plants/${plant.slug}`}
                    className="text-[10px] text-[var(--ring)] hover:underline font-semibold"
                  >
                    View profile →
                  </Link>
                </div>
              ))
            ) : (
              <p className="p-4 text-xs text-[var(--muted-foreground)] italic">No taxonomic plants cataloged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)] border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-purple-500" />
          Workspace Audit Logs
        </h2>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] divide-y divide-[var(--border)] text-xs">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between gap-4 text-[11px] text-[var(--muted-foreground)]">
                <div>
                  <strong className="text-[var(--foreground)]">{log.user.name || 'System'}</strong> executed action <code className="bg-[var(--border)]/55 px-1 py-0.5 rounded text-[10px]">{log.action}</code>
                </div>
                <span>{new Date(log.createdAt).toLocaleDateString('en-IN', { timeStyle: 'short', dateStyle: 'short' })}</span>
              </div>
            ))
          ) : (
            <p className="p-4 text-xs text-[var(--muted-foreground)] italic">No security or auditing events recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
