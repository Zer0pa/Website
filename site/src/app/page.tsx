import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FlagshipBlock from '@/components/home/FlagshipBlock';
import ConstellationGrid from '@/components/home/ConstellationGrid';
import ProofLogic from '@/components/home/ProofLogic';
import { loadLaneCatalog } from '@/lib/data/lane-data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const catalog = await loadLaneCatalog();
  const featuredLane = catalog.featuredLane || catalog.lanes[0] || null;

  return (
    <div className="substrate">
      <Header variant="landing" />

      <Hero
        syncTimestamp={catalog.lastSyncedAt || ''}
        status={featuredLane?.authorityState.status || 'UNKNOWN'}
        confidence={featuredLane?.confidenceScore}
      />

      {featuredLane ? <FlagshipBlock lane={featuredLane} /> : null}
      <ConstellationGrid />
      <ProofLogic />

      <Footer />
    </div>
  );
}
