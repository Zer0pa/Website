# PRD: Stitch Rescaffold Closeout — Sub-Agent Execution Plan

**Created:** 2026-04-06
**Author:** Dispatch Orchestrator (Opus)
**System:** CLAW (Continuous Locally-Autonomous Website)
**Status:** ACTIVE — Codex pipeline PAUSED, executing via Claude sub-agents

---

## 0. Context for All Agents

You are working on the Zer0pa website (`site/` directory). This is a Next.js 14 app-router project.

**Critical doctrine:** Google Stitch prototypes are LITERAL CODE SCAFFOLDS. You COPY the HTML into JSX. You do NOT reinterpret, extract patterns, or reimplement in custom CSS. You keep ALL Tailwind utility classes intact.

**Reference implementation:** The product page at `site/src/app/work/[slug]/page.tsx` on branch `codex/product-family` (commit 9a4aded) is the gold standard. It was successfully rescaffolded from Stitch HTML. Study its patterns: how it imports fonts, loads data, wires dynamic content, uses `data-slot` for visualization placeholders, and structures the page with Tailwind classes.

**Branch strategy:** All work happens on `main`. The `codex/product-family` branch has the rescaffolded product page that needs to be merged first (Task 0).

### Key Files

| File | Purpose |
|------|---------|
| `site/package.json` | Dependencies — currently NO Tailwind |
| `site/src/app/layout.tsx` | Root layout |
| `site/src/app/globals.css` | Global styles — 3623 lines of custom CSS, NO Tailwind directives |
| `site/src/app/page.tsx` | Homepage (57 lines, uses custom components) |
| `site/src/app/imc/page.tsx` | IMC page (88 lines, uses LaneAuthorityPage component) |
| `site/src/app/work/[slug]/page.tsx` | Product page (101 lines on main, 371 lines on codex/product-family) |
| `site/src/lib/data/lane-data.ts` | Data loading: `loadLaneBySlug()`, `loadLaneCatalog()`, `laneSlug()` |
| `site/src/lib/data/presentation.ts` | Display helpers: `selectPrimaryMetrics()`, `selectProofAnchors()`, `buildTerminalLines()`, `buildRelatedLanes()`, `buildRepoSummary()`, `descriptorForLane()`, `authoritySummary()`, `cleanDisplayText()` |
| `site/src/components/home/` | Homepage components: Hero, FlagshipBlock, ConstellationGrid, ProofLogic |
| `site/src/components/lane/` | Lane components: LaneAuthorityPage |
| `site/src/components/layout/` | Layout components: Header, Footer |

### Stitch HTML Sources (on host Mac)

These files contain production-ready HTML with Tailwind CDN classes:

1. **Homepage:** `/Users/zer0palab/Zer0pa Website/Zer0pa Homepage/code.html`
2. **Product Pages:** `/Users/zer0palab/Zer0pa Website/Zer0pa ZPE Product Pages/code.html`
3. **ZPE-IMC:** `/Users/zer0palab/Zer0pa Website/Zer0pa ZPE-IMC Page/code.html`

**NOTE FOR SUB-AGENTS:** These files are on the user's Mac filesystem, not in the mounted workspace. You will need to read them via the file path. If you cannot access them, the Stitch directive at `CLAW/control-plane/directives/stitch-rescaffold.json` describes what they contain, and the product page on `codex/product-family` branch shows the completed pattern.

### Brand Assets

- Logo SVG: `/Users/zer0palab/Zer0pa Website/ZER0PA LOGO.svg` (also at `site/../ZEROPA logo.svg`)
- Icon SVG: `/Users/zer0palab/Zer0pa Website/ZER0PA ICON.svg` (also at `site/../zer0pa icon.svg`)

### Data Pipeline

All content comes from GitHub repos via packet cache at `site/.cache/packets/`. Key functions:

- `loadLaneCatalog()` — returns `{ lanes, featuredLane, lastSyncedAt }`
- `loadLaneBySlug(slug)` — returns a `LanePacket` with: `laneIdentifier`, `tagline`, `authorityState`, `confidenceScore`, `repoUrl`, `headlineMetrics`, `provedNow`, `modalities`, `verificationPath`, etc.
- `laneSlug(identifier)` — converts "ZPE-XR" → "xr"

### Tailwind Config (from codex/product-family branch)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        'surface-container-low': '#1b1b1b',
        'surface-dim': '#131313',
        primary: '#ffffff',
        'surface-bright': '#393939',
        'on-surface': '#e2e2e2',
        outline: '#919191',
        'on-background': '#e2e2e2',
        'surface-container': '#1f1f1f',
        'surface-container-high': '#2a2a2a',
        'on-surface-variant': '#c6c6c6',
        secondary: '#c7c6c6',
        error: '#ffb4ab',
      },
      fontFamily: {
        oswald: ['var(--font-oswald-next)', 'Oswald', 'sans-serif'],
        mono: ['var(--font-courier-next)', 'Courier Prime', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px',
      },
    },
  },
};

export default config;
```

### Fonts Pattern (from product page)

```typescript
import { Courier_Prime, Oswald } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-oswald-next',
});

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier-next',
});

// Wrap page in: <div className={`${oswald.variable} ${courierPrime.variable} dark`}>
```

---

## Task 0: Merge Product-Family Branch & Install Tailwind

**Priority:** BLOCKING — all other tasks depend on this
**Scope:** Infrastructure

### Steps

1. Merge `codex/product-family` into `main`:
   ```bash
   cd site/.. && git merge codex/product-family --no-edit
   ```
   If conflicts arise, prefer the product-family version for any file under `site/src/app/work/` and `site/tailwind.config.ts`. For `globals.css`, ensure the Tailwind directives (`@tailwind base/components/utilities`) are at the top, followed by the existing custom CSS.

2. Verify Tailwind is in `package.json` after merge. If not:
   ```bash
   cd site && npm install -D tailwindcss @tailwindcss/postcss postcss
   ```

3. Verify `site/tailwind.config.ts` exists after merge. If not, create it with the config shown above.

4. Verify `site/postcss.config.mjs` exists. If not, create:
   ```javascript
   /** @type {import('postcss-load-config').Config} */
   const config = {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   };
   export default config;
   ```

5. Run `npm install` in `site/` to install all dependencies.

6. Run `npm run build` in `site/` — must pass. If `@tailwindcss/postcss` is missing, install it explicitly.

7. Commit if any changes were needed beyond the merge.

### Success Criteria
- `main` branch has Tailwind installed and configured
- `npm run build` passes
- Product page at `/work/[slug]` renders with Tailwind classes

---

## Task 1: Homepage Stitch Rescaffold

**Priority:** HIGH
**Scope:** `site/src/app/page.tsx` + potentially new components

### Current State
The homepage is 57 lines using custom components: `Hero`, `FlagshipBlock`, `ConstellationGrid`, `ProofLogic` with `Header` and `Footer`. All use custom CSS classes (`.substrate`, `.page-shell`, etc.).

### Target State
Replace with Stitch HTML structure using Tailwind classes, following the same pattern as the product page rescaffold.

### Steps

1. Read the Stitch homepage HTML from `/Users/zer0palab/Zer0pa Website/Zer0pa Homepage/code.html`
2. Study the existing homepage (`site/src/app/page.tsx`) to understand what dynamic data it uses: `loadLaneCatalog()`, `featuredLane`, `syncTimestamp`, `status`, `confidence`
3. Study the product page rescaffold on `codex/product-family` branch for the pattern (font imports, className wrapping, Tailwind usage, data-slot placeholders)
4. Rewrite `page.tsx` as a single-file page component (same pattern as product page):
   - Import `Oswald` and `Courier_Prime` from `next/font/google`
   - Import `loadLaneCatalog`, `laneSlug` from data layer
   - Import `StructuredData` for SEO
   - COPY the Stitch HTML structure as JSX, keeping ALL Tailwind classes
   - Wire dynamic data: lane catalog for the constellation grid, featured lane for the flagship block, sync timestamp and status for the hero
   - Use `data-slot` attributes for visualization/widget placeholders
   - Include header and footer INLINE (matching Stitch HTML, not the old Header/Footer components) — follow the product page pattern
5. Verify with `npm run build`

### Content Mapping (Homepage)

| Stitch Section | Data Source |
|----------------|------------|
| Hero / headline | Static: "ZER0PA" branding + `catalog.lastSyncedAt` for sync timestamp |
| Status indicator | `featuredLane.authorityState.status` |
| Flagship block | `featuredLane` — use `descriptorForLane()`, `selectPrimaryMetrics()` |
| Constellation grid | `catalog.lanes` — map each to a card with `laneSlug()` for links |
| Proof/evidence section | Aggregate from catalog or static content |

### Constraints
- Keep `export const dynamic = 'force-dynamic'`
- Keep `generateMetadata` or `export const metadata`
- Keep `StructuredData` component
- Do NOT delete the old components yet — just stop importing them in page.tsx
- The homepage has a DIFFERENT design from product pages — use the homepage Stitch HTML, not the product page one

---

## Task 2: IMC Page Stitch Rescaffold

**Priority:** HIGH
**Scope:** `site/src/app/imc/page.tsx`

### Current State
88 lines using `LaneAuthorityPage` component with `Header` and `Footer`. Custom CSS classes.

### Target State
Stitch-based layout with Tailwind. The IMC page is a HYBRID: it's both a product page AND an overarching foundational page. It should merge the product page template structure with IMC-specific design from the Stitch HTML.

### Steps

1. Read the Stitch IMC HTML from `/Users/zer0palab/Zer0pa Website/Zer0pa ZPE-IMC Page/code.html`
2. Read the Stitch product page HTML for structural reference
3. Study the completed product page rescaffold (`site/src/app/work/[slug]/page.tsx` after Task 0 merge)
4. Study the existing IMC page to understand data usage: `loadLaneBySlug('imc')`, `loadLaneCatalog()`
5. Rewrite `imc/page.tsx` following the same single-file pattern:
   - Font imports (Oswald, Courier_Prime)
   - Data loading with `loadLaneBySlug('imc')` and `loadLaneCatalog()`
   - COPY the Stitch IMC HTML as JSX, keeping ALL Tailwind classes
   - Wire dynamic content from the IMC lane packet
   - Include inline header/footer matching Stitch design
   - Add sections that are IMC-specific (the "overarching foundational content" role)
   - Use `data-slot` for visualization/widget spaces
6. Handle the null-lane fallback (same pattern as product page)
7. Verify with `npm run build`

### Content Mapping (IMC)

| Stitch Section | Data Source |
|----------------|------------|
| Hero | `lane.laneIdentifier`, `lane.authorityState.status` |
| Description/tagline | `lane.tagline`, `descriptorForLane(lane)` |
| Metrics | `selectPrimaryMetrics(lane)` |
| Evidence/proof | `selectProofAnchors(lane)` |
| Terminal/log | `buildTerminalLines(lane)` |
| Related lanes | `buildRelatedLanes(lane, catalog.lanes)` — IMC is parent, show child lanes |
| Foundational content | IMC-specific: modalities, architecture explanation sections |

---

## Task 3: QA Fix Pass — Contrast & Mobile Overflow

**Priority:** MEDIUM
**Scope:** All routes

### Known Issues (from systems-qa first real pass)

1. **72 contrast failures** — text with ratio=1 on some nodes. Root cause: elements with `color: transparent` or same-color text/background. Fix: audit all `text-[#474747]` on `bg-[#131313]` combinations and ensure WCAG AA (4.5:1 minimum).

2. **Mobile horizontal overflow** on `/work/xr`, `/`, `/imc`, `/work/ft`. Root cause: fixed-width elements or long unbroken strings. Fix: add `overflow-x-hidden` to the body/main wrapper, add `break-words` to text containers, ensure grid columns collapse properly on mobile.

3. **14 layout diffs against Stitch reference** on `/work/xr`. These will be addressed by Tasks 1 and 2 for homepage/IMC. For product pages, verify the rescaffolded version matches Stitch closely.

4. **8 critical + 6 major geometry-law failures**. The first broken law is hero title/meta row-gap. After Stitch rescaffold, the GGD laws need updating to match the new Stitch-based layout rather than the old abstract specs.

### Steps

1. After Tasks 0-2 are complete, run `npm run build` to verify everything compiles
2. Review all Tailwind color combinations for contrast compliance
3. Fix any `text-[hex]` on `bg-[hex]` combinations that fail 4.5:1 ratio
4. Add responsive safeguards: `overflow-x-hidden` on page wrappers, `break-all` or `break-words` on long-text containers
5. Test at mobile viewport (375px) — ensure no horizontal scroll
6. Verify with build

---

## Task 4: Build Verification & Integration

**Priority:** REQUIRED — final gate
**Scope:** Full site

### Steps

1. Run `npm run build` in `site/` — must pass with zero errors
2. Run `npm run dev` and verify each route loads:
   - `/` — homepage with Stitch layout
   - `/imc` — IMC page with Stitch layout
   - `/work/xr` — product page (already rescaffolded)
   - `/about`, `/contact`, `/proof` — should still work (unchanged)
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Verify no import errors (old components referenced that don't exist, etc.)

### Success Criteria
- All routes build and render
- No TypeScript errors
- Tailwind classes are active (not rendered as plain text)
- Dynamic data loads from packet cache
- Pages are responsive (no horizontal overflow at 375px)

---

## Execution Model

**Orchestrator (Opus):** Stays in Dispatch. Writes this PRD, assigns tasks, reviews results.

**Implementation Agents (Sonnet):** Execute Tasks 0-2 in sequence (0 blocks 1 and 2; 1 and 2 can parallelize after 0).

**QA Agent (Haiku or Sonnet):** Executes Tasks 3-4 after implementation is complete.

**All agents operate on the mounted workspace** at the repo root. No Codex credits consumed. No CLAW runner needed — these are direct file edits + npm commands.

---

## Memory References

- `CLAW/ENGINEERING_STATUS.md` — Full system architecture and session log
- `CLAW/control-plane/directives/stitch-rescaffold.json` — Stitch doctrine and instructions
- `CLAW/control-plane/state/runtime-state.json` — Current pipeline state (PAUSED)
- Branch `codex/product-family` commit `9a4aded` — Gold standard rescaffold reference
