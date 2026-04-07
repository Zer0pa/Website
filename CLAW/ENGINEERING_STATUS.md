# CLAW Engineering Status Document

**Project:** Zer0pa Website
**System:** CLAW (Continuous Locally-Autonomous Website) + GGD (Get Geometry Done)
**Last Updated:** 2026-04-06T18:00Z
**Updated By:** Dispatch (Opus Engineer oversight layer)
**System Status:** PAUSED (Codex credits exhausted, refresh ~April 8)

---

## 1. System Architecture — What Was Built

### CLAW Autonomy Runner
A Node.js-based autonomous agent orchestration system that runs continuously on the host Mac via launchd (`com.zer0palab.claw-autonomy`). It cycles through lane-based jobs every 60 seconds, dispatching Codex agents (gpt-5.4, xhigh reasoning) to do bounded work in isolated git worktrees.

**Core scripts:**
- `CLAW/scripts/autonomy-loop.mjs` — Main loop, ticks every 60s
- `CLAW/scripts/autonomy-once.mjs` — Single cycle execution: materialize queue, dispatch agents, settle results
- `CLAW/scripts/lib/autonomy.mjs` — Shared utilities (git ops, worktree management, file locks)

**Control plane:**
- `CLAW/control-plane/state/runtime-state.json` — Central state: lane statuses, blockers, next_actions, gates
- `CLAW/control-plane/queue/index.json` — Cycle queue
- `CLAW/control-plane/cycle-templates.json` — Phase definitions, lane ordering, objectives
- `CLAW/control-plane/agent-lanes.json` — Lane definitions, worktree paths, write permissions
- `CLAW/control-plane/runner-policy.json` — Timeouts, concurrency, sandbox settings
- `CLAW/control-plane/directives/*.json` — Operator directives (e.g., stitch-rescaffold)

**Lane architecture (C4 phase):**
- `data-truth` — Validates packet cache freshness and field sufficiency
- `product-family` — Builds and refines product page routes
- `systems-qa` — Falsification: layout, geometry-law, responsive, contrast audits
- `integration` — Promotes accepted candidates, rebuilds checkpoint
- `systems-optimizer` — PARKED (absorbed into Opus Engineer)

### GGD Deterministic Design System
Algebraic constraint layer that turns visual design into verifiable equations. Laws, conventions, equation engine, verification bundles.

- Equation engine: `Get-Geometry-Done/scripts/ggd_equation_engine.py`
- Lawsets: `GGD/equations/lawsets/`
- Gap tracking: `GGD/gaps/routes/`
- Execution layer (M1-M5) fully built and verified

### Opus Engineer (Scheduled Automation)
A Claude Opus scheduled task (`claw-opus-engineer`) that runs every 30 minutes. It does NOT build anything directly — it engineers the system: diagnoses blockers, optimizes agent prompts, updates control plane state, and mobilizes the Codex agents to do all implementation. Uses 7 expert personas (Systems Diagnostician, Production Engineer, Prompt Engineer, Git Operations Specialist, QA Architect, Architecture Advisor, Build/Deploy Engineer).

### Content Pipeline
GitHub repos (Zer0pa/ZPE-XR, ZPE-IMC, etc.) → packet ingestion → `site/.cache/packets/` → `loadLaneBySlug()` → page rendering. ALL copy comes from GitHub repos. The Stitch prototypes define layout only; content is never hardcoded.

---

## 2. What Was Delivered — Session Log

### Phase 1: Vercel Deployment (prior session)
- Site deployed to `website-five-red-17.vercel.app`
- Git authentication, push to GitHub, Vercel build config

### Phase 2: Unblock CLAW System (2026-04-06)
- Fixed contrast audit lie in runtime-state (claimed "pass: 0 major" when there were 72)
- Reset watchdog-killed lanes (data-truth, systems-qa, systems-optimizer)
- Resolved git merge conflicts in system-optimizer state.json and backlog.json
- Cleared autonomy service escalation

### Phase 3: Stitch Integration (2026-04-06)

**Critical lesson learned:** The user provided three Google Stitch HTML prototypes containing production-ready Tailwind CSS code. I initially failed to recognize these as CODE SCAFFOLDS — I treated them as design references and set up the system to "extract patterns" and reimplement. The agents reimplemented everything in custom CSS instead of using the Stitch HTML directly. This wasted ~100+ cycles.

**Root cause of the mistake:** The stitch-rescaffold directive said "translate Stitch Tailwind CDN classes to the project's PostCSS Tailwind setup" — but the project had NO Tailwind installed. The instruction was impossible to follow, so agents defaulted to reimplementation.

**Fix applied:** Rewrote the directive to be unmistakable: "Stitch HTML is CODE, not a design reference. COPY it. Install Tailwind first. Keep all utility classes." Added STITCH DOCTRINE to the global agent prompt.

**Stitch sources:**
1. Homepage: `/Users/zer0palab/Zer0pa Website/Zer0pa Homepage/code.html`
2. Product pages: `/Users/zer0palab/Zer0pa Website/Zer0pa ZPE Product Pages/code.html`
3. ZPE-IMC: `/Users/zer0palab/Zer0pa Website/Zer0pa ZPE-IMC Page/code.html`

### Phase 4: Opus Engineer Setup (2026-04-06)
- Created `claw-opus-engineer` scheduled task (every 30 min)
- 7 expert personas, systems-optimizer governance, visualization brief
- First run: broke data-truth 100+ cycle rejection loop, fixed replay conflicts

### Phase 5: Pipeline Fixes (2026-04-06)
- **Data-truth rejection loop fix:** Acceptance criteria were referencing idealized field names that didn't match actual packet fields. Opus engineer rewrote to use actual field names (laneTitle not name, headlineMetrics not metrics).
- **Replay conflict fix v1 (Opus Engineer):** Added pre-reset of downstream worktrees before cherry-pick. Used local HEAD as authority — wrong.
- **Replay conflict fix v2 (Dispatch):** Changed ALL lane worktrees to reset to `origin/main` at start of every job. Cherry-picks now apply cleanly. systems-qa ran its first real QA pass in 200+ cycles.
- **Write permissions expansion:** Added Tailwind config files to product-family allowed writes.
- **Stitch rescaffold completion:** Product-family delivered 593-line page.tsx with real Tailwind utility classes. 59/61 jobs accepted (96.7%). IMC route guard fixed autonomously.

---

## 3. Current System State (2026-04-06T16:20Z)

### Pipeline Health
| Lane | Status | Notes |
|------|--------|-------|
| data-truth | ESCALATED | XR packet stale (synced 2026-03-27), commitSha blank, repoShape empty |
| product-family | active | Stitch rescaffold code complete. Needs to graduate to QA-fix work |
| systems-qa | rejected (healthy) | First real QA pass produced 14 critical layout diffs, 8+6 geometry-law failures, mobile overflow, 72 contrast failures |
| integration | active (stale) | Checkpoint stale since April 3. Needs fresh QA pass to advance |
| systems-optimizer | parked | Absorbed into Opus Engineer role |

### Throughput (2026-04-06)
- 95 cycles, 217 handoffs
- ~7 cycles/hour
- 58 of 59 systems-qa jobs were replay-conflict waste (now fixed)
- Product-family: 59/61 accepted (96.7%)

### QA Findings (first real pass)
- 14 critical layout diffs against Stitch reference
- 8 critical + 6 major geometry-law failures (first broken: hero title/meta row-gap)
- Mobile horizontal overflow on /work/xr, /, /imc, /work/ft
- 72 major contrast failures (text ratio = 1 on some nodes)
- Parser and semantic/SEO quality: GREEN

### Pages Status
| Route | Layout | Content | Stitch Status |
|-------|--------|---------|---------------|
| `/` | Custom Hero + FlagshipBlock + ConstellationGrid | Dynamic (loadLaneCatalog) | NOT YET Stitch-rescaffolded |
| `/imc` | LaneAuthorityPage | Dynamic (loadLaneBySlug) | NOT YET Stitch-rescaffolded |
| `/work/[slug]` | Stitch-derived Tailwind scaffold | Dynamic (loadLaneBySlug) | COMPLETE (593 lines) |
| `/about` | Static | Hardcoded | No Stitch equivalent |
| `/contact` | Static | Hardcoded | No Stitch equivalent |
| `/proof` | Static | Dynamic examples | No Stitch equivalent |

### Packet Health
| Lane | Score | Authority | Gaps |
|------|-------|-----------|------|
| ZPE-IMC | 100 | SUPPORTED | Richest packet |
| ZPE-Neuro | 100 | SUPPORTED | Strong |
| ZPE-XR | 100 | BLOCKED | Rich but stale, commitSha blank |
| ZPE-Geo | 100 | BLOCKED | Thin modalities |
| ZPE-IoT | 95 | STAGED | No provedNow |
| ZPE-FT | 95 | SUPPORTED | No headline metric |
| ZPE-Mocap | 90 | BLOCKED | No modalities |
| ZPE-Robotics | 90 | BLOCKED | No provedNow |
| ZPE-Ink | 80 | BLOCKED | Mostly empty |
| ZPE-Prosody | 50 | BLOCKED | Empty — parser warnings |

---

## 4. Immediate Priorities

1. **Fix data-truth escalation** — Refresh XR packet from GitHub or loosen commitSha requirement
2. **Product-family graduates to QA-fix work** — Fix the 14 layout diffs, geometry-law failures, mobile overflow, contrast issues
3. **Homepage Stitch rescaffold** — Apply same pattern: copy HTML, install Tailwind, wire dynamic content
4. **IMC Stitch rescaffold** — Merge product template with ZPE-IMC-specific design
5. **Integration checkpoint refresh** — Once systems-qa passes, rebuild stale checkpoint

---

## 5. Replicability — Cloning This System

The CLAW + Opus Engineer pattern is project-agnostic. To spin up a second autonomous pod:

**What you'd clone:**
- `CLAW/` folder structure (control-plane, scripts, services)
- `autonomy-once.mjs` + `autonomy-loop.mjs` (the runner)
- `autonomy.mjs` library (git ops, worktree management)
- Lane definitions in `agent-lanes.json`
- Runner policy in `runner-policy.json`
- launchd plist for continuous execution

**What you'd customize:**
- `cycle-templates.json` — Phase definitions and lane objectives for the new project
- `agent-lanes.json` — Lane names, worktree paths, write permissions
- `directives/` — Project-specific operator directives
- `runtime-state.json` — Initial state for the new project
- Opus engineer scheduled task prompt — New project context, personas, objectives
- GGD lawsets — New design contracts (or remove if not needed)

**What stays the same:**
- Runner architecture (queue → materialize → dispatch → settle)
- Cherry-pick replay mechanism for lane isolation
- Handoff JSON contract between lanes
- Worktree-per-lane isolation pattern
- Opus engineer meta-loop (diagnose → optimize → mobilize)

**Estimated setup time:** 1-2 hours to clone and configure, assuming the new project has a git repo and clear objectives.

**Folder structure suggestion:** Each pod could live in its own directory (e.g., `~/Projects/ProjectA/CLAW/`, `~/Projects/ProjectB/CLAW/`), each with its own launchd service and Opus engineer scheduled task.

---

## 6. Lessons Learned

1. **Stitch code != design reference.** When a user provides HTML/CSS prototypes, treat them as literal code scaffolds unless told otherwise. Don't "extract patterns" — copy the code.

2. **Tailwind must be installed before referencing Tailwind classes.** The directive told agents to "translate" classes to a Tailwind setup that didn't exist. Impossible instructions → agents improvise badly.

3. **Cherry-pick replay needs a common base.** All lane worktrees must reset to the same commit (origin/main) before cherry-picking upstream commits. Using different bases causes conflicts that block the entire downstream pipeline.

4. **Replay conflicts are silent compute waste.** 58 of 59 QA runs were instant failures that burned Codex credits for zero signal. The runner should detect and skip these rather than invoking an agent.

5. **Data-truth acceptance criteria must match actual field names.** Idealized canonical names (name, metrics) vs actual packet fields (laneTitle, headlineMetrics) caused 100+ rejection cycles.

6. **Don't ask the user to approve commands.** Route work through CLAW agents and Codex credits. The user wants autonomous operation, not interactive approval flows.

7. **The Opus engineer is the right abstraction.** It engineers the system (prompts, criteria, permissions, control plane) without doing implementation work. This separation prevents scope creep and keeps the agents focused.
