# Augmented Deterministic Screenshot-to-Code PRD

**Date:** 2026-03-28  
**Base PRD:** `/Users/prinivenpillay/.gemini/antigravity/brain/6fc89a61-cf41-4f0a-a794-14388a27c6bb/implementation_plan.md.resolved`  
**Current App:** `/Users/Zer0pa/Zer0pa Website/site`  
**Scope Gate:** Homepage first. Flagship IMC second. Do not expand until homepage gate is materially closed.

## 0. State Of Play

The current implementation is not a blank slate. It has useful assets already in place:

- The site architecture exists in Next.js and routes render.
- The GitHub-backed ingestion/parser/presentation pipeline exists.
- The visual system has already moved partway toward the reference.
- The implementation plan has already influenced the current CSS and component structure.

The problem is not “no progress.” The problem is that the current system is still too ad hoc and too screenshot-literal in the wrong places.

### Honest verdict

- **Data/plumbing:** good enough to freeze while we refine the shell
- **Homepage geometry/style:** roughly 60-70% there
- **Flagship IMC geometry/style:** behind homepage and still structurally noisy
- **Deterministic refinement system:** not yet built

## 1. What The Base PRD Gets Right

The supplied implementation plan is strong on intent:

- It correctly demands measurement, not taste-only tweaking.
- It correctly separates geographic map, colour map, and refinement map.
- It correctly demands falsification loops.
- It correctly treats this as enterprise-grade work instead of improvisation.

Keep those principles.

## 2. What Must Be Fixed In The Base PRD

The supplied plan is not sufficient as-is because it has these failure modes:

### 2.1 It conflates shell with content

It hardcodes values like component names, metric wording, and dossier text that are now driven by live repo data.

That is unacceptable. The system must distinguish between:

- **reference shell**: geometry, hierarchy, visual treatment, spacing, panels, typography, token use
- **live truth surface**: actual titles, metrics, non-claims, proof anchors, status labels

### 2.2 It is not yet a reusable system

The plan contains measurements, but not the machinery that turns those measurements into an executable diff process.

Missing pieces:

- canonical element ids
- page-map schema
- live DOM extraction spec
- delta thresholds
- acceptance gates by category
- issue log / refinement queue format

### 2.3 It is too screenshot-specific in the wrong layer

Some measurements belong in a page blueprint. Others belong in global design tokens. Others belong in shared component rules.

If these are mixed, AntiGravity will keep making local edits without building a repeatable system.

### 2.4 It is not yet protecting the live-data architecture strongly enough

We cannot “match the screenshot” by replacing live content blocks with static art-copy.

The system must enforce:

- data shape survives
- shell can refine
- layout can constrain/truncate/reframe
- truth content stays authoritative

## 3. Governing Principle

**The shell is allowed to become more exact. The truth surface is not allowed to become more fake.**

This means:

- Geometry can change.
- Spacing can change.
- Visual hierarchy can change.
- Panel composition can change.
- Token values can change.
- Copy can be clipped or editorially framed.

But:

- repo-derived authority state remains machine-owned
- repo-derived metrics remain machine-owned
- repo-derived non-claims remain machine-owned
- repo-derived proof anchors remain machine-owned

## 4. The Augmented System Architecture

The system must create and maintain six artifacts for each page under refinement.

### A. Reference Map

The reference screenshot translated into structured measurements.

Contains:

- viewport
- element ids
- bounding boxes
- spatial relationships
- alignment lines
- font role
- token role
- z-index/layer role

### B. Colour Map

The reference screenshot translated into token-level colour rules.

Contains:

- page background
- panel background
- media background
- border colours
- text colours by semantic role
- contrast constraints
- off-black legibility notes

### C. Component Grammar

The shared reusable design rules that are **not** page-specific.

Examples:

- header strip grammar
- masthead grammar
- panel grammar
- button grammar
- telemetry grammar
- proof-card grammar
- footer grammar

### D. Live DOM Map

The actual coded page measured from the running site.

This must be extracted from the live route using stable ids and computed layout/style values.

Contains:

- element bounding boxes
- computed font size / line-height / letter-spacing
- computed colours
- visibility / clipping state
- content box sizes

### E. Delta Map

A machine-readable comparison between the Reference Map and the Live DOM Map.

Contains:

- geometry deltas
- spacing deltas
- typography deltas
- colour deltas
- missing elements
- extra elements
- severity

### F. Refinement Map

The prioritized execution queue derived from the Delta Map.

Contains:

- issue id
- affected route
- affected element id
- current state
- target state
- fix strategy
- owner
- verification rule

## 5. Separation Of Concerns

This is the most important augmentation.

### 5.1 Global design tokens

These belong in CSS variables / design system:

- background values
- panel/background/border hierarchy
- masthead font family + weight ranges
- ui font family + sizing bands
- button treatment
- micro-label treatment
- status colours
- default grid gaps / shell padding ranges

### 5.2 Shared component rules

These belong in component architecture:

- header structure
- footer structure
- hero heading line logic
- telemetry rail structure
- dossier frame structure
- proof-card structure
- related-lanes card structure

### 5.3 Page-specific measurements

These belong only in page reference maps:

- exact hero offsets
- exact dossier split ratios
- exact section Y positions
- exact width/height targets
- exact visual placement of telemetry tables
- exact proof-logic split

Do not encode page-specific values as permanent global tokens unless they truly generalize.

## 6. Required File System For The System

These files should exist inside the app repo as the system is built:

### Contracts / maps

- `/Users/Zer0pa/Zer0pa Website/site/design-system/reference-map.schema.json`
- `/Users/Zer0pa/Zer0pa Website/site/design-system/home.reference-map.json`
- `/Users/Zer0pa/Zer0pa Website/site/design-system/home.color-map.json`
- `/Users/Zer0pa/Zer0pa Website/site/design-system/home.refinement-map.json`
- `/Users/Zer0pa/Zer0pa Website/site/design-system/imc.reference-map.json`
- `/Users/Zer0pa/Zer0pa Website/site/design-system/imc.color-map.json`
- `/Users/Zer0pa/Zer0pa Website/site/design-system/imc.refinement-map.json`

### Scripts

- `/Users/Zer0pa/Zer0pa Website/site/src/scripts/design/extract-live-map.ts`
- `/Users/Zer0pa/Zer0pa Website/site/src/scripts/design/compute-delta.ts`
- `/Users/Zer0pa/Zer0pa Website/site/src/scripts/design/render-refinement-report.ts`
- `/Users/Zer0pa/Zer0pa Website/site/src/scripts/design/check-acceptance.ts`

### Instrumentation target

Stable `data-map-id` hooks should be added to the live page for all critical reference elements.

## 7. Agent Roles

These are the correct sub-agent roles. AntiGravity should use them explicitly.

### 7.1 Reference Cartographer

Responsibility:

- turns screenshot into structured reference map
- does not edit code

Output:

- `*.reference-map.json`

### 7.2 Colour / Legibility Analyst

Responsibility:

- extracts colour hierarchy and contrast constraints
- flags off-black legibility errors

Output:

- `*.color-map.json`

### 7.3 Live Map Extractor

Responsibility:

- measures the current coded page
- emits DOM map from real render

Output:

- live measurement JSON

### 7.4 Delta Verifier

Responsibility:

- compares reference vs live
- emits severity-ranked delta list

Output:

- refinement map

### 7.5 Design Executor

Responsibility:

- edits layout/components/CSS to close prioritized deltas
- cannot alter machine-owned content semantics

Output:

- code changes only

### 7.6 Falsifier

Responsibility:

- reruns extraction/diff after every wave
- rejects any “looks fine” narrative if delta remains above threshold

Output:

- pass/fail gate report

## 8. Deterministic Culture Rules

1. No claiming accuracy without a delta report.
2. No “design intuition” edits without identifying the target element id and delta category.
3. No content hardcoding to fake reference similarity.
4. No moving to the next page while the current page still has major unresolved high-severity deltas.
5. No pass narrative with mixed evidence.

## 9. Execution Order

### Phase A: Homepage Only

Goal:

- Build the system on the homepage until the refinement loop is stable.

Steps:

1. Create homepage reference map
2. Create homepage colour map
3. Instrument homepage with `data-map-id`
4. Extract homepage live DOM map
5. Compute homepage delta map
6. Fix highest-severity geometry/token issues
7. Rerun falsification loop
8. Continue until homepage is materially closed

### Phase B: Flagship IMC

Only after homepage passes the agreed threshold:

1. Create IMC reference map
2. Create IMC colour map
3. Instrument IMC page
4. Extract live IMC DOM map
5. Compute delta
6. Fix
7. Falsify

### Phase C: Shared System Rollout

Only after A and B:

- propagate validated component grammar to `/work`, other lane pages, and the remaining surfaces

## 10. Acceptance Gates

### Homepage gate

Cannot pass unless:

- geometry diffs for critical elements are within threshold
- colour/token diffs are within threshold
- hierarchy reads closer to reference at first glance
- live data still renders correctly
- no fake placeholder content has replaced the truth surface

### IMC gate

Cannot pass unless:

- top hero split feels reference-close
- metric strip reads correctly
- proof / non-claims panels carry the right weight relationship
- evidence / repo-shape composition is credible
- CTA band and footer proportions are controlled

## 11. Threshold Model

Use category-based thresholds, not one blanket threshold.

- Critical geometry: <= 4px or <= 0.5vw
- Secondary geometry: <= 8px or <= 1vw
- Typography size delta: <= 1px
- Colour delta: within a small visible tolerance, with special scrutiny for off-blacks
- Missing critical reference element: automatic fail

## 12. Immediate Next Slice

The correct next slice is:

1. Freeze the current live-data plumbing.
2. Build the deterministic refinement system around the **homepage first**.
3. Only after homepage closes should IMC be refined with the same system.

Do **not** expand to more pages first.

