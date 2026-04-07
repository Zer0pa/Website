#!/usr/bin/env node

import { loadControlPlane, validateControlPlane } from './lib/control-plane.mjs';

const control = loadControlPlane();
const result = validateControlPlane(control, {
  checkCleanWorktrees: process.argv.includes('--check-clean-worktrees'),
});

console.log(JSON.stringify(result, null, 2));

if (!result.clean) {
  process.exitCode = 1;
}
