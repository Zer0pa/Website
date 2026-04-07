# GGD CONVENTIONS

This file is the geometry convention lock.

Every design artifact, route contract, verification artifact, and claw handoff must obey these conventions unless an explicit exception is recorded.

## ASSERT_CONVENTION

Use this marker in future geometry artifacts when relevant:

- `ASSERT_CONVENTION: ggd.geometry.v1`
- `ASSERT_CONVENTION: ggd.typography.v1`
- `ASSERT_CONVENTION: ggd.color.v1`
- `ASSERT_CONVENTION: ggd.semantic.v1`
- `ASSERT_CONVENTION: ggd.code-quality.v1`

## ggd.geometry.v1

- base unit `u = 8px`
- legal half unit `h = 4px`
- legal spacing ladder: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96`
- desktop grid: `16` columns
- tablet grid: `10` columns
- mobile grid: `6` columns
- desktop gutter: `24px`
- tablet gutter: `24px`
- mobile gutter: `16px`
- macro placement must resolve from declared spans and offsets
- no casual negative-margin compensation
- no route-specific geometry hacks in the shared product kernel

## ggd.typography.v1

- body base: `16px`
- desktop modular ratio: `1.2`
- mobile modular ratio: `1.125`
- approved roles:
  - `display`
  - `section-title`
  - `eyebrow`
  - `body`
  - `micro-label`
  - `telemetry`
- type changes must be role-based, not one-off
- line-break behavior for reference-critical headings must be intentional

## ggd.color.v1

- colors are numeric tokens, not prose taste
- treat tokens as OKLCH-coordinated even if implementation currently compiles to CSS vars
- mandatory roles:
  - `surface`
  - `surface-elevated`
  - `text-primary`
  - `text-secondary`
  - `rule`
  - `accent`
  - `accent-soft`
- text/background pairs must be contrast-checked
- do not alter black or white anchors casually to hide weak contrast decisions

## ggd.semantic.v1

- every route must have one `main` landmark
- route titles and descriptions must be route-specific
- heading hierarchy must be coherent
- semantic structure must support SEO and content management, not just visual parity
- packet truth outranks decorative copy

## ggd.code-quality.v1

- route logic should remain simple, inspectable, and lintable
- product-family logic must remain kernel-driven rather than page-forked
- data normalization belongs in data/presentation layers, not spread across route components
- no bypass of measurement hooks for the sake of visual convenience

## Flagship Exception Rule

`/imc` is allowed explicit exceptions.

Those exceptions must be written down and verified.

They must never be smuggled into the shared product-family kernel.
