# Runbook 02: Falsification and Evidence Reduction

## Objective

Reduce conflicting claims into a single current truth surface derived from artifacts, not opinion.

## Entry Conditions

1. Runbook 01 has identified `YELLOW`, `RED`, or `BLACK`.
2. The operator knows which claim or subsystem is suspect.
3. No root promotion occurs during this runbook.

## Reduction Rule

Truth precedence is:

1. Fresh executable verification output
2. Fresh report artifact tied to a run
3. Fresh uncontaminated handoff with precise evidence references
4. Runtime summaries and manifests
5. Human prose

If two layers disagree, the higher layer wins until the lower layer is regenerated.

## Step Sequence

### Step 1: Name the disputed proposition

Write the proposition in one line only.

Valid examples:

- `runtime.latest_audits.contrast is trustworthy`
- `/imc is canonical at root`
- `queue.active is synchronized with runtime.queue.active`
- `work-xr.breakpoint-gap is authoritative`

If the proposition cannot be written in one sentence, split it into separate claims.

### Step 2: Gather the minimum falsification set

Collect only the artifacts needed to prove or disprove the claim:

```bash
rg -n "contrast|canonical|queue|root|checkpoint|gap|progress" "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane"
find "/Users/zer0palab/Zer0pa Website/Website-main/deterministic-design-system/reports" -type f | sort
ls -lt "/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runtime/handoffs" | head -n 20
```

Then read the exact files, not summaries about them.

### Step 3: Reduce to a contradiction table

For each proposition, produce:

- claim source
- claim timestamp
- evidence source
- evidence timestamp
- contamination verdict
- verdict: `supported`, `falsified`, or `underspecified`

If timestamps are missing, verdict is automatically `underspecified`.

If a handoff includes unauthorized writes or route-external shared-artifact bleed, mark contamination explicitly.

### Step 4: Regenerate executable truth

Prefer executable re-checks over interpretation.

Examples:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run claw:validate
npm run claw:health
npm run claw:test:contracts
npm run claw:test:systems-optimizer
npm run claw:progress
node ../CLAW/scripts/verify-ggd-binding.mjs
```

For route truth, regenerate route-specific audits from the site and reports stack instead of relying on checkpoint prose.

### Step 5: Decide the reduced verdict

Use exactly one:

- `TRUE`: executable evidence supports the proposition
- `FALSE`: executable evidence falsifies the proposition
- `UNKNOWN`: evidence exists but does not resolve the proposition
- `STALE`: lower-confidence summaries need regeneration
- `QUARANTINED`: the evidence source exists but is contaminated and cannot remain authoritative

### Step 6: Record the smallest safe next action

Allowed outputs:

- `regenerate report`
- `open blocker`
- `export gap`
- `recertify route`
- `repair reducer`
- `hold promotion`
- `quarantine contaminated gap`

Do not mix more than one output unless the first output is `hold promotion`.

## Fail-Closed Rules

1. `UNKNOWN` is not permission to continue.
2. `STALE` is not permission to promote root.
3. `QUARANTINED` is not permission to optimize against the artifact.
4. If evidence packet assembly requires interpretation across multiple stale layers, hold the system and repair the reducer first.
5. A claim without timestamped evidence cannot graduate above `UNKNOWN`.

## Required Deliverable

Leave behind a deterministic reduction note containing:

- disputed proposition
- winning evidence file paths
- losing evidence file paths
- contamination verdict
- reduced verdict
- exact next action
