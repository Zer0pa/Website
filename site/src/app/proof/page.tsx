import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadLaneCatalog } from '@/lib/data/lane-data';
import {
  selectNonClaims,
  selectProofAnchors,
  selectProofAssertions,
  selectVerificationPath,
} from '@/lib/data/presentation';

export const dynamic = 'force-dynamic';

export default async function ProofPage() {
  const catalog = await loadLaneCatalog();
  const examples = catalog.lanes.slice(0, 3);

  return (
    <div className="substrate">
      <Header />

      <main className="page-shell page-section simple-page">
        <div className="simple-grid">
          <div>
            <p className="section-label">[ PROOF_MODEL_AND_AUDIT_ROUTES ]</p>
            <h1 className="lane-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
              PROOF
            </h1>
            <p className="page-intro" style={{ marginTop: '1rem' }}>
              THIS PAGE EXPLAINS HOW TO READ THE SITE: WHAT COUNTS AS AUTHORITY, WHAT COUNTS AS
              EVIDENCE, AND HOW NON-CLAIMS REMAIN VISIBLE ALONGSIDE POSITIVE RESULTS.
            </p>
          </div>

          <div className="simple-card-grid">
            <article className="simple-card">
              <p className="summary-kicker">AUTHORITY</p>
              <p className="summary-copy">
                CURRENT AUTHORITY STATES ARE MACHINE-DERIVED FROM PUBLIC REPO SURFACES. THEY ARE NOT
                MANUALLY POLISHED INTO SUCCESS NARRATIVES.
              </p>
            </article>

            <article className="simple-card">
              <p className="summary-kicker">NON-CLAIMS</p>
              <p className="summary-copy">
                EVERY SERIOUS LANE MUST SHOW WHAT IT DOES NOT CLAIM. THIS IS A RADICAL HONESTY
                SURFACE, NOT A SALES SURFACE.
              </p>
            </article>
          </div>

          {examples.map((lane) => (
            <section key={lane.laneIdentifier} className="simple-card">
              <p className="summary-kicker">{lane.laneIdentifier}</p>
              <div className="simple-card-grid">
                <div className="list-stack">
                  <p className="summary-kicker">WHAT IS PROVED</p>
                  {selectProofAssertions(lane, 2).map((item) => (
                    <p key={item} className="summary-copy">
                      {item}
                    </p>
                  ))}
                </div>

                <div className="list-stack">
                  <p className="summary-kicker">WHAT IS NOT CLAIMED</p>
                  {selectNonClaims(lane, 2).map((item) => (
                    <p key={item} className="summary-copy">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="simple-card-grid">
                <div className="list-stack">
                  <p className="summary-kicker">PROOF ANCHORS</p>
                  {selectProofAnchors(lane, 2).map((item) => (
                    <p key={item.path} className="summary-copy">
                      {item.path}
                    </p>
                  ))}
                </div>

                <div className="list-stack">
                  <p className="summary-kicker">VERIFICATION PATH</p>
                  {selectVerificationPath(lane, 2).map((item) => (
                    <p key={item} className="summary-copy">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
