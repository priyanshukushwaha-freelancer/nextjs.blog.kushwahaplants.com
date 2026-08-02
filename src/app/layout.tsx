import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Providers from '@/app/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Kushwaha Plants - Botanical Knowledge Platform & Ayurveda Base',
    template: '%s | Kushwaha Plants',
  },
  description: 'India\'s premier botanical research base and publishing platform for Medicinal Plants, Ayurvedic energetics, and clinical research citations.',
  metadataBase: new URL('http://localhost:3000'), // updated on deploy
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kushwaha Plants',
    description: 'India\'s premier botanical research base and publishing platform.',
    url: '/',
    siteName: 'Kushwaha Plants',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kushwaha Plants',
    description: 'India\'s premier botanical research base and publishing platform.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--ring)] selection:text-white">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
