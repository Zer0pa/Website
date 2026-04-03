import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface RepoInfo {
  name: string;
  url: string;
  default_branch: string;
  pushed_at: string | null;
}

export async function discoverZpeRepos(org: string = 'Zer0pa'): Promise<RepoInfo[]> {
  try {
    const { data: repos } = await octokit.repos.listForOrg({
      org,
      type: 'public',
      per_page: 100,
    });

    return repos
      .filter(repo => repo.name.startsWith('ZPE-'))
      .map(repo => ({
        name: repo.name,
        url: repo.html_url,
        default_branch: repo.default_branch || 'main',
        pushed_at: repo.pushed_at || null,
      }));
  } catch (error) {
    console.error('[DISCOVERY] Error fetching repos:', summarizeError(error));
    const cached = discoverFromCache();
    if (cached.length > 0) {
      console.warn(`[DISCOVERY] Falling back to ${cached.length} cached repo packets.`);
      return cached;
    }
    throw error;
  }
}

function discoverFromCache(): RepoInfo[] {
  const cacheDir = path.join(process.cwd(), '.cache/packets');
  if (!fs.existsSync(cacheDir)) {
    return [];
  }

  return fs
    .readdirSync(cacheDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace(/\.json$/, ''))
    .filter(name => name.startsWith('ZPE-'))
    .map(name => ({
      name,
      url: `https://github.com/Zer0pa/${name}`,
      default_branch: 'main',
      pushed_at: null,
    }));
}

function summarizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
