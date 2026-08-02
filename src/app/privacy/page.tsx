import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata = {
  title: 'Privacy Policy | Kushwaha Plants',
  description: 'Privacy policy and user data protections of the Kushwaha Plants botanical platform.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 space-y-6 font-sans">
      <Breadcrumbs />
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
        Privacy Policy
      </h1>
      
      <div className="prose-editorial text-sm text-[var(--foreground)] leading-relaxed space-y-4 pt-4 border-t border-[var(--border)]/45">
        <p className="text-xs text-[var(--muted-foreground)]">Last updated: August 2, 2026</p>
        
        <h2 className="text-base font-semibold pt-4">1. Information We Collect</h2>
        <p>
          We do not collect personal data from visitors reading the botanical catalog. If you register an author account in our Workspace Console, we store your email address and credentials securely.
        </p>

        <h2 className="text-base font-semibold pt-4">2. Cookies and Analytics</h2>
        <p>
          We use anonymous performance analytics and speed tracking (provided by Vercel Analytics) to monitor page load times and improve user experience.
        </p>

        <h2 className="text-base font-semibold pt-4">3. Data Security</h2>
        <p>
          Your authentication details are protected by cryptographic hashing. We do not sell or distribute any credentials or usage metrics to third parties.
        </p>
      </div>
    </div>
  );
}
