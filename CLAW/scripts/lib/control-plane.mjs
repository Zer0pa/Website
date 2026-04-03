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

export function runWindowModeForProfile(profile, fallback = 'manual-supervised-only') {
  if (profile === 'guarded_local_autonomy') {
    return 'guarded-local-autonomy';
  }

  if (profile === 'extended_local_autonomy') {
    return 'extended-local-autonomy';
  }

  if (profile === 'supervised_dry_run') {
    return 'manual-supervised-only';
  }

  return fallback;
}

export function syncRuntimeCadence(runtime, profile) {
  runtime.active_cadence_profile = profile;
  runtime.run_window = {
    ...(runtime.run_window || {}),
    mode: runWindowModeForProfile(profile, runtime.run_window?.mode || 'manual-supervised-only'),
  };
  return runtime;
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

function readOptionalJson(relativeOrAbsolutePath) {
  const absolutePath = projectPath(relativeOrAbsolutePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function readOpenRouteGaps() {
  const gapDir = projectPath('GGD/gaps/routes');
  if (!fs.existsSync(gapDir)) {
    return [];
  }

  return fs
    .readdirSync(gapDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => readOptionalJson(path.join('GGD/gaps/routes', name)))
    .filter(Boolean)
    .filter((gap) => !['resolved', 'closed', 'archived', 'superseded'].includes(String(gap.status || '').toLowerCase()));
}

function parseRecordedTimestamp(value) {
  if (!value) {
    return null;
  }

  const direct = Date.parse(String(value));
  if (Number.isFinite(direct)) {
    return direct;
  }

  const compactMatch = String(value).match(/(\d{8}T\d{6})Z/);
  if (!compactMatch) {
    return null;
  }

  const compact = compactMatch[1];
  const iso = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T${compact.slice(9, 11)}:${compact.slice(11, 13)}:${compact.slice(13, 15)}Z`;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
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
    'CLAW/control-plane/system-optimizer/state.json',
    'CLAW/control-plane/system-optimizer/backlog.json',
    'CLAW/scripts/verify-systems-optimizer.mjs',
    'CLAW/PRD_SYSTEMS_OPTIMIZER.md',
    'CLAW/control-plane/product-kernel/design-constants.json',
    'CLAW/control-plane/product-kernel/product-family-kernel.json',
    'CLAW/control-plane/product-kernel/flagship-exceptions.imc.json',
    'CLAW/control-plane/product-kernel/packet-binding-rules.json',
    'CLAW/control-plane/runner-policy.json',
  ].filter(Boolean);
}

export function validateControlPlane(control, options = {}) {
  const issues = [];
  const warnings = [];
  const phase = lookupPhase(control.executionPlan, control.runtime.current_phase, options.phase || null);
  const lanesById = laneMap(control.agentLanes);
  const locks = activeLocks();
  const autonomyState = readOptionalJson('CLAW/services/autonomy/state.json');
  const checkpointState = readOptionalJson(control.runtime.hardening_artifacts?.checkpoint_pointer || 'CLAW/control-plane/checkpoints/current.json');
  const openRouteGaps = readOpenRouteGaps();
  const runWindowMode = control.runtime.run_window?.mode || null;
  const hasActiveRunnerWork =
    Boolean(control.runtime.active_cycle) ||
    Boolean(control.runtime.queue?.active) ||
    (control.runtime.active_jobs || []).length > 0;

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
      warnings.push(`Runtime state is missing lane data for ${lane.id}; it will be seeded on the next materialized cycle or lane settlement.`);
    }

    if (!fs.existsSync(lane.worktree)) {
      issues.push(`Missing worktree for ${lane.id}: ${lane.worktree}`);
      continue;
    }

    if (!branchExists(lane.branch, lane.worktree)) {
      warnings.push(`Branch ${lane.branch} is not currently resolvable in ${lane.worktree}`);
    }

    if (lane.id === 'systems-optimizer') {
      if (lane.replayable !== false) {
        issues.push('systems-optimizer lane must set replayable to false.');
      }
      if (!lane.control_plane_only) {
        issues.push('systems-optimizer lane must set control_plane_only to true.');
      }
      const forbiddenPatterns = [
        'CLAW/control-plane/queue/**',
        'CLAW/control-plane/runtime/**',
        'CLAW/control-plane/locks/**',
        'CLAW/control-plane/checkpoints/**',
        'CLAW/control-plane/state/runtime-state.json',
        'CLAW/services/autonomy/state.json',
      ];
      for (const pattern of forbiddenPatterns) {
        if ((lane.writes || []).includes(pattern)) {
          issues.push(`systems-optimizer lane must not write ${pattern}.`);
        }
      }
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

  const checkpointUpdatedAt = parseRecordedTimestamp(checkpointState?.updated_at);
  const staleCheckpointGaps = openRouteGaps.filter((gap) => {
    const gapTimestamp = parseRecordedTimestamp(gap.invalidated_at || gap.updated_at || gap.cycle_id || gap.source_handoff || null);
    return !checkpointUpdatedAt || !gapTimestamp || gapTimestamp >= checkpointUpdatedAt;
  });

  if (control.runtime.gates?.integration_qa_passed && staleCheckpointGaps.length > 0) {
    issues.push(
      `integration_qa_passed is true while open GGD route gaps remain: ${staleCheckpointGaps.map((gap) => gap.id).join(', ')}.`,
    );
  }

  if (checkpointState?.status === 'accepted' && staleCheckpointGaps.length > 0) {
    issues.push(
      `Current checkpoint ${checkpointState.checkpoint_id || 'unknown'} is stale while newer or unresolved GGD route gaps remain: ${staleCheckpointGaps.map((gap) => gap.id).join(', ')}.`,
    );
  }

  if (
    control.runtime.active_cadence_profile &&
    !Object.prototype.hasOwnProperty.call(control.cadence.profiles || {}, control.runtime.active_cadence_profile)
  ) {
    issues.push(`Unknown active_cadence_profile: ${control.runtime.active_cadence_profile}`);
  }

  const expectedRunWindowMode = runWindowModeForProfile(
    control.runtime.active_cadence_profile,
    runWindowMode || 'manual-supervised-only',
  );

  if (control.runtime.active_cadence_profile && runWindowMode && expectedRunWindowMode !== runWindowMode) {
    warnings.push(
      `Runtime cadence profile ${control.runtime.active_cadence_profile} expects run_window.mode ${expectedRunWindowMode}, found ${runWindowMode}.`,
    );
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

  if (autonomyState) {
    if (typeof control.runtime.runner?.enabled === 'boolean' && control.runtime.runner.enabled !== autonomyState.enabled) {
      warnings.push(
        `runtime.runner.enabled (${control.runtime.runner.enabled}) differs from autonomy service enabled (${autonomyState.enabled}).`,
      );
    }

    if (control.runtime.active_cycle?.cycle_id && autonomyState.active_cycle && autonomyState.active_cycle !== control.runtime.active_cycle.cycle_id) {
      warnings.push(
        `runtime.active_cycle (${control.runtime.active_cycle.cycle_id}) differs from autonomy service active_cycle (${autonomyState.active_cycle}).`,
      );
    }

    if (!control.runtime.press_go && autonomyState.enabled && !['guarded-override', 'idle'].includes(autonomyState.mode || 'idle')) {
      issues.push(
        `Autonomy service mode (${autonomyState.mode}) is not allowed while press_go is false.`,
      );
    }

    if (autonomyState.enabled && hasActiveRunnerWork && !autonomyState.pid) {
      issues.push(
        'Autonomy service is enabled with active runner work but no live pid. Restart or clear stale runner state before continuing.',
      );
    }

    if (autonomyState.enabled && hasActiveRunnerWork && !autonomyState.started_at) {
      warnings.push(
        'Autonomy service is enabled with active runner work but started_at is null.',
      );
    }
  } else if (control.runtime.runner?.enabled || hasActiveRunnerWork) {
    warnings.push('Autonomy service state is missing while runtime reports active runner state.');
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
        lane_class: lane.lane_class || 'route',
        replayable: lane.replayable !== false,
        control_plane_only: Boolean(lane.control_plane_only),
        writes: lane.writes,
        objective: laneTemplate.objective,
        deliverables: laneTemplate.deliverables || [],
        acceptance: laneTemplate.acceptance || [],
        depends_on: laneTemplate.depends_on || [],
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

export function laneLockPath(laneId) {
  return controlPath('locks', `${laneId}.json`);
}

export function acquireLaneLock(job, cycleId, phaseId, acquiredAt = localTimestamp()) {
  const heartbeatTtlMinutes = 90;
  const expiresAt = new Date(Date.parse(acquiredAt) + heartbeatTtlMinutes * 60 * 1000).toISOString();
  const lockPath = laneLockPath(job.lane_id);
  writeJson(lockPath, {
    version: 1,
    lock_id: `lock-${job.lane_id}`,
    resource: job.lane_id,
    owner_lane: job.lane_id,
    cycle_id: cycleId,
    phase_id: phaseId,
    acquired_at: acquiredAt,
    heartbeat_at: acquiredAt,
    heartbeat_ttl_minutes: heartbeatTtlMinutes,
    expires_at: expiresAt,
    worktree: job.worktree,
    branch: job.branch,
    status: 'held',
    recovery_action: null,
  });
  return relativeProjectPath(lockPath);
}

export function releaseLaneLock(laneId) {
  const lockPath = laneLockPath(laneId);
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
  return relativeProjectPath(lockPath);
}

export function findLockConflicts(cycle) {
  const conflicts = [];
  const locks = activeLocks();

  for (const job of cycle.jobs) {
    const conflictingLock = locks.find((lock) => {
      const ownerLane = lock.payload.owner_lane || lock.payload.lane_id || null;
      return ownerLane === job.lane_id;
    });
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

  runtime.active_cycle = {
    cycle_id: cycle.cycle_id,
    phase_id: cycle.phase_id,
    profile: cycle.profile,
    queue_file: relativeProjectPath(queuePath),
    lanes: cycle.jobs.map((job) => job.lane_id),
      created_at: cycle.created_at,
  };
  runtime.lanes = runtime.lanes || {};
  for (const job of cycle.jobs) {
    runtime.lanes[job.lane_id] = {
      status: runtime.lanes[job.lane_id]?.status || 'queued',
      last_accepted_commit: runtime.lanes[job.lane_id]?.last_accepted_commit || null,
      last_candidate_commit: runtime.lanes[job.lane_id]?.last_candidate_commit || null,
      last_handoff: runtime.lanes[job.lane_id]?.last_handoff || null,
    };
  }
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
  runtime.locks = [];
  runtime.heartbeat_at = cycle.created_at;
  syncRuntimeCadence(runtime, cycle.profile);
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
