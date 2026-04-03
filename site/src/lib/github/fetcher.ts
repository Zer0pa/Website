import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function fetchRawFile(
  owner: string,
  repo: string,
  path: string,
  branch = 'main',
): Promise<{ content: string; sha: string } | null> {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return fetchFromRaw(owner, repo, path, branch);
    }

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    if (Array.isArray(data) || typeof data !== 'object' || data === null || !('content' in data)) return null;

    const fileData = data as { content?: string; sha?: string };
    if (typeof fileData.content !== 'string') {
      return null;
    }

    const content = decodeContent(fileData.content);
    if (!content) return null;

    return {
      content,
      sha: typeof fileData.sha === 'string' ? fileData.sha : '',
    };
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    if (error.status === 403 && /rate limit/i.test(error.message || '')) {
      console.error(
        `[FETCHER] GitHub rate limit reached while fetching ${repo}/${path}. Set GITHUB_TOKEN to continue.`,
      );
      throw error;
    }
    console.error(`[FETCHER] Error fetching ${path} from ${repo}:`, error.message);
    return null;
  }
}

function decodeContent(content: string) {
  if (!content) return '';
  try {
    return Buffer.from(content, 'base64').toString('utf8');
  } catch {
    return content;
  }
}

async function fetchFromRaw(owner: string, repo: string, path: string, branch: string) {
  const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`, {
    headers: {
      'User-Agent': 'zer0pa-site-ingest',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Raw fetch failed with status ${response.status}`);
  }

  return {
    content: await response.text(),
    sha: '',
  };
}
