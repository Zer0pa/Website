# Opus Engineer

## What It Is

Opus Engineer is a persistent orchestrator lane in the CLAW autonomy cycle. It replaces the paused Codex pipeline as the primary driver of bounded website work: each cycle it picks the highest-priority open PRD or geometry gap, builds a scoped sub-agent prompt, invokes Claude Code as a sub-agent, captures the result, and writes a report.

## Why It Exists

The Codex CLI (`codex exec`) was the original operator interface for spawning lane agents. When Codex became unavailable or its pipeline was paused, the autonomy cycle lost its ability to dispatch bounded implementation work. Opus Engineer fills this gap by using the `claude` CLI (`claude --print`) as the sub-agent executor, operating under the same single-writer, commit-or-discard discipline as any other CLAW lane.

The `systems-optimizer` lane is currently parked during C4 (see `runner-policy.json`). Opus Engineer absorbs its role for bounded CLAW and GGD hardening while also being able to drive site implementation work (rescaffold pages, close geometry gaps, run QA verification) directly.

## How It Fits in the Autonomy Cycle

```
autonomy-once.mjs
  └─ nextRunnableJob(queue)
       └─ job.lane_id === "opus-engineer"
            └─ spawnCodexForJob()  (or runner.mjs standalone)
                 └─ laneExecutionRecipe("opus-engineer")
                      └─ "node CLAW/opus-engineer/runner.mjs"
                           ├─ loads runtime-state.json
                           ├─ picks highest-priority PRD / gap
                           ├─ selects prompt template from prompts/
                           ├─ spawns claude --print -p <prompt>
                           ├─ captures structured result
                           └─ writes CLAW/control-plane/reports/opus-engineer/<cycle>.md
```

Opus Engineer appears in `CLAW/control-plane/agent-lanes.json` and `CLAW/control-plane/cycle-templates.json` but is **gated off by default** (`enabled: false` in `runner-policy.json`). To activate it:

1. Create a dedicated worktree: `git worktree add /Users/zer0palab/Zer0pa\ Website/worktrees/opus-engineer codex/opus-engineer`
2. Update `CLAW/control-plane/agent-lanes.json` → `opus-engineer.worktree` to the new path
3. Set `activation_overrides["opus-engineer"].enabled` to `true` in `CLAW/control-plane/runner-policy.json`

## Safety Fence

Writable scope is strictly bounded:

```
site/src/app/**
site/src/components/**
CLAW/opus-engineer/**
CLAW/control-plane/reports/opus-engineer/**
```

Opus Engineer **must not** write to:
- `CLAW/control-plane/queue/**`
- `CLAW/control-plane/runtime/**`
- `CLAW/control-plane/locks/**`
- `CLAW/control-plane/state/runtime-state.json`
- `CLAW/scripts/**` (use systems-optimizer for runner improvements)
- Any path outside the declared writable scope

Sub-agents spawned by runner.mjs inherit the same scope constraint. Any sub-agent attempt to commit outside the scope must be detected and rejected.

## Design Decisions

1. **Worktree**: the lane entry in `agent-lanes.json` temporarily points to the main project root (same as `orchestrator`) so control-plane validation passes while the lane is scaffolded but no dedicated worktree has been created. Update the path when you create the worktree.

2. **lane.json format**: matches the shape of an entry in `agent-lanes.json` (the project's single source of truth for lane config) with additional `inputs`, `outputs`, and `decision_policy` fields for self-documentation.

3. **Executor**: runner.mjs uses `claude --print` (Claude Code CLI) rather than `codex exec` so it works when Codex is unavailable. Swap `resolveClaudeBin()` for `resolveCodexBin()` when Codex is restored.

4. **Recipe in autonomy-once.mjs**: the `laneExecutionRecipe` switch in `autonomy-once.mjs` includes an `opus-engineer` entry that tells the Codex/Claude sub-agent to invoke `node CLAW/opus-engineer/runner.mjs`. This keeps the orchestration layer consistent with other lanes.

## Lessons Baked In (2026-04-07)

Three production failure patterns were diagnosed on 2026-04-07 and addressed in this revision.

### Refinement 1 — Trust the build, not the audit

**Problem:** Sub-agents were triggered by `npm ls` / `npm audit` warnings about unresolved peer deps (specifically `lightningcss` native binaries) and treated those warnings as proof that the environment was broken. Each agent independently rescaffolded large sections of the site when `npm run build` would have succeeded without any code changes.

**Fix:** Every prompt template now opens with a mandatory **PRE-FLIGHT** block that runs `npm run build` first. If the build passes, all audit warnings are explicitly labelled lies and ignored. Only a real build failure justifies code changes. See `decision-policy.md § Audit lies` for the full rule.

### Refinement 2 — Lane lock for file-scoped work

**Problem:** Multiple sub-agents were dispatched in parallel to the same routes (e.g. `/imc`) because each agent's prompt was scoped per-page and agents had no visibility into other live worktrees. Three concurrent rescaffolds of the same file produced merge conflicts and wasted cycles.

**Fix:** `CLAW/opus-engineer/lib/lane-lock.mjs` inspects all live git worktrees via `git worktree list --porcelain` and identifies which ones have unmerged commits touching a given file or route. `runner.mjs` calls this before dispatching any `geometry-gap` or `route-progress` task; if the path is contested, the task is **skipped this cycle** and the runner emits a `hold` report instead of spawning a sub-agent. All three prompt templates also include a "check before you write" lane-lock reminder for dispatched sub-agents. Smoke test: `node CLAW/opus-engineer/lib/lane-lock.test.mjs` (66 assertions, all passing).

### Refinement 3 — Phase-scoped batch template

**Problem:** When 2+ tasks at the same priority tier targeted independent routes, the runner spawned N parallel single-task sub-agents. Each fresh context re-read the same files, ran its own build, and produced N commits and N reports. Token cost scaled linearly with N.

**Fix:** New template `prompts/phase-batch.md` tells a single sub-agent to fix N routes sequentially in one session, committing once per route and running a single final build verification. `decision-policy.md` now says: if 2+ tasks at the same priority tier touch independent files, prefer `phase-batch` over parallel single-task dispatch. The template includes: pre-flight (R1), per-route lane-lock check (R2), Stitch doctrine, worktree-commit reminder, and structured JSON output with a `batch_results` array.
