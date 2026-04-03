import { execFileSync } from 'node:child_process';

const pages = ['home', 'imc'] as const;

function resolvePages() {
  const positionalPages = process.argv.slice(2).filter((arg) => !arg.startsWith('--')) as Array<(typeof pages)[number]>;
  return positionalPages.length > 0 ? positionalPages : [...pages];
}

function resolveBaseUrl() {
  const baseUrlArg = process.argv.find((arg) => arg.startsWith('--baseUrl='));
  return baseUrlArg?.split('=')[1] || process.env.LAYOUT_BASE_URL || 'http://127.0.0.1:3006';
}

function runScript(scriptPath: string, page: (typeof pages)[number], baseUrl: string) {
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsx', scriptPath, page],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        LAYOUT_BASE_URL: baseUrl,
      },
      stdio: 'inherit',
    },
  );
}

function main() {
  const baseUrl = resolveBaseUrl();
  const requestedPages = resolvePages();

  for (const page of requestedPages) {
    runScript('src/scripts/layout-measure.ts', page, baseUrl);
    runScript('src/scripts/layout-diff.ts', page, baseUrl);
  }
}

main();
