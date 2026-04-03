# Autonomous Execution Engine

## Purpose

This is the local execution layer that turns the CLAW doctrine into a real machine process on this Mac.

It is intentionally local-first:

- no remote pushes
- no production writes
- no unrelated repo access
- no shell-wide customization outside the explicitly installed local runner service

## Execution Model

The machine runs as a deterministic queue executor over the existing lane topology.

For each tick:

1. validate the control plane
2. recover stale locks if necessary
3. materialize a cycle when no active cycle exists
4. select the next queued lane job
5. generate a written brief and prompt snapshot
6. invoke `codex exec` non-interactively in the lane worktree
7. enforce write-scope and cleanliness rules after execution
8. finalize any accepted lane commit from the host runner when needed
9. capture a structured handoff
10. update runtime state, queue state, and phase progress

This means the system no longer depends on conversational memory to continue.

Authoritative machine policy:

- `CLAW/control-plane/runner-policy.json`

## Deterministic Guarantees

- all lane jobs are prompted from machine-written briefs
- all final lane outputs must match a JSON schema
- every lane run records prompt, logs, final response, and handoff
- write scope is checked against the lane's declared allowed writes
- the host runner is the final commit authority when lane sandboxing or git topology requires it
- dirty or unauthorized lane output is rejected and rolled back to the pre-run commit
- the queue advances only from recorded results

## Prompt Contract

Each lane receives:

- current phase and cycle identity
- its exact objective and acceptance rules
- allowed write paths
- authority commit and runner policy
- stop conditions
- predecessor handoff summaries
- the deterministic doctrine for geometry, truth, and falsification

Each lane must return:

- a structured status
- exact files changed
- exact commands run
- preflight baseline
- postflight metrics
- known risks
- learning captured
- a lane-local commit hash or `null`

The runner may replace `null` with a host-finalized commit after validating the candidate diff.

## Mac Service

The loop can be started manually or through `launchd`.

The `launchd` service:

- runs repo-local autonomy scripts
- writes logs inside the repo
- survives logout and sleep/wake cycles better than a terminal session

Authoritative service files:

- `CLAW/services/autonomy/com.zer0palab.claw-autonomy.plist`
- `CLAW/services/autonomy/README.md`

## Safety Posture

This service is an explicit operator-authorized local override.

It does **not** imply that `press_go` is true.

Truthful status:

- local guarded recursion may run
- unattended production autonomy is still gated
- remote writes remain gated

## Operator Entry Points

From `site/`:

```bash
npm run claw:autonomy:status
npm run claw:autonomy:once
npm run claw:autonomy:loop
npm run claw:autonomy:install-service
npm run claw:autonomy:uninstall-service
```
