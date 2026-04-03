#!/usr/bin/env node

import fs from 'node:fs';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { loadGapRecords } from './lib/ggd.mjs';

const issues = [];
const warnings = [];

const binding = readJson('GGD/project.binding.json');
const bundles = readJson('GGD/verification/bundles.json');
const state = readJson('GGD/state.json');

for (const required of [
  binding.binding_file,
  binding.state_files.human,
  binding.state_files.machine,
  binding.state_files.runtime,
  binding.verification_bundle_index,
  binding.scripts.sync_state,
  binding.scripts.export_gap,
  binding.scripts.verify_binding,
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

console.log(
  JSON.stringify(
    {
      clean: issues.length === 0,
      issues,
      warnings,
      gap_count: gapRecords.length,
      bundle_count: bundles.bundles?.length || 0,
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
