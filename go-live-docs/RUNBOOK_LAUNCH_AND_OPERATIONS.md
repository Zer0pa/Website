# Runbook: Launch And Operations

## Purpose

Document how the site is deployed, updated, monitored, and corrected after launch.

## Pre-Launch Requirements

- production environment variables configured
- GitHub token configured for higher-rate discovery and fetch reliability
- Sanity dataset and project configured
- packet sync path verified
- revalidation strategy verified
- rollback path defined

Required env vars:

- `GITHUB_TOKEN`
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

## Production Truth Flow

1. repo content changes
2. ingest runs
3. packets update
4. Sanity snapshot updates
5. relevant pages revalidate
6. live site reflects new truth

If Sanity is not configured, the site may still run from cache packets locally, but that is not the intended production operating mode.

## Operational Rules

- repo-driven truth changes do not require code edits
- editorial changes do not overwrite machine-truth fields
- broken ingest does not silently leave stale certainty on the site
- degraded sync must remain visible as degraded sync

## Release Checklist

1. Run:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run ingest
npm run test:parser
npm run build
npm run sync:sanity
```

2. Verify required routes manually.
3. Verify homepage against reference.
4. Verify one `SUPPORTED`, one `STAGED`, and one `BLOCKED` lane manually.
5. Confirm latest sync timestamp is visible and plausible.
6. Confirm main navigation contains only live routes.
7. Record the deployment identifier or commit used for release.

## Rollback Rule

If a release introduces false truth, broken routes, or major design regression, rollback immediately to the last known-good deployment. A visually nicer release with worse authority handling is a failed release.

Rollback must restore both:

- the application deployment
- the last known-good packet/Sanity snapshot state

## Ongoing Maintenance

- review parser quality when repo structures change
- add newly public `ZPE-*` repos through the documented inclusion flow
- keep proof and non-claim surfaces visible
- rerun verification after any parser, schema, or major route change
- rerun verification after any typography, navigation, or homepage layout change

## Exit Gate

This runbook is complete when a different execution agent could operate the site responsibly without relying on unstated tribal knowledge.
