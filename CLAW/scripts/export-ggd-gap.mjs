#!/usr/bin/env node

import path from 'node:path';

import { projectPath, readJson } from './lib/control-plane.mjs';
import { buildGapRecordFromHandoff, writeGapRecord } from './lib/ggd.mjs';

function readArg(flag) {
  const raw = process.argv.find((value) => value.startsWith(`${flag}=`));
  return raw ? raw.slice(flag.length + 1) : null;
}

const handoffPath = readArg('--handoff') || 'CLAW/control-plane/runtime/handoffs/C4-20260403T165341Z-03.json';
const handoff = readJson(handoffPath);
const kind = readArg('--kind') || 'geometry-gap';
const route = readArg('--route') || null;
const outputArg = readArg('--output');
const gap = buildGapRecordFromHandoff(
  {
    ...handoff,
    source_handoff: handoffPath,
  },
  {
    route,
    kind,
  },
);
const outputPath = outputArg ? projectPath(outputArg) : writeGapRecord(gap);

if (outputArg) {
  await import('node:fs').then(({ default: fs }) => {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(gap, null, 2)}\n`, 'utf8');
  });
}

console.log(
  JSON.stringify(
    {
      written: path.relative(projectPath('.'), outputPath),
      route: gap.route,
      kind: gap.kind,
      severity_counts: gap.severity_counts,
    },
    null,
    2,
  ),
);
