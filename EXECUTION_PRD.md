# ZER0PA — MASTER EXECUTION PRD

**Version:** 3.0 (Integrative Execution)  
**Reference Docs:** `ANTIGRAVITY_PRD.md`, `design.md`, `onboarding_landscape.md`  
**Working Directory:** `/Users/Zer0pa/Zer0pa Website`

## 1. Governing Logic & Visual Substrate
*As defined in design.md and PRD v1.0*

- **Substrate:** Pure Black (`#000000`).
- **Typography:** Oswald (Mastheads) | Courier Monospace (Data/UI).
- **Core Rule:** Radical Honesty. Data comes from GitHub repos or it doesn't appear as "Truth".
- **Color Correction:** Neutral Text at `#8F8F8F` (minimum for WCAG AA on black). White `#FFFFFF` reserved for the **0** and critical proof anchors.

---

## 2. Phase 1: Infrastructure & Ingestion
*Objective: Build the machine that reads the repos.*

### [RB01] Project Initialization
1. Initialize Next.js 14 (App Router) in `/site`.
2. Install dependencies: `sanity`, `next-sanity`, `remark`, `octokit`, `three`, `motion`, `d3`.
3. Scaffold directory structure (app, components, lib, scripts).
4. Integrate brand assets (SVG logos/icons).

### [RB03] The Ingestion Pipeline
1. Build `discovery.ts` to find all `ZPE-*` public repos.
2. Build `fetcher.ts` to grab raw Markdown/JSON from GitHub.
3. Build `parser/` module to extract:
   - **Identity:** (laneIdentifier, Title, Tagline)
   - **Authority:** (Status, Timestamp, Summary)
   - **Metrics:** (Raw values, Units, Source files)
   - **Boundaries:** (Explicit Non-Claims, Open Risks)
   - **Proof:** (Anchors, Repo Shape, Verification Paths)

### 🔴 Phase 1 Falsification Loop
- [ ] **Test Case A:** Parser sees a repo with NO `FINAL_STATUS.md`.
  - *Expected:* Degrades to `README.md` fallback; logs `parserWarning`.
- [ ] **Test Case B:** Repo has "Revolutionary" in description.
  - *Expected:* Parser flags/strips marketing hype or marks confidence lower.
- [ ] **Test Case C:** Rate limit hit on GitHub.
  - *Expected:* Site serves cached snapshots; shows "Last Synced" timestamp.

---

## 3. Phase 2: CMS & Content Model
*Objective: Sanity as the editorial skin, Snapshots as the technical bone.*

### [RB04] Sanity Integration
1. Define schemas: `lane` (editorial) and `laneSnapshot` (machine/readonly).
2. Build `sync-to-sanity.ts` to upsert parsed packets.
3. Lock `laneSnapshot` fields in Studio to prevent manual "polishing" of truth.

---

## 4. Phase 4: Page Implementation
*Objective: Render the DARPA-leak aesthetic.*

### [RB05] / (Homepage)
1. **Module 1: Hero.** ZER0PA mark + 3D Singularity + Authority headline.
2. **Module 2: Flagship.** IMC deep-card with live telemetry feed.
3. **Module 3: Constellation.** Dynamic grid of all discovered ZPE lanes.
4. **Module 6: Narrative.** 3 lines of substrate philosophy.

### 🔴 Homepage Falsification Loop
- [ ] **Verification:** Is the **0** in the logo pure white?
- [ ] **Stress Test:** Disable JavaScript.
  - *Expected:* Static metrics must still be visible (Static-first rendering).
- [ ] **Visual Audit:** Count fonts. If anything other than Oswald/Courier appears, implementation fails.

### [RB06] /work/[slug] (Lane Pages)
1. Implement Section 1–11 as defined in RB06.
2. Ensure "Explicit Non-Claims" are visually louder or more distinct than positive claims.

### 🔴 Lane Page Falsification Loop
- [ ] **Test Case D:** Lane has `FAIL` status.
  - *Expected:* Page must NOT try to look like a "Success Narrative". Must show Red/Blocked status clearly.
- [ ] **Test Case E:** Missing proof anchors.
  - *Expected:* "Evidence Routes" section collapses or shows "PENDING_VERIFICATION".

---

## 5. Global Falsification Loop (Pre-Approval)
*Run before final report.*

1. **The "Empty Repo" Test:** Add a dummy `ZPE-Test` repo with an empty README.
   - *Expected:* Site handles it without breaking; displays minimal identity; status = UNKNOWN.
2. **The "Contrast" Test:** Run axe-core/Lighthouse. Ensure `#8F8F8F` is the floor for text.
3. **The "Source of Truth" Test:** Edit a metric in a local cached packet. Run sync.
   - *Expected:* Sanity/Next.js must reflect the change immediately/upon revalidation.

---

## 6. Execution Instructions
Proceed sequentially. After each Runbook [RBxx], update `task.md`. After each Falsification Loop, perform the check and document the result in `walkthrough.md`.
