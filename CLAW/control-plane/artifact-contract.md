# Artifact Contract

## Required Per Lane Cycle

Every autonomous lane cycle must emit:

- lane id
- task id or bounded goal
- files changed
- commands run
- preflight baseline
- postflight metrics
- claimed improvement
- known risks
- recommended next action

If a cycle does not emit a handoff, it is not promotable.

## Required Per QA Verdict

Systems QA must emit:

- candidate branch or commit
- build result
- parser result
- layout result
- responsive result
- regression delta versus baseline
- regression summary
- accept or reject recommendation

## Required Per Integration Checkpoint

Integration must emit:

- assembled commit list
- rollback point
- full-stack QA verdict
- current best checkpoint status
- open blockers

## Canonical Site Artifacts

The control plane depends on these deterministic artifacts:

- `deterministic-design-system/maps/reference/**`
- `deterministic-design-system/maps/live/**`
- `deterministic-design-system/maps/diff/**`
- `deterministic-design-system/reports/**`

## Press-Go Evidence Bundle

The minimum bundle required before unattended launch is:

- clean worktree map
- current state template
- one supervised dry-run handoff set
- one accepted integration checkpoint
- one successful full QA bundle
- one recorded recovery drill
