#!/usr/bin/env node
/**
 * M4: Compile Fixes
 * Reads open gap records with critical/major failures, evaluates relevant
 * lawsets via M1, and produces fix manifest JSON files in GGD/fixes/.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { evaluateLawset } from './evaluate-lawset.mjs';

// ── Paths ────────────────────────────────────────────────────────────
const __filename = decodeURIComponent(new URL(import.meta.url).pathname);
const SCRIPTS_DIR = dirname(__filename);
const GGD_DIR = resolve(SCRIPTS_DIR, '..');
const GAPS_DIR = resolve(GGD_DIR, 'gaps', 'routes');
const LAWSETS_DIR = resolve(GGD_DIR, 'equations', 'lawsets');
const FIXES_DIR = resolve(GGD_DIR, 'fixes');

// ── Route-to-lawset mapping ──────────────────────────────────────────
const ROUTE_ROLE_LAWSETS = {
  home:             ['home.desktop.shell', 'typography.scale', 'color.contrast'],
  flagship:         ['flagship.desktop.shell', 'typography.scale', 'color.contrast'],
  'product-family': ['product-family.desktop.shell', 'typography.scale', 'color.contrast'],
};

// ── Unit determination ───────────────────────────────────────────────
const PX_KEY_PATTERNS = [
  'width', 'height', 'shell', 'pad', 'gutter', 'gap', '_x',
  'band', 'row', 'col_w', '_u', '_h',
];
// Also match standalone keys: u, h, x
const PX_EXACT_KEYS = new Set(['u', 'h', 'x']);

const NO_UNIT_PATTERNS = ['ratio', 'aspect', 'delta'];

function determineUnit(key, value) {
  // String values starting with "#" are colors — no unit
  if (typeof value === 'string' && value.startsWith('#')) return '';
  if (typeof value === 'string') return '';
  if (typeof value !== 'number') return '';

  // Check no-unit patterns first (ratio, aspect, delta)
  const keyLower = key.toLowerCase();
  for (const pat of NO_UNIT_PATTERNS) {
    if (keyLower.includes(pat)) return '';
  }

  // Check px patterns
  for (const pat of PX_KEY_PATTERNS) {
    if (keyLower.includes(pat)) return 'px';
  }

  // Check exact px keys
  if (PX_EXACT_KEYS.has(key)) return 'px';

  // Default: no unit (typography sizes, contrast scores, etc.)
  return '';
}

function toKebab(str) {
  return str.replace(/[._]/g, '-');
}

function tokenName(lawsetId, key) {
  return `--ggd-${toKebab(lawsetId)}-${toKebab(key)}`;
}

function formatValue(value, unit) {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && value.error) return `error: ${value.error}`;
  return `${value}${unit}`;
}

// ── Route slug helper ────────────────────────────────────────────────
function routeToSlug(route) {
  // "/work/ft" → "work-ft", "/" → "home", "/imc" → "imc"
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/\//g, '-');
}

// ── Collect gap records grouped by route ─────────────────────────────
function loadGapRecords(filterRoute) {
  const files = readdirSync(GAPS_DIR).filter(f => f.endsWith('.json'));
  const byRoute = {};

  for (const file of files) {
    const raw = readFileSync(resolve(GAPS_DIR, file), 'utf-8');
    const gap = JSON.parse(raw);

    // Only process open gaps with critical or major failures
    if (gap.status !== 'open') continue;
    const sev = gap.severity_counts || {};
    if ((sev.critical || 0) === 0 && (sev.major || 0) === 0) continue;

    // Filter by route if requested
    if (filterRoute && gap.route !== filterRoute) continue;

    const route = gap.route;
    if (!byRoute[route]) {
      byRoute[route] = {
        route,
        role: gap.route_role,
        gaps: [],
        severityTotal: { critical: 0, major: 0, minor: 0 },
        driftSurfaces: new Set(),
      };
    }

    byRoute[route].gaps.push(gap);
    byRoute[route].severityTotal.critical += sev.critical || 0;
    byRoute[route].severityTotal.major += sev.major || 0;
    byRoute[route].severityTotal.minor += sev.minor || 0;

    for (const s of (gap.top_drift_surfaces || [])) {
      byRoute[route].driftSurfaces.add(s);
    }
  }

  return byRoute;
}

// ── Build constraint severity map ────────────────────────────────────
function buildConstraintSeverityMap(lawsetRaw) {
  const map = {};
  for (const c of (lawsetRaw.constraints || [])) {
    // Map constraint references to the keys they test
    // The lhs is typically a derived key or constant key
    map[c.id] = {
      severity: c.severity || 'MAJOR',
      lhs: c.lhs,
      rhs: c.rhs,
    };
  }
  return map;
}

// ── Find constraint for a given key ──────────────────────────────────
function findConstraintForKey(key, constraints) {
  for (const c of constraints) {
    if (c.lhs === key) return c;
    if (typeof c.rhs === 'string' && c.rhs === key) return c;
  }
  return null;
}

// ── Main compile logic ───────────────────────────────────────────────
function compileFixes(filterRoute) {
  mkdirSync(FIXES_DIR, { recursive: true });

  const byRoute = loadGapRecords(filterRoute);
  const manifests = [];

  for (const [route, info] of Object.entries(byRoute)) {
    const role = info.role;
    const lawsetIds = ROUTE_ROLE_LAWSETS[role];
    if (!lawsetIds) {
      process.stderr.write(`[warn] No lawset mapping for role "${role}" (route ${route})\n`);
      continue;
    }

    const fixes = [];
    const tokenTargets = {};
    const lawsetsEvaluated = [];

    for (const lawsetId of lawsetIds) {
      const lawsetFile = resolve(LAWSETS_DIR, `${lawsetId}.json`);
      let lawsetRaw;
      try {
        lawsetRaw = JSON.parse(readFileSync(lawsetFile, 'utf-8'));
      } catch (err) {
        process.stderr.write(`[warn] Could not read lawset ${lawsetId}: ${err.message}\n`);
        continue;
      }

      // Evaluate via M1
      let result;
      try {
        result = evaluateLawset(lawsetFile);
      } catch (err) {
        process.stderr.write(`[warn] Could not evaluate lawset ${lawsetId}: ${err.message}\n`);
        continue;
      }

      lawsetsEvaluated.push(lawsetId);
      const constraints = lawsetRaw.constraints || [];

      // Process constants
      for (const [key, value] of Object.entries(result.constants)) {
        const unit = determineUnit(key, value);
        const token = tokenName(lawsetId, key);
        const formatted = formatValue(value, unit);
        const constraint = findConstraintForKey(key, constraints);

        // Propagate gap-level severity: if the gap has critical failures,
        // all geometry fixes for this route are needed to resolve them
        const gapSeverity = info.severityTotal.critical > 0 ? 'CRITICAL'
          : info.severityTotal.major > 0 ? 'MAJOR' : 'MINOR';
        const constraintSev = constraint ? constraint.severity : 'MINOR';
        // Use the higher severity between the constraint and the gap record
        const sevOrder = { CRITICAL: 0, MAJOR: 1, MINOR: 2 };
        const effectiveSev = (sevOrder[gapSeverity] ?? 2) < (sevOrder[constraintSev] ?? 2)
          ? gapSeverity : constraintSev;

        fixes.push({
          property: token,
          target_value: formatted,
          constraint_id: constraint ? constraint.id : null,
          severity: effectiveSev,
          lawset_source: lawsetId,
          description: constraint
            ? `Constraint ${constraint.id}: ${key} ${constraint.op} ${JSON.stringify(constraint.rhs)}`
            : `Constant ${key} from ${lawsetId}`,
        });

        tokenTargets[token] = formatted;
      }

      // Process derived values
      for (const [key, value] of Object.entries(result.derived_values)) {
        if (typeof value === 'object' && value !== null && value.error) continue;
        const unit = determineUnit(key, value);
        const token = tokenName(lawsetId, key);
        const formatted = formatValue(value, unit);
        const constraint = findConstraintForKey(key, constraints);

        const gapSeverity = info.severityTotal.critical > 0 ? 'CRITICAL'
          : info.severityTotal.major > 0 ? 'MAJOR' : 'MINOR';
        const constraintSev = constraint ? constraint.severity : 'MINOR';
        const sevOrder2 = { CRITICAL: 0, MAJOR: 1, MINOR: 2 };
        const effectiveSev = (sevOrder2[gapSeverity] ?? 2) < (sevOrder2[constraintSev] ?? 2)
          ? gapSeverity : constraintSev;

        fixes.push({
          property: token,
          target_value: formatted,
          constraint_id: constraint ? constraint.id : null,
          severity: effectiveSev,
          lawset_source: lawsetId,
          description: constraint
            ? `Constraint ${constraint.id}: ${key} ${constraint.op} ${JSON.stringify(constraint.rhs)}`
            : `Derived value ${key} from ${lawsetId}`,
        });

        tokenTargets[token] = formatted;
      }
    }

    // Sort fixes: CRITICAL first, then MAJOR, then MINOR
    const sevOrder = { CRITICAL: 0, MAJOR: 1, MINOR: 2 };
    fixes.sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3));

    const manifest = {
      version: 1,
      route,
      route_role: role,
      generated_at: new Date().toISOString(),
      source_gaps: info.gaps.map(g => g.id),
      lawsets_evaluated: lawsetsEvaluated,
      severity_summary: {
        critical: info.severityTotal.critical,
        major: info.severityTotal.major,
        minor: info.severityTotal.minor,
      },
      fixes,
      token_targets: tokenTargets,
    };

    const slug = routeToSlug(route);
    const outFile = resolve(FIXES_DIR, `${slug}.fix-manifest.json`);
    writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n');
    manifests.push({ route, slug, outFile, manifest });

    process.stderr.write(
      `[ok] ${slug}.fix-manifest.json: ${fixes.length} fixes ` +
      `(${info.severityTotal.critical} critical, ${info.severityTotal.major} major, ` +
      `${info.severityTotal.minor} minor) from ${lawsetsEvaluated.length} lawsets\n`
    );
  }

  if (manifests.length === 0) {
    process.stderr.write('[info] No open gap records with critical or major failures found.\n');
  } else {
    process.stderr.write(`\n[summary] ${manifests.length} fix manifest(s) written to GGD/fixes/\n`);
  }

  return manifests;
}

// ── CLI entry point ──────────────────────────────────────────────────
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  const args = process.argv.slice(2);
  let filterRoute = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--route' && i + 1 < args.length) {
      filterRoute = args[i + 1];
      i++;
    }
  }

  try {
    compileFixes(filterRoute);
    process.exit(0);
  } catch (err) {
    process.stderr.write(`[error] ${err.message}\n${err.stack}\n`);
    process.exit(1);
  }
}

export { compileFixes };
