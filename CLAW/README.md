# CLAW

This folder is the repo-local control plane for the autonomous Zer0pa website system.

## Purpose

Keep long-running website work deterministic, bounded, and recoverable.

## Read Order

1. [`GET_GEOMETRY_DONE_PROGRAM.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/GET_GEOMETRY_DONE_PROGRAM.md)
2. [`AUTONOMOUS_CLAW_ARCHITECTURE.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_CLAW_ARCHITECTURE.md)
3. [`AUTONOMOUS_CONTROL_PLANE.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_CONTROL_PLANE.md)
4. [`AUTONOMOUS_RUNBOOK.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_RUNBOOK.md)
5. [`control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md)
6. [`RUNBOOK_PERPETUAL_OPERATION.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/RUNBOOK_PERPETUAL_OPERATION.md)

## Machine-Readable Inputs

- [`control-plane/agent-lanes.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/agent-lanes.json)
- [`control-plane/cadence.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/cadence.json)
- [`control-plane/state.template.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/state.template.json)
- [`control-plane/runtime-state.schema.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/runtime-state.schema.json)
- [`control-plane/artifact-contract.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/artifact-contract.md)
- [`control-plane/recursive-improvement.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/recursive-improvement.json)
- [`control-plane/reports/W1-homepage-supervised.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/reports/W1-homepage-supervised.md)

## V1 Lanes

- `orchestrator`
- `homepage-fidelity`
- `imc-flagship`
- `product-family-kernel`
- `product-family`
- `data-truth`
- `systems-qa`
- `integration`

## Press-Go Rule

No unattended run is allowed until `press_go` is true in runtime state and the dry-run, QA, and recovery conditions in the runbooks have been satisfied.
