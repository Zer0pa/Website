# Local Autonomy Service

## Purpose

This is the machine-local runner for the Zer0pa Website CLAW system.

It exists so the system can keep executing bounded lane jobs on this Mac without an open terminal or an active chat session.

## Mode

This service is a guarded local override.

It does **not** mean:

- `press_go` is true
- production writes are allowed
- unrelated repos may be touched

It does mean:

- the queue can keep executing locally
- lane prompts are generated from the control plane
- Codex CLI can act as the workhorse inside each lane worktree

## Commands

From `site/`:

```bash
npm run claw:autonomy:status
npm run claw:autonomy:once
npm run claw:autonomy:loop
npm run claw:autonomy:install-service
npm run claw:autonomy:uninstall-service
```

## Files

- runner state: `CLAW/services/autonomy/state.json`
- launchd plist template: `CLAW/services/autonomy/com.zer0palab.claw-autonomy.plist`
- runtime briefs: `CLAW/control-plane/runtime/briefs/`
- runtime handoffs: `CLAW/control-plane/runtime/handoffs/`
- runtime logs: `CLAW/control-plane/runtime/logs/`

## Safety

- each lane run is schema-constrained
- write scope is checked after execution
- unauthorized or dirty outputs are hard-reset to the pre-run commit
- the service only operates inside the Website repo and its worktrees
