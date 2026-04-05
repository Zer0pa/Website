import fs from 'node:fs';
import path from 'node:path';
import {
  REFERENCE_LAYOUT_SPECS,
  type LayoutPageId,
  type LayoutPageSpec,
  type LayoutReferenceEntry,
} from '../lib/layout/specs';

type LiveEntry = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: number;
  letterSpacing: string;
  text: string;
};

type LiveLayoutArtifact = {
  page: LayoutPageId;
  route: string;
  measuredAt: string;
  viewport: {
    width: number;
    height: number;
  };
  documentHeight: number;
  entries: LiveEntry[];
  measured?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    backgroundColor: string;
    borderColor?: string;
    fontSize?: string | number;
  }>;
  screenshotPath?: string;
};

type DiffItem = {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'cosmetic';
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  distance: number;
  toleranceOverrun: number;
  notes: string[];
};

const root = path.resolve(process.cwd(), '../deterministic-design-system');
const referenceDir = path.join(root, 'maps/reference');
const liveDir = path.join(root, 'maps/live');
const diffDir = path.join(root, 'maps/diff');
const reportDir = path.join(root, 'reports');

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function classifySeverity(distance: number, toleranceOverrun: number, notes: string[]) {
  if (notes.includes('missing-live-entry')) {
    return 'critical' as const;
  }

  if (distance > 120 || toleranceOverrun > 48) {
    return 'critical' as const;
  }

  if (distance > 60 || toleranceOverrun > 24) {
    return 'major' as const;
  }

  if (distance > 24 || toleranceOverrun > 0) {
    return 'minor' as const;
  }

  if (notes.some((note) => note.startsWith('bg:') || note.startsWith('text:'))) {
    return 'minor' as const;
  }

  return 'cosmetic' as const;
}

function compareEntry(reference: LayoutReferenceEntry, live?: LiveEntry): DiffItem {
  if (!live) {
    return {
      id: reference.id,
      severity: 'critical',
      dx: Number.POSITIVE_INFINITY,
      dy: Number.POSITIVE_INFINITY,
      dw: Number.POSITIVE_INFINITY,
      dh: Number.POSITIVE_INFINITY,
      distance: Number.POSITIVE_INFINITY,
      toleranceOverrun: Number.POSITIVE_INFINITY,
      notes: ['missing-live-entry'],
    };
  }

  const dx = Math.round(Math.abs(reference.x - live.x) * 100) / 100;
  const dy = Math.round(Math.abs(reference.y - live.y) * 100) / 100;
  const dw = Math.round(Math.abs(reference.width - live.width) * 100) / 100;
  const dh = reference.ignoreHeightDelta ? 0 : Math.round(Math.abs(reference.height - live.height) * 100) / 100;
  const distance = Math.max(dx, dy, dw, dh);
  const positionTolerance = reference.positionTolerance ?? 12;
  const sizeTolerance = reference.sizeTolerance ?? 18;
  const toleranceOverrun =
    Math.round(
      Math.max(dx - positionTolerance, dy - positionTolerance, dw - sizeTolerance, dh - sizeTolerance, 0) * 100,
    ) / 100;
  const notes: string[] = [];

  if (dx > positionTolerance) notes.push(`x>${positionTolerance}`);
  if (dy > positionTolerance) notes.push(`y>${positionTolerance}`);
  if (dw > sizeTolerance) notes.push(`w>${sizeTolerance}`);
  if (dh > sizeTolerance) notes.push(`h>${sizeTolerance}`);
  if (reference.backgroundColor && live.backgroundColor !== reference.backgroundColor) {
    notes.push(`bg:${live.backgroundColor}`);
  }
  if (reference.textColor && live.textColor !== reference.textColor) {
    notes.push(`text:${live.textColor}`);
  }

  return {
    id: reference.id,
    severity: classifySeverity(distance, toleranceOverrun, notes),
    dx,
    dy,
    dw,
    dh,
    distance,
    toleranceOverrun,
    notes,
  };
}

function normalizeLiveEntries(live: LiveLayoutArtifact) {
  if (Array.isArray(live.entries)) {
    return live.entries;
  }

  return (live.measured || []).map((entry) => ({
    id: entry.id,
    x: entry.x,
    y: entry.y,
    width: entry.width,
    height: entry.height,
    backgroundColor: entry.backgroundColor,
    textColor: entry.color || '',
    borderColor: entry.borderColor || '',
    fontSize: typeof entry.fontSize === 'number' ? entry.fontSize : Number.parseFloat(entry.fontSize || '0') || 0,
    letterSpacing: '',
    text: '',
  }));
}

function summarizeDiff(page: LayoutPageId, spec: LayoutPageSpec, live: LiveLayoutArtifact, diffs: DiffItem[]) {
  const counts = {
    critical: diffs.filter((item) => item.severity === 'critical').length,
    major: diffs.filter((item) => item.severity === 'major').length,
    minor: diffs.filter((item) => item.severity === 'minor').length,
    cosmetic: diffs.filter((item) => item.severity === 'cosmetic').length,
  };

  const sorted = [...diffs].sort((left, right) => right.distance - left.distance);
  const top = sorted.slice(0, 8);

  return `# ${page.toUpperCase()} Verification Report

- Route: \`${spec.route}\`
- Reference viewport: \`${spec.viewport.width}x${spec.viewport.height}\`
- Live viewport: \`${live.viewport.width}x${live.viewport.height}\`
- Live document height: \`${live.documentHeight}\`
- Screenshot: \`${live.screenshotPath || 'not-captured'}\`
- Critical diffs: \`${counts.critical}\`
- Major diffs: \`${counts.major}\`
- Minor diffs: \`${counts.minor}\`
- Cosmetic diffs: \`${counts.cosmetic}\`

## Top Diffs

${top
  .map(
    (item) =>
      `- \`${item.id}\` [${item.severity}] dx=${item.dx} dy=${item.dy} dw=${item.dw} dh=${item.dh} overrun=${item.toleranceOverrun}${
        item.notes.length ? ` :: ${item.notes.join(', ')}` : ''
      }`,
  )
  .join('\n')}
`;
}

function writeArtifacts(page: LayoutPageId, payload: object, report: string) {
  fs.mkdirSync(diffDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });

  const diffPath = path.join(diffDir, `${page}.diff.json`);
  const reportPath = path.join(reportDir, `${page}.verification.md`);

  fs.writeFileSync(diffPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log(`wrote ${diffPath}`);
  console.log(`wrote ${reportPath}`);
}

export function diffPage(page: LayoutPageId) {
  const spec = REFERENCE_LAYOUT_SPECS[page];
  const live = readJsonFile<LiveLayoutArtifact>(path.join(liveDir, `${page}.live.json`));
  const liveEntries = normalizeLiveEntries(live);
  const liveMap = new Map(liveEntries.map((entry) => [entry.id, entry]));
  const diffs = spec.entries.map((entry) => compareEntry(entry, liveMap.get(entry.id)));

  const payload = {
    page,
    route: spec.route,
    comparedAt: new Date().toISOString(),
    diffs,
  };

  writeArtifacts(page, payload, summarizeDiff(page, spec, live, diffs));
}

export function main() {
  const requested = process.argv[2] as LayoutPageId | undefined;
  const pages = requested ? [requested] : (Object.keys(REFERENCE_LAYOUT_SPECS) as LayoutPageId[]);

  for (const page of pages) {
    diffPage(page);
  }
}

main();
