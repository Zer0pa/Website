# PRD Systems Optimizer

## Goal

Introduce a dedicated bounded engineer whose job is to improve the GGD and CLAW machine itself through repeatable evaluator-optimizer ratchets, without broadening into uncontrolled self-modification.

## Core Pattern

Each systems-optimizer slice must follow one loop:

1. state one hypothesis
2. state one measurable success signal and one keep rule
3. state one writable scope
4. state one evaluation bundle
5. make one bounded system change
6. run the evaluation bundle
7. keep only if the machine is measurably better and all guards remain green
8. otherwise reject, record the learning, and revert or discard

## Writable Scope

Default allowed scope:

- `CLAW/scripts/**`
- `CLAW/control-plane/*.json`
- `CLAW/control-plane/*.md`
- `CLAW/control-plane/*.schema.json`
- `CLAW/control-plane/plans/**`
- `CLAW/control-plane/patterns/**`
- `CLAW/control-plane/continuations/**`
- `CLAW/control-plane/product-kernel/**`
- `CLAW/control-plane/system-optimizer/**`
- `CLAW/control-plane/reports/**`
- `CLAW/PRD*.md`
- `GGD/**`
- `.agents/skills/get-geometry-done/**`
- `AGENTS.md`

Forbidden without an explicit broader contract:

- `CLAW/control-plane/queue/**`
- `CLAW/control-plane/runtime/**`
- `CLAW/control-plane/locks/**`
- `CLAW/control-plane/checkpoints/**`
- `CLAW/control-plane/state/runtime-state.json`
- `CLAW/services/autonomy/state.json`
- `site/src/app/**`
- `site/src/components/**`
- `site/src/lib/data/**`
- `site/src/lib/product-kernel/**`

## Evaluation Bundle

Required:

- `node CLAW/scripts/verify-systems-optimizer.mjs`
- `node CLAW/scripts/run-site-script.mjs claw:validate`
- `node CLAW/scripts/run-site-script.mjs claw:test:contracts`
- `node CLAW/scripts/run-site-script.mjs claw:test:systems-optimizer`
- `node CLAW/scripts/run-site-script.mjs claw:health`
- `node CLAW/scripts/verify-ggd-binding.mjs`
- `python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py check-lawset --lawset /Users/zer0palab/Get-Geometry-Done/ggd/shared/example-lawset.json`

Required promotion bundle for control-plane-only ratchets:

- `node CLAW/scripts/verify-systems-optimizer.mjs`
- `node CLAW/scripts/verify-ggd-binding.mjs`
- `python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py check-lawset --lawset /Users/zer0palab/Get-Geometry-Done/ggd/shared/example-lawset.json`
- `node CLAW/scripts/run-site-script.mjs claw:test:systems-optimizer`
- `node CLAW/scripts/run-site-script.mjs claw:test:contracts`

Operational observability, not promotion gates for control-plane-only ratchets:

- `node CLAW/scripts/run-site-script.mjs claw:validate`
- `node CLAW/scripts/run-site-script.mjs claw:health`

Additional fixed rule:

- control-plane-only systems-optimizer cards must use the required promotion bundle above and may not promote on `claw:validate` or `claw:health`, because those commands can fail on stale route or runtime truth outside the slice
- control-plane-only promotable systems-optimizer cards must use the exact five-command scope-local promotion bundle in the declared order with no extras or duplicates; wider bundles silently widen the proof surface beyond the bounded slice
- systems-optimizer runner salvage must start with the exact scope-local promotion bundle in that order before trailing `claw:validate` and `claw:health` observability, so stale integration truth cannot preempt local self-verification, binding, or equation-law checks
- any ratchet whose writable scope includes `GGD/**` must include both `node CLAW/scripts/verify-ggd-binding.mjs` and the equation-engine lawset check in its declared evaluation bundle
- systems-optimizer writable_scope must stay inside the explicit allowlist above; recursive `CLAW/control-plane/**/*.json`, `/**/*.md`, and `/**/*.schema.json` globs are too broad because they can cross into runtime, queue, lock, and checkpoint surfaces
- systems-optimizer writable_scope entries must stay normalized repo-relative patterns with no dot-segment traversal, duplicate slash separators, leading slash, or backslash separator, because raw prefix glob checks can otherwise hide escapes from allowed scope into runtime or route surfaces
- any `sysopt.xr-*` card must bind to the authoritative `/work/xr` gap artifact, retain the explicit evaluator focus contract, declare one `first_broken_law` drawn from `top_drift_surfaces` in that gap artifact, and pin `severity_baseline` to `severity_counts` from the same gap surface
- any `sysopt.xr-*` card must use the exact evaluator focus contract `layout-diff`, `quality`, `flagship-invariants`; missing, duplicate, or extra focus surfaces fail the card
- any `sysopt.runner-stability-*` card must bind to exactly one `runner_focus` in `recovery`, `queue-invalidation`, or `stale-cycle`, plus explicit `failure_mode`, `closed_fail_rule`, and replayable `evidence_commands`; `node CLAW/scripts/run-site-script.mjs claw:health` is observability only and cannot be the sole evidence command
- any `sysopt.runner-stability-*` card that includes `node CLAW/scripts/run-site-script.mjs claw:health` in `evidence_commands` must place that command only after at least one replayable runner script command, so observability cannot lead the evidence trail
- any `sysopt.runner-stability-*` card must keep `evidence_commands` inside the explicit root-relative runner boundary `node CLAW/scripts/recover-cycle.mjs ...`, `node CLAW/scripts/run-recovery-drill.mjs ...`, plus optional trailing `node CLAW/scripts/run-site-script.mjs claw:health`; arbitrary shell steps or non-runner scripts fail the card
- systems-optimizer salvage must preserve the exact seven singleton command groups for the scope-local promotion bundle plus trailing `claw:validate` and `claw:health`; flatten-equivalent merged groups are invalid because runner command groups represent alternatives, not an unordered bag of required commands
- if `CLAW/control-plane/system-optimizer/state.json.active_hypothesis` is non-null, it must resolve to exactly one backlog card in status `seeded` and preserve the exact bounded contract fields `hypothesis`, `measurement`, `keep_rule`, `writable_scope`, `evaluation_bundle`, plus any active XR or runner-stability specificity fields, so interrupted recovery cannot resume with silent contract drift
- if `CLAW/control-plane/system-optimizer/state.json.active_hypothesis` is non-null, it must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` in status `seeded` and preserve the exact bounded contract fields plus `recorded_at`, so interrupted recovery always has a replayable card artifact instead of state/backlog pointers alone
- any systems-optimizer backlog card in status `seeded` must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` in status `seeded` and preserve the exact bounded contract fields plus `recorded_at`, so queued or resumable slices cannot exist without a replayable seeded card artifact
- if `CLAW/control-plane/system-optimizer/state.json.last_rejected_change` is non-null, it must resolve to exactly one backlog card in status `rejected` and preserve the exact bounded contract fields `hypothesis`, `measurement`, `keep_rule`, `writable_scope`, `evaluation_bundle`, plus any XR or runner-stability specificity fields and `learning_item`, so rejected history cannot drift away from the failure contract the machine actually rejected
- if `CLAW/control-plane/system-optimizer/state.json.last_kept_change` or `last_rejected_change` is non-null, each must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` and preserve the exact bounded contract fields, `learning_item`, and `recorded_at`, so terminal recovery and reporting never point at a ratchet with no replayable card artifact
- any kept or rejected systems-optimizer backlog card must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` and preserve the exact bounded contract fields plus `learning_item`, while `recorded_at` stays aligned to the retained learning log, so historical ratchets remain replayable beyond the latest terminal state pointers
- any kept systems-optimizer backlog card and its hypothesis-card artifact must retain the exact five-command scope-local promotion bundle in the declared order with no extras or duplicates, so historical replay cannot silently widen the proof surface after promotion
- every systems-optimizer hypothesis-card artifact in `CLAW/control-plane/system-optimizer/hypotheses/` must resolve back to exactly one backlog card with the same `id` and `status`, so orphaned or filename-drifted replay artifacts cannot survive outside backlog truth

Optional when directly relevant:

- `npm run audit:geometry-law -- <route>`
- `npm run audit:quality`
- `npm run audit:responsive`

## Success Definition

A system slice may be kept only when:

- the writable scope was respected
- the hypothesis card included an explicit measurement and keep rule
- required evaluation commands passed
- systems-optimizer runner salvage includes `node CLAW/scripts/verify-systems-optimizer.mjs` before the slice is treated as replayable or recoverable
- runner-stability evidence commands stay inside the explicit root-relative runner boundary; arbitrary non-runner commands are rejected rather than treated as proof
- determinism, safety, measurability, or autonomous stability improved in a concrete way
- the slice is documented in the systems-optimizer state and backlog
- one retained learning item is recorded so the next ratchet inherits the falsification result
- any XR-targeting ratchet binds to the authoritative `/work/xr` gap artifact, the exact evaluator focus contract, one named `first_broken_law` from the current XR gap surface list, and the current XR `severity_baseline` instead of vague route-family wording
- any non-null `active_hypothesis` remains backlog-linked and contract-identical to one seeded backlog card, so recovery can only resume the exact bounded slice that was declared
- any non-null `active_hypothesis` also remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, so interrupted recovery cannot resume from a missing or drifted seeded card artifact
- every seeded backlog item remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, so queued recovery work is replayable before activation rather than only after state pointers are populated
- any non-null `last_rejected_change` remains backlog-linked and contract-identical to one rejected backlog card, so recovery and reporting cannot inherit stale failure history
- any non-null terminal kept or rejected state entry remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, so the machine cannot report a final verdict whose ratchet card artifact is missing
- every kept or rejected backlog item remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, with `recorded_at` preserved through the retained learning log, so historical ratchets stay replayable instead of depending only on the latest terminal state pointers
- every kept systems-optimizer backlog item and kept hypothesis-card artifact retains the exact five-command scope-local promotion bundle, so promotable proof surfaces cannot drift wider in historical records than they were at keep time
- every systems-optimizer hypothesis-card artifact remains backlog-linked with matching `id` and `status`, so replayable history cannot accumulate orphan or filename-drifted card files outside the verified inventory

## Initial Backlog Themes

- recurring XR geometry and breakpoint failures should become stricter laws or better prompts, bound to the authoritative gap artifact, one named broken-law surface, and the current severity baseline they are trying to reduce
- the command surface should remain explicit, installable, and equation-aware
- recovery and queue health should fail closed
- route-independent evaluators should get stronger before route-autonomy gets looser
