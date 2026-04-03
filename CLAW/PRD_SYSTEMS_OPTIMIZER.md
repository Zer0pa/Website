# PRD Systems Optimizer

## Goal

Introduce a dedicated bounded engineer whose job is to improve the GGD and CLAW machine itself through repeatable evaluator-optimizer ratchets, without broadening into uncontrolled self-modification.

## Core Pattern

Each systems-optimizer slice must follow one loop:

1. state one hypothesis
2. state one writable scope
3. state one evaluation bundle
4. make one bounded system change
5. run the evaluation bundle
6. keep only if the machine is measurably better and all guards remain green
7. otherwise reject, record the learning, and revert or discard

## Writable Scope

Default allowed scope:

- `CLAW/scripts/**`
- `CLAW/control-plane/**/*.json`
- `CLAW/control-plane/**/*.md`
- `CLAW/control-plane/**/*.schema.json`
- `CLAW/PRD*.md`
- `GGD/**`
- `.agents/skills/get-geometry-done/**`
- `AGENTS.md`

Forbidden without an explicit broader contract:

- `site/src/app/**`
- `site/src/components/**`
- `site/src/lib/data/**`
- `site/src/lib/product-kernel/**`

## Evaluation Bundle

Required:

- `npm run claw:validate`
- `npm run claw:test:contracts`
- `npm run claw:test:systems-optimizer`
- `npm run claw:health`
- `node ../CLAW/scripts/verify-ggd-binding.mjs`
- `python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py check-lawset --lawset /Users/zer0palab/Get-Geometry-Done/ggd/shared/example-lawset.json`

Optional when directly relevant:

- `npm run audit:geometry-law -- <route>`
- `npm run audit:quality`
- `npm run audit:responsive`

## Success Definition

A system slice may be kept only when:

- the writable scope was respected
- required evaluation commands passed
- determinism, safety, measurability, or autonomous stability improved in a concrete way
- the slice is documented in the systems-optimizer state and backlog

## Initial Backlog Themes

- recurring XR geometry and breakpoint failures should become stricter laws or better prompts
- the command surface should remain explicit, installable, and equation-aware
- recovery and queue health should fail closed
- route-independent evaluators should get stronger before route-autonomy gets looser
