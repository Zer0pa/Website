import fs from 'node:fs';
import path from 'node:path';

import { localTimestamp, projectPath, readJson, writeJson } from './control-plane.mjs';

export const GGD_ROOT = projectPath('GGD');
export const GGD_BINDING_PATH = projectPath('GGD/project.binding.json');
export const GGD_STATE_JSON_PATH = projectPath('GGD/state.json');
export const GGD_STATE_MD_PATH = projectPath('GGD/STATE.md');
export const GGD_BUNDLE_INDEX_PATH = projectPath('GGD/verification/bundles.json');
export const GGD_AUGMENTATION_BACKLOG_PATH = projectPath('GGD/augmentations/augmentation-backlog.json');
export const GGD_GAP_DIR = projectPath('GGD/gaps/routes');

export function ensureDir(absoluteDirPath) {
  fs.mkdirSync(absoluteDirPath, { recursive: true });
}

export function readJsonFile(relativeOrAbsolutePath) {
  return JSON.parse(fs.readFileSync(projectPath(relativeOrAbsolutePath), 'utf8'));
}

export function readGgdState() {
  return readJson('GGD/state.json');
}

export function writeGgdState(state) {
  writeJson(GGD_STATE_JSON_PATH, state);
}

export function routeTokenFromValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/[\]-]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '');
}

export function routeFileStem(route) {
  return routeTokenFromValue(route).replace(/[\/\[\]]+/g, '-').replace(/^-+|-+$/g, '');
}

export function gapPathForRoute(route, kind = 'geometry-gap') {
  const stem = routeFileStem(route);
  return path.join(GGD_GAP_DIR, `${stem}.${kind}.json`);
}

export function parseRouteFromHandoff(handoff) {
  const explicitRoute =
    handoff.route ||
    handoff.audit_result?.route ||
    handoff.audit_result?.subject_route ||
    handoff.target?.match(/(\/[A-Za-z0-9/_\-[\]]+)/)?.[1] ||
    null;

  if (explicitRoute) {
    return explicitRoute;
  }

  const reportHint = [
    ...(handoff.audit_result?.notes || []),
    ...(handoff.postflight_metrics?.notes || []),
  ].find((note) => String(note).includes('/work/xr'));

  if (reportHint && reportHint.includes('/work/xr')) {
    return '/work/xr';
  }

  return '/work/unknown';
}

export function severityCountsFromHandoff(handoff) {
  const counts =
    handoff.audit_result?.counts ||
    handoff.postflight_metrics?.counts ||
    handoff.severity_counts ||
    null;

  if (counts && typeof counts === 'object') {
    return {
      critical: Number(counts.critical || 0),
      major: Number(counts.major || 0),
      minor: Number(counts.minor || 0),
      note: Number(counts.note || 0),
    };
  }

  const notes = [
    ...(handoff.audit_result?.notes || []),
    ...(handoff.postflight_metrics?.notes || []),
  ];

  const joined = notes.join('\n');
  const match = joined.match(/`(\d+)` critical.*?`(\d+)` major.*?`(\d+)` minor/i);
  if (match) {
    return {
      critical: Number(match[1] || 0),
      major: Number(match[2] || 0),
      minor: Number(match[3] || 0),
      note: 0,
    };
  }

  return { critical: 0, major: 0, minor: 0, note: 0 };
}

export function topDriftSurfacesFromHandoff(handoff) {
  const notes = handoff.audit_result?.notes || [];
  const top = notes.find((note) => String(note).includes('Largest'));
  if (!top) {
    return [];
  }
  const segment = String(top).includes(':')
    ? String(top).split(':').slice(1).join(':')
    : String(top).split(' in ').slice(1).join(' in ');
  return segment
    .split(',')
    .map((part) =>
      part
        .replace(/\band\b/g, '')
        .replace(/`/g, '')
        .replace(/\.$/, '')
        .trim(),
    )
    .filter(Boolean);
}

export function routeRoleForRoute(route) {
  if (route === '/') {
    return 'home';
  }
  if (route === '/imc') {
    return 'flagship';
  }
  if (route.startsWith('/work/')) {
    return 'product-family';
  }
  return 'unknown';
}

export function loadGapRecords() {
  if (!fs.existsSync(GGD_GAP_DIR)) {
    return [];
  }

  return fs
    .readdirSync(GGD_GAP_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => readJsonFile(path.join('GGD/gaps/routes', name)))
    .sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));
}

export function writeStateMarkdown(state) {
  const routes = state.route_status || {};
  const routeLines = Object.entries(routes)
    .map(([route, info]) => `- \`${route}\`: ${info.status}${info.summary ? ` — ${info.summary}` : ''}`)
    .join('\n');
  const gapLines = (state.gap_records || [])
    .map((gap) => `- \`${gap.id}\`: ${gap.route} — ${gap.status} (${gap.severity_counts.critical} critical, ${gap.severity_counts.major} major)`)
    .join('\n');
  const augmentationLines = (state.augmentation_backlog || [])
    .map((item) => `- \`${item.id}\`: ${item.hypothesis}`)
    .join('\n');
  const blockerLines = (state.blockers || []).map((item) => `- ${item}`).join('\n');
  const todoLines = (state.pending_todos || []).map((item) => `- ${item}`).join('\n');

  const markdown = `# GGD STATE

## Current Position

- date: \`${state.project_reference?.project_md_updated || localTimestamp().slice(0, 10)}\`
- status: \`${state.position?.status || 'unknown'}\`
- current phase: \`Phase ${state.position?.current_phase || '?'} - ${state.position?.current_phase_name || 'Unknown'}\`
- current plan: \`${state.position?.current_plan || 'unknown'}\`

## Command Binding

- command namespace: \`${state.command_binding?.command_namespace || 'ggd'}\`
- binding file: \`${state.command_binding?.binding_file || 'GGD/project.binding.json'}\`
- verification bundle index: \`${state.command_binding?.verification_bundle_index || 'GGD/verification/bundles.json'}\`
- route gap dir: \`${state.command_binding?.gap_dir || 'GGD/gaps/routes'}\`

## Route Status

${routeLines || '- none yet'}

## Active Gaps

${gapLines || '- none yet'}

## Augmentation Backlog

${augmentationLines || '- none yet'}

## Open Gaps

${todoLines || '- none'}

## Blockers

${blockerLines || '- none'}

## Stop Rule

Do not claim unattended recursive readiness until:

- GGD state and CLAW state agree
- GGD verification bundles are operational
- active route failures are represented as explicit gap records
- CLAW promotion decisions consume GGD contract artifacts
`;

  fs.writeFileSync(GGD_STATE_MD_PATH, markdown, 'utf8');
}
