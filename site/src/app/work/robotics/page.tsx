import type { Metadata } from 'next';
import Link from 'next/link';

// Static route — takes precedence over the dynamic /work/[slug] for robotics.
// Source of truth: github.com/Zer0pa/ZPE-Robotics (public).
// Rebuild every hour; a manual Vercel redeploy also refreshes.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'ZPE-Robotics | ZER0PA',
  description:
    'Motion telemetry infrastructure — deterministic logging, compressed replay, and search-without-decode for robot joint streams. 187× real-data compression. Blocker-state engineering.',
  alternates: { canonical: '/work/robotics' },
};

const REPO = 'Zer0pa/ZPE-Robotics';
const RAW = `https://raw.githubusercontent.com/${REPO}/main`;
const BLOB = `https://github.com/${REPO}/blob/main`;

async function fetchRepoFile(path: string): Promise<string> {
  try {
    const res = await fetch(`${RAW}/${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}

// --- Tiny README extractors (regex, forgiving, no markdown parser) ---

function extractSection(md: string, heading: string): string {
  // Match "## Heading" through the next "## " or end of file
  const re = new RegExp(`##\\s+${heading}[\\s\\S]*?(?=\\n## |$)`, 'i');
  const m = md.match(re);
  return m ? m[0].replace(new RegExp(`##\\s+${heading}\\s*`, 'i'), '').trim() : '';
}

function firstParagraph(section: string): string {
  // Skip HTML blocks and markdown tables/images, return first real prose paragraph.
  const blocks = section.split(/\n\n+/);
  for (const b of blocks) {
    const t = b.trim();
    if (!t) continue;
    if (t.startsWith('<') || t.startsWith('|') || t.startsWith('!') || t.startsWith('[')) continue;
    if (t.startsWith('#')) continue;
    // Strip markdown links/emphasis lightly
    return t.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }
  return '';
}

function parseLaneStatus(md: string): Record<string, string> {
  // The "LANE STATUS SNAPSHOT" block in the README is a markdown table of
  // "| Surface | Current truth |". Grab rows that start with `|` inside it.
  const out: Record<string, string> = {};
  const snap = md.match(/LANE STATUS SNAPSHOT[\s\S]*?(?=\n<p>|\n## |$)/i);
  if (!snap) return out;
  const lines = snap[0].split('\n').filter((l) => l.trim().startsWith('|'));
  for (const line of lines) {
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length !== 2) continue;
    const [k, v] = cells;
    if (!k || !v || /^-+$/.test(k) || /surface/i.test(k)) continue;
    out[k] = v.replace(/`/g, '');
  }
  return out;
}

function extractNotClaimed(md: string): string[] {
  const m = md.match(/\*\*Not claimed:\*\*\s*([^\n]+)/i);
  if (!m) return [];
  return m[1]
    .replace(/\.$/, '')
    .split(/,| or /)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------

export default async function RoboticsPage() {
  const readme = await fetchRepoFile('README.md');

  const whatThisIs = firstParagraph(extractSection(readme, 'What This Is')) ||
    'ZPE-Robotics is motion telemetry infrastructure — deterministic logging, compressed replay, and search-without-decode for robot joint streams.';

  const status = parseLaneStatus(readme);
  const nonClaims = extractNotClaimed(readme);

  const benchmark = status['Real-data benchmark'] || '187.1345x on lerobot/columbia_cairlab_pusht_real';
  const benchmarkValue = benchmark.match(/([\d.]+x)/i)?.[1] || '187.13×';
  const gates = status['Benchmark gates'] || 'B1, B2, B4, and B5 pass; B3 fails';
  const redteam = status['Red-team'] || 'attacks 1, 2, and 6 withstand; 4 partially; 3 and 5 fail; 7 open';
  const releaseVerdict = status['Release-ready verdict'] || 'not authorized';
  const searchability = status['Searchability'] || 'supported without decode on the benchmark surface';

  const evidenceFiles = [
    { label: 'Engineering blockers', path: 'proofs/ENGINEERING_BLOCKERS.md' },
    { label: 'Benchmark gate verdicts', path: 'proofs/enterprise_benchmark/GATE_VERDICTS.json' },
    { label: 'Red-team report', path: 'proofs/red_team/red_team_report.json' },
    { label: 'Technical release surface', path: 'proofs/runbooks/TECHNICAL_RELEASE_SURFACE.md' },
    { label: 'Auditor playbook', path: 'docs/AUDITOR_PLAYBOOK.md' },
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-secondary antialiased overflow-x-hidden">
      {/* Decorative grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top nav */}
      <header className="fixed top-0 w-full bg-[#131313] text-white font-mono text-[0.875rem] uppercase tracking-tighter flex justify-between items-center px-6 py-4 h-16 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-medium font-oswald text-white tracking-widest">
            ZER0PA.AI
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/work" className="text-[#C7C6C6] hover:text-white transition-colors">
              WORK
            </Link>
            <Link href="/imc" className="text-[#C7C6C6] hover:text-white transition-colors">
              IMC
            </Link>
            <Link href="/proof" className="text-[#C7C6C6] hover:text-white transition-colors">
              PROOF
            </Link>
            <Link href="/work/robotics" className="text-white border-b-2 border-white pb-1">
              ROBOTICS
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noreferrer"
            className="bg-white text-black px-4 py-1 font-bold text-xs tracking-widest hover:bg-[#C7C6C6] transition-all"
          >
            ACCESS_REPOSITORY
          </a>
        </div>
      </header>

      <div className="fixed top-16 left-0 bg-[#1B1B1B] h-[2px] w-full z-40" />

      <main className="relative z-10 pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* HERO */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-0 mb-20">
          <div className="md:col-span-8 flex flex-col justify-end">
            <p className="text-[0.6875rem] text-[#474747] uppercase font-bold tracking-[0.3em] mb-4">
              PRODUCT_FAMILY_LANE // 002-ROBOTICS
            </p>
            <h1 className="font-oswald text-[5rem] md:text-[8rem] leading-[0.85] text-white font-bold tracking-tighter">
              ZPE-ROBOTICS
            </h1>
            <div className="mt-6 flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FFB4AB]" />
                <span className="text-white font-bold tracking-widest text-sm">STATUS: BLOCKED</span>
              </div>
              <div className="text-[#474747] text-sm">
                REAL_DATA: <span className="text-white">{benchmarkValue}</span>
              </div>
              <div className="text-[#474747] text-sm">
                PACKAGE: <span className="text-white">pip install zpe-robotics</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end items-start pt-4">
            <div className="w-24 h-24 bg-white flex items-center justify-center">
              <span className="text-black font-oswald text-6xl font-bold">0</span>
            </div>
          </div>
        </section>

        {/* WHAT THIS IS */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
          <div className="md:col-span-4 border-l border-[#474747] pl-6 py-2">
            <span className="text-[0.6875rem] text-[#474747] uppercase font-bold tracking-widest block mb-4">
              IDENTIFIER // 002-ROBOTICS
            </span>
            <p className="text-white text-lg leading-relaxed">
              MOTION TELEMETRY INFRASTRUCTURE. DETERMINISTIC LOGGING, COMPRESSED REPLAY, AND
              SEARCH-WITHOUT-DECODE FOR ROBOT JOINT STREAMS.
            </p>
          </div>
          <div className="md:col-span-8 bg-surface-container-low p-8">
            <p className="text-on-surface-variant text-sm leading-6 uppercase">{whatThisIs}</p>
            <div className="mt-8 flex flex-wrap gap-8 border-t border-[#474747] pt-6">
              <div>
                <span className="block text-[0.6rem] text-[#474747]">WIRE_FORMAT</span>
                <span className="text-xs text-white">WIRE-V1 (FROZEN)</span>
              </div>
              <div>
                <span className="block text-[0.6rem] text-[#474747]">LICENSE</span>
                <span className="text-xs text-white">SAL v6.0</span>
              </div>
              <div>
                <span className="block text-[0.6rem] text-[#474747]">PACKAGE_STATE</span>
                <span className="text-xs text-white">PUBLIC · INSTALLABLE</span>
              </div>
              <div>
                <span className="block text-[0.6rem] text-[#474747]">ENGINEERING</span>
                <span className="text-xs text-[#FFB4AB]">BLOCKER_GOVERNED</span>
              </div>
            </div>
          </div>
        </section>

        {/* AUTHORITY METRICS */}
        <section className="mb-24">
          <h2 className="font-oswald text-2xl text-white mb-8 tracking-widest uppercase">
            AUTHORITY_METRICS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div className="bg-surface-container-low p-10 flex flex-col justify-between h-64 border border-transparent hover:border-white transition-all cursor-crosshair">
              <span className="text-[0.6875rem] text-[#474747] tracking-[0.3em]">
                REAL_DATA_COMPRESSION
              </span>
              <div className="text-5xl text-white font-bold">{benchmarkValue}</div>
              <span className="text-[0.6rem] text-[#474747]">
                lerobot/columbia_cairlab_pusht_real
              </span>
            </div>
            <div className="bg-surface-container-low p-10 flex flex-col justify-between h-64 border border-transparent hover:border-white transition-all cursor-crosshair">
              <span className="text-[0.6875rem] text-[#474747] tracking-[0.3em]">BENCHMARK_GATES</span>
              <div className="text-5xl text-white font-bold">
                4<span className="text-2xl text-[#474747]">/5</span>
              </div>
              <span className="text-[0.6rem] text-[#FFB4AB]">B3 FAILS — {gates}</span>
            </div>
            <div className="bg-surface-container-low p-10 flex flex-col justify-between h-64 border border-transparent hover:border-white transition-all cursor-crosshair">
              <span className="text-[0.6875rem] text-[#474747] tracking-[0.3em]">RED_TEAM_SURFACE</span>
              <div className="text-5xl text-white font-bold">
                3<span className="text-2xl text-[#474747]">/7</span>
              </div>
              <span className="text-[0.6rem] text-[#FFB4AB]">3 &amp; 5 FAIL · 7 OPEN</span>
            </div>
          </div>
        </section>

        {/* LANE STATUS TABLE + NON-CLAIMS */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
          <div className="md:col-span-7">
            <h2 className="font-oswald text-2xl text-white mb-8 tracking-widest uppercase">
              LANE_STATUS_SNAPSHOT
            </h2>
            <div className="bg-[#000] border border-[#393939]">
              <div className="bg-surface-container-high px-4 py-2 flex justify-between items-center">
                <span className="text-[0.6rem] text-white font-bold">
                  LIVE_FROM: github.com/{REPO}/README.md
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#474747]" />
                  <div className="w-2 h-2 bg-[#474747]" />
                </div>
              </div>
              <div className="p-6 font-mono text-[0.75rem] text-[#C7C6C6] leading-relaxed">
                {Object.entries(status).length === 0 ? (
                  <p className="text-[#474747]">
                    [no lane status table parsed from README — falling back to repo link]
                  </p>
                ) : (
                  Object.entries(status).map(([k, v]) => (
                    <div key={k} className="mb-3 flex gap-3">
                      <span className="text-[#474747] whitespace-nowrap">
                        [{k.toUpperCase().replace(/\s+/g, '_')}]
                      </span>
                      <span className="text-white">{v}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-6">
            <h2 className="font-oswald text-2xl text-white tracking-widest uppercase">
              EXPLICIT_NON_CLAIMS
            </h2>
            <div className="border-l-2 border-[#FFB4AB] pl-6 flex flex-col gap-4">
              {nonClaims.length === 0 ? (
                <p className="text-xs text-[#474747]">
                  [no explicit non-claims parsed from README]
                </p>
              ) : (
                nonClaims.map((c, i) => (
                  <div key={i} className="text-xs uppercase">
                    <span className="text-[#FFB4AB] mr-2">[!]</span>
                    <span className="text-[#C7C6C6]">{c}</span>
                  </div>
                ))
              )}
              <div className="text-xs uppercase pt-4 border-t border-[#474747]">
                <span className="text-[#474747] block mb-1">RELEASE_VERDICT</span>
                <span className="text-[#FFB4AB]">{releaseVerdict}</span>
              </div>
            </div>
          </div>
        </section>

        {/* EVIDENCE ROUTES */}
        <section className="mb-24">
          <h2 className="font-oswald text-2xl text-white mb-8 tracking-widest uppercase">
            EVIDENCE_ROUTES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {evidenceFiles.map((f) => (
              <a
                key={f.path}
                href={`${BLOB}/${f.path}`}
                target="_blank"
                rel="noreferrer"
                className="bg-surface-container-low p-6 border border-transparent hover:border-white transition-all group flex flex-col gap-2"
              >
                <span className="text-[0.6rem] text-[#474747] tracking-[0.3em] uppercase">
                  {f.label}
                </span>
                <span className="text-sm text-white font-mono group-hover:pl-2 transition-all">
                  {f.path}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#1B1B1B] pt-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <span className="text-white font-oswald text-xl tracking-widest uppercase">
              SECURE_THE_EVIDENCE:
            </span>
            <a
              href={`https://github.com/${REPO}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 bg-white text-black px-8 py-4 hover:bg-[#C7C6C6] transition-all font-bold uppercase tracking-widest"
            >
              ACCESS_REPOSITORY
            </a>
            <a
              href="https://pypi.org/project/zpe-robotics/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 bg-surface-container-low px-8 py-4 hover:bg-surface-bright transition-all font-bold uppercase tracking-widest text-white"
            >
              PIP_INSTALL
            </a>
            <Link
              href="/contact"
              className="flex items-center gap-4 bg-surface-container-low px-8 py-4 hover:bg-surface-bright transition-all font-bold uppercase tracking-widest text-white"
            >
              INITIATE_PARTNERSHIP
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-[#131313] text-[#C7C6C6] font-mono text-[0.6875rem] leading-none uppercase w-full border-t border-[#1B1B1B] flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-oswald text-white text-lg">ZER0PA.AI</span>
          <span className="text-[#474747]">{'// LANE: ZPE-ROBOTICS // STATUS: BLOCKER_GOVERNED'}</span>
        </div>
        <div className="text-[#474747]">
          DATA SOURCE: github.com/{REPO} (LIVE, REVALIDATE 1H)
        </div>
      </footer>
    </div>
  );
}
