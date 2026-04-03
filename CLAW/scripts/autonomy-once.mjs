#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  buildCyclePlan,
  controlPath,
  git,
  loadControlPlane,
  localTimestamp,
  materializeCycle,
  projectPath,
  readJson,
  relativeProjectPath,
  settleActiveCycle,
  validateControlPlane,
  writeJson,
} from './lib/control-plane.mjs';
import {
  LANE_RESULT_SCHEMA,
  activeQueueJobs,
  briefPath,
  cherryPickCommit,
  commitPatchEquivalent,
  commitReachable,
  createHostCommit,
  diffFilesSince,
  ensureAutonomyDirs,
  ensureCleanWorktree,
  ensureLaneSiteDependencies,
  finalMessagePath,
  gitAbsolutePath,
  gitHead,
  handoffPath,
  hardReset,
  loadActiveQueue,
  matchesAllowedPath,
  nextPhase,
  nextRunnableJob,
  phaseLabel,
  promptSnapshotPath,
  queueJobIsTerminal,
  readRunnerState,
  replayCommitRange,
  settleQueueAndRuntime,
  stderrLogPath,
  stdoutLogPath,
  validateLaneResultShape,
  writeActiveQueue,
  writeRunnerState,
} from './lib/autonomy.mjs';

function readArg(prefix, fallback = null) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function parseBoolFlag(flag) {
  return process.argv.includes(flag);
}

function updateRuntime(mutator) {
  const runtimePath = projectPath('CLAW/control-plane/state/runtime-state.json');
  const runtime = readJson(runtimePath);
  const next = structuredClone(runtime);
  mutator(next);
  writeJson(runtimePath, next);
  return next;
}

function readTextTail(filePath, maxChars = 4000) {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) {
    return '';
  }

  return text.slice(-maxChars);
}

function quoteShellArg(value) {
  if (/^[A-Za-z0-9_./:=+-]+$/.test(value)) {
    return value;
  }

  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
}

function buildBrief(control, queue, job) {
  const currentIndex = (queue.jobs || []).findIndex((candidate) => candidate.job_id === job.job_id);
  const previousJobs = (queue.jobs || [])
    .slice(0, Math.max(currentIndex, 0))
    .map((candidate) => ({
      job_id: candidate.job_id,
      lane_id: candidate.lane_id,
      status: candidate.status,
      final_message: candidate.final_message || null,
      final_message_absolute: candidate.final_message ? projectPath(candidate.final_message) : null,
      candidate_commit: candidate.candidate_commit || null,
      handoff_file: candidate.handoff_file || null,
      handoff_file_absolute: candidate.handoff_file ? projectPath(candidate.handoff_file) : null,
    }));
  const flagshipInvariants =
    queue.phase_id === 'C4' || queue.phase_id === 'C5'
      ? [
          'ZPE-IMC must remain a dedicated flagship profile inside the shared work-lane kernel.',
          'The /imc route must continue to expose imc.* data-spec keys, not work.lane.* keys.',
          'Generic work-lane generalization may remove IMC drift from /work/[slug], but it may not flatten or delete flagship-only behavior.',
        ]
      : [];
  const acceptance = [...(job.acceptance || [])];
  if (flagshipInvariants.length > 0 && ['product-family', 'systems-qa', 'integration'].includes(job.lane_id)) {
    acceptance.push('ZPE-IMC flagship invariants remain intact.');
  }

  return {
    version: 1,
    cycle_id: queue.cycle_id,
    job_id: job.job_id,
    lane_id: job.lane_id,
    phase_id: queue.phase_id,
    phase_title: queue.phase_title,
    objective: job.objective,
    role: job.role,
    worktree: job.worktree,
    branch: job.branch,
    authority_commit: gitHead(projectPath('.')),
    runner_policy: 'CLAW/control-plane/runner-policy.json',
    allowed_writes: job.writes,
    acceptance,
    deliverables: job.deliverables || [],
    stop_conditions: queue.stop_conditions || [],
    operator_interface: control.runtime.operator_interface,
    flagship_invariants: flagshipInvariants,
    suggested_starting_points: suggestedStartingPoints(job),
    deterministic_rules: [
      'No guessing or probabilistic invention.',
      'Design, layout, color, and hierarchy must remain mathematically defensible.',
      'Do one bounded slice only.',
      'Keep the worktree clean before exit. Commit locally if possible; otherwise leave an allowed diff for host-runner finalization.',
      'Do not write outside the lane worktree.',
      'Do not push, deploy, or touch other repositories.',
      'Generic route work may not flatten or delete flagship-only IMC behavior.',
    ],
    upstream: previousJobs,
    runtime_focus: {
      current_phase: control.runtime.current_phase,
      current_milestone: control.runtime.current_milestone,
      latest_audits: control.runtime.latest_audits,
      gates: control.runtime.gates,
      blockers: control.runtime.blockers,
    },
  };
}

function suggestedStartingPoints(job) {
  const defaults = job.writes.slice(0, 5);
  const byLane = {
    'product-family': [
      'site/src/app/work/[slug]/page.tsx',
      'site/src/components/lane/LaneAuthorityPage.tsx',
      'site/src/lib/data/presentation.ts',
      'site/src/lib/layout/specs.ts',
      'site/.cache/packets/ZPE-XR.json',
    ],
    'data-truth': [
      'site/.cache/packets/ZPE-XR.json',
      'site/src/lib/data/lane-data.ts',
      'site/src/lib/parser/**',
      'site/src/lib/github/**',
      'site/src/lib/data/**',
    ],
    'systems-qa': [
      'deterministic-design-system/reports/**',
      'deterministic-design-system/maps/**',
      'site/src/lib/layout/specs.ts',
      'site/src/scripts/layout-diff.ts',
      'site/src/scripts/responsive-audit.ts',
    ],
    integration: [
      'site/**',
      'deterministic-design-system/**',
      'CLAW/control-plane/state/runtime-state.json',
      'CLAW/control-plane/plans/canonical-routes-to-producing.json',
      'CLAW/control-plane/runtime/handoffs/**',
    ],
  };

  return byLane[job.lane_id] || defaults;
}

function buildPrompt(control, queue, job, brief, briefFile) {
  const laneRecipe = laneExecutionRecipe(job);

  return [
    '# CLAW Lane Execution',
    '',
    'You are one bounded lane inside the Zer0pa Website CLAW machine.',
    '',
    'Core rules:',
    '- Work only inside your assigned worktree.',
    '- Write only paths allowed for your lane.',
    '- Do one bounded slice that materially advances the current phase.',
    '- No guesses, no vibes, no creativity without law.',
    '- Preserve deterministic geometry, truth integrity, and falsification discipline.',
    '- If you change files, commit locally before finishing when possible.',
    '- If sandbox prevents a local commit, leave the allowed diff in place, set commit to null, and describe the block in JSON instead of resetting anything.',
    '- If the honest result is "not enough context" or "blocked by predecessor", say so in structured form.',
    '',
    `Current phase: ${queue.phase_id} / ${queue.phase_title}`,
    `Lane: ${job.lane_id}`,
    `Objective: ${job.objective}`,
    `Allowed writes: ${job.writes.join(', ')}`,
    '',
    `Audit copy of the brief: ${briefFile}`,
    'The authoritative brief is embedded below. Honor it exactly.',
    '',
    '```json',
    JSON.stringify(brief, null, 2),
    '```',
    '',
    'Lane-specific execution recipe:',
    ...laneRecipe,
    '',
    'Before acting:',
    '- inspect only the smallest relevant code and current state needed for this slice',
    '- verify your baseline in the worktree',
    '- keep the slice minimal and test-backed',
    '- do not use shell commands to print narration or status updates',
    '- when a file path contains brackets or wildcard-like characters, wrap it in single quotes when using shell commands',
    '- do not try to load external skills from ~/.codex/skills unless the brief explicitly requires one',
    '- do not read AGENTS.md, SKILL.md, geometry-program.md, or broad PRD/governance files unless the brief lacks a specific fact you need',
    '- start with the suggested starting points from the brief and read at most 6 repo files before either editing or returning a structured non-acceptance',
    '- if targeted inspection shows the slice cannot honestly advance, return a structured non-acceptance quickly instead of continuing to explore',
    '',
    'Final response requirements:',
    '- respond with JSON only, matching the provided output schema',
    '- include exact files changed and exact commands run',
    '- include a real commit hash if you committed work, or null if you made no commit',
    '- status must be one of: accepted, rejected, hold, escalated',
    '- preflight_baseline and postflight_metrics must each be objects with a notes array',
    '- audit_result must be null, a string, or an object with summary, status, notes, and report',
    '',
    'Status guidance:',
    '- accepted: you made a bounded improvement or completed the audit truthfully',
    '- rejected: you falsified the candidate and it should not promote',
    '- hold: prerequisite state is missing but there is no broader system failure',
    '- escalated: the lane encountered a real blocker, contradiction, or scope collision',
    '',
    'Deterministic doctrine to honor:',
    '- the mockups and existing laws are authoritative, not inspirational',
    '- geometry, ratios, and color decisions must be explicit and measurable',
    '- truth surfaces may not fabricate claims or repo state',
    '- reject any regression rather than rationalize it',
    ...(brief.flagship_invariants?.length
      ? [
          '',
          'Flagship invariants that must remain true in this phase:',
          ...brief.flagship_invariants.map((rule) => `- ${rule}`),
        ]
      : []),
    '',
    'Do the work now.',
    '',
  ].join('\n');
}

function laneExecutionRecipe(job) {
  const recipes = {
    'product-family': [
      '- Read only these files first: `site/src/app/work/[slug]/page.tsx`, `site/src/components/lane/LaneAuthorityPage.tsx`, `site/src/lib/data/presentation.ts`, `site/src/lib/types/lane.ts`, and `site/.cache/packets/ZPE-XR.json`.',
      '- When using the shell, wrap `site/src/app/work/[slug]/page.tsx` in single quotes so the brackets are treated literally.',
      '- If a shared work-lane kernel model does not exist, add exactly one under `site/src/lib/product-kernel/**` and keep it packet-driven.',
      '- Remove IMC-only or flagship-only truth drift from generic work-lane rendering. Do not invent new marketing copy.',
      '- Preserve the dedicated `ZPE-IMC` flagship branch in `site/src/lib/product-kernel/workLaneKernel.ts`; do not collapse IMC into the generic work-lane profile.',
      '- Verify with `npm run build` and `node --import tsx src/scripts/test-parser.ts` from `site/`.',
      '- Prefer one bounded kernel/generalization slice over route-specific tweaks.',
    ],
    'data-truth': [
      '- Read the XR packet and only the smallest parser/data files needed to confirm truth sufficiency.',
      '- Do not rewrite ingestion architecture unless the XR packet is provably insufficient or contradictory.',
      '- Favor a report-only slice if truth is already sufficient.',
    ],
    'systems-qa': [
      '- Audit the target route and any shared law or shared kernel dependency it relies on.',
      '- If the accepted upstream slice touches `site/src/lib/product-kernel/**` or `site/src/components/lane/LaneAuthorityPage.tsx`, verify `/imc` still exposes flagship-only behavior and `imc.*` measurement keys.',
      '- Prefer running `npm run audit:quality` when a shared route/kernel surface changed, then add targeted layout/responsive falsification for the target route.',
      '- Reject regressions instead of explaining them away.',
      '- Prefer report artifacts over code edits unless the audit harness itself is broken.',
    ],
    integration: [
      '- Replay only the accepted candidate into the integration lane.',
      '- If the replayed slice touched the shared work-lane kernel or lane authority page, verify the IMC flagship invariants before accepting promotion.',
      '- Favor build, parser, and quality falsification over narrative reassurance.',
      '- Do not broaden scope beyond conflict-free promotion and replay verification.',
    ],
  };

  return recipes[job.lane_id] || ['- Stay inside the lane brief and keep the slice minimal.'];
}

function writeCycleReport(control, queue, outcome) {
  const reportPath = controlPath('reports', `${queue.cycle_id}.md`);
  const lines = [
    `# ${queue.cycle_id}`,
    '',
    `- phase: \`${queue.phase_id}\``,
    `- title: \`${queue.phase_title}\``,
    `- outcome: \`${outcome}\``,
    `- settled_at: \`${localTimestamp()}\``,
    '',
    '## Jobs',
    '',
  ];

  for (const job of queue.jobs || []) {
    lines.push(`- ${job.lane_id}: \`${job.status}\``);
    if (job.candidate_commit) {
      lines.push(`  commit: \`${job.candidate_commit}\``);
    }
    if (job.handoff_file) {
      lines.push(`  handoff: \`${job.handoff_file}\``);
    }
  }

  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');
  return relativeProjectPath(reportPath);
}

function updateCanonicalPlans(control, completedPhaseId) {
  const canonicalPlanPath = projectPath('CLAW/control-plane/plans/canonical-routes-to-producing.json');
  const canonicalPlan = readJson(canonicalPlanPath);
  const completedPhase = canonicalPlan.phases.find((phase) => phase.id === completedPhaseId);
  if (completedPhase) {
    completedPhase.status = 'completed';
  }

  const next = nextPhase(canonicalPlan, completedPhaseId);
  if (next) {
    next.status = 'in_progress';
    canonicalPlan.current_phase = phaseLabel(next);
  }

  writeJson(canonicalPlanPath, canonicalPlan);

  const deterministicPlanPath = projectPath('CLAW/control-plane/plans/deterministic-recursive-production.json');
  const deterministicPlan = readJson(deterministicPlanPath);
  if (completedPhaseId === 'C5') {
    deterministicPlan.current_focus = ['D3', 'D7'];
  } else if (completedPhaseId === 'C6') {
    deterministicPlan.current_focus = ['D7'];
  }
  writeJson(deterministicPlanPath, deterministicPlan);

  return next;
}

function finalizeCycle(control, queue) {
  const statuses = (queue.jobs || []).map((job) => job.status);
  let outcome = 'checkpointed';

  if (statuses.some((status) => status === 'escalated' || status === 'hold')) {
    outcome = 'escalated';
  } else if (statuses.some((status) => status === 'rejected')) {
    outcome = 'rejected';
  } else if (!statuses.every((status) => status === 'accepted')) {
    outcome = 'abandoned';
  }

  const reportRelativePath = writeCycleReport(control, queue, outcome);
  settleQueueAndRuntime(control, queue, outcome, `autonomy outcome for ${queue.cycle_id}`);

  const next = outcome === 'checkpointed' ? updateCanonicalPlans(control, queue.phase_id) : null;

  updateRuntime((runtime) => {
    runtime.latest_wave_report = reportRelativePath;
    runtime.last_updated = localTimestamp();
    runtime.last_health_check = localTimestamp();
    runtime.runner = {
      ...(runtime.runner || {}),
      enabled: true,
      mode: 'guarded-override',
      last_cycle: queue.cycle_id,
      last_outcome: outcome,
    };

    if (outcome === 'checkpointed' && next) {
      runtime.current_phase = phaseLabel(next);
      runtime.next_actions = [
        `Execute ${next.id} using the same autonomous loop.`,
        'Keep the loop local-only and repo-scoped.',
        'Keep press_go false until the producing readiness and guarded autonomy gates are satisfied.',
      ];
    }

    if (queue.phase_id === 'C6' && outcome === 'checkpointed') {
      runtime.gates.supervised_cycle_passed = true;
    }
  });

  return {
    outcome,
    report: reportRelativePath,
    next_phase: next ? phaseLabel(next) : null,
  };
}

function spawnCodexForJob(job, prompt) {
  const outputPath = finalMessagePath(job.job_id);
  const stdoutPath = stdoutLogPath(job.job_id);
  const stderrPath = stderrLogPath(job.job_id);
  const gitAdminDir = gitAbsolutePath(job.worktree, '--git-dir');
  const gitCommonDir = gitAbsolutePath(job.worktree, '--git-common-dir');
  const stdoutStream = fs.createWriteStream(stdoutPath, { flags: 'w' });
  const stderrStream = fs.createWriteStream(stderrPath, { flags: 'w' });

  const args = [
    'exec',
    '-',
    '-C',
    job.worktree,
    '-m',
    'gpt-5.4',
    '-c',
    `model_reasoning_effort="${job.reasoning || 'high'}"`,
    '--sandbox',
    'workspace-write',
    '--add-dir',
    gitAdminDir,
    '--add-dir',
    gitCommonDir,
    '--json',
    '--output-schema',
    LANE_RESULT_SCHEMA,
    '-o',
    outputPath,
    '--color',
    'never',
  ];
  const commandText = ['codex', ...args.map((arg) => quoteShellArg(arg))].join(' ');

  return new Promise((resolve) => {
    let finished = false;
    const finish = (payload) => {
      if (finished) {
        return;
      }
      finished = true;
      stdoutStream.end();
      stderrStream.end();
      resolve(payload);
    };

    const child = spawn('codex', args, {
      cwd: job.worktree,
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout.pipe(stdoutStream);
    child.stderr.pipe(stderrStream);
    child.stdin.end(prompt);

    child.on('error', (error) => {
      finish({
        code: null,
        signal: 'spawn-error',
        spawnError: error instanceof Error ? error.message : String(error),
        outputPath,
        stdoutPath,
        stderrPath,
        commandText,
      });
    });

    child.on('close', (code, signal) => {
      finish({
        code,
        signal,
        outputPath,
        stdoutPath,
        stderrPath,
        commandText,
      });
    });
  });
}

function syntheticLaneResult(queue, job, worktreeHead, execResult, reason) {
  const stderrTail = execResult?.stderrPath ? readTextTail(execResult.stderrPath) : '';
  const blockers = [reason];
  if (execResult?.spawnError) {
    blockers.push(`spawn_error: ${execResult.spawnError}`);
  }
  if (stderrTail) {
    blockers.push(`stderr: ${stderrTail}`);
  }

  return {
    cycle_id: queue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    phase: queue.phase_id,
    target: job.objective,
    hypothesis: 'The lane should fail closed and preserve determinism when execution cannot return a valid structured result.',
    status: 'escalated',
    summary: 'The autonomy runner did not receive a valid structured lane result and escalated the slice.',
    files_changed: [],
    commands_run: execResult?.commandText ? [execResult.commandText] : [],
    preflight_baseline: {
      notes: [`worktree_head=${worktreeHead}`],
    },
    postflight_metrics: {
      notes: [
        `exit_code=${String(execResult?.code ?? 'null')}`,
        `signal=${String(execResult?.signal ?? 'null')}`,
      ],
    },
    audit_result: null,
    known_risks: [
      'The lane did not complete its bounded slice.',
    ],
    blockers,
    recommendation: 'Inspect the lane stderr log, correct the execution contract, and rerun the slice.',
    next_hypothesis: null,
    rollback_target: worktreeHead,
    learning_captured: [
      'Autonomous lane execution must fail closed when the Codex CLI contract or final schema output is invalid.',
    ],
    commit: null,
  };
}

function laneEscalationIsCommitOnly(laneResult) {
  if (laneResult.status !== 'escalated') {
    return false;
  }

  const auditStatus =
    laneResult.audit_result && typeof laneResult.audit_result === 'object'
      ? String(laneResult.audit_result.status || '').toLowerCase()
      : '';

  if (auditStatus === 'blocked-on-commit') {
    return true;
  }

  const combined = [...(laneResult.blockers || []), laneResult.summary || '', laneResult.recommendation || '']
    .join('\n')
    .toLowerCase();

  const mentionsCommit = /commit|git refs|object store|sandbox/.test(combined);
  const mentionsOtherFailure = /unauthorized|layout audit|responsive|regression|truth contradiction|build failure|parser/.test(combined);
  return mentionsCommit && !mentionsOtherFailure;
}

function shouldHostFinalizeDirtySlice(laneResult) {
  return laneResult.status === 'accepted' || laneEscalationIsCommitOnly(laneResult);
}

function defaultHostCommitMessage(queue, job) {
  return `claw(${job.lane_id}): ${queue.phase_id} ${job.objective}`;
}

function makeStaleJobHandoff(queue, job, reason) {
  return {
    cycle_id: queue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    phase: queue.phase_id,
    target: job.objective,
    hypothesis: 'Stale running jobs must be converted into explicit escalations before the next lane lease.',
    status: 'escalated',
    files_changed: [],
    commands_run: [],
    preflight_baseline: { notes: [] },
    postflight_metrics: { notes: [] },
    audit_result: null,
    known_risks: ['The prior lane invocation exited without settling the queue.'],
    blockers: [reason],
    recommendation: 'Recover the stale job, repair the runner or lane contract, and rematerialize the phase automatically.',
    next_hypothesis: null,
    rollback_target: null,
    learning_captured: ['Stale running jobs must be recovered before any new lease starts.'],
  };
}

function makeStaleJobLaneResult(queue, job, reason) {
  return {
    cycle_id: queue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    phase: queue.phase_id,
    target: job.objective,
    hypothesis: 'Stale running jobs must be escalated, cleaned up, and rematerialized as a fresh phase attempt.',
    status: 'escalated',
    summary: 'The autonomy runner recovered a stale running or leased job before rematerializing the phase.',
    files_changed: [],
    commands_run: [],
    preflight_baseline: { notes: [] },
    postflight_metrics: { notes: [] },
    audit_result: null,
    known_risks: ['The prior lane invocation exited without settling the queue.'],
    blockers: [reason],
    recommendation: 'Repair the stale runner path and continue from the rematerialized phase queue.',
    next_hypothesis: null,
    rollback_target: null,
    learning_captured: ['Stale running jobs must be converted into explicit escalations before recursive execution continues.'],
    commit: null,
  };
}

function writeRecoveryEvent(control, queue, recoveredJobIds) {
  const eventId = `RECOVER-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
  const eventPath = controlPath('recoveries', `${eventId}.json`);
  writeJson(eventPath, {
    event_id: eventId,
    cycle_id: queue.cycle_id,
    reason: 'stale-active-job-rematerialization',
    released_locks: control.runtime.locks || [],
    runtime_mutation: `Escalated stale jobs ${recoveredJobIds.join(', ')} and cleared the active cycle before rematerializing ${queue.phase_id}.`,
    created_at: localTimestamp(),
  });
  return relativeProjectPath(eventPath);
}

function recoverStaleActiveJobs(control, queue, queuePath, runnerState) {
  const staleJobs = activeQueueJobs(queue);
  if (staleJobs.length === 0) {
    return {
      queue,
      recovered: false,
      phaseId: null,
      recoveredJobIds: [],
      recoveryEvent: null,
    };
  }

  const recoveredAt = localTimestamp();
  const recoveredJobIds = [];
  const staleLaneUpdates = [];

  for (const job of staleJobs) {
    const recoveryReason = `Recovered stale ${job.status} job before new execution lease: ${job.job_id}`;
    const finalMessageFile = finalMessagePath(job.job_id);
    const handoffFile = handoffPath(job.job_id);
    writeJson(finalMessageFile, makeStaleJobLaneResult(queue, job, recoveryReason));
    writeJson(handoffFile, makeStaleJobHandoff(queue, job, recoveryReason));
    try {
      hardReset(job.worktree, gitHead(job.worktree));
    } catch {}
    job.status = 'escalated';
    job.finished_at = recoveredAt;
    job.final_message = relativeProjectPath(finalMessageFile);
    job.handoff_file = relativeProjectPath(handoffFile);
    recoveredJobIds.push(job.job_id);
    staleLaneUpdates.push({
      laneId: job.lane_id,
      handoffFile: relativeProjectPath(handoffFile),
    });
  }

  const note = `Recovered stale running or leased jobs and rematerialized ${queue.phase_id}: ${recoveredJobIds.join(', ')}`;
  queue.status = 'escalated';
  queue.settled_at = recoveredAt;
  queue.note = note;
  writeActiveQueue(queuePath, queue);

  const recoveryEvent = writeRecoveryEvent(control, queue, recoveredJobIds);
  settleActiveCycle(loadControlPlane(), 'escalated', note);

  updateRuntime((runtime) => {
    runtime.last_recovery_event = recoveryEvent;
    runtime.last_updated = recoveredAt;
    for (const update of staleLaneUpdates) {
      runtime.lanes[update.laneId] = {
        ...(runtime.lanes[update.laneId] || {}),
        status: 'escalated',
        last_handoff: update.handoffFile,
      };
    }
    runtime.runner = {
      ...(runtime.runner || {}),
      enabled: true,
      mode: 'guarded-override',
      last_cycle: queue.cycle_id,
      last_outcome: 'escalated',
    };
  });

  runnerState.active_cycle = null;
  runnerState.active_job = null;
  runnerState.last_error = null;
  runnerState.last_result = {
    cycle_id: queue.cycle_id,
    job_id: recoveredJobIds[0] || null,
    lane: staleJobs[0]?.lane_id || null,
    status: 'escalated',
    handoff_file: staleLaneUpdates[0]?.handoffFile || null,
    candidate_commit: null,
    next_job: null,
    violation: note,
    recovery_event: recoveryEvent,
  };
  writeRunnerState(runnerState);
  return {
    queue: null,
    recovered: true,
    phaseId: queue.phase_id,
    recoveredJobIds,
    recoveryEvent,
  };
}

function acceptedUpstreamJobs(queue, job) {
  const currentIndex = (queue.jobs || []).findIndex((candidate) => candidate.job_id === job.job_id);
  if (currentIndex <= 0) {
    return [];
  }

  return (queue.jobs || [])
    .slice(0, currentIndex)
    .filter((candidate) => candidate.status === 'accepted' && candidate.candidate_commit);
}

function replayAcceptedUpstreamCommits(queue, job) {
  const upstreamJobs = acceptedUpstreamJobs(queue, job);
  if (upstreamJobs.length === 0) {
    return [];
  }

  const applied = [];
  for (const upstreamJob of upstreamJobs) {
    const replayRange = replayCommitRange(job.worktree, upstreamJob.candidate_commit);
    for (const commit of replayRange) {
      if (commitReachable(job.worktree, commit) || commitPatchEquivalent(job.worktree, commit)) {
        continue;
      }
      cherryPickCommit(job.worktree, commit);
      applied.push(commit);
    }
  }
  return applied;
}

function settleFatalRunnerState(error) {
  const control = loadControlPlane();
  if (!control.runtime.active_cycle) {
    return null;
  }

  const queue = loadActiveQueue(control.runtime);
  if (!queue) {
    settleActiveCycle(control, 'escalated', `runner fatal error: ${error.message}`);
    return null;
  }

  const activeJobId = readRunnerState().active_job || (queue.jobs || []).find((job) => job.status === 'running')?.job_id || null;
  const queueJob = activeJobId ? (queue.jobs || []).find((job) => job.job_id === activeJobId) : null;

  if (queueJob && !queueJobIsTerminal(queueJob.status)) {
    const handoff = {
      cycle_id: queue.cycle_id,
      job_id: queueJob.job_id,
      lane: queueJob.lane_id,
      phase: queue.phase_id,
      target: queueJob.objective,
      hypothesis: 'Internal runner failures must escalate immediately rather than leaving the queue wedged.',
      status: 'escalated',
      files_changed: [],
      commands_run: [],
      preflight_baseline: { notes: [] },
      postflight_metrics: { notes: [] },
      audit_result: null,
      known_risks: [
        'The lane did not finish because the autonomy runner failed internally.',
      ],
      blockers: [error.message],
      recommendation: 'Repair the runner and resume the phase from a clean checkpoint.',
      next_hypothesis: null,
      rollback_target: null,
      learning_captured: [
        'Internal runner exceptions must be recorded as escalations instead of leaving active jobs in running state.',
      ],
    };
    const handoffFile = handoffPath(queueJob.job_id);
    writeJson(handoffFile, handoff);
    queueJob.status = 'escalated';
    queueJob.finished_at = localTimestamp();
    queueJob.handoff_file = relativeProjectPath(handoffFile);
    writeActiveQueue(projectPath(control.runtime.active_cycle.queue_file), queue);
  }

  settleActiveCycle(loadControlPlane(), 'escalated', `runner fatal error: ${error.message}`);
  return queueJob?.job_id || null;
}

function materializeIfNeeded(control, phaseOverride) {
  if (control.runtime.active_cycle) {
    return control;
  }

  const cycle = buildCyclePlan(control, {
    phase: phaseOverride,
    profile: control.runtime.active_cadence_profile || 'guarded_local_autonomy',
    materialize: true,
  });
  materializeCycle(control, cycle);
  return loadControlPlane();
}

async function main() {
  ensureAutonomyDirs();

  const validation = validateControlPlane(loadControlPlane());
  if (!validation.clean) {
    throw new Error(`Control plane validation failed: ${validation.issues.join('; ')}`);
  }

  const phaseOverride = readArg('--phase=');
  let control = materializeIfNeeded(loadControlPlane(), phaseOverride);
  let queue = loadActiveQueue(control.runtime);

  if (!queue) {
    throw new Error('No active queue exists after materialization.');
  }

  const runnerState = readRunnerState();
  let queuePath = projectPath(control.runtime.active_cycle.queue_file);
  const staleRecovery = recoverStaleActiveJobs(control, queue, queuePath, runnerState);
  if (staleRecovery.recovered) {
    control = materializeIfNeeded(loadControlPlane(), staleRecovery.phaseId || phaseOverride);
    queue = loadActiveQueue(control.runtime);
    if (!queue) {
      throw new Error(`No active queue exists after rematerializing ${staleRecovery.phaseId || phaseOverride || 'the current phase'}.`);
    }
    queuePath = projectPath(control.runtime.active_cycle.queue_file);
  } else {
    queue = staleRecovery.queue;
  }

  const activeJobs = activeQueueJobs(queue);
  if (activeJobs.length > 0) {
    const activeJob = activeJobs[0];
    const busyPayload = {
      cycle_id: queue.cycle_id,
      job_id: activeJob.job_id,
      lane: activeJob.lane_id,
      status: activeJob.status,
      handoff_file: activeJob.handoff_file || null,
      candidate_commit: activeJob.candidate_commit || null,
      next_job: null,
      violation: `Active job ${activeJob.job_id} remains in ${activeJob.status}; no new lease was started.`,
    };
    writeRunnerState({
      ...readRunnerState(),
      enabled: true,
      mode: 'guarded-override',
      last_tick_at: localTimestamp(),
      last_result: busyPayload,
      active_cycle: queue.cycle_id,
      active_job: activeJob.job_id,
      last_error: null,
    });
    console.log(JSON.stringify(busyPayload, null, 2));
    return;
  }

  const job = nextRunnableJob(queue);
  if (!job) {
    const finalized = finalizeCycle(control, queue);
    writeRunnerState({
      ...readRunnerState(),
      enabled: true,
      mode: 'guarded-override',
      last_tick_at: localTimestamp(),
      last_result: finalized,
      active_cycle: null,
      active_job: null,
      last_error: null,
    });
    console.log(JSON.stringify({ finalized }, null, 2));
    return;
  }

  const freshRunnerState = readRunnerState();
  freshRunnerState.enabled = true;
  freshRunnerState.mode = 'guarded-override';
  freshRunnerState.last_tick_at = localTimestamp();
  freshRunnerState.active_cycle = queue.cycle_id;
  freshRunnerState.active_job = job.job_id;
  freshRunnerState.last_error = null;
  writeRunnerState(freshRunnerState);

  ensureLaneSiteDependencies(job.worktree);
  ensureCleanWorktree(job.worktree);
  const replayedCommits = replayAcceptedUpstreamCommits(queue, job);
  const worktreeHead = gitHead(job.worktree);

  const brief = buildBrief(control, queue, job);
  const briefFile = briefPath(job.job_id);
  writeJson(briefFile, brief);

  const prompt = buildPrompt(control, queue, job, brief, briefFile);
  fs.writeFileSync(promptSnapshotPath(job.job_id), prompt, 'utf8');

  job.status = 'running';
  job.started_at = localTimestamp();
  if (replayedCommits.length > 0) {
    job.upstream_replayed_commits = replayedCommits;
  }
  queue.status = 'running';
  writeActiveQueue(queuePath, queue);

  updateRuntime((runtime) => {
    runtime.active_jobs = (runtime.active_jobs || []).map((candidate) =>
      candidate.job_id === job.job_id ? { ...candidate, status: 'running' } : candidate,
    );
    if (replayedCommits.length > 0) {
      runtime.active_jobs = (runtime.active_jobs || []).map((candidate) =>
        candidate.job_id === job.job_id ? { ...candidate, upstream_replayed_commits: replayedCommits } : candidate,
      );
    }
    runtime.heartbeat_at = localTimestamp();
  });

  const execResult = parseBoolFlag('--dry-run')
    ? { code: 0, outputPath: finalMessagePath(job.job_id), stdoutPath: stdoutLogPath(job.job_id), stderrPath: stderrLogPath(job.job_id) }
    : await spawnCodexForJob(job, prompt);

  if (parseBoolFlag('--dry-run')) {
    fs.writeFileSync(
      execResult.outputPath,
      JSON.stringify(
        {
          cycle_id: queue.cycle_id,
          job_id: job.job_id,
          lane: job.lane_id,
          phase: queue.phase_id,
          target: job.objective,
          hypothesis: 'Dry-run output only.',
          status: 'hold',
          summary: 'Dry-run mode did not execute Codex.',
          files_changed: [],
          commands_run: ['dry-run'],
          preflight_baseline: { notes: [] },
          postflight_metrics: { notes: [] },
          audit_result: null,
          known_risks: [],
          blockers: ['dry-run'],
          recommendation: 'resume without dry-run',
          next_hypothesis: null,
          rollback_target: worktreeHead,
          learning_captured: [],
          commit: null,
        },
        null,
        2,
      ),
    );
  }

  let laneResult = null;

  if (parseBoolFlag('--dry-run')) {
    laneResult = JSON.parse(fs.readFileSync(execResult.outputPath, 'utf8'));
  } else if (execResult.code !== 0) {
      laneResult = syntheticLaneResult(
        queue,
        job,
        worktreeHead,
        execResult,
        `codex exec exited with code ${execResult.code} and signal ${String(execResult.signal ?? 'null')}`,
      );
  } else if (!fs.existsSync(execResult.outputPath)) {
    laneResult = syntheticLaneResult(
      queue,
      job,
      worktreeHead,
      execResult,
      `Lane ${job.lane_id} did not produce a final message file.`,
    );
  } else {
    try {
      laneResult = JSON.parse(fs.readFileSync(execResult.outputPath, 'utf8'));
      validateLaneResultShape(laneResult);
    } catch (error) {
      laneResult = syntheticLaneResult(
        queue,
        job,
        worktreeHead,
        execResult,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  validateLaneResultShape(laneResult);
  if (!fs.existsSync(execResult.outputPath)) {
    fs.writeFileSync(execResult.outputPath, JSON.stringify(laneResult, null, 2));
  }

  let diff = diffFilesSince(job.worktree, worktreeHead);
  const unauthorized = diff.all.filter((filePath) => !matchesAllowedPath(filePath, job.writes));
  let dirtyAfterRun = diff.dirty.length > 0;
  let hostCommit = null;
  let hostCommitError = null;

  let normalizedStatus = laneResult.status;
  let violation = null;

  if (unauthorized.length > 0) {
    violation = `Unauthorized writes detected: ${unauthorized.join(', ')}`;
    normalizedStatus = 'escalated';
    hardReset(job.worktree, worktreeHead);
  } else if (dirtyAfterRun && shouldHostFinalizeDirtySlice(laneResult)) {
    try {
      hostCommit = createHostCommit(job.worktree, diff.dirty, defaultHostCommitMessage(queue, job));
      laneResult.commit = hostCommit;
      laneResult.commands_run.push(`git add -- ${diff.dirty.join(' ')} && git commit -m ${JSON.stringify(defaultHostCommitMessage(queue, job))}`);
      laneResult.postflight_metrics.notes.push(`host runner finalized commit ${hostCommit}`);
      if (laneEscalationIsCommitOnly(laneResult)) {
        normalizedStatus = 'accepted';
        laneResult.blockers = (laneResult.blockers || []).filter(
          (entry) => !/commit|sandbox|git refs|object store/i.test(entry),
        );
        if (!laneResult.summary.toLowerCase().includes('host runner')) {
          laneResult.summary = `${laneResult.summary} The host runner finalized the lane commit locally.`;
        }
      }
      diff = diffFilesSince(job.worktree, worktreeHead);
      dirtyAfterRun = diff.dirty.length > 0;
    } catch (error) {
      hostCommitError = error instanceof Error ? error.message : String(error);
    }
  }

  if (!violation && dirtyAfterRun) {
    if (hostCommitError) {
      violation = `Host runner could not finalize the lane commit: ${hostCommitError}`;
    } else {
      violation = `Lane left dirty files without a final clean state: ${diff.dirty.join(', ')}`;
    }
    normalizedStatus = 'escalated';
    hardReset(job.worktree, worktreeHead);
  }

  const handoff = {
    cycle_id: laneResult.cycle_id,
    job_id: laneResult.job_id,
    lane: laneResult.lane,
    phase: laneResult.phase,
    target: laneResult.target,
    hypothesis: laneResult.hypothesis,
    status: normalizedStatus,
    files_changed: laneResult.files_changed,
    commands_run: laneResult.commands_run,
    preflight_baseline: laneResult.preflight_baseline,
    postflight_metrics: laneResult.postflight_metrics,
    audit_result: laneResult.audit_result || null,
    known_risks: laneResult.known_risks,
    blockers: violation ? [...laneResult.blockers, violation] : laneResult.blockers,
    recommendation: laneResult.recommendation,
    next_hypothesis: laneResult.next_hypothesis || null,
    rollback_target: laneResult.rollback_target || worktreeHead,
    learning_captured: laneResult.learning_captured,
  };

  const handoffFile = handoffPath(job.job_id);
  writeJson(handoffFile, handoff);

  queue = loadActiveQueue(control.runtime);
  const queueJob = (queue.jobs || []).find((candidate) => candidate.job_id === job.job_id);
  const queueStatus = normalizedStatus === 'hold' ? 'escalated' : normalizedStatus;
  queueJob.status = queueStatus;
  queueJob.finished_at = localTimestamp();
  queueJob.stdout_log = relativeProjectPath(execResult.stdoutPath);
  queueJob.stderr_log = relativeProjectPath(execResult.stderrPath);
  queueJob.final_message = relativeProjectPath(execResult.outputPath);
  queueJob.handoff_file = relativeProjectPath(handoffFile);
  queueJob.candidate_commit = violation ? worktreeHead : laneResult.commit;
  queue.status = (queue.jobs || []).some((candidate) => !queueJobIsTerminal(candidate.status)) ? 'running' : queue.status;
  writeActiveQueue(queuePath, queue);

  updateRuntime((runtime) => {
    runtime.active_jobs = (runtime.active_jobs || []).map((candidate) =>
      candidate.job_id === job.job_id
        ? {
            ...candidate,
            status: queueStatus,
            target: job.objective,
            handoff_file: relativeProjectPath(handoffFile),
          }
        : candidate,
    );
    runtime.heartbeat_at = localTimestamp();
    runtime.last_updated = localTimestamp();
    runtime.lanes[job.lane_id] = {
      ...(runtime.lanes[job.lane_id] || {}),
      status: queueStatus === 'accepted' ? 'active' : queueStatus,
      last_candidate_commit: violation ? worktreeHead : laneResult.commit,
      last_handoff: relativeProjectPath(handoffFile),
    };
    runtime.runner = {
      ...(runtime.runner || {}),
      enabled: true,
      mode: 'guarded-override',
      last_job: job.job_id,
      last_lane: job.lane_id,
    };
    runtime.operator_authorized_local_runner = true;
    runtime.active_cadence_profile = 'guarded_local_autonomy';
  });

  const refreshedControl = loadControlPlane();
  const refreshedQueue = loadActiveQueue(refreshedControl.runtime);
  const remaining = queueStatus === 'accepted' ? nextRunnableJob(refreshedQueue) : null;

  const payload = {
    cycle_id: refreshedQueue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    status: queueStatus,
    handoff_file: relativeProjectPath(handoffFile),
    candidate_commit: queueJob.candidate_commit,
    next_job: remaining?.job_id || null,
    violation,
  };

  if (queueStatus !== 'accepted') {
    payload.finalized = finalizeCycle(refreshedControl, refreshedQueue);
  } else if (!remaining && refreshedQueue.jobs.every((candidate) => queueJobIsTerminal(candidate.status))) {
    payload.finalized = finalizeCycle(refreshedControl, refreshedQueue);
  }

  const finalRunnerState = readRunnerState();
  finalRunnerState.last_tick_at = localTimestamp();
  finalRunnerState.last_result = payload;
  finalRunnerState.active_cycle = payload.finalized ? null : refreshedQueue.cycle_id;
  finalRunnerState.active_job = remaining?.job_id || null;
  writeRunnerState(finalRunnerState);

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  const escalatedJob = settleFatalRunnerState(error instanceof Error ? error : new Error(String(error)));
  const state = readRunnerState();
  state.last_tick_at = localTimestamp();
  state.last_error = error instanceof Error ? error.message : String(error);
  state.last_result = {
    cycle_id: state.active_cycle,
    job_id: escalatedJob,
    lane: null,
    status: 'escalated',
    handoff_file: null,
    candidate_commit: null,
    next_job: null,
    violation: error instanceof Error ? error.message : String(error),
  };
  state.active_cycle = null;
  state.active_job = null;
  writeRunnerState(state);
  console.error(error);
  process.exit(1);
});
