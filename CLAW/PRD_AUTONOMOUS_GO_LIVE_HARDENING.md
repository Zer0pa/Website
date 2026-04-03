# PRD: Autonomous Go-Live Hardening From C4 To Press-Go

## Status

- status: `active engineering program`
- owner: `orchestrator`
- date: `2026-04-03`
- scope: `/Users/zer0palab/Zer0pa Website/Website-main` and `/Users/zer0palab/Zer0pa Website/worktrees/*`

## Problem

The system is partially autonomous but not yet safe to leave unattended. It can materialize cycles, run lane-local Codex cognition, and reject regressions, but it still needs explicit hardening in four areas:

- control-plane truth must match real runner/service state at all times
- downstream replay and lock handling must never contaminate future cycles
- generic product-page geometry must close cleanly through `systems-qa` and `integration`
- the path from supervised recursion to guarded local autonomy must be encoded as machine-operable gates, not operator memory

## Goal

Move from the current `C4-first-generic-product-proof` state to a truthful `ready for guarded local autonomy` state, then to `press_go eligible`, without creative drift and without repo-boundary violations.

The target system must:

- treat the mockups and design laws as deterministic geometry
- only improve or hold quality under repeated cycles
- fail closed on replay, audit, or integration regressions
- recover from stale or interrupted execution without manual surgery
- prove the product-page kernel on `/work/xr` and `/work/ft` before broader rollout

## Non-Goals

- deploying production code
- remote pushes or PR creation
- expanding outside the Website repo
- Telegram/operator handoff in this phase
- speculative redesign beyond measured route laws

## Deterministic Operating Law

The website is not to be treated as a creative composition problem.

The system law is:

`route_output = f(geometry_constants, route_role, packet_truth, viewport, verification_constraints)`

Every improvement loop must preserve these properties:

- geometry comes from declared laws, not prompt improvisation
- color remains numeric/tokenized and is evaluated by contrast/legibility rules
- layout changes are accepted only when falsification remains clean
- downstream lanes operate on bounded overlays, not permanent replay contamination

## Current Truth

- homepage and `/imc` are already canonical
- the product-family kernel exists
- `data-truth` and `product-family` can advance `C4`
- the main autonomy blocker is not setup; it is hardening the system so `systems-qa` and `integration` can run repeatedly without state drift or unsafe replay loops

## Program

### A0. Control Plane Truth And Runner Safety

Purpose:

- make the control plane authoritative again before further autonomy

Tasks:

- commit lane-lock acquisition/release so only the active lane owns a live lock
- make upstream replay ephemeral when a downstream lane produces no accepted commit of its own
- synchronize runtime runner state with service install, stop, error, and recovery paths
- recover any stale active cycle before new autonomous materialization
- record the new hardening plan as the machine-readable source for go-live work

Exit gates:

- `validate-control-plane` clean
- `health-check` clean after stale-cycle recovery
- no broad cycle-wide lock materialization remains
- no stale queue or runner mismatch remains after recovery

### A1. Shared Generic Geometry Closure

Purpose:

- close the shared lane/page geometry that blocks `/work/xr` and `/work/ft`

Tasks:

- inspect the active `product-family` and `systems-qa` artifacts, not stale root copies
- resolve any shared lane geometry drift in `LaneAuthorityPage` and the product kernel
- keep fixes kernel-level, not route-specific hacks
- require zero critical and zero major diffs on `/work/xr`

Exit gates:

- `/work/xr` closes through `systems-qa`
- no responsive overflow on the current breakpoint matrix
- no bespoke XR-only geometry fork is introduced

### A2. Replication Proof

Purpose:

- prove the kernel generalizes beyond XR

Tasks:

- replay the accepted generic kernel into `/work/ft`
- verify the route remains packet-truthful and layout-clean
- reject any patch that only works for XR

Exit gates:

- `/work/ft` closes through `systems-qa`
- `integration` replays accepted XR and FT candidates cleanly
- the product-family lane is no longer the primary source of geometry regressions

### A3. Responsive Matrix Expansion

Purpose:

- move beyond the current laptop/tablet/mobile minimum and prove broader viewport safety

Tasks:

- expand falsification to the target viewport set used for go-live
- record route-specific responsive deltas as system learnings
- prevent new breakpoints from degrading canonical routes

Exit gates:

- homepage, `/imc`, `/work/xr`, and `/work/ft` pass the expanded matrix
- no new horizontal overflow or critical viewport regressions remain

### A4. Supervised Autonomy Proof

Purpose:

- prove that the system can run its own bounded loop without manual state repair

Tasks:

- reinstall the service only after A0 is clean
- run a supervised `C4 -> C5` sequence
- require complete queue, handoff, report, and runner-state settlement

Exit gates:

- one full supervised cycle passes without manual queue edits
- no stale locks survive settlement
- accepted candidates replay only as intended

### A5. Guarded Local Autonomy Proof

Purpose:

- prove unattended local recursion under a bounded window

Tasks:

- run guarded local autonomy in the allowed repo scope
- observe at least one improvement-or-hold cycle with no state corruption
- verify recovery still works if the loop is interrupted or a lane fails closed

Exit gates:

- guarded autonomy passes
- recovery evidence remains current
- no cross-repo writes or path-scope violations occur

### A6. Press-Go Eligibility Bundle

Purpose:

- assemble the final evidence that the system is safe enough to leave running

Tasks:

- update runtime gates and the press-go manifest with current evidence
- record operator-facing runbook deltas
- leave `press_go` false until explicit human authorization

Exit gates:

- all prior phases pass
- the evidence bundle is current
- the system is truthful about its readiness state

## Streams

- `orchestrator`: control-plane truth, sequencing, settlement
- `data-truth`: GitHub packet truth and repo-derived page inputs
- `product-family`: kernel application to generic routes
- `systems-qa`: deterministic falsification
- `integration`: replay rehearsal and merge-safety proof
- extra-reasoning reviewers: safety critique, geometry critique, and go-live critique

## Immediate Execution Order

1. Finish A0 and recover the stale active cycle.
2. Re-run `C4` under the new replay/lock contract.
3. Close XR through `systems-qa`.
4. Replay XR through `integration`.
5. Prove FT replication.
6. Expand the responsive matrix and re-run the bounded loop.

## Press-Go Rule

`press_go` stays `false` until A0-A6 evidence exists and explicit human authorization is recorded.
