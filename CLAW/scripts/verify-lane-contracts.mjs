#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { evaluateRouteGate } from './lib/ggd.mjs';

const control = readJson('CLAW/control-plane/agent-lanes.json');
const issues = [];
const warnings = [];
const checkedLanes = [];

for (const lane of control.lanes || []) {
  if (lane.id === 'orchestrator') {
    continue;
  }

  const packagePath = path.join(lane.worktree, 'site', 'package.json');
  const auditScriptPath = path.join(lane.worktree, 'site', 'src', 'scripts', 'geometry-law-audit.ts');
  const ggdStatePath = path.join(lane.worktree, 'GGD', 'state.json');
  const ggdBundlesPath = path.join(lane.worktree, 'GGD', 'verification', 'bundles.json');

  if (!fs.existsSync(packagePath)) {
    warnings.push(`Lane ${lane.id} has no site/package.json; skipping script checks.`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (!pkg.scripts?.['audit:geometry-law']) {
    issues.push(`Lane ${lane.id} is missing the audit:geometry-law package script.`);
  }

  if (lane.id === 'systems-optimizer' && !pkg.scripts?.['claw:test:systems-optimizer']) {
    issues.push('Lane systems-optimizer is missing the claw:test:systems-optimizer package script.');
  }

  if (!fs.existsSync(auditScriptPath)) {
    issues.push(`Lane ${lane.id} is missing site/src/scripts/geometry-law-audit.ts.`);
  }

  if (!fs.existsSync(ggdStatePath)) {
    issues.push(`Lane ${lane.id} is missing GGD/state.json.`);
  }

  if (!fs.existsSync(ggdBundlesPath)) {
    issues.push(`Lane ${lane.id} is missing GGD/verification/bundles.json.`);
  }

  checkedLanes.push(lane.id);
}

const xrGate = evaluateRouteGate('integration', '/work/xr');
if (!xrGate.blocks_acceptance) {
  issues.push('Integration route gate for /work/xr should be blocking while the XR gap remains open.');
}

if (!xrGate.blocking_gaps.some((gap) => gap.kind === 'geometry-gap')) {
  issues.push('XR integration route gate does not expose the expected geometry-gap.');
}

const ftGate = evaluateRouteGate('integration', '/work/ft');
if (ftGate.blocks_acceptance) {
  issues.push('Integration route gate for /work/ft should not be blocking before FT gap state exists.');
}

console.log(
  JSON.stringify(
    {
      clean: issues.length === 0,
      issues,
      warnings,
      checked_lanes: checkedLanes,
      route_gates: {
        xr: xrGate,
        ft: ftGate,
      },
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
