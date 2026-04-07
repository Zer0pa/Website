import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

type PageConfig = {
  id: 'home' | 'imc' | 'work-xr' | 'work-ft';
  route: string;
  readySelector: string;
};

type ContrastIssue = {
  selector: string;
  text: string;
  ratio: number;
  threshold: number;
  fontSize: number;
  fontWeight: string;
  foreground: string;
  background: string;
  severity: 'major' | 'minor';
};

type ContrastPageAudit = {
  page: PageConfig['id'];
  route: string;
  totalChecked: number;
  failing: ContrastIssue[];
  warningBand: ContrastIssue[];
  minRatio: number;
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
    readySelector: '[data-spec="work.lane.page"]',
  },
  {
    id: 'work-ft',
    route: '/work/ft',
    readySelector: '[data-spec="work.lane.page"]',
  },
];

const reportRoot = path.resolve(process.cwd(), '../deterministic-design-system/reports/contrast');
const CONTRAST_EVAL_SOURCE = String.raw`
const parseColor = (input) => {
  const value = (input || '').trim();
  if (!value || value === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  return {
    r: parts[0] || 0,
    g: parts[1] || 0,
    b: parts[2] || 0,
    a: typeof parts[3] === 'number' && !Number.isNaN(parts[3]) ? parts[3] : 1,
  };
};

const composite = (top, bottom) => {
  const alpha = top.a + bottom.a * (1 - top.a);
  if (alpha === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r: Math.round((top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / alpha),
    g: Math.round((top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / alpha),
    b: Math.round((top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / alpha),
    a: alpha,
  };
};

const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();

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

const relativeLuminance = (channel) => {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

const contrastRatio = (foreground, background) => {
  const l1 =
    0.2126 * relativeLuminance(foreground.r) +
    0.7152 * relativeLuminance(foreground.g) +
    0.0722 * relativeLuminance(foreground.b);
  const l2 =
    0.2126 * relativeLuminance(background.r) +
    0.7152 * relativeLuminance(background.g) +
    0.0722 * relativeLuminance(background.b);

  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
};

const formatColor = (color) => 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + Math.round(color.a * 100) / 100 + ')';

const resolveBackground = (element) => {
  const rootBackground = parseColor(window.getComputedStyle(document.documentElement).backgroundColor);
  const stack = [];
  let current = element;

  while (current) {
    const color = parseColor(window.getComputedStyle(current).backgroundColor);
    if (color.a > 0) {
      stack.unshift(color);
    }
    current = current.parentElement;
  }

  return stack.reduce((resolved, color) => composite(color, resolved), rootBackground);
};

const selectorFor = (element) => {
  const dataSpec = element.getAttribute('data-spec');
  if (dataSpec) return '[data-spec="' + dataSpec + '"]';
  if (element.id) return '#' + element.id;
  const className = normalizeText(element.className).split(' ').filter(Boolean).slice(0, 2).join('.');
  if (className) return element.tagName.toLowerCase() + '.' + className;
  return element.tagName.toLowerCase();
};

const candidates = Array.from(
  document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, dt, dd'),
)
  .filter((element) => visible(element))
  .map((element) => {
    const text = normalizeText(element.textContent);
    if (!text) return null;

    const style = window.getComputedStyle(element);
    const foreground = parseColor(style.color);
    const background = resolveBackground(element);
    const fontSize = Number.parseFloat(style.fontSize) || 0;
    const fontWeight = style.fontWeight;
    const numericWeight = Number.parseInt(fontWeight, 10) || 400;
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && numericWeight >= 700);
    const threshold = isLargeText ? 3 : 4.5;
    const ratio = contrastRatio(foreground, background);

    return {
      selector: selectorFor(element),
      text: text.slice(0, 120),
      ratio: Math.round(ratio * 100) / 100,
      threshold,
      fontSize: Math.round(fontSize * 100) / 100,
      fontWeight,
      foreground: formatColor(foreground),
      background: formatColor(background),
      severity: ratio < threshold ? (ratio < Math.max(3, threshold - 1) ? 'major' : 'minor') : 'minor',
    };
  })
  .filter(Boolean);

const failing = candidates
  .filter((candidate) => candidate.ratio < candidate.threshold)
  .sort((left, right) => left.ratio - right.ratio)
  .slice(0, 18);

const warningBand = candidates
  .filter((candidate) => candidate.ratio >= candidate.threshold && candidate.ratio < candidate.threshold + 1)
  .sort((left, right) => left.ratio - right.ratio)
  .slice(0, 12);

const minRatio = candidates.length > 0 ? Math.min(...candidates.map((candidate) => candidate.ratio)) : 21;

return {
  page: config.id,
  route: config.route,
  totalChecked: candidates.length,
  failing,
  warningBand,
  minRatio: Math.round(minRatio * 100) / 100,
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
    { config: pageConfig, source: CONTRAST_EVAL_SOURCE },
  );

  await context.close();
  return audit satisfies ContrastPageAudit;
}

function buildMarkdown(results: ContrastPageAudit[]) {
  const failing = results.flatMap((result) => result.failing);
  const warningBand = results.flatMap((result) => result.warningBand);
  const counts = {
    major: failing.filter((issue) => issue.severity === 'major').length,
    minor: failing.filter((issue) => issue.severity === 'minor').length,
    warnings: warningBand.length,
  };

  const lines = [
    '# Contrast Verification',
    '',
    `- Major failures: \`${counts.major}\``,
    `- Minor failures: \`${counts.minor}\``,
    `- Warning-band elements: \`${counts.warnings}\``,
    '',
  ];

  for (const result of results) {
    lines.push(`## ${result.page.toUpperCase()}`);
    lines.push(`- Route: \`${result.route}\``);
    lines.push(`- Text nodes checked: \`${result.totalChecked}\``);
    lines.push(`- Minimum observed ratio: \`${result.minRatio}\``);

    if (result.failing.length === 0) {
      lines.push('- Failing contrast nodes: `0`');
    } else {
      for (const issue of result.failing) {
        lines.push(
          `- [${issue.severity}] \`${issue.selector}\` ratio \`${issue.ratio}\` threshold \`${issue.threshold}\` font \`${issue.fontSize}px/${issue.fontWeight}\` text \`${issue.text}\``,
        );
      }
    }

    if (result.warningBand.length > 0) {
      lines.push(`- Warning band: \`${result.warningBand.length}\``);
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  try {
    const results: ContrastPageAudit[] = [];
    for (const pageConfig of pages) {
      results.push(await auditPage(browser, pageConfig));
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      summary: {
        major: results.flatMap((result) => result.failing).filter((issue) => issue.severity === 'major').length,
        minor: results.flatMap((result) => result.failing).filter((issue) => issue.severity === 'minor').length,
        warnings: results.flatMap((result) => result.warningBand).length,
      },
      routes: results,
    };

    fs.mkdirSync(reportRoot, { recursive: true });
    const jsonPath = path.join(reportRoot, 'contrast.verification.json');
    const markdownPath = path.join(reportRoot, 'contrast.verification.md');

    fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    fs.writeFileSync(markdownPath, buildMarkdown(results), 'utf8');

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
