# ZER0PA Site Implementation PRD for AntiGravity

**Version:** 1.0  
**Date:** 2026-03-27  
**Purpose:** Turn the existing ZER0PA design direction into a production website where public GitHub repositories drive the live proof surfaces, while Sanity controls editorial composition and site-level narrative.

## 1. Governing Objective

Build `zer0pa.ai` as a proof-first authority surface.

This is not a repo gallery and not a startup marketing site.

The acceptance gate is:

1. The homepage and lane pages feel like the current approved design language.
2. Public repo truth populates live status, metrics, proof anchors, and bounded-claim surfaces.
3. Changing qualifying copy in GitHub updates the corresponding truth modules on the site without a redesign or manual code edits.
4. The site preserves radical honesty: what is proved, what is not claimed, and what remains open must be visible and hard to misread.

## 2. Non-Negotiables

AntiGravity must preserve the visual and product constraints in [`design.md`](/Users/Zer0pa/Zer0pa Website/design.md) and [`Grok PRD and Design.md thinking.md`](/Users/Zer0pa/Zer0pa Website/Grok PRD and Design.md thinking.md).

Required:

- Pure black substrate, monochrome hierarchy, Oswald for mastheads, Courier-style mono for UI/data.
- Severe editorial restraint.
- Evidence first, architecture second, philosophy third.
- Explicit claim boundaries and explicit non-claims.
- No hardcoded dummy repo content.
- No “public repo = pass narrative” shortcut. Public visibility is not authority.

Forbidden:

- Decorative “cyberpunk terminal” noise.
- Repo truth copied into code constants.
- Sanity becoming a silent overwrite layer for authority/status facts.
- Flattening blocker-state or inconclusive status into generic “active” badges.

## 3. Critical Product Decision

Do **not** make Sanity the source of truth for lane proof content.

Use a split model:

- **GitHub repo truth** owns lane identity, current authority, headline metrics, explicit non-claims, proof anchors, repo-shape facts, and verification-path facts.
- **Sanity editorial** owns homepage composition, featured-lane ordering, related lanes, site-wide narrative, CTA framing, imagery/media, and optional explanatory wrappers.

If a fact is supposed to change when a README, proof file, or audit file changes, that fact must be repo-driven.

## 4. Current Public Repo Reality

Verified from the GitHub public repo list on **2026-03-27**:

- `ZPE-FT`
- `ZPE-Geo`
- `ZPE-IMC`
- `ZPE-Ink`
- `ZPE-IoT`
- `ZPE-Mocap`
- `ZPE-Neuro`
- `ZPE-Prosody`
- `ZPE-Robotics`
- `ZPE-XR`

This means the implementation must not hardcode an older assumption like “only IMC, IoT, and Robotics are public.” The system needs a dynamic public-repo registry.

## 5. Better System Contract

### 5.1 Ownership Split

**Repo-owned fields**

- `laneIdentifier`
- `laneTitle`
- `tagline`
- `whatThisIs`
- `authorityState`
- `headlineMetrics`
- `provedNow`
- `explicitNonClaims`
- `openRisks`
- `modalityStatus`
- `proofAnchors`
- `repoShape`
- `verificationPath`
- `lastSyncedCommitSha`
- `sourceFilesUsed`

**Sanity-owned fields**

- `featuredOnHome`
- `homePriority`
- `cardAccentTreatment`
- `heroNarrative`
- `shortEditorialIntro`
- `relatedLanes`
- `ctaPrimary`
- `ctaSecondary`
- `proofPageExplanatoryCopy`
- `aboutPageCopy`

**Rule**

Sanity may augment repo truth. It may not silently overwrite repo truth on authority surfaces.

### 5.2 Public vs Non-Public Lanes

Every lane needs:

- `sourceMode: "public_repo" | "manual_staged"`
- `visibility: "public" | "private" | "unknown"`

If a repo is public, the lane should ingest automatically.

If a lane is not public or does not meet the required file contract, it can still exist in the site via Sanity, but it must render as editorial/staged content rather than fake live truth.

## 6. Recommended Architecture

### 6.1 Stack

- **Frontend:** Next.js App Router
- **CMS:** Sanity
- **Ingestion:** Node.js script plus optional Sanity CLI command
- **Rendering model:** Static-first pages with tag-based revalidation
- **Sync triggers:** GitHub webhook plus scheduled backstop job

### 6.2 Data Flow

1. Discover all public repos from the GitHub API or a maintained allowlist in Sanity site settings.
2. For each allowed public repo, fetch raw source files from GitHub.
3. Parse repo truth into a normalized lane packet.
4. Upsert the normalized lane packet into Sanity.
5. Trigger Next.js revalidation for the affected lane and any dependent homepage/index modules.

### 6.3 Why This Architecture

- You get live repo-driven truth without making GitHub your runtime CMS.
- Sanity stays useful for composition, curation, and editorial control.
- The frontend remains fast and stable because it reads normalized content, not raw GitHub on every request.

## 7. Ingestion Contract

### 7.1 Discovery

AntiGravity should not hardcode a lane list in code.

Use one of these:

1. GitHub API public repo discovery filtered to `ZPE-*`.
2. Sanity `siteSettings.allowedRepos` as a governance layer for which public repos are surfaced.

Recommended:

- GitHub provides discovery.
- Sanity provides inclusion/exclusion and home ordering.

### 7.2 Fetch Strategy

Fetch raw files from GitHub, not rendered HTML.

Preferred order:

1. GitHub Contents API for path existence and SHA
2. Raw content URLs for file bodies
3. Git trees API for path discovery

Use SHA-aware or ETag-aware fetches to avoid waste and to capture exact provenance.

### 7.3 Required Parser Output

Each repo must normalize into one packet:

```ts
type LanePacket = {
  repoOwner: string
  repoName: string
  repoUrl: string
  branch: string
  sourceMode: "public_repo" | "manual_staged"
  visibility: "public" | "private" | "unknown"
  laneIdentifier: string
  slug: string
  laneTitle: string
  tagline?: string
  whatThisIs: string[]
  authorityState?: {
    status: string
    timestamp?: string
    summary?: string
    sourceFile: string
  }
  headlineMetrics: Array<{
    label: string
    valueRaw: string
    numericValue?: number
    unit?: string
    sourceFile: string
  }>
  provedNow: string[]
  explicitNonClaims: string[]
  openRisks: string[]
  modalityStatus: Array<{
    modalityName: string
    rawStatus: string
    verdict: "PASS" | "FAIL" | "INCONCLUSIVE"
    notes?: string
  }>
  proofAnchors: Array<{
    label: string
    path: string
    repoUrl: string
    description?: string
  }>
  repoShape: Array<{
    path: string
    description: string
  }>
  verificationPath: string[]
  sourceFilesUsed: string[]
  parserWarnings: string[]
  commitSha: string
  syncedAt: string
}
```

## 8. Parser Rules

### 8.1 Important Change to the Current Addendum

Do **not** rely on regex alone.

These READMEs contain:

- Markdown tables
- inline HTML tables
- badge/image-driven section nav
- variant section names

AntiGravity should use:

- `remark-parse`
- `remark-gfm`
- `rehype-raw`
- targeted extraction helpers for tables, headings, lists, and inline code paths

Regex is still useful, but only as a secondary extractor for dates, numeric values, and fallback pattern matching.

### 8.2 File Fallback Order

For every repo, inspect file existence first. Do not assume all repos have the same file set.

Recommended candidates:

- `README.md`
- `PUBLIC_AUDIT_LIMITS.md`
- `proofs/FINAL_STATUS.md`
- `proofs/RELEASE_READINESS_REPORT.md`
- `proofs/ENGINEERING_BLOCKERS.md`
- `proofs/manifests/CURRENT_AUTHORITY_PACKET.md`
- `docs/ARCHITECTURE.md`
- `AUDITOR_PLAYBOOK.md`

### 8.3 Identity Extraction

Use:

- `laneIdentifier`: repo name after owner, for example `ZPE-IMC`
- `laneTitle`: README H1 or the canonical descriptive string tied to the lane name/version
- `tagline`: first strong descriptor line or repo worklist summary if present in repo docs

### 8.4 Authority State Extraction

Look for these headings and variants:

- `Current Authority`
- `Current Authority (YYYY-MM-DD)`
- `Quickstart and Authority Point`
- `Current truth`
- `Authority layer`
- `Release state`

Extract:

- `authorityState.timestamp` from inline dates like `2026-03-21`
- `authorityState.status` from the strongest governing status string available
- `authorityState.summary` from the nearest governing sentence if the repo uses prose instead of a clean table

Important:

- Prefer named governing authority files over marketing-style masthead copy.
- A blocker-state or fail-state file outranks a softer README phrase.

### 8.5 Headline Metrics

Search these sections:

- `Throughput`
- `Current Metrics`
- `Modality Status Snapshot`
- `Lane Status Snapshot`
- `Key Metrics`
- proof or benchmark tables

Rules:

- Preserve the exact human-readable value string.
- Parse numeric/unit fields when possible, but never drop the original raw value.
- Keep the source file for each metric.

### 8.6 Proved-Now Extraction

Also add a `provedNow` array.

Scan:

- `What this is`
- current authority tables
- bounded pass/fail snapshots
- proof assertion blocks

Only include statements supported by current repo authority, not aspiration copy.

### 8.7 Explicit Non-Claims and Open Risks

This is a first-class requirement.

Scan for:

- `What is not being claimed`
- `What is NOT being claimed`
- `OUT OF SCOPE`
- `OPEN RISKS`
- `OPEN RISKS (NON-BLOCKING)`
- bullet points beginning with `No`, `No claim`, `Not`, `Blocks`, `Blocked`, `Open`

Store:

- `explicitNonClaims`
- `openRisks`

These must render distinctly in the UI. Do not merge them into generic body copy.

### 8.8 Modality / Lane / Gate Status

Scan for tables or structured prose under:

- `Modality Status Snapshot`
- `Lane Status Snapshot`
- `Gate Status`
- `Proof Assertions`

Map verdicts:

- `GREEN`, `PASS` -> `PASS`
- `RED`, `FAIL`, `BLOCKED` -> `FAIL`
- `INCONCLUSIVE`, `OPEN`, `PAUSED`, `DEFERRED` -> `INCONCLUSIVE`

Retain the raw status string too.

### 8.9 Proof Anchors

Scan:

- `Proof Anchors`
- `Evidence`
- `Authority layer`
- path tables
- inline code paths in README and proof docs

Extract any repo-relative proof path and generate a GitHub URL for it.

Examples of anchor paths already appearing across public repos:

- `proofs/FINAL_STATUS.md`
- `proofs/RELEASE_READINESS_REPORT.md`
- `proofs/ENGINEERING_BLOCKERS.md`
- `proofs/manifests/CURRENT_AUTHORITY_PACKET.md`

### 8.10 Repo Shape / Verification Path

Extract structured path-to-purpose mappings from sections like:

- `Repo Shape`
- `Use these files together`
- architecture/doc area tables

This content should power the “repo shape / verification path” module on lane pages.

### 8.11 Parser Confidence and Failure Rules

Every ingest run must emit:

- `parserWarnings`
- `missingRequiredSections`
- `confidenceScore` per major field group

If `authorityState` cannot be extracted confidently:

- do not invent a status
- mark the lane packet as degraded
- surface a warning in Sanity and logs

## 9. Sanity Schema

Recommended schema split:

- `siteSettings`
- `lane`
- `laneSnapshot`
- `proofPage`

### 9.1 `lane`

Human-curated shell:

- `title`
- `slug`
- `repoName`
- `repoUrl`
- `featuredOnHome`
- `homePriority`
- `relatedLanes`
- `editorialIntro`
- `ctaPrimary`
- `ctaSecondary`
- `sourceMode`

### 9.2 `laneSnapshot`

Machine-owned repo truth:

- `lane` reference
- `commitSha`
- `syncedAt`
- `authorityState`
- `headlineMetrics`
- `provedNow`
- `explicitNonClaims`
- `openRisks`
- `modalityStatus`
- `proofAnchors`
- `repoShape`
- `verificationPath`
- `parserWarnings`

Machine-owned fields should be write-protected from casual editorial mutation.

## 10. Frontend Binding Rules

### 10.1 Homepage

The homepage should not become a generic feed.

Required binding:

1. **Hero**
   Site-owned. Use Sanity editorial content only.
2. **Flagship authority block**
   Bind to one curated featured lane, default `ZPE-IMC`, but chosen in Sanity.
3. **Work constellation grid**
   Pull from live lane snapshots plus editorial ordering.
4. **System architecture explainer**
   Site-owned narrative, not repo-ingested.
5. **Compressed proof logic**
   Site-owned with dynamic proof-anchor examples.
6. **Substrate narrative**
   Site-owned.
7. **Operations footer**
   Include last sync timestamp and selected proof routes.

### 10.2 Lane Detail Page

Each `/work/[slug]` page should render:

1. Hero / masthead
2. What this is
3. Current authority state
4. Headline metrics
5. What is proved now
6. What is explicitly not claimed
7. Open risks
8. Evidence and proof routes
9. Repo shape / verification path
10. Related lanes
11. CTA

Truth sections must come from the lane snapshot, not hand-entered prose.

## 11. UX and State Rules

### 11.1 Truth State Rendering

Do not compress everything into one generic badge.

Render at least:

- governing status
- timestamp of authority
- proof freshness
- parser freshness
- degraded state if extraction is partial

### 11.2 Failure / Degraded Modes

If GitHub fetch fails or parser confidence drops:

- keep the last good snapshot
- show `Last synced` timestamp
- do not blank the page
- do not silently swap in placeholder copy

### 11.3 Accessibility and Performance

Must satisfy:

- WCAG 2.1 AA
- reduced motion support
- keyboard focus clarity
- static-first rendering
- lazy loading for heavy media

## 12. Acceptance Gates for AntiGravity

AntiGravity is done only when all of these are true:

1. Changing qualifying content in a public repo updates the corresponding site truth module after sync.
2. No lane truth surface depends on hardcoded sample data.
3. Sanity can reorder and curate lanes without overriding authority/status facts.
4. Homepage flagship block and work grid are live-driven from normalized repo packets.
5. Each public repo gets a lane page with proof anchors and explicit non-claims when source material exists.
6. A blocker-state repo does not render as a pass narrative.
7. Missing or variant files degrade gracefully instead of breaking build/runtime.
8. Visual implementation still matches the approved monochrome proof-first design system.

## 13. Delivery Phases

### Phase 1: Contract and Parser

- Inventory public repos dynamically
- Finalize field schema
- Build parser against at least `ZPE-IMC`, `ZPE-IoT`, `ZPE-Robotics`, `ZPE-XR`, `ZPE-Neuro`
- Emit normalized JSON packets locally

Gate:

- five real lane packets generated with no hand-entered lane truth

### Phase 2: Sanity Integration

- Create `lane` and `laneSnapshot` schemas
- Upsert packets into Sanity
- Add site settings for featured lane and inclusion/order

Gate:

- Sanity shows machine snapshots and editorial shells separately

### Phase 3: Homepage

- Implement homepage modules against real data
- Bind flagship block to featured lane snapshot
- Bind constellation grid to included lane snapshots

Gate:

- homepage is visually on-model and live-driven

### Phase 4: Lane Template

- Implement `/work/[slug]`
- Render authority state, proof anchors, explicit non-claims, open risks, repo shape

Gate:

- at least five public repos render correctly with no bespoke page coding

### Phase 5: Ops and Verification

- GitHub webhook or scheduled sync
- tag-based revalidation
- parser logs and degraded-state handling
- accessibility and performance pass

Gate:

- content changes from GitHub propagate safely and pages remain stable under partial parser failure

## 14. Explicit Anti-Patterns

AntiGravity must avoid:

- scraping GitHub HTML pages as the main data source
- regex-only parsing
- inventing fallback copy when parsing fails
- putting lane truth in React constants
- allowing Sanity editors to silently overwrite status or proof facts
- shipping a design-faithful shell with fake data and calling it complete

## 15. Immediate Build Brief

If AntiGravity needs a short execution instruction, use this:

> Build the ZER0PA website in Next.js + Sanity using the existing monochrome proof-first design language. Public GitHub repos are the source of truth for lane identity, current authority, metrics, proof anchors, explicit non-claims, open risks, and repo-shape data. Sanity owns only editorial composition and curation. Implement a Node-based ingestion pipeline that discovers public `ZPE-*` repos, fetches raw repo files from GitHub, parses them into normalized lane snapshots, upserts those snapshots into Sanity, and powers the homepage plus `/work/[slug]` pages from those snapshots. Do not use dummy data. Do not flatten blocker/open/inconclusive states into marketing-safe copy. Preserve the current visual direction while making the site genuinely live.
