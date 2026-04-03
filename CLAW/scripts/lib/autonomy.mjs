import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  CLAW_ROOT,
  controlPath,
  ensureDir,
  git,
  localTimestamp,
  projectPath,
  readJson,
  relativeProjectPath,
  writeJson,
} from './control-plane.mjs';

export const AUTONOMY_SERVICE_LABEL = 'com.zer0palab.claw-autonomy';
export const AUTONOMY_STATE_PATH = path.join(CLAW_ROOT, 'services', 'autonomy', 'state.json');
export const AUTONOMY_PLIST_SOURCE = path.join(CLAW_ROOT, 'services', 'autonomy', 'com.zer0palab.claw-autonomy.plist');
export const AUTONOMY_PLIST_TARGET = path.join(os.homedir(), 'Library', 'LaunchAgents', `${AUTONOMY_SERVICE_LABEL}.plist`);
export const RUNTIME_ROOT = controlPath('runtime');
export const RUNTIME_BRIEFS_DIR = controlPath('runtime', 'briefs');
export const RUNTIME_HANDOFFS_DIR = controlPath('runtime', 'handoffs');
export const RUNTIME_LOGS_DIR = controlPath('runtime', 'logs');
export const CONTROL_LOGS_DIR = controlPath('logs');
export const LANE_RESULT_SCHEMA = projectPath('CLAW/control-plane/lane-exec-result.schema.json');

export function ensureAutonomyDirs() {
  ensureDir(RUNTIME_ROOT);
  ensureDir(RUNTIME_BRIEFS_DIR);
  ensureDir(RUNTIME_HANDOFFS_DIR);
  ensureDir(RUNTIME_LOGS_DIR);
  ensureDir(CONTROL_LOGS_DIR);
  ensureDir(path.dirname(AUTONOMY_STATE_PATH));
}

export function ensureLaneSiteDependencies(worktree) {
  const laneSiteDir = path.join(worktree, 'site');
  if (!fs.existsSync(laneSiteDir)) {
    return null;
  }

  const excludePath = execFileSync('git', ['rev-parse', '--git-path', 'info/exclude'], {
    cwd: worktree,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  ensureDir(path.dirname(excludePath));
  const excludePatterns = ['/site/node_modules', '/site/.next'];
  const existingExclude = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  const missingPatterns = excludePatterns.filter((pattern) => !existingExclude.includes(pattern));
  if (missingPatterns.length > 0) {
    const prefix = existingExclude && !existingExclude.endsWith('\n') ? '\n' : '';
    fs.writeFileSync(excludePath, `${existingExclude}${prefix}${missingPatterns.join('\n')}\n`, 'utf8');
  }

  const laneNodeModulesPath = path.join(laneSiteDir, 'node_modules');
  if (fs.existsSync(laneNodeModulesPath)) {
    return {
      mode: 'existing',
      path: laneNodeModulesPath,
    };
  }

  const sharedNodeModulesPath = projectPath('site/node_modules');
  if (!fs.existsSync(sharedNodeModulesPath)) {
    throw new Error(`Shared site/node_modules is missing at ${sharedNodeModulesPath}`);
  }

  fs.symlinkSync(sharedNodeModulesPath, laneNodeModulesPath, 'dir');
  return {
    mode: 'symlinked',
    path: laneNodeModulesPath,
    target: sharedNodeModulesPath,
  };
}

export function readRunnerState() {
  if (!fs.existsSync(AUTONOMY_STATE_PATH)) {
    return {
      version: 1,
      service_label: AUTONOMY_SERVICE_LABEL,
      enabled: false,
      mode: 'idle',
      pid: null,
      started_at: null,
      last_tick_at: null,
      last_result: null,
      active_cycle: null,
      active_job: null,
      last_error: null,
    };
  }

  return JSON.parse(fs.readFileSync(AUTONOMY_STATE_PATH, 'utf8'));
}

export function writeRunnerState(value) {
  ensureAutonomyDirs();
  writeJson(AUTONOMY_STATE_PATH, value);
}

export function activeQueuePath(runtime) {
  return runtime.active_cycle?.queue_file ? projectPath(runtime.active_cycle.queue_file) : null;
}

export function loadActiveQueue(runtime) {
  const queuePath = activeQueuePath(runtime);
  if (!queuePath || !fs.existsSync(queuePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(queuePath, 'utf8'));
}

export function writeActiveQueue(queuePath, value) {
  writeJson(queuePath, value);
}

export function queueJobIsTerminal(status) {
  return ['accepted', 'rejected', 'escalated', 'checkpointed', 'abandoned'].includes(status);
}

export function nextRunnableJob(queue) {
  if (!queue) {
    return null;
  }

  for (const job of queue.jobs || []) {
    if (queueJobIsTerminal(job.status)) {
      continue;
    }

    if (job.status === 'queued') {
      return job;
    }

    if (job.status === 'hold' || job.status === 'leased') {
      return job;
    }
  }

  return null;
}

export function activeQueueJobs(queue) {
  if (!queue) {
    return [];
  }

  return (queue.jobs || []).filter((job) => job.status === 'running' || job.status === 'leased');
}

export function promptSnapshotPath(jobId) {
  return path.join(RUNTIME_LOGS_DIR, `${jobId}.prompt.md`);
}

export function stdoutLogPath(jobId) {
  return path.join(RUNTIME_LOGS_DIR, `${jobId}.stdout.log`);
}

export function stderrLogPath(jobId) {
  return path.join(RUNTIME_LOGS_DIR, `${jobId}.stderr.log`);
}

export function finalMessagePath(jobId) {
  return path.join(RUNTIME_LOGS_DIR, `${jobId}.result.json`);
}

export function briefPath(jobId) {
  return path.join(RUNTIME_BRIEFS_DIR, `${jobId}.json`);
}

export function handoffPath(jobId) {
  return path.join(RUNTIME_HANDOFFS_DIR, `${jobId}.json`);
}

export function phaseLabel(phase) {
  return `${phase.id}-${String(phase.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

export function nextPhase(executionPlan, currentPhaseId) {
  const phases = executionPlan.phases || [];
  const index = phases.findIndex((phase) => phase.id === currentPhaseId);
  if (index === -1 || index === phases.length - 1) {
    return null;
  }
  return phases[index + 1];
}

export function gitHead(cwd) {
  return git(['rev-parse', 'HEAD'], cwd);
}

export function gitAbsolutePath(cwd, selector) {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', selector], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function gitDirtyFiles(cwd) {
  const output = git(['status', '--short'], cwd);
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[A-Z?]{1,2}\s+/, '').trim());
}

function isRunnerManagedPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized === 'site/node_modules' || normalized.startsWith('site/node_modules/');
}

export function ensureCleanWorktree(cwd) {
  const dirty = gitDirtyFiles(cwd).filter((filePath) => !isRunnerManagedPath(filePath));
  if (dirty.length > 0) {
    throw new Error(`Worktree is dirty: ${cwd} -> ${dirty.join(', ')}`);
  }
}

function globSegmentToRegex(segment) {
  return segment
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*');
}

export function matchesAllowedPath(filePath, allowedPatterns) {
  return allowedPatterns.some((pattern) => {
    const normalized = pattern.replace(/\\/g, '/');
    const regex = new RegExp(`^${globSegmentToRegex(normalized)}$`);
    return regex.test(filePath.replace(/\\/g, '/'));
  });
}

export function diffFilesSince(cwd, previousHead) {
  const currentHead = gitHead(cwd);
  const committed = currentHead === previousHead ? [] : git(['diff', '--name-only', `${previousHead}..${currentHead}`], cwd)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const dirty = gitDirtyFiles(cwd).filter((filePath) => !isRunnerManagedPath(filePath));
  return {
    previousHead,
    currentHead,
    committed,
    dirty,
    all: [...new Set([...committed, ...dirty])],
  };
}

export function createHostCommit(cwd, files, message) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('createHostCommit requires at least one file.');
  }

  execFileSync('git', ['add', '--', ...files], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  execFileSync('git', ['commit', '-m', message], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return gitHead(cwd);
}

export function commitReachable(cwd, commit) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', commit, 'HEAD'], {
      cwd,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

export function commitPatchEquivalent(cwd, commit) {
  try {
    const parent = git(['rev-parse', `${commit}^`], cwd);
    const output = git(['cherry', 'HEAD', parent, commit], cwd).trim();
    return output.startsWith('- ');
  } catch {
    return false;
  }
}

export function replayCommitRange(cwd, commit) {
  const mergeBase = git(['merge-base', 'HEAD', commit], cwd);
  const output = git(['rev-list', '--reverse', `${mergeBase}..${commit}`], cwd).trim();
  return output ? output.split('\n').map((line) => line.trim()).filter(Boolean) : [];
}

export function cherryPickCommit(cwd, commit) {
  try {
    execFileSync('git', ['cherry-pick', '--keep-redundant-commits', commit], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    try {
      execFileSync('git', ['cherry-pick', '--abort'], {
        cwd,
        stdio: 'ignore',
      });
    } catch {}
    throw error;
  }
}

export function hardReset(cwd, target) {
  execFileSync('git', ['reset', '--hard', target], {
    cwd,
    stdio: 'ignore',
  });
  execFileSync('git', ['clean', '-fd'], {
    cwd,
    stdio: 'ignore',
  });
}

export function relativeToWorktree(worktree, filePath) {
  return path.relative(worktree, filePath) || '.';
}

export function validateLaneResultShape(result) {
  const required = [
    'cycle_id',
    'job_id',
    'lane',
    'phase',
    'target',
    'hypothesis',
    'status',
    'summary',
    'files_changed',
    'commands_run',
    'preflight_baseline',
    'postflight_metrics',
    'known_risks',
    'blockers',
    'recommendation',
    'learning_captured',
    'commit',
  ];

  for (const key of required) {
    if (!(key in result)) {
      throw new Error(`Lane result is missing required field: ${key}`);
    }
  }
}

export function settleQueueAndRuntime(control, queue, outcome, note = '') {
  const runtime = structuredClone(control.runtime);
  const queuePath = activeQueuePath(runtime);
  if (!queuePath || !fs.existsSync(queuePath)) {
    throw new Error('Cannot settle queue without an active queue file.');
  }

  queue.status = outcome;
  queue.settled_at = localTimestamp();
  queue.note = note;
  writeJson(queuePath, queue);

  const queueIndexPath = controlPath('queue', 'index.json');
  const queueIndex = fs.existsSync(queueIndexPath)
    ? readJson(queueIndexPath)
    : { version: 1, active: null, history: [] };
  queueIndex.active = null;
  if (!queueIndex.history.includes(relativeProjectPath(queuePath))) {
    queueIndex.history.push(relativeProjectPath(queuePath));
  }
  writeJson(queueIndexPath, queueIndex);

  runtime.active_cycle = null;
  runtime.active_jobs = [];
  runtime.locks = [];
  runtime.queue = {
    active: null,
    history: queueIndex.history,
  };
  runtime.heartbeat_at = null;
  runtime.last_updated = localTimestamp();

  for (const lockPath of fs.readdirSync(controlPath('locks'))) {
    if (lockPath.endsWith('.json')) {
      fs.unlinkSync(controlPath('locks', lockPath));
    }
  }

  writeJson(projectPath('CLAW/control-plane/state/runtime-state.json'), runtime);
}
