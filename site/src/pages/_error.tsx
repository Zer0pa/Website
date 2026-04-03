import React from 'react';
import type { NextPageContext } from 'next';

type ErrorPageProps = {
  statusCode?: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: '#050505',
        color: '#f5f5f5',
        fontFamily: '"Courier New", Courier, monospace',
      }}
    >
      <div style={{ maxWidth: '42rem' }}>
        <p
          style={{
            marginBottom: '1rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            color: '#8a8a8a',
          }}
        >
          [ authority surface degraded ]
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: 'Oswald, sans-serif',
            fontSize: '3rem',
            lineHeight: 0.9,
          }}
        >
          {statusCode ? `ERROR ${statusCode}` : 'UNEXPECTED FAILURE'}
        </h1>
        <p
          style={{
            marginTop: '1rem',
            fontSize: '0.78rem',
            lineHeight: 1.8,
            textTransform: 'uppercase',
            color: '#bdbdbd',
          }}
        >
          The current route failed before it could render its proof surface. This is an honest degraded
          state, not a fabricated success page.
        </p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};

export default ErrorPage;
