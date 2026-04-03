#!/usr/bin/env node

import { buildCyclePlan, loadControlPlane, validateControlPlane } from './lib/control-plane.mjs';

function readArg(prefix) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || null;
}

const control = loadControlPlane();
const validation = validateControlPlane(control);

if (!validation.clean) {
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}

const cycle = buildCyclePlan(control, {
  phase: readArg('--phase='),
  profile: readArg('--profile='),
  materialize: false,
});

console.log(JSON.stringify(cycle, null, 2));
