# Autonomous Claw Control Plane

## Goal

Run a long-lived, repo-scoped Claw system that improves the Zer0pa website continuously without touching other repos or mutating machine state casually.

This control plane is scoped to:

- `/Users/zer0palab/Zer0pa Website/Website-main`
- `/Users/zer0palab/Zer0pa Website/worktrees/*`

It is not scoped to the rest of `/Users/zer0palab`, other GitHub repos, or global machine customization beyond explicitly gated ops work.

## Core Model

Use a narrow orchestrated lane system, not a free-for-all swarm.

Run it as an evaluator-optimizer system:

- one bounded slice per lane cycle
- one measurable baseline before each attempt
- one evaluator verdict after each attempt
- one rollback to the last good state if the evaluator rejects the change

Canonical machine-readable protocol:

- `CLAW/control-plane/recursive-improvement.json`
- `CLAW/control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md`

### Control Roles

- `orchestrator`
  - owns state, queue, lane assignment, and acceptance
  - writes phase briefs and promotion decisions
- `homepage-fidelity`
  - owns `/` shell, hierarchy, and reference closure
- `imc-flagship`
  - owns `/imc` and flagship-only exceptions
- `product-family-kernel`
  - extracts reusable laws from homepage and flagship
- `product-family`
  - rolls the lawful product-page system across repo-backed lanes
- `data-truth`
  - owns repo discovery, packet normalization, cache, and truth integrity
- `systems-qa`
  - owns falsification: build, parser, layout, responsive, and regression checks
- `integration`
  - stages accepted lane output for combined review in a clean worktree

## Worktree Isolation

Each role works in its own worktree and branch:

- `Website-main/` -> `codex/clawstation-setup` -> orchestrator and architecture
- `worktrees/homepage-fidelity/` -> `codex/homepage-fidelity`
- `worktrees/imc-flagship/` -> `codex/imc-flagship`
- `worktrees/product-family-kernel/` -> `codex/product-family-kernel`
- `worktrees/product-family/` -> `codex/product-family`
- `worktrees/data-truth/` -> `codex/data-truth`
- `worktrees/systems-qa/` -> `codex/systems-qa`
- `worktrees/integration/` -> `codex/integration`

Rules:

- one lane, one worktree, one branch
- no lane edits another lane's worktree
- promotion happens by cherry-pick, merge, or replay into `integration`, never by ad hoc copy-paste between trees
- abandoned work is discarded by abandoning the lane branch or worktree, not by mutating accepted branches

## Machine-Local Guardrails

### Allowed Paths

- repo root
- lane worktrees
- repo-local `CLAW/`
- repo build outputs and caches produced by `npm`, Next.js, and Playwright inside the repo/worktrees

### Forbidden Paths

- any repo outside the Website workspace
- shell dotfiles and login profiles
- global Codex config, except by explicit gated ops work
- unrelated directories under `/Users/zer0palab`

### Resource Budget For This Intel Mac

This machine is good enough for autonomy, but only with serialized heavy tasks.

- max one `next build` at a time
- max one Playwright browser job at a time
- max one ingest or sync job at a time
- max three reasoning-heavy lanes active at once
- one shared dev server per run window

The orchestrator should treat `build`, `browser`, `network-sync`, and `release` as lockable resources.

## Fully Autonomous Actions

These can run without human approval once the control plane is in guarded-autonomy mode:

- read and edit files inside the lane's own worktree
- create local commits on the lane's own `codex/*` branch
- run `npm install` if it only affects repo-local `node_modules`
- run `npm run build`
- run `npm run test:parser`
- run `npm run audit:layout`
- run `npm run audit:responsive`
- run repo-local ingest, parsing, and cache generation in dry-run or local mode
- fetch public GitHub data relevant to the Website repo and `Zer0pa` public repos
- update repo-local CLAW state, logs, handoffs, and plans
- generate candidate product-page rollouts inside lane worktrees

## Gated Actions

These must stay gated until explicitly promoted:

- pushing to GitHub
- opening or merging PRs
- writing to `main`
- tagging releases
- writing to production Sanity
- deployment to production infrastructure
- machine-wide installs via Homebrew, global `npm`, global `pip`, Unity, Blender, or similar
- modifying `.codex/`, shell startup files, LaunchAgents, cron, or global services
- touching repos other than Website

Inference: the correct first autonomous mode is local-only recursive improvement. Remote write access should come later.

## Install Rules

- repo-local `npm install` is autonomous
- repo-local dev dependencies are autonomous if they are required by the current lane
- anything that changes global machine state is gated
- new heavyweight tools require an ops note stating why the current stack is insufficient

## Network Rules

- allow read-only access to GitHub, npm, documentation, and reference sources needed for the Website repo
- allow fetching public `Zer0pa` repo data needed for lane truth
- block autonomous login automation into third-party accounts
- block autonomous writes to external services until the guarded-local loop is stable

## GitHub Rules

- current safe default: local commits only
- all autonomous work stays on `codex/*` branches
- no autonomous writes to unrelated repos
- no direct writes to `main`
- promotion to remote requires a gated review step

## State, Logs, And Checkpoints

The control plane should maintain four artifact classes:

- `state`
  - current phase
  - active lane assignments
  - locks
  - blocked items
  - promotion queue
- `handoffs`
  - short lane-to-orchestrator reports after each cycle
- `checkpoints`
  - accepted local stability points with commit IDs and audit verdicts
- `logs`
  - machine-readable execution history and failure notes

Canonical control files:

- `CLAW/control-plane/agent-lanes.json`
- `CLAW/control-plane/cadence.json`
- `CLAW/control-plane/state.template.json`
- `CLAW/control-plane/runtime-state.schema.json`
- `CLAW/control-plane/artifact-contract.md`
- `CLAW/control-plane/recursive-improvement.json`

Every lane cycle must emit:

- goal
- files touched
- commands run
- preflight baseline
- postflight metrics
- result
- regression risk
- next recommended action
- learning captured

## Machine-Readable Config

Use these repo-local files as the machine-readable control surface:

- `CLAW/control-plane/state.template.json`
- `CLAW/control-plane/agent-lanes.json`
- `CLAW/control-plane/cadence.json`
- `CLAW/control-plane/runtime-state.schema.json`
- `CLAW/control-plane/artifact-contract.md`

## Recovery Model

Recovery must prefer containment over heroics.

### Lane Failure

- keep the last good lane commit
- record the failure in lane log
- if needed, recreate the lane worktree from the last accepted commit

### QA Failure

- reject promotion
- return the failure artifact to the originating lane
- do not "fix in integration"

### Control Plane Failure

- stop new lane assignments
- keep current worktrees intact
- recover from the most recent accepted checkpoint and handoff set

### Machine Stress

- serialize heavy jobs more aggressively
- reduce active lane count
- keep browser and build locks exclusive

## Press-Go Standard

The system is ready for a safe autonomous local run only when:

- all worktrees are clean and lane-mapped
- the lane rules are written and available in-repo
- the state template exists
- the orchestrator can assign work without improvising scope
- one supervised cycle completes end-to-end
- that supervised cycle proves the evaluator can reject a worse candidate and preserve the better one
- one recovery drill is proven
- full QA runs complete from the integration lane
