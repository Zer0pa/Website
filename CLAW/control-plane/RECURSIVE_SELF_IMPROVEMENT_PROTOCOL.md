# Recursive Self-Improvement Protocol

## Purpose

Run the Website claws as a bounded evaluator-optimizer system, not as an unguided creative swarm.

The rule is simple:

1. choose one narrow slice
2. change it
3. measure it
4. keep it only if the evaluator agrees

This is the control pattern that should govern all autonomous work inside the Website repo.

## Research Basis

This protocol follows the broad pattern recommended in official or primary sources:

- OpenAI stresses starting simple, defining measurable success, and using evals as the optimization loop rather than trusting model intuition alone.
- Anthropic recommends evaluator-optimizer and workflow patterns when the task benefits from iterative improvement and objective checking.
- Playwright treats visual comparison and browser automation as first-class regression tools rather than late-stage polish.

Reference links:

- [OpenAI: A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [OpenAI platform docs: evaluation and best practices index](https://platform.openai.com/docs/guides/evals)
- [Anthropic: Building effective AI agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: Demystifying evals](https://www.anthropic.com/engineering/demystifying-evals)
- [Playwright: best practices](https://playwright.dev/docs/best-practices)
- [Playwright: visual comparisons](https://playwright.dev/docs/test-snapshots)

Inference from those sources: recursive improvement is only safe when every loop is measured, scoped, and rejectable.

## Deterministic Design Doctrine

Treat the website as geometry, typography, color, and data laws.

The mockups are not suggestions. They are the seed geometry.

Each route should be modeled as:

- grid law
- spacing law
- type scale law
- keyline and alignment law
- color token law
- component law
- data truth contract

Color should also be numeric and tokenized, not taste-driven. Layout should resolve from declared units, ratios, and constraints, not ad hoc visual improvisation.

Reference links:

- [Carbon Design System: 2x grid](https://carbondesignsystem.com/elements/2x-grid/usage/)
- [Design Tokens Community Group format spec](https://www.designtokens.org/TR/2025.10/format/)
- [WCAG 2.2: text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing)

Inference: the right implementation is a law-driven design system, not a prompt-driven aesthetic style.

## Operating Loop

### 1. Formulate

- pick exactly one route or subsystem
- define one bounded defect or fidelity target
- record current baseline metrics
- name the files allowed to change

### 2. Optimize

- let one implementation lane attempt one narrow change
- keep the attempt small enough to attribute wins and regressions
- do not mix canonical geometry work with unrelated content or data changes

### 3. Evaluate

Run the required checks:

- `npm run build`
- `npm run test:parser`
- `npm run audit:layout -- <route> --baseUrl=<lane-server>`
- `npm run audit:responsive -- --baseUrl=<lane-server>`

For a fidelity slice, the evaluator is authoritative.

### 4. Decide

- `accept` if critical and major remain zero and the route is measurably better
- `hold` if results are mixed and need another bounded attempt
- `reject` if any new critical or major appears
- `escalate` after two failed attempts on the same slice

### 5. Record

Every loop writes a handoff with:

- target slice
- files changed
- commands run
- before and after metrics
- regression risk
- next recommended action

No handoff means no promotion.

## Cadence

Use the slower cadence below on this Intel Mac:

- lane iteration: every 20 minutes
- orchestrator review: every 45 minutes
- full falsification sweep: every 120 minutes
- integration checkpoint review: every 4 hours
- recovery drill: every 12 hours during supervised rollout
- system health review: every 24 hours

These timings favor stability over activity volume.

## Gates

An autonomous candidate is promotable only if all are true:

- build passes
- parser passes
- layout has zero critical and zero major diffs
- minor diffs are lower or unchanged with better route fidelity
- responsive audit has no horizontal overflow
- the lane stayed inside its allowed files and route
- the handoff artifact is complete

`press_go` stays false until:

- one supervised end-to-end cycle passes
- one integration checkpoint passes
- one recovery drill passes
- one guarded local-autonomy window passes
- one extended local-autonomy window passes

## Stop Conditions

Stop the loop immediately when any of these occur:

- build failure
- parser failure
- new critical or major diff
- lane scope violation
- cross-repo write
- data-truth contradiction
- two failed attempts on the same slice

When stopped:

1. preserve the last good commit
2. record the failure
3. return the slice to orchestrator review

## Metrics

Primary metrics:

- critical diff count
- major diff count
- minor diff count
- responsive overflow count
- build pass rate
- parser pass rate

Secondary metrics:

- rollback count
- failed attempts per slice
- checkpoint acceptance rate
- time to first non-regressing candidate

The system is improving only if primary metrics hold or improve while the route remains truthful and stable.

## Current Route Order

1. `/`
2. `/imc`
3. product-family kernel
4. repo-backed product pages

The homepage and `/imc` remain the canonical laws. Product pages inherit from those laws after they are stable.
