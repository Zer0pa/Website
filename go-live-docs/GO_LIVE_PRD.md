# ZER0PA Site Go-Live PRD

**Version:** 1.0  
**Date:** 2026-03-27  
**Working Directory:** `/Users/zer0palab/Zer0pa Website/Website-main`  
**Applies To:** `site/` implementation and associated GitHub/Sanity data flow

## 1. Governing Objective

Ship `zer0pa.ai` as a proof-first authority surface that matches the attached reference designs and renders live repo-derived truth without hype, silent editorial rewriting, or fake pass-state narratives.

This is not a generic product website.

This is the public authority surface for Zero-Point Architecture.

## 2. Sovereign Acceptance Gate

The work is only considered complete when all of the following are true:

1. The homepage and lane pages visually match the attached references in layout grammar, typography, tone, density, and overall atmosphere.
2. Public GitHub repo content is driving the truth surfaces that are supposed to update when repo copy changes.
3. Sanity is augmenting editorial composition, not overwriting authority facts.
4. Required routes are implemented and coherent:
   - `/`
   - `/imc`
   - `/work`
   - `/work/[slug]`
   - `/proof`
   - `/about`
   - `/contact`
5. The site clearly separates:
   - what is proved
   - what is not claimed
   - what remains open, staged, or blocked

Anything less is not a pass.

## 3. Current State Snapshot

### Already Done

- Next.js site exists and builds.
- Local dev server runs.
- Homepage and work pages render live lane packets.
- Public repo ingest works.
- Parser quality is improved enough to produce differentiated lane states.

### Not Yet Done

- The visual implementation is not yet close enough to the attached references.
- `/imc`, `/proof`, `/about`, and `/contact` are not complete routes.
- The parser still needs a final cleanup pass on packet verbosity and normalization.
- The final operational boundary between GitHub truth and Sanity editorial needs to be enforced by documentation and runbooks.

## 4. Non-Negotiables

### 4.1 Visual

- Background: pure black `#000000`
- Mastheads/wordmarks: Oswald Regular or Medium, all caps
- All other text: Courier or equivalent monospace
- Palette: black, grey, white only
- White is rare and meaningful
- No gradients
- No cyberpunk decoration
- No decorative particles
- No generic SaaS cards
- No softened startup polish

### 4.2 Product

- Evidence first
- Architecture second
- Philosophy third
- Radical honesty always visible
- Repo truth is not replaced by manual code constants
- Public repos do not automatically imply a success narrative

### 4.3 Process

- Never optimize for narratable progress instead of the actual acceptance gate
- Never hide parser uncertainty behind better-looking UI copy
- Never mark incomplete routes or incomplete truth surfaces as "done"

## 5. Authoritative Design Direction

The attached homepage and lane-page screenshots are the canonical target.

They establish:

- exact atmosphere
- typographic hierarchy
- negative space
- modular evidence composition
- navigation weight
- footer treatment
- lane-page section order

If implementation decisions conflict with those references, the references win unless the user explicitly changes them.

## 6. Required Route Contracts

## `/`

Must include, in order:

1. Hero
2. Flagship authority block for `ZPE-IMC`
3. System components / work constellation
4. Proof logic
5. Operations footer

May include an architecture explainer layer if it supports the reference design without breaking its rhythm.

## `/imc`

Must be a flagship deep-dive page for `ZPE-IMC`, not just an alias of `/work/imc`.

It must present the flagship narrative with the same proof-first grammar as the reference lane page, but with stronger composition and more room for IMC-specific authority framing.

## `/work`

Must be the constellation index of lanes with live state, short descriptor, and bounded access into each lane.

## `/work/[slug]`

Reusable lane template.

Required section order:

1. Hero / masthead
2. What this is
3. Current authority state
4. Headline metrics
5. What is proved now
6. Explicit non-claims
7. Evidence / proof routes
8. Repo shape / verification path
9. Related lanes
10. Partnership CTA

## `/proof`

Must teach the reader how to interpret proof, authority, non-claims, open risks, and verification routes.

## `/about`

Compressed substrate narrative only. It must stay secondary to evidence.

## `/contact`

Clear routing page for partnership, licensing, research, and institutional inquiry.

## 7. Source-of-Truth Contract

## Repo-Owned Truth

These fields are repo-driven and must update from GitHub-backed source material:

- lane identity
- authority state
- headline metrics
- proved-now content
- explicit non-claims
- open risks
- proof anchors
- repo shape
- verification path

## Sanity-Owned Editorial

These fields may be editorially managed:

- homepage composition
- ordering and featuring of lanes
- related-lane curation
- supporting intros and wrappers
- CTA framing
- media and visual assets

## Rule

Sanity may wrap repo truth.

Sanity may not silently replace repo truth on authority surfaces.

## 8. Data Quality Standard

The parser is acceptable only when it produces lane packets that are:

- structurally complete enough to render required modules
- semantically honest
- visually usable without hand-rewriting packet fields in code

The parser must reject or degrade instead of inventing certainty.

## 9. Required Delivery Phases

## Phase 1: Data Hygiene Lock

Goal:

- finish parser cleanup
- normalize packet outputs
- reduce noisy copy
- tighten confidence scoring

Exit gate:

- `ZPE-IMC`, `ZPE-IoT`, and `ZPE-XR` packets read cleanly enough to be trusted as reference lanes

## Phase 2: Route Completion

Goal:

- implement `/imc`, `/proof`, `/about`, `/contact`
- finish missing module wiring across page types

Exit gate:

- all required routes exist and render coherent content

## Phase 3: Design Convergence

Goal:

- bring homepage and lane pages into close alignment with the attached references
- fix typography, spacing, module structure, and footer/nav finish

Exit gate:

- the site no longer feels like a "dark prototype"
- it feels like the attached work

## Phase 4: Verification

Goal:

- validate data truth, route coverage, typography, contrast, motion, and degraded states

Exit gate:

- no false pass-state
- no broken route
- no wrong font stack
- no hidden non-claims

## Phase 5: Launch Readiness

Goal:

- production env complete
- sync and fallback behavior documented
- rollback path documented

Exit gate:

- site can be published and operated without improvisation

## 10. Explicit No-Hack Rules

- No hardcoded repo truth in React components
- No placeholder metrics in production-facing modules
- No marketing-language substitution for thin evidence
- No route stubs marked as finished
- No design approximation framed as a match to the references
- No pass narrative for staged, inconclusive, or blocked lanes

## 11. Definition of Done

The project is done only when:

- the user can compare the live site to the attached references without seeing a design gulf
- GitHub truth is visibly and credibly flowing into the site
- every required route exists
- every major surface has explicit non-claims where appropriate
- the runbooks are sufficient for another execution agent to finish, verify, deploy, and operate the system without guessing
