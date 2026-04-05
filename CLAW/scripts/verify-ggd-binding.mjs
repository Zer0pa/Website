#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { loadGapRecords } from './lib/ggd.mjs';

const issues = [];
const warnings = [];

function resolveTargetPath(target) {
  if (!target) {
    return null;
  }
  return target.startsWith('/') ? target : projectPath(target);
}

function readJsonIfPresent(target) {
  const resolved = resolveTargetPath(target);
  if (!resolved || !fs.existsSync(resolved)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function runLawsetCheck(enginePath, lawsetPath, contextPath = null) {
  const args = [enginePath, 'check-lawset', '--lawset', lawsetPath];
  if (contextPath) {
    args.push('--context', contextPath);
  }

  try {
    const output = execFileSync('python3', args, {
      cwd: projectPath('.'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      clean: true,
      report: JSON.parse(output),
      error: null,
    };
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : '';
    const stderr = error?.stderr ? String(error.stderr) : '';
    let report = null;
    try {
      report = stdout ? JSON.parse(stdout) : null;
    } catch {}

    return {
      clean: false,
      report,
      error: stderr.trim() || stdout.trim() || (error instanceof Error ? error.message : String(error)),
    };
  }
}

const binding = readJson('GGD/project.binding.json');
const bundles = readJson('GGD/verification/bundles.json');
const state = readJson('GGD/state.json');
const commandSurface = readJson('GGD/commands.json');
const equationSurface = binding.equation_surface || {};
const commandCatalog = binding.external_surface?.command_catalog
  ? JSON.parse(fs.readFileSync(binding.external_surface.command_catalog, 'utf8'))
  : [];
const agentCatalog = binding.external_surface?.agent_catalog
  ? JSON.parse(fs.readFileSync(binding.external_surface.agent_catalog, 'utf8'))
  : [];
const localLawsetIndexPath =
  equationSurface.local_lawset_index ||
  commandSurface.local_lawset_index ||
  binding.external_surface?.local_lawset_index ||
  null;
const localLawsetIndex = readJsonIfPresent(localLawsetIndexPath);
const equationEnginePath = equationSurface.engine || binding.external_surface?.equation_engine || commandSurface.equation_engine || null;

for (const required of [
  binding.binding_file,
  binding.state_files.human,
  binding.state_files.machine,
  binding.state_files.runtime,
  binding.command_surface,
  binding.verification_bundle_index,
  binding.scripts.sync_state,
  binding.scripts.export_gap,
  binding.scripts.verify_binding,
  binding.scripts.verify_system_optimizer,
  localLawsetIndexPath,
]) {
  if (!required) {
    continue;
  }
  if (!fs.existsSync(resolveTargetPath(required))) {
    issues.push(`Missing required binding target: ${required}`);
  }
}

const gapRecords = loadGapRecords();
if (gapRecords.length === 0) {
  warnings.push('No GGD route gap records are currently present.');
}

if (!Array.isArray(bundles.bundles) || bundles.bundles.length === 0) {
  issues.push('Verification bundle index is empty.');
}

if ((bundles.bundles || []).some((bundle) => !bundle.gap_kind)) {
  issues.push('Every verification bundle must declare a gap_kind.');
}

if ((bundles.bundles || []).some((bundle) => !Array.isArray(bundle.applies_to_route_roles) || bundle.applies_to_route_roles.length === 0)) {
  issues.push('Every verification bundle must declare applies_to_route_roles.');
}

if (state.command_binding?.binding_file !== binding.binding_file) {
  warnings.push('GGD state command binding does not yet match the project binding file.');
}

if (binding.command_namespace !== 'ggd') {
  issues.push(`Unexpected command namespace: ${binding.command_namespace}`);
}

for (const required of [
  binding.external_surface?.source_root,
  binding.external_surface?.skills_dir,
  binding.external_surface?.agents_dir,
  binding.external_surface?.command_catalog,
  binding.external_surface?.agent_catalog,
  binding.external_surface?.function_catalog,
  binding.external_surface?.equation_engine,
  binding.external_surface?.example_lawset,
  equationSurface.engine,
  equationSurface.function_catalog,
  equationSurface.external_example_lawset,
]) {
  if (required && !fs.existsSync(resolveTargetPath(required))) {
    issues.push(`Missing external GGD surface target: ${required}`);
  }
}

if (commandSurface.namespace !== 'ggd') {
  issues.push(`Unexpected command surface namespace: ${commandSurface.namespace}`);
}

if (commandSurface.command_catalog !== binding.external_surface?.command_catalog) {
  warnings.push('GGD command surface catalog path does not match the project binding file.');
}

if (commandSurface.local_lawset_index && localLawsetIndexPath && commandSurface.local_lawset_index !== localLawsetIndexPath) {
  warnings.push('GGD command surface local lawset index does not match the project binding file.');
}

if (!commandSurface.recommended_commands || Object.keys(commandSurface.recommended_commands).length === 0) {
  issues.push('GGD command surface is missing recommended_commands.');
}

if (!commandCatalog.some((entry) => entry.slug === 'system-optimize')) {
  issues.push('External GGD command catalog is missing `system-optimize`.');
}

if (!agentCatalog.some((entry) => entry.slug === 'ggd-systems-optimizer')) {
  issues.push('External GGD agent catalog is missing `ggd-systems-optimizer`.');
}

if (!commandSurface.recommended_commands?.optimization?.includes('ggd-system-optimize')) {
  issues.push('GGD command surface is missing the optimization recommendation set.');
}

if (!binding.system_optimizer?.state || !binding.system_optimizer?.backlog || !binding.system_optimizer?.evaluation_script) {
  issues.push('GGD project binding is missing system_optimizer bindings.');
}

for (const required of [
  binding.system_optimizer?.state,
  binding.system_optimizer?.backlog,
  binding.system_optimizer?.evaluation_script,
  `${binding.external_surface?.skills_dir}/ggd-system-optimize/SKILL.md`,
  `${binding.external_surface?.agents_dir}/ggd-systems-optimizer.md`,
]) {
  const resolved = resolveTargetPath(required);
  if (required && !fs.existsSync(resolved)) {
    issues.push(`Missing systems-optimizer binding target: ${required}`);
  }
}

const coveredKinds = new Set();
const coveredRouteRoles = new Set();
const seenLawsetIds = new Set();
let checkedLawsetCount = 0;

if (!localLawsetIndexPath) {
  issues.push('GGD project binding is missing equation_surface.local_lawset_index.');
} else if (!localLawsetIndex || !Array.isArray(localLawsetIndex.lawsets) || localLawsetIndex.lawsets.length === 0) {
  issues.push('Local GGD lawset index is missing or empty.');
} else if (!equationEnginePath) {
  issues.push('GGD equation surface is missing an executable engine path.');
} else {
  for (const entry of localLawsetIndex.lawsets) {
    const label = `Local lawset ${entry?.id || '<unknown>'}`;
    if (!entry?.id) {
      issues.push(`${label} is missing required field: id.`);
      continue;
    }

    if (seenLawsetIds.has(entry.id)) {
      issues.push(`Duplicate local lawset id: ${entry.id}`);
      continue;
    }
    seenLawsetIds.add(entry.id);

    if (!entry.kind) {
      issues.push(`${label} is missing required field: kind.`);
    } else {
      coveredKinds.add(entry.kind);
    }

    if (!entry.lawset) {
      issues.push(`${label} is missing required field: lawset.`);
      continue;
    }

    if (entry.kind === 'route-shell') {
      if (!entry.route) {
        issues.push(`${label} is missing required field: route.`);
      }
      if (!entry.route_role) {
        issues.push(`${label} is missing required field: route_role.`);
      } else {
        coveredRouteRoles.add(entry.route_role);
      }
    }

    const lawsetPath = resolveTargetPath(entry.lawset);
    if (!fs.existsSync(lawsetPath)) {
      issues.push(`${label} references a missing lawset file: ${entry.lawset}`);
      continue;
    }

    const contextPath = entry.context ? resolveTargetPath(entry.context) : null;
    if (entry.context && !fs.existsSync(contextPath)) {
      issues.push(`${label} references a missing context file: ${entry.context}`);
      continue;
    }

    const check = runLawsetCheck(equationEnginePath, lawsetPath, contextPath);
    if (!check.clean || !check.report?.summary?.passed) {
      const failureCount = check.report?.summary?.failure_count;
      const failureSummary =
        typeof failureCount === 'number'
          ? `${failureCount} constraint failures`
          : 'a failed equation-law verification run';
      issues.push(`${label} failed executable law verification with ${failureSummary}: ${check.error || 'unknown error'}`);
      continue;
    }

    checkedLawsetCount += 1;
  }
}

for (const requiredKind of ['route-shell', 'typography', 'color']) {
  if (!coveredKinds.has(requiredKind)) {
    issues.push(`Local GGD equation surface is missing required lawset kind: ${requiredKind}`);
  }
}

for (const requiredRole of ['home', 'flagship', 'product-family']) {
  if (!coveredRouteRoles.has(requiredRole)) {
    issues.push(`Local GGD equation surface is missing required route-role coverage: ${requiredRole}`);
  }
}

console.log(
  JSON.stringify(
    {
      clean: issues.length === 0,
      issues,
      warnings,
      gap_count: gapRecords.length,
      bundle_count: bundles.bundles?.length || 0,
      recommended_command_groups: Object.keys(commandSurface.recommended_commands || {}).length,
      local_lawset_count: localLawsetIndex?.lawsets?.length || 0,
      checked_lawset_count: checkedLawsetCount,
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
