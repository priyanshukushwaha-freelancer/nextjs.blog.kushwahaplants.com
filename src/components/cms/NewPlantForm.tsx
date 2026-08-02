'use client';

import { useActionState, useState } from 'react';
import { createPlantAction } from '@/app/cms/actions';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

interface NewPlantFormProps {
  families: Array<{ id: string; name: string }>;
  parts: Array<{ id: string; name: string }>;
  diseases: Array<{ id: string; name: string }>;
  actions: Array<{ id: string; name: string }>;
}

export default function NewPlantForm({ families, parts, diseases, actions }: NewPlantFormProps) {
  const [state, formAction, isPending] = useActionState(createPlantAction, null);
  const [englishName, setEnglishName] = useState('');
  const [slug, setSlug] = useState('');

  // Auto-generate slug from English name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEnglishName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-8 max-w-4xl font-sans">
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
          Catalog New Plant Species
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Index a new medicinal plant profile containing scientific taxonomic metrics, Ayurvedic properties, and indications.
        </p>
      </div>

      {state?.error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 font-medium">
          {state.error}
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Identity */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Plant Identity</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">English Common Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="englishName"
                  value={englishName}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g. Holy Basil"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Scientific Name (Binomial) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="scientificName"
                  required
                  placeholder="e.g. Ocimum tenuiflorum"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Sanskrit Name</label>
                <input
                  type="text"
                  name="sanskritName"
                  placeholder="e.g. Tulasi"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Hindi Name</label>
                <input
                  type="text"
                  name="hindiName"
                  placeholder="e.g. Tulsi"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>
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
                placeholder="holy-basil"
                className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Upload Image from System (WebP Auto)</label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="w-full px-4 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Or Image URL (Fallback)</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Image Alt Text (SEO)</label>
              <input
                type="text"
                name="imageAlt"
                placeholder="e.g. Tulsi plant leaves"
                className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Description & Profile</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Detailed Botanical Profile <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                rows={6}
                required
                placeholder="Provide a comprehensive summary of the plant's history, botanical traits, habitats, and usage..."
                className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)] resize-none"
              />
            </div>
          </div>

          {/* Ayurvedic Properties */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Ayurvedic Energetics</h3>
              <Info className="h-3 w-3 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] -mt-2">Provide properties as comma-separated values (e.g. Tikta, Katu).</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Rasa (Taste)</label>
                <input
                  type="text"
                  name="rasa"
                  placeholder="Katu, Tikta"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Guna (Physical Quality)</label>
                <input
                  type="text"
                  name="guna"
                  placeholder="Laghu, Ruksha"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Virya (Potency/Action)</label>
                <input
                  type="text"
                  name="virya"
                  placeholder="Ushna"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Vipaka (Post-Digestive Effect)</label>
                <input
                  type="text"
                  name="vipaka"
                  placeholder="Katu"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[var(--foreground)]">Dosha (Energetic Balance)</label>
                <input
                  type="text"
                  name="dosha"
                  placeholder="Vata-Kapha Hara, Pitta Vardhana"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* YouTube Videos */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">YouTube Educational Videos</h3>
            <p className="text-[10px] text-[var(--muted-foreground)] -mt-2">Provide YouTube video URLs and titles to embed on this plant profile.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--foreground)]">Video 1 URL</label>
                  <input
                    type="url"
                    name="youtubeUrls"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--foreground)]">Video 1 Title</label>
                  <input
                    type="text"
                    name="youtubeTitles"
                    placeholder="e.g. Identify Real Tulsi Species"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--foreground)]">Video 2 URL</label>
                  <input
                    type="url"
                    name="youtubeUrls"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[var(--foreground)]">Video 2 Title</label>
                  <input
                    type="text"
                    name="youtubeTitles"
                    placeholder="e.g. How to Cultivate Neem"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Plant FAQs */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Botanical & Medical FAQs</h3>
            <p className="text-[10px] text-[var(--muted-foreground)] -mt-2">Add frequently asked questions to maximize Google Search Snippets and AI rankings.</p>

            <div className="space-y-4">
              <div className="space-y-2 border-b border-[var(--border)]/35 pb-4">
                <input
                  type="text"
                  name="faqQuestions"
                  placeholder="FAQ 1: Question (e.g. Can Tulsi be consumed daily?)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] font-semibold focus:outline-none"
                />
                <textarea
                  name="faqAnswers"
                  rows={2}
                  placeholder="FAQ 1: Answer..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2 border-b border-[var(--border)]/35 pb-4">
                <input
                  type="text"
                  name="faqQuestions"
                  placeholder="FAQ 2: Question (e.g. What are the side effects of Neem?)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] font-semibold focus:outline-none"
                />
                <textarea
                  name="faqAnswers"
                  rows={2}
                  placeholder="FAQ 2: Answer..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  name="faqQuestions"
                  placeholder="FAQ 3: Question"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] font-semibold focus:outline-none"
                />
                <textarea
                  name="faqAnswers"
                  rows={2}
                  placeholder="FAQ 3: Answer..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          {/* Classification */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--foreground)]">Taxon Classification</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Botanical Family <span className="text-red-500">*</span></label>
              <select
                name="familyId"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
              >
                <option value="">Select Family...</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Conservation Status (IUCN)</label>
              <select
                name="conservation"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
              >
                <option value="LC">Least Concern (LC)</option>
                <option value="NT">Near Threatened (NT)</option>
                <option value="VU">Vulnerable (VU)</option>
                <option value="EN">Endangered (EN)</option>
                <option value="CR">Critically Endangered (CR)</option>
                <option value="EW">Extinct in Wild (EW)</option>
              </select>
            </div>
          </div>

          {/* Relations selectors */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--foreground)]">Therapeutic Connections</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Parts Utilized</label>
              <div className="max-h-28 overflow-y-auto border border-[var(--border)]/65 rounded-lg p-2.5 space-y-1.5 bg-[var(--background)]">
                {parts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" name="parts" value={p.id} className="rounded border-[var(--border)] text-[var(--ring)]" />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Target Indications</label>
              <div className="max-h-28 overflow-y-auto border border-[var(--border)]/65 rounded-lg p-2.5 space-y-1.5 bg-[var(--background)]">
                {diseases.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" name="diseases" value={d.id} className="rounded border-[var(--border)] text-[var(--ring)]" />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Pharmacological Actions</label>
              <div className="max-h-28 overflow-y-auto border border-[var(--border)]/65 rounded-lg p-2.5 space-y-1.5 bg-[var(--background)]">
                {actions.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" name="actions" value={a.id} className="rounded border-[var(--border)] text-[var(--ring)]" />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
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
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Catalog Plant</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
