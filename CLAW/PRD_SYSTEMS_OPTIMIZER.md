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
- any `sysopt.xr-*` card must bind to the authoritative `/work/xr` gap artifact, retain the explicit evaluator focus contract, pin `first_broken_law` to `top_drift_surfaces[0]` from that gap artifact, and pin `severity_baseline` to `severity_counts` from the same gap surface
- systems-optimizer state policy must explicitly require XR `severity_baseline` alignment, so verifier output cannot claim that lock while the retained machine policy omits it
- any `sysopt.xr-*` card must also pin `quality_baseline` to `quality_severity_counts` from the authoritative `/work/xr` gap artifact, so the required `quality` evaluator focus stays machine-readable instead of narrative-only
- any `sysopt.xr-*` card must keep both `severity_baseline` and `quality_baseline` on the exact four-level severity dimension system `critical`, `major`, `minor`, `note`; missing or extra levels fail the card because XR baseline vectors are dimensional truth, not loose narrative maps
- any `sysopt.xr-*` card must also pin `gap_source_handoff` to `source_handoff` from the authoritative `/work/xr` gap artifact, so stale control-plane ratchets cannot keep targeting superseded XR rejection evidence
- any `sysopt.xr-*` card in status `seeded` must also resolve `gap_source_handoff` inside the current worktree runtime or the declared shared truth cache before the slice can enter queueable replay, so route lanes cannot inherit XR evidence that exists only in an external runtime mirror
- any `sysopt.xr-*` card must also pin `flagship_invariants_baseline` to `flagship_invariants_intact` from the authoritative `/work/xr` gap artifact, so route-neutral XR ratchets cannot misdiagnose shared-lane failure as flagship IMC drift when the invariant still holds
- any `sysopt.xr-*` card must use the exact evaluator focus contract `layout-diff`, `quality`, `flagship-invariants`; missing, duplicate, or extra focus surfaces fail the card
- any systems-optimizer card that declares any runner-stability specificity field `runner_focus`, `failure_mode`, `closed_fail_rule`, or `evidence_commands` must satisfy the same runner-stability law surface as an explicit `sysopt.runner-stability-*` card; naming drift may not bypass runner verification
- any `sysopt.runner-stability-*` card must bind to exactly one `runner_focus` in `recovery`, `queue-invalidation`, or `stale-cycle`, plus explicit `failure_mode`, `closed_fail_rule`, and replayable `evidence_commands`; `node CLAW/scripts/run-site-script.mjs claw:health` is observability only and cannot be the sole evidence command
- any `sysopt.runner-stability-*` card that includes `node CLAW/scripts/run-site-script.mjs claw:health` in `evidence_commands` must place that command only after at least one replayable runner script command, so observability cannot lead the evidence trail
- any `sysopt.runner-stability-*` card that includes `node CLAW/scripts/run-site-script.mjs claw:health` in `evidence_commands` must also keep that observability trailing after the final replayable runner script command, so observability cannot split the replayable proof trail
- any `sysopt.runner-stability-*` card must keep `evidence_commands` inside the explicit root-relative runner boundary `node CLAW/scripts/recover-cycle.mjs ...`, `node CLAW/scripts/run-recovery-drill.mjs ...`, plus optional trailing `node CLAW/scripts/run-site-script.mjs claw:health`; arbitrary shell steps or non-runner scripts fail the card
- any `sysopt.runner-stability-*` card must keep `evidence_commands` free of duplicate commands, so replayable recovery proof cannot be padded with repeated runner or observability steps that add no new evidence
- any `sysopt.runner-stability-*` card with `runner_focus` `stale-cycle` must keep the exact stale-lock evidence pair `node CLAW/scripts/recover-cycle.mjs --max-age-minutes=0`, then `node CLAW/scripts/run-recovery-drill.mjs --scenario=stale-lock`, plus optional trailing `node CLAW/scripts/run-site-script.mjs claw:health`; generic or wrong-scenario replay is rejected because it does not prove the stale-lock surface specifically
- every systems-optimizer command list must stay shell-safe and single-command: shell control operators such as `&&`, `||`, lone `&`, `;`, `|`, `<`, `>`, backticks, `$(`, or embedded line breaks fail the card or runner policy instead of widening replayable proof with chained shell steps
- every retained systems-optimizer `recorded_at` timestamp must use exact UTC ISO-8601 `YYYY-MM-DDTHH:MM:SSZ`, because terminal recency selection relies on lexicographic ordering and cannot stay deterministic on locale-shaped or partially padded strings
- systems-optimizer salvage must preserve the exact seven singleton command groups for the scope-local promotion bundle plus trailing `claw:validate` and `claw:health`; flatten-equivalent merged groups are invalid because runner command groups represent alternatives, not an unordered bag of required commands
- if `CLAW/control-plane/system-optimizer/state.json.active_hypothesis` is non-null, it must resolve to exactly one backlog card in status `seeded` and preserve the exact bounded contract fields `hypothesis`, `measurement`, `keep_rule`, `writable_scope`, `evaluation_bundle`, plus any active XR or runner-stability specificity fields, so interrupted recovery cannot resume with silent contract drift
- if `CLAW/control-plane/system-optimizer/state.json.active_hypothesis` is non-null, it must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` in status `seeded` and preserve the exact bounded contract fields plus `recorded_at`, so interrupted recovery always has one replayable seeded timestamp instead of state/backlog pointers alone
- any systems-optimizer backlog card in status `seeded` must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` in status `seeded` and preserve the exact bounded contract fields plus `recorded_at`, so queued or resumable slices cannot silently retimestamp before activation
- if `CLAW/control-plane/system-optimizer/state.json.last_rejected_change` is non-null, it must resolve to exactly one backlog card in status `rejected` and preserve the exact bounded contract fields `hypothesis`, `measurement`, `keep_rule`, `writable_scope`, `evaluation_bundle`, plus any XR or runner-stability specificity fields and `learning_item`, so rejected history cannot drift away from the failure contract the machine actually rejected
- if `CLAW/control-plane/system-optimizer/state.json.last_kept_change` or `last_rejected_change` is non-null, each must also resolve to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json` and preserve the exact bounded contract fields, `learning_item`, and `recorded_at`, so terminal recovery and reporting never point at a ratchet with no replayable card artifact
- if `CLAW/control-plane/system-optimizer/state.json.last_kept_change` or `last_rejected_change` is non-null, each must also resolve to the latest retained `learning_log.recorded_at` for its status, so terminal recovery and reporting cannot silently lag behind a newer kept or rejected ratchet
- if `CLAW/control-plane/system-optimizer/state.json.last_kept_change` or `last_rejected_change` is non-null, the latest retained `learning_log.recorded_at` for that status must belong to exactly one retained backlog id, so terminal recency never degrades into a same-second tie
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
- runner-stability classification is driven by declared runner contract fields as well as explicit `sysopt.runner-stability-*` ids, so field-bearing recovery ratchets cannot bypass verification through naming drift
- runner-stability evidence commands stay inside the explicit root-relative runner boundary; arbitrary non-runner commands are rejected rather than treated as proof
- any runner-stability `claw:health` observability remains trailing after the final replayable runner script command, so the replayable proof surface stays contiguous
- runner-stability `evidence_commands` remain unique, so replayable proof cannot duplicate the same recovery or observability step and still count as stronger evidence
- any runner-stability card with `runner_focus` `stale-cycle` keeps the exact stale-lock evidence pair `node CLAW/scripts/recover-cycle.mjs --max-age-minutes=0`, then `node CLAW/scripts/run-recovery-drill.mjs --scenario=stale-lock`, with optional trailing `node CLAW/scripts/run-site-script.mjs claw:health`, so stale-cycle proof cannot drift onto generic or wrong-scenario recovery replay
- all systems-optimizer command lists remain shell-safe single commands, so replayable evidence and promotion bundles cannot smuggle chained shell work behind an otherwise valid CLAW prefix
- all retained systems-optimizer `recorded_at` timestamps remain exact UTC ISO-8601 values, so terminal recency locks and hypothesis-card replay stay lexically sortable and deterministic
- determinism, safety, measurability, or autonomous stability improved in a concrete way
- the slice is documented in the systems-optimizer state and backlog
- one retained learning item is recorded so the next ratchet inherits the falsification result
- any XR-targeting ratchet binds to the authoritative `/work/xr` gap artifact, the exact evaluator focus contract, the current XR primary `first_broken_law` from `top_drift_surfaces[0]`, and the current XR `severity_baseline` instead of vague route-family wording
- systems-optimizer state policy explicitly requires XR `severity_baseline` alignment, so the retained machine contract matches the verifier's XR severity law
- any XR-targeting ratchet also binds `quality_baseline` to the authoritative XR `quality_severity_counts`, so the required `quality` focus remains falsifiable against measured shared-route findings
- any XR-targeting ratchet keeps both `severity_baseline` and `quality_baseline` on the exact four-level severity dimension system `critical`, `major`, `minor`, `note`, so the retained XR baselines cannot hide extra or missing severity bands behind matching counts
- any XR-targeting ratchet also binds `gap_source_handoff` to the authoritative XR `source_handoff`, so refreshed XR rejection evidence cannot be mistaken for the earlier handoff packet
- any seeded XR-targeting ratchet also resolves that authoritative `gap_source_handoff` inside the current worktree runtime or declared shared truth cache before queue entry, so route lanes cannot act on XR proof that exists only in an external mirror
- any XR-targeting ratchet also binds `flagship_invariants_baseline` to the authoritative XR `flagship_invariants_intact` result, so route-neutral work cannot retarget IMC isolation when the measured XR failure is elsewhere
- any non-null `active_hypothesis` remains backlog-linked and contract-identical to one seeded backlog card, so recovery can only resume the exact bounded slice that was declared
- any non-null `active_hypothesis` also remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, including the exact seeded `recorded_at`, so interrupted recovery cannot resume from a missing, drifted, or retimestamped seeded card artifact
- every seeded backlog item remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, including the exact seeded `recorded_at`, so queued recovery work is replayable before activation rather than only after state pointers are populated
- any non-null `last_rejected_change` remains backlog-linked and contract-identical to one rejected backlog card, so recovery and reporting cannot inherit stale failure history
- any non-null terminal kept or rejected state entry remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, so the machine cannot report a final verdict whose ratchet card artifact is missing
- any non-null terminal kept or rejected state entry also remains pinned to the latest retained learning-log timestamp for its status, so reporting and recovery cannot keep surfacing an older verdict after a newer ratchet lands
- the latest retained kept or rejected learning-log timestamp per status remains unique, so terminal pointers resolve to one deterministic newest verdict rather than any member of a same-second tie
- every kept or rejected backlog item remains hypothesis-card-linked and contract-identical to `CLAW/control-plane/system-optimizer/hypotheses/<id>.json`, with `recorded_at` preserved through the retained learning log, so historical ratchets stay replayable instead of depending only on the latest terminal state pointers
- every kept systems-optimizer backlog item and kept hypothesis-card artifact retains the exact five-command scope-local promotion bundle, so promotable proof surfaces cannot drift wider in historical records than they were at keep time
- every systems-optimizer hypothesis-card artifact remains backlog-linked with matching `id` and `status`, so replayable history cannot accumulate orphan or filename-drifted card files outside the verified inventory

## Initial Backlog Themes

- recurring XR geometry and breakpoint failures should become stricter laws or better prompts, bound to the authoritative gap artifact, one named broken-law surface, and the current severity baseline they are trying to reduce
- the command surface should remain explicit, installable, and equation-aware
- recovery and queue health should fail closed
- route-independent evaluators should get stronger before route-autonomy gets looser
