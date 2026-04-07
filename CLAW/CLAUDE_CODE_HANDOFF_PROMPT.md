# Claude Code Startup Prompt — GGD Execution Layer Build

**Copy everything below the line into Claude Code as your opening prompt.**

---

## Identity and Mission

You are working on the Zer0pa website (`~/Zer0pa Website/Website-main/`). This is a Next.js site with a deterministic design system called GGD (Get Geometry Done) and an autonomy layer called CLAW. Your job is to build the missing **execution layer** — the machinery that turns mathematical lawset equations into CSS custom properties and closes the audit-correction loop.

## Read These First

Before writing any code, read these files in order:

1. `CLAW/PRD_GGD_EXECUTION_LAYER_2026-04-05.md` — **This is your governing PRD. Follow it exactly.**
2. `GGD/state.json` — Current system state, route progress, blockers, command bindings
3. `GGD/equations/lawsets/home.desktop.shell.json` — Example lawset (geometry)
4. `GGD/equations/lawsets/typography.scale.json` — Example lawset (typography)
5. `site/src/app/globals.css` — Current CSS with hardcoded values you'll be replacing
6. `GGD/gaps/routes/work-ft.geometry-gap.json` — Example gap record
7. `GGD/gaps/routes/work-ft.breakpoint-gap.json` — Example gap record

## Context You Need

### What GGD Is
GGD treats web layout as a constrained geometry program. Every layout decision is an equation, every spacing value is derived from constants, every constraint is falsifiable. It's adapted from Get Physics Done (GPD), which governs a real ship design program (Zer0paShip) with the same philosophy — deterministic engineering with explicit verification.

### What Exists
- **Lawset JSON files** define constants, derived expressions, and constraints
- **Verification scripts** audit the live site against lawset equations
- **Gap records** document failures with severity counts
- **CLAW runner** orchestrates autonomous build/verify cycles
- **State tracking** aggregates route progress

### What's Missing (Your Job)
The lawsets define what the CSS *should* be but nothing computes it. `globals.css` has hardcoded values that happen to match the lawset constants, but they're not generated from the lawsets. When verification fails (14 critical on `/work/xr`, 14 critical + 6 major on `/work/ft`), there's no automated path from "failure detected" to "correct CSS computed."

## Execution Plan

Build these five modules in order. Commit after each. Test before moving to the next.

### Module 1: Lawset Expression Evaluator
**File:** `GGD/scripts/evaluate-lawset.mjs`

Read a lawset JSON. Resolve `derived` expressions to numbers. Evaluate `constraints`. Return structured results.

Expression functions:
```javascript
const FUNCTIONS = {
  col_width: (shell, cols, gutter) => (shell - (cols - 1) * gutter) / cols,
  ratio: (part, whole) => part / whole,
  aspect_ratio: (w, h) => w / h,
  modular_scale: (base, step, ratio) => base * Math.pow(ratio, step),
  round: (value, decimals) => {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
  }
};
```

Constraint operators: `eq`, `approx_eq` (with tolerance), `between`, `gt`, `multiple_of`.

**Test:** `node GGD/scripts/evaluate-lawset.mjs GGD/equations/lawsets/home.desktop.shell.json` must produce valid JSON with all constraints evaluated. All constraints in existing lawsets must pass.

### Module 2: CSS Token Generator
**File:** `GGD/scripts/generate-tokens.mjs`

Read all lawsets from `GGD/equations/lawsets/`. Evaluate each via M1. Produce `site/src/styles/ggd-tokens.css`.

Token naming: `--ggd-{lawset-area}-{key}` for route-specific, `--ggd-{key}` for shared.

Shared tokens (from state.json constants):
```css
:root {
  --ggd-unit: 8px;
  --ggd-half-unit: 4px;
  --ggd-cols-desktop: 16;
  --ggd-cols-tablet: 10;
  --ggd-cols-mobile: 6;
  --ggd-gutter-desktop: 24px;
  --ggd-gutter-tablet: 24px;
  --ggd-gutter-mobile: 16px;
  /* ... derived from lawset evaluation ... */
}
```

Then update `globals.css` to `@import './styles/ggd-tokens.css'` and replace hardcoded values with token references.

**Test:** `npm run build` must succeed after token integration. No visual regression.

### Module 3: Responsive Lawset Matrix

Create tablet and mobile lawset variants. Same expressions, different viewport constants:
- Tablet: viewport 768px, 10 cols, 24px gutter, 20px pad
- Mobile: viewport 375px, 6 cols, 16px gutter, 16px pad

New files:
- `GGD/equations/lawsets/home.tablet.shell.json`
- `GGD/equations/lawsets/home.mobile.shell.json`
- `GGD/equations/lawsets/product-family.tablet.shell.json`
- `GGD/equations/lawsets/product-family.mobile.shell.json`
- `GGD/equations/lawsets/typography.scale.mobile.json`

Update M2 to generate breakpoint-scoped tokens in media queries.

**Test:** Each new lawset passes its own constraint set via M1.

### Module 4: Gap-to-Fix Compiler
**File:** `GGD/scripts/compile-fixes.mjs`

Read open gap records from `GGD/gaps/routes/`. For each failing constraint, compute what the value *should* be from the lawset, compare to what it *is* from verification evidence, and produce a fix manifest.

**Output:** `GGD/fixes/{route}.fix-manifest.json` with entries like:
```json
{
  "property": "--ggd-home-desktop-shell-page-shell",
  "current_value": "960px",
  "target_value": "984px",
  "constraint_id": "home.shell.from_viewport",
  "severity": "CRITICAL",
  "lawset_source": "home.desktop.shell"
}
```

**Test:** Fix manifest for `/work/ft` addresses all 14 critical failures.

### Module 5: Correction Loop Runner
**File:** `GGD/scripts/correction-loop.mjs`

Orchestrate: evaluate lawsets → generate tokens → build → audit → compile fixes → report.

Register as `npm run ggd:correction-cycle` in package.json.

**Test:** Full cycle runs end-to-end without error.

## Rules

1. **Runbook-first:** Read the PRD before writing code. The PRD is authority.
2. **Do NOT modify existing lawset files** — they're upstream truth, same as the ship's vessel spec.
3. **Do NOT modify existing CLAW scripts** — the governance layer is separate from the execution layer.
4. **Do NOT auto-apply CSS fixes to React components** — produce manifests for operator review.
5. **Commit after each module passes its tests.** Separate commits per module.
6. **If `npm run build` breaks, stop and fix it before continuing.** No broken builds.
7. **Use ES modules (`.mjs`)** — the project already uses them for CLAW scripts.
8. **No external dependencies unless absolutely required.** The existing lawset functions are pure arithmetic.

## Commit Convention

```
feat: M1 — lawset expression evaluator
feat: M2 — CSS token generator
feat: M3 — responsive lawset matrix
feat: M4 — gap-to-fix compiler
feat: M5 — correction loop runner
```

## What Success Looks Like

When you're done:
- `node GGD/scripts/evaluate-lawset.mjs GGD/equations/lawsets/home.desktop.shell.json` returns all constraints passing
- `node GGD/scripts/generate-tokens.mjs` produces valid CSS tokens
- `npm run build` succeeds with token-integrated `globals.css`
- `node GGD/scripts/compile-fixes.mjs` produces actionable fix manifests for blocked routes
- `npm run ggd:correction-cycle` runs the full loop end-to-end
- No existing verification scores regress

## Session End Report

When finished, produce:
```
## Session Report
- Objective: Build GGD execution layer (M1-M5)
- What was built: [list modules]
- What tests pass: [list]
- What remains: [list any blockers]
- Files created: [list]
- Files modified: [list]
- Recommendation: [next steps]
```

Begin by reading the PRD, then start on Module 1.
