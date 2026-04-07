# Perpetual Operation Runbook

## Purpose

Define how the Zer0pa Website CLAW system behaves once unattended local operation is allowed.

This runbook is inactive until `press_go` is explicitly `true`.

## Core Rule

Use parallel reasoning and single-writer execution.

That means:

- multiple subagents may inspect, compare, and falsify in parallel
- only the owning lane writes and commits on its branch

## Operating Preconditions

Perpetual operation is allowed only when:

- `press_go` is `true`
- the press-go evidence bundle exists
- runtime state matches schema
- all v1 worktrees are clean at the start of the unattended window

## Startup Checklist

1. verify runtime state and active cadence profile
2. verify lane worktrees are clean
3. verify shared locks are clear
4. verify the current checkpoint and rollback point
5. verify the active wave and priority route

If any item fails, do not start unattended work.

## Cadence Source

Use `CLAW/control-plane/cadence.json` as the authoritative cadence map.

Operational intent:

- supervised mode uses slower, tighter loops
- guarded autonomy uses slower heavy sweeps and tighter stop conditions
- extended autonomy keeps the same safety gates while proving time stability

## Resource Locks

The orchestrator must serialize:

- `next-build`
- `browser-audit`
- `truth-sync`
- `integration-promotion`
- `globals-css`
- `layout-spec`
- `route-home`
- `route-imc`
- `product-kernel`

No unattended loop may ignore a held lock.

## Lane Cycle

Each active lane cycle should:

1. read the current brief, locks, and stop conditions
2. confirm the lane owns the intended write scope
3. choose one bounded hypothesis
4. capture the baseline
5. make one narrow candidate change
6. run the minimum required verification
7. accept, reject, or escalate
8. write a handoff and learning item

## Orchestrator Cycle

The orchestrator should:

1. read all recent lane handoffs
2. compare claims to artifacts
3. update priority slices
4. update locks
5. decide `promote`, `revise`, `hold`, or `abandon`
6. record the checkpoint queue

## QA Cycle

Systems QA should:

1. run full falsification on the nominated candidate or integration lane
2. compare results against the previous accepted checkpoint
3. reject any new critical or major regression
4. record the evidence bundle paths

## Integration Cycle

Integration should:

1. replay only accepted lane work
2. rerun full QA
3. record the rollback point
4. either checkpoint or reject

Integration must never become an ad hoc fix-up branch.

## Recovery Policy

When a stop condition fires:

1. stop assigning new slices
2. preserve the last good commit
3. record the failure and the triggering artifact
4. release locks only after the state is stable
5. return the system to supervised mode if the failure is severe

## Human Interruptibility

The unattended system must remain easy to pause.

Human override should:

- stop new lane assignments
- preserve current worktrees
- preserve logs and handoffs
- avoid destructive cleanup

## Stop Conditions

Immediate stop:

- build failure
- parser failure
- new critical diff
- new major diff
- cross-repo write
- lane scope violation
- truth contradiction

Escalate to supervised mode:

- two failed attempts on the same slice
- repeated unexplained macro-layout regressions
- resource starvation on the Intel Mac

## Daily Health Review

At least once per 24 hours:

- rotate or archive stale logs
- record the current best checkpoint
- archive abandoned candidates
- review the learning backlog
- verify that unattended work improved or preserved quality

## End Of Window Checklist

At the end of an unattended run:

1. capture the final checkpoint state
2. compare quality metrics against the start of the window
3. record whether quality improved, held, or regressed
4. keep `press_go` true only if the system remained safe and stable
