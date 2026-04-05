# Deterministic Autonomy Runbook Pack

## Purpose

This pack is an operator-only runbook set for the Zer0pa website CLAW system. It exists to keep intervention deterministic, falsifiable, and fail-closed.

Use these runbooks when operating against:

- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD`
- `/Users/zer0palab/Zer0pa Website/Website-main/deterministic-design-system`
- `/Users/zer0palab/Zer0pa Website/Website-main/site`

## Global Rules

1. Start with live-machine truth, never with route taste.
2. Read current state before changing any code or control-plane files.
3. If validation, health, or contradiction checks are red, do not promote root.
4. Treat handoffs and report artifacts as higher-confidence evidence than stale summaries.
5. Do not revert unrelated work.
6. Prefer new evidence, new reports, and new handoffs over manual narrative updates.
7. If two truth surfaces disagree, stop and reduce them to a single machine-readable contradiction.
8. Quarantine handoffs with scope violations or shared-artifact contamination before they can become authoritative route gaps.
9. If recovery is uncertain, hold the daemon in fail-closed state and escalate with evidence.

## Runbook Order

1. [01-live-autonomy-triage.md](/Users/zer0palab/Zer0pa Website/Website-main/CLAW/RUNBOOKS/2026-04-04-deterministic-autonomy-pack/01-live-autonomy-triage.md)
2. [02-falsification-and-evidence-reduction.md](/Users/zer0palab/Zer0pa Website/Website-main/CLAW/RUNBOOKS/2026-04-04-deterministic-autonomy-pack/02-falsification-and-evidence-reduction.md)
3. [03-mathematical-lawset-maintenance.md](/Users/zer0palab/Zer0pa Website/Website-main/CLAW/RUNBOOKS/2026-04-04-deterministic-autonomy-pack/03-mathematical-lawset-maintenance.md)
4. [04-checkpoint-root-promotion-recovery.md](/Users/zer0palab/Zer0pa Website/Website-main/CLAW/RUNBOOKS/2026-04-04-deterministic-autonomy-pack/04-checkpoint-root-promotion-recovery.md)

## Required Command Baseline

Run from `/Users/zer0palab/Zer0pa Website/Website-main/site` unless a step says otherwise:

```bash
npm run claw:autonomy:status
npm run claw:health
npm run claw:validate
npm run claw:test:contracts
npm run claw:test:systems-optimizer
npm run claw:progress
node ../CLAW/scripts/verify-ggd-binding.mjs
```

## Required State Surfaces

- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/state/runtime-state.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/press-go.manifest.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/state.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/agent-lanes.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runner-policy.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/checkpoints/current.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs/`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/reports/route-progress.latest.json`

## Exit Condition

This pack is satisfied only when the operator can answer all of the following with current evidence:

- Is the daemon alive?
- Is the system truthful about health and validation?
- Are route and system claims derived from current evidence?
- Are mathematical laws explicit, versioned, and verified?
- Is checkpoint or promotion state recoverable without guesswork?
- Are route progress packets and route gaps both derived and current?
