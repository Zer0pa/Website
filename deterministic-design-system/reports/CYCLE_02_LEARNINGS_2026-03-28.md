# Cycle 02 Learnings — 2026-03-28

## What failed in the prior cycle

- The page instrumentation existed, but the system still did not produce executable measurement artifacts.
- The working tree had drifted into an incoherent state: `globals.css` was missing and `LaneAuthorityPage.tsx` was referenced but absent.
- The first measurement pass falsely reported all surfaces as missing because selector lookup was too brittle around dotted `data-spec` ids.
- The first `next start` verification pass was invalid because the production output needed a clean rebuild after the Playwright/tooling change.

## What was added this cycle

- Restored shared presentation foundations:
  - `site/src/app/globals.css`
  - `site/src/components/lane/LaneAuthorityPage.tsx`
- Hardened the presentation layer to shorten and normalize proof assertions and non-claims without fabricating truth.
- Added deterministic layout inputs:
  - `site/src/lib/layout/specs.ts`
  - `site/src/scripts/layout-reference.ts`
  - `site/src/scripts/layout-audit.ts` improvements
- Generated fresh artifacts:
  - `maps/reference/home.reference.json`
  - `maps/reference/imc.reference.json`
  - `maps/live/*.live.json`
  - `maps/diff/*.diff.json`
  - `reports/home.verification.md`
  - `reports/imc.verification.md`

## Current falsification result

- The system is now measuring real live surfaces rather than reporting empty placeholders.
- `/imc` is materially closer to the reference than before, but still shows major topography drift in the hero, logic band, related lanes, and CTA block.
- `/` is in the correct visual family, but the current reference map is still stricter than the live layout in the hero and lower-section geography.

## Next pass

- Tighten the reference maps now that the measurement loop is working.
- Close the highest-value diffs in order:
  1. homepage hero geography
  2. homepage dossier/media composition
  3. IMC hero title/meta split
  4. IMC proof/non-claims two-column parity
  5. IMC related lanes + CTA vertical rhythm
