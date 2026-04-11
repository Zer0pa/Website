# Stitch Product Page Refinement PRD

Version: 1.0  
Date: 2026-04-10  
Status: IN_PROGRESS  
Applies to: All 10 ZPE product pages

---

## R01 — Logo sizing (nav, top-left)

- Current: `h-8` (2rem / 32px)
- Target: 4× → `h-32` (8rem / 128px)
- Do NOT modify the SVG. Only change the container div height.
- Nav bar height must increase to accommodate

## R02 — Logo sizing (footer, bottom-left)

- Current: `h-6` (1.5rem / 24px)
- Target: 7× → `h-[10.5rem]` (168px)
- Do NOT modify the SVG. Only change the container div height.

## R03 — Icon sizing (nav, top-right)

- Current: `h-12 w-12` (3rem / 48px)
- Target: 1.5× → `h-[4.5rem] w-[4.5rem]` (72px)
- Do NOT modify the SVG.

## R04 — Nav bar background

- Current: `bg-[#131313]` (off-black, visible bar)
- Target: `bg-black` / `bg-[#000000]` — blend into page background, remove bar appearance

## R05 — Footer bar background

- Current: `bg-[#131313]`
- Target: `bg-black` / `bg-[#000000]` — blend into page background

## R06 — Card surface color (authority block, key metrics cards, etc.)

- Current: `surface-container-low` = `#1b1b1b` (too gray)
- Target: `#131313` (the "perfect" off-black previously used in nav/footer)
- Applies to: Authority Status panel, Key Metrics 4-card grid, Proof Anchors panel, Repo Shape panel, Verification Status cells

## R07 — Menu text change

- Change "ZPE" → "ZERO-POINT ENCODING"
- Keep all other menu items unchanged
- Adjust spacing/layout as needed for longer text

## R08 — Remove nav right-side icons

- Remove the three material icons: terminal, code, share
- Keep CLONE_REPO button and icon (0) as-is

## R09 — Repo moniker (H1)

- Currently: e.g., "ZPE-Robotics" (mixed case from data)
- Target: ALL CAPS → "ZPE-ROBOTICS"
- Apply `.upper()` to the identifier in the H1 and anywhere it appears as a title

## R10 — What This Is: bold first sentence

- In the What This Is paragraph, the first sentence should be wrapped in `<strong>` / bold
- Detect sentence boundary (first `.` followed by space) and bold everything before it

## R11 — Authority Status block vertical sizing

- Reduce vertical padding/height of the authority status panel
- Keep horizontal width the same (col-span-4)
- Align bottom of authority block with approximate end of "What This Is" text content
- Leave remaining vertical space open (future use)

## R12 — Status badge sizing (top-right header area)

- "STATUS: BLOCKED" badge → 3× current text size
- Current: `text-xs` → Target: `text-2xl font-bold`
- "LAST_SYNC:" text → 2× current text size
- Current: `text-[0.6875rem]` → Target: `text-base`

## R13 — Key Metrics section title

- Replace "CRITICAL_TELEMETRY" with "KEY_METRICS"
- Style as a proper section heading matching other headers

## R14 — Section heading consistency

- "WHAT THIS IS" heading → 2× current size (currently `text-2xl`, target `text-4xl`)
- All other section headings should match the Authority Status heading size:
  - KEY_METRICS header
  - WHAT WE PROVE
  - WHAT WE DON'T CLAIM
  - VERIFICATION STATUS
  - PROOF ANCHORS
  - REPO SHAPE
  - RELATED_REPOS
- Use `font-headline text-2xl` consistently for all

## R15 — CTA Band revert to original Stitch design

- Revert layout to original Stitch template design
- Change bg from `surface-container-highest` (#353535) → black background
- Keep border-t-2 border-white
- Keep content (FINALIZE_ACCESS_PROTOCOL text, buttons with correct links)
- Stacked layout: `flex-col` on all breakpoints, centered

## R16 — Verification Status: show check names

- Currently: only shows V_0N code + PASS/FAIL verdict (cryptic)
- Target: show the actual check name from the data
- Layout change: switch from 6-col compact grid to a readable format
  - 3 columns per row (wider cells)
  - Each cell shows: code (small), check name (main text), verdict
  - Or: table/list format with Code | Check | Verdict columns

---

## Execution Tracker

| ID  | Description                        | Status    |
|-----|------------------------------------|-----------|
| R01 | Logo nav 4×                        | DONE      |
| R02 | Logo footer 7×                     | DONE      |
| R03 | Icon nav 1.5×                      | DONE      |
| R04 | Nav bg → black                     | DONE      |
| R05 | Footer bg → black                  | DONE      |
| R06 | Card surfaces → #131313            | DONE      |
| R07 | ZPE → ZERO-POINT ENCODING         | DONE      |
| R08 | Remove 3 nav icons                 | DONE      |
| R09 | H1 ALL CAPS                        | DONE      |
| R10 | Bold first sentence What This Is   | DONE      |
| R11 | Authority block height reduce      | DONE      |
| R12 | Status badge 3× / sync 2×         | DONE      |
| R13 | CRITICAL_TELEMETRY → KEY_METRICS   | DONE      |
| R14 | Section heading consistency         | DONE      |
| R15 | CTA Band revert to Stitch design   | DONE      |
| R16 | Verification: show check names     | DONE      |
