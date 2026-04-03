import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { REFERENCE_LAYOUT_SPECS, type LayoutPageId } from '../lib/layout/specs';

type MeasuredEntry = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: number;
  letterSpacing: string;
  text: string;
};

const liveDir = path.resolve(process.cwd(), '../deterministic-design-system/maps/live');
const reportDir = path.resolve(process.cwd(), '../deterministic-design-system/reports');
const baseUrl = process.env.LAYOUT_BASE_URL || 'http://127.0.0.1:3006';

export async function measurePage(pageId: LayoutPageId) {
  const spec = REFERENCE_LAYOUT_SPECS[pageId];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: spec.viewport.width,
      height: Math.min(spec.viewport.height, 1400),
    },
    colorScheme: 'dark',
  });

  await page.goto(`${baseUrl}${spec.route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(`[data-spec="${spec.entries[0]?.id}"]`, { timeout: 8000 });

  const measured = await page.evaluate(() => {
    const readEntries = Array.from(document.querySelectorAll<HTMLElement>('[data-spec]')).map((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return {
        id: element.dataset.spec || '',
        x: Math.round((rect.left + window.scrollX) * 100) / 100,
        y: Math.round((rect.top + window.scrollY) * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        backgroundColor: style.backgroundColor,
        textColor: style.color,
        borderColor: style.borderColor,
        fontSize: Number.parseFloat(style.fontSize) || 0,
        letterSpacing: style.letterSpacing,
        text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    });

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      documentHeight: document.documentElement.scrollHeight,
      entries: readEntries,
    };
  });

  fs.mkdirSync(reportDir, { recursive: true });
  const screenshotPath = path.join(reportDir, `${pageId}.audit.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  await browser.close();

  const artifact = {
    page: pageId,
    route: spec.route,
    measuredAt: new Date().toISOString(),
    viewport: measured.viewport,
    documentHeight: measured.documentHeight,
    entries: measured.entries as MeasuredEntry[],
    screenshotPath,
  };

  fs.mkdirSync(liveDir, { recursive: true });
  const filePath = path.join(liveDir, `${pageId}.live.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(`wrote ${filePath}`);
}

export async function main() {
  const requested = process.argv[2] as LayoutPageId | undefined;
  const pages = requested ? [requested] : (Object.keys(REFERENCE_LAYOUT_SPECS) as LayoutPageId[]);

  for (const pageId of pages) {
    await measurePage(pageId);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
