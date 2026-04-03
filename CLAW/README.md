# CLAW

This folder is the repo-local control plane for the autonomous Zer0pa website system.

## Purpose

Keep long-running website work deterministic, bounded, and recoverable.

## Authority Hierarchy

- [`PRD_24_7_LOCAL_AUTONOMY.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/PRD_24_7_LOCAL_AUTONOMY.md): canonical control-plane PRD
- [`go-live-docs/GO_LIVE_PRD.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/GO_LIVE_PRD.md): canonical site and product go-live PRD
- [`AUTONOMOUS_RUNBOOK.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_RUNBOOK.md): supervised execution procedure
- [`RUNBOOK_PERPETUAL_OPERATION.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/RUNBOOK_PERPETUAL_OPERATION.md): unattended local operation procedure
- [`control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md) and [`control-plane/recursive-improvement.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/recursive-improvement.json): loop policy
- [`control-plane/cadence.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/cadence.json), [`control-plane/agent-lanes.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/agent-lanes.json), and [`control-plane/runtime-state.schema.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/runtime-state.schema.json): machine authority

## Read Order

1. [`GET_GEOMETRY_DONE_PROGRAM.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/GET_GEOMETRY_DONE_PROGRAM.md)
2. [`AUTONOMOUS_CLAW_ARCHITECTURE.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_CLAW_ARCHITECTURE.md)
3. [`AUTONOMOUS_CONTROL_PLANE.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_CONTROL_PLANE.md)
4. [`AUTONOMOUS_RUNBOOK.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/AUTONOMOUS_RUNBOOK.md)
5. [`PRD_24_7_LOCAL_AUTONOMY.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/PRD_24_7_LOCAL_AUTONOMY.md)
6. [`control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/RECURSIVE_SELF_IMPROVEMENT_PROTOCOL.md)
7. [`RUNBOOK_PERPETUAL_OPERATION.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/RUNBOOK_PERPETUAL_OPERATION.md)

## Machine-Readable Inputs

- [`control-plane/agent-lanes.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/agent-lanes.json)
- [`control-plane/cadence.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/cadence.json)
- [`control-plane/state.template.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/state.template.json)
- [`control-plane/runtime-state.schema.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/runtime-state.schema.json)
- [`control-plane/artifact-contract.md`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/artifact-contract.md)
- [`control-plane/recursive-improvement.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/recursive-improvement.json)
- [`control-plane/plans/24x7-hardening-plan.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/plans/24x7-hardening-plan.json)
- [`control-plane/state-machine.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/state-machine.json)
- [`control-plane/press-go.manifest.json`](/Users/zer0palab/Zer0pa%20Website/Website-main/CLAW/control-plane/press-go.manifest.json)
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
