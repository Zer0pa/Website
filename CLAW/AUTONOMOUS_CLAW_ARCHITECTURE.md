# Autonomous Claw Architecture

## Purpose

Convert the Zer0pa website effort from a sequence of manual edits into a bounded autonomous system that can keep improving locally for hours without touching other repos or degrading the deterministic design program.

## Why This Exists

Without a control plane:

- agents optimize locally instead of globally
- canonical routes and generic routes get mixed together
- truth-pipeline changes and visual changes collide
- "looks better" can outrun verification

The answer is not more agents. The answer is better structure.

## Foundational Decision

The canonical order is:

1. homepage
2. `/imc`
3. product-family kernel
4. batch product-page rollout
5. long-running recursive improvement

Nothing should run unattended before steps 1 through 3 are properly modeled.

## Deterministic Inputs

The autonomous system must treat these as source truth:

- homepage design direction assets
- product-page design direction assets
- `site/src/lib/layout/specs.ts`
- measurement, diff, and audit scripts
- deterministic design maps and reports
- GitHub discovery, parsing, packet cache, and lane truth

These are not inspiration. They are constraints.

## System Layers

### Geometry Program

The website is governed by measurable laws:

- spacing units
- type scale
- shell widths
- panel ratios
- breakpoint behavior
- color tokens
- flagship exceptions

### Control Plane

The control plane owns:

- phase and wave selection
- lane assignment
- handoff quality
- promotion and rejection
- `press_go`

### Execution Lanes

Each lane has:

- one branch
- one worktree
- one bounded role
- a narrow write scope

### Falsification Layer

Every serious pass must survive:

- build
- parser falsification
- layout audit
- responsive audit
- route-truth review

### Promotion Layer

Laws proven on homepage and `/imc` become family law. Unproven hacks do not.

## Lane Topology

### Orchestrator

- owns the control branch
- assigns bounded work
- reads handoffs
- accepts or rejects

### Homepage Fidelity

- closes shell law on `/`
- no product-family work yet

### IMC Flagship

- defines flagship law
- must resist generic flattening

### Product-Family Kernel

- extracts what is lawful and reusable
- waits until homepage and `/imc` stabilize

### Product-Family

- rolls proven laws across the repo-backed pages
- should work in batches, not all at once

### Data Truth

- keeps GitHub-driven truth honest
- protects the live packet pipeline from design drift

### Systems QA

- produces audits and evidence
- cannot self-approve implementation work

### Integration

- stages accepted lane work
- is where combined QA and rollback rehearsal happen

## Cadence

### Lane cycle

- every 10 to 15 minutes
- one bounded change set
- one handoff

### Orchestrator review

- every 30 to 60 minutes
- compare claims against artifacts
- update wave and state

### Full falsification sweep

- every 4 hours
- build, parser, layout, responsive

### Promotion review

- every 12 hours
- decide whether homepage or `/imc` laws are strong enough to generalize

### System health review

- every 24 hours
- inspect drift, failures, installs, logs, and stop conditions

## Safety Boundary

Autonomous scope is limited to:

- `Website-main`
- `worktrees/*`
- repo-local `CLAW/`

Not allowed by default:

- other repos
- `main`
- remote pushes
- production deploys
- global machine mutation

## Press-Go Standard

We are ready to press go only when:

- the control plane is documented in-repo
- all v1 lane worktrees exist
- runtime state exists and matches schema
- a supervised dry run passed
- QA produced a valid evidence bundle
- a rollback or recovery drill passed
- the system can reject bad work without human cleanup

Until then, the system is architected, not unleashed.
