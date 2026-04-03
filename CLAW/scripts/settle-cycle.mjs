#!/usr/bin/env node

import { loadControlPlane, settleActiveCycle } from './lib/control-plane.mjs';

function readArg(prefix) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || null;
}

const outcome = readArg('--outcome=');
const note = readArg('--note=') || '';

if (!outcome) {
  console.error('Missing required argument: --outcome=<accepted|rejected|escalated|checkpointed|abandoned>');
  process.exit(1);
}

const allowedOutcomes = new Set(['accepted', 'rejected', 'escalated', 'checkpointed', 'abandoned']);

if (!allowedOutcomes.has(outcome)) {
  console.error(`Unsupported outcome: ${outcome}`);
  process.exit(1);
}

const control = loadControlPlane();
settleActiveCycle(control, outcome, note);

console.log(
  JSON.stringify(
    {
      settled: true,
      outcome,
      note,
    },
    null,
    2,
  ),
);
