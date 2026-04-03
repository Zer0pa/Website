import fs from 'node:fs';
import path from 'node:path';
import { REFERENCE_LAYOUT_SPECS, type LayoutPageId, type LayoutReferenceEntry } from '../lib/layout/specs';

type LiveEntry = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
  }>;
};

type Bounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
};

type RowGroup<T extends LayoutReferenceEntry | LiveEntry> = {
  id: string;
  entries: T[];
  anchorY: number;
  bounds: Bounds;
};

type Finding = {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'note';
  law: 'row-gap' | 'row-ratio' | 'row-span' | 'section-gap' | 'row-order';
  expected: number | string;
  actual: number | string;
  delta: number;
  entries: string[];
};

const root = path.resolve(process.cwd(), '../deterministic-design-system');
const liveDir = path.join(root, 'maps/live');
const reportDir = path.join(root, 'reports/geometry-laws');
const ggdStatePath = path.resolve(process.cwd(), '../GGD/state.json');

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
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
  }));
}

function boundsForEntries(entries: Array<LayoutReferenceEntry | LiveEntry>): Bounds {
  const top = Math.min(...entries.map((entry) => entry.y));
  const left = Math.min(...entries.map((entry) => entry.x));
  const right = Math.max(...entries.map((entry) => entry.x + entry.width));
  const bottom = Math.max(...entries.map((entry) => entry.y + entry.height));
  return {
    top,
    bottom,
    left,
    right,
    width: right - left,
  };
}

function isStructuralContainer(entry: LayoutReferenceEntry) {
  return entry.role === 'authority-page' || entry.role === 'header-shell' || entry.id.endsWith('.page');
}

function buildRowGroups<T extends LayoutReferenceEntry | LiveEntry>(entries: T[]) {
  const sorted = [...entries].sort((left, right) => (left.y === right.y ? left.x - right.x : left.y - right.y));
  const groups: Array<RowGroup<T>> = [];

  for (const entry of sorted) {
    const last = groups.at(-1);
    if (!last) {
      groups.push({
        id: entry.id,
        entries: [entry],
        anchorY: entry.y,
        bounds: boundsForEntries([entry]),
      });
      continue;
    }

    const sameRow = Math.abs(entry.y - last.anchorY) <= 24 && entry.y <= last.bounds.bottom + 24;
    if (!sameRow) {
      groups.push({
        id: entry.id,
        entries: [entry],
        anchorY: entry.y,
        bounds: boundsForEntries([entry]),
      });
      continue;
    }

    last.entries.push(entry);
    last.bounds = boundsForEntries(last.entries);
    last.id = last.entries.map((candidate) => candidate.id).join('|');
  }

  return groups;
}

function classifyPx(delta: number) {
  if (delta > 48) {
    return 'critical' as const;
  }
  if (delta > 24) {
    return 'major' as const;
  }
  if (delta > 12) {
    return 'minor' as const;
  }
  return 'note' as const;
}

function classifyRatio(delta: number) {
  if (delta > 0.12) {
    return 'critical' as const;
  }
  if (delta > 0.06) {
    return 'major' as const;
  }
  if (delta > 0.03) {
    return 'minor' as const;
  }
  return 'note' as const;
}

function pushFinding(findings: Finding[], finding: Finding) {
  if (finding.severity !== 'note') {
    findings.push(finding);
  }
}

function compareGroupedRows(page: LayoutPageId, referenceGroups: Array<RowGroup<LayoutReferenceEntry>>, liveEntries: LiveEntry[]) {
  const liveById = new Map(liveEntries.map((entry) => [entry.id, entry]));
  const findings: Finding[] = [];

  for (const referenceGroup of referenceGroups.filter((group) => group.entries.length > 1)) {
    const liveGroupEntries = referenceGroup.entries.map((entry) => liveById.get(entry.id)).filter(Boolean) as LiveEntry[];
    if (liveGroupEntries.length !== referenceGroup.entries.length) {
      continue;
    }

    const sortedReference = [...referenceGroup.entries].sort((left, right) => left.x - right.x);
    const sortedLive = [...liveGroupEntries].sort((left, right) => left.x - right.x);
    const referenceIds = sortedReference.map((entry) => entry.id);
    const liveIds = sortedLive.map((entry) => entry.id);

    if (referenceIds.join('|') !== liveIds.join('|')) {
      findings.push({
        id: `${page}.${referenceGroup.id}.row-order`,
        severity: 'critical',
        law: 'row-order',
        expected: referenceIds.join(' | '),
        actual: liveIds.join(' | '),
        delta: 1,
        entries: referenceIds,
      });
      continue;
    }

    const referenceBounds = boundsForEntries(sortedReference);
    const liveBounds = boundsForEntries(sortedLive);
    pushFinding(findings, {
      id: `${page}.${referenceGroup.id}.row-span`,
      severity: classifyPx(Math.abs(referenceBounds.width - liveBounds.width)),
      law: 'row-span',
      expected: Math.round(referenceBounds.width * 100) / 100,
      actual: Math.round(liveBounds.width * 100) / 100,
      delta: Math.round(Math.abs(referenceBounds.width - liveBounds.width) * 100) / 100,
      entries: referenceIds,
    });

    for (let index = 0; index < sortedReference.length - 1; index += 1) {
      const currentReference = sortedReference[index];
      const nextReference = sortedReference[index + 1];
      const currentLive = sortedLive[index];
      const nextLive = sortedLive[index + 1];

      const referenceGap = nextReference.x - (currentReference.x + currentReference.width);
      const liveGap = nextLive.x - (currentLive.x + currentLive.width);
      pushFinding(findings, {
        id: `${page}.${currentReference.id}.${nextReference.id}.row-gap`,
        severity: classifyPx(Math.abs(referenceGap - liveGap)),
        law: 'row-gap',
        expected: Math.round(referenceGap * 100) / 100,
        actual: Math.round(liveGap * 100) / 100,
        delta: Math.round(Math.abs(referenceGap - liveGap) * 100) / 100,
        entries: [currentReference.id, nextReference.id],
      });

      const referenceRatio = currentReference.width / referenceBounds.width;
      const liveRatio = currentLive.width / liveBounds.width;
      pushFinding(findings, {
        id: `${page}.${currentReference.id}.${nextReference.id}.row-ratio`,
        severity: classifyRatio(Math.abs(referenceRatio - liveRatio)),
        law: 'row-ratio',
        expected: Math.round(referenceRatio * 1000) / 1000,
        actual: Math.round(liveRatio * 1000) / 1000,
        delta: Math.round(Math.abs(referenceRatio - liveRatio) * 1000) / 1000,
        entries: [currentReference.id, nextReference.id],
      });
    }
  }

  return findings;
}

function compareSectionGaps(page: LayoutPageId, referenceGroups: Array<RowGroup<LayoutReferenceEntry>>, liveEntries: LiveEntry[]) {
  const liveById = new Map(liveEntries.map((entry) => [entry.id, entry]));
  const liveGroups = referenceGroups
    .map((referenceGroup) => {
      const entries = referenceGroup.entries.map((entry) => liveById.get(entry.id)).filter(Boolean) as LiveEntry[];
      if (entries.length !== referenceGroup.entries.length) {
        return null;
      }
      return {
        id: referenceGroup.id,
        entries,
        anchorY: entries[0]?.y || 0,
        bounds: boundsForEntries(entries),
      };
    })
    .filter(Boolean) as Array<RowGroup<LiveEntry>>;

  const findings: Finding[] = [];
  for (let index = 0; index < referenceGroups.length - 1; index += 1) {
    const currentReference = referenceGroups[index];
    const nextReference = referenceGroups[index + 1];
    const currentLive = liveGroups[index];
    const nextLive = liveGroups[index + 1];
    if (!currentLive || !nextLive) {
      continue;
    }

    const referenceGap = nextReference.bounds.top - currentReference.bounds.bottom;
    const liveGap = nextLive.bounds.top - currentLive.bounds.bottom;
    if (referenceGap < 0) {
      continue;
    }
    pushFinding(findings, {
      id: `${page}.${currentReference.id}.${nextReference.id}.section-gap`,
      severity: classifyPx(Math.abs(referenceGap - liveGap)),
      law: 'section-gap',
      expected: Math.round(referenceGap * 100) / 100,
      actual: Math.round(liveGap * 100) / 100,
      delta: Math.round(Math.abs(referenceGap - liveGap) * 100) / 100,
      entries: [...currentReference.entries.map((entry) => entry.id), ...nextReference.entries.map((entry) => entry.id)],
    });
  }

  return findings;
}

function summarize(page: LayoutPageId, findings: Finding[], baseUnitPx: number) {
  const counts = {
    critical: findings.filter((finding) => finding.severity === 'critical').length,
    major: findings.filter((finding) => finding.severity === 'major').length,
    minor: findings.filter((finding) => finding.severity === 'minor').length,
    note: findings.filter((finding) => finding.severity === 'note').length,
  };
  const top = [...findings]
    .sort((left, right) => right.delta - left.delta)
    .slice(0, 10)
    .map((finding) => `- \`${finding.id}\` [${finding.severity}] ${finding.law} expected=${finding.expected} actual=${finding.actual} delta=${finding.delta}`);

  return `# ${page.toUpperCase()} Geometry Law Audit

- Base unit: \`${baseUnitPx}px\`
- Critical: \`${counts.critical}\`
- Major: \`${counts.major}\`
- Minor: \`${counts.minor}\`
- Notes: \`${counts.note}\`

## Top Findings

${top.join('\n') || '- none'}
`;
}

function writeArtifacts(page: LayoutPageId, payload: object, markdown: string) {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, `${page}.geometry-law.json`);
  const mdPath = path.join(reportDir, `${page}.geometry-law.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, `${markdown}\n`, 'utf8');
  console.log(`wrote ${jsonPath}`);
  console.log(`wrote ${mdPath}`);
}

export function auditPage(page: LayoutPageId) {
  const spec = REFERENCE_LAYOUT_SPECS[page];
  const live = readJsonFile<LiveLayoutArtifact>(path.join(liveDir, `${page}.live.json`));
  const liveEntries = normalizeLiveEntries(live);
  const referenceGroups = buildRowGroups(spec.entries.filter((entry) => !isStructuralContainer(entry)));
  const ggdState = readJsonFile<any>(ggdStatePath);
  const baseUnitPx = Number(ggdState?.project_contract?.constants?.base_unit_px || 8);

  const findings = [
    ...compareGroupedRows(page, referenceGroups, liveEntries),
    ...compareSectionGaps(page, referenceGroups, liveEntries),
  ];

  const payload = {
    page,
    route: spec.route,
    auditedAt: new Date().toISOString(),
    baseUnitPx,
    findings,
    counts: {
      critical: findings.filter((finding) => finding.severity === 'critical').length,
      major: findings.filter((finding) => finding.severity === 'major').length,
      minor: findings.filter((finding) => finding.severity === 'minor').length,
      note: findings.filter((finding) => finding.severity === 'note').length,
    },
  };

  writeArtifacts(page, payload, summarize(page, findings, baseUnitPx));
}

export function main() {
  const requested = process.argv[2] as LayoutPageId | undefined;
  const pages = requested ? [requested] : (Object.keys(REFERENCE_LAYOUT_SPECS) as LayoutPageId[]);

  for (const page of pages) {
    auditPage(page);
  }
}

main();
