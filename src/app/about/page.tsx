import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Award, BookOpen, Users, Compass } from 'lucide-react';

export const metadata = {
  title: 'About Mahesh Kumar Kushwaha | Founder of Kushwaha Plants',
  description: 'Mahesh Kumar Kushwaha is a medicinal plant educator, researcher, and founder of Kushwaha Herbs and Plants, documenting India\'s flora.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 space-y-10 font-sans">
      <div className="space-y-2">
        <Breadcrumbs />
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
          Mahesh Kumar Kushwaha
        </h1>
        <p className="text-sm font-semibold text-[var(--ring)]">
          Founder, Kushwaha Herbs and Plants • Medicinal Plant Educator & Researcher
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--card)] flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[var(--foreground)]">1.91 Lakh+</div>
            <div className="text-xs text-[var(--muted-foreground)]">YouTube Subscribers</div>
          </div>
        </div>

        <div className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--card)] flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[var(--foreground)]">250+</div>
            <div className="text-xs text-[var(--muted-foreground)]">Species Cultivated</div>
          </div>
        </div>
      </div>

      <div className="prose-editorial text-sm text-[var(--foreground)] leading-relaxed space-y-6 border-t border-[var(--border)]/45 pt-8">
        <p>
          <strong>Mahesh Kumar Kushwaha</strong> is a medicinal plant educator, researcher, and founder of Kushwaha Herbs and Plants. Through his educational initiatives, he has spent over a decade documenting India&apos;s medicinal flora and helping people identify, cultivate, and understand Ayurvedic plants.
        </p>
        <p>
          His mission is to preserve traditional botanical knowledge while making authentic medicinal plants and reliable educational resources accessible to everyone. By bridging the gap between traditional Ayurvedic wisdom and scientific botanical research, he provides verified knowledge on plant identifications, energetic profiles, and therapeutic safety.
        </p>

        <h3 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-1.5 pt-4">
          <Award className="h-5 w-5 text-amber-500" />
          Authority & Trust (E-E-A-T)
        </h3>
        <p>
          As an active educator with a massive YouTube community, Mahesh Kumar Kushwaha has established deep authority in identifying vernacular synonyms, botanical taxonomy classifications, and practical horticulture. His research gardens cultivate over 250 rare and essential species, preserving the genetic diversity of traditional Indian medicinal flora.
        </p>
      </div>
    </div>
  );
}
