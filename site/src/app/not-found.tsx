import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="substrate">
      <Header variant="product" />
      <main className="page-shell page-section simple-page">
        <div className="error-surface">
          <p className="section-label">[ AUTHORITY SURFACE DEGRADED ]</p>
          <h1 className="lane-heading">404</h1>
          <p className="page-intro">
            THE CURRENT ROUTE COULD NOT BE RESOLVED. THIS IS AN HONEST ABSENCE, NOT A FABRICATED
            SUCCESS PAGE.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
