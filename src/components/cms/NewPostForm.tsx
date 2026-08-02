'use client';

import { useActionState, useState } from 'react';
import { createPostAction } from '@/app/cms/actions';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface NewPostFormProps {
  plants: Array<{ id: string; englishName: string; scientificName: string }>;
}

export default function NewPostForm({ plants }: NewPostFormProps) {
  const [state, formAction, isPending] = useActionState(createPostAction, null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Convert to URL friendly slug
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special characters
      .replace(/[\s_-]+/g, '-') // replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
    setSlug(generated);
  };

  return (
    <form action={formAction} className="space-y-8 max-w-4xl font-sans">
      <div className="flex items-center gap-4">
        <Link
          href="/cms"
          className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Console</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Create New Publication
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Publish a new clinical abstract overview, blog post, or editorial analysis.
        </p>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 font-medium">
          {state.error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="e.g. Clinical Efficacy of Tulsi in Respiratory Health"
              className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)] flex items-center justify-between">
              <span>Slug URL <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-[var(--muted-foreground)] italic">Auto-generated</span>
            </label>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="clinical-efficacy-of-tulsi"
              className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Excerpt (Summary) <span className="text-red-500">*</span></label>
            <textarea
              name="excerpt"
              rows={3}
              required
              placeholder="Provide a brief summary or TL;DR of the publication for preview lists..."
              className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)] transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Content Body (Markdown / Text) <span className="text-red-500">*</span></label>
            <textarea
              name="content"
              rows={12}
              required
              placeholder="Write your article body here. Paragraphs will be structured automatically..."
              className="w-full px-4 py-2 text-sm font-sans rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)] transition-all"
            />
          </div>
        </div>

        {/* Sidebar Configuration Fields */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--foreground)]">Publication Settings</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Publish Status</label>
              <select
                name="status"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
              >
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">Under Review</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Associate Botanical Nodes</label>
              <p className="text-[10px] text-[var(--muted-foreground)] mb-2">Select which plants are discussed in this article.</p>
              <div className="max-h-48 overflow-y-auto border border-[var(--border)]/65 rounded-lg p-3 space-y-2 bg-[var(--background)]">
                {plants.map((plant) => (
                  <label key={plant.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="plants"
                      value={plant.id}
                      className="rounded border-[var(--border)] text-[var(--ring)] focus:ring-[var(--ring)]"
                    />
                    <span>{plant.englishName} ({plant.scientificName})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--foreground)]">Search Engine Optimization</h3>
              <Sparkles className="h-3.5 w-3.5 text-[var(--ring)]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Meta Title</label>
              <input
                type="text"
                name="seoTitle"
                placeholder="Defaults to post title"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Meta Description</label>
              <textarea
                name="seoDesc"
                rows={3}
                placeholder="Defaults to excerpt"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Publication...</span>
              </>
            ) : (
              <span>Create Publication</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
