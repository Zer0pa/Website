# Runbook: Page Implementation

## 1. Purpose

Translate the PRD and the attached screenshots into exact route-by-route implementation work.

## 2. Global Layout Rules

- strict grid
- large negative space
- no rounded-card SaaS feel
- monochrome only
- Oswald only for mastheads
- Courier only for everything else
- dense technical modules, not airy marketing cards

## 2.1 Current Implementation Inventory

Current route files:

- `site/src/app/page.tsx`
- `site/src/app/work/page.tsx`
- `site/src/app/work/[slug]/page.tsx`

Current key components:

- `site/src/components/layout/Header.tsx`
- `site/src/components/layout/Footer.tsx`
- `site/src/components/home/Hero.tsx`
- `site/src/components/home/FlagshipBlock.tsx`
- `site/src/components/home/ConstellationGrid.tsx`
- `site/src/components/home/ArchitectureExplainer.tsx`
- `site/src/components/home/ProofLogic.tsx`
- `site/src/components/home/SubstrateNarrative.tsx`

Missing required route files to create:

- `site/src/app/imc/page.tsx`
- `site/src/app/proof/page.tsx`
- `site/src/app/about/page.tsx`
- `site/src/app/contact/page.tsx`

## 3. Homepage Build Order

Implement or revise in this order:

1. `Header`
2. `Hero`
3. `FlagshipBlock`
4. `ConstellationGrid`
5. `ProofLogic`
6. `Footer`

Treat `ArchitectureExplainer` and `SubstrateNarrative` as optional only if they can be made visually subordinate to the attached reference rather than diluting it.

### Header

- use the ZER0PA wordmark
- nav must only link to implemented routes
- keep controls small, mono, and quiet

### Hero

- small top-left system line
- giant multi-line masthead
- short Courier intro paragraph
- controlled CTA pair
- right-side micro telemetry stack

### Flagship Dossier

- make IMC a heavy technical surface
- show authority state, two to four real metrics, sync timestamp, proof-oriented summary
- avoid generic card UI

### System Components Index

- grid of lane cards
- each card shows code/index, authority state, lane name, short description, confidence or sync cue

### Proof Logic

- two compact evidentiary text blocks
- one visual block or archival image surface

### Footer

- operations copy
- site sync/source/version line
- legal/proof/source links

## 4. `/imc` Requirements

- custom flagship page, not generic template
- must follow the lane-page reference more closely than any other route
- manual editorial augmentation is allowed, but machine-owned truth surfaces must remain live
- source truth should still come from the `ZPE-IMC` lane packet for authority, metrics, proof anchors, and non-claims
- page file target: `site/src/app/imc/page.tsx`

## 5. `/work` Requirements

- ordered lane index
- authority-state-forward presentation
- no filler sections
- current file: `site/src/app/work/page.tsx`
- must not link to routes that do not exist

## 6. `/work/[slug]` Requirements

- top row: lane id left, authority block right
- next row: four metric cards
- next row: proof assertions left, explicit non-claims right
- next row: modality snapshot full width
- next row: evidence routes and repo shape paired
- next row: proof anchor terminal
- next row: related lanes
- next row: CTA/footer

## 7. `/proof` Requirements

- explain how to interpret authority
- explain non-claims and open risks
- explain proof anchors and verification path
- give concrete examples from real lanes
- page file target: `site/src/app/proof/page.tsx`

## 8. `/about` Requirements

- compressed narrative only
- no timeline dump
- no inflated philosophy copy
- page file target: `site/src/app/about/page.tsx`

## 9. `/contact` Requirements

- licensing
- partnership
- research
- clean routing language
- page file target: `site/src/app/contact/page.tsx`

## 10. Font Implementation Checklist

- self-host `Oswald Regular` and `Oswald Medium`
- verify browser actually loads local font files
- verify no unexpected sans fallback appears in mastheads
- keep Courier as the body/UI/data family

## 11. Responsive Rules

- the desktop composition is the primary reference
- mobile must preserve severity and hierarchy, not collapse into generic stacked marketing blocks
- mastheads can reflow, but the language must stay heavy and structural

## 12. Stop Conditions

Do not call page implementation done if:

- homepage does not resemble the attached homepage reference
- lane page does not resemble the attached lane page reference
- nav includes dead links
- headline modules are still using placeholder composition
- `/imc`, `/proof`, `/about`, or `/contact` are still missing
