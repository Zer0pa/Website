import { extractMeaningfulLines, extractSectionTexts, normalizeWhitespace, uniqStrings } from './shared';

export function extractProvedNow(markdown: string, explicitNonClaims: string[] = []) {
  const statements: string[] = [];
  const negativeSet = new Set(explicitNonClaims.map(item => normalizeWhitespace(item).toLowerCase()));
  const sections = extractSectionTexts(markdown, [
    /What this is/i,
    /Current Authority/i,
    /Proof Assertions/i,
    /What is proved now/i,
    /Current truth/i,
    /Current Metrics/i,
    /Summary/i,
    /Current Verdict/i,
    /Authority/i,
    /Release state/i,
  ]);

  for (const section of sections) {
    for (const line of extractMeaningfulLines(section.body)) {
      const text = normalizeWhitespace(line.replace(/^\[!\]\s*/i, '').replace(/^[-*+]\s*/, ''));
      if (!text) continue;
      if (text.includes('|')) continue;
      if (text.length < 20 && !/\d/.test(text)) continue;
      if (!/\d/.test(text) && text.split(/\s+/).length <= 4 && !/:/.test(text)) continue;
      if (negativeSet.has(text.toLowerCase())) continue;
      if (isAffirmative(text)) {
        statements.push(text);
      }
    }
  }

  return uniqStrings(statements);
}

function isAffirmative(text: string) {
  return (
    /^(?:PASS|GREEN|SUPPORTED|VERIFIED|ACTIVE|STABLE|CANONICAL|LOCKED|DETERMINISTIC|VALIDATED|IMPLEMENTED|READY|ACCEPTED)\b/i.test(
      text,
    ) ||
    /(?:PASS|SUPPORTED|VERIFIED|VALIDATED|LOCKED|DETERMINISTIC|READY|accepted run|mean compression|throughput|backend=|compiled_extension|fallback_used|wins|MPJPE|loss error|latency)/i.test(
      text,
    )
  ) && !/^(?:No|Not|Blocked|Fail|Deferred|Open|Pending)/i.test(text) &&
    !/(PRIVATE_ONLY|NOT_READY_FOR_PUBLIC_RELEASE|PAUSED_EXTERNAL|no public-release|not a public-release pass narrative)/i.test(text);
}
