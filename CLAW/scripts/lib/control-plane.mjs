import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const THIS_FILE = fileURLToPath(import.meta.url);
const LIB_ROOT = path.dirname(THIS_FILE);
export const SCRIPTS_ROOT = path.resolve(LIB_ROOT, '..');
export const CLAW_ROOT = path.resolve(SCRIPTS_ROOT, '..');
export const PROJECT_ROOT = path.resolve(CLAW_ROOT, '..');
export const CONTROL_ROOT = path.join(CLAW_ROOT, 'control-plane');

export function projectPath(relativeOrAbsolutePath) {
  return path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(PROJECT_ROOT, relativeOrAbsolutePath);
}

export function controlPath(...parts) {
  return path.join(CONTROL_ROOT, ...parts);
}

export function relativeProjectPath(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath) || '.';
}

export function ensureDir(absoluteDirPath) {
  fs.mkdirSync(absoluteDirPath, { recursive: true });
}

export function readJson(relativeOrAbsolutePath) {
  return JSON.parse(fs.readFileSync(projectPath(relativeOrAbsolutePath), 'utf8'));
}

export function writeJson(absolutePath, value) {
  ensureDir(path.dirname(absolutePath));
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function fileExists(relativeOrAbsolutePath) {
  return fs.existsSync(projectPath(relativeOrAbsolutePath));
}

export function git(args, cwd = PROJECT_ROOT) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function worktreeStatus(cwd) {
  return git(['status', '--short'], cwd);
}

export function branchExists(branch, cwd) {
  try {
    git(['rev-parse', '--verify', branch], cwd);
    return true;
  } catch {
    return false;
  }
}

export function localTimestamp(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function cycleStamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function cycleIdForPhase(phaseId, date = new Date()) {
  return `${phaseId}-${cycleStamp(date)}`;
}

export function phaseToken(value) {
  const match = String(value || '').match(/^([A-Z]\d+)/);
  return match ? match[1] : String(value || '');
}

export function laneMap(agentLanes) {
  return new Map(agentLanes.lanes.map((lane) => [lane.id, lane]));
}

export function loadControlPlane() {
  return {
    agentLanes: readJson('CLAW/control-plane/agent-lanes.json'),
    cadence: readJson('CLAW/control-plane/cadence.json'),
    cycleTemplates: readJson('CLAW/control-plane/cycle-templates.json'),
    executionPlan: readJson('CLAW/control-plane/plans/canonical-routes-to-producing.json'),
    recursiveImprovement: readJson('CLAW/control-plane/recursive-improvement.json'),
    runtime: readJson('CLAW/control-plane/state/runtime-state.json'),
    stateMachine: readJson('CLAW/control-plane/state-machine.json'),
  };
}

export function lookupPhase(executionPlan, runtimePhase, overridePhase = null) {
  const requested = phaseToken(overridePhase || runtimePhase || executionPlan.current_phase);
  return executionPlan.phases.find((phase) => phase.id === requested) || null;
}

function referencedFiles(control) {
  return [
    control.runtime.latest_wave_report,
    control.runtime.phase_plan,
    control.runtime.evidence_manifest,
    control.runtime.execution_prd,
    control.runtime.execution_plan,
    control.runtime.hardening_artifacts?.pattern_library,
    control.runtime.hardening_artifacts?.continuation_state,
    control.runtime.hardening_artifacts?.queue_index,
    control.runtime.hardening_artifacts?.checkpoint_pointer,
    'CLAW/control-plane/cycle-templates.json',
    'CLAW/control-plane/cycle.schema.json',
    'CLAW/control-plane/brief.schema.json',
    'CLAW/control-plane/queue-item.schema.json',
    'CLAW/control-plane/audit-bundle.schema.json',
    'CLAW/control-plane/learning-item.schema.json',
    'CLAW/control-plane/recovery-event.schema.json',
    'CLAW/control-plane/product-kernel/design-constants.json',
    'CLAW/control-plane/product-kernel/product-family-kernel.json',
    'CLAW/control-plane/product-kernel/flagship-exceptions.imc.json',
    'CLAW/control-plane/product-kernel/packet-binding-rules.json',
  ].filter(Boolean);
}

export function validateControlPlane(control, options = {}) {
  const issues = [];
  const warnings = [];
  const phase = lookupPhase(control.executionPlan, control.runtime.current_phase, options.phase || null);
  const lanesById = laneMap(control.agentLanes);
  const locks = activeLocks();

  for (const ref of referencedFiles(control)) {
    if (!fileExists(ref)) {
      issues.push(`Missing referenced file: ${ref}`);
    }
  }

  if (!phase) {
    issues.push(`Runtime phase is not present in the execution plan: ${control.runtime.current_phase}`);
  } else if (control.executionPlan.current_phase !== control.runtime.current_phase) {
    warnings.push(
      `Plan current_phase (${control.executionPlan.current_phase}) differs from runtime current_phase (${control.runtime.current_phase})`,
    );
  }

  for (const lane of control.agentLanes.lanes) {
    if (!control.runtime.lanes[lane.id]) {
      issues.push(`Runtime state is missing lane data for ${lane.id}`);
      continue;
    }

    if (!fs.existsSync(lane.worktree)) {
      issues.push(`Missing worktree for ${lane.id}: ${lane.worktree}`);
      continue;
    }

    if (!branchExists(lane.branch, lane.worktree)) {
      warnings.push(`Branch ${lane.branch} is not currently resolvable in ${lane.worktree}`);
    }

    if (options.checkCleanWorktrees && worktreeStatus(lane.worktree)) {
      warnings.push(`Dirty worktree: ${lane.id}`);
    }
  }

  if (phase?.id === 'C3') {
    if (!control.runtime.gates?.p1_homepage_canonical) {
      issues.push('C3 requires p1_homepage_canonical to be true.');
    }

    if (!control.runtime.gates?.p2_imc_canonical) {
      issues.push('C3 requires p2_imc_canonical to be true.');
    }

    if (!control.runtime.lanes['homepage-fidelity']?.last_accepted_commit) {
      issues.push('C3 requires an accepted homepage-fidelity commit.');
    }

    if (!control.runtime.lanes['imc-flagship']?.last_accepted_commit) {
      issues.push('C3 requires an accepted imc-flagship commit.');
    }
  }

  if (control.runtime.press_go && (control.runtime.blockers || []).length > 0) {
    issues.push('press_go is true while blockers remain in runtime state.');
  }

  if (
    control.runtime.active_cadence_profile &&
    !Object.prototype.hasOwnProperty.call(control.cadence.profiles || {}, control.runtime.active_cadence_profile)
  ) {
    issues.push(`Unknown active_cadence_profile: ${control.runtime.active_cadence_profile}`);
  }

  if (control.runtime.active_cycle?.queue_file && !fileExists(control.runtime.active_cycle.queue_file)) {
    warnings.push(`Runtime references a missing active queue file: ${control.runtime.active_cycle.queue_file}`);
  }

  if (!control.runtime.active_cycle && locks.length > 0) {
    warnings.push('Lock files exist while runtime.active_cycle is null.');
  }

  if (control.runtime.active_cycle && locks.length === 0) {
    warnings.push('runtime.active_cycle is present but no live lock files exist.');
  }

  if (Array.isArray(control.runtime.locks) && control.runtime.locks.length !== locks.length) {
    warnings.push(
      `Runtime lock list length (${control.runtime.locks.length}) differs from live lock count (${locks.length}).`,
    );
  }

  for (const phaseTemplateKey of Object.keys(control.cycleTemplates.phases || {})) {
    const template = control.cycleTemplates.phases[phaseTemplateKey];
    for (const laneEntry of template.lanes || []) {
      if (!lanesById.has(laneEntry.lane_id)) {
        issues.push(`Cycle template ${phaseTemplateKey} references unknown lane ${laneEntry.lane_id}`);
      }
    }
  }

  return {
    clean: issues.length === 0,
    phase: phase?.id || null,
    issues,
    warnings,
  };
}

export function buildCyclePlan(control, options = {}) {
  const phase = lookupPhase(control.executionPlan, control.runtime.current_phase, options.phase || null);

  if (!phase) {
    throw new Error(`Cannot build cycle plan for unknown phase: ${options.phase || control.runtime.current_phase}`);
  }

  const template = control.cycleTemplates.phases[phase.id];

  if (!template) {
    throw new Error(`Missing cycle template for phase ${phase.id}`);
  }

  const lanesById = laneMap(control.agentLanes);
  const createdAt = localTimestamp();
  const cycleId = cycleIdForPhase(phase.id);
  const profile = options.profile || template.profile || control.cycleTemplates.default_profile || 'supervised_dry_run';

  return {
    version: 1,
    cycle_id: cycleId,
    created_at: createdAt,
    phase_id: phase.id,
    phase_title: phase.title,
    current_phase: control.runtime.current_phase,
    profile,
    materialize: Boolean(options.materialize),
    allowed_path_prefixes: control.agentLanes.allowed_path_prefixes,
    stop_conditions: control.runtime.stop_conditions,
    source_files: {
      runtime_state: 'CLAW/control-plane/state/runtime-state.json',
      execution_plan: 'CLAW/control-plane/plans/canonical-routes-to-producing.json',
      cycle_templates: 'CLAW/control-plane/cycle-templates.json',
      agent_lanes: 'CLAW/control-plane/agent-lanes.json',
    },
    jobs: template.lanes.map((laneTemplate, index) => {
      const lane = lanesById.get(laneTemplate.lane_id);
      if (!lane) {
        throw new Error(`Unknown lane in template ${phase.id}: ${laneTemplate.lane_id}`);
      }

      return {
        job_id: `${cycleId}-${String(index + 1).padStart(2, '0')}`,
        lane_id: lane.id,
        branch: lane.branch,
        worktree: lane.worktree,
        role: lane.role,
        reasoning: lane.reasoning,
        writes: lane.writes,
        objective: laneTemplate.objective,
        deliverables: laneTemplate.deliverables || [],
        acceptance: laneTemplate.acceptance || [],
      };
    }),
  };
}

export function activeLocks() {
  const lockDir = controlPath('locks');
  if (!fs.existsSync(lockDir)) {
    return [];
  }

  return fs
    .readdirSync(lockDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      file,
      absolutePath: path.join(lockDir, file),
      payload: readJson(path.join(lockDir, file)),
    }));
}

export function findLockConflicts(cycle) {
  const conflicts = [];
  const locks = activeLocks();

  for (const job of cycle.jobs) {
    const conflictingLock = locks.find((lock) => lock.payload.lane_id === job.lane_id);
    if (conflictingLock) {
      conflicts.push({
        lane_id: job.lane_id,
        lock_file: relativeProjectPath(conflictingLock.absolutePath),
        cycle_id: conflictingLock.payload.cycle_id,
      });
    }
  }

  return conflicts;
}

export function materializeCycle(control, cycle) {
  const queuePath = controlPath('queue', `${cycle.cycle_id}.json`);
  const queueIndexPath = controlPath('queue', 'index.json');
  const runtimePath = projectPath('CLAW/control-plane/state/runtime-state.json');
  const runtime = structuredClone(control.runtime);
  const heartbeatTtlMinutes = runtime.retry_budget?.lock_heartbeat_ttl_minutes || 90;
  const expiresAt = new Date(Date.parse(cycle.created_at) + heartbeatTtlMinutes * 60 * 1000).toISOString();

  writeJson(queuePath, {
    ...cycle,
    status: 'queued',
    jobs: cycle.jobs.map((job) => ({
      ...job,
      status: 'queued',
    })),
  });

  const queueIndex = fs.existsSync(queueIndexPath)
    ? readJson(queueIndexPath)
    : { version: 1, active: null, history: [] };
  queueIndex.active = relativeProjectPath(queuePath);
  if (!queueIndex.history.includes(relativeProjectPath(queuePath))) {
    queueIndex.history.push(relativeProjectPath(queuePath));
  }
  writeJson(queueIndexPath, queueIndex);

  for (const job of cycle.jobs) {
    const lockPath = controlPath('locks', `${job.lane_id}.json`);
    writeJson(lockPath, {
      version: 1,
      lock_id: `lock-${job.lane_id}`,
      resource: job.lane_id,
      owner_lane: job.lane_id,
      cycle_id: cycle.cycle_id,
      phase_id: cycle.phase_id,
      acquired_at: cycle.created_at,
      heartbeat_at: cycle.created_at,
      heartbeat_ttl_minutes: heartbeatTtlMinutes,
      expires_at: expiresAt,
      worktree: job.worktree,
      branch: job.branch,
      status: 'held',
      recovery_action: null,
    });
  }

  runtime.active_cycle = {
    cycle_id: cycle.cycle_id,
    phase_id: cycle.phase_id,
    profile: cycle.profile,
    queue_file: relativeProjectPath(queuePath),
    lanes: cycle.jobs.map((job) => job.lane_id),
      created_at: cycle.created_at,
  };
  runtime.queue = {
    active: relativeProjectPath(queuePath),
    history: queueIndex.history,
  };
  runtime.active_jobs = cycle.jobs.map((job) => ({
    job_id: job.job_id,
    lane_id: job.lane_id,
    status: 'queued',
    target: job.objective,
  }));
  runtime.locks = cycle.jobs.map((job) => `CLAW/control-plane/locks/${job.lane_id}.json`);
  runtime.heartbeat_at = cycle.created_at;
  runtime.active_cadence_profile = cycle.profile;
  runtime.last_updated = cycle.created_at;
  writeJson(runtimePath, runtime);

  return {
    queuePath,
    runtimePath,
  };
}

export function settleActiveCycle(control, outcome, note = '') {
  const runtime = structuredClone(control.runtime);
  const activeCycle = runtime.active_cycle;
  const queueIndexPath = controlPath('queue', 'index.json');

  if (!activeCycle) {
    throw new Error('No active cycle is present in runtime state.');
  }

  for (const laneId of activeCycle.lanes || []) {
    const lockPath = controlPath('locks', `${laneId}.json`);
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  }

  if (activeCycle.queue_file && fileExists(activeCycle.queue_file)) {
    const queuePath = projectPath(activeCycle.queue_file);
    const queue = readJson(queuePath);
    queue.status = outcome;
    queue.settled_at = localTimestamp();
    queue.note = note;
    writeJson(queuePath, queue);
  }

  if (fs.existsSync(queueIndexPath)) {
    const queueIndex = readJson(queueIndexPath);
    queueIndex.active = null;
    if (activeCycle.queue_file && !queueIndex.history.includes(activeCycle.queue_file)) {
      queueIndex.history.push(activeCycle.queue_file);
    }
    writeJson(queueIndexPath, queueIndex);
    runtime.queue = {
      active: null,
      history: queueIndex.history,
    };
  }

  runtime.active_cycle = null;
  runtime.active_jobs = [];
  runtime.locks = [];
  runtime.heartbeat_at = null;
  runtime.last_updated = localTimestamp();
  writeJson(projectPath('CLAW/control-plane/state/runtime-state.json'), runtime);
}
