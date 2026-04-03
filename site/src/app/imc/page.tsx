import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LaneAuthorityPage from '@/components/lane/LaneAuthorityPage';
import { loadLaneBySlug, loadLaneCatalog } from '@/lib/data/lane-data';

export const dynamic = 'force-dynamic';

export default async function ImcPage() {
  const [catalog, lane] = await Promise.all([loadLaneCatalog(), loadLaneBySlug('imc')]);

  if (!lane) {
    return (
      <div className="substrate">
        <Header variant="product" />
        <main className="page-shell page-section simple-page">
          <p className="section-label">[ FLAGSHIP_SURFACE_UNAVAILABLE ]</p>
          <h1 className="lane-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
            ZPE-IMC
          </h1>
          <p className="page-intro" style={{ marginTop: '1rem' }}>
            THE FLAGSHIP SURFACE COULD NOT LOAD A CURRENT PACKET. THIS REQUIRES DATA PIPELINE
            ATTENTION BEFORE RELEASE.
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
