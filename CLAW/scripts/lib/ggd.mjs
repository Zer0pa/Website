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
export const GEOMETRY_LAW_REPORT_DIR = projectPath('deterministic-design-system/reports/geometry-laws');
const DEFAULT_ROUTE_ROLES = ['home', 'flagship', 'product-family'];
const CLOSED_GAP_STATUSES = new Set(['resolved', 'closed', 'archived', 'superseded']);

export function ensureDir(absoluteDirPath) {
  fs.mkdirSync(absoluteDirPath, { recursive: true });
}

export function readJsonFile(relativeOrAbsolutePath) {
  return JSON.parse(fs.readFileSync(projectPath(relativeOrAbsolutePath), 'utf8'));
}

export function readGgdState() {
  return readJson('GGD/state.json');
}

export function readGgdBinding() {
  return readJson('GGD/project.binding.json');
}

export function readBundleIndex() {
  return readJson('GGD/verification/bundles.json');
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

export function routeReportStem(route) {
  if (route === '/') {
    return 'home';
  }
  return routeFileStem(route);
}

export function gapPathForRoute(route, kind = 'geometry-gap') {
  const stem = routeFileStem(route);
  return path.join(GGD_GAP_DIR, `${stem}.${kind}.json`);
}

export function gapIdForRoute(route, kind = 'geometry-gap') {
  return `${routeFileStem(route)}.${kind}`;
}

export function geometryLawReportPathForRoute(route) {
  return path.join(GEOMETRY_LAW_REPORT_DIR, `${routeReportStem(route)}.geometry-law.json`);
}

function severityCountsFromGeometryReport(report) {
  if (report?.counts && typeof report.counts === 'object') {
    return {
      critical: Number(report.counts.critical || 0),
      major: Number(report.counts.major || 0),
      minor: Number(report.counts.minor || 0),
      note: Number(report.counts.note || 0),
    };
  }

  const counts = { critical: 0, major: 0, minor: 0, note: 0 };
  for (const finding of report?.findings || []) {
    const severity = String(finding?.severity || 'note').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(counts, severity)) {
      counts[severity] += 1;
    } else {
      counts.note += 1;
    }
  }
  return counts;
}

export function readGeometryLawVerdict(route) {
  const absoluteReportPath = geometryLawReportPathForRoute(route);
  const relativeReportPath = relativeProjectPath(absoluteReportPath);

  if (!fs.existsSync(absoluteReportPath)) {
    return {
      route,
      status: 'missing',
      counts: { critical: 0, major: 0, minor: 0, note: 0 },
      audited_at: null,
      report: relativeReportPath,
      summary: `Missing geometry-law report for ${route}.`,
      blocking: true,
    };
  }

  const report = JSON.parse(fs.readFileSync(absoluteReportPath, 'utf8'));
  const counts = severityCountsFromGeometryReport(report);
  if (report.route && report.route !== route) {
    return {
      route,
      status: 'route-mismatch',
      counts,
      audited_at: report.auditedAt || null,
      report: relativeReportPath,
      summary: `Geometry-law report route mismatch: expected ${route}, found ${report.route}.`,
      blocking: true,
    };
  }

  const blocking = counts.critical > 0 || counts.major > 0;
  return {
    route,
    status: blocking ? 'fail' : 'pass',
    counts,
    audited_at: report.auditedAt || null,
    report: relativeReportPath,
    summary: blocking
      ? `Geometry-law report for ${route} has ${counts.critical} critical and ${counts.major} major findings.`
      : `Geometry-law report for ${route} passes with zero critical and zero major findings.`,
    blocking,
  };
}

export function inferRouteFromText(value) {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }

  const explicit = text.match(/\/(?:imc|work\/[A-Za-z0-9_-]+)/);
  if (explicit) {
    return explicit[0];
  }

  if (/\bhomepage\b|\bhome route\b/i.test(text)) {
    return '/';
  }

  if (/\bimc\b/i.test(text)) {
    return '/imc';
  }

  return null;
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

export function inferRouteFromJob(job, laneResult = null) {
  const candidates = [
    laneResult?.route,
    laneResult?.target,
    laneResult?.summary,
    job?.objective,
    job?.target,
    ...(job?.acceptance || []),
  ];

  for (const candidate of candidates) {
    const route = inferRouteFromText(candidate);
    if (route) {
      return route;
    }
  }

  const laneId = String(job?.lane_id || '');
  if (laneId === 'homepage-fidelity') {
    return '/';
  }
  if (laneId === 'imc-flagship') {
    return '/imc';
  }

  const phaseId = String(job?.phase_id || job?.phase || '');
  if (phaseId === 'C1') {
    return '/';
  }
  if (phaseId === 'C2') {
    return '/imc';
  }

  return null;
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

  const parseCountsFromText = (text) => {
    const match = String(text).match(/(?:`)?(\d+)(?:`)?\s+critical[\s\S]*?(?:`)?(\d+)(?:`)?\s+major[\s\S]*?(?:`)?(\d+)(?:`)?\s+minor/i);
    if (!match) {
      return null;
    }
    return {
      critical: Number(match[1] || 0),
      major: Number(match[2] || 0),
      minor: Number(match[3] || 0),
      note: 0,
    };
  };

  const route = parseRouteFromHandoff(handoff);
  const routeSpecificNote = notes.find((note) => route && String(note).includes(route) && /critical/i.test(String(note)) && /major/i.test(String(note)) && /minor/i.test(String(note)));
  const routeSpecificCounts = routeSpecificNote ? parseCountsFromText(routeSpecificNote) : null;
  if (routeSpecificCounts) {
    return routeSpecificCounts;
  }

  const layoutCounts = parseCountsFromText(notes.find((note) => /layout diff/i.test(String(note))) || '');
  if (layoutCounts) {
    return layoutCounts;
  }

  const countMatches = notes
    .map((note) => parseCountsFromText(note))
    .filter(Boolean)
    .sort((left, right) =>
      Number(right.critical || 0) - Number(left.critical || 0) ||
      Number(right.major || 0) - Number(left.major || 0) ||
      Number(right.minor || 0) - Number(left.minor || 0),
    );
  if (countMatches.length > 0) {
    return countMatches[0];
  }

  return { critical: 0, major: 0, minor: 0, note: 0 };
}

function existingEvidenceFilesFromHandoff(handoff) {
  return [...new Set([...(handoff.evidence_files || []), ...(handoff.files_changed || []), handoff.audit_result?.report || null].filter(Boolean))];
}

function evidenceJsonPathForRoute(handoff, route, matcher) {
  const routeStem = routeReportStem(route);
  const explicitMatch = existingEvidenceFilesFromHandoff(handoff).find((filePath) => matcher(filePath, routeStem));
  if (!explicitMatch) {
    return null;
  }
  const absolutePath = projectPath(explicitMatch);
  return fs.existsSync(absolutePath) ? absolutePath : null;
}

function topDiffIdsFromEvidence(handoff, route) {
  const diffPath = evidenceJsonPathForRoute(
    handoff,
    route,
    (filePath, routeStem) => filePath.endsWith(`${routeStem}.diff.json`) && filePath.includes('/maps/diff/'),
  );
  if (!diffPath) {
    return [];
  }

  try {
    const report = JSON.parse(fs.readFileSync(diffPath, 'utf8'));
    return [...new Set(
      (report.diffs || [])
        .filter((diff) => diff && diff.id && diff.id !== 'work.lane.page')
        .sort((left, right) => Number(right.distance || 0) - Number(left.distance || 0))
        .slice(0, 8)
        .map((diff) => String(diff.id).trim())
        .filter(Boolean),
    )];
  } catch {
    return [];
  }
}

function topGeometryEntriesFromEvidence(handoff, route) {
  const geometryPath = evidenceJsonPathForRoute(
    handoff,
    route,
    (filePath, routeStem) => filePath.endsWith(`${routeStem}.geometry-law.json`) && filePath.includes('/reports/geometry-laws/'),
  );
  if (!geometryPath) {
    return [];
  }

  try {
    const report = JSON.parse(fs.readFileSync(geometryPath, 'utf8'));
    const rankedFindings = [...(report.findings || [])].sort((left, right) => {
      const rank = { critical: 3, major: 2, minor: 1, note: 0 };
      const severityDelta = (rank[String(right.severity || 'note').toLowerCase()] || 0) - (rank[String(left.severity || 'note').toLowerCase()] || 0);
      if (severityDelta !== 0) {
        return severityDelta;
      }
      return Number(right.delta || 0) - Number(left.delta || 0);
    });
    return [...new Set(
      rankedFindings
        .slice(0, 8)
        .flatMap((finding) => (finding.entries || []).map((entry) => String(entry).trim()))
        .filter(Boolean),
    )];
  } catch {
    return [];
  }
}

export function topDriftSurfacesFromHandoff(handoff) {
  const notes = handoff.audit_result?.notes || [];
  const top = notes.find((note) => String(note).includes('Largest'));
  if (!top) {
    const route = parseRouteFromHandoff(handoff);
    return [...new Set([...topDiffIdsFromEvidence(handoff, route), ...topGeometryEntriesFromEvidence(handoff, route)])];
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

function gapHasMeasuredEvidence(gap) {
  const counts = gap?.severity_counts || {};
  const hasSeverity = ['critical', 'major', 'minor', 'note'].some((level) => Number(counts[level] || 0) > 0);
  return hasSeverity || (gap?.top_drift_surfaces || []).length > 0 || (gap?.evidence_files || []).length > 0;
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

export function routeMatchesPattern(route, pattern) {
  if (!pattern) {
    return false;
  }
  if (pattern === 'all') {
    return true;
  }
  if (pattern === route) {
    return true;
  }
  if (pattern === '/work/[slug]' && route.startsWith('/work/')) {
    return true;
  }
  return false;
}

export function governingBundlesForRoute(route) {
  const role = routeRoleForRoute(route);
  return (readBundleIndex().bundles || []).filter((bundle) => {
    const allowedRoles =
      Array.isArray(bundle.applies_to_route_roles) && bundle.applies_to_route_roles.length > 0
        ? bundle.applies_to_route_roles
        : DEFAULT_ROUTE_ROLES;
    return allowedRoles.includes('all') || allowedRoles.includes(role);
  });
}

export function gapKindsOwnedByLane(laneId) {
  const bundles = readBundleIndex().bundles || [];
  return [...new Set(bundles.filter((bundle) => bundle.owner_lane === laneId).map((bundle) => bundle.gap_kind).filter(Boolean))];
}

export function isGapOpen(gap) {
  return !CLOSED_GAP_STATUSES.has(String(gap?.status || '').toLowerCase());
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

export function loadRouteGapRecords(route, options = {}) {
  const { kinds = null, onlyOpen = false } = options;
  const allowedKinds = Array.isArray(kinds) ? new Set(kinds) : null;
  return loadGapRecords().filter((gap) => {
    if (gap.route !== route) {
      return false;
    }
    if (allowedKinds && !allowedKinds.has(gap.kind)) {
      return false;
    }
    if (onlyOpen && !isGapOpen(gap)) {
      return false;
    }
    return true;
  });
}

export function loadBlockingGapRecords(route) {
  return loadRouteGapRecords(route, { onlyOpen: true });
}

export function inferGapKindFromHandoff(handoff, laneId) {
  const ownedKinds = gapKindsOwnedByLane(laneId);
  if (ownedKinds.length === 1) {
    return ownedKinds[0];
  }

  const text = [
    handoff.summary,
    handoff.recommendation,
    ...(handoff.audit_result?.notes || []),
    ...(handoff.postflight_metrics?.notes || []),
    ...(handoff.known_risks || []),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

  const heuristics = [
    { kind: 'breakpoint-gap', patterns: ['horizontal overflow', 'responsive', 'viewport', 'mobile', 'tablet', 'desktop'] },
    { kind: 'contrast-gap', patterns: ['contrast', 'legibility', 'warning-band', 'luminance'] },
    { kind: 'semantic-gap', patterns: ['main landmark', 'title', 'description', 'heading hierarchy', 'metadata', 'seo'] },
    { kind: 'truth-gap', patterns: ['truth contradiction', 'packet truth', 'flagship', 'route-role truth', 'flattening'] },
    { kind: 'quality-gap', patterns: ['build', 'parser', 'measurement-hook', 'kernel simplicity', 'code quality'] },
    { kind: 'geometry-gap', patterns: ['layout diff', 'geometry', 'drift', 'spacing', 'grid', 'hero', 'dx=', 'dy=', 'dw=', 'dh='] },
  ];

  for (const rule of heuristics) {
    if (ownedKinds.includes(rule.kind) && rule.patterns.some((pattern) => text.includes(pattern))) {
      return rule.kind;
    }
  }

  return ownedKinds[0] || 'geometry-gap';
}

export function buildGapRecordFromHandoff(handoff, options = {}) {
  const route = options.route || parseRouteFromHandoff(handoff);
  const kind = options.kind || inferGapKindFromHandoff(handoff, handoff.lane);
  const severityCounts = severityCountsFromHandoff(handoff);
  const gap = {
    version: 1,
    id: gapIdForRoute(route, kind),
    route,
    route_role: routeRoleForRoute(route),
    kind,
    status: options.status || 'open',
    source_handoff: options.source_handoff || handoff.source_handoff || handoff.handoff_file || '',
    cycle_id: handoff.cycle_id || null,
    phase_id: handoff.phase || handoff.phase_id || null,
    lane: handoff.lane || null,
    hypothesis: handoff.hypothesis || null,
    summary: handoff.audit_result?.summary || handoff.recommendation || handoff.summary || null,
    severity_counts: severityCounts,
    top_drift_surfaces: topDriftSurfacesFromHandoff(handoff),
    flagship_invariants_intact: Boolean(
      (handoff.audit_result?.notes || []).some((note) => String(note).includes('IMC flagship invariants remain intact')) ||
        (handoff.learning_captured || []).some((note) => String(note).toLowerCase().includes('flagship')) ||
        route !== '/imc',
    ),
    responsive_integrity: {
      horizontal_overflow: (handoff.audit_result?.notes || []).some((note) => String(note).includes('no horizontal overflow')),
      notes: (handoff.audit_result?.notes || []).filter((note) => String(note).includes('horizontal overflow')),
    },
    quality_findings_summary:
      (handoff.postflight_metrics?.notes || []).find((note) => String(note).includes('audit:quality')) ||
      (handoff.postflight_metrics?.notes || []).find((note) => /critical|major/i.test(String(note))) ||
      null,
    recommendation: handoff.recommendation || null,
    next_hypothesis: handoff.next_hypothesis || null,
    rollback_target: handoff.rollback_target || null,
    evidence_files: [...new Set([...(handoff.files_changed || []), handoff.audit_result?.report || null].filter(Boolean))],
    learning_captured: handoff.learning_captured || [],
    commands_run: handoff.commands_run || [],
    known_risks: handoff.known_risks || [],
  };

  const existingGapPath = gapPathForRoute(route, kind);
  if (fs.existsSync(existingGapPath)) {
    try {
      const existingGap = JSON.parse(fs.readFileSync(existingGapPath, 'utf8'));
      if (!gapHasMeasuredEvidence(gap) && gapHasMeasuredEvidence(existingGap)) {
        gap.severity_counts = existingGap.severity_counts || gap.severity_counts;
        gap.top_drift_surfaces = existingGap.top_drift_surfaces || gap.top_drift_surfaces;
        gap.quality_findings_summary = existingGap.quality_findings_summary || gap.quality_findings_summary;
        gap.evidence_files = [...new Set([...(existingGap.evidence_files || []), ...(gap.evidence_files || [])])];
        gap.learning_captured = [
          ...new Set([
            ...(gap.learning_captured || []),
            `Preserved prior measured ${kind} evidence because this handoff did not produce fresh structured drift data.`,
          ]),
        ];
        gap.preserved_measured_evidence_from = existingGap.source_handoff || null;
      }
    } catch {}
  }

  return gap;
}

export function writeGapRecord(gap) {
  const outputPath = gapPathForRoute(gap.route, gap.kind);
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, `${JSON.stringify(gap, null, 2)}\n`, 'utf8');
  return outputPath;
}

export function resolveGapRecords(route, options = {}) {
  const { kinds = null, resolved_by_handoff = null, resolved_by_job = null, resolution_summary = null } = options;
  const allowedKinds = Array.isArray(kinds) && kinds.length > 0 ? new Set(kinds) : null;
  const updated = [];

  if (!fs.existsSync(GGD_GAP_DIR)) {
    return updated;
  }

  for (const fileName of fs.readdirSync(GGD_GAP_DIR).filter((name) => name.endsWith('.json'))) {
    const relativePath = path.join('GGD/gaps/routes', fileName);
    const gap = readJsonFile(relativePath);
    if (gap.route !== route) {
      continue;
    }
    if (allowedKinds && !allowedKinds.has(gap.kind)) {
      continue;
    }
    if (!isGapOpen(gap)) {
      continue;
    }

    gap.status = 'resolved';
    gap.resolved_at = localTimestamp();
    gap.resolved_by_handoff = resolved_by_handoff;
    gap.resolved_by_job = resolved_by_job;
    gap.resolution_summary = resolution_summary || 'Resolved by an accepted verification slice.';
    writeJson(projectPath(relativePath), gap);
    updated.push(gap);
  }

  return updated;
}

export function evaluateRouteGate(laneId, route) {
  const routeRole = routeRoleForRoute(route);
  const bundles = governingBundlesForRoute(route);
  const blockingGaps = loadBlockingGapRecords(route);

  return {
    route,
    route_role: routeRole,
    governing_bundle_ids: bundles.map((bundle) => bundle.id),
    owned_gap_kinds: bundles.filter((bundle) => bundle.owner_lane === laneId).map((bundle) => bundle.gap_kind).filter(Boolean),
    blocking_gaps: blockingGaps.map((gap) => ({
      id: gap.id,
      kind: gap.kind,
      status: gap.status,
      summary: gap.summary || '',
      severity_counts: gap.severity_counts || { critical: 0, major: 0, minor: 0, note: 0 },
    })),
    blocks_acceptance: laneId === 'integration' && blockingGaps.length > 0,
  };
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
