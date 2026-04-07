#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { evaluateRouteGate, routeReportStem } from './lib/ggd.mjs';

const control = readJson('CLAW/control-plane/agent-lanes.json');
const issues = [];
const warnings = [];
const checkedLanes = [];

function readLayoutCounts(route) {
  const reportPath = projectPath(`deterministic-design-system/reports/${routeReportStem(route)}.verification.md`);
  if (!fs.existsSync(reportPath)) {
    return null;
  }

  const report = fs.readFileSync(reportPath, 'utf8');
  const readCount = (label) => {
    const match = report.match(new RegExp(`- ${label}: \\\`([0-9]+)\\\``));
    return Number(match?.[1] || 0);
  };

  return {
    critical: readCount('Critical diffs'),
    major: readCount('Major diffs'),
    minor: readCount('Minor diffs'),
  };
}

function readGeometryCounts(route) {
  const reportPath = projectPath(`deterministic-design-system/reports/geometry-laws/${routeReportStem(route)}.geometry-law.json`);
  if (!fs.existsSync(reportPath)) {
    return null;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  return {
    critical: Number(report?.counts?.critical || 0),
    major: Number(report?.counts?.major || 0),
    minor: Number(report?.counts?.minor || 0),
  };
}

function readResponsiveEvidence(route) {
  const reportPath = projectPath('deterministic-design-system/reports/responsive/responsive.verification.md');
  if (!fs.existsSync(reportPath)) {
    return null;
  }

  const report = fs.readFileSync(reportPath, 'utf8');
  const blocks = report
    .split(/^## /m)
    .slice(1)
    .map((block) => `## ${block}`)
    .filter((block) => block.includes(`- Route: \`${route}\``));

  if (blocks.length === 0) {
    return null;
  }

  return {
    horizontal_overflow: blocks.some((block) => /Horizontal overflow:\s*`YES`/i.test(block)),
  };
}

function hasBlockingCounts(counts) {
  return Boolean(counts) && (Number(counts.critical || 0) > 0 || Number(counts.major || 0) > 0);
}

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
const ftLayoutCounts = readLayoutCounts('/work/ft');
const ftGeometryCounts = readGeometryCounts('/work/ft');
const ftResponsiveEvidence = readResponsiveEvidence('/work/ft');
const ftNeedsGeometryGap = hasBlockingCounts(ftLayoutCounts) || hasBlockingCounts(ftGeometryCounts);
const ftNeedsBreakpointGap = Boolean(ftResponsiveEvidence?.horizontal_overflow);

if (ftNeedsGeometryGap && !ftGate.blocks_acceptance) {
  issues.push('Integration route gate for /work/ft should be blocking while current FT geometry evidence remains red.');
}

if (ftNeedsGeometryGap && !ftGate.blocking_gaps.some((gap) => gap.kind === 'geometry-gap')) {
  issues.push('FT integration route gate does not expose the expected geometry-gap.');
}

if (ftNeedsBreakpointGap && !ftGate.blocking_gaps.some((gap) => gap.kind === 'breakpoint-gap')) {
  issues.push('FT integration route gate does not expose the expected breakpoint-gap.');
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
      route_evidence: {
        ft: {
          layout: ftLayoutCounts,
          geometry: ftGeometryCounts,
          responsive: ftResponsiveEvidence,
        },
      },
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}
