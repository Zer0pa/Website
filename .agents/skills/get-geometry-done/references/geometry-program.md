# Geometry Program

## Purpose

Upgrade the current deterministic refinement loop into a full geometry-first website system.

Use `Get Physics Done` as an operating pattern, not as a physics runtime:

- copy: `Formulate -> Plan -> Execute -> Verify`
- copy: explicit state, pattern memory, protocols, wave execution
- adapt: physics checks into geometry, typography, color, responsive, and data-truth checks
- reject: physics-domain workflows and global runtime ownership

## Governing Premise

Every page is a constrained field:

- geometry = coordinates, widths, heights, ratios, keylines
- typography = scale, line box, letter spacing, density
- color = measured token system with luminance and contrast
- content = repo-backed truth, not invented copy
- verification = artifacts plus severity-gated rejection

If a decision cannot be expressed as a token, rule, map entry, or testable exception, it is still too subjective.

## Equation Families

- Base unit: choose one spacing unit and express spacing as `n * u`.
- Grid: define columns, shell width, and gutter per breakpoint.
- Type: define a modular scale `t(n) = t0 * r^n`.
- Panels: define aspect-ratio families and allowed exception cases.
- Color: store tokens as numeric values and track contrast thresholds for each pairing.
- Breakpoints: define piecewise rules for desktop, tablet, and mobile instead of manual restyling.

## Existing Repo Strengths

- Reference specs already exist in `site/src/lib/layout/specs.ts`.
- Live DOM measurement already exists in `site/src/scripts/layout-measure.ts`.
- Diff classification and report generation already exist in `site/src/scripts/layout-diff.ts`.
- Repo-driven lane normalization already exists in `site/src/lib/data/` and `site/src/lib/parser/`.

## Missing Upgrade

The current system proves deterministic refinement. The next upgrade is deterministic design:

- move from measured rectangles to governed equation families
- move from hardcoded color choices to a declared color system
- move from route-specific tweaks to page-family laws
- move from artifact generation to artifact-led decision making

## Acceptance Gate

Do not call a route complete unless:

- critical diffs = `0`
- major diffs = `0`
- responsive audit shows no overflow
- route truth still matches repo-backed inputs
- the flagship page remains visibly more specific than the generic lane family
