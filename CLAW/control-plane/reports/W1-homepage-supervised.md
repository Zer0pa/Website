# W1 Homepage Supervised Report

## Scope

- lane: `homepage-fidelity`
- route: `/`
- slice: header and hero fidelity closure
- file touched: `site/src/app/globals.css`
- mode: supervised local-only

## Baseline

- source report: `Website-main/deterministic-design-system/reports/home.verification.md`
- critical: `0`
- major: `0`
- minor: `8`
- cosmetic: `4`

## Attempt A

Changes:

- tightened wordmark geometry
- adjusted hero heading and body typography
- narrowed telemetry rail
- reduced shared section top spacing

Result:

- build: pass
- parser: pass
- responsive: pass
- layout: `1 critical`, `1 major`, `4 minor`, `6 cosmetic`

Verdict:

- rejected
- reason: global section spacing improved some counts but introduced downstream vertical displacement in `home.proof.logic` and `home.index.grid`

## Attempt B

Changes:

- reverted the section-spacing change
- kept the wordmark, hero, and telemetry refinements

Result:

- build: pass
- parser: pass
- responsive: pass
- layout: `0 critical`, `0 major`, `7 minor`, `5 cosmetic`

Verdict:

- candidate kept in the lane
- not yet promoted

## Observed Learning

- the evaluator correctly rejected a visually plausible but structurally harmful global spacing change
- bounded rollback preserved the useful part of the attempt
- route-level fidelity improved slightly, but the remaining misses are now concentrated in known geometry zones rather than page-wide drift

## Remaining Top Diffs

- `home.flagship.media`
- `home.flagship.summary`
- `home.header.logo`
- `home.hero.telemetry`
- `home.index.grid`
- `home.hero.body`
- `home.hero.heading`

## Recommended Next Slices

1. isolate the flagship vertical alignment law
2. isolate the wordmark width law
3. isolate hero typography and telemetry as a separate slice

## Promotion Decision

Do not promote this lane yet.

Required before promotion:

- one more non-regressing homepage pass
- systems QA replay from `integration`
- complete handoff for the accepted homepage candidate
