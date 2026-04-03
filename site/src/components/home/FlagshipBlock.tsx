import Link from 'next/link';
import type { LanePacket } from '@/lib/types/lane';
import {
  buildTerminalLines,
  flagshipDisplayName,
  selectMetricDeck,
  selectNarrativeLines,
  summarizePanelText,
} from '@/lib/data/presentation';

export default function FlagshipBlock({ lane }: { lane: LanePacket }) {
  const metrics = selectMetricDeck(lane, 4);
  const summary = summarizePanelText(selectNarrativeLines(lane, 1)[0] || lane.laneIdentifier, 138);
  const flagshipTitle = flagshipDisplayName(lane);
  const leftMetric = metrics[1] || metrics[0] || {
    label: 'AUTHORITY STATE',
    valueRaw: lane.authorityState.status,
  };
  const rightMetric = metrics[3] || metrics[2] || {
    label: 'MODEL CONSENSUS',
    valueRaw: `${lane.confidenceScore}%`,
  };
  const topMetric = metrics[0]?.valueRaw || `${lane.confidenceScore}%`;
  const terminalLines = buildTerminalLines(lane, 4);

  return (
    <section className="dossier-block" data-spec="home.flagship.shell">
      <div className="page-shell dossier-section">
        <div className="dossier-head">
          <span className="dossier-code">{lane.laneIdentifier}_DOSSIER_001</span>
          <span className="dossier-tail">REF: IMC_PRIMARY_VOID</span>
        </div>

        <div className="dossier-grid">
          <div className="dossier-left" data-spec="home.flagship.media">
            <div className="media-frame media-frame--flagship">
              <div className="media-noise" />
              <div className="media-haze" />
              <div className="media-crossfade" />
            </div>

            <div className="terminal-log" data-spec="home.flagship.telemetry">
              <p className="terminal-header">TELEMETRY_STREAM</p>
              <div className="terminal-lines">
                {terminalLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="dossier-right" data-spec="home.flagship.summary">
            <div className="dossier-title-row">
              <div>
                <p className="label-micro">MODULE_IDENTIFIER</p>
                <h2 className="dossier-module-title">{flagshipTitle}</h2>
              </div>

              <div className="dossier-version">
                <p className="label-micro">VERSION</p>
                <p className="value-mono">V1.0.4_BETA</p>
              </div>
            </div>

            <p className="dossier-description">
              {summary}
            </p>

            <div className="throughput-bar" data-spec="home.flagship.metrics">
              <div className="bar-labels">
                <span className="label-micro">AUTHORITY_CONFIDENCE</span>
                <span className="value-mono">{topMetric}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max(42, Math.min(74, lane.confidenceScore * 0.68))}%` }} />
              </div>
            </div>

            <div className="dossier-metrics">
              <div>
                <p className="label-micro">{leftMetric?.label || 'AUTHORITY STATE'}</p>
                <p className="metric-large">{leftMetric?.valueRaw || lane.authorityState.status}</p>
              </div>
              <div>
                <p className="label-micro">{rightMetric?.label || 'MODEL CONSENSUS'}</p>
                <p className="metric-large">{rightMetric?.valueRaw || `${lane.confidenceScore}%`}</p>
              </div>
            </div>

            <div className="dossier-actions" data-spec="home.flagship.actions">
              <Link href="/proof" className="secondary-button">
                EXPORT_RAW_DATA
              </Link>
              <Link href="/imc" className="primary-button">
                REQUEST_ACCESS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
