# PRD: Zer0pa Website 24/7 Local Autonomous Claw Hardening

## Status

- status: `active engineering program`
- owner: `orchestrator`
- date: `2026-04-03`
- scope: repo-local autonomy for `/Users/zer0palab/Zer0pa Website/Website-main` and `/Users/zer0palab/Zer0pa Website/worktrees/*`

## Problem

The current system can run supervised recursive improvement, but it is not yet hardened for unattended 24/7 local operation. The missing work is engineering work:

- convert the current control plane into an explicit phase program
- eliminate drift between docs, machine-readable state, and actual lane behavior
- harden recovery, lock management, and lane orchestration
- prove that repeated cycles improve fidelity or hold quality, rather than degrading it
- derive product-page rollout from canonical laws, not repeated local improvisation

## Goal

Enable safe 24/7 unattended local autonomy on this Intel Mac such that:

- quality improves or holds under repeated cycles
- no critical or major visual regressions are introduced
- no work escapes the Website repo boundary
- the system can recover from lane, audit, or integration failure without human rescue
- homepage and `/imc` become canonical law sources for the product-family kernel

## Non-Goals

- autonomous remote pushes, PR creation, deploys, or production writes
- touching repos other than `Website`
- global machine modification outside repo-local dependencies
- creative redesign outside deterministic geometry extracted from the mockups
- live third-party account automation

## Invariants

- `press_go` remains `false` until all phase gates pass
- the mockups are treated as measured geometry, not inspiration
- one bounded hypothesis per lane cycle
- one route or subsystem per slice
- evaluator verdicts override aesthetic intuition
- all autonomous writes stay inside the Website repo and its worktrees
- no lane may write outside its allowed path contract
- `cadence.json`, `recursive-improvement.json`, and runtime state are the canonical machine-operable control surface

## Current State

- a supervised homepage wave has completed and is recorded in `CLAW/control-plane/reports/W1-homepage-supervised.md`
- the homepage loop has already rejected one regressing candidate and preserved a better one
- the control plane, runbook, recursive protocol, lane map, and runtime state all exist
- all lane worktrees exist and are clean
- the remaining gap is hardening, not initial setup

## Target System

The target system is a bounded evaluator-optimizer architecture with eight operating lanes:

- `orchestrator`
- `homepage-fidelity`
- `imc-flagship`
- `product-family-kernel`
- `product-family`
- `data-truth`
- `systems-qa`
- `integration`

The system iterates locally, records state and learning, runs hard eval gates, escalates after repeated failures, and only authorizes unattended operation after supervised proof.

## Workstreams

### 1. Control Plane And State

Owns:

- phase state
- locks
- queueing
- cadence
- handoff completeness
- stop and recovery semantics

Deliverables:

- aligned runtime state
- machine-readable hardening phase plan
- drift-free control-plane docs

### 2. Deterministic Geometry

Owns:

- homepage laws
- `/imc` laws
- grid, spacing, type, and color constraints
- route-spec extraction from mockups

Deliverables:

- route laws for `/`
- route laws for `/imc`
- kernel-ready law set for product pages

### 3. Truth And Data Packets

Owns:

- repo packet normalization
- GitHub truth ingestion
- packet completeness
- route-safe presentation mapping

Deliverables:

- normalized repo packets for all target repos
- stable product-page input contract

### 4. Verification And Falsification

Owns:

- build, parser, layout, and responsive checks
- regression rejection
- checkpoint evidence
- scorecards and drift detection

Deliverables:

- repeatable QA bundles
- integration verdicts
- route score histories

### 5. Recovery And Ops Hardening

Owns:

- rollback drills
- lock cleanup
- stale process cleanup
- lane recreation
- stress handling

Deliverables:

- passed recovery drill matrix
- documented lock policy
- proven restart paths

### 6. Product-Family Rollout

Owns:

- kernel extraction from canonical routes
- repo-page propagation
- variant-rule discipline
- batch verification across the 10 repo pages

Deliverables:

- product-family kernel
- variant rules by repo class
- audited rollout plan

## Lock And Resource Policy

The following locks are mandatory for unattended operation:

- `next-build`: exclusive
- `browser-audit`: exclusive
- `truth-sync`: exclusive
- `integration-promotion`: exclusive
- `globals-css`: exclusive
- `layout-spec`: exclusive
- `route-home`: exclusive
- `route-imc`: exclusive
- `product-kernel`: exclusive

Rules:

- only one build at a time
- only one browser session at a time
- only one lane may write `site/src/app/globals.css` at a time
- only one lane may write layout specs at a time
- homepage and `/imc` lanes may not run in parallel when they would contend on shared files
- max three high-reasoning lanes active at once on this Intel Mac

## Recovery Drill Matrix

The system is not hardened until all drills pass.

### R1. Candidate Rollback

Trigger:

- a lane introduces a new critical or major regression

Pass condition:

- the lane returns to the last good local candidate and records the failed slice

### R2. Integration Rejection

Trigger:

- an accepted lane candidate fails after replay in `integration`

Pass condition:

- integration rejects without local patching and returns the failure to the source lane

### R3. Build Or Parser Failure

Trigger:

- local build or parser check fails during an unattended slice

Pass condition:

- the lane stops, records the failure, and releases locks without corrupting state

### R4. Stale Lock Recovery

Trigger:

- a lane crashes or exits while holding a lock

Pass condition:

- the orchestrator detects the stale lock and safely clears or reassigns it

### R5. Lane Recreation

Trigger:

- a worktree becomes unusable or inconsistent

Pass condition:

- the lane is recreated from the last accepted checkpoint without data loss outside that lane

### R6. Truth Contradiction

Trigger:

- repo packet content contradicts source truth or breaks rendering assumptions

Pass condition:

- the lane halts promotion and records the contradiction for `data-truth`

## Phase Plan

### P0. Drift Eradication And PRD Lock

Objective:

- make the control-plane docs, machine-readable state, cadence, and actual lane behavior agree

Required streams:

- `orchestrator`
- `systems-qa`

Exit criteria:

- PRD committed
- machine-readable phase plan committed
- runtime state reflects current reality
- cadence and protocol no longer contradict each other
- all lane branches carry the same control-plane rules

### P1. Canonical Homepage Closure

Objective:

- close homepage geometry without page-wide drift

Required streams:

- `homepage-fidelity`
- `systems-qa`

Exit criteria:

- two consecutive non-regressing homepage passes
- `0` critical and `0` major diffs
- minor diffs reduced to a stable bounded set
- no overflow on laptop, tablet, or mobile
- open homepage learning items either resolved or explicitly deferred into law work

### P2. Canonical Flagship Closure

Objective:

- close `/imc` as the flagship law source

Required streams:

- `imc-flagship`
- `systems-qa`

Exit criteria:

- two consecutive non-regressing `/imc` passes
- `0` critical and `0` major diffs
- layout, build, parser, and responsive checks pass
- `/imc` law exceptions are declared rather than embedded as ad hoc tweaks

### P3. Product Kernel And Truth Readiness

Objective:

- derive one reusable product-page kernel from homepage and `/imc`
- normalize repo packets for all target repos

Required streams:

- `product-family-kernel`
- `data-truth`
- `systems-qa`

Exit criteria:

- product kernel committed
- normalized repo packets exist for all target repos
- variant rules are declared by repo class
- sample product pages render from packets without bespoke layout hacks

### P4. Integration And Recovery Hardening

Objective:

- prove that accepted lane work can survive replay and failure

Required streams:

- `integration`
- `systems-qa`
- `orchestrator`

Exit criteria:

- at least one accepted homepage candidate replayed successfully in integration
- at least one accepted `/imc` candidate replayed successfully in integration
- recovery drills `R1` to `R6` all pass
- lock lifecycle is exercised and recorded

### P5. Guarded Local Autonomy

Objective:

- prove that unattended local iteration improves or holds quality for a bounded period

Required streams:

- all active lanes under orchestrator control

Run window:

- `2` to `4` hours

Exit criteria:

- no cross-repo writes
- no uncontrolled process buildup
- no stale lock remains unresolved
- no new critical or major regressions survive
- checkpoint quality is acceptable
- route metrics trend flat or improving

### P6. Extended Local Autonomy

Objective:

- prove the same behavior over a full day

Run window:

- `12` to `24` hours

Exit criteria:

- phase P5 success repeated at longer duration
- recovery remains functional during unattended windows
- handoffs and logs stay complete
- machine remains stable under resource budget

### P7. Press-Go Authorization

Objective:

- authorize safe unattended local autonomy

Exit criteria:

- phases P0 to P6 passed
- homepage and `/imc` are canonical and stable
- product-family kernel is ready for controlled rollout
- all recovery drills have current evidence
- runtime state and gate state are current
- explicit human authorization is recorded by the orchestrator

## Stop Conditions

Stop unattended execution immediately if any of the following occur:

- new critical diff
- new major diff
- build failure
- parser failure
- cross-repo write
- path-scope violation
- stale lock that cannot be cleared safely
- repeated integration rejection on the same candidate
- data-truth contradiction
- system-health review indicates resource exhaustion or runaway processes

## Press-Go Contract

`press_go` may become `true` only when:

- phase P7 exit criteria are met
- the system has already rejected regressions under supervision
- the system has already survived recovery drills
- the system has already survived guarded and extended local autonomy windows
- the system has not touched anything outside the Website repo boundary

## Immediate Execution Order

1. complete P0 drift eradication
2. complete P1 homepage closure
3. complete P2 `/imc` closure
4. complete P3 kernel and truth readiness
5. complete P4 integration and recovery hardening
6. run P5 guarded autonomy
7. run P6 extended autonomy
8. evaluate P7 press-go authorization
