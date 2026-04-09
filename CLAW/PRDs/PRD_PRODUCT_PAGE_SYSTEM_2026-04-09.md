# PRD — ZPE Product Page System

**Version:** 1.0
**Date:** 2026-04-09
**Author:** Claude (Chrome MCP browser agent) under Architect Prime direction
**Supersedes:** ANTIGRAVITY_PRD.md, ANTIGRAVITY_PRD_AUGMENTED.md, go-live-docs/GO_LIVE_PRD.md, older DELIVERY_EXECUTION_PRD_*.md (pending archive)
**Source of truth for sequencing:** `_ops/WORKLIST_2026-04-09.md`
**Depends on:** `CLAW/PRDs/SITE_SCOPE_AUDIT.md` (2026-04-08, still accurate)

---

## 1. North star

Every ZPE repo (`ZPE-Robotics`, `ZPE-FT`, `ZPE-Geo`, `ZPE-Ink`, `ZPE-IoT`, `ZPE-Mocap`, `ZPE-Neuro`, `ZPE-Prosody`, `ZPE-XR`, and any future additions like `ZeropaCraft-Marine`) gets a live `/work/[slug]` authority dossier on the ZER0PA website that:

1. Is visually indistinguishable from the Stitch "Dossier of Absolute Truth" design language across all lanes — one template, one rendering path, zero per-lane bespoke forks.
2. Draws every metric, modality verdict, proof anchor, and non-claim from the repo's own proof directory through `laneSnapshot` / packet JSON. No marketing fill, no fabricated numbers.
3. Degrades honestly when a packet is missing (`AUTHORITY_DOSSIER_MISSING`) rather than faking content.
4. Can be refreshed by a GitHub commit in the source repo → packet regeneration → Vercel rebuild, with no code edit on the website.
5. Passes the GGD geometry-law contract (no overflow at any limiting viewport, 90° corners, monospace-body + Oswald-headline typography, void-to-signal color discipline).

**ZPE-Robotics is the first lane to close under this contract.** Its success defines the template for the remaining 8 lanes (Step 3 of the worklist). ZPE-IMC is explicitly deferred to Step 5 because it is currently divergent (see §6).

---

## 2. Scope

### In scope
- `/work/robotics` visual + data correctness (the Step 1 lane)
- `LaneAuthorityPage` component fidelity against the Stitch mock at `Zer0pa Website/Zer0pa ZPE Product Pages/code.html`
- Packet sync pipeline from GitHub repos → `site/.cache/packets/*.json` → Sanity → page
- A documented templated runbook so Claw subagents can lift the remaining 8 lanes without additional design decisions
- Honest-degradation path when a packet is absent or partial
- GGD geometry-law + responsive gate pass on every product page before sign-off

### Out of scope
- `/imc` rewrite (deferred to worklist Step 5)
- `/about`, `/contact`, `/proof`, `/labs`, `/org` scaffolding
- Homepage visual fidelity (worklist Step 7)
- Animation, motion design, 3D hero work
- Marketplace/Sanity schema additions beyond the existing `laneSnapshot` type
- GitHub-live telemetry (stars, CI status) — the audit noted this is ~110 lines of work and is explicitly deferred to after Step 4

---

## 3. Current reality — what is already built

Verified by reading source on 2026-04-09.

| Layer | Where | What it does today |
|---|---|---|
| Route | `site/src/app/work/[slug]/page.tsx` (101 lines) | Dynamic route for all 10 lanes. Loads packet + catalog, renders `Header variant="product"`, `StructuredData`, `LaneAuthorityPage`, `Footer`. Honest-degradation branch returns `ROUTE NOT FOUND` with `[ AUTHORITY_DOSSIER_MISSING ]` label. |
| Component | `site/src/components/lane/LaneAuthorityPage.tsx` (217 lines) | Full template. Sections: hero title + meta brackets, subject-identity + authority-state 2-col, 4-metric row, assertions vs non-claims 2-col (red-bordered non-claims), modality band grid, evidence-hex visual + repo-shape panel with `ACCESS_REPOSITORY`, `PROOF_ANCHOR_TERMINAL_V1.3`, related lanes grid, CTA band with `INITIATE_PARTNERSHIP` + `DOWNLOAD_WHITE_PAPER`. |
| Data | `site/src/lib/data/lane-data.ts` | `loadLaneBySlug()` + `loadLaneCatalog()`. Prefers Sanity via GROQ; falls back to `.cache/packets/*.json`. |
| Packet (Robotics) | `site/.cache/packets/ZPE-Robotics.json` | `status: BLOCKED`, headline `187.1345× on lerobot/columbia_cairlab_pusht_real`, 4 headline metrics, 5 non-claims, 6 modalities (2 PASS, 3 FAIL, 1 INCONCLUSIVE), 10 proof anchors, `confidenceScore: 90`, last synced 2026-03-27. |
| Ingest | `scripts/ingest.ts` + `site/src/lib/github/{discovery,fetcher}.ts` | Offline tooling that writes to packet cache and Sanity. Not called from any page at runtime. |
| Stitch mock | `Zer0pa Website/Zer0pa ZPE Product Pages/code.html` | Per F2 falsification in the site audit: byte-equivalent to the `Zer0pa ZPE-IMC Page/code.html` mock. The file is literally titled "ZPE-IMC" internally. Treat as a block-level visual reference, not a component scaffold. |

### What this means for Step 1

The template already renders a dossier with most of the structure the Stitch mock calls for. **The work is not "build a product page" — it is "tighten the existing template's visual fidelity against the Stitch reference, verify the Robotics packet is faithful to the source repo, and lock the geometry-law gate."**

---

## 4. Gap analysis — LaneAuthorityPage vs Stitch mock

The Stitch mock is the authoritative visual target. Structural differences below are the explicit work for Step 1.

| Area | Stitch mock does | Template currently does | Required action |
|---|---|---|---|
| Hero scale | `Oswald 6rem/8rem`, `leading-[0.85]`, tracking-tighter, black background, flush-left masthead consuming 8 of 12 cols | `lane-display-h1` — scale not verified visually, uses generic class | Lock hero H1 class to min 6rem / clamp 6–8rem with leading 0.85, tracking-tighter. Add measurement to acceptance spec. |
| Singularity glyph | 24×24 white square with 6rem black "0" in top-right of hero row | Not present on product pages (only homepage has it via home components) | Add optional `<SingularityGlyph>` slot to LaneAuthorityPage hero row. Show on all product pages. |
| Status pip | 2×2 white square + `STATUS: VERIFIED` + latency callout | `[ STATUS: {status} ]` in meta brackets | Keep bracket notation (more information-dense) but add the pip visual next to status for parity. |
| Metric row | 3 large cards (`h-64`), 5rem value, hover shows white border, includes progress-bar or bar-stack affordance | 4-card row, no hover border, no bar affordance | Reduce to 3 cards on product pages OR keep 4 but adopt hover border and larger value type. Decision: keep 4 (honest density > visual parity with mock). Adopt hover border. |
| Body dossier (2-col) | Col 4: identifier + pull-quote; Col 8: uppercase technical paragraph in `surface-container-low` with bordered footer metadata (ENCRYPTION_LAYER, PROTOCOL_REV) | Single `subject-identity` + separate `authority-state` panel | Restructure authority-state panel to sit adjacent to subject-identity as a 4/8 col split matching the mock's grid. Keep authority-state fields (VERDICT, ORBITAL_HASH, TIMESTAMP, MODEL_CONSENSUS) but surface them as the bordered-footer metadata. |
| Terminal | `[14:22:01.004] HANDSHAKE_INITIATED...` timestamped log lines in a bordered `#000` box with header bar "TERMINAL_LOGS: LIVE_EVIDENCE" | `PROOF_ANCHOR_TERMINAL_V1.3` with `buildTerminalLines()` output | Keep our terminal content (it's real proof data). Adopt mock's visual chrome: header bar with two indicator squares, `#000` background, monospace 0.75rem, fixed `h-80` with scroll. |
| Methods stack | 3 methods on the right side of the terminal row, each with `001_METHOD` label, bold title, hover pads-left 4 | Not present — we have `EVIDENCE_ROUTES` + `REPO_SHAPE` in that space | Keep our `REPO_SHAPE` (it's more useful). Drop the decorative evidence-hex visual in favor of the 3-method stack, feeding from `proofAnchors[0..2]` with label/title/description. |
| Related lanes | Inline horizontal bar with `CONTINUE_ACCESS:` and big bg-white-on-hover links | 3-card grid with identifier + title | Keep 3-card grid (better for 10-lane surface). Add the `CONTINUE_ACCESS:` heading treatment. |
| Grid overlay | `fixed inset-0 radial-gradient(#fff 1px, transparent 1px) 40px 40px` at 3% opacity | Not present | Add to `.substrate` global style. Applies to all pages. Single line in `globals.css`. |
| Corners | All 0px | Mostly 0px — verify no stray `rounded-*` classes | Grep for `rounded` inside `LaneAuthorityPage.tsx` and any component it imports. Remove. |
| Borders | No 1px lines; use tonal shifts | `lane-panel-red` uses a red border for non-claims | **Keep.** The mock's "no line" rule is aspirational; the non-claim red border is functional contrast and is explicitly allowed by the GGD contract as "felt, not seen". |

### Robotics-specific correctness gaps (not design — data)

These must be verified against the `Zer0pa/ZPE-Robotics` repo *before* locking the design:

1. Packet `syncedAt: 2026-03-27` is 13 days old. Re-run `scripts/ingest.ts` against the live repo to pick up any new proofs or blocker changes.
2. `commitSha: ""` is empty. Ingest must populate this from `git ls-remote` or GitHub API. Currently the page shows `UNRESOLVED` under `ORBITAL_HASH`.
3. `timestamp: ""` is empty. Same root cause — ingest should fill from the repo's proof file mtime or the latest commit date of `proofs/FINAL_STATUS.md`.
4. The headline metric `"B1, B2, B4, and B5 pass; B3 fails"` with `numericValue: 1` is wrong — numeric should be `4` (passing gates) or the metric should be restructured as a pass/fail ratio. Review the ingest parser.
5. `explicitNonClaims[4]` is the literal string `"normalized current runbooks to repo-local proof paths"` — that's a changelog entry leaking into the non-claims section. Ingest parser bug. Fix at source.

Fixing these is in scope for Step 1 because they are visible on the rendered page.

---

## 5. Templated subagent job — Step 2 design

Once Step 1 closes for Robotics, the remaining 8 lanes (FT, Geo, Ink, IoT, Mocap, Neuro, Prosody, XR, + any new repos) need to lift with zero new design decisions.

### 5.1 The runbook

Location: `Website-main/CLAW/RUNBOOKS/product-page-lift-loop/`

Files:
- `README.md` — one-page overview, pointer to this PRD
- `INPUTS.md` — what the agent needs: repo URL, expected slug, access to ingest scripts, access to live Vercel preview
- `STEPS.md` — deterministic ordered list, below
- `ACCEPTANCE.md` — the gate checklist, below
- `outputs/` — per-lane reports

### 5.2 The deterministic steps (per lane)

1. **Ingest.** Run `npx tsx scripts/ingest.ts --repo Zer0pa/<RepoName>`. Verify it writes a packet at `site/.cache/packets/<RepoName>.json`.
2. **Validate packet.** Assert the packet has: non-empty `commitSha`, non-empty `timestamp`, ≥1 headline metric with numeric value consistent with the raw string, ≥1 proof anchor, no obvious parser bleed in `explicitNonClaims` (no changelog verbs, no sentence fragments from unrelated sections).
3. **If validation fails:** emit a repo-level report flagging the ingest parser bug. Do NOT publish a broken page. Halt this lane and move on. The ingest parser is the bug; patch it in a separate PR.
4. **Local build.** `cd site && npm run build` on the feature branch. Must complete without errors.
5. **Route smoke test.** `npm start` + `curl -sI http://localhost:3000/work/<slug>`. Must return HTTP 200. `curl http://localhost:3000/work/<slug> | grep -E "<RepoName>|__NEXT_DATA__"` must match.
6. **GGD geometry gate.** Run the existing GGD verification bundle for the route (`ggd verify /work/<slug>` or the current equivalent). Must return no critical gaps.
7. **Responsive limiting cases.** Playwright screenshots at 390×844, 768×1024, 1280×800, 1440×900, 1920×1080, 2560×1440. No horizontal overflow at any.
8. **Visual diff.** Compare 1440×900 screenshot against a reference template screenshot of `/work/robotics` after Step 1 sign-off. Layout skeleton must match structurally (same sections in same order, same grid).
9. **Push + Vercel preview.** Push feature branch. Wait for Vercel preview. Re-run curl smoke against the preview URL (requires bypass token or DP disabled).
10. **Emit report** to `outputs/<slug>/<timestamp>/` with: packet summary, screenshot paths, GGD gate output, preview URL, PASS/FAIL.
11. **Human sign-off gate.** Agents do not merge. Reports queue at `control-plane/reports/product-page-lift/` for Architect Prime review.

### 5.3 Acceptance gate for any product page

A product page is DONE when **all** of the following hold:

- [ ] Packet validation passes (§5.2 step 2)
- [ ] `next build` succeeds on a clean checkout
- [ ] Route returns HTTP 200 on both local and Vercel preview
- [ ] GGD geometry-law gate returns no critical or major gaps
- [ ] No horizontal overflow at any of the 6 tested viewports
- [ ] `grep -r "rounded" site/src/components/lane/` returns nothing
- [ ] `grep -r "box-shadow" site/src/styles/` returns only the high-dispersion modal shadow
- [ ] Visual structural diff against the Robotics reference shows same 9 sections in same order
- [ ] Non-claims section renders with ≥1 item (if the packet has zero, either the repo is truly unproblematic or the parser is suspiciously generous — flag for human)
- [ ] All proof anchor links resolve to live GitHub URLs (HTTP 200)
- [ ] Architect Prime visually approves the preview URL in a real browser

### 5.4 Parallelism

Lanes are independent. Claw can run all 8 in parallel, each in its own worktree under `worktrees/product-lift-<slug>/`. The existing `worktrees/` convention already supports this. Merge strategy: one PR per lane, sequentially reviewed. Do not merge a batch.

---

## 6. ZPE-IMC — why it is deferred to Step 5

Per `SITE_SCOPE_AUDIT.md` §8 and the site audit's Open Question #1: there are **two parallel `/imc` rendering paths** on main vs the `systems-qa` worktree. Main has a 392-line bespoke page; `systems-qa` has an 88-line page that delegates entirely to `LaneAuthorityPage`.

If we tried to "perfect" ZPE-IMC now, we would:

- Waste effort refining a page that may be deleted
- Create drift between the flagship and the product-page template we're trying to lock
- Force a merge decision the user explicitly deferred ("ZPE-IMC needs to be different" — 2026-04-09)

**Decision for this PRD:** ZPE-IMC is out of scope for Steps 1–4. When Step 5 opens, the user will pick one of: (a) keep 392-line bespoke and accept ongoing divergence, (b) take the 88-line `systems-qa` convergence, (c) fresh design. All three are acceptable; none block the product-page template work.

The important architectural commitment: **ZPE-IMC may render differently from product pages, but it must not render from a *forked copy* of `LaneAuthorityPage`.** If the user picks bespoke, it must live in its own component and not be a stale copy of the shared template.

---

## 7. Environment constraints

All work in this PRD assumes the stack the user has running as of 2026-04-09:

- macOS on `Prinivens-MacBook-Pro`
- Repo at `/Users/zer0palab/Zer0pa Website/Website-main`, git remote `github.com/Zer0pa/Website`
- GitHub auth via `gh` CLI keychain (`Zer0pa-Architect-Prime`)
- Vercel project `website-product-pages` under team `zer0pa-76d1316c`, Hobby tier, Deployment Protection ON
- Vercel token `VERCEL_TOKEN` in `~/.env` is personal-scope (read-only for team resources) — replacement with a team-scoped token is queued
- Claude Code CLI for file/git/build work; Chrome MCP for browser-level verification; computer-use as fallback for native apps
- Claw autonomy launchd service is UNLOADED and stays unloaded until the user explicitly reactivates it

**No step in this PRD requires a new account, new cloud provider, new framework, or a rewrite of the build system.**

---

## 8. Open decisions for the user

Before Step 1 can close, Architect Prime needs to decide:

1. **Deployment Protection:** Keep on (agents cannot verify visually) or temporarily disable for the `website-product-pages-*.vercel.app` preview alias so Chrome MCP and curl can reach the page? Recommendation: temporarily disable for preview URLs only, leave production protected once a production domain is attached.
2. **Metric card count:** 3 (Stitch mock parity) or 4 (current template, more honest density)? PRD default: 4.
3. **Ingest re-run cadence:** Manual per-lane, nightly cron, or on-GitHub-webhook? PRD default: manual per-lane until Step 4, then webhook.
4. **Vercel production branch:** Stay on `main` (currently `44549bb`, 20 commits behind local), fast-forward `main` to include local +20 commits after a PR-by-PR review, or temporarily point Vercel at `claude/adoring-tereshkova`? PRD default: PR-by-PR review, no force-merge.
5. **Token replacement timing:** Now (unblocks API-based redeploys for agents) or after Step 1 (keeps scope tight)? PRD default: after Step 1.

---

## 9. Archive list

Documents this PRD supersedes. They should be moved to `_ops/archive/` with a dated suffix after the user approves:

- `Website-main/ANTIGRAVITY_PRD.md`
- `Website-main/ANTIGRAVITY_PRD_AUGMENTED.md`
- `Website-main/go-live-docs/GO_LIVE_PRD.md`
- `Website-main/CLAW/PRDs/SITE_SCOPE_AUDIT_PRD.md` (the brief; keep `SITE_SCOPE_AUDIT.md` itself — it is the audit output and still referenced)
- `Website-main/CLAW/PRD_CANONICAL_ROUTES_TO_PRODUCING.md` (verify staleness first)
- Any `DELIVERY_EXECUTION_PRD_*.md` dated before 2026-04-09

Do NOT archive unilaterally.

---

*End of PRD.*
