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
