import {
  extractHtmlTableRows,
  extractMarkdownTableRows,
  extractMeaningfulLines,
  extractSectionTexts,
  normalizeWhitespace,
  uniqObjects,
} from './shared';

export interface Metric {
  label: string;
  valueRaw: string;
  numericValue?: number;
  unit?: string;
  sourceFile: string;
}

const METRIC_SECTION_PATTERNS = [
  /Throughput/i,
  /Current Metrics/i,
  /Current Authority/i,
  /Quickstart And Authority/i,
  /Verification/i,
  /Current Verdict/i,
];

export function extractMetrics(_ast: any, sourceFile: string, markdown = ''): Metric[] {
  const metrics: Metric[] = [];
  const seen = new Set<string>();

  const pushMetric = (label: string, valueRaw: string) => {
    const cleanLabel = normalizeWhitespace(label);
    const cleanValue = normalizeMetricValue(valueRaw);
    if (!cleanLabel || !cleanValue) return;
    if (!looksMetricLike(cleanLabel, cleanValue, sourceFile)) return;

    const key = `${cleanLabel}::${cleanValue}`;
    if (seen.has(key)) return;
    seen.add(key);

    const metric: Metric = {
      label: cleanLabel,
      valueRaw: cleanValue,
      sourceFile,
    };

    const numericMatch = cleanValue.match(/(-?\d+(?:\.\d+)?)\s*([a-zA-Z/%_]+|x)?/);
    if (numericMatch) {
      metric.numericValue = parseFloat(numericMatch[1]);
      metric.unit = numericMatch[2] || '';
    }

    metrics.push(metric);
  };

  for (const rows of extractMetricTables(markdown)) {
    if (rows.length < 2) {
      continue;
    }

    const indexes = resolveMetricColumns(rows[0]);
    if (!indexes) {
      continue;
    }

    for (const row of rows.slice(1)) {
      const label = row[indexes.labelIndex] || '';
      const value = row[indexes.valueIndex] || '';
      pushMetric(label, value);
    }
  }

  for (const section of extractSectionTexts(markdown, METRIC_SECTION_PATTERNS)) {
    for (const line of extractMeaningfulLines(section.body)) {
      const kvMatch = line.match(/^([^:|=]{2,80})\s*[:=]\s*(.+)$/);
      if (!kvMatch) {
        continue;
      }

      pushMetric(kvMatch[1], kvMatch[2]);
    }
  }

  return uniqObjects(metrics, metric => `${metric.label}::${metric.valueRaw}`).slice(0, 8);
}

function normalizeMetricValue(value: string) {
  const cleaned = normalizeWhitespace(value)
    .replace(/\s*Anchor:\s*.+$/i, '')
    .replace(/\s*Latest bundle:\s*.+$/i, '');

  const compositeAssignments = cleaned.split(/(?:,|;)\s*(?=[a-z_]+(?:\.[a-z_]+)?=)/i);
  if (compositeAssignments.length > 1) {
    return compositeAssignments[0];
  }

  return cleaned;
}

function extractMetricTables(markdown: string) {
  const markdownRows = groupRows(extractMarkdownTableRows(markdown));
  const htmlRows = groupRows(extractHtmlTableRows(markdown));
  return [...markdownRows, ...htmlRows].filter(rows => {
    const headers = rows[0] || [];
    return isMetricTable(headers);
  });
}

function groupRows(rows: string[][]) {
  const groups: string[][][] = [];
  let current: string[][] = [];

  for (const row of rows) {
    if (current.length === 0) {
      current.push(row);
      continue;
    }

    if (row.length === current[0].length) {
      current.push(row);
      continue;
    }

    groups.push(current);
    current = [row];
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

function resolveMetricColumns(headers: string[]) {
  const lowered = headers.map(header => header.toLowerCase());
  const labelIndex = lowered.findIndex(header => /metric|field|surface|label/.test(header));
  const valueIndex = lowered.findIndex(header => /value|current truth|current state|locked value|verdict|status/.test(header));

  if (labelIndex === -1 || valueIndex === -1) {
    return null;
  }

  return { labelIndex, valueIndex };
}

function isMetricTable(headers: string[]) {
  if (headers.length < 2) return false;

  const joined = headers.join(' ').toLowerCase();
  if (/question answer|area purpose|route target|artifact why it matters/.test(joined)) {
    return false;
  }

  return /metric|field|surface|label/.test(joined) && /value|current truth|current state|locked value|verdict|status/.test(joined);
}

function looksMetricLike(label: string, value: string, sourceFile: string) {
  const combined = `${label} ${value}`;

  if (/<[^>]+>/.test(combined)) return false;
  if (/https?:\/\//i.test(combined)) return false;
  if (label.length > 60 || value.length > 100) return false;
  if (/^(Question|Answer|Why it matters|Evidence|Notes|Route|Target|Purpose|Area|Artifact|Description)$/i.test(label)) return false;
  if (/^(DS-\d+|E\d)$/i.test(label)) return false;
  if (
    /^(FINAL|PROVISIONAL)$/i.test(label) ||
    /(publication|legal\/release boundary|legal\/release|acquisition surface|repo classification|release unit|canonical evidence entry|documentation index|support routing|security reporting|route|latest bundle)$/i.test(
      label,
    )
  ) {
    return false;
  }

  if (!/\d/.test(value)) {
    return false;
  }

  if (/^The\s/i.test(label) && value.split(' ').length > 10) {
    return false;
  }

  if (/PUBLIC_AUDIT_LIMITS\.md$/i.test(sourceFile) && !/(throughput|passed|skipped|claims|lag|density)/i.test(label)) {
    return false;
  }

  return /(throughput|compression|latency|mpjpe|loss|error|benchmark|cr\b|wins|pass|fail|deferred|version|install|smoke|test state|preflight|dt\b|truth|authority|gate|bundle)/i.test(
    combined,
  );
}
