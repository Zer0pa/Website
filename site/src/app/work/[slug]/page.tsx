import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LaneAuthorityPage from '@/components/lane/LaneAuthorityPage';
import { loadLaneBySlug, loadLaneCatalog } from '@/lib/data/lane-data';

export const dynamic = 'force-dynamic';

export default async function WorkLanePage({
  params,
}: {
  params: { slug: string };
}) {
  const [catalog, lane] = await Promise.all([loadLaneCatalog(), loadLaneBySlug(params.slug)]);

  if (!lane) {
    return (
      <div className="substrate">
        <Header variant="product" />
        <main className="page-shell page-section simple-page">
          <p className="section-label">[ AUTHORITY_DOSSIER_MISSING ]</p>
          <h1 className="lane-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
            ROUTE NOT FOUND
          </h1>
          <p className="page-intro" style={{ marginTop: '1rem' }}>
            NO LIVE PACKET COULD BE RESOLVED FOR THIS LANE. THIS IS AN HONEST DEGRADED STATE, NOT A
            FABRICATED FALLBACK.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="substrate">
      <Header variant="product" />
      <LaneAuthorityPage lane={lane} lanes={catalog.lanes} />
      <Footer />
    </div>
  );
}
