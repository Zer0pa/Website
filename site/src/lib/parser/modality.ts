import {
  extractHtmlTableRows,
  extractMarkdownTableRows,
  extractMeaningfulLines,
  extractSectionTexts,
  normalizeWhitespace,
  uniqObjects,
} from './shared';

export function extractModalityStatus(_ast: any, markdown = '') {
  const modalityStatus: Array<{
    modalityName: string;
    rawStatus: string;
    verdict: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'DEGRADED';
    notes?: string;
  }> = [];

  const pushStatus = (modalityName: string, rawStatus: string, notes?: string) => {
    const cleanName = normalizeWhitespace(modalityName);
    const cleanStatus = normalizeWhitespace(rawStatus);
    if (!cleanName || !cleanStatus) return;
    if (!looksLikeStatusRow(cleanName, cleanStatus, notes)) return;

    modalityStatus.push({
      modalityName: cleanName,
      rawStatus: cleanStatus,
      verdict: mapVerdict(cleanStatus),
      notes: notes ? normalizeWhitespace(notes) : undefined,
    });
  };

  for (const rows of extractStatusTables(markdown)) {
    if (rows.length < 2) continue;

    const indexes = resolveStatusColumns(rows[0]);
    if (!indexes) continue;

    for (const row of rows.slice(1)) {
      pushStatus(
        row[indexes.nameIndex] || '',
        row[indexes.statusIndex] || '',
        indexes.notesIndex >= 0 ? row[indexes.notesIndex] : undefined,
      );
    }
  }

  for (const section of extractSectionTexts(markdown, [
    /Modality Status Snapshot/i,
    /Lane Status Snapshot/i,
    /Gate Status/i,
    /Proof Assertions/i,
    /Verification/i,
    /Current Verdict/i,
  ])) {
    for (const line of extractMeaningfulLines(section.body)) {
      const statusMatch = line.match(/^([^:]{2,80})\s*:\s*(.+)$/);
      if (!statusMatch) continue;

      pushStatus(statusMatch[1], statusMatch[2], section.heading);
    }
  }

  return uniqObjects(modalityStatus, item => `${item.modalityName}::${item.rawStatus}`).slice(0, 12);
}

function extractStatusTables(markdown: string) {
  const grouped = [...groupRows(extractMarkdownTableRows(markdown)), ...groupRows(extractHtmlTableRows(markdown))];
  return grouped.filter(rows => isStatusTable(rows[0] || []));
}

function groupRows(rows: string[][]) {
  const groups: string[][][] = [];
  let current: string[][] = [];

  for (const row of rows) {
    if (current.length === 0 || row.length === current[0].length) {
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

function resolveStatusColumns(headers: string[]) {
  const lowered = headers.map(header => header.toLowerCase());
  const nameIndex = lowered.findIndex(header => /surface|lane|modality|field|risk lens|route/.test(header));
  const statusIndex = lowered.findIndex(header => /status|verdict|current state|current truth|locked value|target/.test(header));
  const notesIndex = lowered.findIndex(header => /notes|why it matters|evidence|description/.test(header));

  if (nameIndex === -1 || statusIndex === -1) {
    return null;
  }

  return { nameIndex, statusIndex, notesIndex };
}

function isStatusTable(headers: string[]) {
  const joined = headers.join(' ').toLowerCase();
  if (headers.length < 2) return false;
  if (/question answer|area purpose/.test(joined)) return false;
  return /surface|lane|modality|field|risk lens|route/.test(joined) && /status|verdict|current state|current truth|locked value|target/.test(joined);
}

function looksLikeStatusRow(name: string, status: string, notes?: string) {
  const combined = `${name} ${status} ${notes || ''}`;
  if (name.length > 80 || status.length > 160) return false;
  if (/^(Evidence|Notes|Target|Why it matters|Description)$/i.test(name)) return false;
  if (/^(Repo classification|Acquisition surface|Current release bundle inventory|Canonical evidence entry|Active summary artifact|PT-6|READY|Private repo staging|Active dataset surface|Explicitly blocked dataset)$/i.test(name)) {
    return false;
  }
  if (/^(https?:\/\/|docs\/|proofs\/)/i.test(status)) return false;
  return /(PASS|FAIL|BLOCKED|OPEN|PAUSED|PRIVATE|STAGED|DEFERRED|READY|ACTIVE|SUPPORTED|VERIFIED|NONE|\d+\/\d+|\d+\s+PASS)/i.test(
    combined,
  );
}

function mapVerdict(rawStatus: string): 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'DEGRADED' {
  if (/0 FAIL/i.test(rawStatus) && /(PASS|DEFERRED)/i.test(rawStatus)) {
    return /DEFERRED/i.test(rawStatus) ? 'DEGRADED' : 'PASS';
  }
  if (/(FAIL|RED|BLOCKED|NO-GO|ERROR|FALSE|BROKEN|NOT_READY_FOR_PUBLIC_RELEASE)/i.test(rawStatus)) return 'FAIL';
  if (/(DEGRADED|WARNING|YELLOW|DEFERRED)/i.test(rawStatus)) return 'DEGRADED';
  if (/(PASS|GREEN|ACTIVE|SUPPORTED|VERIFIED|TRUE|OK|READY)/i.test(rawStatus)) return 'PASS';
  return 'INCONCLUSIVE';
}
