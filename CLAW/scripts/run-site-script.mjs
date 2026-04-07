#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import { projectPath } from './lib/control-plane.mjs';

const [, , scriptName, ...forwardedArgs] = process.argv;

if (!scriptName) {
  console.error('Usage: node CLAW/scripts/run-site-script.mjs <npm-script> [-- extra args]');
  process.exit(64);
}

const siteDir = projectPath('site');
const packageJsonPath = projectPath('site/package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`Missing site package manifest: ${packageJsonPath}`);
  process.exit(1);
}

const npmArgs = ['--prefix', siteDir, 'run', scriptName];
if (forwardedArgs.length > 0) {
  npmArgs.push('--', ...forwardedArgs);
}

const result = spawnSync('npm', npmArgs, {
  cwd: projectPath('.'),
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
