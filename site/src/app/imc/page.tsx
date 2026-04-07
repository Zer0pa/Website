import type { Metadata } from 'next';
import Link from 'next/link';
import { Courier_Prime, Oswald } from 'next/font/google';
import StructuredData from '@/components/seo/StructuredData';
import { loadLaneBySlug, loadLaneCatalog, laneSlug } from '@/lib/data/lane-data';
import {
  descriptorForLane,
  selectPrimaryMetrics,
  selectProofAnchors,
  buildTerminalLines,
  buildRelatedLanes,
  displayAuthorityAsset,
  buildAuthorityMetaRows,
  selectAssertionDeck,
  selectNonClaimDeck,
  selectRepoHighlights,
  cleanDisplayText,
} from '@/lib/data/presentation';
import { canonicalUrl, summarizeDescription } from '@/lib/seo';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-oswald-next',
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier-next',
});

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const lane = await loadLaneBySlug('imc');

  if (!lane) {
    return {
      title: 'ZPE-IMC | ZER0PA',
      description: 'Flagship authority dossier for ZPE-IMC is currently unavailable.',
      alternates: { canonical: '/imc' },
    };
  }

  return {
    title: `${lane.laneIdentifier} | ZER0PA`,
    description: summarizeDescription(
      lane.tagline || lane.authorityState.summary || `Flagship authority dossier for ${lane.laneIdentifier}.`,
    ),
    alternates: { canonical: '/imc' },
  };
}

export default async function ImcPage() {
  const [catalog, lane] = await Promise.all([loadLaneCatalog(), loadLaneBySlug('imc')]);

  if (!lane) {
    return (
      <div className={`${oswald.variable} ${courierPrime.variable} dark`}>
        <header className="fixed top-0 w-full border-b-[1px] border-white/30 bg-[#000000] text-white flex justify-between items-center px-6 py-4 h-16 z-50">
          <Link href="/" className="text-2xl font-medium font-oswald text-white tracking-widest uppercase">ZER0PA.AI</Link>
        </header>
        <main className="min-h-screen flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
          <div className="border border-[#393939] bg-surface-container-low p-8 mt-12">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-[#474747]">
              [ FLAGSHIP_SURFACE_UNAVAILABLE ]
            </p>
            <h1 className="mt-6 font-oswald text-[4rem] font-bold uppercase leading-[0.85] tracking-tighter text-white">
              ZPE-IMC
            </h1>
            <p className="mt-6 max-w-2xl font-mono text-sm uppercase leading-6 text-on-surface-variant">
              THE FLAGSHIP SURFACE COULD NOT LOAD A CURRENT PACKET. THIS REQUIRES DATA PIPELINE
              ATTENTION BEFORE RELEASE.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const metrics = selectPrimaryMetrics(lane, 4);
  const assertions = selectAssertionDeck(lane, 3);
  const nonClaims = selectNonClaimDeck(lane, 4);
  const terminalLines = buildTerminalLines(lane, 6);
  const relatedLanes = buildRelatedLanes(lane, catalog.lanes, 3);
  const proofAnchors = selectProofAnchors(lane, 2);
  const repoHighlights = selectRepoHighlights(lane, 2);
  const authorityMeta = buildAuthorityMetaRows(lane);

  return (
    <div className={`${oswald.variable} ${courierPrime.variable} dark`}>
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

      {/* TopNavBar */}
      <header className="fixed top-0 w-full border-b-[1px] border-white/30 bg-[#000000] text-white flex justify-between items-center px-6 py-4 h-16 z-50">
        <Link href="/" className="text-2xl font-medium font-oswald text-white tracking-widest uppercase">ZER0PA.AI</Link>
        <nav className="hidden md:flex gap-8 font-mono text-[0.875rem] uppercase tracking-tighter items-center">
          <Link className="text-white border-b border-white pb-1 px-2" href="/imc">ARCHIVE</Link>
          <Link className="text-white/60 hover:text-white transition-opacity hover:bg-white/10 px-2 py-1" href="/work">INTEL</Link>
          <Link className="text-white/60 hover:text-white transition-opacity hover:bg-white/10 px-2 py-1" href="/proof">DECRYPT</Link>
          <Link className="text-white/60 hover:text-white transition-opacity hover:bg-white/10 px-2 py-1" href="/about">TERMINAL</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/imc"
            className="bg-white text-black font-mono text-[0.875rem] px-4 py-2 uppercase tracking-tighter active:scale-95 transition-all"
          >
            INITIALIZE_SYSTEM
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">

        {/* 1. Hero + Masthead */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-outline-variant/30 pb-4">
            <h1 className="font-oswald text-[4rem] md:text-[7rem] leading-none tracking-tighter uppercase font-medium">
              {lane.laneIdentifier}
            </h1>
            <div className="text-right font-mono text-secondary text-sm">
              {authorityMeta.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Subject Identity + 3. Authority State */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-7">
            <div className="text-secondary text-[0.6875rem] mb-4 uppercase tracking-widest font-mono">{'// SUBJECT_IDENTITY'}</div>
            <p className="text-secondary text-lg leading-relaxed font-mono">
              {cleanDisplayText(descriptorForLane(lane, 400))}
            </p>
          </div>
          <div className="md:col-span-5 border-l border-outline-variant/30 pl-8">
            <div className="text-secondary text-[0.6875rem] mb-4 uppercase tracking-widest font-mono">{'// AUTHORITY_STATE'}</div>
            <div className="text-primary font-mono text-2xl uppercase font-bold">
              {displayAuthorityAsset(lane)}
            </div>
            <div className="mt-4 space-y-2">
              {lane.commitSha && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-secondary">COMMIT_SHA</span>
                  <span className="text-primary">{lane.commitSha.slice(0, 16)}...</span>
                </div>
              )}
              {lane.syncedAt && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-secondary">TIMESTAMP</span>
                  <span className="text-primary">{lane.syncedAt.slice(0, 19).replace('T', '_')}_UTC</span>
                </div>
              )}
              {lane.confidenceScore != null && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-secondary">CONFIDENCE</span>
                  <span className="text-primary">{lane.confidenceScore}%</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Headline Metrics */}
        {metrics.length > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-surface-container-low p-6 border border-outline-variant/20">
                <div className="text-secondary text-[0.6875rem] uppercase mb-1">{metric.label}</div>
                <div className="text-white text-3xl font-mono">{metric.valueRaw}</div>
              </div>
            ))}
          </section>
        )}

        {/* 5. Proof Assertions + 6. Explicit Non-Claims */}
        {(assertions.length > 0 || nonClaims.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {assertions.length > 0 && (
              <div className="space-y-4">
                <div className="text-secondary text-[0.6875rem] mb-2 uppercase tracking-widest font-mono">{'// PROOF_ASSERTIONS'}</div>
                {assertions.map((item) => (
                  <div key={item} className="flex items-center gap-4 bg-surface-container-low p-4">
                    <span className="bg-white text-black px-2 py-0.5 text-xs font-bold shrink-0">PASS</span>
                    <span className="text-sm font-mono uppercase tracking-tighter">{item}</span>
                  </div>
                ))}
              </div>
            )}
            {nonClaims.length > 0 && (
              <div
                className="space-y-4 border border-error/20 p-6"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(255, 180, 171, 0.1), rgba(255, 180, 171, 0.1) 10px, transparent 10px, transparent 20px)',
                }}
              >
                <div className="text-error text-[0.6875rem] mb-2 uppercase tracking-widest font-mono">{'// EXPLICIT_NON_CLAIMS'}</div>
                <ul className="space-y-3 font-mono text-sm text-error">
                  {nonClaims.map((item) => (
                    <li key={item}>[!!] {item.toUpperCase()}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Modality Status Snapshot */}
        {lane.modalityStatus && lane.modalityStatus.length > 0 && (
          <section className="mb-20 bg-surface-container-lowest p-8 border-l-4 border-primary">
            <h2 className="font-oswald text-2xl uppercase tracking-widest mb-6">
              Modality Status Snapshot (Radical Honesty)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {lane.modalityStatus.slice(0, 3).map((modality) => {
                const isPass = /pass|green|supported/i.test(modality.rawStatus);
                const isFail = /fail|red|blocked/i.test(modality.rawStatus);
                return (
                  <div key={modality.modalityName} className="space-y-4">
                    <div className="text-xs text-secondary border-b border-outline-variant/30 pb-1">
                      {cleanDisplayText(modality.modalityName).toUpperCase()}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-mono">STATUS</span>
                      {isPass ? (
                        <span className="text-xs bg-white text-black px-2">GREEN/PASS</span>
                      ) : isFail ? (
                        <span className="text-xs border border-error text-error px-2">RED/FAIL</span>
                      ) : (
                        <span className="text-xs border border-white/50 text-white/50 px-2">
                          {cleanDisplayText(modality.rawStatus).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Evidence Routes + 8. Repo Shape */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <div className="text-secondary text-[0.6875rem] mb-6 uppercase tracking-widest font-mono">{'// EVIDENCE_ROUTES'}</div>
            <div className="relative aspect-video bg-surface-container-high overflow-hidden" data-slot="evidence-visual">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-oswald text-7xl font-bold text-white opacity-5 select-none">ZPE</div>
              </div>
              {proofAnchors[0] && (
                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/50 bg-black/60 p-2">
                  ANCHOR: {proofAnchors[0].path}<br />
                  SENSOR_ID: S-099_{lane.laneIdentifier}_PRIMARY
                </div>
              )}
            </div>
          </div>
          <div className="bg-surface-container-low p-6 border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="text-secondary text-[0.6875rem] mb-4 uppercase tracking-widest font-mono">{'// REPO_SHAPE'}</div>
              <p className="text-sm text-secondary mb-6 leading-relaxed font-mono">
                {lane.repoUrl
                  ? `REPOSITORY: ${lane.repoUrl.replace('https://github.com/', '')}`
                  : `AUTHORITY SOURCE: ${lane.authorityState.sourceFile || 'README.md'}`}
                {lane.commitSha ? ` // COMMIT: ${lane.commitSha.slice(0, 8)}` : ''}
              </p>
              <div className="space-y-2">
                {repoHighlights.map((path) => (
                  <div key={path} className="p-2 border border-outline-variant/20 hover:border-white cursor-pointer group transition-colors">
                    <span className="text-xs text-white group-hover:underline font-mono">{path.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
            {lane.repoUrl ? (
              <a
                href={lane.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 border border-white text-white py-3 font-oswald text-sm tracking-widest hover:bg-white hover:text-black transition-all text-center block"
              >
                ACCESS_REPOSITORY
              </a>
            ) : (
              <div className="mt-8 border border-outline-variant text-outline py-3 font-oswald text-sm tracking-widest text-center">
                REPO_URL_PENDING
              </div>
            )}
          </div>
        </section>

        {/* Proof Anchor Terminal */}
        <section className="mb-20">
          <div className="bg-black border border-white/20 font-mono text-sm p-4 h-64 overflow-y-auto">
            <div className="text-secondary mb-4">[ PROOF_ANCHOR_TERMINAL_V1.0 ]</div>
            <div className="space-y-1">
              {terminalLines.map((line) => (
                <p key={line} className="text-white">
                  <span className="text-secondary">{line.split(' ->')[0]}</span>
                  {' ->'}{line.split(' ->').slice(1).join(' ->')}
                </p>
              ))}
              <p className="text-white animate-pulse">_</p>
            </div>
          </div>
        </section>

        {/* 9. Related Lanes */}
        {relatedLanes.length > 0 && (
          <section className="mb-20">
            <div className="text-secondary text-[0.6875rem] mb-6 uppercase tracking-widest font-mono">{'// RELATED_LANES'}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedLanes.map((related) => (
                <Link
                  key={related.laneIdentifier}
                  href={`/work/${laneSlug(related.laneIdentifier)}`}
                  className="bg-surface-container-low p-4 border border-outline-variant/20 hover:border-primary transition-all"
                >
                  <div className="text-xs text-secondary mb-2 font-mono">{related.laneIdentifier}</div>
                  <div className="font-oswald text-lg uppercase">
                    {cleanDisplayText(related.laneTitle || related.laneIdentifier)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 10. Partnership CTA */}
        <section className="border-t border-white py-16 flex flex-col items-center text-center">
          <h2 className="font-oswald text-4xl uppercase mb-6 tracking-tighter">SECURE THE EVIDENCE. JOIN THE CLUSTER.</h2>
          <p className="font-mono text-secondary max-w-2xl mb-10">
            Institutional access grants direct API hooks into the {lane.laneIdentifier} hardware layer. Real-time verification for state actors and tier-1 labs.
          </p>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Link
              href="/contact"
              className="bg-white text-black px-12 py-4 font-mono font-bold uppercase text-sm tracking-widest active:scale-95 transition-all"
            >
              INITIATE_PARTNERSHIP
            </Link>
            <Link
              href="/proof"
              className="border border-white text-white px-12 py-4 font-mono font-bold uppercase text-sm tracking-widest hover:bg-white/10 active:scale-95 transition-all"
            >
              DOWNLOAD_WHITE_PAPER
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-[1px] border-white/30 bg-[#000000] text-white/30 font-mono text-[0.6875rem] leading-none uppercase">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-4">
          <div className="font-oswald text-white text-lg">ZER0PA.AI</div>
          <div className="flex gap-6">
            <a className="hover:text-white underline" href="#">ENCRYPTION_PROVISIONS</a>
            <a className="hover:text-white underline" href="#">DATA_PRIVACY</a>
            <a className="hover:text-white underline" href="#">SYSTEM_LOGS</a>
            <a className="hover:text-white underline" href="#">AUTH_PROTOCOL</a>
          </div>
          <div>{'© 2024 ZER0PA.AI // ALL RIGHTS RESERVED. STATUS: OPTIMAL'}</div>
        </div>
      </footer>
    </div>
  );
}
