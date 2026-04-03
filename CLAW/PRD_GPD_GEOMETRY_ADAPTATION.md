# PRD: Adapt Get Physics Done Into A Deterministic Website Geometry Program

## Status

- date: `2026-04-03`
- owner: `orchestrator`
- scope: `/Users/zer0palab/Zer0pa Website/Website-main`
- state: `active engineering reset`

## Problem

The current website system copied the posture of `get-physics-done` but not enough of its machinery.

What exists now is useful:

- a multi-lane control plane
- bounded evaluator-optimizer loops
- route-level falsification
- a geometry-first doctrine

What is still missing is the stronger GPD spine:

- a project contract that all lanes inherit
- a convention lock that all artifacts must satisfy
- dual-write human/machine state
- a protocol catalog
- a verification bundle catalog
- a direct command surface for map -> discuss -> plan -> execute -> verify -> debug

This is why the current system can look deterministic in documents while still failing to enforce geometry law strongly enough in runtime work.

## Decision

Adapt GPD more literally into a repo-local website program named `GGD/`:

- `GGD/PROJECT.md`
- `GGD/CONVENTIONS.md`
- `GGD/REQUIREMENTS.md`
- `GGD/ROADMAP.md`
- `GGD/STATE.md`
- `GGD/state.json`
- `GGD/PROTOCOLS.md`
- `GGD/VERIFICATION.md`

`CLAW/` remains the long-running autonomy and runner layer.
`GGD/` becomes the deterministic geometry contract layer that the claws must obey.

## What To Copy Literally From GPD

### 1. Bootstrap artifacts

Create and maintain a project-scoped contract bundle:

- project definition
- requirements
- roadmap
- conventions
- human-readable state
- machine-readable state

### 2. Phase -> plan -> wave structure

Keep execution granular:

- phase = one coherent engineering objective
- plan = one bounded slice inside the phase
- wave = set of independent plans that can run in parallel

### 3. Convention lock

Every geometry artifact, route contract, and verification artifact must inherit the same declared conventions:

- spacing basis
- grid basis
- typography basis
- color-coordinate basis
- breakpoint basis
- semantic hierarchy basis
- code-quality basis

### 4. Verification as a first-class system

The verifier is not an afterthought. It is a dedicated surface with:

- named checks
- named bundles
- severity classes
- evidence capture
- gap output for follow-on execution

### 5. Pattern memory

Rejected slices must create reusable law or pattern entries, not disappear into operator memory.

### 6. Resume and debug workflows

Long-running geometry work needs:

- resumable state
- explicit blockers
- debug protocols for geometry regressions
- recovery after interrupted cycles

## What To Adapt For Website Geometry

### Physics conventions -> geometry conventions

- metric signature -> grid and coordinate basis
- units -> spacing unit and token ladder
- notation lock -> component, route, and token naming lock
- analytic assumptions -> route invariants and page-role laws

### Physics checks -> geometry checks

- dimensional analysis -> spacing, box, and ratio checks
- limiting cases -> breakpoint checks
- symmetry checks -> alignment, keyline, and hierarchy checks
- conservation laws -> route truth and metadata integrity checks
- numerical convergence -> replay and responsive stability checks

### Research map -> design truth map

Map:

- mockup geometry
- live route geometry
- packet truth
- semantic hierarchy
- SEO and metadata structure
- code-quality surfaces

## What To Reject From GPD

- literature review workflows
- manuscript and paper tooling
- physics-specific domain bundles
- global runtime installer takeover
- physics-specific MCP servers and commands as-is

## Command Surface To Build

The website system should gain a GPD-shaped surface:

- `map-existing-design`
- `new-geometry-program`
- `discuss-phase`
- `plan-phase`
- `execute-phase`
- `verify-work`
- `debug-geometry`
- `validate-conventions`
- `audit-route-family`
- `resume-cycle`

The names may differ, but the shape should be this literal.

## Agent Surface To Build

Adapt GPD's agent families into website geometry roles:

- `ggd-research-mapper`
- `ggd-convention-coordinator`
- `ggd-planner`
- `ggd-executor`
- `ggd-verifier`
- `ggd-debugger`
- `ggd-referee`
- `ggd-flagship-reviewer`
- `ggd-structure-reviewer`

`CLAW` lane ownership remains, but the role prompts should be derived from this surface.

## Engineering Phases

### Phase 0. Bootstrap the GGD workspace

- instantiate `GGD/` artifacts
- lock the initial conventions
- record current blockers and route truth

### Phase 1. Move determinism from prose into contracts

- encode base geometry laws
- encode typography and color laws
- encode semantic and code-quality laws
- declare acceptance tests per route family

### Phase 2. Port verification bundles

- geometry bundle
- breakpoint bundle
- contrast bundle
- semantic hierarchy bundle
- SEO/metadata bundle
- data-truth bundle
- code-quality bundle

### Phase 3. Port command and agent surfaces

- define plan/execute/verify/debug flows
- align subagent role prompts with GGD artifacts
- route current claw lanes through the new contract

### Phase 4. Migrate active route work

- move homepage and `/imc` closure memory into GGD state
- migrate `/work/xr` and `/work/ft` into GGD phase plans
- reject any route work that bypasses the convention lock

### Phase 5. Resume autonomy proof

- only after GGD artifacts are authoritative
- only after verification bundles are real
- only after current route failures are encoded as GGD gaps

## Readiness Rule

The system is not ready for unattended recursive work until:

- `GGD/` is the authoritative design contract layer
- verification bundles are machine-operable rather than aspirational
- active route failures are represented as explicit gaps inside `GGD/state.json`
- `CLAW` executes against `GGD`, not beside it

## Immediate Outcome

This PRD changes the engineering direction:

- stop treating `get-physics-done` as a loose inspiration
- start treating it as the model for the deterministic geometry program
- keep `CLAW` for orchestration
- install `GGD` as the harder contract layer the claws must satisfy
