#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import {
  acquireLaneLock,
  buildCyclePlan,
  controlPath,
  git,
  loadControlPlane,
  localTimestamp,
  materializeCycle,
  projectPath,
  readJson,
  releaseLaneLock,
  relativeProjectPath,
  syncRuntimeCadence,
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
  ensureSharedPacketCacheSeeded,
  finalMessagePath,
  gitAbsolutePath,
  gitDirtyFiles,
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
  readCodexCommandExecutions,
  readRunnerPolicy,
  readRunnerState,
  RUNTIME_TRUTH_CACHE_DIR,
  replayCommitRange,
  resolveCodexBin,
  settleQueueAndRuntime,
  stderrLogPath,
  stdoutLogPath,
  validateLaneResultShape,
  writeActiveQueue,
  writeRunnerState,
} from './lib/autonomy.mjs';
import {
  buildGapRecordFromHandoff,
  evaluateRouteGate,
  inferRouteFromJob,
  readGeometryLawVerdict,
  resolveGapRecords,
  routeRoleForRoute,
  writeGapRecord,
} from './lib/ggd.mjs';

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

function uniqueValues(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function incrementCounter(counter, key) {
  const normalizedKey = String(key || 'unknown').trim() || 'unknown';
  counter[normalizedKey] = Number(counter[normalizedKey] || 0) + 1;
}

function compactSystemsOptimizerBacklogItem(item) {
  return {
    id: item.id || null,
    status: item.status || null,
    priority: item.priority || null,
    target_route: item.target_route || null,
    first_broken_law: item.first_broken_law || null,
    runner_focus: item.runner_focus || null,
    evaluator_focus: Array.isArray(item.evaluator_focus) ? item.evaluator_focus : [],
    hypothesis: typeof item.hypothesis === 'string' ? item.hypothesis : null,
  };
}

function buildSystemsOptimizerBacklogDigest(items = [], activeHypothesisId = null, maxItems = 6) {
  const normalizedItems = (items || []).filter((item) => item && typeof item === 'object' && !Array.isArray(item));
  const byStatus = {};
  const byPriority = {};
  const targetRoutes = {};
  const statusScore = {
    seeded: 40,
    active: 35,
    kept: 25,
    rejected: 10,
    proposed: 5,
  };
  const priorityScore = {
    high: 12,
    medium: 6,
    low: 0,
  };

  for (const item of normalizedItems) {
    incrementCounter(byStatus, item.status || 'unknown');
    incrementCounter(byPriority, item.priority || 'unspecified');
    if (item.target_route) {
      incrementCounter(targetRoutes, item.target_route);
    }
  }

  const focusItems = normalizedItems
    .map((item, index) => {
      const normalizedStatus = String(item.status || '').toLowerCase();
      const normalizedPriority = String(item.priority || '').toLowerCase();
      const score =
        (item.id === activeHypothesisId ? 100 : 0) +
        (statusScore[normalizedStatus] || 0) +
        (priorityScore[normalizedPriority] || 0) +
        (item.target_route === '/work/xr' ? 4 : 0) -
        index * 0.01;

      return {
        score,
        item: compactSystemsOptimizerBacklogItem(item),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, maxItems)
    .map((entry) => entry.item);

  return {
    total_items: normalizedItems.length,
    by_status: byStatus,
    by_priority: byPriority,
    target_routes: targetRoutes,
    focus_items: focusItems,
  };
}

function markCurrentCheckpointStale(route, reason, gapIds = []) {
  const checkpointRelativePath = 'CLAW/control-plane/checkpoints/current.json';
  const checkpointPath = projectPath(checkpointRelativePath);
  if (!fs.existsSync(checkpointPath)) {
    return null;
  }

  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  checkpoint.status = 'stale';
  checkpoint.invalidated_at = localTimestamp();
  checkpoint.stale_reason = reason;
  checkpoint.stale_routes = uniqueValues([...(checkpoint.stale_routes || []), route]);
  checkpoint.open_gap_ids = uniqueValues([...(checkpoint.open_gap_ids || []), ...gapIds]);
  writeJson(checkpointPath, checkpoint);

  return {
    path: checkpointRelativePath,
    checkpoint_id: checkpoint.checkpoint_id || null,
    reason,
    route,
    gap_ids: gapIds,
  };
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

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function resolvedExecutionPolicyForJob(executionPolicy, job) {
  const basePolicy = { ...(executionPolicy || {}) };
  const laneOverrides =
    executionPolicy?.lane_overrides ||
    executionPolicy?.lane_execution_overrides ||
    executionPolicy?.per_lane ||
    {};
  const override = laneOverrides?.[job.lane_id];
  return override && typeof override === 'object' ? { ...basePolicy, ...override } : basePolicy;
}

function normalizeCommandText(value) {
  return String(value || '').trim().toLowerCase();
}

function matchingRequiredCommand(commandExecutions, commandOptions) {
  const normalizedOptions = (commandOptions || []).map(normalizeCommandText).filter(Boolean);
  if (normalizedOptions.length === 0) {
    return null;
  }

  return (
    commandExecutions.find(
      (entry) =>
        entry.status === 'completed' &&
        entry.exitCode === 0 &&
        normalizedOptions.some((option) => normalizeCommandText(entry.command).includes(option)),
    ) || null
  );
}

function stderrLooksFatal(stderrText, runnerPolicy) {
  const patterns = runnerPolicy?.salvage?.fatal_stderr_patterns || [];
  return patterns.some((pattern) => {
    try {
      return new RegExp(pattern, 'i').test(stderrText);
    } catch {
      return stderrText.toLowerCase().includes(String(pattern).toLowerCase());
    }
  });
}

function buildBrief(control, queue, job) {
  const subjectRoute = inferRouteFromJob(job);
  const ggdGate = subjectRoute ? evaluateRouteGate(job.lane_id, subjectRoute) : null;
  const systemOptimizerState =
    job.lane_id === 'systems-optimizer'
      ? readJson('CLAW/control-plane/system-optimizer/state.json')
      : null;
  const systemOptimizerBacklog =
    job.lane_id === 'systems-optimizer'
      ? readJson('CLAW/control-plane/system-optimizer/backlog.json')
      : null;
  const systemOptimizerBacklogDigest =
    job.lane_id === 'systems-optimizer'
      ? buildSystemsOptimizerBacklogDigest(
          systemOptimizerBacklog?.items || [],
          systemOptimizerState?.active_hypothesis || null,
        )
      : null;
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
    shared_truth_cache_dir: RUNTIME_TRUTH_CACHE_DIR,
    flagship_invariants: flagshipInvariants,
    suggested_starting_points: suggestedStartingPoints(job),
    subject_route: subjectRoute,
    subject_route_role: subjectRoute ? routeRoleForRoute(subjectRoute) : null,
    ggd: ggdGate
      ? {
          governing_bundle_ids: ggdGate.governing_bundle_ids,
          blocking_gaps: ggdGate.blocking_gaps,
        }
      : null,
    deterministic_rules: [
      'No guessing or probabilistic invention.',
      'Design, layout, color, and hierarchy must remain mathematically defensible.',
      'Do one bounded slice only.',
      'Keep the worktree clean before exit. Commit locally if possible; otherwise leave an allowed diff for host-runner finalization.',
      'Do not write outside the lane worktree.',
      'Do not push, deploy, or touch other repositories.',
      'Generic route work may not flatten or delete flagship-only IMC behavior.',
      'The shared truth cache is authoritative for packet reads during autonomous execution.',
      ...(job.lane_id === 'systems-optimizer'
        ? [
            'Define a fixed writable scope and fixed evaluation bundle before editing the system.',
            'Keep the change only if the machine gets measurably better; otherwise reject it and record the learning.',
            'Do not touch route implementation files from the systems-optimizer lane.',
          ]
        : []),
    ],
    upstream: previousJobs,
    systems_optimizer:
      job.lane_id === 'systems-optimizer'
        ? {
            state_file: 'CLAW/control-plane/system-optimizer/state.json',
            backlog_file: 'CLAW/control-plane/system-optimizer/backlog.json',
            active_hypothesis: systemOptimizerState?.active_hypothesis || null,
            policy: systemOptimizerState?.policy || null,
            backlog_items: systemOptimizerBacklogDigest?.focus_items || [],
            backlog_items_total: systemOptimizerBacklogDigest?.total_items || 0,
            backlog_status_counts: systemOptimizerBacklogDigest?.by_status || {},
            backlog_priority_counts: systemOptimizerBacklogDigest?.by_priority || {},
            backlog_target_routes: systemOptimizerBacklogDigest?.target_routes || {},
            equation_engine: '/Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py',
            local_lawset_index: 'GGD/equations/lawsets.json',
            command: 'ggd-system-optimize',
            agent: 'ggd-systems-optimizer',
          }
        : null,
    runtime_focus: {
      current_phase: control.runtime.current_phase,
      current_milestone: control.runtime.current_milestone,
      latest_audits: control.runtime.latest_audits,
      gates: control.runtime.gates,
      blockers: control.runtime.blockers,
    },
  };
}

function scopedDirtyFiles(cwd, scopedFiles = []) {
  const scope = new Set((scopedFiles || []).filter(Boolean));
  if (scope.size === 0) {
    return [];
  }

  return gitDirtyFiles(cwd).filter((filePath) => scope.has(filePath));
}

function promoteSystemsOptimizerCommit(job, laneResult) {
  if (job.lane_id !== 'systems-optimizer' || laneResult.status !== 'accepted' || !laneResult.commit) {
    return null;
  }

  const rootCwd = projectPath('.');
  const eligibleFiles = uniqueValues((laneResult.files_changed || []).filter((filePath) => matchesAllowedPath(filePath, job.writes)));
  if (eligibleFiles.length === 0) {
    return {
      status: 'skipped',
      reason: 'no-eligible-files',
      source_commit: laneResult.commit,
      promoted_commit: null,
      files: [],
    };
  }

  if (commitReachable(rootCwd, laneResult.commit) || commitPatchEquivalent(rootCwd, laneResult.commit)) {
    return {
      status: 'skipped',
      reason: 'already-promoted',
      source_commit: laneResult.commit,
      promoted_commit: null,
      files: eligibleFiles,
    };
  }

  const overlappingDirtyFiles = scopedDirtyFiles(rootCwd, eligibleFiles);
  if (overlappingDirtyFiles.length > 0) {
    throw new Error(
      `Root control plane has local drift on systems-optimizer promotion paths: ${overlappingDirtyFiles.join(', ')}`,
    );
  }

  const patch = execFileSync('git', ['show', '--binary', '--format=', laneResult.commit, '--', ...eligibleFiles], {
    cwd: rootCwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024,
  });
  if (!patch.trim()) {
    return {
      status: 'skipped',
      reason: 'empty-patch',
      source_commit: laneResult.commit,
      promoted_commit: null,
      files: eligibleFiles,
    };
  }

  execFileSync('git', ['apply', '--3way', '--whitespace=nowarn'], {
    cwd: rootCwd,
    input: patch,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024,
  });

  const promotedCommit = createHostCommit(
    rootCwd,
    eligibleFiles,
    `claw(systems-optimizer): promote ${laneResult.target} [${String(laneResult.commit).slice(0, 12)}]`,
  );

  return {
    status: 'promoted',
    reason: null,
    source_commit: laneResult.commit,
    promoted_commit: promotedCommit,
    files: eligibleFiles,
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
      path.join(RUNTIME_TRUTH_CACHE_DIR, 'ZPE-XR.json'),
    ],
    'data-truth': [
      path.join(RUNTIME_TRUTH_CACHE_DIR, 'ZPE-XR.json'),
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
    'systems-optimizer': [
      'CLAW/control-plane/system-optimizer/state.json',
      'CLAW/control-plane/system-optimizer/backlog.json',
      'CLAW/PRD_SYSTEMS_OPTIMIZER.md',
      'GGD/commands.json',
      'GGD/project.binding.json',
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
    ...(brief.subject_route
      ? [
          `Subject route: ${brief.subject_route} (${brief.subject_route_role})`,
          `Governing bundles: ${(brief.ggd?.governing_bundle_ids || []).join(', ') || 'none'}`,
        ]
      : []),
    ...(brief.ggd?.blocking_gaps?.length
      ? [
          '',
          'Active GGD gaps for this route:',
          ...brief.ggd.blocking_gaps.map(
            (gap) =>
              `- ${gap.id} [${gap.kind}] ${gap.summary || 'no summary'} (${gap.severity_counts.critical} critical, ${gap.severity_counts.major} major)`,
          ),
        ]
      : []),
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
    '- external skills are normally unnecessary, but the installed GGD surface under ~/.codex/skills is allowed when it materially helps with geometry, equation, or verification work',
    '- do not read AGENTS.md, SKILL.md, geometry-program.md, or broad PRD/governance files unless the brief lacks a specific fact you need',
    '- start with the suggested starting points from the brief and read at most 6 repo files before either editing or returning a structured non-acceptance',
    '- if targeted inspection shows the slice cannot honestly advance, return a structured non-acceptance quickly instead of continuing to explore',
    '- installed GGD command surfaces available to you include $ggd-help, $ggd-derive-equation, $ggd-dimensional-analysis, $ggd-limiting-cases, $ggd-verify-work, $ggd-validate-conventions, and $ggd-debug',
    '- the executable equation surface is python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py',
    '- the repo-local equation registry is GGD/equations/lawsets.json and should be treated as the first mathematical surface for this website',
    ...(job.lane_id === 'systems-optimizer'
      ? ['- accepted systems-optimizer commits are promoted back into the root control plane automatically, so your changed file list must stay exact and replayable']
      : []),
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
      '- Treat the brief\'s `shared_truth_cache_dir` as the authoritative packet surface during autonomous execution. Only inspect the worktree-local `.cache/packets` snapshot if you are explicitly checking for divergence.',
      '- When using the shell, wrap `site/src/app/work/[slug]/page.tsx` in single quotes so the brackets are treated literally.',
      '- If a shared work-lane kernel model does not exist, add exactly one under `site/src/lib/product-kernel/**` and keep it packet-driven.',
      '- Remove IMC-only or flagship-only truth drift from generic work-lane rendering. Do not invent new marketing copy.',
      '- Preserve the dedicated `ZPE-IMC` flagship branch in `site/src/lib/product-kernel/workLaneKernel.ts`; do not collapse IMC into the generic work-lane profile.',
      '- Verify with `npm run build` and `node --import tsx src/scripts/test-parser.ts` from `site/`.',
      '- Prefer one bounded kernel/generalization slice over route-specific tweaks.',
    ],
    'data-truth': [
      '- Read the XR packet from the brief\'s shared truth cache and only the smallest parser/data files needed to confirm truth sufficiency.',
      '- Do not rewrite ingestion architecture unless the XR packet is provably insufficient or contradictory.',
      '- Favor a report-only slice if truth is already sufficient.',
    ],
    'systems-qa': [
      '- Audit the target route and any shared law or shared kernel dependency it relies on.',
      '- If the accepted upstream slice touches `site/src/lib/product-kernel/**` or `site/src/components/lane/LaneAuthorityPage.tsx`, verify `/imc` still exposes flagship-only behavior and `imc.*` measurement keys.',
      '- Treat geometry-law verification as first-class evidence, not an optional appendix.',
      '- Prefer running `npm run audit:quality` when a shared route/kernel surface changed, then run targeted layout, geometry-law, and responsive falsification for the target route.',
      '- If geometry-law findings remain critical or major, reject the candidate even when screenshot diff drift is smaller.',
      '- Export route-gap truthfully when the route remains blocked, and close route gaps truthfully only when the evidence is actually clean.',
      '- Reject regressions instead of explaining them away.',
      '- Prefer report artifacts over code edits unless the audit harness itself is broken.',
    ],
    'systems-optimizer': [
      '- Read `CLAW/PRD_SYSTEMS_OPTIMIZER.md`, `CLAW/control-plane/system-optimizer/state.json`, and `CLAW/control-plane/system-optimizer/backlog.json` first.',
      '- Use the installed `$ggd-system-optimize` command semantics and the GGD equation engine before inventing a control-plane change pattern.',
      '- Define exactly one system hypothesis, exactly one writable scope, and exactly one evaluation bundle before editing.',
      '- Do not touch route implementation files. Improve laws, prompts, validators, command surfaces, cadence, or recovery behavior only.',
      '- Keep the slice only if the machine gets measurably better and the eval bundle is green. Otherwise reject it, record the learning, and leave the route lanes alone.',
    ],
    integration: [
      '- Replay only the accepted candidate into the integration lane.',
      '- If the replayed slice touched the shared work-lane kernel or lane authority page, verify the IMC flagship invariants before accepting promotion.',
      '- Favor build, parser, quality, and geometry-law falsification over narrative reassurance.',
      '- Do not accept a route-family candidate while any blocking GGD route gap remains open for the subject route.',
      '- Do not broaden scope beyond conflict-free promotion and replay verification.',
    ],
    'opus-engineer': [
      '- This is the Opus Engineer orchestrator lane. Run its dedicated runner instead of doing direct implementation work.',
      '- Execute: `node CLAW/opus-engineer/runner.mjs --cycle=${job.job_id}`',
      '- The runner loads runtime-state.json, selects the highest-priority task per CLAW/opus-engineer/decision-policy.md, spawns a bounded sub-agent, and writes a report to CLAW/control-plane/reports/opus-engineer/.',
      '- Do not implement site features directly in this lane — delegate all implementation to the sub-agent via the prompt templates in CLAW/opus-engineer/prompts/.',
      '- Writable scope: site/src/app/**, site/src/components/**, CLAW/opus-engineer/**, CLAW/control-plane/reports/opus-engineer/**.',
      '- WORKTREE COMMIT REMINDER: If the sub-agent produces file changes, it must commit them. Escalate if the sub-agent exits without a commit after making changes.',
      '- Return the runner\'s JSON output as your lane result.',
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
    const persistedRunner = persistedRunnerMode(readRunnerState());
    runtime.latest_wave_report = reportRelativePath;
    runtime.last_updated = localTimestamp();
    runtime.last_health_check = localTimestamp();
    runtime.runner = {
      ...(runtime.runner || {}),
      ...persistedRunner,
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

function applyGgdContractToHandoff(job, handoff, normalizedStatus, handoffRelativePath) {
  const subjectRoute = inferRouteFromJob(job, handoff);
  if (!subjectRoute) {
    return {
      normalizedStatus,
      handoff,
      ggdRoute: null,
      exportedGapPath: null,
      resolvedGapIds: [],
      geometryVerdict: null,
      checkpointInvalidation: null,
    };
  }

  const gate = evaluateRouteGate(job.lane_id, subjectRoute);

  let nextStatus = normalizedStatus;
  let exportedGapPath = null;
  let resolvedGapIds = [];
  let geometryVerdict = null;
  let checkpointInvalidation = null;
  let gapKindOverride = null;
  let suppressGapExport = false;

  if (['systems-qa', 'integration'].includes(job.lane_id) && nextStatus === 'accepted') {
    geometryVerdict = readGeometryLawVerdict(subjectRoute);
    if (geometryVerdict.blocking) {
      nextStatus = 'rejected';
      gapKindOverride = 'geometry-gap';
      const blocker = `Geometry-law gate blocked ${job.lane_id} acceptance for ${subjectRoute}: ${geometryVerdict.summary}`;
      handoff.summary = `Rejected by geometry-law gate for ${subjectRoute}.`;
      handoff.blockers = uniqueValues([...(handoff.blockers || []), blocker]);
      handoff.recommendation = `Do not promote ${subjectRoute} until the geometry-law verdict passes with zero critical and zero major findings.`;
      if (!handoff.audit_result || typeof handoff.audit_result !== 'object') {
        handoff.audit_result = {
          summary: handoff.summary,
          status: 'geometry-law-gate',
          notes: [blocker],
          report: geometryVerdict.report,
          counts: geometryVerdict.counts,
        };
      } else {
        handoff.audit_result = {
          ...handoff.audit_result,
          summary: handoff.summary,
          status: 'geometry-law-gate',
          notes: uniqueValues([...(handoff.audit_result.notes || []), blocker]),
          report: geometryVerdict.report || handoff.audit_result.report || null,
          counts: geometryVerdict.counts,
        };
      }
      handoff.learning_captured = uniqueValues([
        ...(handoff.learning_captured || []),
        'Geometry-law JSON is a first-class promotion gate for systems-qa and integration.',
      ]);
      if (job.lane_id === 'integration') {
        suppressGapExport = gate.blocking_gaps.some((gap) => gap.kind === 'geometry-gap');
      }
      checkpointInvalidation = {
        route: subjectRoute,
        reason: `Current integration checkpoint is stale for ${subjectRoute}: ${geometryVerdict.summary}`,
        gapIds: uniqueValues([
          ...gate.blocking_gaps.filter((gap) => gap.kind === 'geometry-gap').map((gap) => gap.id),
          !suppressGapExport ? `pending:${subjectRoute}:geometry-gap` : null,
        ]),
      };
    }
  }

  if (job.lane_id === 'integration' && nextStatus === 'accepted' && gate.blocks_acceptance) {
    const blockingIds = gate.blocking_gaps.map((gap) => gap.id).join(', ');
    const blocker = `GGD contract blocked integration acceptance for ${subjectRoute}: open route gaps remain (${blockingIds}).`;
    nextStatus = 'rejected';
    suppressGapExport = true;
    handoff.summary = `Rejected by GGD contract: ${blockingIds} remain open for ${subjectRoute}.`;
    handoff.blockers = uniqueValues([...(handoff.blockers || []), blocker]);
    handoff.recommendation = `Do not promote ${subjectRoute} while blocking GGD gaps remain open. Close the route gaps in owner lanes first.`;
    if (!handoff.audit_result || typeof handoff.audit_result !== 'object') {
      handoff.audit_result = {
        summary: handoff.summary,
        status: 'ggd-route-gate',
        notes: [blocker],
        report: null,
      };
    } else {
      handoff.audit_result = {
        ...handoff.audit_result,
        summary: handoff.summary,
        status: 'ggd-route-gate',
        notes: [...new Set([...(handoff.audit_result.notes || []), blocker])],
      };
    }
    handoff.learning_captured = uniqueValues([
      ...(handoff.learning_captured || []),
      'Downstream acceptance must fail closed while the subject route carries open GGD gaps.',
    ]);
    checkpointInvalidation = {
      route: subjectRoute,
      reason: `Current integration checkpoint is stale for ${subjectRoute}: blocking GGD gaps remain open (${blockingIds}).`,
      gapIds: gate.blocking_gaps.map((gap) => gap.id),
    };
  }

  if (['systems-qa', 'data-truth', 'integration'].includes(job.lane_id)) {
    if (nextStatus === 'accepted') {
      const resolved = resolveGapRecords(subjectRoute, {
        kinds: gate.owned_gap_kinds,
        resolved_by_handoff: handoffRelativePath,
        resolved_by_job: handoff.job_id || null,
        resolution_summary: `Resolved by accepted ${job.lane_id} verification for ${subjectRoute}.`,
      });
      if (resolved.length > 0) {
        resolvedGapIds = resolved.map((gap) => gap.id);
        handoff.learning_captured = uniqueValues([
          ...(handoff.learning_captured || []),
          `Resolved GGD gaps: ${resolvedGapIds.join(', ')}.`,
        ]);
      }
    } else if (['rejected', 'escalated'].includes(nextStatus) && !suppressGapExport) {
      const gap = buildGapRecordFromHandoff(
        {
          ...handoff,
        },
        {
          route: subjectRoute,
          kind: gapKindOverride || undefined,
          source_handoff: handoffRelativePath,
        },
      );
      const gapPath = writeGapRecord(gap);
      exportedGapPath = relativeProjectPath(gapPath);
      handoff.learning_captured = uniqueValues([
        ...(handoff.learning_captured || []),
        `Exported GGD gap ${gap.id}.`,
      ]);
      if (checkpointInvalidation && checkpointInvalidation.gapIds.includes(`pending:${subjectRoute}:geometry-gap`)) {
        checkpointInvalidation.gapIds = uniqueValues([
          ...checkpointInvalidation.gapIds.filter((gapId) => !gapId.startsWith('pending:')),
          gap.id,
        ]);
      }
    }
  }

  if (!checkpointInvalidation && ['systems-qa', 'integration'].includes(job.lane_id) && ['rejected', 'escalated'].includes(nextStatus)) {
    checkpointInvalidation = {
      route: subjectRoute,
      reason: `Current integration checkpoint is stale for ${subjectRoute}: ${job.lane_id} settled ${nextStatus}.`,
      gapIds: gate.blocking_gaps.map((gap) => gap.id),
    };
  }

  return {
    normalizedStatus: nextStatus,
    handoff,
    ggdRoute: subjectRoute,
    exportedGapPath,
    resolvedGapIds,
    geometryVerdict,
    checkpointInvalidation,
  };
}

function salvageLaneResultFromLogs(queue, job, worktreeHead, execResult, diff, runnerPolicy) {
  if (!runnerPolicy?.execution?.allow_stalled_result_salvage || diff.all.length === 0) {
    return null;
  }

  if (fs.existsSync(execResult.outputPath)) {
    return null;
  }

  const requiredGroups = runnerPolicy?.salvage?.required_command_groups_by_lane?.[job.lane_id];
  if (!Array.isArray(requiredGroups) || requiredGroups.length === 0) {
    return null;
  }

  const stderrText = readTextTail(execResult.stderrPath, 12000);
  if (stderrText && stderrLooksFatal(stderrText, runnerPolicy)) {
    return null;
  }

  const commands = readCodexCommandExecutions(execResult.stdoutPath);
  if (commands.length === 0) {
    return null;
  }

  const matchedCommands = [];
  for (const group of requiredGroups) {
    const match = matchingRequiredCommand(commands, group);
    if (!match) {
      return null;
    }
    matchedCommands.push(match);
  }

  const verifiedNotes = matchedCommands.map((entry) => `verified command: ${entry.command}`);
  return {
    cycle_id: queue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    phase: queue.phase_id,
    target: job.objective,
    hypothesis:
      'If Codex stalls after producing an allowed bounded diff and passing the lane-required verification commands, the host runner can salvage the slice deterministically.',
    status: 'accepted',
    summary: `The host runner salvaged a bounded ${job.lane_id} slice after Codex stalled before emitting the final JSON handoff.`,
    files_changed: diff.all,
    commands_run: [...new Set(matchedCommands.map((entry) => entry.command))],
    preflight_baseline: {
      notes: [`worktree_head=${worktreeHead}`],
    },
    postflight_metrics: {
      notes: [
        `termination_reason=${execResult.terminationReason || 'unknown'}`,
        `changed_files=${diff.all.length}`,
        ...verifiedNotes,
      ],
    },
    audit_result: {
      summary: 'The host runner salvaged a stalled bounded slice from required command and diff evidence.',
      status: `host-salvaged-${job.lane_id}`,
      notes: [
        'Codex did not emit the final structured handoff.',
        'Allowed writes remained within lane scope.',
        ...verifiedNotes,
      ],
      report: null,
    },
    known_risks: [
      'The lane self-report was missing, so the host runner reconstructed acceptance from required command evidence and the verified diff.',
    ],
    blockers: [],
    recommendation: 'Continue to the next lane, but inspect the missing final handoff path if this repeats.',
    next_hypothesis: null,
    rollback_target: worktreeHead,
    learning_captured: [
      'The runner can salvage a stalled bounded slice when the required verification commands pass and the diff remains in scope.',
    ],
    commit: null,
  };
}

function spawnCodexForJob(job, prompt, executionPolicy = {}) {
  const outputPath = finalMessagePath(job.job_id);
  const stdoutPath = stdoutLogPath(job.job_id);
  const stderrPath = stderrLogPath(job.job_id);
  const gitAdminDir = gitAbsolutePath(job.worktree, '--git-dir');
  const gitCommonDir = gitAbsolutePath(job.worktree, '--git-common-dir');
  const codexBin = resolveCodexBin();
  const sharedPacketCacheDir = ensureSharedPacketCacheSeeded(job.worktree, {
    preferWorktree: job.lane_id === 'data-truth',
  });
  const stdoutStream = fs.createWriteStream(stdoutPath, { flags: 'w' });
  const stderrStream = fs.createWriteStream(stderrPath, { flags: 'w' });
  const startedAt = Date.now();
  const laneExecutionPolicy = resolvedExecutionPolicyForJob(executionPolicy, job);
  const maxRuntimeMs = positiveInteger(laneExecutionPolicy.max_lane_runtime_seconds, 900) * 1000;
  const maxIdleMs = positiveInteger(laneExecutionPolicy.max_lane_quiet_seconds, 180) * 1000;
  const monitorIntervalMs = Math.max(1000, positiveInteger(laneExecutionPolicy.monitor_interval_seconds, 5) * 1000);
  const killGraceMs = positiveInteger(laneExecutionPolicy.kill_grace_seconds, 5) * 1000;

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
    laneExecutionPolicy.sandbox || 'workspace-write',
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
  const commandText = [codexBin, ...args.map((arg) => quoteShellArg(arg))].join(' ');

  return new Promise((resolve) => {
    let finished = false;
    let lastActivityAt = Date.now();
    let terminationReason = null;
    let watchdog = null;
    let killGraceTimer = null;

    const touch = () => {
      lastActivityAt = Date.now();
    };

    const finish = (payload) => {
      if (finished) {
        return;
      }
      finished = true;
      if (watchdog) {
        clearInterval(watchdog);
      }
      if (killGraceTimer) {
        clearTimeout(killGraceTimer);
      }
      stdoutStream.end();
      stderrStream.end();
      resolve({
        ...payload,
        terminationReason,
        startedAt: new Date(startedAt).toISOString(),
        lastActivityAt: new Date(lastActivityAt).toISOString(),
      });
    };

    const child = spawn(codexBin, args, {
      cwd: job.worktree,
      env: {
        ...process.env,
        ZEROPA_LANE_PACKET_CACHE_DIR: sharedPacketCacheDir,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => {
      touch();
      stdoutStream.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      touch();
      stderrStream.write(chunk);
    });
    child.stdin.end(prompt);

    watchdog = setInterval(() => {
      if (finished) {
        return;
      }

      const now = Date.now();
      const runtimeMs = now - startedAt;
      const idleMs = now - lastActivityAt;
      let nextTerminationReason = null;

      if (maxRuntimeMs > 0 && runtimeMs >= maxRuntimeMs) {
        nextTerminationReason = 'max-runtime-exceeded';
      } else if (maxIdleMs > 0 && idleMs >= maxIdleMs) {
        nextTerminationReason = 'max-idle-exceeded';
      }

      if (!nextTerminationReason || terminationReason) {
        return;
      }

      terminationReason = nextTerminationReason;
      stderrStream.write(`[runner-watchdog] ${terminationReason} on ${job.job_id}\n`);
      try {
        child.kill('SIGTERM');
      } catch {}

      killGraceTimer = setTimeout(() => {
        if (!finished) {
          try {
            child.kill('SIGKILL');
          } catch {}
        }
      }, killGraceMs);
    }, monitorIntervalMs);

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
  if (execResult?.terminationReason) {
    blockers.push(`termination_reason: ${execResult.terminationReason}`);
  }
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

function replayConflictLaneResult(queue, job, worktreeHead, reason) {
  return {
    cycle_id: queue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    phase: queue.phase_id,
    target: job.objective,
    hypothesis:
      'Replay conflicts must fail closed as lane-local rejections so the runner can settle cleanly and preserve deterministic state.',
    status: 'rejected',
    summary: 'The lane rejected because upstream replay could not be applied safely onto the downstream worktree.',
    files_changed: [],
    commands_run: ['upstream-replay'],
    preflight_baseline: {
      notes: [`worktree_head=${worktreeHead}`],
    },
    postflight_metrics: {
      notes: ['replay_status=conflict'],
    },
    audit_result: {
      summary: 'Upstream replay conflicted before lane execution could begin.',
      status: 'replay-conflict',
      notes: [reason],
      report: null,
    },
    known_risks: [
      'The downstream lane did not run because upstream accepted commits could not be overlaid cleanly.',
    ],
    blockers: [reason],
    recommendation: 'Reconcile the upstream/downstream overlap, then re-run the bounded slice from a clean base.',
    next_hypothesis: null,
    rollback_target: worktreeHead,
    learning_captured: [
      'Replay conflicts must settle as lane-local rejections instead of runner-fatal errors.',
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

function persistedRunnerMode(state) {
  const serviceManaged = Boolean(state?.enabled && state?.pid);
  return {
    enabled: serviceManaged,
    mode: serviceManaged ? 'guarded-override' : state?.mode || 'manual-once',
  };
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
    const persistedRunner = persistedRunnerMode(readRunnerState());
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
      ...persistedRunner,
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
  const dependencyLaneIds = Array.isArray(job.depends_on) ? job.depends_on.filter(Boolean) : [];
  if (dependencyLaneIds.length > 0) {
    return dependencyLaneIds
      .map((laneId) => (queue.jobs || []).find((candidate) => candidate.lane_id === laneId))
      .filter((candidate) => candidate && candidate.replayable !== false && candidate.status === 'accepted' && candidate.candidate_commit);
  }

  const currentIndex = (queue.jobs || []).findIndex((candidate) => candidate.job_id === job.job_id);
  if (currentIndex <= 0) {
    return [];
  }

  return (queue.jobs || [])
    .slice(0, currentIndex)
    .filter((candidate) => candidate.replayable !== false && candidate.status === 'accepted' && candidate.candidate_commit);
}

function replayAcceptedUpstreamCommits(queue, job) {
  const upstreamJobs = acceptedUpstreamJobs(queue, job);
  if (upstreamJobs.length === 0) {
    return [];
  }

  const applied = [];
  for (const upstreamJob of upstreamJobs) {
    const commit = upstreamJob.candidate_commit;
    if (!commit || commitReachable(job.worktree, commit) || commitPatchEquivalent(job.worktree, commit)) {
      continue;
    }
    cherryPickCommit(job.worktree, commit);
    applied.push(commit);
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
  const runnerPolicy = readRunnerPolicy();
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
    const persistedRunner = persistedRunnerMode(readRunnerState());
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
      ...persistedRunner,
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
    const persistedRunner = persistedRunnerMode(readRunnerState());
    writeRunnerState({
      ...readRunnerState(),
      ...persistedRunner,
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
  Object.assign(freshRunnerState, persistedRunnerMode(freshRunnerState));
  freshRunnerState.last_tick_at = localTimestamp();
  freshRunnerState.active_cycle = queue.cycle_id;
  freshRunnerState.active_job = job.job_id;
  freshRunnerState.last_error = null;
  writeRunnerState(freshRunnerState);

  job.status = 'leased';
  job.started_at = localTimestamp();
  queue.status = 'running';
  writeActiveQueue(queuePath, queue);

  updateRuntime((runtime) => {
    runtime.active_jobs = (runtime.active_jobs || []).map((candidate) =>
      candidate.job_id === job.job_id ? { ...candidate, status: 'leased' } : candidate,
    );
    runtime.heartbeat_at = localTimestamp();
  });

  const preReplayHead = gitHead(job.worktree);
  const lockFile = acquireLaneLock(job, queue.cycle_id, queue.phase_id, job.started_at);

  updateRuntime((runtime) => {
    runtime.locks = [...new Set([...(runtime.locks || []), lockFile])];
    runtime.heartbeat_at = localTimestamp();
    runtime.last_updated = localTimestamp();
  });

  ensureLaneSiteDependencies(job.worktree);
  ensureCleanWorktree(job.worktree);
  let replayedCommits = [];
  let replayFailure = null;
  try {
    replayedCommits = replayAcceptedUpstreamCommits(queue, job);
  } catch (error) {
    replayFailure = error instanceof Error ? error.message : String(error);
    try {
      git(['cherry-pick', '--abort'], job.worktree);
    } catch {}
    hardReset(job.worktree, preReplayHead);
  }
  const worktreeHead = preReplayHead;

  job.status = 'running';
  if (replayedCommits.length > 0) {
    job.upstream_replayed_commits = replayedCommits;
  }
  queue.status = 'running';
  writeActiveQueue(queuePath, queue);

  const leasedRunnerState = readRunnerState();
  Object.assign(leasedRunnerState, persistedRunnerMode(leasedRunnerState));
  leasedRunnerState.last_tick_at = localTimestamp();
  leasedRunnerState.active_cycle = queue.cycle_id;
  leasedRunnerState.active_job = job.job_id;
  leasedRunnerState.last_error = null;
  writeRunnerState(leasedRunnerState);

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

  let execResult = null;
  let laneResult = null;

  if (replayFailure) {
    execResult = {
      code: 0,
      signal: null,
      outputPath: finalMessagePath(job.job_id),
      stdoutPath: stdoutLogPath(job.job_id),
      stderrPath: stderrLogPath(job.job_id),
      commandText: 'upstream-replay',
      terminationReason: 'replay-conflict',
    };
    fs.writeFileSync(execResult.stdoutPath, '', 'utf8');
    fs.writeFileSync(execResult.stderrPath, `${replayFailure}\n`, 'utf8');
    laneResult = replayConflictLaneResult(queue, job, worktreeHead, replayFailure);
    fs.writeFileSync(execResult.outputPath, JSON.stringify(laneResult, null, 2));
  } else {
    const brief = buildBrief(control, queue, job);
    const briefFile = briefPath(job.job_id);
    writeJson(briefFile, brief);

    const prompt = buildPrompt(control, queue, job, brief, briefFile);
    fs.writeFileSync(promptSnapshotPath(job.job_id), prompt, 'utf8');

    execResult = parseBoolFlag('--dry-run')
      ? { code: 0, outputPath: finalMessagePath(job.job_id), stdoutPath: stdoutLogPath(job.job_id), stderrPath: stderrLogPath(job.job_id) }
      : await spawnCodexForJob(job, prompt, runnerPolicy.execution || {});

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
  }

  let diff = diffFilesSince(job.worktree, worktreeHead);

  if (!laneResult && parseBoolFlag('--dry-run')) {
    laneResult = JSON.parse(fs.readFileSync(execResult.outputPath, 'utf8'));
  } else if (!laneResult && execResult.code !== 0) {
    laneResult =
      salvageLaneResultFromLogs(queue, job, worktreeHead, execResult, diff, runnerPolicy) ||
      syntheticLaneResult(
        queue,
        job,
        worktreeHead,
        execResult,
        `codex exec exited with code ${execResult.code} and signal ${String(execResult.signal ?? 'null')}`,
      );
  } else if (!laneResult && !fs.existsSync(execResult.outputPath)) {
    laneResult =
      salvageLaneResultFromLogs(queue, job, worktreeHead, execResult, diff, runnerPolicy) ||
      syntheticLaneResult(
        queue,
        job,
        worktreeHead,
        execResult,
        `Lane ${job.lane_id} did not produce a final message file.`,
      );
  } else if (!laneResult) {
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

  const unauthorized = diff.all.filter((filePath) => !matchesAllowedPath(filePath, job.writes));
  let dirtyAfterRun = diff.dirty.length > 0;
  let hostCommit = null;
  let hostCommitError = null;
  let systemsOptimizerPromotion = null;

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

  if (!hostCommit && !laneResult.commit && replayedCommits.length > 0) {
    hardReset(job.worktree, preReplayHead);
  }

  if (!violation && normalizedStatus === 'accepted' && job.lane_id === 'systems-optimizer' && laneResult.commit) {
    try {
      systemsOptimizerPromotion = promoteSystemsOptimizerCommit(job, laneResult);
    } catch (error) {
      violation = `Systems-optimizer root promotion failed: ${error instanceof Error ? error.message : String(error)}`;
      normalizedStatus = 'escalated';
    }
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
  const handoffRelativePath = relativeProjectPath(handoffFile);
  const ggdOutcome = applyGgdContractToHandoff(job, handoff, normalizedStatus, handoffRelativePath);
  normalizedStatus = ggdOutcome.normalizedStatus;
  handoff.status = normalizedStatus;
  writeJson(handoffFile, handoff);
  const checkpointInvalidation = ggdOutcome.checkpointInvalidation
    ? markCurrentCheckpointStale(
        ggdOutcome.checkpointInvalidation.route,
        ggdOutcome.checkpointInvalidation.reason,
        ggdOutcome.checkpointInvalidation.gapIds || [],
      )
    : null;

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
  releaseLaneLock(job.lane_id);

  updateRuntime((runtime) => {
    const persistedRunner = persistedRunnerMode(readRunnerState());
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
    runtime.locks = (runtime.locks || []).filter((entry) => !entry.endsWith(`/${job.lane_id}.json`));
    runtime.lanes[job.lane_id] = {
      ...(runtime.lanes[job.lane_id] || {}),
      status: queueStatus === 'accepted' ? 'active' : queueStatus,
      last_candidate_commit: violation ? worktreeHead : laneResult.commit,
      last_handoff: relativeProjectPath(handoffFile),
      ...(systemsOptimizerPromotion?.status === 'promoted'
        ? {
            last_promoted_commit: systemsOptimizerPromotion.promoted_commit,
            last_promoted_source_commit: systemsOptimizerPromotion.source_commit,
          }
        : {}),
    };
    runtime.runner = {
      ...(runtime.runner || {}),
      ...persistedRunner,
      last_job: job.job_id,
      last_lane: job.lane_id,
    };
    runtime.operator_authorized_local_runner = true;
    syncRuntimeCadence(runtime, 'guarded_local_autonomy');
    if (checkpointInvalidation) {
      runtime.gates = {
        ...(runtime.gates || {}),
        integration_qa_passed: false,
      };
      runtime.current_checkpoint = null;
      runtime.last_stale_checkpoint = checkpointInvalidation.path;
      runtime.blockers = uniqueValues([...(runtime.blockers || []), checkpointInvalidation.reason]);
      runtime.next_actions = uniqueValues([
        `Rebuild the integration checkpoint only after closing blocking gaps for ${checkpointInvalidation.route}.`,
        ...(runtime.next_actions || []),
      ]);
    }
  });

  const refreshedControl = loadControlPlane();
  const refreshedQueue = loadActiveQueue(refreshedControl.runtime);
  const remaining = queueStatus === 'accepted' ? nextRunnableJob(refreshedQueue) : null;

  const payload = {
    cycle_id: refreshedQueue.cycle_id,
    job_id: job.job_id,
    lane: job.lane_id,
    status: queueStatus,
    handoff_file: handoffRelativePath,
    candidate_commit: queueJob.candidate_commit,
    next_job: remaining?.job_id || null,
    violation,
    systems_optimizer_promotion: systemsOptimizerPromotion,
    ggd_route: ggdOutcome.ggdRoute,
    ggd_exported_gap: ggdOutcome.exportedGapPath,
    ggd_resolved_gaps: ggdOutcome.resolvedGapIds,
    geometry_law_verdict: ggdOutcome.geometryVerdict,
    checkpoint_invalidated: checkpointInvalidation,
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
  finalRunnerState.active_job = null;
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
