'use client';

import { motion } from 'motion/react';

export default function ArchitectureExplainer() {
  return (
    <section style={{
      padding: 'var(--space-2xl) var(--grid-gutter)',
      background: 'var(--color-void)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4rem'
    }}>
      <h2 style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-text-primary)' }}>
        SYSTEM_ARCHITECTURE_V1.1
      </h2>

      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        background: 'var(--color-border)',
      }}>
        {[
          { label: 'SUBSTRATE', value: 'ZER0PA_CORE', desc: 'Sovereign intelligence foundation.' },
          { label: 'INTEGRATION', value: 'ZPE-IMC', desc: 'Multimodal multisensorial codec convergence.' },
          { label: 'DOMAIN', value: 'LANES', desc: 'Specialized modality expressions (IoT, Robotics, etc.)' },
          { label: 'AUTHORITY', value: 'PROOFS', desc: 'Radical honesty verification layers.' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--color-void)',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: '200px 1fr 1fr',
            alignItems: 'center',
            fontSize: 'var(--font-size-small)'
          }}>
            <span style={{ color: 'var(--color-text-tertiary)' }}>{item.label}</span>
            <span className="masthead" style={{ color: 'var(--color-emphasis)' }}>{item.value}</span>
            <span style={{ color: 'var(--color-text-secondary)', textAlign: 'right' }}>{item.desc}</span>
          </div>
        ))}
      </div>
      
      <p style={{ maxWidth: '600px', textAlign: 'center', fontSize: 'var(--font-size-micro)', opacity: 0.5 }}>
        [ MOTION_EXPLAINS_STRUCTURE_ONLY. CAUSALITY_LINKED_SCROLL_ESTABLISHED. ]
      </p>
    </section>
  );
}
