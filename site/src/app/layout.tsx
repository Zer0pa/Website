import type { Metadata } from 'next';
import { Oswald } from 'next/font/google';
import StructuredData from '@/components/seo/StructuredData';
import { getSiteUrl } from '@/lib/seo';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'ZER0PA — Zero-Point Architecture for Intelligent Machines',
  description: 'Proof-first authority surface for Zero-Point Architecture.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = getSiteUrl();

  return (
    <html lang="en" className={oswald.variable}>
      <body>
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ZER0PA',
            url: siteUrl,
            description: 'Proof-first authority surface for Zero-Point Architecture.',
          }}
        />
        {children}
      </body>
    </html>
  );
}
