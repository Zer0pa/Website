import { getAST, extractIdentity } from '../identity';
import { extractAuthority } from '../authority';
import { extractMetrics } from '../metrics';
import { extractBoundaries } from '../nonClaims';
import { extractProvedNow } from '../provedNow';

/**
 * Phase 1 parser falsification loop.
 * Goal: make sure the parser prefers real authority, preserves boundaries,
 * and does not collapse non-claims into proof claims.
 */
export function runFalsificationLoop() {
  console.log('\n--- STARTING PARSER FALSIFICATION LOOP ---');

  const mockReadme = `
# ZPE-Test
## Current Authority (2026-03-27)
- Status: PASS
- Summary: System stable under replay.

## Key Metrics
| Metric | Value |
|---|---|
| Throughput | 250 words/sec |
| Latency | 15.5 ms |

## What is not being claimed
- No claim of general intelligence.
- No claim of public release.

## What is proved now
- PASS: deterministic replay
- VERIFIED: benchmark alignment
  `;

  const ast = getAST(mockReadme);
  const identity = extractIdentity(ast, 'ZPE-Test', mockReadme);
  const authority = extractAuthority(ast, undefined, mockReadme, 'README.md');
  const metrics = extractMetrics(ast, 'README.md', mockReadme);
  const boundaries = extractBoundaries(ast, mockReadme);
  const provedNow = extractProvedNow(mockReadme, boundaries.explicitNonClaims);

  console.log('TC-A (Authority Parse):', authority.status === 'SUPPORTED' ? 'PASS' : 'FAIL');
  console.log('TC-B (Identity Parse):', identity.laneTitle === 'ZPE-Test' ? 'PASS' : 'FAIL');
  console.log('TC-C (Metric Parsing):', metrics.length >= 2 ? 'PASS' : 'FAIL');
  console.log(
    'TC-D (Boundary Split):',
    boundaries.explicitNonClaims.length === 2 && provedNow.length >= 2 ? 'PASS' : 'FAIL',
  );

  const hypeReadme = `
# ZPE-Hype
The most revolutionary, world-class, game-changing AI ever.
  `;
  const identityB = extractIdentity(getAST(hypeReadme), 'ZPE-Hype', hypeReadme);
  console.log(
    'TC-E (Hype Detection):',
    identityB.tagline.includes('revolutionary') ? `FAIL (Hype leaked: "${identityB.tagline}")` : 'PASS (Neutralized)',
  );

  console.log('--- PARSER FALSIFICATION LOOP COMPLETE ---\n');
}
