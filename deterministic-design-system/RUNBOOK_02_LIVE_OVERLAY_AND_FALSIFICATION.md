# Runbook 02 — Live Overlay, Diff, and Falsification

## Goal

Measure the live coded pages, compare them to the reference maps, and iterate until the diff is acceptably closed.

## Output Files

- `maps/live/home.geometry.json`
- `maps/live/home.color.json`
- `maps/live/imc.geometry.json`
- `maps/live/imc.color.json`
- `maps/diff/home.diff.json`
- `maps/diff/imc.diff.json`
- `reports/home.refinement.md`
- `reports/imc.refinement.md`
- `reports/verification-report.md`

## Required Instrumentation

Add stable `data-spec` attributes to measured components before diffing.

Suggested first hook set:

- `home.header.logo`
- `home.header.nav`
- `home.hero.statusbar`
- `home.hero.heading`
- `home.hero.body`
- `home.hero.cta`
- `home.hero.telemetry`
- `home.flagship.shell`
- `home.flagship.media`
- `home.flagship.summary`
- `home.flagship.metrics`
- `home.index.grid`
- `home.proof.logic`
- `imc.hero.title`
- `imc.hero.identity`
- `imc.hero.authority`
- `imc.metric.row`
- `imc.proof.assertions`
- `imc.nonclaims`
- `imc.modality.snapshot`
- `imc.evidence.routes`
- `imc.repo.shape`
- `imc.related.lanes`
- `imc.cta.band`

## Procedure

1. Run local site.
2. Capture live page at the same viewport as the reference.
3. Measure all `data-spec` surfaces.
4. Export geometry and color maps.
5. Compare against reference maps.
6. Classify every delta by severity.
7. Patch code.
8. Repeat until critical and major diffs are closed.

## Falsification Rules

Reject completion if any of the following remain:

- incorrect page substrate or border palette
- hero line breaks differ materially from reference
- panel ratios differ materially from reference
- proof/evidence sections drift into generic dashboard layout
- typography leaves the `Oswald` + `Courier` lock
- live truth surfaces are replaced by invented copy

## Required Verification Commands

From [/Users/Zer0pa/Zer0pa Website/site](/Users/Zer0pa/Zer0pa%20Website/site):

```bash
npm run ingest
npm run test:parser
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

## Pass Condition

- no critical diffs
- no major diffs
- build passes
- parser tests pass
- live routes still render

