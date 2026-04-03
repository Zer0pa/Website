import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LaneAuthorityPage from '@/components/lane/LaneAuthorityPage';
import StructuredData from '@/components/seo/StructuredData';
import { loadLaneBySlug, loadLaneCatalog, laneSlug } from '@/lib/data/lane-data';
import { canonicalUrl, summarizeDescription } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const lane = await loadLaneBySlug(params.slug);

  if (!lane) {
    return {
      title: 'Authority Dossier Missing | ZER0PA',
      description: 'Requested authority dossier could not be resolved from the live packet set.',
      alternates: {
        canonical: `/work/${params.slug}`,
      },
    };
  }

  return {
    title: `${lane.laneIdentifier} | ZER0PA`,
    description: summarizeDescription(
      lane.tagline || lane.authorityState.summary || `Authority dossier for ${lane.laneIdentifier}.`,
    ),
    alternates: {
      canonical: `/work/${laneSlug(lane.laneIdentifier)}`,
    },
  };
}

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
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: lane.laneIdentifier,
          url: canonicalUrl(`/work/${laneSlug(lane.laneIdentifier)}`),
          description: summarizeDescription(
            lane.tagline || lane.authorityState.summary || `Authority dossier for ${lane.laneIdentifier}.`,
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
              lane.tagline || lane.authorityState.summary || `Authority dossier for ${lane.laneIdentifier}.`,
            ),
          },
        }}
      />
      <LaneAuthorityPage lane={lane} lanes={catalog.lanes} />
      <Footer />
    </div>
  );
}
