# AGENTS.md

This directory is the active code handoff for the Zer0pa website.

## Working Rule

Treat `/Users/zer0palab/Zer0pa Website/AGENTS.md` and the `CLAW/` docs in the parent workspace as the governing contract.

## Immediate Priorities

1. Tighten homepage fidelity.
2. Tighten flagship `/imc` fidelity.
3. Improve shared primitives before broad page work.
4. Preserve the data pipeline while reducing generic visual treatment.

## Code Focus

- Main app: `site/`
- Shared styles: `site/src/app/globals.css`
- Shared layout: `site/src/components/layout/`
- Homepage surface: `site/src/components/home/`
- Flagship / generic lane surface: `site/src/components/lane/`
- Audit tools: `site/src/scripts/`

## Don't Drift

- Do not treat the current implementation as finished just because it builds.
- Do not replace the deterministic layout workflow with generic component churn.
- Do not flatten the flagship IMC surface into the same template logic as every other lane.
