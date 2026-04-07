# PRD: Deterministic Geometric Autonomy Hardening

## Status

- date: `2026-04-04`
- owner: `engineering-orchestrator`
- state: `active hardening program`
- scope: `/Users/zer0palab/Zer0pa Website/Website-main`
- writable posture: `new standalone PRD only`

## Problem

The CLAW and GGD stack is directionally correct but not yet trustworthy as a recursively autonomous deterministic design machine.

The system already has:

- a live guarded autonomy runner
- lane isolation and fail-closed queueing
- a GGD contract layer adapted from GPD
- route verification bundles
- a systems-optimizer lane
- local equation-engine access

The system does not yet have:

- equation-native route falsification as the dominant design truth
- machine-reduced state truth that is derived from reports and handoffs instead of partly maintained by prose
- contradiction-free acceptance surfaces across runtime state, handoffs, reports, and checkpoints
- trustworthy recursive autonomy for the product-family routes

This PRD formalizes the next program: move the website and the autonomy machine toward a purely geometric, algebraic, deterministic, and falsifiable system.

## Goals

- Treat website output as a deterministic mathematical artifact rather than a taste-driven creative project.
- Deepen GGD law integration from light measurement support into explicit route, type, color, spacing, and responsive law execution.
- Reduce runtime truth from authoritative artifacts instead of hand-maintained summaries.
- Strengthen evaluator architecture so route and system promotion are both evidence-first and fail-closed.
- Close product-family proof on `/work/xr` and `/work/ft` under shared law, not route-specific hacks.
- Reach a supervised recursive autonomy posture that is safe to extend overnight without quality drift.

## Non-Goals

- broad route redesign outside declared law families
- relaxing fail-closed behavior for speed
- production publishing
- remote push or deployment
- replacing CLAW with GGD or collapsing them into one layer
- accepting prose-only justifications where explicit equations or measurable laws are possible

## Current Truth

As of `2026-04-04`, the live machine indicates:

- daemon mode: `guarded-override`
- `press_go`: `false`
- active phase: `C4-first-generic-product-proof`
- control style: `evaluator-optimizer`
- canonical routes: `/`, `/imc`
- blocked proof route: `/work/xr`
- blocked product-family route: `/work/ft`

Observed system truths from the latest engineering pass:

- the equation layer was too shallow and was not being exercised deeply enough inside live website verification
- runtime contrast truth was contradictory: runtime claimed pass while newer handoff evidence reported `72` major failures
- queue truth could drift because status resolution depended too heavily on one runtime pointer
- XR gap provenance was mixed: replay-failure and preserved measured evidence were being serialized into the same authoritative gap surface
- route-family verification remained too measurement-first and not equation-native enough
- `/work/xr` remained blocked by open geometry and breakpoint failures
- `/work/ft` remained materially behind and under-specified relative to current falsification evidence until explicit FT gap state was exported
- route-local falsification was being contaminated by shared responsive and contrast artifacts
- route progress had no authoritative derived packet before the current hardening pass

## Mathematical Doctrine

### Core Laws

The website is modeled as:

`route_output = f(route_role, packet_truth, geometry_constants, lawsets, viewport, constraints)`

Promotion is modeled as:

`promotion = f(route_gap_state, evaluator_bundle, contradiction_state, queue_truth, replay_integrity, recovery_integrity)`

Runtime truth is modeled as:

`state_truth = reduce(handoffs, reports, gap_artifacts, checkpoints, queue_index, verification_artifacts)`

No route or system change is promotable when any of the following holds:

- a blocking gap remains open
- an evaluator bundle is incomplete
- truth artifacts contradict one another
- state is not reducible from authoritative evidence
- a route requires bespoke hacks outside its declared law family
- fail-closed recovery cannot replay or reject the slice deterministically

### Mathematical Priority Order

The required order of authority is:

1. explicit lawsets and constants
2. route-role grammar
3. packet truth
4. evaluator artifacts
5. reduced state truth
6. prose interpretation

### Required Law Families

The system must govern at minimum:

- shell geometry laws
- section-flow laws
- typographic scale and baseline laws
- numeric color and contrast laws
- breakpoint and limiting-case laws
- product-family kernel laws

Measurement remains necessary, but only as falsification evidence against declared law, not as the primary source of design truth.

## Findings On Current System Flaws

### GGD And Equation Integration

- The binding is now stronger, but the route evaluators still operate mostly as audits of measured output instead of direct execution of route lawsets.
- Law coverage exists for `home`, `flagship`, `product-family`, `typography`, and `color`, but route closure is still not decided by a fully equation-native acceptance bundle.
- Geometry reasoning remains threshold-heavy. Algebraic families, proportional invariants, and limiting-case equations are still underused.

### State Truth And Synchronization

- `runtime-state.json` still contains manually curated audit summaries that can drift from newer handoff evidence.
- Checkpoints, handoffs, route gaps, and runtime summaries are not yet fully reduced into one deterministic truth pipeline.
- Canonical route claims for `/` and `/imc` are operationally useful, but still need periodic recertification when newer evaluator evidence shifts.

### Evaluator And Queue Integrity

- Queue resolution previously depended on a brittle active-cycle pointer.
- Runner quiet detection previously ignored `stderr`, making living jobs look stalled.
- Salvage and recovery logic improved, but system truth can still be ahead of verified route-family evidence.
- The systems-optimizer writable contract is still too broad because `GGD/**` includes route-truth surfaces, not just contract surfaces.
- Escalated cycles can still leave downstream jobs reported as `queued`, which is not an honest terminal state.

### Product-Family Proof Surface

- `/work/xr` is still the active blocker and remains well below closure.
- `/work/ft` has severe failure evidence and now requires the same explicit deterministic gap discipline as XR.
- Shared product-family law remains more trustworthy than route-specific patching; this must stay invariant.

### Gap Provenance And Quarantine

- A gap artifact must not remain authoritative when its source handoff includes unauthorized writes, shared-artifact contamination, or replay-only failure without fresh measured evidence.
- Provenance quality must be first-class: `fresh_measured`, `preserved_measured`, and `runner_failure` are different epistemic objects and cannot be collapsed into one gap without loss of trust.

## Falsification Model

Every route and system slice must be rejectable by named evidence.

### Route Falsification

Each route-family evaluator bundle must include:

- layout deviation
- geometry-law execution
- responsive limiting cases
- semantic and SEO validity
- packet-truth integrity
- code quality
- numeric color and contrast verification

### System Falsification

Each system slice must include:

- writable-scope verification
- binding verification
- replay and recovery verification
- queue and state synchronization verification
- contradiction detection against newer artifacts
- equation-engine execution for any GGD-law change
- gap-provenance verification before a handoff can become an authoritative route gap

### Contradiction Law

If a newer authoritative artifact falsifies an older state summary, the older summary loses authority immediately. Promotion, status-green surfaces, and autonomy claims must fail closed until reduced truth is regenerated.

## Deterministic Reduction Of State Truth

The system must stop treating runtime state as a manually maintained narrative surface.

### Required Reduction Architecture

`runtime-state.json` and other control summaries must become reducible outputs from:

- `CLAW/control-plane/runtime/handoffs/*.json`
- `CLAW/control-plane/reports/*.md`
- `GGD/gaps/routes/*.json`
- `deterministic-design-system/reports/**`
- `CLAW/control-plane/queue/index.json`
- `CLAW/control-plane/checkpoints/current.json`
- `CLAW/control-plane/reports/route-progress.latest.json`
- `CLAW/control-plane/press-go.manifest.json`

### Reduction Rules

- newer timestamped falsification evidence overrides older summaries
- route status is derived from the latest accepted or rejected evidence, not operator prose
- gate booleans must be computed from named artifact predicates
- checkpoint freshness must be computed against current accepted commits and latest route verdicts
- canonical status must be recertifiable and revocable if contradiction evidence appears
- route progress must be a stored derived packet with formula, inputs, and confidence
- contaminated handoffs must be quarantined before they can become authoritative gap inputs

### Acceptance Requirement

No future autonomy expansion is allowed until the system can regenerate key truth surfaces without manual summary editing.

## Evaluator Architecture

The evaluator stack must be decomposed into deterministic layers.

### Layer 1: Law Registry

- local lawset index in `GGD/equations/lawsets.json`
- explicit route-role coverage
- typed lawset kinds for shell, typography, color, and responsive behavior

### Layer 2: Route Evaluators

- route-shell evaluator
- geometry and proportion evaluator
- typography rhythm evaluator
- color and contrast evaluator
- responsive limiting-case evaluator
- packet-truth evaluator

### Layer 3: System Evaluators

- queue integrity evaluator
- handoff-to-state contradiction evaluator
- gap provenance and contamination evaluator
- replay and salvage evaluator
- lane-scope evaluator
- worktree contract propagation evaluator

### Layer 4: Promotion Reducer

Promotion must be granted only by a reducer that consumes evaluator verdicts and gap state. Human-readable reports are outputs, not authorities.

## Fail-Closed Agent Operations

The operating doctrine remains fail closed.

### Required Operational Laws

- single writer per lane
- host runner is the only promotion authority
- no route promotion with open blocking gaps
- no green system status under contradiction
- no recovery without replayable artifact trails
- no cross-repo writes
- no silent widening of writable scope
- no autonomy expansion on stale checkpoint evidence

### Required Overnight Reliability Changes

- keep `stderr` and `stdout` as liveness signals
- derive active queue truth from multiple authoritative sources
- gate system-green surfaces on contradiction checks
- require route-family gap export whenever severe product-family evidence appears
- quarantine unauthorized-write and shared-artifact-contaminated handoffs before gap export
- normalize escalated cycle settlement so downstream queued jobs become explicitly canceled or rematerialized
- block recursive cycles when validation or health is red for reasons inside the active control surface

## Page Progress Methodology

Page progress must be evidence-derived and never treated as a vibes estimate.

### Scoring Model

Weighted score:

- layout: `35`
- geometry: `35`
- responsive: `10`
- quality: `10`
- contrast: `10`

For layout and geometry:

`score = max(0, 100 - critical * 12 - major * 6 - minor * 1.5)`

Responsive scoring:

- horizontal overflow: `40`
- no global overflow but internal overflow: `85`
- no meaningful overflow: `100`

Contrast currently carries provisional confidence because runtime and handoff evidence are contradictory. Until contrast truth is reduced deterministically, contrast contribution is clamped to a conservative mid-confidence assumption.

### Current Working Percentages

Using the latest engineering-orchestrator evidence:

- `/`: `70.9%`
- `/imc`: `81.9%`
- `/work/xr`: `23.5%`
- `/work/ft`: `19.0%`

These values are operational progress estimates, not route-closure certificates. Closure still requires zero blocking failures and contradiction-free truth.

## Required Augmentations

### Mathematical Law Integration

- make lawset execution first-class inside route evaluation, not just binding verification
- add explicit section-flow and macro-spacing laws
- deepen typographic law from ratio hints into baseline and line-length control
- make color derivation algebraic and numerically inspectable
- add limiting-case responsive equations for larger displays and extreme aspect ratios

### System Truth Reduction

- build a reducer that recomputes latest audit summaries, route status, gate booleans, and checkpoint freshness from artifacts
- remove manual truth surfaces where reduction is possible
- create explicit contradiction reports when artifacts diverge
- derive route progress packets with formula, inputs, and confidence from the same artifact set
- quarantine contaminated handoffs before they can produce authoritative gaps

### Evaluator And Automation Refinements

- standardize typed evaluator verdict packets
- require route-family evaluators to declare first broken law, severity baseline, and blocking artifact
- require `/work/ft` deterministic gap export as soon as severe failure evidence exists
- ensure systems-optimizer slices remain bounded, replayable, and law-aware
- split `GGD/**` into contract surfaces and route-truth surfaces, then remove the latter from systems-optimizer default scope
- normalize escalated cycle settlement into explicit canceled or rematerialized downstream jobs
- reduce press-go manifests from live evidence instead of leaving stale bundle pointers in place

### Best-Practice Agentic Hardening

- keep planning, execution, and evaluation separable
- preserve narrow writable scopes
- ensure long-running jobs emit observable liveness
- prefer artifact-based handoffs over conversational memory
- treat recovery and replay as first-class proofs, not incidental tooling

### External Best-Practice Inputs

This hardening program also adopts four external practices and translates them into local CLAW rules:

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents?lid=1f0n56CPItf3Nm9NR): keep agent loops incremental, preserve machine-readable progress state across interruptions, and separate broad initialization from bounded coding execution.
- [Anthropic: Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents): prefer reusable local tools and code-backed interfaces over prose-only operator memory.
- [OpenAI: A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/): keep planner, executor, and evaluator roles distinct and make handoffs explicit.
- [OpenAI: Evaluation best practices](https://platform.openai.com/docs/guides/evals): use discriminative, continuously rerunnable evals as the authority surface for promotion and regression detection.

## Milestones

### M0. Contradiction Closure

- runtime truth reduction plan accepted
- contrast contradiction surfaced and reduced
- no false-green audit summaries remain

### M1. Equation-Native Evaluators

- local lawsets are executed inside route-family evaluation
- route verdicts reference explicit law failures, not only measurements

### M2. Product-Family Deterministic Gaps

- `/work/xr` gap remains authoritative and current
- `/work/ft` receives explicit deterministic gap export and remains blocked until the gap closes

### M3. Shared Kernel Proof

- `/work/xr` closes under shared product-family law
- `/work/ft` closes or fails with explicit non-bespoke law reasons

### M4. State Reduction And Promotion Hardening

- route status and gates are machine-reduced
- checkpoint freshness is computed, not narrated
- promotion reducer is contradiction-aware
- route progress packets are current and stored
- contaminated gap sources are rejected or quarantined automatically

### M5. Supervised Recursive Proof

- repeated supervised cycles hold or improve quality
- no manual surgery is required to keep the system coherent

### M6. Guarded Overnight Trust

- repeated guarded cycles survive overnight without silent drift
- autonomy remains local, deterministic, and fail closed

## Acceptance Gates

This program is accepted only when all of the following are true:

- GGD law execution is part of route acceptance, not just binding validation
- runtime truth is reduced from authoritative artifacts for the key gate surfaces
- no known contradiction exists between runtime state and newer handoff evidence
- `/work/xr` closes with zero blocking geometry, layout, responsive, truth, and quality failures
- `/work/ft` is either closed under the same kernel law or explicitly blocked by a deterministic gap artifact
- systems-optimizer keeps only replayable, measurable, bounded ratchets
- recursive guarded operation can run without degrading the canonical or product-family routes

## Metrics

Primary metrics:

- contradiction count across runtime truth surfaces
- percentage of gate booleans reduced from artifacts
- percentage of route evaluators executing explicit lawsets
- blocking gap count per route
- checkpoint freshness latency
- replay success rate
- salvage success rate
- overnight guarded cycle stability

Secondary metrics:

- number of manual truth edits required per day
- rate of route-family regressions after accepted system changes
- number of first-broken-law diagnoses that point to shared kernel law rather than route hacks

## Roadmap To Trustworthy Recursive Autonomy

### Stage 1: Make Truth Reducible

Replace hand-maintained summaries with artifact reduction for route status, audit summaries, and gates.

### Stage 2: Make Laws Executable

Push the local equation registry into route and system evaluators so the machine verifies declared geometry law directly.

### Stage 3: Make Product-Family Proof Honest

Keep `/work/xr` and `/work/ft` under one law family, export deterministic gaps aggressively, and reject bespoke shortcuts.

### Stage 4: Make Promotion Mechanical

Move promotion authority into contradiction-aware reducers that consume evaluator verdicts, gap state, and replay proof.

### Stage 5: Make Recursion Earned

Permit extended guarded autonomy only after repeated supervised cycles hold the same deterministic quality bar without manual patching.

## Program Decision

The next trustworthy version of CLAW is not the one that writes more routes faster. It is the one that can prove, by equations and reduced evidence, why every accepted route and every accepted system ratchet deserves to survive.
