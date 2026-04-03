import Link from 'next/link';
import type { LanePacket } from '@/lib/types/lane';
import { descriptorForLane, laneDisplayName } from '@/lib/data/presentation';

const SYSTEM_COMPONENTS = [
  {
    code: '001_CORE',
    title: 'NEURAL_VOID',
    copy: 'ASYMMETRIC PROCESSING ENGINE FOR NON-LINEAR COMPUTATIONAL MODELS.',
    status: 'ENCRYPTED',
  },
  {
    code: '002_LINK',
    title: 'SIGNAL_FABRIC',
    copy: 'ZERO-LATENCY INTERCONNECT BETWEEN DISTRIBUTED IMC NODES.',
    status: 'ACTIVE',
  },
  {
    code: '003_LOG',
    title: 'ETERNAL_LEDGER',
    copy: 'IMMUTABLE RECORD OF ALL DETERMINISTIC REPLAYS AND AUDITS.',
    status: 'READ_ONLY',
  },
  {
    code: '004_SHIELD',
    title: 'VOID_SENTRY',
    copy: 'CRYPTOGRAPHIC HARDENING LAYER AGAINST ADVERSARIAL ACCESS.',
    status: 'DEFENSIVE',
  },
];

export default function ConstellationGrid({ lanes }: { lanes?: LanePacket[] }) {
  const useLiveLanes = Boolean(lanes && lanes.length);

  return (
    <section className="system-index">
      <div className="page-shell page-section" data-spec="home.index.grid">
        <h2 className="section-title">SYSTEM_COMPONENTS_INDEX</h2>

        <div className="lane-grid lane-grid--systems">
          {useLiveLanes
            ? lanes!.map((lane, index) => (
                <Link
                  key={lane.laneIdentifier}
                  href={`/work/${lane.laneIdentifier.toLowerCase().replace(/^zpe-/, '')}`}
                  className="lane-card lane-card--system"
                >
                  <div className="lane-card-head">
                    <span className="lane-card-code">{String(index + 1).padStart(3, '0')}_LANE</span>
                  </div>

                  <h3 className="lane-card-title">{laneDisplayName(lane)}</h3>
                  <p className="lane-card-copy">{descriptorForLane(lane, 120)}</p>

                  <div className="lane-card-footer">
                    <span className="lane-card-status-dot" aria-hidden="true" />
                    <span>{lane.authorityState.status}</span>
                  </div>
                </Link>
              ))
            : SYSTEM_COMPONENTS.map((item) => (
                <article key={item.title} className="lane-card lane-card--system">
                  <div className="lane-card-head">
                    <span className="lane-card-code">{item.code}</span>
                  </div>

                  <h3 className="lane-card-title">{item.title}</h3>
                  <p className="lane-card-copy">{item.copy}</p>

                  <div className="lane-card-footer">
                    <span className="lane-card-status-dot" aria-hidden="true" />
                    <span>{item.status}</span>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  );
}
