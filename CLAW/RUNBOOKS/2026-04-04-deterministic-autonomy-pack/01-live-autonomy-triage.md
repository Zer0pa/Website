# Runbook 01: Live Autonomy Triage

## Objective

Determine whether the live CLAW machine is safe to continue, must pause, or requires controlled recovery.

## Entry Conditions

1. Operator has shell access.
2. The daemon must remain intact during inspection.
3. No existing files are edited during triage.

## Step Sequence

### Step 1: Establish current working truth

Run:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run claw:autonomy:status
npm run claw:health
npm run claw:validate
npm run claw:test:contracts
npm run claw:test:systems-optimizer
npm run claw:progress
node ../CLAW/scripts/verify-ggd-binding.mjs
```

Record:

- timestamp
- active cycle id
- active job id
- daemon pid
- runner mode
- `press_go`
- clean or not clean for each command

### Step 2: Read state surfaces directly

Inspect:

```bash
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/state/runtime-state.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/press-go.manifest.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/GGD/state.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/agent-lanes.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runner-policy.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/checkpoints/current.json"
```

Confirm:

- runtime and GGD agree on active root and cycle identity
- lane ownership is singular for the active job
- runner policy remains fail-closed
- checkpoint state is not older than the latest material handoff
- progress packets exist for the monitored routes

### Step 3: Compare summaries to evidence

List recent handoffs and reports:

```bash
ls -lt "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs" | head
find "/Users/zer0palab/Zer0pa Website/Website-main/deterministic-design-system/reports" -type f | tail -n 40
```

For each red or green summary in runtime state, ask:

1. Is there a newer handoff that contradicts it?
2. Is there a newer report artifact that contradicts it?
3. Is the claim machine-derived or hand-written?
4. Is the handoff itself contaminated by unauthorized writes or shared-artifact bleed?

If any answer is uncertain, classify the summary as untrusted.

### Step 4: Decide system status

Assign one status only:

- `GREEN`: all baseline commands clean and no contradictions found
- `YELLOW`: daemon healthy but one or more truth surfaces are stale or underspecified
- `RED`: validation, health, or contradiction checks fail; promotion must stop
- `BLACK`: daemon, queue, checkpoint, or root identity cannot be trusted

### Step 5: Fail-closed response

Apply the first matching branch:

1. If `GREEN`, continue supervised operation only.
2. If `YELLOW`, open falsification work and forbid root promotion.
3. If `RED`, preserve daemon state, stop promotion decisions, and move to Runbook 02.
4. If `BLACK`, preserve logs, do not improvise, and move to Runbook 04.

## Hard Stop Conditions

Stop triage and escalate if any of the following is true:

- `claw:health` or `claw:validate` cannot run
- active queue identity is missing
- active lane lease is ambiguous
- runtime claims a pass that newer evidence falsifies
- a route gap comes from a contaminated handoff but is still being treated as authoritative
- operator is tempted to promote root using narrative instead of reports

## Required Evidence Packet

Before leaving triage, produce a packet with:

- exact command timestamps
- exact failing command names
- exact contradictory files
- exact active cycle and job ids
- exact contaminated handoffs or gap files, if any
- assigned status code: `GREEN`, `YELLOW`, `RED`, or `BLACK`
