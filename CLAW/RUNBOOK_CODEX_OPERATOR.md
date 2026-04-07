# Codex Operator Runbook

## Purpose

Codex is the operator interface for this system until a separate remote control surface is both necessary and safely proven.

This runbook is for supervised recursive operation.

It is not permission for unattended automation.

## What Codex Owns

- planning the next bounded cycle
- asking specialist lanes and subagents to inspect or falsify
- deciding whether a result is accepted, rejected, or rolled back
- updating the control-plane artifacts
- keeping the system inside repo scope

## What Codex Must Not Claim

- do not claim `press_go` is ready unless the evidence manifest says so
- do not claim a route is done because it merely builds
- do not treat the mockup as optional inspiration
- do not skip quality, responsive, or contrast gates once those reports exist

## Operator Loop

1. Read state

```bash
cd /Users/zer0palab/Zer0pa Website/Website-main/site
npm run claw:validate
npm run claw:health
```

2. Read the current execution contracts

- `CLAW/PRD_CANONICAL_ROUTES_TO_PRODUCING.md`
- `CLAW/PRD_DETERMINISTIC_RECURSIVE_PRODUCTION.md`
- `CLAW/control-plane/plans/canonical-routes-to-producing.json`
- `CLAW/control-plane/plans/deterministic-recursive-production.json`

3. Run the bounded slice

- route work stays in the owning lane
- systems QA runs falsification
- integration replays accepted candidates only

4. Run the quality stack when relevant

```bash
npm run lint
npm run audit:quality -- --baseUrl=http://127.0.0.1:3006
npm run audit:contrast -- --baseUrl=http://127.0.0.1:3006
npm run audit:responsive -- --baseUrl=http://127.0.0.1:3006
```

5. Decide

- accept
- reject
- rollback
- defer for another bounded slice

6. Update evidence

- checkpoint files
- runtime state
- reports
- press-go manifest

## Page Squad Use

When a page matters, treat it as a squad problem rather than a lone implementation problem.

Use:

- one owning writer lane
- parallel falsifiers and auditors
- one explicit integration checkpoint

## Readiness Rule

The truthful readiness ladder is:

1. supervised recursive work
2. guarded local automation
3. extended local automation
4. only then unattended operation

Current mode remains level 1 until the state and evidence say otherwise.
