---
name: get-geometry-done
description: Deterministic geometry-first website implementation and QA for the Zer0pa site. Use when translating mockups into code, tightening homepage or product-page fidelity, defining mathematical layout or color systems, refining typography and spacing as explicit constraints, wiring screenshot or DOM diff audits, or building repo-driven `/imc` and `/work/[slug]` surfaces without creative drift.
---

# Get Geometry Done

Treat the site as a geometry program, not a mood board. Convert mockups, route contracts, tokens, and live repo data into explicit measurements, ratios, and falsifiable checks.

Read [references/geometry-program.md](./references/geometry-program.md) before making substantial layout changes.

## Workflow

1. Read the active GGD contract:
   - `GGD/PROJECT.md`
   - `GGD/CONVENTIONS.md`
   - `GGD/ROADMAP.md`
   - `GGD/STATE.md`
   - `GGD/VERIFICATION.md`
2. Read the system adaptation contract when changing the engineering system itself:
   - `CLAW/PRD_GPD_GEOMETRY_ADAPTATION.md`
   - `CLAW/control-plane/plans/gpd-geometry-adaptation.json`
   - `GGD/commands.json`
3. Read the legacy geometry doctrine only for continuity or comparison:
   - `CLAW/GET_GEOMETRY_DONE_PROGRAM.md`
4. Freeze truth surfaces before styling:
   - preserve parser, packet, lane, and GitHub truth unless they are provably broken
   - do not invent marketing copy to hide weak data
5. Express the target page as math:
   - geometry: positions, widths, heights, aspect ratios, gutters, shell widths
   - typography: baseline sizes, modular scale, line boxes, tracking, line count
   - color: token coordinates, luminance, contrast, foreground/background pairs
   - behavior: breakpoint rules, overflow constraints, route invariants
6. Implement with stable measurement hooks:
   - add or preserve `data-spec` on measured elements
   - keep reference specs in `site/src/lib/layout/specs.ts`
   - keep measurement and diff logic in `site/src/scripts/layout-measure.ts` and `site/src/scripts/layout-diff.ts`
7. Falsify every pass:
   - run `npm run build`
   - run `npm run test:parser`
   - run layout audit
   - run responsive audit
   - reject success if critical or major diffs remain
   - reject success if the result violates `GGD/CONVENTIONS.md`

## Installed GGD Surface

Use the installed GGD commands when they materially help:

- `$ggd-help`
- `$ggd-new-project`
- `$ggd-map-research`
- `$ggd-derive-equation`
- `$ggd-dimensional-analysis`
- `$ggd-limiting-cases`
- `$ggd-parameter-sweep`
- `$ggd-sensitivity-analysis`
- `$ggd-system-optimize`
- `$ggd-verify-work`
- `$ggd-validate-conventions`
- `$ggd-debug`

Equation engine:

```bash
python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py functions
python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py eval --expr 'col_width(960, 16, 24)'
python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py check-lawset --lawset /Users/zer0palab/Get-Geometry-Done/ggd/shared/example-lawset.json
```

## Hard Rules

- Prefer equations, tokens, and ratios over ad hoc tweaking.
- Use one base spacing unit and express spacing as multiples of it.
- Use a declared type scale instead of one-off font sizes.
- Treat color as a measured system, not a taste decision.
- Treat `GGD/CONVENTIONS.md` as a convention lock, not a suggestion.
- Preserve flagship distinction for `/imc`; do not flatten it into generic lane treatment.
- Keep `/work/[slug]` deterministic and repo-driven.
- Do not broaden scope to the full site family until `/` and `/imc` are closed tightly enough.

## File Focus

- Shared tokens and primitives: `site/src/app/globals.css`
- Route specs: `site/src/lib/layout/specs.ts`
- Measurement: `site/src/scripts/layout-measure.ts`
- Diffing and reports: `site/src/scripts/layout-diff.ts`
- Homepage: `site/src/components/home/`
- Flagship and lane family: `site/src/components/lane/`
- Repo-driven truth: `site/src/lib/data/` and `site/src/lib/parser/`

## Agent Lanes

Use specialist lanes when the task is large:

- `geometry-architect`: ratios, grids, type scale, color math
- `frontend-implementer`: component and CSS changes
- `data-truth`: repo ingestion, packet normalization, route wiring
- `fidelity-reviewer`: screenshot and DOM diff review
- `falsification`: audit runs, severity review, regression checks
- `convention-coordinator`: validates that geometry work still matches the GGD lock
- `systems-optimizer`: improves the GGD and CLAW machine itself through bounded keep-or-discard ratchets

## Verification Commands

From `site/`:

```bash
npm run build
npm run test:parser
npm run audit:layout -- --baseUrl=http://127.0.0.1:3010
npm run audit:responsive -- --baseUrl=http://127.0.0.1:3010
```

Adjust `baseUrl` if the dev server is on a different port.
