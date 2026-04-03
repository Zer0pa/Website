# Runbook: Deterministic Homepage-First Refinement

## Purpose

Operationalize the augmented PRD into a concrete execution loop that AntiGravity can run without drifting.

## 1. Freeze What Must Not Move

Do not rewrite the data pipeline during design refinement unless broken content makes a section unusable.

Freeze these as the current technical substrate:

- `/Users/Zer0pa/Zer0pa Website/site/src/lib/parser/*`
- `/Users/Zer0pa/Zer0pa Website/site/src/lib/data/lane-data.ts`
- `/Users/Zer0pa/Zer0pa Website/site/src/lib/data/presentation.ts`
- `/Users/Zer0pa/Zer0pa Website/site/src/scripts/ingest.ts`

## 2. Homepage-Only First Wave

Target route:

- `/`

Target files:

- `/Users/Zer0pa/Zer0pa Website/site/src/app/page.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/components/home/Hero.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/components/home/FlagshipBlock.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/components/home/ConstellationGrid.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/components/home/ProofLogic.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/components/layout/Header.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/components/layout/Footer.tsx`
- `/Users/Zer0pa/Zer0pa Website/site/src/app/globals.css`

## 3. Required Deliverables Per Iteration

Each refinement wave must produce:

1. Updated homepage reference map
2. Updated homepage colour map
3. Updated homepage refinement map
4. Code changes
5. Verification output

If a wave does not produce those, it is not deterministic enough.

## 4. Reference Map Procedure

For the homepage, measure and record:

- header strip
- wordmark
- nav row
- CTA button
- status bar
- hero line boxes
- body text box
- telemetry rail
- dossier outer frame
- dossier left/right ratio
- metric strip
- system components grid
- proof logic split
- footer columns

Each element gets a stable id like:

- `home.header.wordmark`
- `home.hero.status_bar`
- `home.hero.h1.line_1`
- `home.hero.h1.line_2`
- `home.hero.h1.line_3_ghost`
- `home.hero.h1.line_4`
- `home.dossier.left_panel`
- `home.dossier.metric_strip`
- `home.grid.card_01`
- `home.proof.visual`
- `home.footer.links`

## 5. Live Map Procedure

Instrument the live page with `data-map-id` for all critical measured elements.

Then extract:

- bounding box
- computed styles
- text metrics
- visibility
- content size

Do not compare screenshots by eye only.

## 6. Refinement Procedure

Order of fixing:

1. background / off-black hierarchy
2. header strip geometry
3. hero line breaks, size, position
4. dossier ratio and panel treatment
5. system grid card proportions
6. proof logic split
7. footer

Do not jump randomly between low-priority elements.

## 7. Falsification Loop

After every wave:

1. run build
2. render page
3. extract live map
4. compute deltas
5. reject the wave if high-severity deltas remain unresolved

## 8. Homepage Pass Gate

Homepage may be treated as “system-good-enough-to-port” only when:

- shell is materially reference-close
- delta report shows no unresolved high-severity geometry/token issues
- live data still flows correctly
- the design feels intentional without needing content fakery

## 9. Only Then Move To IMC

Once homepage passes:

- repeat the exact same system for `/imc`
- do not invent a new process for the flagship page

