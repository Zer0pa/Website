import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

type PageConfig = {
  id: 'home' | 'imc';
  route: string;
  readySelector: string;
  textSelectors: string[];
};

type ViewportConfig = {
  id: 'laptop' | 'tablet' | 'mobile';
  width: number;
  height: number;
};

type FontMetric = {
  selector: string;
  fontSize: number;
  lineHeight: string;
  width: number;
};

type OverflowMetric = {
  tag: string;
  selector: string;
  right: number;
  width: number;
  text: string;
};

type InternalOverflowMetric = {
  tag: string;
  selector: string;
  scrollWidth: number;
  clientWidth: number;
  text: string;
};

function resolveBaseUrl() {
  const baseUrlArg = process.argv.find((arg) => arg.startsWith('--baseUrl='));
  return baseUrlArg?.split('=')[1] || process.env.LAYOUT_BASE_URL || 'http://127.0.0.1:3006';
}

const reportRoot = path.resolve(process.cwd(), '../deterministic-design-system/reports/responsive');

const pages: PageConfig[] = [
  {
    id: 'home',
    route: '/',
    readySelector: '[data-spec="home.hero.heading"]',
    textSelectors: ['[data-spec="home.hero.body"]', '[data-spec="home.flagship.summary"]'],
  },
  {
    id: 'imc',
    route: '/imc',
    readySelector: '[data-spec="imc.page"]',
    textSelectors: ['[data-spec="imc.hero.identity"]', '[data-spec="imc.cta.band"]'],
  },
];

const viewports: ViewportConfig[] = [
  { id: 'laptop', width: 1440, height: 900 },
  { id: 'tablet', width: 834, height: 1194 },
  { id: 'mobile', width: 390, height: 844 },
];

async function auditPage(browser: Awaited<ReturnType<typeof chromium.launch>>, pageConfig: PageConfig, viewport: ViewportConfig) {
  const baseUrl = resolveBaseUrl();
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: 'dark',
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}${pageConfig.route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(pageConfig.readySelector, { timeout: 10000 });

  const metrics = await page.evaluate((config) => {
    const fonts = config.textSelectors
      .map((selector) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return null;
        const style = window.getComputedStyle(element);
        return {
          selector,
          fontSize: Number.parseFloat(style.fontSize) || 0,
          lineHeight: style.lineHeight,
          width: Math.round(element.getBoundingClientRect().width * 100) / 100,
        };
      })
      .filter((font): font is FontMetric => font !== null);

    return {
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      gridMax: window.getComputedStyle(document.documentElement).getPropertyValue('--grid-max').trim(),
      gridPad: window.getComputedStyle(document.documentElement).getPropertyValue('--grid-pad').trim(),
      shellWidth: Math.round((document.querySelector<HTMLElement>('.page-shell')?.getBoundingClientRect().width || 0) * 100) / 100,
      shellUtilization:
        Math.round(
          (((document.querySelector<HTMLElement>('.page-shell')?.getBoundingClientRect().width || 0) / window.innerWidth) *
            100) *
            10,
        ) / 10,
      fonts,
      overflowingElements: Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            selector:
              element.getAttribute('data-spec') ||
              element.className
                .toString()
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .join('.'),
            right: Math.round(rect.right * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 64),
          };
        })
        .filter((element) => element.right > window.innerWidth + 0.5)
        .sort((left, right) => right.right - left.right)
        .slice(0, 6),
      internalOverflowingElements: Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .map((element) => ({
          tag: element.tagName,
          selector:
            element.getAttribute('data-spec') ||
            element.className
              .toString()
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .join('.'),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 64),
        }))
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .sort((left, right) => right.scrollWidth - right.clientWidth - (left.scrollWidth - left.clientWidth))
        .slice(0, 6),
    };
  }, pageConfig);

  fs.mkdirSync(reportRoot, { recursive: true });
  const screenshotPath = path.join(reportRoot, `${pageConfig.id}.${viewport.id}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await context.close();

  return {
    page: pageConfig.id,
    route: pageConfig.route,
    viewport,
    screenshotPath,
    ...metrics,
  };
}

function buildMarkdown(results: Array<Awaited<ReturnType<typeof auditPage>>>) {
  const lines = ['# Responsive Verification', ''];

  for (const result of results) {
    lines.push(`## ${result.page.toUpperCase()} / ${result.viewport.id.toUpperCase()}`);
    lines.push(`- Route: \`${result.route}\``);
    lines.push(`- Viewport: \`${result.viewport.width}x${result.viewport.height}\``);
    lines.push(`- Document height: \`${result.documentHeight}\``);
    lines.push(`- Horizontal overflow: \`${result.overflowX ? 'YES' : 'NO'}\``);
    lines.push(`- CSS grid max / pad: \`${result.gridMax}\` / \`${result.gridPad}\``);
    lines.push(`- Page shell width: \`${result.shellWidth}px\` (\`${result.shellUtilization}%\` of viewport)`);
    lines.push(`- Screenshot: \`${result.screenshotPath}\``);
    for (const font of result.fonts) {
      lines.push(`- ${font.selector}: \`${font.fontSize}px\` / width \`${font.width}px\``);
    }
    if (result.overflowingElements.length > 0) {
      for (const element of result.overflowingElements) {
        lines.push(
          `- Overflow culprit: \`${element.selector || element.tag}\` right \`${element.right}px\` width \`${element.width}px\` text \`${element.text}\``,
        );
      }
    }
    if (result.internalOverflowingElements.length > 0) {
      for (const element of result.internalOverflowingElements) {
        lines.push(
          `- Internal overflow: \`${element.selector || element.tag}\` scroll \`${element.scrollWidth}px\` client \`${element.clientWidth}px\` text \`${element.text}\``,
        );
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const results: Array<Awaited<ReturnType<typeof auditPage>>> = [];
    for (const pageConfig of pages) {
      for (const viewport of viewports) {
        results.push(await auditPage(browser, pageConfig, viewport));
      }
    }

    const markdown = buildMarkdown(results);
    const reportPath = path.join(reportRoot, 'responsive.verification.md');
    fs.writeFileSync(reportPath, `${markdown}\n`, 'utf8');
    console.log(`wrote ${reportPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
