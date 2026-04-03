#!/usr/bin/env node

import path from 'node:path';

import { projectPath, readJson } from './lib/control-plane.mjs';
import {
  ensureDir,
  gapPathForRoute,
  parseRouteFromHandoff,
  routeRoleForRoute,
  severityCountsFromHandoff,
  topDriftSurfacesFromHandoff,
} from './lib/ggd.mjs';

function readArg(flag) {
  const raw = process.argv.find((value) => value.startsWith(`${flag}=`));
  return raw ? raw.slice(flag.length + 1) : null;
}

const handoffPath = readArg('--handoff') || 'CLAW/control-plane/runtime/handoffs/C4-20260403T165341Z-03.json';
const handoff = readJson(handoffPath);
const route = readArg('--route') || parseRouteFromHandoff(handoff);
const kind = readArg('--kind') || 'geometry-gap';
const outputPath = projectPath(readArg('--output') || gapPathForRoute(route, kind));
const severityCounts = severityCountsFromHandoff(handoff);

const gap = {
  version: 1,
  id: `${route.replace(/[\/\[\]]+/g, '-').replace(/^-+|-+$/g, '')}.${kind}`,
  route,
  route_role: routeRoleForRoute(route),
  kind,
  status: 'open',
  source_handoff: handoffPath,
  cycle_id: handoff.cycle_id || null,
  phase_id: handoff.phase || null,
  lane: handoff.lane || null,
  hypothesis: handoff.hypothesis || null,
  summary: handoff.audit_result?.summary || handoff.recommendation || null,
  severity_counts: severityCounts,
  top_drift_surfaces: topDriftSurfacesFromHandoff(handoff),
  flagship_invariants_intact: Boolean(
    (handoff.audit_result?.notes || []).some((note) => String(note).includes('IMC flagship invariants remain intact')) ||
      (handoff.learning_captured || []).some((note) => String(note).includes('flagship')) ||
      route !== '/imc',
  ),
  responsive_integrity: {
    horizontal_overflow: (handoff.audit_result?.notes || []).some((note) => String(note).includes('no horizontal overflow')),
    notes: (handoff.audit_result?.notes || []).filter((note) => String(note).includes('horizontal overflow')),
  },
  quality_findings_summary:
    (handoff.postflight_metrics?.notes || []).find((note) => String(note).includes('audit:quality')) ||
    (handoff.postflight_metrics?.notes || []).find((note) => String(note).includes('produced `1` critical')) ||
    null,
  recommendation: handoff.recommendation || null,
  next_hypothesis: handoff.next_hypothesis || null,
  rollback_target: handoff.rollback_target || null,
  evidence_files: [...new Set([
    ...(handoff.files_changed || []),
    handoff.audit_result?.report || null,
  ].filter(Boolean))],
  learning_captured: handoff.learning_captured || [],
  commands_run: handoff.commands_run || [],
  known_risks: handoff.known_risks || [],
};

ensureDir(path.dirname(outputPath));
await import('node:fs').then(({ default: fs }) => {
  fs.writeFileSync(outputPath, `${JSON.stringify(gap, null, 2)}\n`, 'utf8');
});

console.log(
  JSON.stringify(
    {
      written: path.relative(projectPath('.'), outputPath),
      route,
      severity_counts: severityCounts,
    },
    null,
    2,
  ),
);
