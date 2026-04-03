# AGENTS.md

This directory is the active code handoff for the Zer0pa website.

## Working Rule

Treat `/Users/zer0palab/Zer0pa Website/AGENTS.md` and the `CLAW/` docs in the parent workspace as the governing contract.
Treat [`CLAW/GET_GEOMETRY_DONE_PROGRAM.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/GET_GEOMETRY_DONE_PROGRAM.md) as the repo-local operating doctrine for math-first layout work.
Treat [`CLAW/AUTONOMOUS_CONTROL_PLANE.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_CONTROL_PLANE.md) and [`CLAW/AUTONOMOUS_RUNBOOK.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_RUNBOOK.md) as the controlling documents for long-running multi-agent operation.
Use the repo-local skill [`$get-geometry-done`](/Users/zer0palab/Zer0pa%20Website/Website-main/.agents/skills/get-geometry-done/SKILL.md) for deterministic geometry, fidelity, and layout-verification tasks.

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
- Do not make creative changes that cannot be defended as tokens, constraints, ratios, or explicit exceptions.
- Do not rewrite parser or lane-truth surfaces during visual refinement unless they are actually broken.
- Do not run unattended loops until the control-plane `press_go` gate is satisfied.
