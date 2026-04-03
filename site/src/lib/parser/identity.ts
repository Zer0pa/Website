import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import {
  extractMeaningfulBlocks,
  extractMeaningfulLines,
  extractSectionTexts,
  getNodeText,
  normalizeWhitespace,
  uniqStrings,
} from './shared';

export function getAST(markdown: string) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown);
}

export function extractIdentity(ast: any, repoName: string, markdown = '') {
  const headingTexts: string[] = [];
  const paragraphTexts: string[] = [];

  visit(ast, (node: any) => {
    if (node.type === 'heading') {
      headingTexts.push(getNodeText(node));
    }

    if (node.type === 'paragraph' || node.type === 'code' || node.type === 'listItem') {
      const text = getNodeText(node);
      if (text) {
        paragraphTexts.push(text);
      }
    }
  });

  const titleCandidates = [
    ...headingTexts.slice(0, 6),
    ...markdown
      .split(/\r?\n/)
      .slice(0, 12)
      .map(line => line.trim())
      .filter(line => /^#{1,2}\s+/.test(line)),
  ];

  const laneTitle = pickLaneTitle(titleCandidates, repoName);
  const tagline = pickTagline(markdown, paragraphTexts);
  const whatThisIs = pickWhatThisIs(markdown, repoName);

  return {
    laneIdentifier: repoName,
    laneTitle,
    tagline,
    whatThisIs,
  };
}

function pickLaneTitle(candidates: string[], repoName: string) {
  for (const candidate of candidates) {
    const stripped = candidate
      .replace(/^#+\s*/, '')
      .replace(/^ZER0PA\/?/i, '')
      .trim();

    if (isGenericHeading(stripped)) {
      continue;
    }

    const versioned = stripped.match(
      /^([A-Z0-9-]+)\s+V[\d.]+(?:[:\-–—]\s*)?(.+)$/i,
    );
    if (versioned?.[2]) {
      return normalizeWhitespace(versioned[2]);
    }

    const repoPrefixed = stripped.match(/^(?:ZPE-[A-Z0-9-]+)\s*[:\-–—]\s*(.+)$/i);
    if (repoPrefixed?.[1]) {
      return normalizeWhitespace(repoPrefixed[1]);
    }

    if (!stripped) {
      continue;
    }

    if (stripped === repoName) {
      return repoName;
    }

    if (looksLikeSectionHeading(stripped)) {
      continue;
    }

    if (looksLikeTitleLine(stripped)) {
      return stripped;
    }
  }

  return repoName;
}

function pickTagline(markdown: string, paragraphs: string[]) {
  const forbidden = /\b(revolutionary|world-class|game-changing|cutting-edge|disruptive|best-in-class|unmatched|unparalleled)\b/gi;
  const whatThisIsSections = extractSectionTexts(markdown, [
    /What This Is/i,
    /Overview/i,
    /What it is/i,
    /What This Repo Is/i,
    /Subject Identity/i,
    /Lane Overview/i,
  ]);

  for (const section of whatThisIsSections) {
    const candidates = [...extractMeaningfulBlocks(section.body), ...extractMeaningfulLines(section.body)];
    for (const candidate of candidates) {
      if (isTaglineCandidate(candidate)) {
        return normalizeWhitespace(candidate.replace(forbidden, '[TRUTH_FILTERED]'));
      }
    }
  }

  const candidates = [
    ...paragraphs,
    ...extractMeaningfulLines(markdown).slice(0, 16),
  ];

  for (const candidate of candidates) {
    const cleaned = normalizeWhitespace(candidate.replace(forbidden, '[TRUTH_FILTERED]'));
    if (!isTaglineCandidate(cleaned)) continue;
    return cleaned;
  }

  return '';
}

function pickWhatThisIs(markdown: string, repoName: string) {
  const sections = extractSectionTexts(markdown, [
    /What This Is/i,
    /Overview/i,
    /What it is/i,
    /What This Repo Is/i,
    /Subject Identity/i,
    /Lane Overview/i,
  ]);

  if (sections.length > 0) {
    const collected = sections.flatMap(section => {
      const blocks = extractMeaningfulBlocks(section.body);
      return blocks.length > 0 ? blocks : extractMeaningfulLines(section.body);
    });

    return uniqStrings(
      collected.filter(
        line =>
          line.length >= 18 &&
          line !== repoName &&
          !line.includes('|') &&
          !/^!\[[^\]]*\]\([^)]+\)$/.test(line) &&
          !/^git clone\b/i.test(line) &&
          !/^python -m pip install\b/i.test(line) &&
          !/^Question Answer\b/i.test(line) &&
          !/^(?:Optional install surfaces|Technical release truth):?$/i.test(line) &&
          !/^(?:Quickstart And License|Quick Verify|License Boundary|Optional direct test replay|License boundary)$/i.test(
            line,
          ) &&
          !/^What is /i.test(line) &&
          !/^(?:What is this|What is the current authority state|What is actually proved|Where should an outsider)/i.test(
            line,
          ),
      ),
    ).slice(0, 4);
  }

  const introLines = extractMeaningfulLines(markdown)
    .filter(line => line !== repoName)
    .filter(line => !/^git clone\b/i.test(line))
    .filter(line => !/^!\[[^\]]*\]\([^)]+\)$/.test(line))
    .filter(line => !/^python -m pip install\b/i.test(line))
    .slice(0, 4);

  return uniqStrings(introLines);
}

function isGenericHeading(value: string) {
  return /^(Quick Verify|Quickstart(?: And License)?|What This Is|Current Authority|Current Metrics|Throughput|Proof Anchors|Go Next|License Boundary|Lane Boundaries)$/i.test(
    normalizeWhitespace(value),
  );
}

function looksLikeSectionHeading(value: string) {
  return /^(Current Authority|Authority|Current truth|Release state|What This Is|Overview|Proof Anchors|Open Risks|Key Metrics|Modality Status|Lane Status|Repo Shape|Evidence Routes|Verification Path|Audit Routes|System Components)/i.test(
    value,
  );
}

function looksLikeTitleLine(value: string) {
  return (
    /^[A-Z0-9][A-Z0-9\s\-:|_()]{8,}$/.test(value) ||
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5}$/.test(value) ||
    /V[\d.]+/.test(value) ||
    /CODEC|CLUSTER|KERNEL|SURFACE|LANE|MODEL|SYSTEM|CODEC/i.test(value)
  );
}

function isTaglineCandidate(value: string) {
  if (!value) return false;
  if (value.length < 20) return false;
  if (/^(?:README|LICENSE|CHANGELOG|CURRENT AUTHORITY|WHAT THIS IS)/i.test(value)) return false;
  if (/^(?:Question Answer|Optional install surfaces|Technical release truth)/i.test(value)) return false;
  if (/^(?:Docs|Proofs|API|Benchmarks|Release|Audit)(?: \| .+)+$/i.test(value)) return false;
  if (/^(?:git clone|cd |python -m|cargo |source )/i.test(value)) return false;
  if (/:$/.test(value)) return false;
  return true;
}
