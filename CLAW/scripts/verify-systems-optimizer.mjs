#!/usr/bin/env node

import fs from 'node:fs';

import { projectPath, readJson } from './lib/control-plane.mjs';

const issues = [];
const warnings = [];

function isBareClawNpmCommand(command) {
  return /^\s*npm run claw:[^\s]+(?:\s|$)/.test(String(command || ''));
}

function isParentRelativeClawScriptCommand(command) {
  return /^\s*node\s+\.\.\/CLAW\/scripts\/[^\s]+(?:\s|$)/.test(String(command || ''));
}

function validateCommandList(commands, label) {
  if (!Array.isArray(commands) || commands.length === 0) {
    issues.push(`${label} must be a non-empty command list.`);
    return;
  }

  for (const [index, command] of commands.entries()) {
    if (typeof command !== 'string' || command.trim().length === 0) {
      issues.push(`${label}[${index}] must be a non-empty string command.`);
      continue;
    }

    if (isBareClawNpmCommand(command)) {
      issues.push(
        `${label}[${index}] uses bare root-level npm claw syntax. Use node CLAW/scripts/run-site-script.mjs <script> instead.`,
      );
    }

    if (isParentRelativeClawScriptCommand(command)) {
      issues.push(`${label}[${index}] uses ../CLAW relative traversal. Use root-relative CLAW/scripts/... instead.`);
    }
  }
}

const REQUIRED_GGD_MUTATION_COMMANDS = [
  'node CLAW/scripts/verify-ggd-binding.mjs',
  'python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py check-lawset --lawset /Users/zer0palab/Get-Geometry-Done/ggd/shared/example-lawset.json',
];

const REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS = [
  'node CLAW/scripts/verify-systems-optimizer.mjs',
  'node CLAW/scripts/verify-ggd-binding.mjs',
  'python3 /Users/zer0palab/Get-Geometry-Done/scripts/ggd_equation_engine.py check-lawset --lawset /Users/zer0palab/Get-Geometry-Done/ggd/shared/example-lawset.json',
  'node CLAW/scripts/run-site-script.mjs claw:test:systems-optimizer',
  'node CLAW/scripts/run-site-script.mjs claw:test:contracts',
];

const REQUIRED_SYSTEMS_OPTIMIZER_WRITES = [
  'CLAW/scripts/**',
  'CLAW/control-plane/*.json',
  'CLAW/control-plane/*.md',
  'CLAW/control-plane/*.schema.json',
  'CLAW/control-plane/plans/**',
  'CLAW/control-plane/patterns/**',
  'CLAW/control-plane/continuations/**',
  'CLAW/control-plane/product-kernel/**',
  'CLAW/control-plane/system-optimizer/**',
  'CLAW/control-plane/reports/**',
  'CLAW/PRD*.md',
  'GGD/**',
  '.agents/skills/get-geometry-done/**',
  'AGENTS.md',
];

const REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE = [
  'CLAW/control-plane/queue/**',
  'CLAW/control-plane/runtime/**',
  'CLAW/control-plane/locks/**',
  'CLAW/control-plane/checkpoints/**',
  'CLAW/control-plane/state/runtime-state.json',
  'CLAW/services/autonomy/state.json',
  'site/src/app/**',
  'site/src/components/**',
  'site/src/lib/data/**',
  'site/src/lib/product-kernel/**',
];

const DISALLOWED_SCOPE_LOCAL_PROMOTION_COMMANDS = [
  'node CLAW/scripts/run-site-script.mjs claw:validate',
  'node CLAW/scripts/run-site-script.mjs claw:health',
];
const RUNNER_OBSERVABILITY_COMMANDS = [...DISALLOWED_SCOPE_LOCAL_PROMOTION_COMMANDS];
const REQUIRED_SCOPE_LOCAL_SALVAGE_COMMAND_GROUPS = [
  ...REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS,
  ...RUNNER_OBSERVABILITY_COMMANDS,
].map((command) => [command]);

const XR_TARGET_ROUTE = '/work/xr';
const XR_TARGET_GAP = 'GGD/gaps/routes/work-xr.geometry-gap.json';
const XR_REQUIRED_EVALUATOR_FOCUS = ['layout-diff', 'quality', 'flagship-invariants'];
const XR_SEVERITY_LEVELS = ['critical', 'major', 'minor', 'note'];
const SYSTEMS_OPTIMIZER_HYPOTHESES_DIR = 'CLAW/control-plane/system-optimizer/hypotheses';
const ACTIVE_HYPOTHESIS_MIRRORED_FIELDS = [
  'hypothesis',
  'measurement',
  'keep_rule',
  'writable_scope',
  'evaluation_bundle',
  'target_route',
  'target_gap',
  'first_broken_law',
  'severity_baseline',
  'evaluator_focus',
  'runner_focus',
  'failure_mode',
  'closed_fail_rule',
  'evidence_commands',
];
const SEEDED_BACKLOG_HYPOTHESIS_MIRRORED_FIELDS = [...ACTIVE_HYPOTHESIS_MIRRORED_FIELDS];
const RESOLVED_BACKLOG_HYPOTHESIS_MIRRORED_FIELDS = [...ACTIVE_HYPOTHESIS_MIRRORED_FIELDS, 'learning_item'];
const TERMINAL_HYPOTHESIS_MIRRORED_FIELDS = [...ACTIVE_HYPOTHESIS_MIRRORED_FIELDS, 'learning_item', 'recorded_at'];
const RUNNER_STABILITY_ALLOWED_FOCUS = ['recovery', 'queue-invalidation', 'stale-cycle'];
const RUNNER_STABILITY_REPLAYABLE_EVIDENCE_COMMAND_PATTERNS = [
  /^\s*node\s+CLAW\/scripts\/recover-cycle\.mjs(?:\s|$)/,
  /^\s*node\s+CLAW\/scripts\/run-recovery-drill\.mjs(?:\s|$)/,
];
const RUNNER_STABILITY_OBSERVABILITY_COMMAND_PATTERNS = [
  /^\s*node\s+CLAW\/scripts\/run-site-script\.mjs\s+claw:health(?:\s|$)/,
];
const RUNNER_STABILITY_EVIDENCE_COMMAND_PATTERNS = [
  ...RUNNER_STABILITY_REPLAYABLE_EVIDENCE_COMMAND_PATTERNS,
  ...RUNNER_STABILITY_OBSERVABILITY_COMMAND_PATTERNS,
];

function escapeRegexCharacter(character) {
  return /[|\\{}()[\]^$+?.]/.test(character) ? `\\${character}` : character;
}

function globToRegex(pattern) {
  let regex = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    const nextCharacter = pattern[index + 1];

    if (character === '*' && nextCharacter === '*') {
      regex += '.*';
      index += 1;
      continue;
    }

    if (character === '*') {
      regex += '[^/]*';
      continue;
    }

    regex += escapeRegexCharacter(character);
  }
  regex += '$';
  return new RegExp(regex);
}

function scopePatternAllowed(pattern, allowlist) {
  return allowlist.some((allowPattern) => globToRegex(allowPattern).test(pattern));
}

function validateWritableScopePatterns(patterns, label, allowlist, forbiddenList) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return;
  }

  for (const [index, pattern] of patterns.entries()) {
    if (typeof pattern !== 'string' || pattern.trim().length === 0) {
      issues.push(`${label}[${index}] must be a non-empty string scope pattern.`);
      continue;
    }

    if (!scopePatternAllowed(pattern, allowlist)) {
      issues.push(
        `${label}[${index}]=${pattern} escapes the systems-optimizer allowlist. Use one of: ${allowlist.join(', ')}.`,
      );
    }

    const forbiddenMatch = forbiddenList.find((forbiddenPattern) => globToRegex(forbiddenPattern).test(pattern));
    if (forbiddenMatch) {
      issues.push(
        `${label}[${index}]=${pattern} enters forbidden scope ${forbiddenMatch} without an explicit override.`,
      );
    }
  }
}

function writesIntoGgd(scope) {
  return Array.isArray(scope) && scope.some((pattern) => typeof pattern === 'string' && pattern.startsWith('GGD/'));
}

function isXrRatchet(card) {
  return typeof card?.id === 'string' && card.id.startsWith('sysopt.xr-');
}

function isRunnerStabilityRatchet(card) {
  return typeof card?.id === 'string' && card.id.startsWith('sysopt.runner-stability');
}

function buildItemIndex(items, label) {
  const byId = new Map();
  const duplicates = new Set();

  for (const [index, item] of (items || []).entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }

    if (typeof item.id !== 'string' || item.id.trim().length === 0) {
      issues.push(`${label}[${index}] is missing required field: id.`);
      continue;
    }

    if (byId.has(item.id)) {
      duplicates.add(item.id);
      continue;
    }

    byId.set(item.id, item);
  }

  return { byId, duplicates: [...duplicates] };
}

function readLearningItem(card) {
  return typeof card?.learning_item === 'string' ? card.learning_item.trim() : '';
}

function validateResolvedBacklogLearningItem(card, label) {
  if (!['kept', 'rejected'].includes(card?.status)) {
    return;
  }

  if (readLearningItem(card).length === 0) {
    issues.push(`${label} with status ${card.status} must declare learning_item.`);
  }
}

function normalizeComparableValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeComparableValue(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeComparableValue(value[key])]),
    );
  }

  return value;
}

function comparableValuesMatch(left, right) {
  return JSON.stringify(normalizeComparableValue(left)) === JSON.stringify(normalizeComparableValue(right));
}

function hasOwnField(record, field) {
  return Boolean(record) && Object.prototype.hasOwnProperty.call(record, field);
}

function hypothesisCardPath(id) {
  return `${SYSTEMS_OPTIMIZER_HYPOTHESES_DIR}/${id}.json`;
}

function validateScopeLocalPromotionBundle(commands, label) {
  for (const command of REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS) {
    if (!commands.includes(command)) {
      issues.push(`${label} must include ${command} in the scope-local promotion bundle.`);
    }
  }

  for (const command of DISALLOWED_SCOPE_LOCAL_PROMOTION_COMMANDS) {
    if (commands.includes(command)) {
      issues.push(
        `${label} may not include ${command}; treat stale-truth-sensitive global health commands as runner observability, not keep/discard gates.`,
      );
    }
  }

  const uniqueCommands = [...new Set(commands)];
  if (uniqueCommands.length !== commands.length) {
    issues.push(`${label} may not contain duplicate commands inside the scope-local promotion bundle.`);
  }

  if (commands.length !== REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS.length) {
    issues.push(
      `${label} must contain exactly ${REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS.length} commands in the scope-local promotion bundle; found ${commands.length}.`,
    );
  }

  for (const [index, expectedCommand] of REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS.entries()) {
    if (commands[index] !== expectedCommand) {
      issues.push(
        `${label}[${index}] must equal the exact scope-local promotion command ${index + 1}/${REQUIRED_SCOPE_LOCAL_PROMOTION_COMMANDS.length}: ${expectedCommand}.`,
      );
    }
  }
}

function validateXrSeverityBaseline(card, gap, label) {
  const baseline = card.severity_baseline;
  if (!baseline || typeof baseline !== 'object' || Array.isArray(baseline)) {
    issues.push(`${label} must declare severity_baseline.`);
    return;
  }

  const gapSeverity = gap?.severity_counts;
  if (!gapSeverity || typeof gapSeverity !== 'object' || Array.isArray(gapSeverity)) {
    issues.push(`${label} target_gap must expose severity_counts.`);
    return;
  }

  for (const level of XR_SEVERITY_LEVELS) {
    if (!Number.isInteger(baseline[level]) || baseline[level] < 0) {
      issues.push(`${label}.severity_baseline.${level} must be a non-negative integer.`);
      continue;
    }

    if (!Number.isInteger(gapSeverity[level]) || gapSeverity[level] < 0) {
      issues.push(`${label} target_gap severity_counts.${level} must be a non-negative integer.`);
      continue;
    }

    if (baseline[level] !== gapSeverity[level]) {
      issues.push(
        `${label}.severity_baseline.${level} must match target_gap.severity_counts.${level} (${gapSeverity[level]}).`,
      );
    }
  }
}

function validateXrGapBinding(card, label) {
  let gap = null;
  if (card.target_route !== XR_TARGET_ROUTE) {
    issues.push(`${label} must bind target_route to ${XR_TARGET_ROUTE}.`);
  }

  if (card.target_gap !== XR_TARGET_GAP) {
    issues.push(`${label} must bind target_gap to ${XR_TARGET_GAP}.`);
  } else if (!fs.existsSync(projectPath(card.target_gap))) {
    issues.push(`${label} references missing target_gap ${card.target_gap}.`);
  } else {
    try {
      gap = readJson(card.target_gap);
      if (gap.route !== XR_TARGET_ROUTE) {
        issues.push(`${label} target_gap must resolve to route ${XR_TARGET_ROUTE}.`);
      }
      if (gap.kind !== 'geometry-gap') {
        issues.push(`${label} target_gap must resolve to a geometry-gap artifact.`);
      }
      if (!gap.severity_counts || typeof gap.severity_counts !== 'object' || Array.isArray(gap.severity_counts)) {
        issues.push(`${label} target_gap must expose severity_counts.`);
      }
      if (!Array.isArray(gap.top_drift_surfaces) || gap.top_drift_surfaces.length === 0) {
        issues.push(`${label} target_gap must expose a non-empty top_drift_surfaces list.`);
      }
    } catch (error) {
      issues.push(`${label} target_gap could not be read: ${error.message}`);
    }
  }

  if (typeof card.first_broken_law !== 'string' || card.first_broken_law.trim().length === 0) {
    issues.push(`${label} must declare first_broken_law.`);
  } else if (Array.isArray(gap?.top_drift_surfaces) && !gap.top_drift_surfaces.includes(card.first_broken_law)) {
    issues.push(
      `${label}.first_broken_law must match one of target_gap.top_drift_surfaces: ${gap.top_drift_surfaces.join(', ')}.`,
    );
  }

  validateXrSeverityBaseline(card, gap, label);

  if (!Array.isArray(card.evaluator_focus) || card.evaluator_focus.length === 0) {
    issues.push(`${label} must declare a non-empty evaluator_focus array.`);
    return;
  }

  const validFocusValues = [];
  for (const [index, focus] of card.evaluator_focus.entries()) {
    if (typeof focus !== 'string' || focus.trim().length === 0) {
      issues.push(`${label}.evaluator_focus[${index}] must be a non-empty string.`);
      continue;
    }

    validFocusValues.push(focus);
  }

  const uniqueFocusValues = [...new Set(validFocusValues)];
  if (uniqueFocusValues.length !== validFocusValues.length) {
    issues.push(`${label}.evaluator_focus may not contain duplicate focus surfaces.`);
  }

  const hasExactEvaluatorFocusContract =
    validFocusValues.length === XR_REQUIRED_EVALUATOR_FOCUS.length &&
    XR_REQUIRED_EVALUATOR_FOCUS.every((focus) => uniqueFocusValues.includes(focus)) &&
    uniqueFocusValues.every((focus) => XR_REQUIRED_EVALUATOR_FOCUS.includes(focus));

  if (!hasExactEvaluatorFocusContract) {
    issues.push(
      `${label}.evaluator_focus must match the exact XR evaluator focus contract: ${XR_REQUIRED_EVALUATOR_FOCUS.join(', ')}.`,
    );
  }
}

function validateRunnerStabilityContract(card, label) {
  if (typeof card.runner_focus !== 'string' || card.runner_focus.trim().length === 0) {
    issues.push(`${label} must declare runner_focus.`);
  } else if (!RUNNER_STABILITY_ALLOWED_FOCUS.includes(card.runner_focus)) {
    issues.push(
      `${label}.runner_focus must be one of ${RUNNER_STABILITY_ALLOWED_FOCUS.join(', ')}.`,
    );
  }

  for (const field of ['failure_mode', 'closed_fail_rule']) {
    if (typeof card[field] !== 'string' || card[field].trim().length === 0) {
      issues.push(`${label} must declare ${field}.`);
    }
  }

  if (!Array.isArray(card.evidence_commands) || card.evidence_commands.length === 0) {
    issues.push(`${label} must declare a non-empty evidence_commands array.`);
    return;
  }

  validateCommandList(card.evidence_commands, `${label}.evidence_commands`);

  for (const [index, command] of card.evidence_commands.entries()) {
    if (
      !RUNNER_STABILITY_EVIDENCE_COMMAND_PATTERNS.some((pattern) => pattern.test(command))
    ) {
      issues.push(
        `${label}.evidence_commands[${index}] must stay within the explicit runner evidence boundary: node CLAW/scripts/recover-cycle.mjs..., node CLAW/scripts/run-recovery-drill.mjs..., and optional trailing node CLAW/scripts/run-site-script.mjs claw:health.`,
      );
    }
  }

  if (
    !card.evidence_commands.some((command) =>
      RUNNER_STABILITY_EVIDENCE_COMMAND_PATTERNS.some((pattern) => pattern.test(command)),
    )
  ) {
    issues.push(
      `${label}.evidence_commands must include a runner evidence command such as recover-cycle, run-recovery-drill, or claw:health.`,
    );
  }

  if (
    !card.evidence_commands.some((command) =>
      RUNNER_STABILITY_REPLAYABLE_EVIDENCE_COMMAND_PATTERNS.some((pattern) => pattern.test(command)),
    )
  ) {
    issues.push(
      `${label}.evidence_commands must include at least one replayable runner script command such as recover-cycle or run-recovery-drill; claw:health alone is observability, not replayable evidence.`,
    );
  }

  const replayableEvidenceIndex = card.evidence_commands.findIndex((command) =>
    RUNNER_STABILITY_REPLAYABLE_EVIDENCE_COMMAND_PATTERNS.some((pattern) => pattern.test(command)),
  );

  for (const [index, command] of card.evidence_commands.entries()) {
    if (!RUNNER_STABILITY_OBSERVABILITY_COMMAND_PATTERNS.some((pattern) => pattern.test(command))) {
      continue;
    }

    if (replayableEvidenceIndex === -1 || index < replayableEvidenceIndex) {
      issues.push(
        `${label}.evidence_commands must place claw:health observability only after at least one replayable runner script command.`,
      );
    }
  }
}

function validateRunnerScopeLocalSalvageGroups(commandGroups, label) {
  if (!Array.isArray(commandGroups) || commandGroups.length === 0) {
    issues.push(`${label} must be a non-empty command-group list.`);
    return;
  }

  for (const [index, group] of commandGroups.entries()) {
    validateCommandList(group, `${label}[${index}]`);
  }

  if (commandGroups.length !== REQUIRED_SCOPE_LOCAL_SALVAGE_COMMAND_GROUPS.length) {
    issues.push(
      `${label} must contain exactly ${REQUIRED_SCOPE_LOCAL_SALVAGE_COMMAND_GROUPS.length} singleton command groups; found ${commandGroups.length}.`,
    );
  }

  for (const [index, expectedGroup] of REQUIRED_SCOPE_LOCAL_SALVAGE_COMMAND_GROUPS.entries()) {
    const expectedCommand = expectedGroup[0];
    const actualGroup = commandGroups[index];

    if (!Array.isArray(actualGroup) || actualGroup.length === 0) {
      issues.push(`${label}[${index}] must be a non-empty singleton command group for ${expectedCommand}.`);
      continue;
    }

    if (actualGroup.length !== 1) {
      issues.push(
        `${label}[${index}] must keep ${expectedCommand} in its own singleton command group; merged groups weaken required salvage commands into alternatives.`,
      );
    }

    if (actualGroup[0] !== expectedCommand) {
      issues.push(
        `${label}[${index}] must equal the exact systems-optimizer salvage command ${index + 1}/${REQUIRED_SCOPE_LOCAL_SALVAGE_COMMAND_GROUPS.length}: ${expectedCommand}.`,
      );
    }
  }
}

function validateRatchetCard(card, label, options = {}) {
  const {
    requireLearning = false,
    requireScopeLocalPromotionBundle = false,
    allowedScope = REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
    forbiddenScope = REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
  } = options;
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    issues.push(`${label} must be an object.`);
    return;
  }

  for (const field of ['id', 'hypothesis', 'measurement', 'keep_rule']) {
    if (typeof card[field] !== 'string' || card[field].trim().length === 0) {
      issues.push(`${label} is missing required field: ${field}.`);
    }
  }

  for (const field of ['writable_scope', 'evaluation_bundle']) {
    if (!Array.isArray(card[field]) || card[field].length === 0) {
      issues.push(`${label} is missing required array field: ${field}.`);
    }
  }

  validateWritableScopePatterns(card.writable_scope, `${label}.writable_scope`, allowedScope, forbiddenScope);

  if (Array.isArray(card.evaluation_bundle)) {
    validateCommandList(card.evaluation_bundle, `${label}.evaluation_bundle`);

    if (requireScopeLocalPromotionBundle) {
      validateScopeLocalPromotionBundle(card.evaluation_bundle, `${label}.evaluation_bundle`);
    }
  }

  if (writesIntoGgd(card.writable_scope)) {
    for (const command of REQUIRED_GGD_MUTATION_COMMANDS) {
      if (!card.evaluation_bundle?.includes(command)) {
        issues.push(`${label} can write into GGD/** and must include ${command} in evaluation_bundle.`);
      }
    }
  }

  if (isXrRatchet(card)) {
    validateXrGapBinding(card, label);
  }

  if (isRunnerStabilityRatchet(card)) {
    validateRunnerStabilityContract(card, label);
  }

  if (requireLearning && (typeof card.learning_item !== 'string' || card.learning_item.trim().length === 0)) {
    issues.push(`${label} is missing required field: learning_item.`);
  }
}

function validateActiveHypothesisAlignment(card, backlogById, label) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return;
  }

  if (typeof card.id !== 'string' || card.id.trim().length === 0) {
    return;
  }

  const backlogCard = backlogById.get(card.id);
  if (!backlogCard) {
    issues.push(`${label}.id ${card.id} must resolve to exactly one backlog item.`);
    return;
  }

  if (backlogCard.status !== 'seeded') {
    issues.push(`${label}.id ${card.id} must resolve to backlog status seeded; found ${backlogCard.status}.`);
  }

  for (const field of ACTIVE_HYPOTHESIS_MIRRORED_FIELDS) {
    const cardHasField = hasOwnField(card, field);
    const backlogHasField = hasOwnField(backlogCard, field);

    if (cardHasField !== backlogHasField) {
      issues.push(`${label}.${field} presence must match backlog item ${card.id}.`);
      continue;
    }

    if (cardHasField && !comparableValuesMatch(card[field], backlogCard[field])) {
      issues.push(`${label}.${field} must exactly match backlog item ${card.id}.`);
    }
  }
}

function validateActiveHypothesisCardAlignment(card, label, options = {}) {
  const {
    allowedScope = REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
    forbiddenScope = REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
  } = options;

  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return;
  }

  if (typeof card.id !== 'string' || card.id.trim().length === 0) {
    return;
  }

  const relativePath = hypothesisCardPath(card.id);
  if (!fs.existsSync(projectPath(relativePath))) {
    issues.push(`${label}.id ${card.id} must resolve to hypothesis card ${relativePath}.`);
    return;
  }

  let hypothesisCard = null;
  try {
    hypothesisCard = readJson(relativePath);
  } catch (error) {
    issues.push(`${label}.id ${card.id} hypothesis card could not be read: ${error.message}`);
    return;
  }

  validateRatchetCard(hypothesisCard, `${label} hypothesis card`, {
    requireScopeLocalPromotionBundle: true,
    allowedScope,
    forbiddenScope,
  });

  if (hypothesisCard.id !== card.id) {
    issues.push(`${label} hypothesis card id must equal ${card.id}; found ${hypothesisCard.id}.`);
  }

  if (hypothesisCard.status !== 'seeded') {
    issues.push(`${label} hypothesis card status must equal seeded; found ${hypothesisCard.status}.`);
  }

  if (hypothesisCard.lane_id !== 'systems-optimizer') {
    issues.push(`${label} hypothesis card lane_id must equal systems-optimizer.`);
  }

  if (typeof hypothesisCard.recorded_at !== 'string' || hypothesisCard.recorded_at.trim().length === 0) {
    issues.push(`${label} hypothesis card is missing required field: recorded_at.`);
  }

  for (const field of ACTIVE_HYPOTHESIS_MIRRORED_FIELDS) {
    const stateHasField = hasOwnField(card, field);
    const hypothesisHasField = hasOwnField(hypothesisCard, field);

    if (stateHasField !== hypothesisHasField) {
      issues.push(`${label}.${field} presence must match hypothesis card ${card.id}.`);
      continue;
    }

    if (stateHasField && !comparableValuesMatch(card[field], hypothesisCard[field])) {
      issues.push(`${label}.${field} must exactly match hypothesis card ${card.id}.`);
    }
  }
}

function validateTerminalHypothesisAlignment(card, expectedStatus, label, options = {}) {
  const {
    allowedScope = REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
    forbiddenScope = REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
  } = options;

  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return;
  }

  if (typeof card.id !== 'string' || card.id.trim().length === 0) {
    return;
  }

  const relativePath = hypothesisCardPath(card.id);
  if (!fs.existsSync(projectPath(relativePath))) {
    issues.push(`${label}.id ${card.id} must resolve to hypothesis card ${relativePath}.`);
    return;
  }

  let hypothesisCard = null;
  try {
    hypothesisCard = readJson(relativePath);
  } catch (error) {
    issues.push(`${label}.id ${card.id} hypothesis card could not be read: ${error.message}`);
    return;
  }

  validateRatchetCard(hypothesisCard, `${label} hypothesis card`, {
    requireLearning: true,
    requireScopeLocalPromotionBundle: expectedStatus === 'kept',
    allowedScope,
    forbiddenScope,
  });

  if (hypothesisCard.id !== card.id) {
    issues.push(`${label} hypothesis card id must equal ${card.id}; found ${hypothesisCard.id}.`);
  }

  if (hypothesisCard.status !== expectedStatus) {
    issues.push(`${label} hypothesis card status must equal ${expectedStatus}; found ${hypothesisCard.status}.`);
  }

  if (hypothesisCard.lane_id !== 'systems-optimizer') {
    issues.push(`${label} hypothesis card lane_id must equal systems-optimizer.`);
  }

  for (const field of ['recorded_at']) {
    if (typeof hypothesisCard[field] !== 'string' || hypothesisCard[field].trim().length === 0) {
      issues.push(`${label} hypothesis card is missing required field: ${field}.`);
    }
  }

  for (const field of TERMINAL_HYPOTHESIS_MIRRORED_FIELDS) {
    const stateHasField = hasOwnField(card, field);
    const hypothesisHasField = hasOwnField(hypothesisCard, field);

    if (stateHasField !== hypothesisHasField) {
      issues.push(`${label}.${field} presence must match hypothesis card ${card.id}.`);
      continue;
    }

    if (stateHasField && !comparableValuesMatch(card[field], hypothesisCard[field])) {
      issues.push(`${label}.${field} must exactly match hypothesis card ${card.id}.`);
    }
  }
}

function validateResolvedBacklogHypothesisCardAlignment(card, label, learningEntry, options = {}) {
  const {
    allowedScope = REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
    forbiddenScope = REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
  } = options;

  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return;
  }

  if (typeof card.id !== 'string' || card.id.trim().length === 0) {
    return;
  }

  if (!['kept', 'rejected'].includes(card.status)) {
    return;
  }

  const relativePath = hypothesisCardPath(card.id);
  if (!fs.existsSync(projectPath(relativePath))) {
    issues.push(`${label} must resolve to hypothesis card ${relativePath}.`);
    return;
  }

  let hypothesisCard = null;
  try {
    hypothesisCard = readJson(relativePath);
  } catch (error) {
    issues.push(`${label} hypothesis card could not be read: ${error.message}`);
    return;
  }

  validateRatchetCard(hypothesisCard, `${label} hypothesis card`, {
    requireLearning: true,
    allowedScope,
    forbiddenScope,
  });

  if (hypothesisCard.id !== card.id) {
    issues.push(`${label} hypothesis card id must equal ${card.id}; found ${hypothesisCard.id}.`);
  }

  if (hypothesisCard.status !== card.status) {
    issues.push(`${label} hypothesis card status must equal ${card.status}; found ${hypothesisCard.status}.`);
  }

  if (hypothesisCard.lane_id !== 'systems-optimizer') {
    issues.push(`${label} hypothesis card lane_id must equal systems-optimizer.`);
  }

  if (typeof hypothesisCard.recorded_at !== 'string' || hypothesisCard.recorded_at.trim().length === 0) {
    issues.push(`${label} hypothesis card is missing required field: recorded_at.`);
  }

  for (const field of RESOLVED_BACKLOG_HYPOTHESIS_MIRRORED_FIELDS) {
    const backlogHasField = hasOwnField(card, field);
    const hypothesisHasField = hasOwnField(hypothesisCard, field);

    if (backlogHasField !== hypothesisHasField) {
      issues.push(`${label}.${field} presence must match hypothesis card ${card.id}.`);
      continue;
    }

    if (backlogHasField && !comparableValuesMatch(card[field], hypothesisCard[field])) {
      issues.push(`${label}.${field} must exactly match hypothesis card ${card.id}.`);
    }
  }

  if (!learningEntry) {
    issues.push(`${label} must resolve to learning_log entry ${card.id}.`);
    return;
  }

  if (hypothesisCard.recorded_at !== learningEntry.recorded_at) {
    issues.push(`${label} hypothesis card recorded_at must match learning_log entry ${card.id}.`);
  }
}

function validateSeededBacklogHypothesisCardAlignment(card, label, options = {}) {
  const {
    allowedScope = REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
    forbiddenScope = REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
  } = options;

  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return;
  }

  if (typeof card.id !== 'string' || card.id.trim().length === 0) {
    return;
  }

  if (card.status !== 'seeded') {
    return;
  }

  const relativePath = hypothesisCardPath(card.id);
  if (!fs.existsSync(projectPath(relativePath))) {
    issues.push(`${label} must resolve to hypothesis card ${relativePath}.`);
    return;
  }

  let hypothesisCard = null;
  try {
    hypothesisCard = readJson(relativePath);
  } catch (error) {
    issues.push(`${label} hypothesis card could not be read: ${error.message}`);
    return;
  }

  validateRatchetCard(hypothesisCard, `${label} hypothesis card`, {
    requireScopeLocalPromotionBundle: true,
    allowedScope,
    forbiddenScope,
  });

  if (hypothesisCard.id !== card.id) {
    issues.push(`${label} hypothesis card id must equal ${card.id}; found ${hypothesisCard.id}.`);
  }

  if (hypothesisCard.status !== 'seeded') {
    issues.push(`${label} hypothesis card status must equal seeded; found ${hypothesisCard.status}.`);
  }

  if (hypothesisCard.lane_id !== 'systems-optimizer') {
    issues.push(`${label} hypothesis card lane_id must equal systems-optimizer.`);
  }

  if (typeof hypothesisCard.recorded_at !== 'string' || hypothesisCard.recorded_at.trim().length === 0) {
    issues.push(`${label} hypothesis card is missing required field: recorded_at.`);
  }

  for (const field of SEEDED_BACKLOG_HYPOTHESIS_MIRRORED_FIELDS) {
    const backlogHasField = hasOwnField(card, field);
    const hypothesisHasField = hasOwnField(hypothesisCard, field);

    if (backlogHasField !== hypothesisHasField) {
      issues.push(`${label}.${field} presence must match hypothesis card ${card.id}.`);
      continue;
    }

    if (backlogHasField && !comparableValuesMatch(card[field], hypothesisCard[field])) {
      issues.push(`${label}.${field} must exactly match hypothesis card ${card.id}.`);
    }
  }
}

const binding = readJson('GGD/project.binding.json');
const commandSurface = readJson('GGD/commands.json');
const agentLanes = readJson('CLAW/control-plane/agent-lanes.json');
const cycleTemplates = readJson('CLAW/control-plane/cycle-templates.json');
const canonicalPlan = readJson('CLAW/control-plane/plans/canonical-routes-to-producing.json');
const runnerPolicy = readJson('CLAW/control-plane/runner-policy.json');
const optimizerStatePath = binding.system_optimizer?.state || 'CLAW/control-plane/system-optimizer/state.json';
const optimizerBacklogPath = binding.system_optimizer?.backlog || 'CLAW/control-plane/system-optimizer/backlog.json';
const optimizerState = readJson(optimizerStatePath);
const optimizerBacklog = readJson(optimizerBacklogPath);
const backlogItems = Array.isArray(optimizerBacklog.items) ? optimizerBacklog.items : [];
const backlogIndex = buildItemIndex(backlogItems, 'systems-optimizer backlog');
const learningLog = Array.isArray(optimizerState.learning_log) ? optimizerState.learning_log : [];
const learningIndex = buildItemIndex(learningLog, 'systems-optimizer learning_log');
const configuredAllowedScope = Array.isArray(optimizerState.policy?.default_writable_scope)
  ? optimizerState.policy.default_writable_scope
  : [];
const configuredForbiddenScope = Array.isArray(optimizerState.policy?.forbidden_without_explicit_override)
  ? optimizerState.policy.forbidden_without_explicit_override
  : [];

for (const duplicateId of backlogIndex.duplicates) {
  issues.push(`systems-optimizer backlog contains duplicate id ${duplicateId}.`);
}

for (const duplicateId of learningIndex.duplicates) {
  issues.push(`systems-optimizer learning_log contains duplicate id ${duplicateId}.`);
}

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

for (const writePattern of REQUIRED_SYSTEMS_OPTIMIZER_WRITES) {
  if (!optimizerLane?.writes?.includes(writePattern)) {
    issues.push(`systems-optimizer lane is missing required write scope: ${writePattern}`);
  }
}

validateWritableScopePatterns(
  optimizerLane?.writes || [],
  'agent-lanes systems-optimizer writes',
  REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
  REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
);

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

if (!fs.existsSync(projectPath('CLAW/scripts/run-site-script.mjs'))) {
  issues.push('Missing systems-optimizer helper: CLAW/scripts/run-site-script.mjs');
}

if (backlogItems.length === 0) {
  issues.push('systems-optimizer backlog has no items.');
}

for (const item of backlogItems) {
  if (!item.id || !item.hypothesis) {
    issues.push('Each systems-optimizer backlog item must have an id and hypothesis.');
  }
  if (!Array.isArray(item.writable_scope) || item.writable_scope.length === 0) {
    issues.push(`Backlog item ${item.id || '<unknown>'} is missing writable_scope.`);
  }
  if (!Array.isArray(item.evaluation_bundle) || item.evaluation_bundle.length === 0) {
    issues.push(`Backlog item ${item.id || '<unknown>'} is missing evaluation_bundle.`);
  }
  if (typeof item.measurement !== 'string' || item.measurement.trim().length === 0) {
    issues.push(`Backlog item ${item.id || '<unknown>'} is missing measurement.`);
  }
  if (typeof item.keep_rule !== 'string' || item.keep_rule.trim().length === 0) {
    issues.push(`Backlog item ${item.id || '<unknown>'} is missing keep_rule.`);
  }

  validateResolvedBacklogLearningItem(item, `Backlog item ${item.id || '<unknown>'}`);

  if (Array.isArray(item.evaluation_bundle)) {
    validateCommandList(item.evaluation_bundle, `Backlog item ${item.id || '<unknown>'}.evaluation_bundle`);

    if (item.status === 'seeded') {
      validateScopeLocalPromotionBundle(item.evaluation_bundle, `Backlog item ${item.id || '<unknown>'}.evaluation_bundle`);
    }
  }

  if (writesIntoGgd(item.writable_scope)) {
    for (const command of REQUIRED_GGD_MUTATION_COMMANDS) {
      if (!item.evaluation_bundle?.includes(command)) {
        issues.push(
          `Backlog item ${item.id || '<unknown>'} can write into GGD/** and must include ${command} in its evaluation_bundle.`,
        );
      }
    }
  }

  if (isXrRatchet(item)) {
    validateXrGapBinding(item, `Backlog item ${item.id || '<unknown>'}`);
  }

  if (isRunnerStabilityRatchet(item)) {
    validateRunnerStabilityContract(item, `Backlog item ${item.id || '<unknown>'}`);
  }

  validateSeededBacklogHypothesisCardAlignment(
    item,
    `systems-optimizer backlog item ${item.id || '<unknown>'}`,
    {
      allowedScope: configuredAllowedScope,
      forbiddenScope: configuredForbiddenScope,
    },
  );
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

if (!optimizerState.policy?.require_scope_local_promotion_bundle) {
  issues.push('systems-optimizer state must require scope-local promotion bundles.');
}

if (!optimizerState.policy?.require_exact_scope_local_promotion_bundle) {
  issues.push('systems-optimizer state must require exact scope-local promotion bundles for promotable cards.');
}

if (!optimizerState.policy?.require_runner_stability_contract) {
  issues.push('systems-optimizer state must require runner stability contracts.');
}

if (!optimizerState.policy?.require_runner_replayable_evidence_script) {
  issues.push('systems-optimizer state must require replayable runner evidence scripts.');
}

if (!optimizerState.policy?.require_runner_evidence_command_boundary) {
  issues.push('systems-optimizer state must require explicit runner evidence command boundaries.');
}

if (!optimizerState.policy?.require_runner_observability_after_replayable_evidence) {
  issues.push('systems-optimizer state must require runner observability only after replayable evidence commands.');
}

if (!optimizerState.policy?.require_runner_singleton_command_groups) {
  issues.push('systems-optimizer state must require exact singleton systems-optimizer runner command groups.');
}

if (!optimizerState.policy?.require_learning_item_alignment) {
  issues.push('systems-optimizer state must require learning_item alignment across backlog, state, and learning_log.');
}

if (!optimizerState.policy?.require_scope_local_salvage_order) {
  issues.push('systems-optimizer state must require scope-local salvage order.');
}

if (!optimizerState.policy?.require_writable_scope_allowlist) {
  issues.push('systems-optimizer state must require writable scope allowlist enforcement.');
}

if (!optimizerState.policy?.require_exact_xr_evaluator_focus) {
  issues.push('systems-optimizer state must require exact XR evaluator focus.');
}

if (!optimizerState.policy?.require_active_hypothesis_backlog_alignment) {
  issues.push('systems-optimizer state must require active_hypothesis backlog alignment.');
}

if (!optimizerState.policy?.require_active_hypothesis_card_alignment) {
  issues.push('systems-optimizer state must require active_hypothesis hypothesis card alignment.');
}

if (!optimizerState.policy?.require_rejected_change_backlog_alignment) {
  issues.push('systems-optimizer state must require last_rejected_change backlog alignment.');
}

if (!optimizerState.policy?.require_terminal_hypothesis_card_alignment) {
  issues.push('systems-optimizer state must require terminal hypothesis card alignment.');
}

if (!optimizerState.policy?.require_resolved_backlog_hypothesis_card_alignment) {
  issues.push('systems-optimizer state must require resolved backlog hypothesis card alignment.');
}

if (!optimizerState.policy?.require_seeded_backlog_hypothesis_card_alignment) {
  issues.push('systems-optimizer state must require seeded backlog hypothesis card alignment.');
}

for (const writePattern of REQUIRED_SYSTEMS_OPTIMIZER_WRITES) {
  if (!configuredAllowedScope.includes(writePattern)) {
    issues.push(`systems-optimizer state policy is missing required default_writable_scope entry ${writePattern}.`);
  }
}

for (const forbiddenPattern of REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE) {
  if (!configuredForbiddenScope.includes(forbiddenPattern)) {
    issues.push(
      `systems-optimizer state policy is missing forbidden_without_explicit_override entry ${forbiddenPattern}.`,
    );
  }
}

validateWritableScopePatterns(
  configuredAllowedScope,
  'systems-optimizer state default_writable_scope',
  REQUIRED_SYSTEMS_OPTIMIZER_WRITES,
  REQUIRED_SYSTEMS_OPTIMIZER_FORBIDDEN_SCOPE,
);

for (const required of [optimizerStatePath, optimizerBacklogPath, binding.system_optimizer?.evaluation_script]) {
  if (required && !fs.existsSync(projectPath(required))) {
    issues.push(`Missing systems-optimizer artifact: ${required}`);
  }
}

if ((optimizerState.accepted_count || 0) < 0 || (optimizerState.rejected_count || 0) < 0) {
  issues.push('systems-optimizer counters must be non-negative.');
}

if (optimizerState.active_hypothesis !== null) {
  validateRatchetCard(optimizerState.active_hypothesis, 'systems-optimizer active_hypothesis', {
    requireScopeLocalPromotionBundle: true,
    allowedScope: configuredAllowedScope,
    forbiddenScope: configuredForbiddenScope,
  });
  validateActiveHypothesisAlignment(
    optimizerState.active_hypothesis,
    backlogIndex.byId,
    'systems-optimizer active_hypothesis',
  );
  validateActiveHypothesisCardAlignment(optimizerState.active_hypothesis, 'systems-optimizer active_hypothesis', {
    allowedScope: configuredAllowedScope,
    forbiddenScope: configuredForbiddenScope,
  });
}

if ((optimizerState.accepted_count || 0) > 0) {
  validateRatchetCard(optimizerState.last_kept_change, 'systems-optimizer last_kept_change', {
    requireLearning: true,
    requireScopeLocalPromotionBundle: true,
    allowedScope: configuredAllowedScope,
    forbiddenScope: configuredForbiddenScope,
  });
  validateTerminalHypothesisAlignment(optimizerState.last_kept_change, 'kept', 'systems-optimizer last_kept_change', {
    allowedScope: configuredAllowedScope,
    forbiddenScope: configuredForbiddenScope,
  });
}

if ((optimizerState.rejected_count || 0) > 0) {
  validateRatchetCard(optimizerState.last_rejected_change, 'systems-optimizer last_rejected_change', {
    requireLearning: true,
    allowedScope: configuredAllowedScope,
    forbiddenScope: configuredForbiddenScope,
  });
  validateTerminalHypothesisAlignment(
    optimizerState.last_rejected_change,
    'rejected',
    'systems-optimizer last_rejected_change',
    {
      allowedScope: configuredAllowedScope,
      forbiddenScope: configuredForbiddenScope,
    },
  );
}

if (!Array.isArray(optimizerState.learning_log)) {
  issues.push('systems-optimizer state must include a learning_log array.');
} else {
  for (const [index, entry] of learningLog.entries()) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      issues.push(`systems-optimizer learning_log[${index}] must be an object.`);
      continue;
    }
    for (const field of ['id', 'learning', 'recorded_at']) {
      if (typeof entry[field] !== 'string' || entry[field].trim().length === 0) {
        issues.push(`systems-optimizer learning_log[${index}] is missing required field: ${field}.`);
      }
    }
  }
}

const keptBacklogItems = backlogItems.filter((item) => item?.status === 'kept');
const rejectedBacklogItems = backlogItems.filter((item) => item?.status === 'rejected');

if ((optimizerState.accepted_count || 0) !== keptBacklogItems.length) {
  issues.push(
    `systems-optimizer accepted_count must equal kept backlog items (${keptBacklogItems.length}); found ${optimizerState.accepted_count || 0}.`,
  );
}

if ((optimizerState.rejected_count || 0) !== rejectedBacklogItems.length) {
  issues.push(
    `systems-optimizer rejected_count must equal rejected backlog items (${rejectedBacklogItems.length}); found ${optimizerState.rejected_count || 0}.`,
  );
}

if ((optimizerState.accepted_count || 0) > 0 && optimizerState.last_kept_change?.id) {
  const keptBacklogItem = backlogIndex.byId.get(optimizerState.last_kept_change.id);
  if (!keptBacklogItem) {
    issues.push(
      `systems-optimizer last_kept_change.id ${optimizerState.last_kept_change.id} must resolve to a backlog item.`,
    );
  } else if (keptBacklogItem.status !== 'kept') {
    issues.push(
      `systems-optimizer last_kept_change.id ${optimizerState.last_kept_change.id} must resolve to backlog status kept; found ${keptBacklogItem.status}.`,
    );
  } else {
    for (const field of [...ACTIVE_HYPOTHESIS_MIRRORED_FIELDS, 'learning_item']) {
      const stateHasField = hasOwnField(optimizerState.last_kept_change, field);
      const backlogHasField = hasOwnField(keptBacklogItem, field);

      if (stateHasField !== backlogHasField) {
        issues.push(`systems-optimizer last_kept_change.${field} presence must match backlog item ${optimizerState.last_kept_change.id}.`);
        continue;
      }

      if (stateHasField && !comparableValuesMatch(optimizerState.last_kept_change[field], keptBacklogItem[field])) {
        issues.push(`systems-optimizer last_kept_change.${field} must exactly match backlog item ${optimizerState.last_kept_change.id}.`);
      }
    }

    const backlogLearning = readLearningItem(keptBacklogItem);
    const keptLearning = readLearningItem(optimizerState.last_kept_change);
    if (backlogLearning.length > 0 && keptLearning.length > 0 && keptLearning !== backlogLearning) {
      issues.push(
        `systems-optimizer last_kept_change.learning_item for ${optimizerState.last_kept_change.id} must match backlog learning_item.`,
      );
    }

    const learningEntry = learningIndex.byId.get(optimizerState.last_kept_change.id);
    if (learningEntry && keptLearning.length > 0 && keptLearning !== learningEntry.learning) {
      issues.push(
        `systems-optimizer last_kept_change.learning_item for ${optimizerState.last_kept_change.id} must match learning_log.`,
      );
    }
  }
}

if ((optimizerState.rejected_count || 0) > 0 && optimizerState.last_rejected_change?.id) {
  const rejectedBacklogItem = backlogIndex.byId.get(optimizerState.last_rejected_change.id);
  if (!rejectedBacklogItem) {
    issues.push(
      `systems-optimizer last_rejected_change.id ${optimizerState.last_rejected_change.id} must resolve to a backlog item.`,
    );
  } else if (rejectedBacklogItem.status !== 'rejected') {
    issues.push(
      `systems-optimizer last_rejected_change.id ${optimizerState.last_rejected_change.id} must resolve to backlog status rejected; found ${rejectedBacklogItem.status}.`,
    );
  } else {
    for (const field of [...ACTIVE_HYPOTHESIS_MIRRORED_FIELDS, 'learning_item']) {
      const stateHasField = hasOwnField(optimizerState.last_rejected_change, field);
      const backlogHasField = hasOwnField(rejectedBacklogItem, field);

      if (stateHasField !== backlogHasField) {
        issues.push(
          `systems-optimizer last_rejected_change.${field} presence must match backlog item ${optimizerState.last_rejected_change.id}.`,
        );
        continue;
      }

      if (stateHasField && !comparableValuesMatch(optimizerState.last_rejected_change[field], rejectedBacklogItem[field])) {
        issues.push(
          `systems-optimizer last_rejected_change.${field} must exactly match backlog item ${optimizerState.last_rejected_change.id}.`,
        );
      }
    }

    const backlogLearning = readLearningItem(rejectedBacklogItem);
    const rejectedLearning = readLearningItem(optimizerState.last_rejected_change);
    if (backlogLearning.length > 0 && rejectedLearning.length > 0 && rejectedLearning !== backlogLearning) {
      issues.push(
        `systems-optimizer last_rejected_change.learning_item for ${optimizerState.last_rejected_change.id} must match backlog learning_item.`,
      );
    }

    const learningEntry = learningIndex.byId.get(optimizerState.last_rejected_change.id);
    if (learningEntry && rejectedLearning.length > 0 && rejectedLearning !== learningEntry.learning) {
      issues.push(
        `systems-optimizer last_rejected_change.learning_item for ${optimizerState.last_rejected_change.id} must match learning_log.`,
      );
    }
  }
}

for (const item of [...keptBacklogItems, ...rejectedBacklogItems]) {
  validateResolvedBacklogHypothesisCardAlignment(
    item,
    `systems-optimizer backlog item ${item.id}`,
    learningIndex.byId.get(item.id),
    {
      allowedScope: configuredAllowedScope,
      forbiddenScope: configuredForbiddenScope,
    },
  );

  if (!learningIndex.byId.has(item.id)) {
    issues.push(`systems-optimizer learning_log must include a retained learning entry for backlog item ${item.id}.`);
    continue;
  }

  const backlogLearning = readLearningItem(item);
  if (backlogLearning.length > 0 && learningIndex.byId.get(item.id)?.learning !== backlogLearning) {
    issues.push(`systems-optimizer backlog item ${item.id} learning_item must match learning_log.`);
  }
}

for (const entry of learningLog) {
  if (!entry?.id) {
    continue;
  }

  const matchingBacklogItem = backlogIndex.byId.get(entry.id);
  if (!matchingBacklogItem) {
    issues.push(`systems-optimizer learning_log entry ${entry.id} must resolve to a backlog item.`);
    continue;
  }

  if (!['kept', 'rejected'].includes(matchingBacklogItem.status)) {
    issues.push(
      `systems-optimizer learning_log entry ${entry.id} must map to backlog status kept or rejected; found ${matchingBacklogItem.status}.`,
    );
  }
}

if (!optimizerState.last_updated) {
  warnings.push('systems-optimizer state has no last_updated timestamp.');
}

const optimizerRunnerCommandGroups = runnerPolicy.salvage?.required_command_groups_by_lane?.['systems-optimizer'];
if (!Array.isArray(optimizerRunnerCommandGroups) || optimizerRunnerCommandGroups.length === 0) {
  issues.push('runner-policy.json is missing systems-optimizer required command groups.');
} else {
  validateRunnerScopeLocalSalvageGroups(
    optimizerRunnerCommandGroups,
    'runner-policy systems-optimizer command_groups',
  );
}

console.log(
  JSON.stringify(
    {
      clean: issues.length === 0,
      issues,
      warnings,
      lane: optimizerLane,
      backlog_count: (optimizerBacklog.items || []).length,
      policy: optimizerState.policy || null,
      ratchet_contract: {
        backlog_measurement_required: true,
        backlog_keep_rule_required: true,
        learning_log_required: true,
        ggd_mutation_eval_required: true,
        scope_local_promotion_bundle_required_for_seeded: true,
        exact_scope_local_promotion_bundle_required_for_promotable_cards: true,
        xr_gap_binding_required: true,
        xr_first_broken_law_required: true,
        xr_severity_baseline_required: true,
        xr_exact_evaluator_focus_required: true,
        active_hypothesis_backlog_alignment_required: true,
        active_hypothesis_card_alignment_required: true,
        rejected_change_backlog_alignment_required: true,
        terminal_hypothesis_card_alignment_required: true,
        resolved_backlog_hypothesis_card_alignment_required: true,
        seeded_backlog_hypothesis_card_alignment_required: true,
        runner_self_verify_required: true,
        runner_stability_contract_required: true,
        runner_replayable_evidence_script_required: true,
        runner_evidence_command_boundary_required: true,
        runner_observability_after_replayable_evidence_required: true,
        runner_singleton_command_groups_required: true,
        runner_scope_local_salvage_order_required: true,
        state_backlog_link_lock_required: true,
        resolved_backlog_learning_item_required: true,
        learning_item_alignment_required: true,
        writable_scope_allowlist_required: true,
      },
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
