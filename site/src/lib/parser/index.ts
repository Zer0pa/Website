import { getAST, extractIdentity } from './identity';
import { extractAuthority } from './authority';
import { extractMetrics } from './metrics';
import { extractBoundaries } from './nonClaims';
import { extractModalityStatus } from './modality';
import { extractProofAnchors } from './proofAnchors';
import { extractRepoShape } from './repoShape';
import { extractProvedNow } from './provedNow';
import { LanePacket } from '../types/lane';
import { uniqObjects, uniqStrings } from './shared';

type ParsedFile = {
  path: string;
  markdown: string;
  ast: any;
};

const FILE_PRIORITY = [
  'proofs/manifests/CURRENT_AUTHORITY_PACKET.md',
  'proofs/FINAL_STATUS.md',
  'FINAL_STATUS.md',
  'proofs/RELEASE_READINESS_REPORT.md',
  'README.md',
  'PUBLIC_AUDIT_LIMITS.md',
  'AUDITOR_PLAYBOOK.md',
  'proofs/ENGINEERING_BLOCKERS.md',
  'RELEASING.md',
  'docs/ARCHITECTURE.md',
  'docs/FAQ.md',
  'docs/BENCHMARKS.md',
  'CHANGELOG.md',
];

export async function parseRepoTruth(
  repoName: string,
  repoUrl: string,
  files: Record<string, string>,
  commitSha: string,
): Promise<LanePacket> {
  const parsedFiles = buildParsedFiles(files);
  const readme = parsedFiles.find(file => file.path === 'README.md') || parsedFiles[0];
  const identity = extractIdentity(readme?.ast, repoName, readme?.markdown || '');
  const finalStatusSource = parsedFiles.find(file => /proofs\/FINAL_STATUS\.md|^FINAL_STATUS\.md$/i.test(file.path));

  const authorityCandidates = parsedFiles.map(file => ({
    path: file.path,
    authority: extractAuthority(file.ast, finalStatusSource?.ast, finalStatusSource?.markdown || file.markdown, file.path),
  }));
  const authorityResult = pickBestAuthority(authorityCandidates);
  const { score: _authorityScore, ...authority } = authorityResult;

  const metrics = uniqObjects(
    parsedFiles.flatMap(file => extractMetrics(file.ast, file.path, file.markdown)),
    metric => `${metric.label}::${metric.valueRaw}`,
  );
  const boundaries = mergeBoundaries(parsedFiles);
  const modality = uniqObjects(
    parsedFiles.flatMap(file => extractModalityStatus(file.ast, file.markdown)),
    item => `${item.modalityName}::${item.rawStatus}`,
  );
  const proofAnchors = uniqObjects(
    parsedFiles.flatMap(file => extractProofAnchors(file.ast, repoUrl, file.markdown)),
    anchor => anchor.path,
  );
  const repoShape = uniqObjects(
    parsedFiles.flatMap(file => extractRepoShape(file.ast, file.markdown)),
    item => item.path,
  );
  const provedNow = uniqStrings(
    parsedFiles.flatMap(file => extractProvedNow(file.markdown, boundaries.explicitNonClaims)),
  );

  const warnings: string[] = [];
  if (authority.status === 'UNKNOWN') warnings.push('Authority state not found');
  if (metrics.length === 0) warnings.push('No metrics found');
  if (proofAnchors.length === 0) warnings.push('No proof anchors found');
  if (repoShape.length === 0) warnings.push('No repo shape hints found');

  const confidenceScore = buildConfidenceScore({
    identity,
    authority,
    metrics,
    boundaries,
    proofAnchors,
    repoShape,
    modality,
    provedNow,
  });

  return {
    ...identity,
    repoUrl,
    authorityState: {
      ...authority,
      sourceFile: authority.sourceFile || readme?.path || 'README.md',
    },
    headlineMetrics: metrics,
    provedNow,
    explicitNonClaims: boundaries.explicitNonClaims,
    openRisks: boundaries.openRisks,
    modalityStatus: modality,
    proofAnchors,
    repoShape,
    verificationPath: deriveVerificationPath(proofAnchors, repoShape),
    parserWarnings: warnings,
    confidenceScore,
    commitSha,
    syncedAt: new Date().toISOString(),
  };
}

function buildParsedFiles(files: Record<string, string>): ParsedFile[] {
  const entries = Object.entries(files)
    .filter(([, markdown]) => Boolean(markdown))
    .sort((a, b) => priorityOf(a[0]) - priorityOf(b[0]));

  return entries.map(([path, markdown]) => ({
    path,
    markdown,
    ast: getAST(markdown),
  }));
}

function priorityOf(path: string) {
  const index = FILE_PRIORITY.indexOf(path);
  return index === -1 ? FILE_PRIORITY.length + 50 : index;
}

function pickBestAuthority(candidates: Array<{ path: string; authority: ReturnType<typeof extractAuthority> & { sourceFile?: string } }>) {
  const ranked = candidates.map(candidate => {
    const priority = authoritySourceWeight(candidate.path);
    const statusScore = authorityRank(candidate.authority.status);
    const timestampScore = candidate.authority.timestamp ? 5 : 0;
    const summaryScore = candidate.authority.summary ? 2 : 0;
    return {
      ...candidate.authority,
      sourceFile: candidate.path,
      score: statusScore + priority + timestampScore + summaryScore,
    };
  });

  return ranked.sort((a, b) => b.score - a.score)[0] || {
    status: 'UNKNOWN',
    timestamp: '',
    summary: '',
    sourceFile: 'README.md',
    score: 0,
  };
}

function authoritySourceWeight(path: string) {
  if (/proofs\/manifests\/CURRENT_AUTHORITY_PACKET\.md$/i.test(path)) return 30;
  if (/proofs\/FINAL_STATUS\.md$|^FINAL_STATUS\.md$/i.test(path)) return 26;
  if (/proofs\/RELEASE_READINESS_REPORT\.md$/i.test(path)) return 22;
  if (/^README\.md$/i.test(path)) return 18;
  if (/PUBLIC_AUDIT_LIMITS\.md$/i.test(path)) return 8;
  return Math.max(0, FILE_PRIORITY.length - priorityOf(path));
}

function authorityRank(status: string) {
  switch (status) {
    case 'BLOCKED':
      return 40;
    case 'SUPPORTED':
      return 30;
    case 'STAGED':
      return 20;
    case 'INCONCLUSIVE':
      return 10;
    default:
      return 0;
  }
}

function mergeBoundaries(parsedFiles: ParsedFile[]) {
  const boundaryPackets = parsedFiles.map(file => extractBoundaries(file.ast, file.markdown));
  const explicitNonClaims = uniqStrings(boundaryPackets.flatMap(packet => packet.explicitNonClaims));
  const openRisks = uniqStrings(boundaryPackets.flatMap(packet => packet.openRisks));

  return { explicitNonClaims, openRisks };
}

function deriveVerificationPath(
  proofAnchors: Array<{ path: string }>,
  repoShape: Array<{ path: string }>,
) {
  const paths = [...proofAnchors.map(anchor => anchor.path), ...repoShape.map(item => item.path)];
  return uniqStrings(paths);
}

function buildConfidenceScore(input: {
  identity: { laneTitle: string; tagline: string; whatThisIs: string[] };
  authority: { status: string; timestamp: string; summary: string };
  metrics: unknown[];
  boundaries: { explicitNonClaims: string[]; openRisks: string[] };
  proofAnchors: unknown[];
  repoShape: unknown[];
  modality: unknown[];
  provedNow: string[];
}) {
  let score = 0;

  if (input.identity.laneTitle) score += 20;
  if (input.identity.tagline) score += 5;
  if (input.identity.whatThisIs.length > 0) score += 5;
  if (input.authority.status !== 'UNKNOWN') score += 20;
  if (input.authority.timestamp) score += 5;
  if (input.metrics.length > 0) score += 10;
  if (input.boundaries.explicitNonClaims.length > 0) score += 10;
  if (input.boundaries.openRisks.length > 0) score += 5;
  if (input.proofAnchors.length > 0) score += 10;
  if (input.repoShape.length > 0) score += 5;
  if (input.modality.length > 0) score += 5;
  if (input.provedNow.length > 0) score += 5;

  return Math.min(100, score);
}
