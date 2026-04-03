export default function SubstrateNarrative({ narrative }: { narrative?: string }) {
  return (
    <section style={{
      padding: 'var(--space-2xl) var(--grid-gutter)',
      textAlign: 'center',
      background: 'var(--color-void)'
    }}>
      <p style={{
        maxWidth: '800px',
        margin: '0 auto',
        fontSize: 'var(--font-size-h2)',
        lineHeight: '1.6',
        color: 'var(--color-text-primary)',
        letterSpacing: '0.02em'
      }}>
        {narrative || "THE ZERO IS THE SEED. THE SITE MUST FEEL LIKE IT EMERGES FROM IT. A GENERATIONAL TECHNICAL SUBSTRATE FOR COMPOSABLE INTELLIGENCE."}
      </p>
      
      <div style={{
        marginTop: 'var(--space-xl)',
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        fontSize: 'var(--font-size-micro)',
        opacity: 0.4,
        textTransform: 'uppercase'
      }}>
        <span>DETERMINISM</span>
        <span>SOVEREIGNTY</span>
        <span>INTEGRITY</span>
      </div>
    </section>
  );
}
