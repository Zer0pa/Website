# Engineering Orchestrator Handover

Date: 2026-04-04
Operator context: Codex-supervised, local Mac, guarded recursive autonomy live
Project root: `/Users/zer0palab/Zer0pa Website/Website-main`
GGD source root: `/Users/zer0palab/Get-Geometry-Done`

## Role To Assume

You are taking over the engineering-orchestrator role for the Zer0pa website claw system.

Your job is not to chase page output directly unless it is necessary to prove or improve the machine.
Your job is to engineer, falsify, and improve the system that produces deterministic website quality.

You have three core responsibilities:

1. Inspect and improve the GPT and GGD math stack.
   Goal: converge GPT reasoning, GGD equation tooling, and deterministic scientific methodology into website design as a mathematical, geometric, algebraic, and falsifiable system.

2. Inspect and improve the claw engineering system itself.
   Goal: find flaws in the orchestration, runner, contracts, ratchets, handoffs, falsification, and autonomy behaviors that the previous engineer missed.

3. Report back with evidence.
   Goal: after doing the work, report the system state, what you changed, what is still broken, the page progress percentages, and the roadmap from current state to autonomous quality closure.

## Current Truth

These facts are current as of the latest live inspection.

- The claw autonomy daemon is live.
- It is running in guarded mode, not publish mode.
- `press_go` is still `false`.
- Homepage `/` is canonical.
- Flagship `/imc` is canonical.
- `/work/xr` is still the blocking proof route.
- `/work/ft` is still pending proof.
- The current program horizon is `C4-first-generic-product-proof`.
- The active lane when last checked was `systems-optimizer`.
- The active cycle when last checked was `C4-20260404T135031Z`.

The main blocking truths are:

- XR remains blocked by an open deterministic geometry gap.
- The current integration checkpoint for `/work/xr` is stale.
- Guarded local autonomy proof is not complete.
- Extended local autonomy proof is not complete.
- Responsive matrix proof is not complete.

## What Already Exists

The system is not a blank slate. These parts are already real:

- A live CLAW autonomy runner with `launchd` supervision.
- A GGD contract layer adapted from GPD.
- A Codex command surface with installed `ggd-*` skills and agents.
- A local equation engine from the GGD fork.
- A systems-optimizer lane that improves the machine itself.
- Route and system worktrees with explicit lane ownership.
- Fail-closed queueing, handoffs, reports, checkpoints, and gap export.

This means your job is not to invent from zero.
Your job is to verify, falsify, tighten, and evolve the existing machine.

## What Was Adapted From GPD

The system is now more literal about GPD than it was initially, but it is still not perfect.

What has already been adapted:

- phased discipline
- state and roadmap files
- conventions and requirements
- protocolized command surface
- explicit verification bundles
- equation-engine path in the GGD fork
- evaluator-optimizer lane structure
- learning backlog and ratchet doctrine

What still needs deeper scrutiny:

- whether the equation engine is being used deeply enough in live route and system decisions
- whether geometry laws are still too measurement-heavy and not equation-native enough
- whether the GGD surface is fully reflected inside lane prompts and acceptance contracts
- whether the current math layer is truly algebraic and trigonometric where needed, or still only ratio-and-threshold driven

## Live Status Snapshot

The following files are authoritative for current truth.

- Runtime state: `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/state/runtime-state.json`
- GGD state: `/Users/zer0palab/Zer0pa Website/Website-main/GGD/state.json`
- Active queue: `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/queue/C4-20260404T135031Z.json`
- Latest live report: `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/reports/C4-20260404T132659Z.md`
- Current XR geometry gap: `/Users/zer0palab/Zer0pa Website/Website-main/GGD/gaps/routes/work-xr.geometry-gap.json`
- Current XR breakpoint gap: `/Users/zer0palab/Zer0pa Website/Website-main/GGD/gaps/routes/work-xr.breakpoint-gap.json`

Current headline status:

- `/`: canonical, effectively 100%
- `/imc`: canonical, effectively 100%
- `/work/xr`: blocked, percentage must be recalculated from fresh evidence
- `/work/ft`: pending proof, percentage must be recalculated from fresh evidence

Do not trust stale percentage estimates for XR or FT.
Recalculate them from current route truth, current gap counts, and current verification evidence.

## Reading List

Read these in this order unless you find a hard contradiction.

### 1. Live control truth

- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/state/runtime-state.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/state.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/agent-lanes.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runner-policy.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/cycle-templates.json`

### 2. Horizon and doctrine

- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/PRD_GGD_AUTONOMY_PRODUCTION_HORIZON.md`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/PRD_SYSTEMS_OPTIMIZER.md`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/PROJECT.md`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/CONVENTIONS.md`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/VERIFICATION.md`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/project.binding.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/commands.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/verification/bundles.json`

### 3. System code that actually matters

- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/autonomy-once.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/autonomy-loop.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/lib/autonomy.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/lib/control-plane.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/lib/ggd.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/verify-ggd-binding.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/verify-systems-optimizer.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/run-site-script.mjs`

### 4. GGD fork and GPT math surface

- `/Users/zer0palab/Get-Geometry-Done/GGD_ADAPTATION_PLAN.md`
- `/Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py`
- `/Users/zer0palab/Get-Geometry-Done/ggd/shared/command-catalog.json`
- `/Users/zer0palab/Get-Geometry-Done/ggd/shared/agent-catalog.json`
- `/Users/zer0palab/Get-Geometry-Done/ggd/shared/function-catalog.md`

### 5. The most useful failure evidence

- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs/C4-20260404T044816Z-04.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs/C4-20260404T131253Z-02.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs/C4-20260404T132659Z-01.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/logs/autonomy.stderr.log`

## Inspection List

Treat this as the minimum engineering inspection checklist.

### A. GPT and GGD math integration

- Verify whether the GGD equation engine is actually invoked in meaningful workflow steps, not merely installed.
- Verify whether `ggd-*` commands are being surfaced into lane prompts with enough specificity to affect behavior.
- Inspect whether geometric law is still dominated by prose and measured thresholds instead of explicit equations.
- Inspect whether color is actually numeric and law-governed or still mostly conventional token styling.
- Inspect whether typography, spacing, and section flow can be moved from ratio heuristics to explicit equation families.
- Inspect whether any trigonometric or coordinate-system reasoning is justified for perspective-aware layouts, and if so where it belongs.
- Compare the current GGD adaptation against upstream GPD structure and identify missing utilities that should be adapted more literally.

### B. CLAW system engineering

- Verify that accepted `systems-optimizer` work can promote cleanly back into root.
- Verify that daemon self-reload on root control-plane commit is real and reliable.
- Verify that `Claw Keeper` is not duplicating or corrupting the live daemon.
- Inspect whether `data-truth` timeouts are a lane-design problem, a brief-design problem, or a runner-watchdog problem.
- Inspect whether replay conflicts in `product-family` are truly resolved or only less frequent.
- Inspect whether gap export and gap resolution preserve the best measured evidence and cannot regress into empty gaps.
- Inspect whether runtime state, GGD state, reports, and queue truth remain synchronized under failure.
- Inspect whether lane scopes are tight enough to preserve determinism and prevent creative drift.

### C. Reporting contract

After doing real work, report:

- what you changed
- what you falsified
- what was improved
- what still fails
- system status
- page progress percentages
- roadmap from current state to trustworthy recursive autonomy

## First Inspection Commands

Run these first before making claims:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run claw:autonomy:status
npm run claw:health
npm run claw:validate
npm run claw:test:contracts
npm run claw:test:systems-optimizer
node ../CLAW/scripts/verify-ggd-binding.mjs
```

Then inspect:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main"
git status --short
sed -n '1,260p' CLAW/control-plane/state/runtime-state.json
sed -n '1,260p' GGD/state.json
sed -n '1,260p' CLAW/control-plane/agent-lanes.json
sed -n '1,260p' CLAW/control-plane/runner-policy.json
```

## Engineering Priorities

Priority order for the takeover:

1. Improve the system, not the page output.
2. Deepen GGD and GPT mathematical determinism.
3. Tighten falsification and synchronization.
4. Verify live autonomy reliability.
5. Only after that, judge whether the system is better able to close XR and FT.

## Known Weak Spots

These are the most likely places to find real improvement opportunities.

- GGD equation usage may still be too shallow.
- Geometry law may still be too measurement-based and not equation-native enough.
- `data-truth` lane may still be timing out too often.
- `systems-optimizer` root promotion needs more live proof.
- XR gap closure remains the real route-family bottleneck.
- Responsive matrix expansion is still incomplete.

## Success Condition For The New Agent

You succeed if you do all of the following:

- find real engineering flaws or missing math structure
- improve the machine without corrupting live guarded operation
- make the system more deterministic, not more clever
- leave behind a truthful report with page progress percentages and roadmap

You do not succeed if you mainly produce page edits while leaving the machine weak, vague, or unsound.

