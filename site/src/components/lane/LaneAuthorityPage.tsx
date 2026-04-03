import Link from 'next/link';
import type { LanePacket } from '@/lib/types/lane';
import {
  buildRelatedLanes,
  buildTerminalLines,
  displayAuthorityAsset,
  laneDisplayName,
  selectAssertionDeck,
  selectMetricDeck,
  selectModalityRows,
  selectNonClaimDeck,
  selectNarrativeLines,
  selectProofAnchors,
  selectRepoHighlights,
  summarizePanelText,
} from '@/lib/data/presentation';

export default function LaneAuthorityPage({
  lane,
  lanes,
}: {
  lane: LanePacket;
  lanes: LanePacket[];
}) {
  const metrics = selectMetricDeck(lane, 4);
  const assertions = selectAssertionDeck(lane, 3);
  const nonClaims = selectNonClaimDeck(lane, 4);
  const modalities = selectModalityRows(lane, 6);
  const related = buildRelatedLanes(lane, lanes, 3);
  const anchors = selectProofAnchors(lane, 2);
  const repoHighlights = selectRepoHighlights(lane, 3);
  const terminalLines = buildTerminalLines(lane, 5);
  const summary = summarizePanelText(
    selectNarrativeLines(lane, 2).join(' ') || lane.tagline || lane.laneIdentifier,
    240,
  );

  return (
    <main className="page-shell page-section authority-page">
      <div className="authority-page-inner" data-spec="imc.page">
        <div className="authority-top-row">
          <h1 className="lane-display-h1" data-spec="imc.hero.title">
            {lane.laneIdentifier}
          </h1>

          <div className="lane-meta-brackets" data-spec="imc.hero.meta">
            <p>[ STATUS: {lane.authorityState.status} ]</p>
            <p>[ CLASS: FLAGSHIP_LANE ]</p>
            <p>[ ORIGIN: {lane.authorityState.sourceFile || 'README.md'} ]</p>
          </div>
        </div>

        <div className="lane-hero-grid authority-hero-grid">
          <section className="lane-hero-intro" data-spec="imc.hero.identity">
            <p className="section-slash-title">SUBJECT_IDENTITY</p>
            <p className="lane-identity-copy">{summary}</p>
          </section>

          <section className="lane-panel authority-state-panel" data-spec="imc.hero.authority">
            <p className="section-slash-title">AUTHORITY_STATE</p>
            <div className="authority-state-stack">
              <div className="authority-state-row authority-state-row-emphasis">
                <span className="label-micro">VERDICT</span>
                <span className="authority-state-value">{displayAuthorityAsset(lane)}</span>
              </div>
              <div className="authority-state-row">
                <span className="label-micro">ORBITAL_HASH</span>
                <span className="value-mono">{lane.commitSha ? lane.commitSha.slice(0, 12) : 'UNRESOLVED'}</span>
              </div>
              <div className="authority-state-row">
                <span className="label-micro">TIMESTAMP</span>
                <span className="value-mono">{lane.authorityState.timestamp || 'UNKNOWN'}</span>
              </div>
              <div className="authority-state-row">
                <span className="label-micro">MODEL_CONSENSUS</span>
                <span className="value-mono">{lane.confidenceScore}%</span>
              </div>
            </div>
          </section>
        </div>

        <section className="authority-metric-row" data-spec="imc.metric.row">
          {metrics.map((metric) => (
            <article key={metric.label} className="authority-metric-card">
              <span className="label-micro">{metric.label}</span>
              <span className="authority-metric-value">{metric.valueRaw}</span>
            </article>
          ))}
        </section>

        <div className="authority-logic-grid">
          <section className="lane-panel" data-spec="imc.proof.assertions">
            <p className="section-slash-title">PROOF_ASSERTIONS</p>
            <div className="assertion-stack">
              {assertions.map((assertion, index) => (
                <div key={`${index}-${assertion}`} className="assertion-row">
                  <span className="status-chip status-pass">PASS</span>
                  <span className="assertion-copy">{assertion}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="lane-panel lane-panel-red" data-spec="imc.nonclaims">
            <p className="section-slash-title section-slash-title-red">EXPLICIT_NON_CLAIMS</p>
            <div className="nonclaim-stack">
              {nonClaims.map((nonClaim, index) => (
                <div key={`${index}-${nonClaim}`} className="nonclaim-row">
                  <span>[!]</span>
                  <span>{nonClaim}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="modality-band" data-spec="imc.modality.snapshot">
          <p className="section-slash-title">MODALITY STATUS SNAPSHOT (RADICAL HONESTY)</p>
          <div className="modality-band-grid">
            {modalities.map((modality) => (
              <div key={modality.modalityName} className="modality-band-row">
                <span className="label-micro">{modality.modalityName}</span>
                <span className={`status-chip ${modality.verdict === 'PASS' ? 'status-pass' : 'status-neutral'}`}>
                  {modality.verdict}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="evidence-repo-row authority-evidence-row">
          <section data-spec="imc.evidence.routes">
            <p className="section-slash-title">EVIDENCE_ROUTES</p>
            <div className="evidence-hex-visual evidence-visual-panel">
              <div className="hex-shape evidence-hex-shape" />
              <div className="evidence-visual-orbit" />
              <div className="evidence-visual-corner">
                <span className="label-micro">
                  {anchors[0]?.path || `FRAGMENT_${lane.laneIdentifier}_01`}
                </span>
                <span className="label-micro">SAFE_LAB_WORK</span>
              </div>
            </div>
          </section>

          <section className="lane-panel repo-shape-panel" data-spec="imc.repo.shape">
            <p className="section-slash-title">REPO_SHAPE</p>
            <p className="repo-shape-copy">
              Proof anchors: {lane.proofAnchors.length}. Modality lanes: {lane.modalityStatus.length}. Authority
              source: {lane.authorityState.sourceFile || 'README.md'}.
            </p>

            <div className="repo-shape-list">
              {repoHighlights.map((path) => (
                <p key={path} className="repo-shape-line">
                  {path}
                </p>
              ))}
            </div>

            <a href={lane.repoUrl} target="_blank" rel="noreferrer" className="secondary-button repo-shape-button">
              ACCESS_REPOSITORY
            </a>
          </section>
        </div>

        <section className="proof-terminal-section" data-spec="imc.proof.terminal">
          <p className="proof-terminal-label">[ PROOF_ANCHOR_TERMINAL_V1.3 ]</p>
          <div className="terminal-anchor-v1">
            {terminalLines.map((line, index) => (
              <p key={line} className={index === terminalLines.length - 1 ? 'line-muted' : undefined}>
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="related-lanes-section" data-spec="imc.related.lanes">
          <p className="section-slash-title">RELATED_LANES</p>
          <div className="related-lanes-grid">
            {related.map((item) => (
              <Link
                key={item.laneIdentifier}
                href={`/work/${item.laneIdentifier.toLowerCase().replace(/^zpe-/, '')}`}
                className="related-lane-card"
              >
                <span className="label-micro">{item.laneIdentifier}</span>
                <h2 className="related-lane-title">{laneDisplayName(item)}</h2>
              </Link>
            ))}
          </div>
        </section>

        <section className="cta-band authority-cta-band" data-spec="imc.cta.band">
          <h2>SECURE THE EVIDENCE. JOIN THE CLUSTER.</h2>
          <p className="authority-cta-copy">
            Institutional access grants direct API hooks into the {lane.laneIdentifier} authority
            layer. Real-time verification for state actors and tier-1 labs.
          </p>
          <div className="cta-actions">
            <Link href="/contact" className="primary-button">
              INITIATE_PARTNERSHIP
            </Link>
            <a href={lane.repoUrl} target="_blank" rel="noreferrer" className="secondary-button">
              DOWNLOAD_WHITE_PAPER
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
