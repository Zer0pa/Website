import { execFileSync } from 'node:child_process';
import { Octokit } from '@octokit/rest';

const DEFAULT_KEYCHAIN_SERVICE = 'zer0pa.website.github-token';

type GitHubAuthSource = 'env' | 'keychain' | 'anonymous';

export interface GitHubAuthContext {
  token: string | null
  source: GitHubAuthSource
  keychainService: string
  keychainAccount: string | null
}

let cachedAuthContext: GitHubAuthContext | null = null;

export function getGitHubAuthContext(): GitHubAuthContext {
  if (cachedAuthContext) return cachedAuthContext;

  const keychainService = normalizeValue(process.env.GITHUB_TOKEN_KEYCHAIN_SERVICE) || DEFAULT_KEYCHAIN_SERVICE;
  const keychainAccount = normalizeValue(process.env.GITHUB_TOKEN_KEYCHAIN_ACCOUNT) || normalizeValue(process.env.USER);
  const envToken = normalizeValue(process.env.GITHUB_TOKEN);

  if (envToken) {
    cachedAuthContext = {
      token: envToken,
      source: 'env',
      keychainService,
      keychainAccount,
    };
    return cachedAuthContext;
  }

  const keychainToken = readKeychainToken(keychainService, keychainAccount);
  if (keychainToken) {
    cachedAuthContext = {
      token: keychainToken,
      source: 'keychain',
      keychainService,
      keychainAccount,
    };
    return cachedAuthContext;
  }

  cachedAuthContext = {
    token: null,
    source: 'anonymous',
    keychainService,
    keychainAccount,
  };
  return cachedAuthContext;
}

export function createGitHubOctokit() {
  const { token } = getGitHubAuthContext();
  return new Octokit(token ? { auth: token } : {});
}

export function describeGitHubTokenProvisioning() {
  const { keychainService, keychainAccount } = getGitHubAuthContext();
  const keychainTarget = keychainAccount
    ? `macOS Keychain item service "${keychainService}" account "${keychainAccount}"`
    : `macOS Keychain item service "${keychainService}"`;

  return `Set GITHUB_TOKEN or provision ${keychainTarget}.`;
}

function normalizeValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function readKeychainToken(service: string, account: string | null) {
  if (process.platform !== 'darwin') {
    return null;
  }

  const attempts = account
    ? [
        ['find-generic-password', '-s', service, '-a', account, '-w'],
        ['find-generic-password', '-s', service, '-w'],
      ]
    : [['find-generic-password', '-s', service, '-w']];

  for (const args of attempts) {
    try {
      const token = execFileSync('security', args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      if (token) {
        return token;
      }
    } catch {
      continue;
    }
  }

  return null;
}
