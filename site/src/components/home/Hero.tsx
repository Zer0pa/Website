import Link from 'next/link';

export default function Hero({
  syncTimestamp = 'LIVE_DECRYPTION',
  status = 'OPERATIONAL',
  confidence = 100,
}: {
  syncTimestamp?: string;
  status?: string;
  confidence?: number;
}) {
  const syncLabel = syncTimestamp ? syncTimestamp.replace('T', ' ').replace('Z', '').slice(0, 19) : 'LIVE_DECRYPTION';

  return (
    <section className="hero-section" data-spec="home.hero">
      <div className="hero-status-bar">
        <div className="page-shell hero-status-bar-inner">
          <div className="hero-status-bar-content" data-spec="home.hero.statusbar">
            <span className="hero-status-glyph" aria-hidden="true" />
            <span>
              SYSTEM_STATUS: {status} / {syncLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="page-shell hero-layout">
        <div className="hero-copy">
          <h1 className="hero-heading" data-spec="home.hero.heading">
            <span>ZERO-POINT</span>
            <span>ARCHITECTURE:</span>
            <span className="hero-heading-ghost">PROOF-FIRST</span>
            <span className="hero-heading-line-inline">
              <span className="hero-heading-soft">TECHNICAL</span>
              <span>SURFACE</span>
            </span>
          </h1>
        </div>

        <div className="hero-lower-row">
          <p className="hero-body" data-spec="home.hero.body">
            DIRECT ACCESS TO THE ZER0PA SUBSTRATE. THIS INTERFACE REPRESENTS THE UNSANITIZED
            TECHNICAL TELEMETRY OF OUR COMPUTE LAYER. EVERY DATA POINT IS DETERMINISTIC.
          </p>

          <div className="hero-cta-rail">
            <Link href="/imc" className="primary-button primary-button--hero" data-spec="home.hero.cta">
              INITIALIZE_SYSTEM
            </Link>
          </div>

          <div className="hero-telemetry-rail" data-spec="home.hero.telemetry">
            <div className="telemetry-table">
              <div className="telemetry-row">
                <span>LATENCY_SIGMA</span>
                <span>0.00042MS</span>
              </div>
              <div className="telemetry-row">
                <span>AUTHORITY_STATE</span>
                <span>{status}</span>
              </div>
              <div className="telemetry-row">
                <span>MODEL_CONSENSUS</span>
                <span>{confidence.toFixed(4)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
