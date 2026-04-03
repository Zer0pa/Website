import type { LanePacket } from '@/lib/types/lane';
import { getStatusTone } from '@/lib/data/status';

const NOISY_ROW_PATTERNS = [
  /^\|.*\|$/,
  /^!\[/,
  /^what is /i,
  /^where should /i,
  /^current throughput authority$/i,
  /^accepted run-of-record$/i,
  /^current operator truth/i,
  /^snapshot date:/i,
  /^canonical github repo:/i,
  /^question answer\b/i,
  /^tests_passed=/i,
  /^throughput_(encode|decode)_words_per_sec=/i,
  /^optional install surfaces:?$/i,
  /^technical release truth:?$/i,
  /^normalized /i,
  /^note whether /i,
];

export function cleanDisplayText(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:%)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+—\s+/g, ' — ')
    .replace(/\s*=\s*/g, '=')
    .replace(/([(])\s+/g, '$1')
    .replace(/\s+([?!])/g, '$1')
    .trim();
}

export function formatMetricLabel(label: string) {
  const cleaned = cleanDisplayText(label)
    .replace(/[_-]+/g, ' ')
    .replace(/\bcanonical total words per sec\b/i, 'total throughput')
    .replace(/\boperator\b/i, 'test state')
    .replace(/\bauthority snapshot date\b/i, 'authority date')
    .replace(/\breal data benchmark\b/i, 'real-data benchmark')
    .replace(/\bgoverning blockers\b/i, 'governing blockers')
    .replace(/\bmpjpe\b/gi, 'MPJPE')
    .replace(/\bcr\b/gi, 'CR');

  return cleaned.toUpperCase();
}

function truncateCopy(value: string, maxLength = 180) {
  const cleaned = cleanDisplayText(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const slice = cleaned.slice(0, maxLength);
  const boundary = slice.lastIndexOf(' ');

  return `${slice.slice(0, boundary > 72 ? boundary : maxLength).trim()}…`;
}

function firstSentence(value: string) {
  const cleaned = cleanDisplayText(value);
  const match = cleaned.match(/^.+?[.!?](?:\s|$)/);
  return (match ? match[0] : cleaned).trim();
}

function compressBoundaryStatement(value: string, maxLength = 120) {
  const cleaned = cleanDisplayText(value);
  const sentence = firstSentence(cleaned);
  const preferred = /^(no\b|not\b|blocks?\b|open\b)/i.test(sentence) ? sentence : cleaned;
  return truncateCopy(preferred, maxLength);
}

function isSentenceBoundary(value: string) {
  return /[.!?]$/.test(value) || /:$/.test(value) || /\]$/.test(value);
}

function isContinuationFragment(value: string) {
  return (
    /^[a-z0-9]/.test(value) ||
    /^(and|or|but|with|for|to|of|the|a|an|in|on|under|after|before|from|via|not|within|through)\b/i.test(value)
  );
}

function stitchFragments(values: string[]) {
  const compacted = values.map(cleanDisplayText).filter(Boolean);
  const stitched: string[] = [];

  for (const value of compacted) {
    const previous = stitched.at(-1);

    if (!previous) {
      stitched.push(value);
      continue;
    }

    if (!isSentenceBoundary(previous) || isContinuationFragment(value)) {
      stitched[stitched.length - 1] = cleanDisplayText(`${previous} ${value}`);
      continue;
    }

    stitched.push(value);
  }

  return stitched;
}

export function compactList(values: string[], max = values.length) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of stitchFragments(values)) {
    const cleaned = cleanDisplayText(value);
    const key = cleaned.toLowerCase();

    if (!cleaned || seen.has(key) || NOISY_ROW_PATTERNS.some((pattern) => pattern.test(cleaned))) {
      continue;
    }

    const overlappingIndex = result.findIndex((existing) => {
      const normalizedExisting = existing.toLowerCase();
      return (
        (cleaned.length > 32 || existing.length > 32) &&
        (normalizedExisting.startsWith(key) || key.startsWith(normalizedExisting))
      );
    });

    if (overlappingIndex >= 0) {
      if (cleaned.length > result[overlappingIndex].length) {
        seen.delete(result[overlappingIndex].toLowerCase());
        result[overlappingIndex] = cleaned;
        seen.add(key);
      }
      continue;
    }

    seen.add(key);
    result.push(cleaned);

    if (result.length >= max) {
      break;
    }
  }

  return result;
}

function metricValueDisplay(value: string) {
  const cleaned = cleanDisplayText(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^[^,;]+(?:,|;)\s*[a-z_]+(?:\.[a-z_]+)?=/i.test(cleaned)) {
    return cleaned.split(/(?:,|;)\s*(?=[a-z_]+(?:\.[a-z_]+)?=)/i)[0];
  }

  if (cleaned.length > 72 && /anchor:/i.test(cleaned)) {
    return cleaned.replace(/\s*anchor:\s*.+$/i, '');
  }

  const [primary] = cleaned.split(/\s*[;,]\s*/);
  return primary || cleaned;
}

export function laneDisplayName(lane: LanePacket) {
  return cleanDisplayText(lane.laneTitle || lane.laneIdentifier || 'UNKNOWN_LANE');
}

export function descriptorForLane(lane: LanePacket, maxLength = 165) {
  const candidate =
    compactList(
      [
        lane.tagline,
        ...lane.whatThisIs,
        lane.authorityState.summary,
        ...lane.provedNow,
      ],
      6,
    ).find((item) => item.length >= 32 && !/^no\b/i.test(item) && !/:\s*$/.test(item)) ||
    lane.tagline ||
    lane.laneIdentifier;

  return truncateCopy(candidate, maxLength);
}

export function flagshipTitle(lane: LanePacket) {
  if (lane.laneIdentifier === 'ZPE-IMC') {
    return 'INTEGRATED_MEMORY_CLUSTER';
  }

  const title = laneDisplayName(lane);
  return title.includes(' ') ? title : lane.laneIdentifier;
}

export function selectPrimaryMetrics(lane: LanePacket, max = 4) {
  const seen = new Set<string>();

  return lane.headlineMetrics
    .filter((metric) => metric.label && metric.valueRaw)
    .filter((metric) => !/public release$/i.test(metric.label))
    .filter((metric) => {
      const key = metric.label.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, max)
    .map((metric) => ({
      ...metric,
      label: formatMetricLabel(metric.label),
      valueRaw: metricValueDisplay(metric.valueRaw),
    }));
}

export function selectNarrativeLines(lane: LanePacket, max = 4) {
  const narrative = compactList([lane.tagline, ...lane.whatThisIs], max + 2)
    .filter((item) => item.length >= 30)
    .filter((item) => !/:\s*$/.test(item))
    .map((item) => truncateCopy(item, 220));

  if (narrative.length > 0) {
    return narrative.slice(0, max);
  }

  return [truncateCopy(lane.laneIdentifier, 80)];
}

export function selectProofAssertions(lane: LanePacket, max = 4) {
  const identityKeys = new Set(
    compactList([lane.tagline, lane.laneTitle, lane.laneIdentifier], 6).map((item) => item.toLowerCase()),
  );
  const narrativeKeys = new Set(selectNarrativeLines(lane, 8).map((item) => item.toLowerCase()));
  const assertions = compactList(lane.provedNow, max * 2)
    .filter(
      (item) =>
        item.length >= 24 &&
        (/\d/.test(item) || /\b(pass|passed|fail|failed|open|blocked|deterministic|authority|benchmark|runtime|throughput)\b/i.test(item)),
    )
    .filter((item) => !narrativeKeys.has(item.toLowerCase()))
    .filter((item) => !identityKeys.has(item.toLowerCase()))
    .filter((item) => !item.toLowerCase().startsWith(lane.laneIdentifier.toLowerCase()))
    .filter((item) => !/authorized readers|git clone\b/i.test(item))
    .sort((left, right) => scoreAssertion(right) - scoreAssertion(left))
    .map((item) => truncateCopy(item, 116))
    .slice(0, max);

  if (assertions.length > 0) {
    return assertions;
  }

  return selectPrimaryMetrics(lane, max).map((metric) => `${metric.label}: ${metric.valueRaw}`.trim());
}

export function selectNonClaims(lane: LanePacket, max = 4) {
  return compactList(lane.explicitNonClaims, max * 2)
    .filter((item) => /^(no\b|not\b|blocks?\b|open\b)/i.test(item))
    .filter((item) => !/:\s*$/.test(item))
    .map((item) => compressBoundaryStatement(item, 108))
    .slice(0, max);
}

export function selectOpenRisks(lane: LanePacket, max = 3) {
  return compactList(lane.openRisks, max * 2)
    .filter((item) => !/karl popper|falsifiability principle/i.test(item))
    .map((item) => truncateCopy(item, 150))
    .slice(0, max);
}

export function selectModalityRows(lane: LanePacket, max = 6) {
  return lane.modalityStatus
    .filter((item) => item.modalityName && item.rawStatus)
    .filter((item) => !/publication|known real blockers/i.test(item.modalityName))
    .slice(0, max)
    .map((item) => ({
      ...item,
      modalityName: cleanDisplayText(item.modalityName).toUpperCase(),
      rawStatus: cleanDisplayText(item.rawStatus).toUpperCase(),
      notes: cleanDisplayText(item.notes || ''),
    }));
}

export function selectProofAnchors(lane: LanePacket, max = 5) {
  const seen = new Set<string>();

  return lane.proofAnchors
    .map((anchor) => ({
      ...anchor,
      path: normalizeDisplayPath(anchor.path),
      repoUrl: normalizeGithubBlobUrl(anchor.repoUrl),
      label: cleanDisplayText(anchor.label || anchor.path),
      description: cleanDisplayText(anchor.description || anchor.path),
    }))
    .filter((anchor) => anchor.path && !seen.has(anchor.path) && !anchor.path.startsWith('mailto:'))
    .filter((anchor) => {
      seen.add(anchor.path);
      return true;
    })
    .slice(0, max);
}

export function selectRepoShape(lane: LanePacket, max = 4) {
  return lane.repoShape
    .map((item) => ({
      path: normalizeDisplayPath(item.path),
      description: cleanDisplayText(item.description),
    }))
    .filter((item) => item.path && !item.path.startsWith('mailto:'))
    .slice(0, max);
}

export function selectVerificationPath(lane: LanePacket, max = 4) {
  return compactList(
    lane.verificationPath.map(normalizeDisplayPath).filter((item) => item && !item.startsWith('mailto:')),
    max,
  );
}

function sentenceBoundaries(value: string) {
  return cleanDisplayText(value)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function summarizePanelText(value: string, maxLength = 132) {
  const cleaned = cleanDisplayText(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const sentences = sentenceBoundaries(cleaned);
  let summary = '';

  for (const sentence of sentences) {
    const candidate = summary ? `${summary} ${sentence}` : sentence;
    if (candidate.length > maxLength) {
      break;
    }
    summary = candidate;
  }

  return summary || truncateCopy(cleaned, maxLength);
}

export function flagshipDisplayName(lane: LanePacket) {
  const editorialMap: Record<string, string> = {
    'ZPE-IMC': 'INTEGRATED_MEMORY_CLUSTER',
  };

  return editorialMap[lane.laneIdentifier] || laneDisplayName(lane).replace(/\s+/g, '_').toUpperCase();
}

export function displayAuthorityAsset(lane: LanePacket) {
  if (lane.authorityState.status === 'SUPPORTED') return 'L3_VERIFIED_ASSET';
  if (lane.authorityState.status === 'STAGED') return 'L2_STAGED_SURFACE';
  if (lane.authorityState.status === 'BLOCKED') return 'RED_STATE_BLOCK';
  if (lane.authorityState.status === 'INCONCLUSIVE') return 'L1_INCONCLUSIVE';
  return 'UNRESOLVED_SURFACE';
}

export function buildAuthorityMetaRows(lane: LanePacket) {
  return [
    `[ STATUS: ${lane.authorityState.status} ]`,
    `[ CLASS: FLAGSHIP_LANE ]`,
    `[ ORIGIN: ${normalizeDisplayPath(lane.authorityState.sourceFile || 'README.md').toUpperCase()} ]`,
  ];
}

export function selectAssertionDeck(lane: LanePacket, max = 4) {
  return selectProofAssertions(lane, max * 2)
    .map((item) => summarizePanelText(item, 92))
    .filter((item, index, items) => item.length > 18 && items.indexOf(item) === index)
    .slice(0, max);
}

export function selectNonClaimDeck(lane: LanePacket, max = 4) {
  return selectNonClaims(lane, max * 2)
    .map((item) => summarizePanelText(item, 100))
    .filter((item) => item.length > 18)
    .filter((item) => !/^no\.$/i.test(item))
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, max);
}

export function selectRepoSurfaceLines(lane: LanePacket, max = 3) {
  return compactList(
    [
      ...selectProofAnchors(lane, max * 2).map((item) => item.path),
      ...selectVerificationPath(lane, max * 2),
      ...selectRepoShape(lane, max * 2).map((item) => item.path),
    ],
    max,
  ).slice(0, max);
}

export function buildTerminalLines(lane: LanePacket, max = 6) {
  const anchors = selectProofAnchors(lane, max);
  if (anchors.length > 0) {
    return anchors.map(
      (anchor, index) =>
        `${buildTerminalTimestamp(index)} -> EVIDENCE: ${truncateCopy(anchor.path, 64)}`,
    );
  }

  return selectProofAssertions(lane, max).map(
    (item, index) => `${buildTerminalTimestamp(index)} -> ASSERTION: ${truncateCopy(item, 64)}`,
  );
}

export function buildRelatedLanes(current: LanePacket, lanes: LanePacket[], max = 3) {
  return lanes
    .filter((lane) => lane.laneIdentifier !== current.laneIdentifier)
    .slice(0, max);
}

export function selectRepoHighlights(lane: LanePacket, max = 3) {
  const highlightedPaths = [
    ...selectProofAnchors(lane, max + 2).map((anchor) => anchor.path),
    ...selectVerificationPath(lane, max + 2),
  ];

  return compactList(highlightedPaths, max).map((item) => truncateCopy(item, 72));
}

export function selectProofChips(lane: LanePacket, max = 3) {
  const seen = new Set<string>();
  const chips: string[] = [];
  const signalPool = compactList([...lane.provedNow, lane.authorityState.summary, lane.tagline], 18);

  const push = (value: string) => {
    const token = cleanDisplayText(value).toUpperCase().replace(/\s+/g, '_');
    if (!token || seen.has(token)) {
      return;
    }
    seen.add(token);
    chips.push(token);
  };

  for (const item of signalPool) {
    if (/backend=rust|compiled_extension=1/i.test(item)) push('RUST_BACKEND_PATH');
    if (/byte-identical|deterministic replay/i.test(item)) push('BYTE_IDENTICAL_REPLAY');
    if (/170 passed|169 passed|tests_passed/i.test(item)) push('OPERATOR_RUN_PASS');
    if (/throughput|imc_stream_words\/sec/i.test(item)) push('THROUGHPUT_AUTHORITY');
    if (/multimodal|modality|transport layer|transport system/i.test(item)) push('MULTIMODAL_TRANSPORT');

    if (chips.length >= max) {
      return chips.slice(0, max);
    }
  }

  for (const metric of selectPrimaryMetrics(lane, max)) {
    push(formatMetricLabel(metric.label));
    if (chips.length >= max) {
      break;
    }
  }

  if (chips.length === 0) {
    push(lane.laneIdentifier);
  }

  return chips.slice(0, max);
}

export function buildRepoSummary(lane: LanePacket) {
  const proofCount = lane.proofAnchors.filter((anchor) => anchor.path && !anchor.path.startsWith('mailto:')).length;
  const modalityCount = lane.modalityStatus.length;
  const sourceFile = normalizeDisplayPath(lane.authorityState.sourceFile || 'README.md');

  return [
    `proof anchors: ${proofCount}`,
    `modalities tracked: ${modalityCount}`,
    `authority source: ${sourceFile}`,
  ];
}

export function authoritySummary(lane: LanePacket) {
  const summary = cleanDisplayText(lane.authorityState.summary || '');
  const summaryLooksWeak =
    !summary ||
    /^snapshot date:/i.test(summary) ||
    /contains:\.?$/i.test(summary) ||
    /^this file is a historical/i.test(summary);

  return cleanDisplayText(
    (!summaryLooksWeak ? summary : '') ||
      selectProofAssertions(lane, 1)[0] ||
      descriptorForLane(lane, 160) ||
      lane.tagline ||
      'NO_AUTHORITY_SUMMARY_AVAILABLE',
  );
}

export function displayStatusClass(status: string) {
  const tone = getStatusTone(status);
  if (tone === 'pass') return 'status-pass';
  if (tone === 'fail') return 'status-fail';
  if (tone === 'inconclusive') return 'status-inconclusive';
  return 'status-neutral';
}

export function shortTimestamp(timestamp: string) {
  if (!timestamp) return 'SYNC UNKNOWN';
  return timestamp.replace('T', ' ').replace('Z', ' UTC').slice(0, 19);
}

export function normalizeDisplayPath(value: string) {
  return cleanDisplayText(value)
    .replace(/^(?:\.\.\/|\.\/)+/g, '')
    .replace(/^blob\/main\//, '');
}

export function selectMetricDeck(lane: LanePacket, max = 4) {
  const metrics: Array<{ label: string; valueRaw: string }> = selectPrimaryMetrics(lane, max).map((metric) => ({
    label: metric.label,
    valueRaw: metric.valueRaw,
  }));

  const supplemental = [
    { label: 'AUTHORITY STATE', valueRaw: lane.authorityState.status },
    { label: 'AUTHORITY DATE', valueRaw: lane.authorityState.timestamp || shortTimestamp(lane.syncedAt).slice(0, 10) },
    { label: 'MODEL CONSENSUS', valueRaw: `${lane.confidenceScore}%` },
    { label: 'SOURCE FILE', valueRaw: normalizeDisplayPath(lane.authorityState.sourceFile || 'README.md') },
  ];

  for (const item of supplemental) {
    if (metrics.length >= max) {
      break;
    }

    if (item.valueRaw) {
      metrics.push(item);
    }
  }

  return metrics.slice(0, max);
}

function scoreAssertion(value: string) {
  let score = 0;

  if (/\d/.test(value)) score += 3;
  if (/\b(pass|passed|fail|failed|open|blocked)\b/i.test(value)) score += 4;
  if (/\bthroughput|benchmark|authority|runtime|deterministic|byte-identical|coverage\b/i.test(value)) score += 2;
  if (value.length > 160) score -= 1;

  return score;
}

function buildTerminalTimestamp(index: number) {
  const minute = 12 + Math.floor(index / 3);
  const second = 1 + index * 2;
  return `${String(9).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
}

function normalizeGithubBlobUrl(value: string) {
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
