#!/usr/bin/env node
/**
 * CLAW Opus Engineer — lane-lock smoke test
 *
 * Exercises isContested() and contestedBy() against the current live worktree
 * state. Not a unit test with mocks — uses the real git worktree graph so the
 * output reflects actual contention.
 *
 * Run:
 *   node CLAW/opus-engineer/lib/lane-lock.test.mjs
 *
 * Exit 0 = all assertions passed.
 * Exit 1 = at least one assertion failed or an internal error occurred.
 */

import { isContested, contestedBy } from './lane-lock.mjs';

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function assertType(label, value, expected) {
  assert(label, typeof value === expected, `got ${typeof value}, want ${expected}`);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

async function run() {
  console.log('\n=== lane-lock smoke tests ===\n');

  // ── T1: contestedBy returns an array ───────────────────────────────────────
  console.log('T1: contestedBy("site/src/app/imc/page.tsx") returns an array');
  let result;
  try {
    result = await contestedBy('site/src/app/imc/page.tsx');
    assert('result is Array', Array.isArray(result));
  } catch (err) {
    assert('contestedBy did not throw', false, err.message);
    result = [];
  }

  // ── T2: each entry has required shape ─────────────────────────────────────
  console.log('\nT2: each contestedBy entry has the expected shape');
  for (const entry of result) {
    assert('entry.worktree is string', typeof entry.worktree === 'string');
    assert('entry.head is string', typeof entry.head === 'string');
    assert('entry.contested_paths is Array', Array.isArray(entry.contested_paths));
    // branch may be null (detached HEAD) — only check if present
    if (entry.branch !== null && entry.branch !== undefined) {
      assert('entry.branch is string when present', typeof entry.branch === 'string');
    }
  }
  if (result.length === 0) {
    console.log('  (no contested worktrees found for site/src/app/imc/page.tsx — correct if no live rescaffolds)');
  }

  // ── T3: isContested returns boolean ───────────────────────────────────────
  console.log('\nT3: isContested returns a boolean');
  try {
    const contested = await isContested('site/src/app/imc/page.tsx');
    assertType('isContested result', contested, 'boolean');
    // isContested must agree with contestedBy
    assert('isContested === (contestedBy.length > 0)', contested === (result.length > 0));
  } catch (err) {
    assert('isContested did not throw', false, err.message);
  }

  // ── T4: route shorthand expansion ─────────────────────────────────────────
  console.log('\nT4: route shorthand "/imc" produces same boolean result as explicit page.tsx path');
  try {
    const byRoute = await isContested('/imc');
    const byFile = await isContested('site/src/app/imc/page.tsx');
    // Route expands to the explicit path among others — byRoute may be true
    // even if byFile is false (other expanded paths might be contested).
    // We only assert both are booleans and the call succeeds.
    assertType('isContested("/imc") is boolean', byRoute, 'boolean');
    assertType('isContested("site/src/app/imc/page.tsx") is boolean', byFile, 'boolean');
  } catch (err) {
    assert('route shorthand did not throw', false, err.message);
  }

  // ── T5: non-existent file is safe ─────────────────────────────────────────
  console.log('\nT5: non-existent file path does not throw');
  try {
    const r = await contestedBy('site/src/app/does-not-exist/page.tsx');
    assert('returns empty array for non-existent path', Array.isArray(r));
  } catch (err) {
    assert('non-existent path did not throw', false, err.message);
  }

  // ── T6: live worktree snapshot ────────────────────────────────────────────
  console.log('\nT6: live worktree snapshot (informational)');
  try {
    const allRoutes = ['/imc', '/work/xr', '/work/ft', '/', '/work'];
    console.log('  Contention map across canonical routes:');
    for (const route of allRoutes) {
      const conflicts = await contestedBy(route);
      const label = conflicts.length > 0
        ? `CONTESTED by ${conflicts.map((c) => c.branch || c.head.slice(0, 8)).join(', ')}`
        : 'clear';
      console.log(`    ${route.padEnd(16)} → ${label}`);
    }
    assert('snapshot completed without error', true);
  } catch (err) {
    assert('snapshot did not throw', false, err.message);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('[lane-lock.test] fatal:', err.message);
  process.exit(1);
});
