import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FlagshipBlock from '@/components/home/FlagshipBlock';
import ConstellationGrid from '@/components/home/ConstellationGrid';
import ProofLogic from '@/components/home/ProofLogic';
import StructuredData from '@/components/seo/StructuredData';
import { loadLaneCatalog } from '@/lib/data/lane-data';
import { canonicalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  const catalog = await loadLaneCatalog();
  const featuredLane = catalog.featuredLane || catalog.lanes[0] || null;

  return (
    <div className="substrate">
      <Header variant="landing" />

      <main>
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'ZER0PA',
            url: canonicalUrl('/'),
            description: 'Proof-first authority surface for Zero-Point Architecture.',
            isPartOf: {
              '@type': 'WebSite',
              name: 'ZER0PA',
              url: canonicalUrl('/'),
            },
          }}
        />
        <Hero
          syncTimestamp={catalog.lastSyncedAt || ''}
          status={featuredLane?.authorityState.status || 'UNKNOWN'}
          confidence={featuredLane?.confidenceScore}
        />

        {featuredLane ? <FlagshipBlock lane={featuredLane} /> : null}
        <ConstellationGrid />
        <ProofLogic />
      </main>

      <Footer />
    </div>
  );
}
