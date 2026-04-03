# Autonomous Runbook

## Operating Modes

### 1. Architecture Ready

What must exist:

- control-plane docs
- lane worktrees
- geometry-first doctrine
- state template
- verification commands

No perpetual execution yet.

Canonical files:

- `CLAW/control-plane/agent-lanes.json`
- `CLAW/control-plane/cadence.json`
- `CLAW/control-plane/state.template.json`
- `CLAW/control-plane/runtime-state.schema.json`
- `CLAW/control-plane/artifact-contract.md`

### 2. Supervised Dry Run

Run one full cycle manually:

1. orchestrator assigns one narrow slice
2. one implementation lane changes code
3. systems QA runs audits
4. integration stages the accepted result
5. orchestrator records outcome

This proves the loop works.

### 3. Guarded Local Autonomy

Let the lanes iterate locally for 60 to 240 minutes with:

- no remote pushes
- no global installs
- no external writes
- active lock management

Goal: prove the system gets better, not noisier.

### 4. Extended Local Autonomy

Run for 4 to 24 hours with the same boundaries, while measuring:

- diff closure
- regression rate
- log quality
- checkpoint quality
- machine stability

### 5. Safe Autonomous Run

Only after guarded and extended local autonomy pass:

- keep remote writes gated unless explicitly enabled
- keep production deployment gated
- allow the local loop to continue unattended

## Cadence

### Lane Cycle: every 10 minutes

Each active lane:

- reads current brief and locks
- attempts one narrow improvement slice
- runs only the minimum required verification
- writes a handoff note

### Orchestrator Review: every 30 minutes

The orchestrator:

- reads lane handoffs
- resolves collisions
- updates queue and locks
- decides `promote`, `revise`, `hold`, or `abandon`

### QA Sweep: every 90 minutes

Systems QA runs:

- `npm run build`
- `npm run test:parser`
- `npm run audit:layout`
- `npm run audit:responsive`

on the integration lane or the currently nominated candidate lane.

### Product-Family Sweep: every 4 hours

The product-family lanes:

- review canonical laws
- test rollout coverage
- inspect lane-specific exceptions
- flag where generic rules still break flagship quality

### Stability Sweep: every 24 hours

The orchestrator:

- rotates logs
- records current best checkpoint
- archives stale branches or abandoned candidates
- produces a human-readable summary

## Handoff Format

Every lane handoff should contain:

- lane
- phase
- target route or subsystem
- files changed
- commands run
- audit result
- blockers
- recommendation

No handoff means no promotion.

## Safe Promotion Path

1. lane commits locally
2. QA evaluates lane output
3. integration replays the accepted result
4. full QA runs on integration
5. orchestrator records accepted checkpoint

## Failure Rules

- two failed attempts on the same narrow slice -> escalate back to orchestrator
- any new critical diff -> immediate hold
- any parser or build failure -> immediate hold
- any machine-local guardrail breach -> stop autonomy and return to supervised mode

## Readiness To Press Go

Say "ready to press go" only when all of the following are true:

- supervised dry run passed
- guarded local autonomy passed
- extended local autonomy passed
- no uncontrolled path writes occurred
- no unrelated repo touches occurred
- the integration lane can produce clean checkpoints
- homepage, `/imc`, and product-family lanes all have lawful briefs and QA coverage
