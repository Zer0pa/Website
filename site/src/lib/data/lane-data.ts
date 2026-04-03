import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { client } from '@/lib/sanity/client';
import type { LanePacket } from '@/lib/types/lane';

export type LaneDataSource = 'sanity' | 'cache' | 'none';

export type LaneCatalog = {
  lanes: LanePacket[];
  featuredLane: LanePacket | null;
  source: LaneDataSource;
  lastSyncedAt: string | null;
};

type SiteSettings = {
  featuredLaneIdentifier?: string;
  lastSyncTimestamp?: string | null;
};

type RawLanePacket = Partial<LanePacket> & {
  repoUrl?: string;
  laneIdentifier?: string;
  laneTitle?: string;
  tagline?: string;
  syncedAt?: string;
};

const CACHE_DIR = path.join(process.cwd(), '.cache/packets');

const SANITY_SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  featuredLaneIdentifier,
  lastSyncTimestamp
}`;

const SANITY_LANE_SNAPSHOTS_QUERY = `*[_type == "laneSnapshot"] | order(coalesce(syncedAt, _createdAt) desc) {
  laneIdentifier,
  laneTitle,
  tagline,
  repoUrl,
  whatThisIs,
  authorityState,
  headlineMetrics,
  provedNow,
  explicitNonClaims,
  openRisks,
  modalityStatus,
  proofAnchors,
  repoShape,
  verificationPath,
  parserWarnings,
  confidenceScore,
  commitSha,
  syncedAt
}`;

export function laneSlug(identifier: string): string {
  return identifier.toLowerCase().replace(/^zpe-/, '');
}

export function laneIdentifierFromSlug(slug: string): string {
  return slug.toLowerCase().startsWith('zpe-') ? slug.toUpperCase() : `ZPE-${slug.toUpperCase()}`;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function cleanText(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:%)])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .trim();
}

function cleanPath(value: string) {
  return cleanText(value).replace(/^(?:\.\.\/|\.\/)+/g, '');
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.toLowerCase();

    if (!cleaned || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function looksLikeJunkNarrative(value: string) {
  return (
    /^!\[[^\]]*\]\([^)]+\)$/.test(value) ||
    /^python -m pip install\b/i.test(value) ||
    /^(?:Optional install surfaces|Technical release truth):?$/i.test(value) ||
    /^(?:Not provided today|normalized .+):?$/i.test(value)
  );
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? uniqueStrings(value.map((entry) => (typeof entry === 'string' ? entry : ''))) : [];
}

function cleanNarrativeList(values: string[], kind: 'whatThisIs' | 'provedNow' | 'nonClaims' | 'openRisks') {
  const filters: RegExp[] = [
    /^\|.*\|$/,
    /^#\s+/,
    /^!\[/,
  ];

  if (kind === 'whatThisIs') {
    filters.push(/^ZPE-[A-Z0-9-]+$/i, /^What is /i);
  }

  if (kind === 'provedNow') {
    filters.push(/^tests_passed=/i, /^throughput_(encode|decode)_words_per_sec=/i, /^Current operator truth/i);
  }

  return uniqueStrings(values).filter(
    (value) => !looksLikeJunkNarrative(value) && !filters.some((pattern) => pattern.test(value)),
  );
}

function asMetricArray(value: unknown): LanePacket['headlineMetrics'] {
  return Array.isArray(value)
    ? value.map((entry: any) => ({
        label: cleanText(asString(entry?.label)),
        valueRaw: cleanText(asString(entry?.valueRaw)),
        numericValue: typeof entry?.numericValue === 'number' ? entry.numericValue : undefined,
        unit: cleanText(asString(entry?.unit)),
        sourceFile: cleanPath(asString(entry?.sourceFile)),
      }))
        .filter((entry) => entry.label && entry.valueRaw)
    : [];
}

function asModalityArray(value: unknown): LanePacket['modalityStatus'] {
  return Array.isArray(value)
    ? value.map((entry: any) => ({
        modalityName: cleanText(asString(entry?.modalityName)),
        rawStatus: cleanText(asString(entry?.rawStatus)),
        verdict: normalizeVerdict(entry?.verdict),
        notes: cleanText(asString(entry?.notes)),
      }))
        .filter((entry) => entry.modalityName && entry.rawStatus)
    : [];
}

function asProofAnchorArray(value: unknown): LanePacket['proofAnchors'] {
  return Array.isArray(value)
    ? value.map((entry: any) => ({
        label: cleanText(asString(entry?.label)),
        path: cleanPath(asString(entry?.path)),
        repoUrl: normalizeGithubUrl(asString(entry?.repoUrl)),
        description: cleanText(asString(entry?.description)),
      }))
        .filter((entry) => entry.path && !entry.path.startsWith('mailto:'))
    : [];
}

function asRepoShapeArray(value: unknown): LanePacket['repoShape'] {
  return Array.isArray(value)
    ? value.map((entry: any) => ({
        path: cleanPath(asString(entry?.path)),
        description: cleanText(asString(entry?.description)),
      }))
        .filter((entry) => entry.path && !entry.path.startsWith('mailto:'))
    : [];
}

function normalizeVerdict(value: unknown): LanePacket['modalityStatus'][number]['verdict'] {
  const raw = asString(value).toUpperCase();

  if (raw === 'PASS' || raw === 'FAIL' || raw === 'INCONCLUSIVE' || raw === 'DEGRADED') {
    return raw;
  }

  return 'INCONCLUSIVE';
}

export function normalizeLanePacket(raw: RawLanePacket, fallbackRepoUrl = ''): LanePacket {
  const laneIdentifier = asString(raw.laneIdentifier, deriveIdentifierFromRepoUrl(fallbackRepoUrl));
  const repoUrl = asString(raw.repoUrl, fallbackRepoUrl);
  const authorityState = (raw.authorityState || {}) as Partial<LanePacket['authorityState']>;

  return {
    laneIdentifier,
    laneTitle: cleanText(asString(raw.laneTitle, laneIdentifier)),
    repoUrl,
    tagline: cleanText(asString(raw.tagline)),
    whatThisIs: cleanNarrativeList(asStringArray(raw.whatThisIs), 'whatThisIs'),
    authorityState: {
      status: normalizeAuthorityStatus(authorityState.status),
      timestamp: cleanText(asString(authorityState.timestamp)),
      summary: cleanText(asString(authorityState.summary)),
      sourceFile: cleanPath(asString(authorityState.sourceFile, 'README.md')),
    },
    headlineMetrics: asMetricArray(raw.headlineMetrics),
    provedNow: cleanNarrativeList(asStringArray(raw.provedNow), 'provedNow'),
    explicitNonClaims: cleanNarrativeList(asStringArray(raw.explicitNonClaims), 'nonClaims'),
    openRisks: cleanNarrativeList(asStringArray(raw.openRisks), 'openRisks'),
    modalityStatus: asModalityArray(raw.modalityStatus),
    proofAnchors: asProofAnchorArray(raw.proofAnchors),
    repoShape: asRepoShapeArray(raw.repoShape),
    verificationPath: asStringArray(raw.verificationPath)
      .map(cleanPath)
      .filter((value) => value && !value.startsWith('mailto:')),
    parserWarnings: asStringArray(raw.parserWarnings).map(cleanText),
    confidenceScore: typeof raw.confidenceScore === 'number' ? raw.confidenceScore : 0,
    commitSha: cleanText(asString(raw.commitSha)),
    syncedAt: cleanText(asString(raw.syncedAt)),
  };
}

function normalizeAuthorityStatus(
  status: unknown,
): LanePacket['authorityState']['status'] {
  const normalized = asString(status, 'UNKNOWN').toUpperCase();

  if (normalized === 'SUPPORTED') return 'SUPPORTED';
  if (normalized === 'BLOCKED') return 'BLOCKED';
  if (normalized === 'INCONCLUSIVE') return 'INCONCLUSIVE';
  if (normalized === 'STAGED') return 'STAGED';

  return 'UNKNOWN';
}

function deriveIdentifierFromRepoUrl(repoUrl: string): string {
  const match = repoUrl.match(/github\.com\/[^/]+\/([^/]+)/i);
  return match?.[1] ? match[1].toUpperCase() : '';
}

function normalizeGithubUrl(value: string) {
  if (!value) {
    return '';
  }

  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/blob\/main\/(?:\.\.\/|\.\/)+/g, '/blob/main/');
    return url.toString();
  } catch {
    return value;
  }
}

function readCachePackets(): LanePacket[] {
  if (!fs.existsSync(CACHE_DIR)) {
    return [];
  }

  const packets: LanePacket[] = [];

  for (const file of fs.readdirSync(CACHE_DIR).filter((entry) => entry.endsWith('.json'))) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8')) as RawLanePacket;
      packets.push(normalizeLanePacket(raw, raw.repoUrl || ''));
    } catch (error) {
      console.warn(`[lane-data] Skipping malformed cache packet ${file}:`, error);
    }
  }

  return packets;
}

async function readSanityPackets(): Promise<{
  lanes: LanePacket[];
  featuredLaneIdentifier: string | null;
  lastSyncTimestamp: string | null;
} | null> {
  if (!client) {
    return null;
  }

  try {
    const [siteSettings, packets] = await Promise.all([
      client.fetch<SiteSettings | null>(SANITY_SITE_SETTINGS_QUERY),
      client.fetch<RawLanePacket[]>(SANITY_LANE_SNAPSHOTS_QUERY),
    ]);

    const lanes = (packets || []).map((packet) => normalizeLanePacket(packet, packet.repoUrl || ''));

    if (lanes.length === 0) {
      return null;
    }

    return {
      lanes,
      featuredLaneIdentifier: siteSettings?.featuredLaneIdentifier || null,
      lastSyncTimestamp: siteSettings?.lastSyncTimestamp || maxSyncedAt(lanes),
    };
  } catch (error) {
    console.warn('[lane-data] Sanity fetch failed, falling back to cache:', error);
    return null;
  }
}

function maxSyncedAt(lanes: LanePacket[]): string | null {
  const timestamps = lanes.map((lane) => lane.syncedAt).filter(Boolean);
  return timestamps.sort().slice(-1)[0] || null;
}

function sortForDisplay(lanes: LanePacket[], featuredLaneIdentifier: string | null): LanePacket[] {
  const featuredSlug = featuredLaneIdentifier ? laneSlug(featuredLaneIdentifier) : '';

  return [...lanes].sort((left, right) => {
    const leftSlug = laneSlug(left.laneIdentifier);
    const rightSlug = laneSlug(right.laneIdentifier);

    if (leftSlug === featuredSlug) return -1;
    if (rightSlug === featuredSlug) return 1;

    if (left.confidenceScore !== right.confidenceScore) {
      return right.confidenceScore - left.confidenceScore;
    }

    return left.laneIdentifier.localeCompare(right.laneIdentifier);
  });
}

function selectFeaturedLane(
  lanes: LanePacket[],
  featuredLaneIdentifier: string | null,
): LanePacket | null {
  if (!lanes.length) {
    return null;
  }

  if (featuredLaneIdentifier) {
    const featuredSlug = laneSlug(featuredLaneIdentifier);
    const match = lanes.find((lane) => laneSlug(lane.laneIdentifier) === featuredSlug);
    if (match) {
      return match;
    }
  }

  const imc = lanes.find((lane) => lane.laneIdentifier === 'ZPE-IMC');
  if (imc) {
    return imc;
  }

  return lanes[0];
}

export async function loadLaneCatalog(): Promise<LaneCatalog> {
  const sanity = await readSanityPackets();
  const lanes = sanity?.lanes && sanity.lanes.length > 0 ? sanity.lanes : readCachePackets();
  const source: LaneDataSource = sanity?.lanes && sanity.lanes.length > 0 ? 'sanity' : lanes.length > 0 ? 'cache' : 'none';
  const featuredLane = selectFeaturedLane(lanes, sanity?.featuredLaneIdentifier || null);

  return {
    lanes: sortForDisplay(lanes, sanity?.featuredLaneIdentifier || null),
    featuredLane,
    source,
    lastSyncedAt: sanity?.lastSyncTimestamp || maxSyncedAt(lanes),
  };
}

export async function loadLaneBySlug(slug: string): Promise<LanePacket | null> {
  const catalog = await loadLaneCatalog();
  const normalizedSlug = slug.toLowerCase();

  return (
    catalog.lanes.find((lane) => laneSlug(lane.laneIdentifier) === normalizedSlug) ||
    catalog.lanes.find((lane) => lane.laneIdentifier.toLowerCase() === laneIdentifierFromSlug(slug).toLowerCase()) ||
    null
  );
}
