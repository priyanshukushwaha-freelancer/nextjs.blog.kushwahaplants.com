'use client';

import { useActionState, useState } from 'react';
import { createPartAction } from '@/app/cms/actions';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewPartForm() {
  const [state, formAction, isPending] = useActionState(createPartAction, null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[\s_-]+/g, '-').replace(/[^\w-]/g, ''));
  };

  return (
    <div className="max-w-xl font-sans">
      <Link href="/cms" className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Console</span>
      </Link>

      <div className="space-y-1 mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Create Plant Part Category</h1>
        <p className="text-xs text-[var(--muted-foreground)]">Add a plant part taxonomy term (e.g. Leaves, Bark, Rhizome, Seeds).</p>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 font-medium mb-6">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--foreground)]">Part Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
            placeholder="e.g. Bark"
            className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--foreground)] flex justify-between">
            <span>Slug <span className="text-red-500">*</span></span>
            <span className="text-[10px] text-[var(--muted-foreground)] italic">Auto-generated</span>
          </label>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="bark"
            className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--foreground)]">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Describe the anatomical part of the plant..."
            className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create Plant Part</span>}
        </button>
      </form>
    </div>
  );
}
