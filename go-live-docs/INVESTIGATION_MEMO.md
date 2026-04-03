# ZER0PA Site Investigation Memo

**Date:** 2026-03-27  
**Scope:** Current state vs target state for `zer0pa.ai`

## 1. Current State

The site is no longer a dead mock.

What is already real:

- A Next.js site exists in `site/`.
- The homepage, work index, and lane detail routes render live packet data.
- The ingest script discovers public `ZPE-*` repos, fetches raw files, and builds cached lane packets.
- Parser quality is materially improved enough to distinguish key states such as:
  - `ZPE-IMC` -> `SUPPORTED`
  - `ZPE-IoT` -> `STAGED`
  - `ZPE-XR` -> `BLOCKED`
- `npm run ingest`, `npm run test:parser`, and `npm run build` pass.

What is still incomplete:

- The current visual result does not match the attached references closely enough.
- Only `/`, `/work`, and `/work/[slug]` are implemented routes today.
- `/imc`, `/proof`, `/about`, and `/contact` still need actual page implementation.
- Some packet fields are still too literal or verbose because parser cleanup is not finished.
- Sanity is present, but the operational boundary between repo truth and editorial content still needs to be locked down in documentation and runbooks.

## 2. Non-Negotiable Reference Truth

The attached screenshots are authoritative for the visual target.

This means:

- The homepage must feel like the attached homepage, not just "inspired by it".
- The lane page must feel like the attached `ZPE-IMC` page, not a generic dark technical page.
- Oswald Regular/Medium is the masthead font.
- Courier or equivalent monospace is the body/UI/data font.
- The substrate is pure black with grey/white hierarchy only.
- The design is silent, restrained, and architectural.

The current implementation is visibly short of that target.

## 3. Biggest Gaps

### 3.1 Design Gap

The current homepage is structurally closer than before, but it still misses the attached references in:

- typography scale and weight
- proportion and spacing
- density and cadence of evidence blocks
- exact grid rhythm
- severity of the monochrome treatment
- top navigation structure and finish
- flagship module composition
- lane-page composition and proof-surface framing

### 3.2 Route Gap

Required routes:

- `/`
- `/imc`
- `/work`
- `/work/[slug]`
- `/proof`
- `/about`
- `/contact`

Current route reality:

- implemented: `/`, `/work`, `/work/[slug]`
- missing: `/imc`, `/proof`, `/about`, `/contact`

### 3.3 Data Quality Gap

The pipeline works, but the last-mile content still needs cleanup in areas like:

- over-literal `provedNow` arrays
- occasional verbose summary text
- packet confidence being too optimistic
- proof anchor normalization
- separation between "headline metric" and "supporting detail"

### 3.4 Operational Gap

The repo-to-packet-to-Sanity-to-page flow exists in pieces, but the go-live process still needs documented ownership for:

- GitHub truth updates
- parser regressions
- Sanity editorial boundaries
- release verification
- deployment and rollback

## 4. Required Documentation Set

From this point to launch, the project needs exactly this doc set:

1. One final go-live PRD
2. One data/content runbook
3. One implementation/design runbook
4. One verification/QA runbook
5. One launch/operations runbook

That is the minimum set that covers strategy, execution, validation, and go-live operation without duplication.

## 5. Governing Recommendation

Do not move into "design polish" as if the problem is only visual.

The correct order is:

1. lock the final PRD
2. harden data/content runbooks
3. finish missing routes and required page modules
4. converge visually to the attached references
5. run verification gates
6. go live

Any attempt to skip that order increases the chance of ending with a beautiful but untrustworthy authority surface.
