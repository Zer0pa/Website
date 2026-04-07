import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LaneAuthorityPage from '@/components/lane/LaneAuthorityPage';
import StructuredData from '@/components/seo/StructuredData';
import { loadLaneBySlug, loadLaneCatalog } from '@/lib/data/lane-data';
import { canonicalUrl, summarizeDescription } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const lane = await loadLaneBySlug('imc');

  if (!lane) {
    return {
      title: 'ZPE-IMC | ZER0PA',
      description: 'Flagship authority dossier for ZPE-IMC is currently unavailable.',
      alternates: {
        canonical: '/imc',
      },
    };
  }

  return {
    title: `${lane.laneIdentifier} | ZER0PA`,
    description: summarizeDescription(
      lane.tagline || lane.authorityState.summary || `Flagship authority dossier for ${lane.laneIdentifier}.`,
    ),
    alternates: {
      canonical: '/imc',
    },
  };
}

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
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: lane.laneIdentifier,
          url: canonicalUrl('/imc'),
          description: summarizeDescription(
            lane.tagline || lane.authorityState.summary || `Flagship authority dossier for ${lane.laneIdentifier}.`,
          ),
          isPartOf: {
            '@type': 'WebSite',
            name: 'ZER0PA',
            url: canonicalUrl('/'),
          },
          mainEntity: {
            '@type': 'SoftwareSourceCode',
            name: lane.laneIdentifier,
            codeRepository: lane.repoUrl,
            description: summarizeDescription(
              lane.tagline || lane.authorityState.summary || `Flagship authority dossier for ${lane.laneIdentifier}.`,
            ),
          },
        }}
      />
      <LaneAuthorityPage lane={lane} lanes={catalog.lanes} specPrefix="imc" laneClassLabel="FLAGSHIP_LANE" />
      <Footer />
    </div>
  );
}
