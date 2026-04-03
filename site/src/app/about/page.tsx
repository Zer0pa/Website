import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadLaneCatalog } from '@/lib/data/lane-data';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const catalog = await loadLaneCatalog();

  return (
    <div className="substrate">
      <Header />

      <main className="page-shell page-section simple-page">
        <div className="simple-grid">
          <div>
            <p className="section-label">[ SUBSTRATE_NARRATIVE ]</p>
            <h1 className="lane-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
              ABOUT
            </h1>
            <p className="page-intro" style={{ marginTop: '1rem' }}>
              ZER0PA IS PRESENTED HERE AS A PROOF-FIRST TECHNICAL SUBSTRATE. THE PHILOSOPHY IS
              DELIBERATELY COMPRESSED. EVIDENCE LEADS. BOUNDARIES STAY VISIBLE.
            </p>
          </div>

          <section className="simple-card">
            <p className="summary-kicker">SUBSTRATE</p>
            <p className="summary-copy">
              EVERYTHING EMERGES FROM THE ZERO. THE PUBLIC SURFACE SHOULD FEEL LIKE A DISCIPLINED
              SYSTEM, NOT A COLLECTION OF DISCONNECTED EXPERIMENTS.
            </p>
          </section>

          <section className="simple-card-grid">
            <article className="simple-card">
              <p className="summary-kicker">DETERMINISM</p>
              <p className="summary-copy">
                TRANSPORT, REPLAY, AND EVIDENCE ROUTES MUST STAY AUDITABLE.
              </p>
            </article>

            <article className="simple-card">
              <p className="summary-kicker">SOVEREIGNTY</p>
              <p className="summary-copy">
                THE AUTHORITY SURFACE MUST NOT DEPEND ON HYPE, SILENT EDITORIAL OVERRIDES, OR
                GENERIC PRODUCT LANGUAGE.
              </p>
            </article>

            <article className="simple-card">
              <p className="summary-kicker">INTEGRITY</p>
              <p className="summary-copy">
                WHAT IS PROVED, WHAT IS NOT CLAIMED, AND WHAT REMAINS OPEN MUST ALL BE PRESENT AT
                THE SAME TIME.
              </p>
            </article>

            <article className="simple-card">
              <p className="summary-kicker">STATE</p>
              <p className="summary-copy">
                CURRENTLY TRACKING {catalog.lanes.length} PUBLIC LANES WITH LIVE OR STAGED
                AUTHORITY STATES.
              </p>
            </article>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
