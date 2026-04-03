import { visit } from 'unist-util-visit';
import {
  extractHtmlTableRows,
  extractMeaningfulLines,
  extractSectionTexts,
  getNodeText,
  normalizeWhitespace,
} from './shared';

type AuthorityStatus = 'SUPPORTED' | 'BLOCKED' | 'INCONCLUSIVE' | 'STAGED' | 'UNKNOWN';

type AuthorityCandidate = {
  status: AuthorityStatus;
  timestamp: string;
  summary: string;
  sourceFile: string;
  score: number;
};

export function extractAuthority(ast: any, statusFileAst?: any, markdown = '', sourceFile = 'README.md') {
  const candidates: AuthorityCandidate[] = [];

  if (statusFileAst) {
    candidates.push(buildCandidate(statusFileAst, markdown, sourceFile, 100));
  }

  candidates.push(buildCandidate(ast, markdown, sourceFile, 60));

  const winner = candidates.sort((a, b) => b.score - a.score)[0] || {
    status: 'UNKNOWN' as AuthorityStatus,
    timestamp: '',
    summary: '',
    sourceFile,
    score: 0,
  };

  return {
    status: winner.status,
    timestamp: winner.timestamp,
    summary: winner.summary,
  };
}

function buildCandidate(targetAst: any, markdown: string, sourceFile: string, priority: number): AuthorityCandidate {
  let inSection = false;
  let status: AuthorityStatus = 'UNKNOWN';
  let timestamp = '';
  let summary = '';

  visit(targetAst, (node: any) => {
    if (node.type === 'heading') {
      const text = getNodeText(node);
      if (isAuthorityHeading(text)) {
        inSection = true;
        const headingDate = extractDate(text);
        if (headingDate) timestamp = headingDate;
      } else if (inSection && node.depth <= 2) {
        inSection = false;
      }
      return;
    }

    if (!inSection) {
      return;
    }

    const text = getNodeText(node);
    if (!text) {
      return;
    }

    const detectedStatus = detectStatus(text);
    status = prioritizeStatus(status, detectedStatus);

    const detectedDate = extractDate(text);
    if (detectedDate && !timestamp) {
      timestamp = detectedDate;
    }

    if (!summary && (node.type === 'paragraph' || node.type === 'code' || node.type === 'listItem')) {
      const candidate = summarize(text);
      if (!looksSummaryNoise(candidate)) {
        summary = candidate;
      }
    }
  });

  const rawSection = extractSectionTexts(markdown, [
    /^Current Authority/i,
    /^Authority/i,
    /^Current truth/i,
    /^Release state/i,
    /^Authority State/i,
    /^Current Authority State/i,
    /^Summary/i,
    /^Current Verdict/i,
  ]).find(section => isAuthorityHeading(section.heading));

  if (rawSection) {
    for (const cells of extractHtmlTableRows(rawSection.body)) {
      const joined = cells.join(' ');
      const detectedStatus = detectStatus(joined);
      status = prioritizeStatus(status, detectedStatus);

      const detectedDate = extractDate(joined);
      if (detectedDate && !timestamp) {
        timestamp = detectedDate;
      }

      if (!summary) {
        const candidate = cells
          .slice(1)
          .map(summarize)
          .find(value => value && !looksSummaryNoise(value));
        if (candidate) {
          summary = candidate;
        }
      }
    }

    for (const text of extractMeaningfulLines(rawSection.body)) {
      if (!text) continue;

      const detectedStatus = detectStatus(text);
      status = prioritizeStatus(status, detectedStatus);

      const detectedDate = extractDate(text);
      if (detectedDate && !timestamp) {
        timestamp = detectedDate;
      }

      if (!summary && !looksLikeDecorativeLine(text)) {
        const candidate = summarize(text);
        if (candidate && !looksSummaryNoise(candidate)) {
          summary = candidate;
        }
      }
    }
  }

  if (status === 'UNKNOWN' || !timestamp || !summary) {
    for (const text of extractMeaningfulLines(markdown).slice(0, 12)) {
      const detectedStatus = detectStatus(text);
      status = prioritizeStatus(status, detectedStatus);

      const detectedDate = extractDate(text);
      if (detectedDate && !timestamp) {
        timestamp = detectedDate;
      }

      if (!summary) {
        const candidate = summarize(text);
        if (candidate && !looksSummaryNoise(candidate)) {
          summary = candidate;
        }
      }
    }
  }

  if (
    status === 'BLOCKED' &&
    /private[- ]stage|private staging/i.test(summary) &&
    !/NOT_READY_FOR_PUBLIC_RELEASE|public release readiness:\s*NOT_READY/i.test(markdown)
  ) {
    status = 'STAGED';
  }

  return {
    status,
    timestamp,
    summary,
    sourceFile,
    score: scoreAuthority(status, timestamp, summary, priority),
  };
}

function isAuthorityHeading(text: string) {
  return /^Current Authority|^Authority|^Current truth|^Release state|^Authority State|^Current Authority State|^Summary|^Current Verdict/i.test(
    text,
  );
}

function detectStatus(text: string): AuthorityStatus {
  if (
    /(BLOCKED|FAIL|RED|NO-GO|ERROR|REJECTED|NOT_READY_FOR_PUBLIC_RELEASE|release readiness:\s*NOT_READY)/i.test(text) &&
    !/blocked dataset|blocked and outside the active E1 benchmark surface|explicitly blocked and outside the active E1 benchmark surface|known real blockers\s*none|DS-\d+.*blocked/i.test(
      text,
    )
  ) {
    return 'BLOCKED';
  }
  if (/(SUPPORTED|GREEN|CANONICAL|STABLE|ACCEPTED(?: run-of-record)?|OPERATIONAL|VERIFIED_ASSET|RUN-OF-RECORD)/i.test(text)) {
    return 'SUPPORTED';
  }
  if (/(PRIVATE[_ -]?STAG(?:E|ED)|PRIVATE[_ -]?ONLY|owner-deferred|deferred by policy|\bSTAGED\b|private GitHub staging repo)/i.test(text)) {
    return 'STAGED';
  }
  if (/(INCONCLUSIVE|OPEN|PAUSED|PENDING|DEFERRED)/i.test(text)) return 'INCONCLUSIVE';
  return 'UNKNOWN';
}

function prioritizeStatus(current: AuthorityStatus, next: AuthorityStatus): AuthorityStatus {
  const rank: Record<AuthorityStatus, number> = {
    BLOCKED: 4,
    SUPPORTED: 3,
    STAGED: 2,
    INCONCLUSIVE: 1,
    UNKNOWN: 0,
  };

  return rank[next] > rank[current] ? next : current;
}

function scoreAuthority(status: AuthorityStatus, timestamp: string, summary: string, priority: number) {
  let score = priority;
  if (status !== 'UNKNOWN') score += 20;
  if (timestamp) score += 10;
  if (summary) score += 5;
  return score;
}

function summarize(text: string) {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) return '';
  const sentence = cleaned.split(/[.!?\n]/)[0].trim();
  return sentence ? `${sentence}.` : cleaned;
}

function extractDate(text: string) {
  const match = text.match(/\d{4}-?\d{2}-?\d{2}/);
  if (!match) return '';
  const [value] = match;
  const normalized = value.match(/^(\d{4})-?(\d{2})-?(\d{2})$/);
  if (!normalized) return value;
  return `${normalized[1]}-${normalized[2]}-${normalized[3]}`;
}

function looksLikeDecorativeLine(text: string) {
  return (
    /^\[.*\]$/.test(text) ||
    /^[-=*_]{3,}$/.test(text) ||
    /^#/.test(text) ||
    /^<[^>]+>$/.test(text) ||
    /^(?:<table|<tr|<td|<th|<img|<\/)/i.test(text)
  );
}

function looksSummaryNoise(text: string) {
  return (
    !text ||
    text.length < 16 ||
    /^(?:Accepted run-of-record|Backend truth|Current throughput authority|Authority artifacts|Primary benchmark authority|Release verdict|Package mechanics|Cold-start audit|External acquisition surface|Current Authority|Summary|Current Verdict|Public Audit Limits)\.?$/i.test(
      text,
    ) ||
    /^Date:\s/i.test(text) ||
    /^Repo stage:\s/i.test(text) ||
    /^https?:\/\//i.test(text)
  );
}
