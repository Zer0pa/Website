# Opus Engineer — Decision Policy

## Priority Order

Each cycle Opus Engineer selects exactly one task. Tasks are ranked in this strict order:

### 1. Critical gaps (highest priority)
A GGD gap record in `GGD/gap-records/` with `severity: "critical"` and `status: "open"` for any route that is not yet producing. Use `close-geometry-gap.md` prompt template.

### 2. Build failures
`runtime-state.json → latest_audits.build` contains `"fail"`. Target: repair the build so the cycle can advance. Use `qa-verification.md` prompt template with objective `restore-build`.

### 3. Route progress below threshold
Any route in `runtime-state.json → lanes` with `status` not in `["accepted", "producing"]` AND with a corresponding entry in the execution plan phase that is `in_progress`. Routes are ordered by plan phase sequence. Use `rescaffold-page.md` or `close-geometry-gap.md` depending on whether a Stitch prototype is available.

### 4. QA debt
Open learning backlog items in `runtime-state.json → learning_backlog` with `status: "open"` and `category: "law-gap"`. Use `qa-verification.md` prompt template.

### 5. No eligible task
If no task matches any tier, emit a status report to `CLAW/control-plane/reports/opus-engineer/` and return `status: hold`. Do NOT manufacture work.

## Selection Rules

- Pick the **single** highest-priority task from tier 1; if multiple critical gaps exist, pick the one whose `target_route` appears earliest in the canonical phase sequence.
- Never pick a task whose `depends_on` lane is still `status: active` in the current cycle queue.
- Never widen the scope beyond what the selected prompt template declares.
- After picking, record the selection reason in the report header before invoking the sub-agent.

## Commit Discipline

Sub-agents operate in a git worktree. Work is lost if not committed.

- Sub-agent must commit before returning.
- If the sub-agent exits without a commit and produced file changes, Opus Engineer must escalate (not accept).
- Commit message format: `feat(opus-engineer): <one-line objective> [<cycle-id>]`

## Stitch Doctrine

When the task involves a product page:
- The Google Stitch HTML prototype is the PRIMARY layout reference.
- Geometry laws must be updated to match Stitch, not the other way around.
- All page work must reference `CLAW/control-plane/directives/stitch-rescaffold.json` before acting.

## Audit lies (baked in 2026-04-07)

On 2026-04-07, multiple sub-agents independently rescaffolded the same pages because they trusted the CLAW audit's "missing dependency" verdict instead of running the build. The root cause was `lightningcss`'s native binary — `npm ls` flagged it as a missing peer dep at audit time, but the build succeeded normally because Next.js bundles its own resolved copy. Sub-agents saw the audit warning, assumed broken environment, and started rescaffolding from scratch.

**Rule: build status is ground truth; audit output is a hint.**

- If `npm run build` (from `site/`) exits 0, the project is healthy — do not act on audit warnings.
- If `npm run build` exits non-zero, read the actual compile error, not the audit summary.
- Never rescaffold a file because `npm audit` or `npm ls` flagged a peer dependency.
- The PRE-FLIGHT block at the top of every prompt template encodes this rule operationally.

## Dispatch: prefer phase-batch for same-tier independent tasks (baked in 2026-04-07)

When 2 or more tasks sit at the same priority tier and touch independent files, prefer the `phase-batch.md` template over spawning N parallel single-task sub-agents. Rationale: fewer fresh contexts, fewer round-trips, lower token cost, and the batch agent shares build state across all route fixes so one `npm run build` validates everything. Only fall back to parallel dispatch when routes are genuinely blocking each other (e.g., shared component under concurrent edit — caught by lane-lock).

## Report Format

Every invocation writes a report to `CLAW/control-plane/reports/opus-engineer/<cycle-id>.md` with:

```markdown
# Opus Engineer — <cycle-id>

- selected_task: <tier>/<id>
- prompt_template: <template-file>
- sub_agent_status: accepted | rejected | hold | escalated
- commit: <sha or null>
- files_changed: [...]
- summary: <one paragraph>
```
