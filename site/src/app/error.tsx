'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="substrate">
      <Header variant="product" />
      <main className="page-shell page-section simple-page">
        <div className="error-surface">
          <p className="section-label">[ AUTHORITY SURFACE DEGRADED ]</p>
          <h1 className="lane-heading">UNEXPECTED FAILURE</h1>
          <p className="page-intro">
            THE CURRENT ROUTE FAILED BEFORE IT COULD RENDER ITS PROOF SURFACE. THIS IS AN HONEST
            DEGRADED STATE, NOT A FABRICATED SUCCESS PAGE.
          </p>
          {error?.digest ? <p className="error-digest">DIGEST: {error.digest}</p> : null}
          <button type="button" className="secondary-button error-reset-button" onClick={() => reset()}>
            RETRY_SURFACE
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
