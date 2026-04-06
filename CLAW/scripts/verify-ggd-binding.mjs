#!/usr/bin/env node

import fs from 'node:fs';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { loadGapRecords } from './lib/ggd.mjs';

const issues = [];
const warnings = [];
const REQUIRED_LOCAL_LAWSET_INDEX = 'GGD/equations/lawsets.json';

const binding = readJson('GGD/project.binding.json');
const bundles = readJson('GGD/verification/bundles.json');
const state = readJson('GGD/state.json');
const commandSurface = readJson('GGD/commands.json');
const commandCatalog = binding.external_surface?.command_catalog
  ? JSON.parse(fs.readFileSync(binding.external_surface.command_catalog, 'utf8'))
  : [];
const agentCatalog = binding.external_surface?.agent_catalog
  ? JSON.parse(fs.readFileSync(binding.external_surface.agent_catalog, 'utf8'))
  : [];
const localLawsetIndexPath = binding.system_optimizer?.local_lawset_index;
const localLawsetIndexExists = Boolean(localLawsetIndexPath) && fs.existsSync(projectPath(localLawsetIndexPath));
const localLawsetIndex = localLawsetIndexExists ? readJson(localLawsetIndexPath) : null;

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
  if (!fs.existsSync(projectPath(required))) {
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

if (!localLawsetIndexPath) {
  issues.push('GGD project binding is missing system_optimizer.local_lawset_index.');
} else if (localLawsetIndexPath !== REQUIRED_LOCAL_LAWSET_INDEX) {
  issues.push(
    `GGD project binding must pin system_optimizer.local_lawset_index to ${REQUIRED_LOCAL_LAWSET_INDEX}; found ${localLawsetIndexPath}.`,
  );
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
]) {
  if (required && !fs.existsSync(required)) {
    issues.push(`Missing external GGD surface target: ${required}`);
  }
}

if (commandSurface.namespace !== 'ggd') {
  issues.push(`Unexpected command surface namespace: ${commandSurface.namespace}`);
}

if (commandSurface.command_catalog !== binding.external_surface?.command_catalog) {
  warnings.push('GGD command surface catalog path does not match the project binding file.');
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
  const resolved = required?.startsWith('/') ? required : projectPath(required);
  if (required && !fs.existsSync(resolved)) {
    issues.push(`Missing systems-optimizer binding target: ${required}`);
  }
}

if (localLawsetIndex) {
  if (!Array.isArray(localLawsetIndex.lawsets) || localLawsetIndex.lawsets.length === 0) {
    issues.push('GGD local lawset index must declare at least one lawset entry.');
  }

  const lawsetIds = new Set();
  for (const [index, lawset] of (localLawsetIndex.lawsets || []).entries()) {
    if (!lawset || typeof lawset !== 'object' || Array.isArray(lawset)) {
      issues.push(`GGD local lawset index lawsets[${index}] must be an object.`);
      continue;
    }

    if (typeof lawset.id !== 'string' || lawset.id.trim().length === 0) {
      issues.push(`GGD local lawset index lawsets[${index}] is missing required field: id.`);
    } else if (lawsetIds.has(lawset.id)) {
      issues.push(`GGD local lawset index contains duplicate lawset id ${lawset.id}.`);
    } else {
      lawsetIds.add(lawset.id);
    }

    if (typeof lawset.path !== 'string' || lawset.path.trim().length === 0) {
      issues.push(`GGD local lawset index lawsets[${index}] is missing required field: path.`);
      continue;
    }

    const resolvedLawsetPath = lawset.path.startsWith('/') ? lawset.path : projectPath(lawset.path);
    if (!fs.existsSync(resolvedLawsetPath)) {
      issues.push(`GGD local lawset index lawsets[${index}] points to missing lawset: ${lawset.path}`);
    }
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
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
