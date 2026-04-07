# Runbook 03: Mathematical Lawset Maintenance

## Objective

Keep the GGD mathematical layer explicit, versioned, testable, and deeply bound to website verification.

## Scope

This runbook governs:

- equation engine binding
- local lawset index
- route-shell laws
- typography scale laws
- contrast and color laws
- dimensional integrity of constants and tokens

Primary files:

- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/project.binding.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/commands.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/GGD/equations/lawsets.json`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/scripts/verify-ggd-binding.mjs`
- `/Users/zer0palab/Zer0pa Website/Website-main/CLAW/control-plane/runner-policy.json`
- `/Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py`

## Law Maintenance Principles

1. Every lawset must declare role, kind, constants, and constraints.
2. Every constant must carry a clear dimensional meaning.
3. Example lawsets are not enough; repo-local lawsets must represent the active website system.
4. Measurement may detect failure, but lawsets must state what should be true before measurement.
5. If a route depends on a law, the law must be addressable from the local lawset index.
6. A route bundle is still law-shallow if it never executes the repo-local lawset it claims to govern.

## Step Sequence

### Step 1: Verify binding integrity

Run:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
node ../CLAW/scripts/verify-ggd-binding.mjs
```

The check must confirm:

- the equation engine path resolves
- the function catalog resolves
- the local lawset index resolves
- every local lawset passes engine validation
- required route roles are covered
- required kinds are covered

If any check fails, stop and repair binding before changing route work.

### Step 2: Audit lawset coverage

Inspect the local index and classify coverage:

- route shell
- layout grid
- spacing
- typography scale
- color/contrast
- responsive limiting cases
- route-family specializations

Any missing class is a coverage gap, not a minor note.

### Step 3: Check dimensional integrity

For each new or changed constant, ask:

1. What unit family does it belong to?
2. What invariant does it preserve?
3. What other equations depend on it?
4. What limiting case should still hold?

Reject constants whose only justification is screenshot fit.

### Step 4: Validate limiting cases

For each lawset change, test at least:

- minimum supported viewport
- flagship desktop viewport
- largest routine desktop viewport
- one stress case where density is high

If the law passes only on one reference viewport, it is not mature enough.

### Step 5: Bind laws into verification

Confirm that verification surfaces consume the lawsets rather than merely coexisting with them.

Minimum required checks:

- binding verification is green
- route audits can identify which lawset a route family depends on
- reports reference law-derived constraints where applicable
- runner salvage relies on repo-local law verification, not only upstream examples

If route audits remain measurement-only, record the system as law-shallow.

### Step 6: Version and explain

For every accepted lawset change, preserve:

- changed constants
- changed constraints
- reason for change
- routes affected
- verification bundle rerun

Do not accept silent equation drift.

## Rejection Criteria

Reject the change if any of the following is true:

- a constant has no explicit role
- a lawset cannot be executed by the engine
- a route family has no corresponding lawset
- a contrast rule exists only as prose
- the change weakens determinism in exchange for screenshot similarity

## Safe Next Actions

Use only one:

- `add lawset`
- `tighten lawset`
- `bind audit to lawset`
- `remove stale lawset`
- `freeze until evidence exists`
