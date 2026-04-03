import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadLaneCatalog } from '@/lib/data/lane-data';

export const dynamic = 'force-dynamic';

const CONTACT_ROUTES = [
  {
    label: 'LICENSING',
    copy: 'COMMERCIAL USE, HOSTED DEPLOYMENTS, AND RIGHTS INTERPRETATION.',
  },
  {
    label: 'PARTNERSHIP',
    copy: 'INSTITUTIONAL, GOVERNMENTAL, AND STRATEGIC COLLABORATION ROUTING.',
  },
  {
    label: 'RESEARCH',
    copy: 'LAB-TO-LAB TECHNICAL EXCHANGE, VALIDATION, AND EVIDENCE REVIEW.',
  },
  {
    label: 'ARCHITECTS',
    copy: 'PRIMARY CONTACT SURFACE: architects@zer0pa.ai',
  },
];

export default async function ContactPage() {
  const catalog = await loadLaneCatalog();

  return (
    <div className="substrate">
      <Header />

      <main className="page-shell page-section simple-page">
        <div className="simple-grid">
          <div>
            <p className="section-label">[ CONTACT_AND_ROUTING ]</p>
            <h1 className="lane-heading" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
              CONTACT
            </h1>
            <p className="page-intro" style={{ marginTop: '1rem' }}>
              THIS SURFACE ROUTES LICENSING, RESEARCH, AND PARTNERSHIP REQUESTS. DO NOT TREAT IT AS
              A GENERIC SALES FORM. ROUTE WITH CONTEXT.
            </p>
          </div>

          <div className="simple-card-grid">
            {CONTACT_ROUTES.map((item) => (
              <article key={item.label} className="simple-card">
                <p className="summary-kicker">{item.label}</p>
                <p className="summary-copy">{item.copy}</p>
              </article>
            ))}
          </div>

          <section className="simple-card">
            <p className="summary-kicker">ACTIVE SURFACE</p>
            <p className="summary-copy">
              CURRENT PUBLIC AUTHORITY SURFACE TRACKS {catalog.lanes.length} LIVE OR STAGED LANES.
              INCLUDE THE RELEVANT LANE IDENTIFIER WHEN MAKING CONTACT.
            </p>
            <a href="mailto:architects@zer0pa.ai" className="primary-button" style={{ width: 'fit-content' }}>
              architects@zer0pa.ai
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
