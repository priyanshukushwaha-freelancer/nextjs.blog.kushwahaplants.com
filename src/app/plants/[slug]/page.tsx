import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getPlantGraphData, getCachedPlantBySlug } from '@/services/graph';
import KnowledgeGraph from '@/components/botanical/KnowledgeGraph';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Leaf, FileText, Bookmark, HelpCircle, ShieldAlert } from 'lucide-react';

export const revalidate = 86400; // ISR for 24 hours

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let plant = null;
  try {
    plant = await getCachedPlantBySlug(resolvedParams.slug);
  } catch (e) {
    // fallback
  }

  if (!plant) return {};

  const title = `${plant.englishName} (${plant.scientificName}) - Medical & Ayurvedic Guide`;
  const description = `Read about ${plant.englishName} (${plant.scientificName}), taxonomy family ${plant.family.name}. Includes Ayurvedic properties, therapeutic indications, and scientific citations.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/plants/${plant.slug}`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function PlantProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  let plant = null;
  let connectionError = false;

  try {
    plant = await getCachedPlantBySlug(resolvedParams.slug);
  } catch (error) {
    console.error('Database connection error in plant details page:', error);
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

  if (!plant) notFound();

  // Fetch data for the interactive knowledge graph
  const graphData = await getPlantGraphData(plant.slug);

  // Cast JSON type to expected format for rendering
  const ayurvedicProps = plant.ayurvedicProps as {
    rasa?: string[];
    guna?: string[];
    virya?: string[];
    vipaka?: string[];
    dosha?: string[];
  } | null;

  // JSON-LD structured schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: plant.englishName,
    description: plant.description,
    about: {
      '@type': 'Taxon',
      name: plant.scientificName,
      scientificName: plant.scientificName,
      taxonRank: 'Species',
      family: plant.family.name,
      commonName: [plant.englishName, plant.hindiName, plant.sanskritName].filter(Boolean),
    },
    aspect: ['Ayurveda Properties', 'Medicinal Action', 'Indications', 'Clinical Studies'],
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10 space-y-12">
      {/* JSON-LD Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-4">
        <Breadcrumbs />
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                {plant.englishName}
              </h1>
              {plant.conservation && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <ShieldAlert className="h-3 w-3" />
                  {plant.conservation}
                </span>
              )}
            </div>
            <p className="font-serif italic text-lg text-[var(--muted-foreground)]">
              {plant.scientificName} <span className="not-italic text-sm text-[var(--muted)]">— {plant.family.name} Family</span>
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-sans text-[var(--muted)] pt-1">
              <span><strong className="text-[var(--foreground)]">Sanskrit:</strong> {plant.sanskritName || '—'}</span>
              <span><strong className="text-[var(--foreground)]">Hindi:</strong> {plant.hindiName || '—'}</span>
            </div>
          </div>
          <Leaf className="h-10 w-10 text-[var(--ring)] shrink-0 hidden md:block" />
        </div>
      </div>

      {/* Grid: Details & Sidebar Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Scientific Description */}
          <section className="space-y-3">
            <h2 className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Botanical Description & Habitat
            </h2>
            <p className="prose-editorial text-sm leading-relaxed text-[var(--foreground)]">
              {plant.description}
            </p>
          </section>

          {/* Ayurvedic Energetics Table */}
          {ayurvedicProps && (
            <section className="space-y-4">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)]">
                Ayurvedic Pharmacology (Dravyaguna)
              </h2>
              <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]">
                <table className="min-w-full divide-y divide-[var(--border)] text-xs text-left">
                  <thead className="bg-[var(--border)]/35 text-[var(--foreground)] font-semibold">
                    <tr>
                      <th className="px-6 py-3">Energetic Attribute</th>
                      <th className="px-6 py-3">Traditional Properties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-[var(--muted-foreground)]">
                    <tr>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">Rasa (Taste)</td>
                      <td className="px-6 py-4">{ayurvedicProps.rasa?.join(', ') || '—'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">Guna (Quality)</td>
                      <td className="px-6 py-4">{ayurvedicProps.guna?.join(', ') || '—'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">Virya (Potency)</td>
                      <td className="px-6 py-4">{ayurvedicProps.virya?.join(', ') || '—'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">Vipaka (Post-digestive taste)</td>
                      <td className="px-6 py-4">{ayurvedicProps.vipaka?.join(', ') || '—'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-[var(--foreground)]">Dosha Karma (Energetic effect)</td>
                      <td className="px-6 py-4">{ayurvedicProps.dosha?.join(', ') || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Research & Publications */}
          {plant.research.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)]">
                Scientific Research & Clinical Studies
              </h2>
              <div className="space-y-4">
                {plant.research.map((paper: any) => (
                  <div key={paper.id} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-sans font-semibold text-sm text-[var(--foreground)]">
                        {paper.title}
                      </h3>
                      <FileText className="h-4 w-4 text-[var(--ring)] shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {paper.authors} — <span className="italic">{paper.journal}</span> ({paper.year})
                    </p>
                    {paper.abstract && (
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed italic border-l-2 border-[var(--border)] pl-3">
                        "{paper.abstract}"
                      </p>
                    )}
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] text-[var(--ring)] hover:underline font-medium"
                      >
                        Read clinical paper (DOI: {paper.doi || 'Link'}) →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* References & Citations */}
          {plant.references.length > 0 && (
            <section className="space-y-3 border-t border-[var(--border)] pt-8">
              <h2 className="font-sans text-sm font-semibold tracking-tight text-[var(--foreground)] flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-[var(--muted-foreground)]" />
                Footnotes & Classical Citations
              </h2>
              <ol className="list-decimal list-inside text-xs text-[var(--muted-foreground)] space-y-1.5 pl-2">
                {plant.references.map((ref: any) => (
                  <li key={ref.id} className="leading-relaxed">
                    <span className="font-semibold text-[var(--foreground)]">[{ref.citationKey}]</span> {ref.citationText}
                    {ref.url && (
                      <a href={ref.url} className="ml-1.5 text-[var(--ring)] hover:underline">
                        Source Link
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* FAQs */}
          {plant.faqs.length > 0 && (
            <section className="space-y-4 border-t border-[var(--border)] pt-8">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--ring)]" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {plant.faqs.map((faq: any) => (
                  <div key={faq.id} className="space-y-1.5">
                    <h4 className="font-sans font-semibold text-sm text-[var(--foreground)]">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* YouTube Video Embeds */}
          {plant.videos && Array.isArray(plant.videos) && plant.videos.length > 0 && (
            <section className="space-y-4 pt-4">
              <h2 className="font-sans text-sm font-semibold tracking-tight text-[var(--foreground)] flex items-center gap-1.5 border-b border-[var(--border)]/35 pb-2">
                <FileText className="h-4 w-4 text-red-500" />
                Video Guides & Identification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(plant.videos as Array<{ url: string; title: string }>).map((video, idx) => {
                  let videoId = '';
                  try {
                    const urlObj = new URL(video.url);
                    if (urlObj.hostname === 'youtu.be') {
                      videoId = urlObj.pathname.slice(1);
                    } else if (urlObj.searchParams.has('v')) {
                      videoId = urlObj.searchParams.get('v') || '';
                    } else if (urlObj.pathname.startsWith('/embed/')) {
                      videoId = urlObj.pathname.split('/')[2];
                    }
                  } catch (e) {
                    const match = video.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                    if (match) videoId = match[1];
                  }
                  
                  if (!videoId) return null;
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <h4 className="text-[11px] font-semibold text-[var(--foreground)] line-clamp-1">{video.title}</h4>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Knowledge Graph */}
        <div className="lg:col-span-1 space-y-6">
          {graphData && <KnowledgeGraph data={graphData} />}

          {/* Taxonomy Metadata Panel */}
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-4">
            <h3 className="font-sans text-sm font-semibold tracking-tight">Taxon & Indication Directory</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[var(--muted-foreground)] block">Botanical Family</span>
                <Link href={`/families/${plant.family.slug}`} className="text-[var(--ring)] hover:underline font-medium">
                  {plant.family.name}
                </Link>
              </div>
              {plant.parts.length > 0 && (
                <div>
                  <span className="text-[var(--muted-foreground)] block">Parts Utilized</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {plant.parts.map(({ part }: any) => (
                      <span key={part.id} className="px-2 py-0.5 bg-[var(--border)]/35 text-[var(--foreground)] rounded text-[10px]">
                        {part.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {plant.diseases.length > 0 && (
                <div>
                  <span className="text-[var(--muted-foreground)] block">Target Indications</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {plant.diseases.map(({ disease }: any) => (
                      <Link
                        key={disease.id}
                        href={`/diseases/${disease.slug}`}
                        className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15 rounded text-[10px] font-medium"
                      >
                        {disease.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {plant.actions.length > 0 && (
                <div>
                  <span className="text-[var(--muted-foreground)] block">Pharmacological Actions</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {plant.actions.map(({ action }: any) => (
                      <span
                        key={action.id}
                        className="px-2 py-0.5 bg-[var(--border)]/35 text-[var(--foreground)] rounded text-[10px]"
                      >
                        {action.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* EEAT Author Profile */}
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] p-6 space-y-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">Botanical Authority</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-sans font-semibold text-xs text-[var(--foreground)]">Mahesh Kumar Kushwaha</h4>
                <p className="text-[10px] text-[var(--muted-foreground)]">Founder, Kushwaha Herbs and Plants</p>
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
                Medicinal plant educator and researcher with over a decade documenting India&apos;s flora, cultivating 250+ species, and educating a 1.91 Lakh+ subscriber community.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-[10px] font-semibold text-[var(--ring)] hover:underline"
              >
                Read full profile & credentials →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
