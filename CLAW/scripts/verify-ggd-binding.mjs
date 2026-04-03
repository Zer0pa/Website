#!/usr/bin/env node

import fs from 'node:fs';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { loadGapRecords } from './lib/ggd.mjs';

const issues = [];
const warnings = [];

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
  if (required && !fs.existsSync(required)) {
    issues.push(`Missing systems-optimizer binding target: ${required}`);
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
