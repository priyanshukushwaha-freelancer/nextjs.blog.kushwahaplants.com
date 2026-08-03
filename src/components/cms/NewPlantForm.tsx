'use client';

import { useActionState, useState, useEffect } from 'react';
import { createPlantAction } from '@/app/cms/actions';
import { ArrowLeft, Loader2, Info, Plus, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface NewPlantFormProps {
  families: Array<{ id: string; name: string }>;
  parts: Array<{ id: string; name: string }>;
  diseases: Array<{ id: string; name: string }>;
  actions: Array<{ id: string; name: string }>;
}

const DRAFT_STORAGE_KEY = 'kushwaha_plant_form_draft';

export default function NewPlantForm({ families, parts, diseases, actions }: NewPlantFormProps) {
  const [state, formAction, isPending] = useActionState(createPlantAction, null);

  // Controlled form state for auto-slug and draft recovery
  const [formData, setFormData] = useState({
    englishName: '',
    scientificName: '',
    sanskritName: '',
    hindiName: '',
    slug: '',
    description: '',
    familyId: '',
    conservation: '',
    imageUrl: '',
    imageAlt: '',
    rasa: '',
    guna: '',
    virya: '',
    vipaka: '',
    dosha: '',
  });

  const [youtubeLinks, setYoutubeLinks] = useState<Array<{ url: string; title: string }>>([
    { url: '', title: '' },
  ]);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([
    { question: '', answer: '' },
  ]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const [draftLoaded, setDraftLoaded] = useState(false);

  // Restore draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.youtubeLinks) setYoutubeLinks(parsed.youtubeLinks);
        if (parsed.faqs) setFaqs(parsed.faqs);
        if (parsed.selectedParts) setSelectedParts(parsed.selectedParts);
        if (parsed.selectedDiseases) setSelectedDiseases(parsed.selectedDiseases);
        if (parsed.selectedActions) setSelectedActions(parsed.selectedActions);
        setDraftLoaded(true);
      }
    } catch (e) {
      console.warn('Could not restore form draft:', e);
    }
  }, []);

  // Autosave draft to sessionStorage as user types
  useEffect(() => {
    try {
      const draft = {
        formData,
        youtubeLinks,
        faqs,
        selectedParts,
        selectedDiseases,
        selectedActions,
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      // Ignore quota errors
    }
  }, [formData, youtubeLinks, faqs, selectedParts, selectedDiseases, selectedActions]);

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      setFormData({
        englishName: '',
        scientificName: '',
        sanskritName: '',
        hindiName: '',
        slug: '',
        description: '',
        familyId: '',
        conservation: '',
        imageUrl: '',
        imageAlt: '',
        rasa: '',
        guna: '',
        virya: '',
        vipaka: '',
        dosha: '',
      });
      setYoutubeLinks([{ url: '', title: '' }]);
      setFaqs([{ question: '', answer: '' }]);
      setSelectedParts([]);
      setSelectedDiseases([]);
      setSelectedActions([]);
      setDraftLoaded(false);
    } catch (e) {
      // ignore
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'englishName') {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return next;
    });
  };

  const addYoutubeRow = () => setYoutubeLinks((prev) => [...prev, { url: '', title: '' }]);
  const removeYoutubeRow = (idx: number) => setYoutubeLinks((prev) => prev.filter((_, i) => i !== idx));

  const addFaqRow = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  const removeFaqRow = (idx: number) => setFaqs((prev) => prev.filter((_, i) => i !== idx));

  const toggleCheckbox = (list: string[], setList: (val: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-8 max-w-4xl font-sans">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/cms"
          className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Console</span>
        </Link>

        {draftLoaded && (
          <button
            type="button"
            onClick={clearDraft}
            className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Saved Draft</span>
          </button>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Catalog New Plant Species
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Index a new medicinal plant profile containing scientific taxonomic metrics, Ayurvedic properties, and indications.
        </p>
      </div>

      {/* Error Banner */}
      {state?.error && (
        <div className="flex items-start gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{state.error}</p>
            <p className="text-[11px] opacity-80 mt-0.5">Your form entries are safely preserved below. You can adjust your input and try submitting again.</p>
          </div>
        </div>
      )}

      {/* Draft Loaded Notice */}
      {draftLoaded && !state?.error && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-600 dark:text-blue-400 font-medium">
          <span>Draft restored from your last session. Your typed details are safe.</span>
          <button
            type="button"
            onClick={clearDraft}
            className="text-[11px] underline hover:opacity-80"
          >
            Clear Draft
          </button>
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
                  value={formData.englishName}
                  onChange={(e) => handleFieldChange('englishName', e.target.value)}
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
                  value={formData.scientificName}
                  onChange={(e) => handleFieldChange('scientificName', e.target.value)}
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
                  value={formData.sanskritName}
                  onChange={(e) => handleFieldChange('sanskritName', e.target.value)}
                  placeholder="e.g. Tulasi"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Hindi Name</label>
                <input
                  type="text"
                  name="hindiName"
                  value={formData.hindiName}
                  onChange={(e) => handleFieldChange('hindiName', e.target.value)}
                  placeholder="e.g. Tulsi"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)] flex justify-between">
                <span>Slug URL <span className="text-red-500">*</span></span>
                <span className="text-[10px] text-[var(--muted-foreground)] italic">Auto-generated</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
                required
                placeholder="holy-basil"
                className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Upload Image (Max 5MB WebP/JPG/PNG)</label>
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
                  value={formData.imageUrl}
                  onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Image Alt Text (SEO)</label>
              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={(e) => handleFieldChange('imageAlt', e.target.value)}
                placeholder="e.g. Tulsi plant leaves illustration"
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
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
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
                  value={formData.rasa}
                  onChange={(e) => handleFieldChange('rasa', e.target.value)}
                  placeholder="Katu, Tikta"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Guna (Physical Quality)</label>
                <input
                  type="text"
                  name="guna"
                  value={formData.guna}
                  onChange={(e) => handleFieldChange('guna', e.target.value)}
                  placeholder="Laghu, Ruksha"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Virya (Potency)</label>
                <input
                  type="text"
                  name="virya"
                  value={formData.virya}
                  onChange={(e) => handleFieldChange('virya', e.target.value)}
                  placeholder="Ushna"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Vipaka (Post-digestive Result)</label>
                <input
                  type="text"
                  name="vipaka"
                  value={formData.vipaka}
                  onChange={(e) => handleFieldChange('vipaka', e.target.value)}
                  placeholder="Katu"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[var(--foreground)]">Dosha Balancing Effect</label>
                <input
                  type="text"
                  name="dosha"
                  value={formData.dosha}
                  onChange={(e) => handleFieldChange('dosha', e.target.value)}
                  placeholder="Kapha-Vatahara"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* YouTube Video Resources Section */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">YouTube Video Knowledge Resources</h3>
                <p className="text-[10px] text-[var(--muted-foreground)]">Embed video links for maximum EEAT trust & video search indexing.</p>
              </div>
              <button
                type="button"
                onClick={addYoutubeRow}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--ring)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Video</span>
              </button>
            </div>

            <div className="space-y-3">
              {youtubeLinks.map((yt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="url"
                    name="youtubeUrls"
                    value={yt.url}
                    onChange={(e) => {
                      const next = [...youtubeLinks];
                      next[idx].url = e.target.value;
                      setYoutubeLinks(next);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                  />
                  <input
                    type="text"
                    name="youtubeTitles"
                    value={yt.title}
                    onChange={(e) => {
                      const next = [...youtubeLinks];
                      next[idx].title = e.target.value;
                      setYoutubeLinks(next);
                    }}
                    placeholder="Video title / topic"
                    className="w-1/3 px-3 py-1.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
                  />
                  {youtubeLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYoutubeRow(idx)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions (FAQs) Section */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Botanical FAQs (Google Rich Snippets)</h3>
                <p className="text-[10px] text-[var(--muted-foreground)]">Add questions and answers to generate FAQPage JSON-LD schemas.</p>
              </div>
              <button
                type="button"
                onClick={addFaqRow}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--ring)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-2 relative">
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaqRow(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Question #{idx + 1}</label>
                    <input
                      type="text"
                      name="faqQuestions"
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...faqs];
                        next[idx].question = e.target.value;
                        setFaqs(next);
                      }}
                      placeholder="e.g. How should Tulsi leaves be consumed daily?"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Answer</label>
                    <textarea
                      name="faqAnswers"
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...faqs];
                        next[idx].answer = e.target.value;
                        setFaqs(next);
                      }}
                      placeholder="Provide verified botanical instructions..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Classification & Relationships */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Taxonomy & Relations</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Botanical Family <span className="text-red-500">*</span></label>
              <select
                name="familyId"
                value={formData.familyId}
                onChange={(e) => handleFieldChange('familyId', e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--ring)]"
              >
                <option value="">Select a family...</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Conservation Status</label>
              <input
                type="text"
                name="conservation"
                value={formData.conservation}
                onChange={(e) => handleFieldChange('conservation', e.target.value)}
                placeholder="e.g. Least Concern (IUCN 3.1)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none"
              />
            </div>

            {/* Plant Parts Checkboxes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[var(--foreground)]">Used Plant Parts</label>
              <div className="max-h-36 overflow-y-auto border border-[var(--border)]/65 rounded-xl p-3 space-y-1.5 bg-[var(--background)]">
                {parts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="parts"
                      value={p.id}
                      checked={selectedParts.includes(p.id)}
                      onChange={() => toggleCheckbox(selectedParts, setSelectedParts, p.id)}
                      className="rounded border-[var(--border)] text-[var(--ring)] focus:ring-[var(--ring)]"
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Disease Indications Checkboxes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[var(--foreground)]">Therapeutic Indications</label>
              <div className="max-h-36 overflow-y-auto border border-[var(--border)]/65 rounded-xl p-3 space-y-1.5 bg-[var(--background)]">
                {diseases.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="diseases"
                      value={d.id}
                      checked={selectedDiseases.includes(d.id)}
                      onChange={() => toggleCheckbox(selectedDiseases, setSelectedDiseases, d.id)}
                      className="rounded border-[var(--border)] text-[var(--ring)] focus:ring-[var(--ring)]"
                    />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medicinal Actions Checkboxes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[var(--foreground)]">Medicinal Actions</label>
              <div className="max-h-36 overflow-y-auto border border-[var(--border)]/65 rounded-xl p-3 space-y-1.5 bg-[var(--background)]">
                {actions.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="actions"
                      value={a.id}
                      checked={selectedActions.includes(a.id)}
                      onChange={() => toggleCheckbox(selectedActions, setSelectedActions, a.id)}
                      className="rounded border-[var(--border)] text-[var(--ring)] focus:ring-[var(--ring)]"
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cataloging Species...</span>
              </>
            ) : (
              <span>Publish Plant Profile</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
