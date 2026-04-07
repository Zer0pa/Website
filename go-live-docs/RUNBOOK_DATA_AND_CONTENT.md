# Runbook: Data And Content Pipeline

## Purpose

Turn public GitHub repos into clean lane packets and keep the site truth surfaces credible.

## Inputs

- public `ZPE-*` repos
- key repo files such as:
  - `README.md`
  - `PUBLIC_AUDIT_LIMITS.md`
  - `proofs/FINAL_STATUS.md`
  - `proofs/RELEASE_READINESS_REPORT.md`
  - `AUDITOR_PLAYBOOK.md`
  - `docs/ARCHITECTURE.md`
  - `docs/BENCHMARKS.md`

## Outputs

- normalized lane packets in `site/.cache/packets/`
- Sanity snapshots for site rendering
- a trustworthy homepage/feed for `/`, `/work`, and `/work/[slug]`

## Required Environment

For local-only cache generation:

- no env vars are strictly required

For reliable GitHub discovery:

- `GITHUB_TOKEN`

For Sanity sync:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN`

For frontend runtime Sanity reads:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

## Steps

1. Run ingest:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run ingest
```

If Sanity is configured, sync the refreshed packets:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run sync:sanity
```

2. Inspect the key packets:

- `ZPE-IMC.json`
- `ZPE-IoT.json`
- `ZPE-XR.json`

3. Validate that these fields read cleanly:

- `laneTitle`
- `tagline`
- `authorityState`
- `headlineMetrics`
- `whatThisIs`
- `provedNow`
- `explicitNonClaims`
- `proofAnchors`

4. If packet content is noisy, fix the parser, not the page copy.

5. Rebuild and confirm the site still renders:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run test:parser
npm run build
```

## Parser Quality Rules

- prefer fewer, cleaner fields over large noisy arrays
- headline metrics must actually read like headline metrics
- proof anchors must be normalized paths, not broken relative fragments where avoidable
- confidence scores must not overstate quality
- staged or blocked truth must remain staged or blocked

## GitHub Truth Boundary

Use GitHub as truth for:

- status
- metrics
- proof anchors
- non-claims
- open risks

Do not duplicate those into hardcoded React constants.

Current implementation files that enforce this:

- `site/src/scripts/ingest.ts`
- `site/src/lib/github/discovery.ts`
- `site/src/lib/github/fetcher.ts`
- `site/src/lib/parser/*`
- `site/src/lib/data/lane-data.ts`

## Sanity Boundary

Use Sanity for:

- featured ordering
- editorial wrappers
- related-lane curation
- CTA framing
- optional explanatory narrative

Do not use Sanity to silently overwrite authority-state facts.

## Falsification Checks

- Remove or alter a repo metric and confirm the packet changes on re-ingest.
- Force a repo into weaker truth and confirm the lane degrades instead of staying green.
- Confirm missing proof anchors do not produce fake evidence copy.
- Confirm `ZPE-IoT` remains `STAGED` rather than being flattened into `SUPPORTED`.
- Confirm `ZPE-XR` remains `BLOCKED` when release-readiness text stays negative.

## Exit Gate

This runbook is complete when the three reference lanes `IMC`, `IoT`, and `XR` all render credible packet content without code-level copy patching.
