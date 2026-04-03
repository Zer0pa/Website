# Deterministic Design System PRD

## Purpose

Turn the existing AntiGravity implementation plan into a **reusable, deterministic screenshot-to-code refinement system** for Zer0pa.

The first execution slice is intentionally narrow:

- `/` homepage
- `/imc` flagship lane page

Do not expand to broader page families until those two pages pass the acceptance gates.

## Parent Inputs

- [/Users/prinivenpillay/.gemini/antigravity/brain/6fc89a61-cf41-4f0a-a794-14388a27c6bb/implementation_plan.md.resolved](/Users/prinivenpillay/.gemini/antigravity/brain/6fc89a61-cf41-4f0a-a794-14388a27c6bb/implementation_plan.md.resolved)
- [ANTIGRAVITY_DESIGN_HANDOVER.md](/Users/Zer0pa/Zer0pa%20Website/ANTIGRAVITY_DESIGN_HANDOVER.md)
- [design.md](/Users/Zer0pa/Zer0pa%20Website/design.md)
- [Grok PRD and Design.md thinking.md](/Users/Zer0pa/Zer0pa%20Website/Grok%20PRD%20and%20Design.md%20thinking.md)
- [go-live-docs/GO_LIVE_PRD.md](/Users/Zer0pa/Zer0pa%20Website/go-live-docs/GO_LIVE_PRD.md)

## State Of Play

### What is already done

- The site exists and runs in [/Users/Zer0pa/Zer0pa Website/site](/Users/Zer0pa/Zer0pa%20Website/site).
- The data pipeline is real:
  - GitHub repo discovery
  - markdown ingestion
  - parser normalization
  - packet cache
  - live rendering
- Typography and page architecture are materially closer to the references than before.
- Homepage and `/imc` are in the correct family now, but not yet reference-close enough.

### What is still weak

- The existing AntiGravity plan is partly a **manual screenshot critique**, not yet a **deterministic system**.
- Its fixed measurements are useful as provisional reference notes, but too brittle to serve as a reusable engine.
- The live code still needs:
  - tighter geometry matching
  - better panel proportions
  - cleaner spatial rhythm
  - cleaner evidence/repo-shape composition
  - a rigorous falsification loop instead of visual guesswork

## Assessment Of The Existing Implementation Plan

### What it gets right

- It correctly treats geometry and colour as measurable surfaces.
- It correctly insists on reference-first comparison.
- It correctly demands falsification loops rather than “looks good enough”.
- It correctly narrows focus to one page family first.

### What it gets wrong

- It hardcodes one manual measurement set directly into the PRD instead of defining how measurements are produced and verified.
- It mixes three different artifact types:
  - provisional reference notes
  - execution instructions
  - acceptance criteria
- It does not define stable machine-readable outputs for geometry, colour, and refinement diffs.
- It does not define a live DOM measurement layer tied to the codebase.
- It does not distinguish:
  - design tokens
  - reusable layout rules
  - page-specific measurements

## Governing Principle

This system must produce **artifacts**, not vibes.

For each target page, the system must generate:

1. `reference-geometry-map.json`
2. `reference-color-map.json`
3. `live-geometry-map.json`
4. `live-color-map.json`
5. `diff-map.json`
6. `refinement-map.md`
7. `verification-report.md`

If those artifacts do not exist, the work is not deterministic.

## System Architecture

### A. Reference Intake Layer

Inputs:

- reference screenshot
- reference viewport
- target route
- page identifier

Outputs:

- normalized page spec id
- viewport spec
- raw reference asset registry

### B. Reference Mapping Layer

Produces the two sovereign maps:

- geometry map
- colour map

Each element entry must carry:

- `id`
- `page`
- `selectorHint`
- `role`
- `x`
- `y`
- `width`
- `height`
- `zIndex`
- `textContent`
- `fontFamily`
- `fontSize`
- `fontWeight`
- `lineHeight`
- `letterSpacing`
- `textColor`
- `backgroundColor`
- `borderColor`
- `borderWidth`
- `opacity`
- `notes`

Coordinates must be stored both as:

- absolute pixels at the reference viewport
- normalized ratios relative to viewport width/height

### C. Live Measurement Layer

This layer measures the coded page using deterministic selectors.

Requirement:

- add stable `data-spec` hooks in code for measurable elements

Examples:

- `data-spec="home.header.logo"`
- `data-spec="home.hero.heading"`
- `data-spec="home.hero.telemetry"`
- `data-spec="home.flagship.block"`
- `data-spec="imc.hero.title"`
- `data-spec="imc.proof.assertions"`

Without stable measurement hooks, diffing becomes brittle.

### D. Diff Engine

Compare reference maps against live maps and emit:

- geometry deltas
- color deltas
- typography deltas
- missing elements
- unexpected elements

Diff output must classify severity:

- `critical`
- `major`
- `minor`
- `cosmetic`

### E. Refinement Layer

Convert the diff into an actionable patch plan.

A refinement item must say:

- what is wrong
- where it lives in code
- which map entry it corresponds to
- what token/layout/component change closes the gap
- how to verify the fix

### F. Falsification Layer

After every patch cycle:

1. rebuild
2. re-measure
3. regenerate diff
4. reject pass narratives if critical/major diffs remain

## Artifact Locations

Store system artifacts here:

- [/Users/Zer0pa/Zer0pa Website/deterministic-design-system/maps/reference](/Users/Zer0pa/Zer0pa%20Website/deterministic-design-system/maps/reference)
- [/Users/Zer0pa/Zer0pa Website/deterministic-design-system/maps/live](/Users/Zer0pa/Zer0pa%20Website/deterministic-design-system/maps/live)
- [/Users/Zer0pa/Zer0pa Website/deterministic-design-system/maps/diff](/Users/Zer0pa/Zer0pa%20Website/deterministic-design-system/maps/diff)
- [/Users/Zer0pa/Zer0pa Website/deterministic-design-system/reports](/Users/Zer0pa/Zer0pa%20Website/deterministic-design-system/reports)

## Code Surfaces To Instrument

Primary files:

- [site/src/app/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/page.tsx)
- [site/src/app/imc/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/imc/page.tsx)
- [site/src/components/home/Hero.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/Hero.tsx)
- [site/src/components/home/FlagshipBlock.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/FlagshipBlock.tsx)
- [site/src/components/home/ConstellationGrid.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/ConstellationGrid.tsx)
- [site/src/components/home/ProofLogic.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/ProofLogic.tsx)
- [site/src/components/lane/LaneAuthorityPage.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/lane/LaneAuthorityPage.tsx)
- [site/src/app/globals.css](/Users/Zer0pa/Zer0pa%20Website/site/src/app/globals.css)

## Design Token Rules

These are reusable system rules, not screenshot-specific measurements:

- `Oswald` for mastheads and display heads
- `Courier` for system copy and telemetry
- off-black page substrate, not pure black unless intentionally isolated
- thin borders
- compact uppercase system microcopy
- heavy emphasis on spacing, not decoration
- no gradients, rainbow accents, neon cyberpunk, glassmorphism, or generic startup polish

## Acceptance Gates

### Page gate

For each target page:

- no `critical` geometry diffs
- no `major` color/token diffs
- no fake copy introduced
- no hardcoded replacement of live truth surfaces

### System gate

- `npm run test:parser` passes
- `npm run build` passes
- route renders still work for `/`, `/imc`, `/work`, `/proof`, `/about`, `/contact`

### Visual gate

Human review should conclude:

- “reference-close”

Not:

- “better than before”
- “in the same spirit”
- “good enough”

## Recommended Sub-Agent Roles

### 1. Design Systems Architect

Owns:

- PRD integrity
- artifact schema
- token/rule separation
- acceptance gates

### 2. Reference Mapper

Owns:

- geometry map
- colour map
- viewport normalization

### 3. Live Diff Verifier

Owns:

- live capture
- DOM measurement
- diff generation
- falsification reports

### 4. Design Executor

Owns:

- CSS/component patching
- composition refinement
- structure alignment

## First Execution Slice

Only after the maps and diff artifacts exist:

1. instrument homepage and `/imc` with stable `data-spec` hooks
2. build reference maps
3. build live maps
4. generate diff maps
5. patch homepage
6. patch `/imc`
7. run falsification loop

No broader rollout before those gates are met.

