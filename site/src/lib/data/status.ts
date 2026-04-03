export function getStatusTone(status?: string): 'pass' | 'fail' | 'inconclusive' | 'neutral' {
  const normalized = (status || '').toUpperCase();

  if (/(SUPPORTED|PASS|GREEN|ACTIVE|STABLE|CANONICAL|VERIFIED)/.test(normalized)) {
    return 'pass';
  }

  if (/(FAIL|RED|BLOCKED|NO-GO|ERROR)/.test(normalized)) {
    return 'fail';
  }

  if (/(DEGRADED|INCONCLUSIVE|OPEN|PAUSED|DEFERRED|PENDING|UNKNOWN|STAGED)/.test(normalized)) {
    return 'inconclusive';
  }

  return 'neutral';
}
