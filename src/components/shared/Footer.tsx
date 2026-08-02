import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--background)] py-12 text-sm text-[var(--muted)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[var(--ring)]" />
              <span className="font-sans text-base font-semibold tracking-tight text-[var(--foreground)]">
                Kushwaha <span className="font-normal text-[var(--muted)]">Plants</span>
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-[var(--muted-foreground)]">
              An enterprise botanical publishing platform and medicinal plant knowledge base. Powered by Ayurveda energetics, scientific journals, and clinical research.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Taxonomy Directory
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/plants" className="hover:text-[var(--foreground)] transition-colors">
                  Medicinal Plants Base
                </Link>
              </li>
              <li>
                <Link href="/families" className="hover:text-[var(--foreground)] transition-colors">
                  Plant Families
                </Link>
              </li>
              <li>
                <Link href="/diseases" className="hover:text-[var(--foreground)] transition-colors">
                  Diseases & Indications
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Feeds */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Technical Feeds
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sitemap.xml" className="hover:text-[var(--foreground)] transition-colors">
                  XML Sitemap
                </Link>
              </li>
              <li>
                <Link href="/feed.xml" className="hover:text-[var(--foreground)] transition-colors">
                  RSS Editorial Feed
                </Link>
              </li>
              <li>
                <Link href="/cms" className="hover:text-[var(--foreground)] transition-colors font-medium">
                  Author Console (CMS)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
          <p>© {currentYear} Kushwaha Plants. All research cited accordingly.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">
              Terms of Publishing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
