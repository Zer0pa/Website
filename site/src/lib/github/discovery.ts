import * as fs from 'fs';
import { resolvePacketCacheDir } from '../data/packet-cache';
import { createGitHubOctokit, describeGitHubTokenProvisioning } from './auth';

const octokit = createGitHubOctokit();

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
    const detail = summarizeError(error);
    const rateLimitNote =
      /\brate limit\b/i.test(detail) ? ` ${describeGitHubTokenProvisioning()}` : '';

    console.error('[DISCOVERY] Error fetching repos:', `${detail}${rateLimitNote}`);
    const cached = discoverFromCache();
    if (cached.length > 0) {
      console.warn(`[DISCOVERY] Falling back to ${cached.length} cached repo packets.`);
      return cached;
    }
    throw error;
  }
}

function discoverFromCache(): RepoInfo[] {
  const cacheDir = resolvePacketCacheDir();
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
