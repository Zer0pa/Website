import { visit } from 'unist-util-visit';
import { extractSectionTexts, getNodeText, normalizeWhitespace, uniqStrings } from './shared';

export function extractBoundaries(ast: any, markdown = '') {
  const explicitNonClaims: string[] = [];
  const openRisks: string[] = [];

  const pushNonClaim = (value: string) => {
    const cleaned = cleanupBoundary(value);
    if (cleaned) explicitNonClaims.push(cleaned);
  };

  const pushRisk = (value: string) => {
    const cleaned = cleanupBoundary(value);
    if (cleaned) openRisks.push(cleaned);
  };

  visit(ast, (node: any) => {
    if (node.type === 'listItem') {
      const text = getNodeText(node);
      if (isNonClaim(text)) {
        pushNonClaim(text);
      }
      if (isOpenRisk(text)) {
        pushRisk(text);
      }
    }

    if (node.type === 'paragraph') {
      const text = getNodeText(node);
      if (isNonClaim(text) && !isLikelyAffirmation(text)) {
        pushNonClaim(text);
      }
      if (isOpenRisk(text)) {
        pushRisk(text);
      }
    }
  });

  const sections = extractSectionTexts(markdown, [
    /What is not being claimed/i,
    /What is NOT being claimed/i,
    /OUT OF SCOPE/i,
    /Explicit Non.?Claims/i,
    /OPEN RISKS/i,
    /Open Risks/i,
    /Release blockers/i,
    /Constraints/i,
  ]);

  for (const section of sections) {
    for (const line of section.body.split(/\r?\n/)) {
      const text = normalizeWhitespace(line);
      if (!text) continue;

      if (isNonClaim(text)) {
        pushNonClaim(text);
      }
      if (isOpenRisk(text)) {
        pushRisk(text);
      }
    }
  }

  return {
    explicitNonClaims: uniqStrings(explicitNonClaims),
    openRisks: uniqStrings(openRisks),
  };
}

function cleanupBoundary(text: string) {
  return normalizeWhitespace(text.replace(/^\[!\]\s*/i, '').replace(/^[-*+]\s*/, ''));
}

function isNonClaim(text: string) {
  return /^(No claim|No|Not|NOT|Blocks|Blocked|Will not|Does not|Doesn't|No public release|No PyPI release|No runtime closure)/i.test(
    normalizeWhitespace(text),
  ) || /what is not being claimed|out of scope|explicit non.?claims/i.test(text);
}

function isOpenRisk(text: string) {
  return /^(Open|Blocked|BLOCKED|Deferred|DEFERRED|Pending|PENDING|Missing|Unresolved|Risk|WARNING|Warning|Constraint)/i.test(
    normalizeWhitespace(text),
  ) || /open risks|release blockers|constraints/i.test(text);
}

function isLikelyAffirmation(text: string) {
  return /^(is|are|was|were|has|have|will|supports|supports|provides|validated|verified)/i.test(normalizeWhitespace(text));
}
