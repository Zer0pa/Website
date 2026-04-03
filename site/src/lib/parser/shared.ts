import { visit } from 'unist-util-visit';

export type ParsedSource = {
  path: string;
  markdown: string;
  ast: any;
};

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function stripHtml(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|tr|td|th|h[1-6]|table|thead|tbody)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  );
}

export function cleanExtractedText(value: string) {
  return normalizeWhitespace(
    stripHtml(value)
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1'),
  );
}

export function getNodeText(node: any): string {
  let text = '';
  visit(node, (child: any) => {
    if (child.type === 'text' || child.type === 'inlineCode' || child.type === 'code') {
      text += ` ${child.value || ''}`;
    }

    if (child.type === 'html' && typeof child.value === 'string') {
      text += ` ${stripHtml(child.value)}`;
    }
  });
  return cleanExtractedText(text);
}

export function uniqStrings(values: string[]) {
  return Array.from(new Set(values.map(value => normalizeWhitespace(value)).filter(Boolean)));
}

export function uniqObjects<T>(values: T[], keyFn: (value: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const value of values) {
    const key = keyFn(value);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(value);
  }

  return result;
}

export function looksLikePath(value: string) {
  return /(^|\/)(README|CHANGELOG|LICENSE|CONTRIBUTING|SECURITY|RELEASING|PUBLIC_AUDIT_LIMITS|FINAL_STATUS|RELEASE_READINESS_REPORT|ENGINEERING_BLOCKERS|CURRENT_AUTHORITY_PACKET|ARCHITECTURE|FAQ|BENCHMARKS|AUDITOR_PLAYBOOK)\.md$/i.test(
    value,
  ) || /[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.[a-z0-9]+$/i.test(value);
}

export function extractInlinePaths(markdown: string) {
  const paths = new Set<string>();
  const codeMatches = markdown.match(/`([^`]+\.[a-z0-9]+)`/gi) || [];
  for (const match of codeMatches) {
    const value = match.slice(1, -1).trim();
    if (looksLikePath(value)) {
      paths.add(value);
    }
  }

  const linkMatches = markdown.match(/\[[^\]]+\]\(([^)]+)\)/g) || [];
  for (const match of linkMatches) {
    const urlMatch = match.match(/\(([^)]+)\)/);
    const value = urlMatch?.[1]?.trim();
    if (value && !/^https?:\/\//i.test(value) && looksLikePath(value)) {
      paths.add(value);
    }
  }

  return Array.from(paths);
}

export function extractSectionTexts(markdown: string, headings: RegExp[]) {
  const lines = markdown.split(/\r?\n/);
  const sections: { heading: string; depth: number; body: string[] }[] = [];
  let current: { heading: string; depth: number; body: string[] } | null = null;

  for (const line of lines) {
    const heading = parseHeadingLine(line);
    if (heading) {
      const headingText = heading.text;
      if (headings.some(pattern => pattern.test(headingText))) {
        current = { heading: headingText, depth: heading.depth, body: [] };
        sections.push(current);
        continue;
      }

      if (current && heading.depth <= current.depth) {
        current = null;
      }
    }

    if (current) {
      current.body.push(line);
    }
  }

  return sections.map(section => ({
    heading: section.heading,
    depth: section.depth,
    body: section.body.join('\n'),
  }));
}

export function extractMeaningfulLines(
  markdown: string,
  options: { includeCodeBlockContent?: boolean } = {},
) {
  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];
  let inCodeFence = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (/^```/.test(trimmed)) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence && !options.includeCodeBlockContent) {
      continue;
    }

    const cleaned = cleanExtractedText(
      trimmed
        .replace(/^#{1,6}\s+/, '')
        .replace(/^[-*+]\s+/, '')
        .replace(/^\d+\.\s+/, '')
        .replace(/^\[[ xX]?\]\s+/, ''),
    );

    if (!isMeaningfulLine(cleaned)) {
      continue;
    }

    result.push(cleaned);
  }

  return result;
}

export function extractMeaningfulBlocks(
  markdown: string,
  options: { includeCodeBlockContent?: boolean } = {},
) {
  const blocks: string[] = [];
  const lines = markdown.split(/\r?\n/);
  let current: string[] = [];
  let inCodeFence = false;

  const flush = () => {
    if (current.length === 0) {
      return;
    }

    const cleaned = cleanExtractedText(
      current
        .join(' ')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/^\[[ xX]?\]\s+/gm, ''),
    );

    current = [];

    if (!cleaned || !isMeaningfulLine(cleaned)) {
      return;
    }

    blocks.push(cleaned);
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (/^```/.test(trimmed)) {
      inCodeFence = !inCodeFence;
      flush();
      continue;
    }

    if (inCodeFence && !options.includeCodeBlockContent) {
      continue;
    }

    if (!trimmed) {
      flush();
      continue;
    }

    if (parseHeadingLine(trimmed)) {
      flush();
      continue;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      flush();
      continue;
    }

    current.push(trimmed);
  }

  flush();

  return blocks;
}

export function extractMarkdownTableRows(markdown: string) {
  const rows: string[][] = [];

  for (const rawLine of markdown.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed.includes('|')) {
      continue;
    }

    const cells = trimmed
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cleanExtractedText(cell));

    if (cells.length < 2) {
      continue;
    }

    if (cells.every(cell => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, '')))) {
      continue;
    }

    rows.push(cells);
  }

  return rows;
}

export function extractHtmlTableRows(markdown: string) {
  const rows: string[][] = [];

  for (const match of Array.from(markdown.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi))) {
    const rowHtml = match[1];
    const cells = Array.from(rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi))
      .map(cell => cleanExtractedText(cell[1]))
      .filter(Boolean);

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

export function parseHeadingLine(line: string): { depth: number; text: string } | null {
  const markdownHeading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
  if (markdownHeading) {
    return {
      depth: markdownHeading[1].length,
      text: normalizeHeadingText(markdownHeading[2]),
    };
  }

  const htmlHeading = line.match(/^<h([1-6])[^>]*>(.*?)<\/h\1>$/i);
  if (htmlHeading) {
    return {
      depth: Number(htmlHeading[1]),
      text: normalizeHeadingText(htmlHeading[2]),
    };
  }

  return null;
}

export function normalizeHeadingText(value: string) {
  return cleanExtractedText(value);
}

function isMeaningfulLine(value: string) {
  if (!value) return false;
  if (/^[#*_=-]{3,}$/.test(value)) return false;
  if (/^\|.*\|$/.test(value)) return false;
  if (/^(?:Docs|Proofs|API|Benchmarks|Release|Audit)(?: \| .+)+$/i.test(value)) return false;
  if (/^(?:Question|Answer|Evidence|Why it matters|Field|Current truth|Current state|Locked value|Purpose|Target|Area|Route)$/i.test(value)) return false;
  if (/^(?:img|a id=|\/a|\/p|\/td|\/tr)$/i.test(value)) return false;
  return true;
}
