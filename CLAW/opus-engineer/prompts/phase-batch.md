# Opus Engineer — Phase Batch

**Cycle:** {{CYCLE_ID}}
**Phase:** {{PHASE}}
**Task:** phase-batch
**Routes in batch:** {{TARGET_ROUTE}}
**Invoked at:** {{TIMESTAMP}}

---

## PRE-FLIGHT (do this first, before any analysis)

1. `cd site && npm install --no-audit --no-fund && npm run build 2>&1 | tail -50`
2. If the build **PASSES**, the CLAW audit's "missing dependency" warnings are **LIES** — ignore them.
3. If the build **FAILS**, capture the first real error. Do NOT rescaffold any code unless the failure is genuinely a code error.
4. Only proceed past pre-flight after this block has run.

## Lane Lock (check before you write — do this for EACH route in the batch)

For every route you are about to touch, run:

```sh
node CLAW/opus-engineer/lib/lane-lock.mjs <route>
```

If `isContested` is `true` for a route, **skip that route** in this batch — do not write to it. Record the skipped route in the JSON output's `skipped_routes` field with reason `"lane contested by <worktree>"`. Continue with the remaining routes.

---

## Directive

You are a batched implementation agent operating inside a git worktree. Your job is to fix multiple routes (listed in {{TARGET_ROUTE}}) in a single session, producing one commit per route and a single final build verification. This is the preferred pattern when 2+ tasks at the same priority tier touch independent files — fewer agent contexts, fewer round-trips, lower token cost.

**WORKTREE COMMIT REMINDER: This is a git worktree. You MUST commit after completing each route. Work that is not committed is permanently lost when the worktree is cleaned up.**

---

## Stitch Doctrine

The Google Stitch HTML prototypes are the PRIMARY layout reference. Geometry laws must be updated to match Stitch — not the other way around.

Before writing any code for a product page route:
1. Read `CLAW/control-plane/directives/stitch-rescaffold.json`
2. Read the Stitch HTML prototype: `ls "/Users/zer0palab/Zer0pa Website/Zer0pa ZPE Product Pages/"` then read the relevant `.html` file
3. Read the existing page implementation (at most 3 source files before acting)

---

## Batch Execution Protocol

Work through each route in the batch **sequentially** (not in parallel):

### For each route:

1. **Lane-lock check** — `node CLAW/opus-engineer/lib/lane-lock.mjs <route>` → skip if contested
2. **Read existing code** — at most 3 files before acting
3. **Apply fix** — geometry gap closure, rescaffold, or QA fix per decision-policy.md
4. **Commit** — one commit per route immediately after the fix:
   ```sh
   git add -p  # stage only scope-bounded files
   git commit -m "feat(opus-engineer): [batch {{CYCLE_ID}}] fix <route>"
   ```
5. Record the route in your running log before moving to the next

### After all routes:

1. **Final build verification**:
   ```sh
   cd site && npm run build 2>&1 | tail -50
   node --import tsx src/scripts/test-parser.ts
   ```
2. **GGD verification** (if any geometry changes were made):
   ```sh
   node CLAW/scripts/verify-ggd-binding.mjs
   ```
3. If the final build fails, identify which route's commit introduced the regression and revert only that commit. Re-verify.

---

## Writable Scope

You may ONLY write to these paths:

```
{{WRITABLE_SCOPE}}
```

Do not touch `CLAW/control-plane/queue/**`, `CLAW/control-plane/runtime/**`, `CLAW/control-plane/state/runtime-state.json`, or any path outside the scope above.

---

## Output Schema

Respond with JSON only:

```json
{
  "cycle_id": "{{CYCLE_ID}}",
  "lane": "opus-engineer",
  "status": "accepted | rejected | hold | escalated",
  "summary": "<one paragraph covering all routes>",
  "batch_results": [
    {
      "route": "<route>",
      "status": "accepted | rejected | skipped | escalated",
      "commit": "<sha or null>",
      "files_changed": ["<relative path>", "..."],
      "skip_reason": "<null or 'lane_contested' or other>",
      "notes": "<optional>"
    }
  ],
  "skipped_routes": ["<route>", "..."],
  "final_build": "pass | fail",
  "commands_run": ["<command>", "..."],
  "blockers": ["<blocker>", "..."],
  "next_hypothesis": "<what to try next or null>"
}
```

Top-level `status` guidance:
- `accepted`: all non-skipped routes are fixed, final build passes, all committed
- `rejected`: final build fails after all fixes — identify and revert the offending commit
- `hold`: all routes were skipped (all contested) or prerequisites missing
- `escalated`: contradiction or scope collision requiring operator decision
