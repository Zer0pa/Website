import * as fs from 'fs';
import * as path from 'path';
import { discoverZpeRepos } from '../lib/github/discovery';
import { fetchRawFile } from '../lib/github/fetcher';
import { parseRepoTruth } from '../lib/parser';

const CANDIDATE_FILES = [
  'README.md',
  'PUBLIC_AUDIT_LIMITS.md',
  'proofs/FINAL_STATUS.md',
  'FINAL_STATUS.md',
  'proofs/RELEASE_READINESS_REPORT.md',
  'proofs/ENGINEERING_BLOCKERS.md',
  'proofs/manifests/CURRENT_AUTHORITY_PACKET.md',
  'AUDITOR_PLAYBOOK.md',
  'RELEASING.md',
  'CHANGELOG.md',
  'docs/ARCHITECTURE.md',
  'docs/FAQ.md',
  'docs/BENCHMARKS.md',
];

async function main() {
  const CACHE_DIR = path.join(process.cwd(), '.cache/packets');
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  console.log('[INGEST] Starting discovery...');
  const repos = await discoverZpeRepos();
  console.log(`[INGEST] Found ${repos.length} ZPE repos.`);

  for (const repo of repos) {
    console.log(`[INGEST] Processing ${repo.name}...`);
    
    // Fetch critical files
    const files: Record<string, string> = {};
    const candidates = CANDIDATE_FILES;
    
    let latestSha = '';
    for (const file of candidates) {
      const result = await fetchRawFile('Zer0pa', repo.name, file, repo.default_branch);
      if (result) {
        files[file] = result.content;
        if (!latestSha) latestSha = result.sha;
      }
    }

    if (!files['README.md']) {
      console.warn(`[INGEST] Skipping ${repo.name}: No README.md found.`);
      continue;
    }

    try {
      const packet = await parseRepoTruth(repo.name, repo.url, files, latestSha);
      const outputPath = path.join(CACHE_DIR, `${repo.name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(packet, null, 2));
      console.log(`[INGEST] Saved packet for ${repo.name} (Confidence: ${packet.confidenceScore})`);
    } catch (error) {
      console.error(`[INGEST] Error parsing ${repo.name}:`, error);
    }
  }

  console.log('[INGEST] Complete.');
}

main().catch(console.error);
