# Runbook 04: Checkpoint and Root-Promotion Recovery

## Objective

Recover control-plane trust when checkpoint, queue, or promotion state drifts from evidence.

## Entry Conditions

1. Runbook 01 produced `BLACK`, or
2. root promotion status is ambiguous, or
3. checkpoint truth disagrees with live handoffs or reports

## Non-Negotiable Rules

1. Preserve daemon processes unless a documented recovery step requires otherwise.
2. Never force root promotion from intuition.
3. Never discard another operator's or agent's unrelated work.
4. Recovery must end in a single authoritative checkpoint and a single authoritative root claim.

## Step Sequence

### Step 1: Freeze promotion decisions

Until recovery completes, treat all promotion requests as denied.

Confirm current policy and state:

```bash
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runner-policy.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/checkpoints/current.json"
sed -n '1,260p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/state/runtime-state.json"
sed -n '1,220p' "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/press-go.manifest.json"
```

### Step 2: Identify the authoritative timeline

Build an ordered timeline from:

```bash
ls -lt "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs" | head -n 30
ls -lt "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/queue" | head -n 30
git -C "/Users/zer0palab/Zer0pa Website/Website-main" log --oneline -n 20
```

Record:

- latest checkpoint timestamp
- latest handoff timestamp
- latest root-affecting commit
- latest queue mutation

If ordering cannot be established, recovery status remains `BLACK`.

### Step 3: Reconcile identities

Check whether these identities agree:

- active cycle id
- active job id
- queue active path
- checkpoint cycle id
- runtime root branch or commit
- latest promoted root commit

If any identifier forks into two candidates, do not choose manually. Mark `identity split`.

### Step 4: Rebuild the smallest trusted state

Trusted rebuild precedence:

1. current executable checks
2. latest coherent uncontaminated handoff
3. latest coherent checkpoint
4. latest coherent queue state

If checkpoint and handoff disagree, prefer the one backed by successful executable verification.

If a shared-artifact rerun touched multiple routes, invalidate the checkpoint across every affected route, not only the trigger route.

### Step 5: Decide recovery outcome

Use exactly one:

- `resume`: all identities reconcile and validation is green
- `hold`: identities reconcile but one or more validations are red
- `repair`: identities do not reconcile but sufficient evidence exists to patch reducers or state generation
- `escalate`: insufficient evidence to recover safely

### Step 6: Re-entry gate for promotion

Root promotion may resume only when all are true:

1. `npm run claw:health` is clean
2. `npm run claw:validate` is clean
3. current checkpoint is newer than or equal to the latest material handoff
4. active queue identity matches runtime queue identity
5. route or system promotion claim is backed by current reports
6. escalated cycles have no leftover `queued` jobs without explicit cancellation or rematerialization

If any item is false, promotion remains blocked.

## Recovery Artifacts

Before leaving this runbook, prepare:

- authoritative timeline
- identity reconciliation table
- recovery outcome
- exact blocker list
- exact re-entry gate state

## Failure Modes to Watch

- stale checkpoint pretending to be current
- runtime summary ahead of route evidence
- queue state disappearing while runtime still references it
- root promotion commit existing without current supporting reports
- handoff discipline broken by missing timestamps or missing evidence paths
- cycle report says `escalated` while downstream jobs remain `queued`
