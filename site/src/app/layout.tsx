import type { Metadata } from 'next';
import { Oswald } from 'next/font/google';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZER0PA — Zero-Point Architecture for Intelligent Machines',
  description: 'Proof-first authority surface for Zero-Point Architecture.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={oswald.variable}>
      <body>{children}</body>
    </html>
  );
}
