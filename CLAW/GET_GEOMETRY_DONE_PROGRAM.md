# Get Geometry Done Program

## Purpose

Turn the Zer0pa website into a deterministic geometry program where layout, typography, color, and route truth are governed by explicit constraints instead of creative interpretation.

This is the correct reuse of `get-physics-done` for this repo:

- use its operating discipline
- do not inherit its physics domain
- do not let it own runtime config for this project

## Current Finding

The repo already has a serious deterministic backbone:

- route-scoped reference specs in `site/src/lib/layout/specs.ts`
- live DOM measurement in `site/src/scripts/layout-measure.ts`
- diff generation and severity classification in `site/src/scripts/layout-diff.ts`
- repo-driven lane normalization in `site/src/lib/data/` and `site/src/lib/parser/`

What is still under-specified is the governing math:

- spacing system
- type scale
- color system
- page-family laws
- flagship exceptions
- product-family generation rules

## Reuse of Get Physics Done

### Copy directly

- `Formulate -> Plan -> Execute -> Verify`
- explicit project state
- wave-based parallel execution
- protocol catalog
- pattern memory
- verification coverage

### Adapt

- physics conventions -> design and truth conventions
- dimensional checks -> box-model and spacing-ratio checks
- limiting cases -> breakpoint checks
- symmetry checks -> alignment and grid-consistency checks
- verification ledger -> visual and data-truth ledger

### Reject

- literature and manuscript workflows
- physics derivation workflows as literal domain logic
- global runtime installer behavior
- broad command sprawl that would overcomplicate the website flow

## Geometry-First Design Laws

### 1. Space is algebra

- choose one base unit `u`
- express spacing as `n * u`
- ban arbitrary one-off gaps unless written into the route contract

### 2. Typography is a scale

- define a modular type equation `t(n) = t0 * r^n`
- derive headings, labels, telemetry, and body from that equation
- lock line count and line-break behavior for reference-critical headings

### 3. Color is coordinates

- define color tokens numerically
- track luminance and contrast for each key pair
- reject intuitive drift that breaks the declared system

### 4. Layout is a field

- define shell width, column count, gutters, and major panel ratios
- store route-critical rectangles as reference entries
- preserve absolute and normalized coordinates

### 5. Breakpoints are piecewise constraints

- define desktop, tablet, and mobile as explicit rule sets
- preserve invariants instead of restyling freely per breakpoint

### 6. Truth outranks style

- GitHub and packet truth drive lane identity, authority, proof anchors, and repo shape
- Sanity may compose; it must not fabricate

## Specialist Claw Lanes

- `orchestrator`: owns sequence, gates, and acceptance
- `geometry-architect`: owns grids, ratios, scales, and color math
- `frontend-implementer`: owns code changes in components and CSS
- `data-truth`: owns repo discovery, normalization, sync, and route integrity
- `flagship-art-direction`: owns `/imc` specificity and anti-generic treatment
- `falsification`: owns audits, diff verdicts, and release rejection
- `product-family`: owns `/work/[slug]` family laws and repo-page rollout

Use highest reasoning for `orchestrator`, `geometry-architect`, `flagship-art-direction`, and `falsification`.
Use faster agents for batch audits, route completeness, and data checks.

Long-running operation is governed by:

- `CLAW/AUTONOMOUS_CONTROL_PLANE.md`
- `CLAW/AUTONOMOUS_RUNBOOK.md`
- `CLAW/AUTONOMOUS_STATE_TEMPLATE.json`
- `CLAW/control-plane/`

## Artifact Contract

Every serious refinement cycle should preserve or regenerate:

- reference geometry map
- live geometry map
- diff map
- verification report
- responsive verification report
- route contract or phase plan
- current state note for the active route

## Implementation Phases

### Phase 0: Freeze and declare

- freeze parser and lane truth surfaces unless broken
- lock route targets: `/`, `/imc`, then `/work/[slug]`
- define the base spacing unit, type scale, and color coordinate system

### Phase 1: Homepage shell closure

- close remaining shell, header, type, and spacing drift on `/`
- promote homepage rules into reusable laws where valid

### Phase 2: Flagship IMC closure

- push `/imc` beyond the generic lane template
- encode flagship-only exceptions explicitly instead of hand-waving them

### Phase 3: Product-family kernel

- define the lawful generic page family for the 10 repo-backed pages
- separate family rules from flagship exceptions

### Phase 4: GitHub truth loop

- harden ingest, cache, and revalidation paths
- ensure repo changes propagate deterministically into page truth

### Phase 5: Release gate

- zero critical and major diffs on target routes
- responsive pass
- data-truth pass
- manual flagship review pass

## Command Surface

From `site/`:

```bash
npm run build
npm run test:parser
npm run audit:layout -- --baseUrl=http://127.0.0.1:3010
npm run audit:responsive -- --baseUrl=http://127.0.0.1:3010
```

## Non-Negotiables

- No creative restyling.
- No invented product truth.
- No generic-card drift.
- No claiming success from screenshots alone.
- No site-wide expansion before homepage and flagship closure.
- No unattended operation before `press_go` is explicitly true in control-plane state.
