# PRD: Canonical Routes To Producing

## Status

- status: `active execution program`
- owner: `orchestrator`
- date: `2026-04-03`
- predecessor: `CLAW/PRD_24_7_LOCAL_AUTONOMY.md`

## Purpose

Get from the current hardening state to the next truthful milestone:

- homepage is canonically right
- one non-homepage route is canonically right
- one second generic product page proves replication
- the system is ready to automate controlled production work next

This PRD is not another architecture exercise. It is the execution bridge from hardening to producing.

## The Next Truthful Claim

The next conversation should be able to say, truthfully:

- the homepage matches the deterministic target closely enough to be treated as canonical
- `/imc` is closed as the flagship authority route
- one generic `/work/[slug]` page is right under the new kernel
- a second `/work/[slug]` page proves the kernel is replicable, not bespoke
- automation can now operate on a stable law set instead of chasing moving design targets

## Current Evidence

### Homepage

Best known local candidate is in `homepage-fidelity`:

- `0` critical
- `0` major
- `7` minor
- `5` cosmetic

Open homepage geometry zones:

- wordmark width
- hero heading height
- hero body height
- telemetry rail
- flagship media and summary vertical alignment
- system index vertical placement

### Flagship `/imc`

Current best visible state:

- `0` critical
- `0` major
- `8` minor
- `6` cosmetic

Open flagship geometry zones:

- hero meta X alignment
- hero title width
- hero identity and authority vertical placement
- evidence and repo-shape vertical placement
- CTA band vertical placement

### Generic Product Pages

The generic product-page system exists, but it is still one shared authority template:

- route: `site/src/app/work/[slug]/page.tsx`
- template: `site/src/components/lane/LaneAuthorityPage.tsx`

This means the system is structurally ready for replication, but not yet proven through a canonical product-family kernel.

### Packet Inventory

There are ten repo-backed packet candidates:

- `ZPE-FT`
- `ZPE-Geo`
- `ZPE-IMC`
- `ZPE-Ink`
- `ZPE-IoT`
- `ZPE-Mocap`
- `ZPE-Neuro`
- `ZPE-Prosody`
- `ZPE-Robotics`
- `ZPE-XR`

## Route Selection

### Canonical Homepage

Route:

- `/`

Why:

- it defines shell law, flagship placement, and top-level hierarchy

### Canonical Flagship

Route:

- `/imc`

Why:

- it is the flagship deep-dive and must not be flattened into the generic family

### First Generic Product Proof

Route:

- `/work/xr`

Why:

- `ZPE-XR` has one of the richest current packet surfaces
- it has high confidence and meaningful metrics, proof anchors, and non-claims
- it is a strong stress test for the family kernel without being the flagship

### Second Generic Replication Proof

Route:

- `/work/ft`

Why:

- `ZPE-FT` is materially different in tone and proof shape from `ZPE-XR`
- it is rich enough to prove the kernel generalizes
- it forces the system to handle a distinct evidence and non-claim profile

## Governing Rule

The homepage and `/imc` remain canonical law sources.

`/work/xr` is the first generic proof page.

`/work/ft` is the first replication page.

No other generic product pages should be treated as “done” until these two pass.

## Deliverable Stack

The execution program must produce:

- one accepted homepage checkpoint
- one accepted `/imc` checkpoint
- one accepted `/work/xr` checkpoint
- one accepted `/work/ft` checkpoint
- one product-family kernel law artifact
- one replication report showing what was inherited versus what was route-specific

## Workstreams

### Stream A: Homepage Closure

Owns:

- homepage shell closure
- hero closure
- flagship block placement on homepage
- homepage index and proof alignment

Primary lane:

- `homepage-fidelity`

### Stream B: Flagship Closure

Owns:

- `/imc` as a flagship route
- non-generic art direction under deterministic law
- flagship-only exception list

Primary lane:

- `imc-flagship`

### Stream C: Product Kernel Extraction

Owns:

- what is reusable from homepage and `/imc`
- what is family law versus flagship exception

Primary lane:

- `product-family-kernel`

### Stream D: Replication Proof

Owns:

- `/work/xr`
- `/work/ft`
- proof that the second page is inherited rather than hand-shaped

Primary lane:

- `product-family`

### Stream E: Truth And Falsification

Owns:

- packet sufficiency
- law compliance
- layout and responsive audits
- checkpoint evidence

Primary lanes:

- `data-truth`
- `systems-qa`
- `integration`

## Phases

### C1. Homepage Canonical Closure

Objective:

- reduce homepage from `7` minor to a tightly bounded near-zero residual set
- close the top seven open geometry zones without introducing macro drift

Exit criteria:

- two consecutive non-regressing homepage passes
- `0` critical
- `0` major
- no more than `3` minor diffs, all explicitly tolerated or understood
- responsive overflow remains zero
- accepted homepage candidate replayed through integration

### C2. Flagship IMC Canonical Closure

Objective:

- close `/imc` as the flagship authority page

Exit criteria:

- two consecutive non-regressing `/imc` passes
- `0` critical
- `0` major
- no more than `3` minor diffs, all explicitly tolerated or understood
- flagship exceptions documented as laws, not CSS accidents
- accepted `/imc` candidate replayed through integration

### C3. Product Kernel Lock

Objective:

- derive the generic product-page kernel only after homepage and `/imc` are stable enough

Required artifacts:

- kernel section grammar
- module-level geometry rules
- packet binding rules
- variant rules for generic product pages

Exit criteria:

- `/work/[slug]` law is explicit
- kernel is separate from `/imc` exceptions
- kernel is versioned and reviewable
- a product-kernel law audit exists for `/work/xr` and `/work/ft`
- continuation state and learned patterns are seeded for family rollout

`C3` is where the system stops rediscovering product-page rules and starts inheriting them. The kernel lock must therefore include machine-readable family laws, explicit flagship exceptions, a route-law verifier for `/work/[slug]`, and continuation artifacts that let later cycles resume from accepted law instead of from vague intent.

### C4. First Generic Product Proof: `/work/xr`

Objective:

- make `/work/xr` the first generic product page that is canonically right

Exit criteria:

- route renders from packet truth without bespoke hacks
- `0` critical
- `0` major
- no more than `3` minor diffs
- packet bindings remain honest
- route survives one integration replay

### C5. Second Replication Proof: `/work/ft`

Objective:

- prove the kernel generalizes

Exit criteria:

- `/work/ft` is produced from the same kernel with only declared variant rules
- `0` critical
- `0` major
- no bespoke route-only layout surgery outside variant rules
- differences between `/work/xr` and `/work/ft` are attributable to packet content or declared variants

### C6. Producing Readiness

Objective:

- make automation the next rational step

Exit criteria:

- homepage, `/imc`, `/work/xr`, and `/work/ft` all have accepted checkpoints
- kernel and exception boundaries are explicit
- recovery drill evidence is still current
- automation would be working on stable laws, not moving targets

## Acceptance Rules

Hard fail:

- new critical diff
- new major diff
- cross-repo write
- product page requires undeclared bespoke hacks
- packet truth is overridden by hand-authored authority content

Soft fail / hold:

- minor diff count does not improve and is not better understood
- route closes locally but fails in integration
- replication requires route-specific styling outside declared variant rules

## Required Artifacts

- `CLAW/control-plane/reports/C1-homepage-closure.md`
- `CLAW/control-plane/reports/C2-imc-closure.md`
- `CLAW/control-plane/reports/C4-work-xr-proof.md`
- `CLAW/control-plane/reports/C5-work-ft-replication.md`
- `CLAW/control-plane/checkpoints/*.json`
- `CLAW/control-plane/handoffs/*.json`

## Execution Order

1. close homepage
2. close `/imc`
3. lock the product kernel
4. close `/work/xr`
5. replicate to `/work/ft`
6. decide whether automation is now the correct next step

## Non-Goals

- finishing all ten product pages in this wave
- enabling unattended 24/7 autonomy before the canonical routes are closed
- redesigning the site beyond the deterministic picture architecture

## Expected Next Conversation

If this PRD succeeds, the next conversation should not be about architecture.

It should be about:

- the accepted homepage checkpoint
- the accepted flagship checkpoint
- the accepted first and second generic proof pages
- whether to turn the stable kernel loose on the remaining pages under controlled automation
