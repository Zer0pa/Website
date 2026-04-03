import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

type PageConfig = {
  id: 'home' | 'imc' | 'work-xr' | 'work-ft';
  route: string;
  readySelector: string;
};

type HeadingInfo = {
  level: number;
  text: string;
};

type PageAudit = {
  page: PageConfig['id'];
  route: string;
  title: string;
  description: string;
  canonicalHref: string;
  jsonLdCount: number;
  lang: string;
  headings: HeadingInfo[];
  headingSkips: string[];
  h1Count: number;
  landmarks: {
    header: number;
    nav: number;
    main: number;
    footer: number;
  };
  unlabeledLinks: string[];
  unlabeledButtons: string[];
  missingAltImages: string[];
  nestedInteractive: string[];
  duplicateIds: string[];
};

type Finding = {
  severity: 'critical' | 'major' | 'minor';
  page: string;
  message: string;
};

const pages: PageConfig[] = [
  {
    id: 'home',
    route: '/',
    readySelector: '[data-spec="home.hero.heading"]',
  },
  {
    id: 'imc',
    route: '/imc',
    readySelector: '[data-spec="imc.page"]',
  },
  {
    id: 'work-xr',
    route: '/work/xr',
    readySelector: '[data-spec="imc.page"]',
  },
  {
    id: 'work-ft',
    route: '/work/ft',
    readySelector: '[data-spec="imc.page"]',
  },
];

const reportRoot = path.resolve(process.cwd(), '../deterministic-design-system/reports/quality');
const QUALITY_EVAL_SOURCE = String.raw`
const visible = (element) => {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0
  );
};

const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();

const accessibleName = (element) => {
  if (!(element instanceof HTMLElement)) return '';
  return normalizeText(
    element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent ||
      (element instanceof HTMLImageElement ? element.alt : ''),
  );
};

const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  .filter((element) => visible(element))
  .map((element) => ({
    level: Number.parseInt(element.tagName.slice(1), 10),
    text: normalizeText(element.textContent).slice(0, 120),
  }));

const headingSkips = [];
let lastLevel = 0;
for (const heading of headings) {
  if (lastLevel !== 0 && heading.level > lastLevel + 1) {
    headingSkips.push('h' + lastLevel + ' -> h' + heading.level + ' (' + heading.text + ')');
  }
  lastLevel = heading.level;
}

const duplicateIdCounts = Array.from(document.querySelectorAll('[id]')).reduce((map, element) => {
  const id = normalizeText(element.id);
  if (!id) return map;
  map[id] = (map[id] || 0) + 1;
  return map;
}, {});

return {
  page: config.id,
  route: config.route,
  title: normalizeText(document.title),
  description: normalizeText(document.querySelector('meta[name="description"]')?.content),
  canonicalHref: normalizeText(document.querySelector('link[rel="canonical"]')?.href),
  jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
  lang: normalizeText(document.documentElement.lang),
  headings,
  headingSkips,
  h1Count: headings.filter((heading) => heading.level === 1).length,
  landmarks: {
    header: document.querySelectorAll('header').length,
    nav: document.querySelectorAll('nav').length,
    main: document.querySelectorAll('main').length,
    footer: document.querySelectorAll('footer').length,
  },
  unlabeledLinks: Array.from(document.querySelectorAll('a'))
    .filter((element) => visible(element))
    .filter((element) => accessibleName(element) === '')
    .map((element) => element.outerHTML.slice(0, 140)),
  unlabeledButtons: Array.from(document.querySelectorAll('button'))
    .filter((element) => visible(element))
    .filter((element) => accessibleName(element) === '')
    .map((element) => element.outerHTML.slice(0, 140)),
  missingAltImages: Array.from(document.querySelectorAll('img'))
    .filter((element) => visible(element))
    .filter((element) => !element.hasAttribute('alt'))
    .map((element) => element.outerHTML.slice(0, 140)),
  nestedInteractive: Array.from(document.querySelectorAll('a a, a button, button a, button button'))
    .map((element) => element.outerHTML.slice(0, 140)),
  duplicateIds: Object.entries(duplicateIdCounts)
    .filter(([, count]) => count > 1)
    .map(([id, count]) => id + ' (' + count + ')'),
};
`;

function resolveBaseUrl() {
  const baseUrlArg = process.argv.find((arg) => arg.startsWith('--baseUrl='));
  return baseUrlArg?.split('=')[1] || process.env.LAYOUT_BASE_URL || 'http://127.0.0.1:3006';
}

async function auditPage(browser: Awaited<ReturnType<typeof chromium.launch>>, pageConfig: PageConfig) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const baseUrl = resolveBaseUrl();

  await page.goto(`${baseUrl}${pageConfig.route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(pageConfig.readySelector, { timeout: 10000 });

  const audit = await page.evaluate(
    ({ config, source }) => {
      const evaluator = new Function('config', source);
      return evaluator(config);
    },
    { config: pageConfig, source: QUALITY_EVAL_SOURCE },
  );

  await context.close();
  return audit satisfies PageAudit;
}

function collectFindings(results: PageAudit[]) {
  const findings: Finding[] = [];
  const titleMap = new Map<string, string[]>();
  const descriptionMap = new Map<string, string[]>();

  for (const result of results) {
    if (!result.title) {
      findings.push({ severity: 'major', page: result.page, message: 'Missing document title.' });
    } else {
      titleMap.set(result.title, [...(titleMap.get(result.title) || []), result.page]);
    }

    if (!result.description) {
      findings.push({ severity: 'major', page: result.page, message: 'Missing meta description.' });
    } else {
      descriptionMap.set(result.description, [...(descriptionMap.get(result.description) || []), result.page]);
    }

    if (!result.lang) {
      findings.push({ severity: 'major', page: result.page, message: 'Missing html lang attribute.' });
    }

    if (result.landmarks.main !== 1) {
      findings.push({
        severity: 'critical',
        page: result.page,
        message: `Expected exactly one main landmark, found ${result.landmarks.main}.`,
      });
    }

    if (result.h1Count !== 1) {
      findings.push({
        severity: 'major',
        page: result.page,
        message: `Expected exactly one h1, found ${result.h1Count}.`,
      });
    }

    if (result.landmarks.header === 0 || result.landmarks.nav === 0 || result.landmarks.footer === 0) {
      findings.push({
        severity: 'minor',
        page: result.page,
        message: `Missing expected landmark counts header=${result.landmarks.header} nav=${result.landmarks.nav} footer=${result.landmarks.footer}.`,
      });
    }

    if (result.headingSkips.length > 0) {
      findings.push({
        severity: 'minor',
        page: result.page,
        message: `Heading hierarchy skips: ${result.headingSkips.join('; ')}`,
      });
    }

    if (result.unlabeledLinks.length > 0) {
      findings.push({
        severity: 'major',
        page: result.page,
        message: `Found ${result.unlabeledLinks.length} unlabeled links.`,
      });
    }

    if (result.unlabeledButtons.length > 0) {
      findings.push({
        severity: 'major',
        page: result.page,
        message: `Found ${result.unlabeledButtons.length} unlabeled buttons.`,
      });
    }

    if (result.missingAltImages.length > 0) {
      findings.push({
        severity: 'minor',
        page: result.page,
        message: `Found ${result.missingAltImages.length} images missing alt text.`,
      });
    }

    if (result.nestedInteractive.length > 0) {
      findings.push({
        severity: 'major',
        page: result.page,
        message: `Found ${result.nestedInteractive.length} nested interactive element patterns.`,
      });
    }

    if (result.duplicateIds.length > 0) {
      findings.push({
        severity: 'major',
        page: result.page,
        message: `Duplicate ids detected: ${result.duplicateIds.join(', ')}`,
      });
    }

    if (result.jsonLdCount === 0) {
      findings.push({
        severity: 'minor',
        page: result.page,
        message: 'No JSON-LD structured data present.',
      });
    }

    if (!result.canonicalHref) {
      findings.push({
        severity: 'minor',
        page: result.page,
        message: 'No canonical link present.',
      });
    }
  }

  for (const [title, owners] of Array.from(titleMap.entries())) {
    if (title && owners.length > 1) {
      findings.push({
        severity: 'major',
        page: owners.join(', '),
        message: `Duplicate title across routes: "${title}".`,
      });
    }
  }

  for (const [description, owners] of Array.from(descriptionMap.entries())) {
    if (description && owners.length > 1) {
      findings.push({
        severity: 'major',
        page: owners.join(', '),
        message: `Duplicate meta description across routes: "${description}".`,
      });
    }
  }

  return findings;
}

function summarize(findings: Finding[]) {
  return {
    critical: findings.filter((finding) => finding.severity === 'critical').length,
    major: findings.filter((finding) => finding.severity === 'major').length,
    minor: findings.filter((finding) => finding.severity === 'minor').length,
  };
}

function buildMarkdown(results: PageAudit[], findings: Finding[]) {
  const counts = summarize(findings);
  const lines = [
    '# Quality Verification',
    '',
    `- Critical findings: \`${counts.critical}\``,
    `- Major findings: \`${counts.major}\``,
    `- Minor findings: \`${counts.minor}\``,
    '',
    '## Findings',
    '',
  ];

  if (findings.length === 0) {
    lines.push('- None.');
  } else {
    for (const finding of findings) {
      lines.push(`- [${finding.severity}] \`${finding.page}\` ${finding.message}`);
    }
  }

  lines.push('', '## Route Snapshots', '');

  for (const result of results) {
    lines.push(`### ${result.page.toUpperCase()}`);
    lines.push(`- Route: \`${result.route}\``);
    lines.push(`- Title: \`${result.title || 'missing'}\``);
    lines.push(`- Description: \`${result.description || 'missing'}\``);
    lines.push(`- Canonical: \`${result.canonicalHref || 'missing'}\``);
    lines.push(`- JSON-LD blocks: \`${result.jsonLdCount}\``);
    lines.push(`- h1 count: \`${result.h1Count}\``);
    lines.push(
      `- Landmarks: \`header=${result.landmarks.header} nav=${result.landmarks.nav} main=${result.landmarks.main} footer=${result.landmarks.footer}\``,
    );
    lines.push(`- Heading order issues: \`${result.headingSkips.length}\``);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  try {
    const results: PageAudit[] = [];
    for (const pageConfig of pages) {
      results.push(await auditPage(browser, pageConfig));
    }

    const findings = collectFindings(results);
    const payload = {
      generatedAt: new Date().toISOString(),
      findings,
      routes: results,
      summary: summarize(findings),
    };

    fs.mkdirSync(reportRoot, { recursive: true });
    const jsonPath = path.join(reportRoot, 'quality.verification.json');
    const markdownPath = path.join(reportRoot, 'quality.verification.md');

    fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    fs.writeFileSync(markdownPath, buildMarkdown(results, findings), 'utf8');

    console.log(`wrote ${jsonPath}`);
    console.log(`wrote ${markdownPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
