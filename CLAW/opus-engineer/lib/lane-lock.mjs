#!/usr/bin/env node
/**
 * CLAW Opus Engineer — Lane Lock
 *
 * Given a target file path (relative to project root, e.g.
 * "site/src/app/imc/page.tsx"), inspects all live git worktrees and reports
 * which worktrees have unmerged commits that touch that path.
 *
 * Usage (CLI):
 *   node CLAW/opus-engineer/lib/lane-lock.mjs <file-or-route-path>
 *
 * Exits 0 and prints JSON in all cases. Exits 1 only on internal error.
 *
 * API (ESM import):
 *   import { isContested, contestedBy } from './lane-lock.mjs';
 *   const contested = await isContested('site/src/app/imc/page.tsx');
 *   const conflicts = await contestedBy('site/src/app/imc/page.tsx');
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Locate project root
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot(start) {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    try {
      execFileSync('git', ['-C', dir, 'rev-parse', '--git-dir'], { stdio: 'pipe' });
      // Resolve to the worktree-aware "common dir" so we get the shared object store
      const commonDir = execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], {
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();
      return commonDir;
    } catch {
      dir = path.dirname(dir);
    }
  }
  throw new Error('Cannot find git project root from ' + start);
}

const ROOT = findProjectRoot(__dirname);

// ---------------------------------------------------------------------------
// Parse git worktree list --porcelain output
// ---------------------------------------------------------------------------

/**
 * Returns an array of worktree descriptor objects:
 * { worktree, head, branch, isBare, isDetached }
 */
function listWorktrees() {
  let raw;
  try {
    raw = execFileSync('git', ['-C', ROOT, 'worktree', 'list', '--porcelain'], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (err) {
    throw new Error('git worktree list failed: ' + err.message);
  }

  const worktrees = [];
  let current = null;

  for (const line of raw.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current) worktrees.push(current);
      current = { worktree: line.slice('worktree '.length), head: null, branch: null, isBare: false, isDetached: false };
    } else if (line.startsWith('HEAD ') && current) {
      current.head = line.slice('HEAD '.length);
    } else if (line.startsWith('branch ') && current) {
      current.branch = line.slice('branch '.length);
    } else if (line === 'bare' && current) {
      current.isBare = true;
    } else if (line === 'detached' && current) {
      current.isDetached = true;
    }
  }
  if (current) worktrees.push(current);

  return worktrees;
}

// ---------------------------------------------------------------------------
// Get the HEAD of the main integration branch (used as merge-base)
// ---------------------------------------------------------------------------

function resolveMainHead() {
  // Try common main branch names in order
  for (const ref of ['refs/heads/main', 'refs/heads/master', 'refs/remotes/origin/main']) {
    try {
      return execFileSync('git', ['-C', ROOT, 'rev-parse', ref], {
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();
    } catch {
      // try next
    }
  }
  // Fall back to initial commit (edge case: shallow repos)
  return execFileSync('git', ['-C', ROOT, 'rev-list', '--max-parents=0', 'HEAD'], {
    encoding: 'utf8',
    stdio: 'pipe',
  }).trim();
}

// ---------------------------------------------------------------------------
// Get commits in a worktree that are NOT on main (i.e., unmerged)
// ---------------------------------------------------------------------------

/**
 * Returns true if the worktree HEAD has unmerged commits that touched `filePath`.
 * @param {string} worktreeHead - SHA of the worktree HEAD
 * @param {string} mainHead     - SHA of the main branch HEAD
 * @param {string} filePath     - path relative to project root
 */
function worktreeTouchesFile(worktreeHead, mainHead, filePath) {
  if (!worktreeHead || worktreeHead === mainHead) return false;

  // Find the common ancestor between this worktree and main
  let mergeBase;
  try {
    mergeBase = execFileSync(
      'git',
      ['-C', ROOT, 'merge-base', worktreeHead, mainHead],
      { encoding: 'utf8', stdio: 'pipe' },
    ).trim();
  } catch {
    // No common ancestor — detached codex worktrees at a hash not reachable from main
    mergeBase = mainHead;
  }

  if (mergeBase === worktreeHead) {
    // Worktree is behind or at main — no unmerged commits
    return false;
  }

  // List commits between merge-base and worktree HEAD that touched filePath
  let log;
  try {
    log = execFileSync(
      'git',
      ['-C', ROOT, 'log', '--oneline', '--diff-filter=ACDMRT',
       `${mergeBase}..${worktreeHead}`, '--', filePath],
      { encoding: 'utf8', stdio: 'pipe' },
    ).trim();
  } catch {
    return false;
  }

  return log.length > 0;
}

// ---------------------------------------------------------------------------
// Route → file path expansion
// ---------------------------------------------------------------------------

/**
 * Expands a route like "/imc" into candidate file paths under site/src/app/.
 * Also accepts plain relative paths (passed through as-is).
 */
function expandRouteToPaths(input) {
  // If it looks like a file path (contains '.') return as-is
  if (input.includes('.')) return [input];

  // Strip leading slash and map route to Next.js app-dir convention
  const route = input.startsWith('/') ? input.slice(1) : input;
  const base = route === '' ? '' : route;

  return [
    `site/src/app/${base}/page.tsx`,
    `site/src/app/${base}/page.ts`,
    `site/src/app/${base}/layout.tsx`,
    `site/src/app/${base}/layout.ts`,
  ];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns an array of { worktree, branch, head } descriptors for every live
 * worktree that has unmerged commits touching `targetPath`.
 *
 * @param {string} targetPath - file path (relative to project root) or route
 * @returns {Promise<Array<{worktree:string, branch:string|null, head:string}>>}
 */
export async function contestedBy(targetPath) {
  const worktrees = listWorktrees();
  const mainHead = resolveMainHead();
  const currentWorktree = ROOT; // the worktree this process runs inside

  // Expand route shorthand to candidate file paths
  const filePaths = expandRouteToPaths(targetPath);

  const contested = [];

  for (const wt of worktrees) {
    // Skip the current worktree (we're the caller, not a contender)
    if (wt.worktree === currentWorktree) continue;
    // Skip bare worktrees
    if (wt.isBare) continue;
    // Skip worktrees with no HEAD (shouldn't happen, but be safe)
    if (!wt.head) continue;
    // Skip worktrees sitting at main HEAD exactly — no unmerged work
    if (wt.head === mainHead) continue;

    const touches = filePaths.some((fp) =>
      worktreeTouchesFile(wt.head, mainHead, fp),
    );

    if (touches) {
      contested.push({
        worktree: wt.worktree,
        branch: wt.branch,
        head: wt.head,
        contested_paths: filePaths,
      });
    }
  }

  return contested;
}

/**
 * Returns true if any live worktree (other than the current one) has unmerged
 * commits that touch `targetPath`.
 *
 * @param {string} targetPath - file path (relative to project root) or route
 * @returns {Promise<boolean>}
 */
export async function isContested(targetPath) {
  const conflicts = await contestedBy(targetPath);
  return conflicts.length > 0;
}

// ---------------------------------------------------------------------------
// CLI entrypoint
// ---------------------------------------------------------------------------

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node CLAW/opus-engineer/lib/lane-lock.mjs <file-path-or-route>');
    process.exit(1);
  }

  const conflicts = await contestedBy(target);
  const result = {
    target,
    isContested: conflicts.length > 0,
    contestedBy: conflicts,
  };

  console.log(JSON.stringify(result, null, 2));

  // Non-zero exit when contested, so shell scripts can branch on $?
  process.exit(conflicts.length > 0 ? 2 : 0);
}

// Run CLI only when invoked directly (not imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('[lane-lock] fatal:', err.message);
    process.exit(1);
  });
}
