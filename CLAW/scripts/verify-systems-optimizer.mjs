#!/usr/bin/env node

import fs from 'node:fs';

import { projectPath, readJson } from './lib/control-plane.mjs';

const issues = [];
const warnings = [];

const binding = readJson('GGD/project.binding.json');
const commandSurface = readJson('GGD/commands.json');
const agentLanes = readJson('CLAW/control-plane/agent-lanes.json');
const cycleTemplates = readJson('CLAW/control-plane/cycle-templates.json');
const canonicalPlan = readJson('CLAW/control-plane/plans/canonical-routes-to-producing.json');
const optimizerStatePath = binding.system_optimizer?.state || 'CLAW/control-plane/system-optimizer/state.json';
const optimizerBacklogPath = binding.system_optimizer?.backlog || 'CLAW/control-plane/system-optimizer/backlog.json';
const optimizerState = readJson(optimizerStatePath);
const optimizerBacklog = readJson(optimizerBacklogPath);

const optimizerLane = (agentLanes.lanes || []).find((lane) => lane.id === 'systems-optimizer');
if (!optimizerLane) {
  issues.push('agent-lanes.json is missing the systems-optimizer lane.');
}

if (optimizerLane?.replayable !== false) {
  issues.push('systems-optimizer lane must be non-replayable.');
}

if (!optimizerLane?.control_plane_only) {
  issues.push('systems-optimizer lane must be marked control_plane_only.');
}

for (const writePattern of ['CLAW/scripts/**', 'GGD/**']) {
  if (!optimizerLane?.writes?.includes(writePattern)) {
    issues.push(`systems-optimizer lane is missing required write scope: ${writePattern}`);
  }
}

for (const phaseId of ['C4', 'C5', 'C6']) {
  const template = cycleTemplates.phases?.[phaseId];
  if (!template?.lanes?.some((lane) => lane.lane_id === 'systems-optimizer')) {
    issues.push(`Cycle template ${phaseId} is missing systems-optimizer.`);
  }

  if ((template?.lanes || []).some((lane) => (lane.depends_on || []).includes('systems-optimizer') && lane.lane_id !== 'systems-optimizer')) {
    issues.push(`Cycle template ${phaseId} has a route or orchestrator lane depending on systems-optimizer.`);
  }

  const canonicalPhase = (canonicalPlan.phases || []).find((phase) => phase.id === phaseId);
  if (!canonicalPhase?.streams?.includes('systems-optimizer')) {
    issues.push(`Canonical plan phase ${phaseId} is missing systems-optimizer in streams.`);
  }
}

if (!commandSurface.recommended_commands?.optimization?.includes('ggd-system-optimize')) {
  issues.push('GGD/commands.json is missing the optimization command set.');
}

if ((optimizerBacklog.items || []).length === 0) {
  issues.push('systems-optimizer backlog has no items.');
}

for (const item of optimizerBacklog.items || []) {
  if (!item.id || !item.hypothesis) {
    issues.push('Each systems-optimizer backlog item must have an id and hypothesis.');
  }
  if (!Array.isArray(item.writable_scope) || item.writable_scope.length === 0) {
    issues.push(`Backlog item ${item.id || '<unknown>'} is missing writable_scope.`);
  }
  if (!Array.isArray(item.evaluation_bundle) || item.evaluation_bundle.length === 0) {
    issues.push(`Backlog item ${item.id || '<unknown>'} is missing evaluation_bundle.`);
  }
}

if (!optimizerState.policy?.keep_only_if_better) {
  issues.push('systems-optimizer state must enforce keep_only_if_better.');
}

if (!optimizerState.policy?.require_fixed_writable_scope) {
  issues.push('systems-optimizer state must require fixed writable scope.');
}

if (!optimizerState.policy?.require_fixed_eval_bundle) {
  issues.push('systems-optimizer state must require fixed eval bundle.');
}

for (const required of [optimizerStatePath, optimizerBacklogPath, binding.system_optimizer?.evaluation_script]) {
  if (required && !fs.existsSync(projectPath(required))) {
    issues.push(`Missing systems-optimizer artifact: ${required}`);
  }
}

if ((optimizerState.accepted_count || 0) < 0 || (optimizerState.rejected_count || 0) < 0) {
  issues.push('systems-optimizer counters must be non-negative.');
}

if (!optimizerState.last_updated) {
  warnings.push('systems-optimizer state has no last_updated timestamp.');
}

console.log(
  JSON.stringify(
    {
      clean: issues.length === 0,
      issues,
      warnings,
      lane: optimizerLane,
      backlog_count: (optimizerBacklog.items || []).length,
      policy: optimizerState.policy || null
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
