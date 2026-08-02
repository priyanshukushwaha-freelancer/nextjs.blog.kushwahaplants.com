import Breadcrumbs from '@/components/shared/Breadcrumbs';

export const metadata = {
  title: 'Terms of Service | Kushwaha Plants',
  description: 'Terms of service and usage conditions for the Kushwaha Plants botanical publishing platform.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 space-y-6 font-sans">
      <Breadcrumbs />
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] mt-2">
        Terms of Service
      </h1>
      
      <div className="prose-editorial text-sm text-[var(--foreground)] leading-relaxed space-y-4 pt-4 border-t border-[var(--border)]/45">
        <p className="text-xs text-[var(--muted-foreground)]">Last updated: August 2, 2026</p>
        
        <h2 className="text-base font-semibold pt-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Kushwaha Plants (the &quot;Platform&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
        </p>

        <h2 className="text-base font-semibold pt-4">2. Botanical & Medical Disclaimer</h2>
        <p>
          The content provided on this Platform is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>

        <h2 className="text-base font-semibold pt-4">3. Intellectual Property</h2>
        <p>
          All botanical illustrations, descriptions, articles, and research compilations are the intellectual property of Kushwaha Herbs and Plants unless stated otherwise. Unauthorized reproduction of content is prohibited.
        </p>
      </div>
    </div>
  );
}
