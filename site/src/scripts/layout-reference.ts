import fs from 'node:fs';
import path from 'node:path';
import { REFERENCE_LAYOUT_SPECS } from '../lib/layout/specs';

const referenceDir = path.resolve(process.cwd(), '../deterministic-design-system/maps/reference');

fs.mkdirSync(referenceDir, { recursive: true });

for (const spec of Object.values(REFERENCE_LAYOUT_SPECS)) {
  const filePath = path.join(referenceDir, `${spec.page}.reference.json`);
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(
      {
        page: spec.page,
        route: spec.route,
        viewport: spec.viewport,
        elements: spec.entries.map((entry) => ({
          id: entry.id,
          x: entry.x,
          y: entry.y,
          width: entry.width,
          height: entry.height,
          tolerance: Math.max(entry.positionTolerance ?? 12, entry.sizeTolerance ?? 18),
          color: entry.textColor,
          backgroundColor: entry.backgroundColor,
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`wrote ${filePath}`);
}
