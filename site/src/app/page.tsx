import type { Metadata } from 'next';
import Link from 'next/link';
import { Courier_Prime, Oswald } from 'next/font/google';
import StructuredData from '@/components/seo/StructuredData';
import { loadLaneCatalog, laneSlug } from '@/lib/data/lane-data';
import {
  descriptorForLane,
  selectPrimaryMetrics,
  flagshipDisplayName,
  displayAuthorityAsset,
  cleanDisplayText,
} from '@/lib/data/presentation';
import { canonicalUrl } from '@/lib/seo';

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

export const metadata: Metadata = {
  title: 'ZER0PA // THE DOSSIER',
  description: 'Proof-first authority surface for Zero-Point Architecture.',
  alternates: {
    canonical: '/',
  },
};

function padIndex(n: number) {
  return String(n + 1).padStart(3, '0');
}

export default async function HomePage() {
  const catalog = await loadLaneCatalog();
  const featuredLane = catalog.featuredLane || catalog.lanes[0] || null;
  const featuredMetrics = featuredLane ? selectPrimaryMetrics(featuredLane, 3) : [];
  const constellationLanes = catalog.lanes.slice(0, 4);

  return (
    <div className={`${oswald.variable} ${courierPrime.variable} dark`}>
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

      {/* TopAppBar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-8 h-16 bg-[#131313] border-b border-[#474747]/20 z-50">
        <div className="flex items-center gap-8">
          <span className="font-oswald text-2xl font-medium tracking-tighter text-white uppercase">ZER0PA</span>
          <nav className="hidden md:flex items-center gap-6 text-[10px] tracking-[0.2em]">
            <Link className="text-white border-b-2 border-white pb-1 font-bold" href="/imc">/IMC</Link>
            <Link className="text-[#C7C6C6] font-normal hover:text-white transition-colors" href="/work">/WORK</Link>
            <Link className="text-[#C7C6C6] font-normal hover:text-white transition-colors" href="/proof">/PROOF</Link>
            <Link className="text-[#C7C6C6] font-normal hover:text-white transition-colors" href="/about">/ABOUT</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white text-xl">&#x2318;</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-8 max-w-[1400px] mx-auto">
        {/* Hero Section */}
        <section className="mb-24 grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <span className="h-2 w-2 bg-primary animate-pulse"></span>
              <span className="text-[10px] tracking-widest font-bold">SYSTEM_STATUS: LIVE_DECRYPTION</span>
            </div>
            <h1 className="font-oswald text-5xl md:text-7xl lg:text-8xl leading-[0.9] font-bold uppercase tracking-tighter mb-8">
              ZERO-POINT ARCHITECTURE:<br />
              <span className="text-outline-variant">PROOF-FIRST</span> TECHNICAL SURFACE
            </h1>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <p className="max-w-md text-sm text-secondary leading-relaxed">
                DIRECT ACCESS TO THE ZER0PA SUBSTRATE. THIS INTERFACE REPRESENTS THE UNSANITIZED TECHNICAL TELEMETRY OF OUR COMPUTE LAYER. EVERY DATA POINT IS DETERMINISTIC.
              </p>
              <Link
                href="/imc"
                className="px-8 py-3 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-secondary transition-all active:scale-95"
              >
                INITIALIZE_SYSTEM
              </Link>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 border-l border-outline-variant/30 pl-8 pb-2">
            <div className="text-[10px] text-secondary space-y-2">
              {featuredMetrics.length > 0 ? (
                featuredMetrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>{metric.label}</span>
                    <span className="text-white">{metric.valueRaw}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>LATENCY_SIGMA</span>
                    <span className="text-white">0.00042MS</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>TRUTH_COEFFICIENT</span>
                    <span className="text-white">1.00000000</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>ENTROPY_VOID</span>
                    <span className="text-white">STABLE</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Flagship Block: The Dossier */}
        {featuredLane && (
          <section className="mb-24">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="font-oswald text-2xl font-bold tracking-tighter uppercase">
                {featuredLane.laneIdentifier}_DOSSIER_001
              </h2>
              <div className="h-[1px] flex-grow bg-outline-variant/20"></div>
              <span className="text-[10px] text-outline">
                REF: {featuredLane.laneIdentifier}_PRIMARY_VOID
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-outline-variant/20">
              {/* Data Stream Column */}
              <div className="p-6 bg-surface-container-low border-r border-outline-variant/20 flex flex-col gap-8">
                <div className="aspect-video relative overflow-hidden bg-black group" data-slot="lane-visual">
                  <div className="absolute inset-0 bg-[#1b1b1b] flex items-center justify-center">
                    <span className="font-oswald text-6xl font-bold text-white opacity-10">
                      {featuredLane.laneIdentifier.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-error"></span>
                    <span className="w-1.5 h-1.5 bg-white"></span>
                    <span className="w-1.5 h-1.5 bg-outline"></span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white tracking-widest border-b border-outline-variant/50 pb-2">
                    TELEMETRY_STREAM
                  </h3>
                  <div className="text-[10px] text-secondary leading-tight space-y-1 font-mono">
                    <p className="text-primary">[SYS] HANDSHAKE_INITIATED</p>
                    <p>[SYS] {featuredLane.laneIdentifier}_SUBSTRATE_VERIFIED</p>
                    <p>[SYS] STATE: {featuredLane.authorityState.status}</p>
                    <p>[SYS] CONFIDENCE: {featuredLane.confidenceScore ? `${featuredLane.confidenceScore}%` : 'NOMINAL'}</p>
                    {featuredLane.commitSha && (
                      <p className="truncate">[SHA] {featuredLane.commitSha.slice(0, 16)}...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Central Analysis */}
              <div className="p-8 md:col-span-2 bg-surface flex flex-col">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <span className="text-[10px] text-outline block mb-1">MODULE_IDENTIFIER</span>
                    <h3 className="font-oswald text-3xl font-bold text-white tracking-tighter">
                      {flagshipDisplayName(featuredLane)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-outline block mb-1">AUTHORITY_ASSET</span>
                    <span className="text-white font-bold text-sm">
                      {displayAuthorityAsset(featuredLane)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12 mb-auto">
                  <div>
                    <p className="text-xs text-secondary leading-relaxed mb-6">
                      {cleanDisplayText(
                        descriptorForLane(featuredLane, 200)
                      ).toUpperCase()}
                    </p>
                    {featuredMetrics[0] && (
                      <div className="space-y-4">
                        <div className="h-1 bg-surface-container-highest w-full relative">
                          <div className="absolute left-0 top-0 h-full bg-white w-3/4"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{featuredMetrics[0].label}</span>
                          <span>{featuredMetrics[0].valueRaw}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {featuredMetrics.slice(1, 3).map((metric) => (
                      <div key={metric.label} className="p-4 border border-outline-variant/10">
                        <span className="text-[10px] text-outline block">{metric.label}</span>
                        <span className="text-xl font-oswald font-bold text-white">{metric.valueRaw}</span>
                      </div>
                    ))}
                    {featuredMetrics.length < 2 && (
                      <div className="p-4 border border-outline-variant/10">
                        <span className="text-[10px] text-outline block">STATUS</span>
                        <span className="text-xl font-oswald font-bold text-white">
                          {featuredLane.authorityState.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-12 flex justify-end gap-4">
                  <Link
                    href="/work"
                    className="px-6 py-2 border border-outline-variant text-[10px] font-bold tracking-widest hover:border-white transition-colors"
                  >
                    VIEW_ALL_LANES
                  </Link>
                  <Link
                    href={`/work/${laneSlug(featuredLane.laneIdentifier)}`}
                    className="px-6 py-2 bg-white text-black text-[10px] font-bold tracking-widest"
                  >
                    ACCESS_DOSSIER
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Constellation Grid: Technical Index */}
        <section className="mb-24">
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="font-oswald text-2xl font-bold tracking-tighter uppercase">
              SYSTEM_COMPONENTS_INDEX
            </h2>
            <div className="h-[1px] flex-grow bg-outline-variant/20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {constellationLanes.length > 0 ? (
              constellationLanes.map((lane, i) => (
                <Link
                  key={lane.laneIdentifier}
                  href={`/work/${laneSlug(lane.laneIdentifier)}`}
                  className="p-6 bg-surface-container-low group hover:bg-surface-bright transition-all cursor-pointer block"
                >
                  <span className="text-xs font-bold text-outline block mb-8">
                    {padIndex(i)}_{lane.laneIdentifier.replace(/^ZPE-/, '')}
                  </span>
                  <h4 className="font-oswald text-xl font-bold text-white mb-4 uppercase">
                    {cleanDisplayText(lane.laneTitle || lane.laneIdentifier)}
                  </h4>
                  <p className="text-[10px] text-secondary leading-relaxed mb-8">
                    {descriptorForLane(lane, 100).toUpperCase()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest text-white">
                      {lane.authorityState.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              /* Static fallback cards from Stitch HTML */
              <>
                <div className="p-6 bg-surface-container-low group hover:bg-surface-bright transition-all cursor-pointer">
                  <span className="text-xs font-bold text-outline block mb-8">001_CORE</span>
                  <h4 className="font-oswald text-xl font-bold text-white mb-4">NEURAL_VOID</h4>
                  <p className="text-[10px] text-secondary leading-relaxed mb-8">ASYMMETRIC PROCESSING ENGINE FOR NON-LINEAR COMPUTATIONAL MODELS.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest">ENCRYPTED</span>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low group hover:bg-surface-bright transition-all cursor-pointer">
                  <span className="text-xs font-bold text-outline block mb-8">002_LINK</span>
                  <h4 className="font-oswald text-xl font-bold text-white mb-4">SIGNAL_FABRIC</h4>
                  <p className="text-[10px] text-secondary leading-relaxed mb-8">ZERO-LATENCY INTERCONNECT BETWEEN DISTRIBUTED IMC NODES.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest">ACTIVE</span>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low group hover:bg-surface-bright transition-all cursor-pointer">
                  <span className="text-xs font-bold text-outline block mb-8">003_LOG</span>
                  <h4 className="font-oswald text-xl font-bold text-white mb-4">ETERNAL_LEDGER</h4>
                  <p className="text-[10px] text-secondary leading-relaxed mb-8">IMMUTABLE RECORD OF ALL DETERMINISTIC REPLAYS AND AUDITS.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest">READ_ONLY</span>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-low group hover:bg-surface-bright transition-all cursor-pointer">
                  <span className="text-xs font-bold text-outline block mb-8">004_SHIELD</span>
                  <h4 className="font-oswald text-xl font-bold text-white mb-4">VOID_SENTRY</h4>
                  <p className="text-[10px] text-secondary leading-relaxed mb-8">CRYPTOGRAPHIC HARDENING LAYER AGAINST ADVERSARIAL ATTACKS.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-widest">DEFENSIVE</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Architecture Explainer & Proof Logic */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="font-oswald text-4xl font-bold text-white tracking-tighter uppercase">PROOF_LOGIC</h2>
            </div>
            <div className="space-y-6">
              <div className="p-6 border-l-2 border-white bg-surface-container-low">
                <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">EVIDENCE_MODEL_ALPHA</h5>
                <p className="text-xs text-secondary leading-relaxed">
                  UNLIKE TRADITIONAL AUDITS, ZER0PA USES MATHEMATICAL PROOF ROOTS. EVERY COMPUTATION IS ACCOMPANIED BY A ZK-CERTIFICATE (ZERO-KNOWLEDGE) THAT ENSURES INTEGRITY WITHOUT REVEALING PRIVATE DATA.
                </p>
              </div>
              <div className="p-6 border-l-2 border-outline-variant bg-surface-container-low">
                <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">AUDIT_ROUTES</h5>
                <p className="text-xs text-secondary leading-relaxed">
                  INSTANTANEOUS VERIFICATION OF STATE ROOTS VIA THE ETERNAL_LEDGER. ACCESS THE PUBLIC ANCHOR TO INDEPENDENTLY VERIFY SYSTEM STATE.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-surface-container-high aspect-square flex items-center justify-center border border-outline-variant/20">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            ></div>
            <div className="relative z-10 text-center" data-slot="proof-visual">
              <div className="font-oswald text-9xl font-bold text-white opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">0</div>
              <p className="font-oswald text-sm font-bold tracking-[0.5em] text-white uppercase relative z-20">SINGULARITY_REACHED</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-8 bg-[#131313] border-t border-[#474747]/20">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <span className="text-white font-bold text-xs font-oswald tracking-widest">ZER0PA</span>
          <span className="text-[#474747] text-[10px] tracking-widest uppercase">
            © 2024 ZER0PA. AUTHORITY LOGIC V1.0.4
            {catalog.lastSyncedAt ? ` // SYNC: ${catalog.lastSyncedAt.slice(0, 10)}` : ''}
          </span>
        </div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a className="text-[#474747] text-[10px] tracking-widest hover:text-white transition-colors uppercase" href="#">SYSTEM_STATUS</a>
          <a className="text-[#474747] text-[10px] tracking-widest hover:text-white transition-colors uppercase" href="#">PARTNERSHIPS</a>
          <a className="text-[#474747] text-[10px] tracking-widest hover:text-white transition-colors uppercase" href="#">LEGAL_PROVISIONS</a>
        </div>
      </footer>

      {/* Terminal Overlay Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-[100]" style={{ width: '100%', height: '2px', background: 'rgba(255, 255, 255, 0.03)', position: 'fixed', top: 0, left: 0 }}></div>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99]" style={{ background: 'radial-gradient(circle, transparent 20%, #000 150%)' }}></div>
    </div>
  );
}
