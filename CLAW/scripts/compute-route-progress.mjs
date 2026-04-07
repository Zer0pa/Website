#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { controlPath, localTimestamp, projectPath, readJson, relativeProjectPath, writeJson } from './lib/control-plane.mjs';
import { routeReportStem } from './lib/ggd.mjs';

const WEIGHTS_PATH = 'CLAW/control-plane/product-kernel/route-progress.weights.json';
const OUTPUT_PATH = controlPath('reports', 'route-progress.latest.json');

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

function round(value, precision = 1) {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

function parseRecordedTimestamp(value) {
  if (!value) {
    return null;
  }

  const direct = Date.parse(String(value));
  if (Number.isFinite(direct)) {
    return direct;
  }

  const compactMatch = String(value).match(/(\d{8}T\d{6})Z/);
  if (!compactMatch) {
    return null;
  }

  const compact = compactMatch[1];
  const iso = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T${compact.slice(9, 11)}:${compact.slice(11, 13)}:${compact.slice(13, 15)}Z`;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAuditSummaryTimestamp(value) {
  if (!value) {
    return null;
  }

  const direct = Date.parse(String(value));
  if (Number.isFinite(direct)) {
    return direct;
  }

  const dateMatch = String(value).match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (!dateMatch) {
    return null;
  }

  const parsed = Date.parse(`${dateMatch[1]}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : null;
}

function readRecentRuntimeHandoffs() {
  const handoffDir = controlPath('runtime', 'handoffs');
  if (!fs.existsSync(handoffDir)) {
    return [];
  }

  return fs
    .readdirSync(handoffDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => {
      const absolutePath = path.join(handoffDir, name);
      const relativePath = relativeProjectPath(absolutePath);
      const handoff = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
      const stat = fs.statSync(absolutePath);
      const recordedAt =
        parseRecordedTimestamp(
          handoff?.completed_at ||
            handoff?.finished_at ||
            handoff?.recorded_at ||
            handoff?.settled_at ||
            handoff?.cycle_id ||
            name,
        ) || stat.mtimeMs;

      return {
        handoff,
        relativePath,
        recordedAt,
      };
    })
    .sort((left, right) => right.recordedAt - left.recordedAt);
}

function summarizeContrastFailure(entry, auditTimestamp) {
  if (!entry?.handoff) {
    return null;
  }

  if (auditTimestamp && entry.recordedAt && entry.recordedAt < auditTimestamp) {
    return null;
  }

  const fragments = [
    entry.handoff.summary,
    ...(entry.handoff.audit_result?.notes || []),
    ...(entry.handoff.postflight_metrics?.notes || []),
    ...(entry.handoff.blockers || []),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);

  let majorFailures = 0;
  let summary = null;

  for (const fragment of fragments) {
    const majorMatch = fragment.match(/contrast[\s\S]*?(\d+)\s+major/i);
    if (majorMatch) {
      majorFailures = Math.max(majorFailures, Number(majorMatch[1] || 0));
      summary = summary || fragment;
    }

    if (
      /contrast evidence is now red/i.test(fragment) ||
      /latest_audits\.contrast\s*=\s*pass/i.test(fragment) ||
      /contrast bundle is not promotable/i.test(fragment)
    ) {
      summary = summary || fragment;
    }
  }

  if (!summary && majorFailures === 0) {
    return null;
  }

  return {
    relativePath: entry.relativePath,
    majorFailures,
    summary: summary || `contrast failure recorded in ${entry.relativePath}`,
  };
}

function readLayoutCounts(route) {
  const reportPath = projectPath(`deterministic-design-system/reports/${routeReportStem(route)}.verification.md`);
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Missing layout report for ${route}: ${relativeProjectPath(reportPath)}`);
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
    report: relativeProjectPath(reportPath),
  };
}

function readGeometryCounts(route) {
  const reportPath = projectPath(`deterministic-design-system/reports/geometry-laws/${routeReportStem(route)}.geometry-law.json`);
  const report = readJson(reportPath);
  return {
    critical: Number(report?.counts?.critical || 0),
    major: Number(report?.counts?.major || 0),
    minor: Number(report?.counts?.minor || 0),
    report: relativeProjectPath(reportPath),
  };
}

function readResponsiveState(route) {
  const reportPath = projectPath('deterministic-design-system/reports/responsive/responsive.verification.md');
  const report = fs.readFileSync(reportPath, 'utf8');
  const blocks = report
    .split(/^## /m)
    .slice(1)
    .map((block) => `## ${block}`);
  const routeBlocks = blocks.filter((block) => block.includes(`- Route: \`${route}\``));
  if (routeBlocks.length === 0) {
    throw new Error(`Missing responsive report sections for ${route}: ${relativeProjectPath(reportPath)}`);
  }

  const horizontalOverflow = routeBlocks.some((block) => /Horizontal overflow:\s*`YES`/i.test(block));
  const internalOverflow = routeBlocks.some((block) => /Internal overflow:|Overflow culprit:/i.test(block));
  const deviceStates = routeBlocks.map((block) => {
    const headingMatch = block.match(/^##\s+(.+)$/m);
    return {
      viewport: headingMatch?.[1] || 'unknown',
      horizontal_overflow: /Horizontal overflow:\s*`YES`/i.test(block),
      internal_overflow: /Internal overflow:|Overflow culprit:/i.test(block),
    };
  });

  let status = 'clean';
  if (horizontalOverflow) {
    status = 'horizontal_overflow';
  } else if (internalOverflow) {
    status = 'internal_overflow';
  }

  return {
    status,
    horizontal_overflow: horizontalOverflow,
    internal_overflow: internalOverflow,
    report: relativeProjectPath(reportPath),
    device_states: deviceStates,
  };
}

function readQualityState(route) {
  const reportPath = projectPath('deterministic-design-system/reports/quality/quality.verification.json');
  const report = readJson(reportPath);
  const routeEntry = (report.routes || []).find((entry) => entry.route === route);
  if (!routeEntry) {
    throw new Error(`Missing quality report entry for ${route}: ${relativeProjectPath(reportPath)}`);
  }

  const routeIssues =
    (routeEntry.headingSkips || []).length +
    (routeEntry.unlabeledLinks || []).length +
    (routeEntry.unlabeledButtons || []).length +
    (routeEntry.missingAltImages || []).length +
    (routeEntry.nestedInteractive || []).length +
    (routeEntry.duplicateIds || []).length +
    (routeEntry.h1Count === 1 ? 0 : Math.abs(Number(routeEntry.h1Count || 0) - 1));

  return {
    route_issue_count: routeIssues,
    report: relativeProjectPath(reportPath),
  };
}

function scoreFromCounts(counts, penalties) {
  return clampScore(
    100 -
      counts.critical * penalties.critical -
      counts.major * penalties.major -
      counts.minor * penalties.minor,
  );
}

function detectContrastTruth(weights) {
  const runtime = readJson('CLAW/control-plane/state/runtime-state.json');
  const contrastReportPath = projectPath('deterministic-design-system/reports/contrast/contrast.verification.json');
  const contrastReport = readJson(contrastReportPath);
  const runtimeContrastSummary = String(runtime.latest_audits?.contrast || '');

  if (/pass/i.test(runtimeContrastSummary)) {
    const contrastAuditTimestamp = parseAuditSummaryTimestamp(runtimeContrastSummary);
    const contradiction = readRecentRuntimeHandoffs()
      .map((entry) => summarizeContrastFailure(entry, contrastAuditTimestamp))
      .find(Boolean);

    if (contradiction) {
      return {
        status: 'contradictory',
        default_score: Number(weights.contrast_policy.contradiction_score || 50),
        report: relativeProjectPath(contrastReportPath),
        contradiction,
      };
    }
  }

  return {
    status: 'report-backed',
    report: relativeProjectPath(contrastReportPath),
    routes: new Map((contrastReport.routes || []).map((entry) => [entry.route, entry])),
  };
}

function scoreContrast(route, contrastTruth, weights) {
  if (contrastTruth.status === 'contradictory') {
    return {
      score: Number(weights.contrast_policy.contradiction_score || 50),
      status: 'contradictory',
      report: contrastTruth.report,
      contradiction: contrastTruth.contradiction,
    };
  }

  const routeEntry = contrastTruth.routes.get(route);
  if (!routeEntry) {
    return {
      score: 0,
      status: 'missing',
      report: contrastTruth.report,
    };
  }

  const failing = (routeEntry.failing || []).length;
  const warningBand = (routeEntry.warningBand || []).length;
  const score = clampScore(
    Number(weights.contrast_policy.clean || 100) -
      failing * Number(weights.contrast_policy.failing_penalty || 20) -
      warningBand * Number(weights.contrast_policy.warning_penalty || 5),
  );

  return {
    score,
    status: failing > 0 ? 'failing' : warningBand > 0 ? 'warning-band' : 'clean',
    report: contrastTruth.report,
  };
}

const weightsConfig = readJson(WEIGHTS_PATH);
const routes = weightsConfig.routes || [];
const penalties = weightsConfig.severity_penalties || {};
const roundingPrecision = Number(weightsConfig.rounding_precision || 1);
const contrastTruth = detectContrastTruth(weightsConfig);

const routesReport = routes.map((route) => {
  const layout = readLayoutCounts(route);
  const geometry = readGeometryCounts(route);
  const responsive = readResponsiveState(route);
  const quality = readQualityState(route);
  const contrast = scoreContrast(route, contrastTruth, weightsConfig);

  const bundleScores = {
    layout: scoreFromCounts(layout, penalties),
    geometry: scoreFromCounts(geometry, penalties),
    responsive: Number(weightsConfig.responsive_scores?.[responsive.status] || 0),
    quality: clampScore(100 - quality.route_issue_count * Number(weightsConfig.quality_formula?.issue_penalty || 10)),
    contrast: contrast.score,
  };

  const progressPercentage = round(
    Object.entries(weightsConfig.bundle_weights || {}).reduce((total, [bundleId, weight]) => {
      return total + (bundleScores[bundleId] || 0) * (Number(weight || 0) / 100);
    }, 0),
    roundingPrecision,
  );

  const progressConfidence = contrast.status === 'contradictory' ? 0.5 : 1;

  return {
    route,
    progress_percentage: progressPercentage,
    progress_confidence: progressConfidence,
    bundle_scores: Object.fromEntries(
      Object.entries(bundleScores).map(([bundleId, score]) => [bundleId, round(score, roundingPrecision)]),
    ),
    evidence: {
      layout_report: layout.report,
      geometry_report: geometry.report,
      responsive_report: responsive.report,
      quality_report: quality.report,
      contrast_report: contrast.report,
    },
    responsive_status: responsive.status,
    responsive_device_states: responsive.device_states,
    contrast_status: contrast.status,
  };
});

const overallProgressPercentage = round(
  routesReport.reduce((total, route) => total + route.progress_percentage, 0) / Math.max(routesReport.length, 1),
  roundingPrecision,
);

const payload = {
  generated_at: localTimestamp(),
  weights_file: WEIGHTS_PATH,
  overall_progress_percentage: overallProgressPercentage,
  contrast_truth:
    contrastTruth.status === 'contradictory'
      ? {
          status: contrastTruth.status,
          default_score: Number(weightsConfig.contrast_policy.contradiction_score || 50),
          report: contrastTruth.report,
          contradiction: contrastTruth.contradiction,
        }
      : {
          status: contrastTruth.status,
          report: contrastTruth.report,
        },
  routes: routesReport,
};

if (hasFlag('--write')) {
  writeJson(OUTPUT_PATH, payload);
}

console.log(JSON.stringify(payload, null, 2));
