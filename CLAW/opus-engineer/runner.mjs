#!/usr/bin/env node
/**
 * CLAW Opus Engineer — Lane Runner
 *
 * Entry point for the opus-engineer lane. Invoked by autonomy-once.mjs on each
 * cycle (via laneExecutionRecipe) or standalone:
 *
 *   node CLAW/opus-engineer/runner.mjs [--cycle=<id>] [--dry-run]
 *
 * On each invocation:
 *   1. Load runtime-state.json and the GGD gap records
 *   2. Select the highest-priority task per decision-policy.md
 *   3. Render the appropriate prompt template
 *   4. Spawn claude --print as a sub-agent
 *   5. Capture the structured result
 *   6. Write a report to CLAW/control-plane/reports/opus-engineer/
 *
 * WORKTREE COMMIT REMINDER: this runner operates inside a git worktree.
 * Sub-agents MUST commit their work or it will be lost when the worktree
 * is cleaned up. Any sub-agent that produces file changes without committing
 * must be escalated, not accepted.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function projectRoot() {
  // Walk up from this file until we find CLAW/
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'CLAW'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error('Cannot locate project root from ' + __dirname);
}

const ROOT = projectRoot();

function projectPath(...parts) {
  return path.join(ROOT, ...parts);
}

function controlPath(...parts) {
  return projectPath('CLAW', 'control-plane', ...parts);
}

function reportDir() {
  return controlPath('reports', 'opus-engineer');
}

function promptDir() {
  return projectPath('CLAW', 'opus-engineer', 'prompts');
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function readArg(prefix, fallback = null) {
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}

function parseBoolFlag(flag) {
  return process.argv.includes(flag);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function localTimestamp() {
  return new Date().toISOString();
}

function cycleId() {
  return readArg('--cycle=') || `OE-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}Z`;
}

// ---------------------------------------------------------------------------
// Gap record loading
// ---------------------------------------------------------------------------

function loadOpenCriticalGaps() {
  const gapDir = projectPath('GGD', 'gap-records');
  if (!fs.existsSync(gapDir)) return [];
  return fs
    .readdirSync(gapDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(path.join(gapDir, f)))
    .filter(
      (g) =>
        g &&
        g.status === 'open' &&
        (g.severity === 'critical' || g.severity === 'blocking'),
    );
}

// ---------------------------------------------------------------------------
// Task selection (mirrors decision-policy.md)
// ---------------------------------------------------------------------------

const PHASE_ROUTE_ORDER = ['/work/xr', '/work/ft', '/imc', '/', '/work'];

function phaseRouteScore(route) {
  const idx = PHASE_ROUTE_ORDER.indexOf(route);
  return idx === -1 ? 99 : idx;
}

function selectTask(runtime, gaps) {
  // Tier 1 — critical geometry gaps
  if (gaps.length > 0) {
    const sorted = [...gaps].sort(
      (a, b) => phaseRouteScore(a.route || '') - phaseRouteScore(b.route || ''),
    );
    return {
      tier: 1,
      type: 'geometry-gap',
      gap: sorted[0],
      template: 'close-geometry-gap.md',
      reason: `Critical geometry gap on ${sorted[0].route || 'unknown'}: ${sorted[0].gap_id || sorted[0].id || 'unknown'}`,
    };
  }

  // Tier 2 — build failure
  const buildAudit = runtime?.latest_audits?.build || '';
  if (buildAudit.startsWith('fail')) {
    return {
      tier: 2,
      type: 'build-failure',
      template: 'qa-verification.md',
      reason: `Build audit is failing: ${buildAudit}`,
    };
  }

  // Tier 3 — route progress < accepted
  const lanes = runtime?.lanes || {};
  const blockedRoutes = Object.entries(lanes)
    .filter(([, v]) => v && !['accepted', 'producing'].includes(v.status))
    .map(([id]) => id);

  if (blockedRoutes.length > 0) {
    const target = blockedRoutes[0];
    const laneStatus = lanes[target];
    return {
      tier: 3,
      type: 'route-progress',
      lane: target,
      laneStatus,
      template: 'rescaffold-page.md',
      reason: `Lane ${target} is ${laneStatus?.status || 'unknown'} — needs progress`,
    };
  }

  // Tier 4 — QA debt
  const openLearning = (runtime?.learning_backlog || []).filter(
    (item) => item.status === 'open' && item.category === 'law-gap',
  );
  if (openLearning.length > 0) {
    return {
      tier: 4,
      type: 'qa-debt',
      item: openLearning[0],
      template: 'qa-verification.md',
      reason: `Open law-gap learning item: ${openLearning[0].id}`,
    };
  }

  return { tier: 5, type: 'none', template: null, reason: 'No eligible task found' };
}

// ---------------------------------------------------------------------------
// Prompt rendering
// ---------------------------------------------------------------------------

function renderPrompt(task, runtime) {
  if (!task.template) return null;

  const templatePath = path.join(promptDir(), task.template);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Prompt template not found: ${templatePath}`);
  }

  let text = fs.readFileSync(templatePath, 'utf8');

  // Simple token substitution
  const tokens = {
    '{{CYCLE_ID}}': cycleId(),
    '{{TASK_REASON}}': task.reason || '',
    '{{TASK_TYPE}}': task.type || '',
    '{{TARGET_ROUTE}}': task.gap?.route || task.lane || '',
    '{{GAP_ID}}': task.gap?.gap_id || task.gap?.id || '',
    '{{GAP_SEVERITY}}': task.gap?.severity || '',
    '{{LANE_STATUS}}': JSON.stringify(task.laneStatus || null),
    '{{LEARNING_ITEM_ID}}': task.item?.id || '',
    '{{LEARNING_OBSERVATION}}': task.item?.observation || '',
    '{{TIMESTAMP}}': localTimestamp(),
    '{{PHASE}}': runtime?.current_phase || '',
    '{{WRITABLE_SCOPE}}': [
      'site/src/app/**',
      'site/src/components/**',
      'CLAW/opus-engineer/**',
      'CLAW/control-plane/reports/opus-engineer/**',
    ].join('\n'),
  };

  for (const [token, value] of Object.entries(tokens)) {
    text = text.replaceAll(token, value);
  }

  return text;
}

// ---------------------------------------------------------------------------
// Sub-agent invocation
// ---------------------------------------------------------------------------

function resolveClaudeBin() {
  try {
    return execFileSync('which', ['claude'], { encoding: 'utf8' }).trim();
  } catch {
    // fallback to PATH lookup
    return 'claude';
  }
}

function spawnSubAgent(prompt, dryRun = false) {
  if (dryRun) {
    console.error('[opus-engineer] DRY RUN — would spawn sub-agent with prompt:');
    console.error(prompt.slice(0, 500) + (prompt.length > 500 ? '...' : ''));
    return {
      status: 'dry-run',
      output: null,
      exitCode: 0,
      dryRun: true,
    };
  }

  const claudeBin = resolveClaudeBin();

  const result = spawnSync(
    claudeBin,
    ['--print', '--output-format', 'json'],
    {
      input: prompt,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      timeout: 1800 * 1000, // 30 min max
      cwd: ROOT,
    },
  );

  let parsed = null;
  if (result.stdout) {
    try {
      parsed = JSON.parse(result.stdout.trim());
    } catch {
      parsed = { raw: result.stdout.trim() };
    }
  }

  return {
    status: result.status === 0 ? 'ok' : 'error',
    output: parsed,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status,
    signal: result.signal,
    error: result.error?.message || null,
  };
}

// ---------------------------------------------------------------------------
// Report writing
// ---------------------------------------------------------------------------

function writeReport(id, task, subAgentResult) {
  fs.mkdirSync(reportDir(), { recursive: true });

  const reportPath = path.join(reportDir(), `${id}.md`);
  const commit = subAgentResult?.output?.commit || subAgentResult?.output?.candidate_commit || null;
  const subStatus = subAgentResult?.output?.status || (subAgentResult?.exitCode === 0 ? 'accepted' : 'escalated');
  const filesChanged = subAgentResult?.output?.files_changed || [];

  const lines = [
    `# Opus Engineer — ${id}`,
    '',
    `- selected_task: tier-${task.tier}/${task.type}`,
    `- prompt_template: ${task.template || 'none'}`,
    `- sub_agent_status: ${subStatus}`,
    `- commit: ${commit || 'null'}`,
    `- files_changed: ${JSON.stringify(filesChanged)}`,
    `- timestamp: ${localTimestamp()}`,
    '',
    '## Reason',
    '',
    task.reason || '(none)',
    '',
    '## Summary',
    '',
    subAgentResult?.output?.summary || subAgentResult?.output?.raw || '(no structured output)',
  ];

  if (subAgentResult?.dryRun) {
    lines.push('', '_(dry run — sub-agent was not invoked)_');
  }

  fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
  return path.relative(ROOT, reportPath);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const id = cycleId();
  const dryRun = parseBoolFlag('--dry-run');

  console.error(`[opus-engineer] runner start — cycle=${id} dry-run=${dryRun}`);

  // 1. Load state
  const runtimePath = controlPath('state', 'runtime-state.json');
  const runtime = readJson(runtimePath);
  if (!runtime) {
    throw new Error(`Cannot load runtime-state.json from ${runtimePath}`);
  }

  // 2. Load gaps
  const gaps = loadOpenCriticalGaps();
  console.error(`[opus-engineer] open critical gaps: ${gaps.length}`);

  // 3. Select task
  const task = selectTask(runtime, gaps);
  console.error(`[opus-engineer] selected task: tier=${task.tier} type=${task.type}`);

  if (task.type === 'none') {
    const reportPath = writeReport(id, task, { output: { status: 'hold', summary: task.reason } });
    const result = {
      cycle_id: id,
      status: 'hold',
      task,
      report: reportPath,
      timestamp: localTimestamp(),
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // 4. Render prompt
  const prompt = renderPrompt(task, runtime);
  if (!prompt) {
    throw new Error(`Failed to render prompt for task type: ${task.type}`);
  }

  // 5. Spawn sub-agent
  console.error('[opus-engineer] spawning sub-agent…');
  const subAgentResult = spawnSubAgent(prompt, dryRun);
  console.error(`[opus-engineer] sub-agent finished — exit=${subAgentResult.exitCode}`);

  // 6. Write report
  const reportPath = writeReport(id, task, subAgentResult);
  console.error(`[opus-engineer] report written: ${reportPath}`);

  // 7. Emit structured result for the autonomy runner
  const status = subAgentResult?.output?.status || (subAgentResult.exitCode === 0 ? 'accepted' : 'escalated');
  const result = {
    cycle_id: id,
    lane: 'opus-engineer',
    status,
    task: { tier: task.tier, type: task.type, reason: task.reason, template: task.template },
    sub_agent_exit_code: subAgentResult.exitCode,
    commit: subAgentResult?.output?.commit || null,
    files_changed: subAgentResult?.output?.files_changed || [],
    report: reportPath,
    timestamp: localTimestamp(),
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('[opus-engineer] fatal:', error.message);
  process.exit(1);
});
