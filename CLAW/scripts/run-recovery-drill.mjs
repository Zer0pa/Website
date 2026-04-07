#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  activeLocks,
  buildCyclePlan,
  controlPath,
  loadControlPlane,
  localTimestamp,
  materializeCycle,
  projectPath,
  relativeProjectPath,
  writeJson,
} from './lib/control-plane.mjs';

const STALE_LOCK_REPORT = 'CLAW/control-plane/reports/W4-recovery-drill-stale-lock.md';
const CANDIDATE_ROLLBACK_REPORT = 'CLAW/control-plane/reports/W4-recovery-drill-candidate-rollback.md';
const RECOVERY_HARDENING_REPORT = 'CLAW/control-plane/reports/W4-recovery-hardening.md';

function readArg(prefix, fallback = null) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function removeBlocker(runtime, text) {
  runtime.blockers = (runtime.blockers || []).filter((entry) => entry !== text);
}

function execNode(script, args = []) {
  execFileSync('node', [script, ...args], {
    cwd: projectPath('.'),
    stdio: 'inherit',
  });
}

function gitOutput(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

function gitRun(cwd, args) {
  execFileSync('git', args, {
    cwd,
    stdio: 'inherit',
  });
}

function ensureCleanWorktree(cwd) {
  const dirty = gitOutput(cwd, ['status', '--short']);
  if (dirty) {
    throw new Error(`Worktree must be clean before recovery drill: ${cwd}`);
  }
}

function refreshRecoverySummary() {
  const runtimePath = projectPath('CLAW/control-plane/state/runtime-state.json');
  const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
  const staleExists = fs.existsSync(projectPath(STALE_LOCK_REPORT));
  const rollbackExists = fs.existsSync(projectPath(CANDIDATE_ROLLBACK_REPORT));
  const summaryPath = projectPath(RECOVERY_HARDENING_REPORT);
  const summaryLines = [
    '# W4 Recovery Hardening',
    '',
    `- stale-lock drill: \`${staleExists ? 'pass' : 'pending'}\``,
    `- candidate-rollback drill: \`${rollbackExists ? 'pass' : 'pending'}\``,
    `- recovery-drill-passed: \`${staleExists || rollbackExists ? 'true' : 'false'}\``,
    `- p4-recovery-hardened: \`${staleExists && rollbackExists ? 'true' : 'false'}\``,
  ];
  fs.writeFileSync(summaryPath, `${summaryLines.join('\n')}\n`, 'utf8');

  runtime.gates.recovery_drill_passed = staleExists || rollbackExists;
  runtime.gates.p4_recovery_hardened = staleExists && rollbackExists;
  removeBlocker(runtime, 'No recovery drill has been proven yet.');
  runtime.last_updated = localTimestamp();
  writeJson(runtimePath, runtime);

  const manifestPath = projectPath('CLAW/control-plane/press-go.manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.required_evidence.recovery_drill_bundle = RECOVERY_HARDENING_REPORT;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function runStaleLock(control) {
  const cycle = buildCyclePlan(control, { profile: 'supervised_dry_run' });
  materializeCycle(control, cycle);

  const staleAt = '2000-01-01T00:00:00Z';
  for (const lock of activeLocks()) {
    const payload = {
      ...lock.payload,
      acquired_at: staleAt,
      heartbeat_at: staleAt,
      expires_at: staleAt,
      status: 'held',
    };
    writeJson(lock.absolutePath, payload);
  }

  execNode(path.join(projectPath('CLAW/scripts'), 'recover-cycle.mjs'), ['--max-age-minutes=0']);

  const recovered = loadControlPlane();
  const health = {
    active_cycle: recovered.runtime.active_cycle,
    lock_count: activeLocks().length,
    last_recovery_event: recovered.runtime.last_recovery_event,
  };

  if (health.active_cycle !== null || health.lock_count !== 0 || !health.last_recovery_event) {
    throw new Error('Recovery drill did not clear active state cleanly.');
  }

  const reportPath = projectPath(STALE_LOCK_REPORT);
  const report = [
    '# W4 Recovery Drill: Stale Lock',
    '',
    `- scenario: \`stale-lock\``,
    `- materialized cycle: \`${cycle.cycle_id}\``,
    `- result: \`pass\``,
    `- recovery event: \`${health.last_recovery_event}\``,
    '- active cycle cleared: `yes`',
    '- live locks after recovery: `0`',
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`, 'utf8');

  return {
    scenario: 'stale-lock',
    report: STALE_LOCK_REPORT,
    recovery_event: health.last_recovery_event,
  };
}

function runCandidateRollback(control) {
  const laneId = readArg('--lane=', 'homepage-fidelity');
  const lane = control.agentLanes.lanes.find((entry) => entry.id === laneId);
  if (!lane) {
    throw new Error(`Unknown lane for candidate rollback drill: ${laneId}`);
  }

  const rollbackTargetRef = control.runtime.lanes[laneId]?.last_accepted_commit;
  if (!rollbackTargetRef) {
    throw new Error(`Lane ${laneId} does not have an accepted commit to roll back to.`);
  }
  const worktree = lane.worktree;
  const rollbackTarget = gitOutput(worktree, ['rev-parse', rollbackTargetRef]);
  ensureCleanWorktree(worktree);

  const originalBranch = gitOutput(worktree, ['branch', '--show-current']);
  const originalHead = gitOutput(worktree, ['rev-parse', 'HEAD']);
  const drillBranch = `codex/drill-r1-${laneId}-${Date.now()}`;
  const syntheticRelativePath = `CLAW/control-plane/recoveries/.drills/${laneId}-synthetic-regression.txt`;
  const syntheticAbsolutePath = path.join(worktree, syntheticRelativePath);
  const eventId = `R1-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
  const failedSlicePath = controlPath('logs', `${eventId}.failed-slice.json`);
  let regressionCommit = null;

  try {
    gitRun(worktree, ['switch', '-c', drillBranch]);
    fs.mkdirSync(path.dirname(syntheticAbsolutePath), { recursive: true });
    fs.writeFileSync(syntheticAbsolutePath, `synthetic regression ${localTimestamp()}\n`, 'utf8');
    gitRun(worktree, ['add', '--', syntheticRelativePath]);
    gitRun(worktree, ['commit', '-m', `Synthetic regression drill for ${laneId}`]);
    regressionCommit = gitOutput(worktree, ['rev-parse', 'HEAD']);

    writeJson(failedSlicePath, {
      id: eventId,
      lane_id: laneId,
      branch: drillBranch,
      regression_commit: regressionCommit,
      rollback_target: rollbackTarget,
      created_at: localTimestamp(),
      kind: 'synthetic-regression-drill',
    });

    gitRun(worktree, ['switch', '--detach', rollbackTarget]);
    const detachedHead = gitOutput(worktree, ['rev-parse', 'HEAD']);
    if (detachedHead !== rollbackTarget) {
      throw new Error(`Detached rollback did not land on rollback target for ${laneId}.`);
    }
  } finally {
    try {
      gitRun(worktree, ['switch', originalBranch]);
    } catch {}
    try {
      gitRun(worktree, ['branch', '-D', drillBranch]);
    } catch {}
  }

  ensureCleanWorktree(worktree);
  const restoredHead = gitOutput(worktree, ['rev-parse', 'HEAD']);
  if (restoredHead !== originalHead) {
    throw new Error(`Lane ${laneId} did not return to its original accepted head after rollback drill.`);
  }

  const eventPath = controlPath('recoveries', `${eventId}.json`);
  writeJson(eventPath, {
    id: eventId,
    scenario: 'candidate-rollback',
    lane_id: laneId,
    rollback_target: rollbackTarget,
    regression_commit: regressionCommit,
    restored_head: restoredHead,
    created_at: localTimestamp(),
    pass: true,
  });

  const reportPath = projectPath(CANDIDATE_ROLLBACK_REPORT);
  const report = [
    '# W4 Recovery Drill: Candidate Rollback',
    '',
    `- scenario: \`candidate-rollback\``,
    `- lane: \`${laneId}\``,
    `- original branch: \`${originalBranch}\``,
    `- original head: \`${originalHead.slice(0, 7)}\``,
    `- rollback target: \`${rollbackTarget.slice(0, 7)}\``,
    `- regression commit: \`${regressionCommit.slice(0, 7)}\``,
    `- failed slice artifact: \`${relativeProjectPath(failedSlicePath)}\``,
    `- recovery event: \`${relativeProjectPath(eventPath)}\``,
    '- result: `pass`',
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`, 'utf8');

  return {
    scenario: 'candidate-rollback',
    report: CANDIDATE_ROLLBACK_REPORT,
    recovery_event: relativeProjectPath(eventPath),
  };
}

function main() {
  const scenario = readArg('--scenario=', 'stale-lock');

  const control = loadControlPlane();

  if (control.runtime.active_cycle) {
    throw new Error('Cannot run recovery drill while an active cycle exists.');
  }
  let result;
  if (scenario === 'stale-lock') {
    result = runStaleLock(control);
  } else if (scenario === 'candidate-rollback') {
    result = runCandidateRollback(control);
  } else {
    throw new Error(`Unsupported recovery drill scenario: ${scenario}`);
  }

  refreshRecoverySummary();
  console.log(JSON.stringify(result, null, 2));
}

main();
