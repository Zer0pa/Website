# Runbook 03 — First Execution Slice

## Scope

Only:

- homepage `/`
- flagship lane `/imc`

## Current Repo Surfaces

Primary implementation files:

- [site/src/app/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/page.tsx)
- [site/src/app/imc/page.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/app/imc/page.tsx)
- [site/src/components/home/Hero.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/Hero.tsx)
- [site/src/components/home/FlagshipBlock.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/FlagshipBlock.tsx)
- [site/src/components/home/ConstellationGrid.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/ConstellationGrid.tsx)
- [site/src/components/home/ProofLogic.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/home/ProofLogic.tsx)
- [site/src/components/lane/LaneAuthorityPage.tsx](/Users/Zer0pa/Zer0pa%20Website/site/src/components/lane/LaneAuthorityPage.tsx)
- [site/src/app/globals.css](/Users/Zer0pa/Zer0pa%20Website/site/src/app/globals.css)

## Execution Order

1. Add deterministic `data-spec` hooks to measurable surfaces.
2. Create reference maps for `/` and `/imc`.
3. Create live maps for `/` and `/imc`.
4. Generate refinement reports.
5. Patch homepage layout and proportions first.
6. Patch `/imc` second.
7. Re-run falsification loop after each patch wave.

## What To Improve First

### Homepage

- hero spatial proportions
- hero rail alignment
- flagship dossier ratios
- card density and clipping
- proof logic panel composition

### IMC

- hero split and page head rhythm
- subject-identity/editorial compression
- evidence-routes / repo-shape composition
- proof/non-claims panel spacing
- CTA band proportion and footer rhythm

## Non-Goals For This Slice

- new page types
- non-flagship lane redesign
- parser overhauls beyond what is required to stop visibly broken copy
- experimental motion systems

## Definition Of Done For This Slice

- homepage is reference-close
- `/imc` is reference-close
- both pages survive parser/build checks
- system artifacts exist and can be reused for the next page family

