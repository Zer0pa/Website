# PRD: GGD Execution Layer — From Laws to Pixels

**Date:** 2026-04-05
**Author:** Claude Opus (via Cowork session with Architect Prime)
**Status:** Ready for Claude Code execution
**Supersedes:** Nothing. This fills the gap between the existing GGD contract layer and the missing code-generation machinery.

## 0. Problem Statement

The GGD/CLAW system can **audit and reject** but cannot **generate and correct**.

Lawsets exist as JSON files defining geometry, typography, color, and responsive constraints as mathematical equations. Verification scripts measure the live site against these laws and produce gap records with severity counts. But when verification fails — as it currently does on `/work/xr` (14 critical) and `/work/ft` (14 critical, 6 major) — nothing automatically computes the correct CSS values from the lawset equations.

The result: an inspection system without a construction crew. Gap records accumulate. Routes stay blocked. `press_go` stays `false`. The operator becomes the bottleneck.

This PRD specifies the **execution layer** — the machinery that reads lawset equations, computes correct values, generates CSS custom properties, and closes the audit-correction loop.

## 1. Current State (Verified 2026-04-05)

### What Exists and Works
- **5 lawset files** in `GGD/equations/lawsets/`: `home.desktop.shell.json`, `flagship.desktop.shell.json`, `product-family.desktop.shell.json`, `typography.scale.json`, `color.contrast.json`
- **Lawset schema**: Each lawset has `constants` (literal values), `derived` (string expressions referencing functions like `col_width()`, `modular_scale()`, `ratio()`), and `constraints` (assertions with operators `eq`, `approx_eq`, `between`, `gt`, `multiple_of`)
- **Verification scripts** that audit live DOM measurements against specs
- **Gap records** in `GGD/gaps/routes/` with machine-readable severity counts
- **State tracking** in `GGD/state.json` with route progress, blockers, evidence paths
- **CLAW autonomy runner** with lane isolation, handoffs, and escalation
- **Design constants** in `GGD/state.json`: `base_unit_px: 8`, `desktop_columns: 16`, `desktop_gutter_px: 24`, etc.

### What Does NOT Exist (The Gap)
- No script that reads lawset JSON and produces CSS custom properties
- No system that computes derived values from lawset expressions
- No token-to-component binding
- No responsive lawset matrix (tablet/mobile lawsets missing)
- No automated correction loop (audit failure → recompute → regenerate CSS → re-audit)
- `globals.css` contains hardcoded values (`--grid-max: 984px`, `--grid-pad: 20px`) not derived from lawsets

### Route Status
| Route | Progress | Layout | Geometry | Responsive | Quality | Contrast |
|-------|----------|--------|----------|------------|---------|----------|
| `/` | 70.9% | 83.5 | 52.0 | 85.0 | 100 | 50 (contradictory) |
| `/imc` | 81.9% | 88.0 | 74.5 | 100 | 100 | 50 (contradictory) |
| `/work/xr` | 23.5% | 0 | 0 | 85.0 | 100 | 50 (contradictory) |
| `/work/ft` | 19.0% | 0 | 0 | 40.0 | 100 | 50 (contradictory) |

## 2. What This PRD Delivers

Five bounded, testable modules that together close the lawset-to-CSS loop.

### M1: Lawset Expression Evaluator (`GGD/scripts/evaluate-lawset.mjs`)

**Purpose:** Read a lawset JSON, resolve all `derived` expressions to numeric values, evaluate all `constraints`, and return a structured result.

**Input:** Path to a lawset JSON file.

**Expression functions to implement:**
- `col_width(shell, cols, gutter)` → `(shell - (cols - 1) * gutter) / cols`
- `ratio(part, whole)` → `part / whole`
- `aspect_ratio(w, h)` → `w / h`
- `modular_scale(base, step, ratio)` → `base * Math.pow(ratio, step)`
- `round(value, decimals)` → `Math.round(value * 10^decimals) / 10^decimals`

**Constraint operators:**
- `eq`: `lhs === rhs`
- `approx_eq`: `Math.abs(lhs - rhs) <= tolerance`
- `between`: `rhs[0] <= lhs <= rhs[1]`
- `gt`: `lhs > rhs`
- `multiple_of`: `lhs % rhs === 0`

**Output:** JSON with `{ constants, derived_values, constraint_results: [{ id, passed, lhs_value, rhs_value, message }] }`

**Test:** Run against all 5 existing lawsets. All constraints must evaluate without error. Known-good lawsets (home, typography) must pass all constraints.

### M2: CSS Token Generator (`GGD/scripts/generate-tokens.mjs`)

**Purpose:** Read all lawsets, evaluate them via M1, and produce a CSS custom properties file that replaces the hardcoded values in `globals.css`.

**Output file:** `site/src/styles/ggd-tokens.css`

**Mapping rules:**
- Every lawset `constant` and resolved `derived` value becomes a CSS custom property
- Naming: `--ggd-{lawset_id}-{key}` (e.g., `--ggd-home-desktop-shell-page-shell: 984px`)
- Shared constants (base unit, columns, gutters) get short names: `--ggd-unit: 8px`, `--ggd-cols-desktop: 16`, etc.
- Typography scale values get role names: `--ggd-type-display: 39.81px`, `--ggd-type-section: 27.65px`, etc.
- Color contrast values get token names matching the existing `globals.css` convention

**Integration:** `globals.css` imports `ggd-tokens.css` and references the generated properties instead of hardcoded literals.

**Test:** Generated tokens must satisfy all lawset constraints when re-evaluated. Diff against current `globals.css` hardcoded values must show equivalence (not regression).

### M3: Responsive Lawset Matrix (`GGD/equations/lawsets/`)

**Purpose:** Create tablet and mobile lawset variants so responsive behavior is equation-driven, not ad hoc.

**New lawset files:**
- `home.tablet.shell.json` — derived from `home.desktop.shell.json` with tablet constants (10 columns, viewport 768px)
- `home.mobile.shell.json` — derived with mobile constants (6 columns, viewport 375px)
- `product-family.tablet.shell.json`
- `product-family.mobile.shell.json`
- `typography.scale.mobile.json` — uses `mobile_ratio: 1.125` instead of `desktop_ratio: 1.2`

**Derivation rules:** Use the same expressions as desktop lawsets but substitute viewport-specific constants from `GGD/state.json`:
- Tablet: `viewport_width: 768`, `cols: 10`, `gutter: 24`, `page_pad: 20`
- Mobile: `viewport_width: 375`, `cols: 6`, `gutter: 16`, `page_pad: 16`

**M2 extension:** Token generator produces breakpoint-scoped CSS:
```css
@media (max-width: 1023px) { :root { --ggd-cols: 10; --ggd-page-shell: ...; } }
@media (max-width: 767px) { :root { --ggd-cols: 6; --ggd-page-shell: ...; } }
```

**Test:** Each responsive lawset must pass its own constraint set. Token output must produce valid CSS media queries.

### M4: Gap-to-Fix Compiler (`GGD/scripts/compile-fixes.mjs`)

**Purpose:** Read gap records and lawset evaluations, compute what each failing constraint *should* resolve to, and produce a concrete CSS diff.

**Input:**
- Gap records from `GGD/gaps/routes/`
- Lawset evaluation results from M1
- Current live measurement data from verification reports

**Logic:**
For each gap record with `status: open` and `severity_counts.critical > 0`:
1. Load the route's lawset(s)
2. Evaluate to get target values
3. Load current measured values from the verification evidence
4. For each failing constraint, compute the delta between measured and target
5. Map deltas to CSS property changes (using the M2 token namespace)
6. Produce a structured diff: `{ property, current_value, target_value, lawset_source, constraint_id }`

**Output:** JSON fix manifest at `GGD/fixes/{route}.fix-manifest.json`

**Test:** Fix manifest for `/work/ft` must address all 14 critical geometry failures. Applying the fixes (manually or via M5) and re-running verification must reduce critical count.

### M5: Correction Loop Runner (`GGD/scripts/correction-loop.mjs`)

**Purpose:** Orchestrate M1→M2→M4 into a single audit-correct-verify cycle that the CLAW runner can invoke as a lane command.

**Cycle:**
1. Evaluate all lawsets (M1)
2. Generate tokens (M2) — write to `site/src/styles/ggd-tokens.css`
3. If site is buildable: run `npm run build` to verify no compilation errors
4. Run geometry-law verification audit
5. If failures: run gap-to-fix compiler (M4) to produce fix manifest
6. Report: cycle result JSON with before/after constraint pass rates

**Integration with CLAW:**
- Register as `npm run ggd:correction-cycle` in `package.json`
- Add to runner-policy.json as a lane command for `geometry-architect` lane
- Output feeds into `sync-ggd-state.mjs` for state updates

**Does NOT do (human review required):**
- Auto-apply CSS fixes to component files (M4 produces the manifest; human/operator applies)
- Modify lawset equations (lawsets are upstream authority)
- Touch any file outside `site/src/styles/ggd-tokens.css` and `GGD/fixes/`

**Test:** Full cycle runs without error. Token generation produces valid CSS. Fix manifests are machine-readable and actionable.

## 3. File Inventory

### New Files Created
```
GGD/scripts/evaluate-lawset.mjs          ← M1: expression evaluator
GGD/scripts/generate-tokens.mjs          ← M2: CSS token generator
GGD/scripts/compile-fixes.mjs            ← M4: gap-to-fix compiler
GGD/scripts/correction-loop.mjs          ← M5: orchestrator
site/src/styles/ggd-tokens.css           ← M2 output: generated tokens
GGD/equations/lawsets/home.tablet.shell.json        ← M3
GGD/equations/lawsets/home.mobile.shell.json        ← M3
GGD/equations/lawsets/product-family.tablet.shell.json  ← M3
GGD/equations/lawsets/product-family.mobile.shell.json  ← M3
GGD/equations/lawsets/typography.scale.mobile.json  ← M3
GGD/fixes/                               ← M4 output directory
```

### Files Modified
```
site/src/app/globals.css                 ← Replace hardcoded values with token imports
site/package.json                        ← Add ggd:correction-cycle script
CLAW/control-plane/runner-policy.json    ← Register new lane command
GGD/state.json                           ← Update command_binding with new scripts
```

### Files NOT Modified
```
GGD/equations/lawsets/home.desktop.shell.json       ← Authority. Do not touch.
GGD/equations/lawsets/typography.scale.json          ← Authority. Do not touch.
GGD/equations/lawsets/color.contrast.json            ← Authority. Do not touch.
GGD/equations/lawsets/flagship.desktop.shell.json    ← Authority. Do not touch.
GGD/equations/lawsets/product-family.desktop.shell.json ← Authority. Do not touch.
CLAW/scripts/*                                       ← Existing CLAW scripts untouched.
GGD/PROJECT.md, CONVENTIONS.md, etc.                 ← Contract layer untouched.
```

## 4. Execution Order

```
M1 first  → expression evaluator (no dependencies)
M2 second → token generator (depends on M1)
M3 third  → responsive lawsets (depends on M1 for validation)
M4 fourth → gap-to-fix compiler (depends on M1 + verification data)
M5 last   → correction loop (depends on M1, M2, M4)
```

Each module must pass its own tests before the next begins. Commit after each module. Runbook-first: write the implementation, test it, commit it, move on.

## 5. Acceptance Gates

| Gate | Criteria |
|------|----------|
| G1 | `evaluate-lawset.mjs` evaluates all 5 existing lawsets without error |
| G2 | `generate-tokens.mjs` produces valid CSS that `npm run build` accepts |
| G3 | Generated tokens are value-equivalent to current hardcoded `globals.css` values (no visual regression) |
| G4 | Responsive lawsets pass their own constraint sets |
| G5 | `compile-fixes.mjs` produces a fix manifest for `/work/ft` addressing all 14 critical failures |
| G6 | Full correction cycle runs end-to-end without error |
| G7 | After token integration, `npm run build` succeeds and no existing verification scores regress |

## 6. What This Does NOT Do

- Does not redesign the website
- Does not change any lawset equations (those are upstream authority)
- Does not touch the CLAW autonomy runner architecture
- Does not modify existing verification scripts
- Does not auto-apply CSS fixes to React components (produces manifests for human/operator review)
- Does not address contrast contradiction (separate issue, separate PRD)
- Does not create new visual designs — it mechanizes the existing mathematical design system

## 7. Why This Matters

The GGD system was architected correctly: define laws, verify against laws, reject non-compliance. But without the execution layer, the verification loop is open-ended — it finds problems but can't fix them. Building M1-M5 closes the loop and turns the GGD system from a governance framework into a functioning deterministic design machine.

Once this layer exists, the CLAW runner can drive real autonomous refinement: evaluate → generate → build → verify → report, with fix manifests for anything that fails. The operator reviews manifests instead of manually computing CSS values from lawset equations. The agents (Codex or Claude Code) can execute correction cycles instead of filing gap records.

This is the missing construction crew.

---

**END OF PRD**
