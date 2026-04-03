import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ConstellationGrid from '@/components/home/ConstellationGrid';
import { loadLaneCatalog } from '@/lib/data/lane-data';

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  const catalog = await loadLaneCatalog();

  return (
    <div className="substrate">
      <Header />

      <main className="page-shell page-section simple-page">
        <p className="section-label">[ SYSTEM_COMPONENTS_DIRECTORY ]</p>
        <h1 className="lane-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
          WORK
        </h1>
        <p className="page-intro" style={{ marginTop: '1rem' }}>
          LIVE LANES, EACH WITH A BOUNDED AUTHORITY STATE. THIS INDEX IS FED BY CURRENT PACKETS,
          NOT HANDWRITTEN MARKETING COPY.
        </p>
      </main>

      <ConstellationGrid lanes={catalog.lanes} />
      <Footer />
    </div>
  );
}
