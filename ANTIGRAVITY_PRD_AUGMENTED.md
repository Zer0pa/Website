# ZER0PA Site — Augmented Execution PRD

**Version:** 2.0 — Execution Supplement  
**Date:** 2026-03-27  
**Parent PRD:** [`ANTIGRAVITY_PRD.md`](file:///Users/Zer0pa/Zer0pa%20Website/ANTIGRAVITY_PRD.md)  
**Design System:** [`design.md`](file:///Users/Zer0pa/Zer0pa%20Website/design.md)  
**Purpose:** Turn the existing PRD into actionable execution with detailed runbooks. If a step is not in a runbook, it will not happen.

---

## 0. Governing Context

### Brand Assets (Confirmed Available)

| Asset | Path | Notes |
|---|---|---|
| Logo SVG | `ZEROPA logo.svg` | Oswald, grey `ZER` + white `0` + grey `PA`, 3035×1604 |
| Icon SVG | `zer0pa icon.svg` | White `0` in Oswald, 353×430 |
| Logo PNG | `ZEROPA logo.png` | 145KB raster |
| Icon PNG | `zer0pa icon.png` | 9.6KB raster |

### Design Constants (from `design.md` — non-negotiable)

```
BACKGROUND:      #000000
TEXT_BODY:        #7F7F7F (greyscale spectrum)
TEXT_EMPHASIS:    #FFFFFF (reserved for zero + proof moments)
FONT_MASTHEAD:   'Oswald', sans-serif (Regular/Medium, ALL CAPS)
FONT_UI:         'Courier New', 'Courier', monospace
LAYOUT:          Strict grid, large negative space
FORBIDDEN:       gradients, cyberpunk, decorative particles, chrome, rainbow
```

### Repo Registry (10 public repos, confirmed 2026-03-27)

```
ZPE-FT | ZPE-Geo | ZPE-IMC | ZPE-Ink | ZPE-IoT
ZPE-Mocap | ZPE-Neuro | ZPE-Prosody | ZPE-Robotics | ZPE-XR
```

### Site Map

```
/           → Homepage (authority surface)
/imc        → Flagship deep-dive (ZPE-IMC)
/work       → Constellation index
/work/[slug] → Reusable lane page template
/proof      → Evidence model & audit routes
/about      → Compressed substrate narrative
/contact    → Partnership / licensing / research routing
```

---

## 1. Phase 1 — Project Scaffold & Parser

### What Gets Built
1. Next.js 14 App Router project with Sanity Studio embedded
2. GitHub ingestion script that discovers repos, fetches raw files, parses into `LanePacket` JSON
3. Sanity schema for `lane`, `laneSnapshot`, `siteSettings`, `proofPage`

---

## RUNBOOK 01 — PROJECT INITIALISATION

### RB01-01: Create Next.js Project

```bash
cd "/Users/Zer0pa/Zer0pa Website"
npx -y create-next-app@latest ./site \
  --typescript \
  --tailwind=no \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

> **Decision: No Tailwind.** PRD specifies vanilla CSS with strict monochrome palette. Building a custom design system is necessary to enforce the ZER0PA visual rules.

### RB01-02: Install Core Dependencies

```bash
cd "/Users/Zer0pa/Zer0pa Website/site"
# CMS
npm install sanity @sanity/vision next-sanity @sanity/image-url
# Markdown parsing (PRD §8.1 — not regex alone)
npm install remark remark-parse remark-gfm rehype-raw unified unist-util-visit
# GitHub API
npm install @octokit/rest
# 3D (design.md §5 — React Three Fiber, explanatory only)
npm install three @react-three/fiber @react-three/drei
# Motion (design.md §5 — scroll-linked storytelling)
npm install motion
# Data viz (design.md §8 — D3 for bespoke, Observable Plot for benchmarks)
npm install d3 @observablehq/plot
# Dev
npm install -D @types/three @types/d3
```

### RB01-03: Create Directory Structure

```
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata)
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Design system tokens
│   │   ├── imc/
│   │   │   └── page.tsx        # Flagship ZPE-IMC deep-dive
│   │   ├── work/
│   │   │   ├── page.tsx        # Constellation index
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Lane detail template
│   │   ├── proof/
│   │   │   └── page.tsx        # Evidence model
│   │   ├── about/
│   │   │   └── page.tsx        # Substrate narrative
│   │   └── contact/
│   │       └── page.tsx        # Routing page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Nav.tsx
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── FlagshipBlock.tsx
│   │   │   ├── ConstellationGrid.tsx
│   │   │   ├── ArchitectureExplainer.tsx
│   │   │   ├── ProofLogic.tsx
│   │   │   └── SubstrateNarrative.tsx
│   │   ├── lane/
│   │   │   ├── LaneHero.tsx
│   │   │   ├── AuthorityState.tsx
│   │   │   ├── HeadlineMetrics.tsx
│   │   │   ├── ProvedNow.tsx
│   │   │   ├── NonClaims.tsx
│   │   │   ├── OpenRisks.tsx
│   │   │   ├── ProofAnchors.tsx
│   │   │   ├── RepoShape.tsx
│   │   │   ├── ModalityStatus.tsx
│   │   │   └── RelatedLanes.tsx
│   │   ├── shared/
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── TypewriterText.tsx
│   │   │   └── ClaimBoundary.tsx
│   │   └── three/
│   │       └── ZeroSingularity.tsx
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts
│   │   │   ├── queries.ts
│   │   │   └── schemas/
│   │   │       ├── index.ts
│   │   │       ├── lane.ts
│   │   │       ├── laneSnapshot.ts
│   │   │       ├── siteSettings.ts
│   │   │       └── proofPage.ts
│   │   ├── github/
│   │   │   ├── client.ts       # Octokit wrapper
│   │   │   ├── discovery.ts    # Discover ZPE-* repos
│   │   │   └── fetcher.ts      # Raw file fetch with SHA tracking
│   │   ├── parser/
│   │   │   ├── index.ts        # Orchestrator
│   │   │   ├── identity.ts     # §8.3 identity extraction
│   │   │   ├── authority.ts    # §8.4 authority state
│   │   │   ├── metrics.ts      # §8.5 headline metrics
│   │   │   ├── provedNow.ts    # §8.6 proved-now
│   │   │   ├── nonClaims.ts    # §8.7 non-claims & risks
│   │   │   ├── modality.ts     # §8.8 modality/gate status
│   │   │   ├── proofAnchors.ts # §8.9 proof anchors
│   │   │   ├── repoShape.ts    # §8.10 repo shape
│   │   │   └── confidence.ts   # §8.11 confidence scoring
│   │   └── types/
│   │       └── lane.ts         # LanePacket TypeScript type
│   └── styles/
│       ├── tokens.css          # CSS custom properties
│       ├── typography.css      # Oswald + Courier system
│       ├── grid.css            # Layout grid
│       └── components.css      # Component-level styles
├── scripts/
│   ├── ingest.ts               # Main ingestion script
│   ├── sync-to-sanity.ts       # Upsert packets to Sanity
│   └── validate-packets.ts     # Packet validation/diff tool
├── public/
│   ├── fonts/                  # Self-hosted Oswald
│   ├── logo.svg
│   └── icon.svg
└── sanity.config.ts
```

### RB01-04: Copy Brand Assets

```bash
cp "/Users/Zer0pa/Zer0pa Website/ZEROPA logo.svg" "/Users/Zer0pa/Zer0pa Website/site/public/logo.svg"
cp "/Users/Zer0pa/Zer0pa Website/zer0pa icon.svg" "/Users/Zer0pa/Zer0pa Website/site/public/icon.svg"
cp "/Users/Zer0pa/Zer0pa Website/ZEROPA logo.png" "/Users/Zer0pa/Zer0pa Website/site/public/logo.png"
cp "/Users/Zer0pa/Zer0pa Website/zer0pa icon.png" "/Users/Zer0pa/Zer0pa Website/site/public/icon.png"
```

### RB01-05: Download Self-Hosted Oswald Font

```bash
mkdir -p "/Users/Zer0pa/Zer0pa Website/site/public/fonts"
# Download Oswald Regular (400) and Medium (500) WOFF2
curl -o "/Users/Zer0pa/Zer0pa Website/site/public/fonts/oswald-regular.woff2" \
  "https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiYA.woff2"
curl -o "/Users/Zer0pa/Zer0pa Website/site/public/fonts/oswald-medium.woff2" \
  "https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1xtvbkZiYA.woff2"
```

---

## RUNBOOK 02 — DESIGN SYSTEM CSS

### RB02-01: Design Tokens (`tokens.css`)

```css
:root {
  /* Colour — Brand substrate */
  --color-void: #000000;
  --color-surface: #0A0A0A;
  --color-surface-raised: #111111;
  --color-border: #1A1A1A;
  --color-border-active: #333333;
  --color-text-primary: #7F7F7F;
  --color-text-secondary: #555555;
  --color-text-tertiary: #333333;
  --color-emphasis: #FFFFFF;
  --color-singularity: #FFFFFF;

  /* Status colours — monochrome verdicts */
  --color-pass: #4ADE80;
  --color-fail: #EF4444;
  --color-inconclusive: #F59E0B;
  --color-degraded: #6B7280;

  /* Typography */
  --font-masthead: 'Oswald', sans-serif;
  --font-ui: 'Courier New', 'Courier', monospace;
  --font-size-hero: clamp(3rem, 8vw, 6rem);
  --font-size-h1: clamp(2rem, 4vw, 3.5rem);
  --font-size-h2: clamp(1.25rem, 2.5vw, 2rem);
  --font-size-body: 0.875rem;
  --font-size-small: 0.75rem;
  --font-size-micro: 0.625rem;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  /* Grid */
  --grid-max-width: 1440px;
  --grid-gutter: 1.5rem;
  --grid-columns: 12;

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 600ms;
  --ease-default: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }
}
```

### RB02-02: Typography System (`typography.css`)

```css
@font-face {
  font-family: 'Oswald';
  src: url('/fonts/oswald-regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Oswald';
  src: url('/fonts/oswald-medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}

/* Mastheads — Oswald ONLY (design.md §2) */
.masthead, h1, h2 {
  font-family: var(--font-masthead);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-primary);
  font-weight: 400;
}

/* Everything else — Courier monospace (design.md §2) */
body, p, span, li, td, th, label, input, button, code, pre, a {
  font-family: var(--font-ui);
  color: var(--color-text-primary);
}
```

### RB02-03: Exact Implementation of Status Badges

Per PRD §11.1 — do NOT compress into one badge. Render distinct states:

```
StatusBadge component must accept:
  - verdict: "PASS" | "FAIL" | "INCONCLUSIVE" | "DEGRADED"
  - rawStatus: string (original repo text, e.g. "BLOCKED_MISSING_INPUTS")
  - timestamp: string (authority date)
  - proofFreshness: string (last sync)

Rendering rules:
  PASS          → green dot + label + timestamp
  FAIL/BLOCKED  → red dot + label + raw status string
  INCONCLUSIVE  → amber dot + label + raw status string
  DEGRADED      → grey dot + "DEGRADED" + last-good timestamp
```

---

## RUNBOOK 03 — GITHUB INGESTION PIPELINE

### RB03-01: Environment Configuration

Create `.env.local`:
```
GITHUB_TOKEN=ghp_<your_token>
GITHUB_ORG=Zer0pa
SANITY_PROJECT_ID=<your_project_id>
SANITY_DATASET=production
SANITY_API_TOKEN=<your_write_token>
```

### RB03-02: Repo Discovery (`src/lib/github/discovery.ts`)

**Exact logic:**

1. Call `GET /orgs/Zer0pa/repos?type=public&per_page=100`
2. Filter: `repo.name.startsWith('ZPE-')`
3. Return `{ name, url, default_branch, pushed_at }` for each
4. Log any ZPE-* repo that is NOT public (warning, not error)
5. Cross-reference with Sanity `siteSettings.allowedRepos` if it exists; else include all

**Edge cases:**
- If GitHub API returns 403/rate-limited → log error, skip discovery, use cached list
- If a known repo disappears from public → mark lane `visibility: "unknown"`, do NOT delete

### RB03-03: Raw File Fetch (`src/lib/github/fetcher.ts`)

**Exact file probe order per repo** (PRD §8.2):

```typescript
const FILE_CANDIDATES = [
  'README.md',
  'PUBLIC_AUDIT_LIMITS.md',
  'AUDITOR_PLAYBOOK.md',
  'proofs/FINAL_STATUS.md',
  'proofs/RELEASE_READINESS_REPORT.md',
  'proofs/ENGINEERING_BLOCKERS.md',
  'proofs/manifests/CURRENT_AUTHORITY_PACKET.md',
  'proofs/CONSOLIDATED_PROOF_REPORT.md',
  'docs/ARCHITECTURE.md',
  'CITATION.cff',
  'CHANGELOG.md',
] as const;
```

**For each file:**
1. `GET /repos/Zer0pa/{repo}/contents/{path}` with `Accept: application/vnd.github.raw`
2. Store the file SHA from response headers for provenance
3. If 404 → skip, add to `parserWarnings`
4. If 403 → log, add to `parserWarnings`, do NOT fail the entire repo

### RB03-04: Parser Orchestrator (`src/lib/parser/index.ts`)

**Exact execution order per repo:**

```
1. Parse README.md with remark-parse + remark-gfm + rehype-raw → AST
2. Extract identity (§8.3)      → laneIdentifier, laneTitle, tagline
3. Extract authority (§8.4)     → authorityState {}
4. Extract metrics (§8.5)       → headlineMetrics []
5. Extract proved-now (§8.6)    → provedNow []
6. Extract non-claims (§8.7)    → explicitNonClaims [], openRisks []
7. Extract modality (§8.8)      → modalityStatus []
8. Extract proof anchors (§8.9) → proofAnchors []
9. Extract repo shape (§8.10)   → repoShape [], verificationPath []
10. If FINAL_STATUS.md exists   → override authorityState if it contains stronger signal
11. If ENGINEERING_BLOCKERS.md  → merge into openRisks
12. Compute confidence (§8.11)  → confidenceScore {}, parserWarnings []
13. Assemble LanePacket
```

### RB03-05: Identity Extractor (`src/lib/parser/identity.ts`)

```
INPUT:  AST of README.md
OUTPUT: { laneIdentifier, laneTitle, tagline, whatThisIs }

RULES:
1. laneIdentifier = repo name (e.g. "ZPE-IMC")
2. laneTitle = first H1 text content
   - If H1 contains "Zer0pa/" prefix, strip it
   - Fallback: repo "About" description from GitHub API
3. tagline = first line after H1 that is NOT a heading and NOT empty
   - Fallback: GitHub repo description
4. whatThisIs = all paragraph text under the heading matching:
   /^(What This Is|What this is|Overview|Description)$/i
   - Collect all paragraphs until next H2
   - Return as string[]
```

### RB03-06: Authority State Extractor (`src/lib/parser/authority.ts`)

```
INPUT:  AST of README.md + optional FINAL_STATUS.md AST
OUTPUT: { status, timestamp, summary, sourceFile }

RULES:
1. Search for H2 matching:
   /^Current Authority|Current Authority \(\d{4}/ 
   /^Authority|Current truth|Release state/i
2. Under that heading, scan for:
   - Date pattern: /\d{4}-\d{2}-\d{2}/ → timestamp
   - Status keywords:
     SUPPORTED, PASS, GREEN → status = "SUPPORTED"
     BLOCKED, FAIL, RED, NO-GO → status = "BLOCKED"
     INCONCLUSIVE, OPEN, PAUSED, DEFERRED → status = "INCONCLUSIVE"
     PRIVATE_STAGED, NOT_PUBLIC_READY → status = "STAGED"
   - First sentence of prose → summary
3. If FINAL_STATUS.md exists:
   - Its status OUTRANKS README (PRD §8.4: "blocker-state file outranks softer README phrase")
4. If nothing found → status = "UNKNOWN", add parser warning
```

### RB03-07: Metrics Extractor (`src/lib/parser/metrics.ts`)

```
INPUT:  AST
OUTPUT: Array<{ label, valueRaw, numericValue?, unit?, sourceFile }>

RULES:
1. Search for H2/H3 matching:
   /Throughput|Current Metrics|Modality Status|Key Metrics|Surface Status/i
2. Scan for tables → extract each row as a metric
3. Scan for inline code patterns: /(\d+[\.\d]*)[x×]/ → compression ratios
4. Scan for patterns: /(\d+[\.\d]*)\s*(ms|mm|%|words\/sec|x)/ → numerics
5. Preserve EXACT raw value string (PRD §8.5: "never drop the original raw value")
6. Parse numeric where possible, but raw string is canonical
```

### RB03-08: Non-Claims & Open Risks Extractor (`src/lib/parser/nonClaims.ts`)

```
INPUT:  AST
OUTPUT: { explicitNonClaims: string[], openRisks: string[] }

RULES:
1. For non-claims, search for sections:
   /What is not|NOT being claimed|OUT OF SCOPE|Explicit Non.Claims/i
   Also scan for bullet patterns starting with:
   /^\[!\] No claim|No |NOT |Not /
2. For open risks, search for sections:
   /Open Risks|OPEN RISKS|Release blockers|Constraints/i
   Also scan for bullets starting with:
   /Blocked|BLOCKED|Open|Unresolved|Missing|Deferred/i
3. These MUST render distinctly in UI (PRD §8.7)
```

### RB03-09: Confidence Scoring (`src/lib/parser/confidence.ts`)

```
INPUT:  Assembled LanePacket
OUTPUT: { overall, byField: Record<string, number>, warnings: string[] }

SCORING:
- identity extracted:     +25
- authority extracted:     +25
- ≥1 metric extracted:    +15
- non-claims extracted:   +15
- proof anchors found:    +10
- repo shape found:       +10

DEGRADED threshold: overall < 50
If authorityState is missing → mark DEGRADED regardless of score
```

### RB03-10: Running the Ingestion Script

```bash
cd "/Users/Zer0pa/Zer0pa Website/site"
npx tsx scripts/ingest.ts

# Expected output:
# [DISCOVERY] Found 10 public ZPE-* repos
# [FETCH] ZPE-FT: 8/11 files found
# [PARSE] ZPE-FT: identity=OK authority=OK metrics=3 nonClaims=5 risks=5 confidence=95
# ... (repeat for each repo)
# [OUTPUT] 10 LanePackets written to .cache/packets/
```

### RB03-11: Validate Packets Before Sanity Push

```bash
npx tsx scripts/validate-packets.ts

# Checks:
# 1. Every packet has non-empty laneIdentifier
# 2. Every packet has non-empty whatThisIs
# 3. No packet has authorityState.status = "UNKNOWN" without a parserWarning
# 4. At least 5 packets have confidence > 70
# 5. Print diff against previous run if cache exists
```

---

## RUNBOOK 04 — SANITY SCHEMA & INTEGRATION

### RB04-01: Sanity Project Setup

```bash
cd "/Users/Zer0pa/Zer0pa Website/site"
npx sanity@latest init --project-plan free \
  --dataset production \
  --output-path ./sanity \
  --typescript
```

Then integrate Sanity Studio into Next.js at `/studio` route.

### RB04-02: Schema — `siteSettings`

```typescript
// Singleton document
{
  name: 'siteSettings',
  type: 'document',
  fields: [
    { name: 'siteTitle', type: 'string', initialValue: 'ZER0PA' },
    { name: 'tagline', type: 'string' },
    { name: 'featuredLaneSlug', type: 'string', description: 'Default: zpe-imc' },
    { name: 'allowedRepos', type: 'array', of: [{ type: 'string' }],
      description: 'Repos to include. Empty = include all public ZPE-*' },
    { name: 'laneOrder', type: 'array', of: [{ type: 'string' }],
      description: 'Slug order for constellation grid' },
    { name: 'heroNarrative', type: 'text' },
    { name: 'substrateNarrative', type: 'text' },
    { name: 'lastSyncTimestamp', type: 'datetime', readOnly: true },
  ]
}
```

### RB04-03: Schema — `lane`

```typescript
// Editorial shell — human-curated
{
  name: 'lane',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'repoName', type: 'string' },
    { name: 'repoUrl', type: 'url' },
    { name: 'sourceMode', type: 'string',
      options: { list: ['public_repo', 'manual_staged'] } },
    { name: 'featuredOnHome', type: 'boolean', initialValue: true },
    { name: 'homePriority', type: 'number' },
    { name: 'relatedLanes', type: 'array', of: [{ type: 'reference', to: [{ type: 'lane' }] }] },
    { name: 'editorialIntro', type: 'text' },
    { name: 'ctaPrimary', type: 'object', fields: [
      { name: 'label', type: 'string' },
      { name: 'url', type: 'url' },
    ]},
    { name: 'ctaSecondary', type: 'object', fields: [
      { name: 'label', type: 'string' },
      { name: 'url', type: 'url' },
    ]},
    { name: 'cardAccentTreatment', type: 'string' },
  ]
}
```

### RB04-04: Schema — `laneSnapshot`

```typescript
// Machine-owned — write-protected from casual editorial
{
  name: 'laneSnapshot',
  type: 'document',
  fields: [
    { name: 'lane', type: 'reference', to: [{ type: 'lane' }] },
    { name: 'commitSha', type: 'string', readOnly: true },
    { name: 'syncedAt', type: 'datetime', readOnly: true },
    { name: 'laneIdentifier', type: 'string', readOnly: true },
    { name: 'laneTitle', type: 'string', readOnly: true },
    { name: 'tagline', type: 'string', readOnly: true },
    { name: 'whatThisIs', type: 'array', of: [{ type: 'text' }], readOnly: true },
    { name: 'authorityState', type: 'object', readOnly: true, fields: [
      { name: 'status', type: 'string' },
      { name: 'timestamp', type: 'string' },
      { name: 'summary', type: 'string' },
      { name: 'sourceFile', type: 'string' },
    ]},
    { name: 'headlineMetrics', type: 'array', readOnly: true, of: [{ type: 'object', fields: [
      { name: 'label', type: 'string' },
      { name: 'valueRaw', type: 'string' },
      { name: 'numericValue', type: 'number' },
      { name: 'unit', type: 'string' },
      { name: 'sourceFile', type: 'string' },
    ]}]},
    { name: 'provedNow', type: 'array', of: [{ type: 'string' }], readOnly: true },
    { name: 'explicitNonClaims', type: 'array', of: [{ type: 'string' }], readOnly: true },
    { name: 'openRisks', type: 'array', of: [{ type: 'string' }], readOnly: true },
    { name: 'modalityStatus', type: 'array', readOnly: true, of: [{ type: 'object', fields: [
      { name: 'modalityName', type: 'string' },
      { name: 'rawStatus', type: 'string' },
      { name: 'verdict', type: 'string' },
      { name: 'notes', type: 'string' },
    ]}]},
    { name: 'proofAnchors', type: 'array', readOnly: true, of: [{ type: 'object', fields: [
      { name: 'label', type: 'string' },
      { name: 'path', type: 'string' },
      { name: 'repoUrl', type: 'url' },
      { name: 'description', type: 'string' },
    ]}]},
    { name: 'repoShape', type: 'array', readOnly: true, of: [{ type: 'object', fields: [
      { name: 'path', type: 'string' },
      { name: 'description', type: 'string' },
    ]}]},
    { name: 'verificationPath', type: 'array', of: [{ type: 'string' }], readOnly: true },
    { name: 'parserWarnings', type: 'array', of: [{ type: 'string' }], readOnly: true },
    { name: 'confidenceScore', type: 'number', readOnly: true },
  ]
}
```

### RB04-05: Sync Script (`scripts/sync-to-sanity.ts`)

**Exact logic:**

```
1. Read all LanePacket JSON files from .cache/packets/
2. For each packet:
   a. Find or create the `lane` document by repoName match
   b. Create a new `laneSnapshot` document with all machine fields
   c. Mark as latest snapshot for the lane
3. Update siteSettings.lastSyncTimestamp
4. Log: created/updated/skipped counts
5. Trigger Next.js revalidation tags: ['lanes', `lane-${slug}`]
```

---

## RUNBOOK 05 — HOMEPAGE IMPLEMENTATION

### RB05-01: Root Layout (`src/app/layout.tsx`)

```
1. Import Oswald font (self-hosted from /fonts/)
2. Import Courier New as fallback monospace
3. Set <html lang="en" className={styles.root}>
4. <head>:
   - <title>ZER0PA — Zero-Point Architecture for Intelligent Machines</title>
   - <meta name="description" content="Deterministic transport, bounded claims, 
     and a growing family of modality codecs." />
   - <link rel="icon" href="/icon.svg" />
5. <body>: black background, base text color
6. <Header /> with navigation
7. {children}
8. <Footer /> with ops surface
```

### RB05-02: Homepage Modules (Exact Order — `design.md` §6)

**Module 1 — Hero**
```
Component: Hero.tsx
Data source: Sanity siteSettings (heroNarrative, tagline)
Content:
  - ZER0PA wordmark (SVG, Oswald, white zero)
  - "ZERO-POINT ARCHITECTURE:" in Oswald, grey
  - "PROOF-FIRST TECHNICAL SURFACE" in Oswald, grey
  - Subline from siteSettings
  - CTA: "INITIALISE_SYSTEM" button
  - Right column: key live stats from featured lane snapshot
    (CURRENT_STATUS, PROOF_ASSERTIONS, EVIDENCE_ROUTES, MODELS)
  - 3D zero-point singularity (React Three Fiber)
    - Sparse, explanatory only
    - Respect prefers-reduced-motion
```

**Module 2 — Flagship Authority Block (ZPE-IMC)**
```
Component: FlagshipBlock.tsx
Data source: Sanity laneSnapshot where lane.slug = siteSettings.featuredLaneSlug
Render:
  - "ZPE-IMC_DOSSIER_001" header in monospace
  - INTEGRATED_MEMORY_CLUSTER title in Oswald
  - Version badge
  - Telemetry log (scrolling monospace feed of sync timestamps)
  - 4 metric cards: RATIO_OUTPUT, FIDELITY_RATE, PERPETUATION_CHECKS, HYBRID_RATE
  - "EXPOSE_RAW_DATA" button → links to repo
  - "REPORT_ACCESS" button → links to proof page
```

**Module 3 — Work Constellation Grid**
```
Component: ConstellationGrid.tsx
Data source: Sanity lanes where featuredOnHome=true, ordered by homePriority
  + their latest laneSnapshot
Render:
  - "SYSTEM_COMPONENTS_INDEX" header in Oswald
  - 4-column grid (responsive: 2-col mobile, 4-col desktop)
  - Each card:
    - Index number (001_CODE, 002_CODE, etc.)
    - Lane name in Oswald (e.g. "NEURAL_VOID")
    - Description from whatThisIs[0] in Courier
    - Authority status badge (StatusBadge component)
    - Link to /work/[slug]
```

**Module 4 — System Architecture Explainer**
```
Component: ArchitectureExplainer.tsx
Data source: Sanity siteSettings (static editorial)
Render:
  - Scroll-linked decomposition
  - ZER0PA = substrate → IMC = integration → lanes = domain → proofs = authority
  - Motion explains structure only (design.md §5)
```

**Module 5 — Proof Logic**
```
Component: ProofLogic.tsx
Data source: Mixed (Sanity editorial + dynamic proof-anchor examples from snapshots)
Render:
  - "PROOF_LOGIC" header
  - EVIDENCE_MODEL_ALPHA card: "PROBES TRADITIONAL BOUNDS..."
  - ABOUT_MOTION card: "THERMODYNAMIC CERTIFICATION..."
  - Right: hardware/system image (static)
  - "SINGULARITY_REACHED" caption
```

**Module 6 — Substrate Narrative**
```
Component: SubstrateNarrative.tsx
Data source: Sanity siteSettings.substrateNarrative
Render: 3–5 lines max, Courier, grey, centred
```

**Module 7 — Operations Footer**
```
Component: Footer.tsx
Data source: Sanity siteSettings.lastSyncTimestamp + static links
Render:
  - ZER0PA wordmark (small)
  - "© 2026 ZER0PA. SOVEREIGNTY. INTEGRITY. NO-AI. NO-HYPE."
  - Links: EVIDENCE_ROUTES, ARCHITECTURE, SYSTEM_LOGIC, LEGAL_FRAMEWORK
  - Last sync timestamp
```

---

## RUNBOOK 06 — LANE DETAIL TEMPLATE (`/work/[slug]`)

### RB06-01: Data Fetching

```
1. getStaticPaths: Query all lane slugs from Sanity
2. getStaticProps equivalent (App Router generateStaticParams):
   - Fetch lane + latest laneSnapshot from Sanity
   - If no snapshot exists → render editorial-only mode
   - Pass combined data to page component
```

### RB06-02: Lane Page Sections (Exact Order — PRD §10.2)

```
Section 1 — LaneHero
  - Lane name in Oswald ALL CAPS
  - Status badges: authority state, version, classification
  - "SUBJECT_IDENTITY" section from whatThisIs
  - "AUTHORITY_STATE" section with L3_VERIFIED_ASSET style

Section 2 — HeadlineMetrics
  - 4-column metric card row
  - Each card: label + value + source indicator
  - Values from headlineMetrics array

Section 3 — ModalityStatus (if modalityStatus array is non-empty)
  - "MODALITY STATUS SNAPSHOT (RADICAL HONESTY)" header
  - Grid of modality badges with PASS/FAIL/INCONCLUSIVE verdicts
  - Each shows: name + status + verdict badge

Section 4 — ProvedNow
  - "PROOF_ASSERTIONS" header
  - List of PASS items with green badges

Section 5 — NonClaims
  - "EXPLICIT_NON_CLAIMS" header
  - WARNING styling
  - Each item prefixed with [!]
  - "[!] NO CLAIM OF..." format

Section 6 — OpenRisks
  - "OPEN_RISKS" header
  - Distinct from non-claims visually
  - Amber/yellow indicator

Section 7 — ProofAnchors
  - "EVIDENCE_ROUTES" header
  - Left: visual (abstract image/diagram)
  - Right: "REPO_SHAPE" card with file listing
  - Links to GitHub (raw repo URLs)

Section 8 — RepoShape
  - Verification path listed as monospace commands
  - e.g. "VERIFY_COUNSEL_FILES.SH"
  - "ACCESS_REPOSITORY" button → GitHub URL

Section 9 — TelemetryLog
  - "ASSET_ANCHOR_TERMINAL_V1.0" header
  - Monospace scrolling log showing sync history
  - Last assertions/timestamps

Section 10 — RelatedLanes
  - "RELATED_LANES" header
  - Card links to related work pages

Section 11 — CTA
  - "SECURE THE EVIDENCE. JOIN THE CLUSTER."
  - "INITIATE_PARTNERSHIP" button → /contact
  - "DOWNLOAD_WHITE_PAPER" button → if exists
```

---

## RUNBOOK 07 — SUPPORTING PAGES

### RB07-01: `/work` — Constellation Index

```
Data: All lanes + latest snapshots from Sanity
Render:
  - Filterable by authority state (SUPPORTED / BLOCKED / INCONCLUSIVE / STAGED)
  - Grid layout matching homepage constellation
  - Each card links to /work/[slug]
```

### RB07-02: `/imc` — Flagship Deep-Dive

```
Same template as /work/[slug] but wired to slug="zpe-imc"
Additional sections:
  - Extended modality-level breakdown (10 modalities)
  - Comet ML dashboard embed/link
  - Throughput chart (D3)
```

### RB07-03: `/proof` — Evidence Model

```
Data: Aggregated proof anchors from all laneSnapshots
Render:
  - "How to read this site" explainer
  - Authority hierarchy diagram
  - Per-lane proof route listing
  - Link to each AUDITOR_PLAYBOOK
```

### RB07-04: `/about` — Substrate Narrative

```
Data: Sanity editorial
Render:
  - Compressed brand ethos (3-5 lines)
  - Architecture diagram
  - Team/contact routing
```

### RB07-05: `/contact`

```
Render:
  - architects@zer0pa.ai
  - Partnership routing
  - Licensing query path
  - Research collaboration path
```

---

## RUNBOOK 08 — SYNC, WEBHOOKS & OPS

### RB08-01: GitHub Webhook Setup

```
1. Create a GitHub Organization Webhook:
   - URL: https://zer0pa.ai/api/webhooks/github
   - Content type: application/json
   - Secret: <generate and store in env>
   - Events: push only
   - Repos: all ZPE-* repos

2. API route handler at src/app/api/webhooks/github/route.ts:
   - Verify webhook signature
   - Check: is the pushed repo in our allowedRepos?
   - If yes: trigger ingestion for THAT repo only
   - Trigger Next.js revalidateTag for affected lane + 'lanes'
```

### RB08-02: Scheduled Backstop Sync

```
1. Use Vercel Cron (if deployed on Vercel) or external cron:
   - Schedule: every 6 hours
   - Endpoint: POST /api/sync?secret=<backstop_secret>
   
2. Handler:
   - Run full discovery + ingestion for all repos
   - Compare SHAs against Sanity snapshots
   - Only re-parse repos with changed SHAs
   - Log: "X repos unchanged, Y repos updated, Z repos failed"
```

### RB08-03: Revalidation Strategy

```
Tag-based ISR (Next.js App Router):
  - Tag 'lanes' → invalidates homepage + /work index
  - Tag 'lane-{slug}' → invalidates /work/[slug] + /imc if slug=zpe-imc
  - Tag 'proof' → invalidates /proof
  - Default revalidation: 3600s (1 hour fallback)
```

### RB08-04: Degraded State Handling (PRD §11.2)

```
RULES:
1. If GitHub fetch fails → keep last good snapshot, show "Last synced: {timestamp}"
2. If parser confidence < 50 → mark lane DEGRADED in UI
3. NEVER blank a page
4. NEVER silently swap in placeholder copy
5. Log all failures to /api/sync-log (internal endpoint)
```

---

## RUNBOOK 09 — ACCESSIBILITY & PERFORMANCE

### RB09-01: WCAG 2.1 AA Checklist

```
[ ] Colour contrast: all text meets 4.5:1 ratio against #000
    - #7F7F7F on #000 = 4.17:1 → FAILS. Must use #8C8C8C (#8F8F8F = 4.57:1)
    - NOTE: Adjust --color-text-primary to #8F8F8F for compliance
    - White on black = 21:1 → PASSES
[ ] Focus states: visible outline on all interactive elements
[ ] Keyboard navigation: all links, buttons, cards reachable via Tab
[ ] Reduced motion: all animations respect prefers-reduced-motion
[ ] Alt text: all images have descriptive alt
[ ] Heading hierarchy: single H1 per page
[ ] Semantic HTML: nav, main, article, section, aside
[ ] ARIA labels on icon-only buttons
```

### RB09-02: Core Web Vitals Targets

```
INP ≤ 200ms  (design.md §10)
TTFB ≤ 0.8s  (design.md §10)
LCP ≤ 2.5s
CLS ≤ 0.1

Implementation:
- Static-first rendering (generateStaticParams)
- Lazy-load 3D scenes: dynamic(() => import('./ZeroSingularity'), { ssr: false })
- Lazy-load D3 charts below fold
- Self-host fonts (already planned)
- Image optimization via next/image
- Preload critical CSS
```

---

## RUNBOOK 10 — DEPLOYMENT & VERIFICATION

### RB10-01: Deployment Checklist

```
1. Push site/ to GitHub repo (or connect directly)
2. Connect to Vercel:
   - Root directory: site
   - Framework: Next.js
   - Environment variables: all from .env.local
3. Sanity Studio: accessible at /studio (protected by auth)
4. DNS: point zer0pa.ai A/CNAME to Vercel
5. SSL: auto-provisioned by Vercel
```

### RB10-02: Acceptance Verification (PRD §12)

```
Gate 1: Change a README in any ZPE-* repo → verify site updates after sync
Gate 2: No lane truth surface uses hardcoded data → grep for hardcoded strings
Gate 3: Reorder lanes in Sanity → homepage reflects new order
Gate 4: Homepage flagship + grid reads from Sanity snapshots
Gate 5: All 10 public repos have lane pages with proof anchors
Gate 6: ZPE-Ink (INCONCLUSIVE) renders as INCONCLUSIVE, not "active"
Gate 7: Remove a file from a repo → page degrades gracefully
Gate 8: Visual matches monochrome proof-first design (manual review)
```

### RB10-03: Smoke Test Script

```bash
# After deployment, run:
curl -s https://zer0pa.ai | grep -q "ZER0PA" && echo "PASS: Homepage loads"
curl -s https://zer0pa.ai/work/zpe-imc | grep -q "INTEGRATED_MEMORY" && echo "PASS: IMC lane"
curl -s https://zer0pa.ai/work/zpe-robotics | grep -q "MOTION_KERNEL" && echo "PASS: Robotics lane"
curl -s https://zer0pa.ai/api/webhooks/github -X POST -d '{}' | grep -q "401\|403" && echo "PASS: Webhook protected"
```

---

## Execution Order Summary

| Phase | Runbooks | Gate |
|---|---|---|
| **1. Scaffold & Parser** | RB01, RB02, RB03 | 5 real LanePackets with no hand-entered truth |
| **2. Sanity Integration** | RB04 | Machine snapshots + editorial shells visible in Sanity |
| **3. Homepage** | RB05 | Homepage visually on-model and live-driven |
| **4. Lane Template** | RB06, RB07 | 5+ public repos render with no bespoke coding |
| **5. Ops & Verification** | RB08, RB09, RB10 | Content changes propagate; pages stable under partial failure |

> [!IMPORTANT]
> Every step above is explicit. If a step is not in this document, it will not happen. If a detail is ambiguous, resolve it before executing.
