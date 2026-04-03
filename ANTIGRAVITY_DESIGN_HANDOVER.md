# AntiGravity Design Handover

## Mission

Take over **layout, art direction, visual refinement, and page architecture polish** for the Zer0pa site.

This is **not** a greenfield build anymore. The data plumbing exists. The site is live-data-backed. Your job is to make the pages feel **closer to the stitched references** and to improve composition, hierarchy, spacing, visual rhythm, contrast, and editorial control without breaking the truth surface.

## Governing Objective

The top gate is:

- The site must feel **much closer to the attached reference screenshots** on homepage and flagship lane page.
- It must remain **proof-first**, monochrome, technical, dense, and intentional.
- It must **not** regress into a mock/demo or invented-content UI.
- GitHub-derived content must remain the source of truth for authority surfaces.

Do not trade fidelity for easy cleanup. Do not simplify the architecture into generic SaaS/UI patterns.

## Design Authority

Treat these as sovereign:

- The two attached screenshots in the conversation thread
- [design.md](/Users/Zer0pa/Zer0pa%20Website/design.md)
- [Grok PRD and Design.md thinking.md](/Users/Zer0pa/Zer0pa%20Website/Grok%20PRD%20and%20Design.md%20thinking.md)
- [STATE_OF_PLAY_2026-03-28.md](/Users/Zer0pa/Zer0pa%20Website/STATE_OF_PLAY_2026-03-28.md)
- [DETERMINISTIC_LAYOUT_SYSTEM_PRD.md](/Users/Zer0pa/Zer0pa%20Website/DETERMINISTIC_LAYOUT_SYSTEM_PRD.md)
- [RUNBOOK_MAP_EXTRACTION_AND_DIFF.md](/Users/Zer0pa/Zer0pa%20Website/RUNBOOK_MAP_EXTRACTION_AND_DIFF.md)
- [RUNBOOK_HOMEPAGE_AND_IMC_REFINEMENT.md](/Users/Zer0pa/Zer0pa%20Website/RUNBOOK_HOMEPAGE_AND_IMC_REFINEMENT.md)
- [ANTIGRAVITY_PRD.md](/Users/Zer0pa/Zer0pa%20Website/ANTIGRAVITY_PRD.md)
- [ANTIGRAVITY_PRD_AUGMENTED.md](/Users/Zer0pa/Zer0pa%20Website/ANTIGRAVITY_PRD_AUGMENTED.md)
- [go-live-docs/GO_LIVE_PRD.md](/Users/Zer0pa/Zer0pa%20Website/go-live-docs/GO_LIVE_PRD.md)

Typography lock:

- `Oswald` for mastheads, section heads, large labels, and wordmark-style display treatment
- `Courier` / `Courier New` for system copy, telemetry, labels, body microcopy, and terminal-like surfaces

## Current State

The site is in `/Users/Zer0pa/Zer0pa Website/site`.

What is already true:

- Homepage, work index, flagship lane, proof, about, and contact pages exist.
- The site is backed by parsed GitHub repo content, not fully hardcoded placeholder copy.
- The parser and presentation layers were tightened to reduce broken fragments, badge noise, overlong metric values, and noisy evidence paths.
- The homepage and IMC page are materially closer to the references than before, but still not pixel-perfect.

What is still weak:

- Homepage feature-block composition can be pushed closer to the reference.
- IMC page spacing, proportions, and right-column composition still differ from the reference.
- Some non-IMC lanes still have imperfect copy extraction.
- Some repo-shape / evidence-route presentation is functional but not yet elegant.

## Where The Work Is

### Core app routes

- [site/src/app/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/page.tsx)
- [site/src/app/imc/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/imc/page.tsx)
- [site/src/app/work/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/work/page.tsx)
- [site/src/app/work/[slug]/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/work/%5Bslug%5D/page.tsx)
- [site/src/app/proof/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/proof/page.tsx)
- [site/src/app/about/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/about/page.tsx)
- [site/src/app/contact/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/contact/page.tsx)
- [site/src/app/layout.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/layout.tsx)
- [site/src/app/globals.css](/Users/Zer0pa/Zer0pa%20Website/site/src/app/globals.css)

### Homepage components

- [site/src/components/home/Hero.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/Hero.tsx)
- [site/src/components/home/FlagshipBlock.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/FlagshipBlock.tsx)
- [site/src/components/home/ConstellationGrid.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/ConstellationGrid.tsx)
- [site/src/components/home/ProofLogic.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/ProofLogic.tsx)

### Layout components

- [site/src/components/layout/Header.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/layout/Header.tsx)
- [site/src/components/layout/Footer.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/layout/Footer.tsx)
- [site/src/components/layout/Wordmark.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/layout/Wordmark.tsx)

### Flagship / lane component

- [site/src/components/lane/LaneAuthorityPage.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/lane/LaneAuthorityPage.tsx)

### Data and presentation layer

- [site/src/lib/data/lane-data.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/data/lane-data.ts)
- [site/src/lib/data/presentation.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/data/presentation.ts)
- [site/src/lib/data/status.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/data/status.ts)

### Parser / ingestion

- [site/src/scripts/ingest.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/scripts/ingest.ts)
- [site/src/scripts/test-parser.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/scripts/test-parser.ts)
- [site/src/lib/parser/index.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/parser/index.ts)
- [site/src/lib/parser/identity.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/parser/identity.ts)
- [site/src/lib/parser/metrics.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/parser/metrics.ts)
- [site/src/lib/parser/proofAnchors.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/parser/proofAnchors.ts)
- [site/src/lib/parser/shared.ts](/Users/Zer0pa/Zer0pa%20Website/site/src/lib/parser/shared.ts)

### Cached live packets

- `/Users/Zer0pa/Zer0pa Website/site/.cache/packets/*.json`

Use these for spot-checking content shape:

- [site/.cache/packets/ZPE-IMC.json](/Users/Zer0pa/Zer0pa%20Website/site/.cache/packets/ZPE-IMC.json)
- [site/.cache/packets/ZPE-XR.json](/Users/Zer0pa/Zer0pa%20Website/site/.cache/packets/ZPE-XR.json)
- [site/.cache/packets/ZPE-Neuro.json](/Users/Zer0pa/Zer0pa%20Website/site/.cache/packets/ZPE-Neuro.json)
- [site/.cache/packets/ZPE-IoT.json](/Users/Zer0pa/Zer0pa%20Website/site/.cache/packets/ZPE-IoT.json)

## What I Changed Before Handing Over

### Design / page architecture

- Reframed the homepage into:
  - large hero
  - flagship dossier block
  - compact lane grid
  - proof logic section
- Reworked the flagship lane page into a reusable authority-surface component.
- Shifted the visual system toward dense monochrome panels, thin borders, technical labels, and display-weight Oswald mastheads.
- Replaced previous mock-style composition with layouts that are closer to the references.

### Data cleanup

- Improved identity extraction to use meaningful blocks, not only line fragments.
- Reduced noise from markdown badges, command-line fragments, and weak section placeholders.
- Tightened metric value normalization so cards stop showing giant composite strings.
- Tightened proof-anchor extraction and path normalization.
- Added presentation filtering so homepage/lane copy is less broken and less redundant.

## Important Guardrails

Do not break these:

- No fake/hardcoded authority claims
- No replacing GitHub-derived truth with invented marketing copy
- No generic “startup” restyling
- No soft pastel / glossy SaaS / dashboard tropes
- No typography drift away from `Oswald` + `Courier`
- No simplification that erases the proof-first / authority-surface feel

If a section needs better composition, solve it with:

- hierarchy
- spacing
- clipping/truncation rules
- editorial framing
- panel redesign
- better component proportions

Do not solve it by making up nicer content.

## What AntiGravity Should Focus On Now

### Primary work

1. Refine the homepage so it reads much closer to the first stitched reference.
2. Refine the IMC page so it reads much closer to the second stitched reference.
3. Improve visual hierarchy, spacing, and art direction across all panels.
4. Improve the component architecture so the same design language can scale across other lane pages.

### Specific design targets

- Make the hero feel more exact:
  - line breaks
  - sizing
  - left-edge alignment
  - ghosted `PROOF-FIRST`
  - CTA position
  - telemetry rail placement
- Improve the homepage flagship dossier:
  - stronger proportions
  - more convincing media surface
  - neater telemetry block
  - tighter metric strip
  - cleaner status/meta rail
- Push the homepage lane cards toward the reference:
  - stronger card rhythm
  - more credible density
  - better text clipping
  - better top/bottom anchors
- Push the IMC page toward the stitched reference:
  - stronger top hero split
  - cleaner subject-identity block
  - more convincing evidence-routes / repo-shape pairing
  - more precise spacing in proof assertions / explicit non-claims
  - better CTA band proportions
- Improve footer and header micro-proportions so they feel designed, not merely functional.

## What AntiGravity Should Not Spend Time On First

- Major parser surgery unless blocked by clearly broken copy
- Sanity/editorial architecture changes
- New page types beyond the existing surface
- Motion-heavy experiments
- 3D/canvas embellishment

The next phase is **refinement**, not architecture churn.

## Current Routes To Review

- `/`
- `/imc`
- `/work`
- `/work/imc`
- `/proof`
- `/about`
- `/contact`

## Local Run Commands

From `/Users/Zer0pa/Zer0pa Website/site`:

```bash
npm install
npm run ingest
npm run test:parser
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Useful during design work:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Validation Gate

Before claiming success:

- `npm run test:parser` passes
- `npm run build` passes
- homepage still uses live parsed data
- `/`, `/work`, `/imc`, `/proof`, `/about`, `/contact`, and `/work/imc` all render
- visual result is meaningfully closer to the two attached screenshots
- no regression back to fake placeholder surfaces

## Honest Remaining Gaps At Handover

- Homepage is much closer, but not yet exact.
- IMC page is structurally right enough to refine, but still not reference-close enough in proportion and editorial control.
- Some lane packets outside IMC still need future cleanup, but that is now secondary to design refinement.

## Suggested Prompt For AntiGravity

Use this directly if helpful:

> Take over as a virtuoso web designer and art director for the Zer0pa website in `/Users/Zer0pa/Zer0pa Website/site`. The data plumbing and live GitHub-backed content pipeline already exist. Your job is to refine layout, art direction, hierarchy, spacing, panel composition, typography usage, clipping, density, and overall page architecture so the homepage and flagship IMC page move materially closer to the two stitched reference screenshots already supplied. Treat those screenshots, `design.md`, `Grok PRD and Design.md thinking.md`, `ANTIGRAVITY_PRD_AUGMENTED.md`, and `ANTIGRAVITY_DESIGN_HANDOVER.md` as design authority. Preserve the existing live-data truth pipeline. Do not replace live authority surfaces with invented copy. Keep Oswald for mastheads and Courier for system copy. Focus on `/`, `/imc`, `/work`, and the shared components/CSS that drive those pages. Validate with `npm run test:parser`, `npm run build`, and local route checks before stopping. Prioritize visual refinement and page architecture polish, not new features.
