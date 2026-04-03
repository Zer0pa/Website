#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  ensureAutonomyDirs,
  AUTONOMY_PLIST_SOURCE,
  AUTONOMY_PLIST_TARGET,
  AUTONOMY_SERVICE_LABEL,
  readRunnerState,
  writeRunnerState,
} from './lib/autonomy.mjs';
import { ensureDir, localTimestamp } from './lib/control-plane.mjs';

const uid = process.getuid?.();
if (!uid) {
  throw new Error('Unable to determine local user id for launchd bootstrap.');
}

ensureAutonomyDirs();
ensureDir(path.dirname(AUTONOMY_PLIST_TARGET));
fs.copyFileSync(AUTONOMY_PLIST_SOURCE, AUTONOMY_PLIST_TARGET);

try {
  execFileSync('launchctl', ['bootout', `gui/${uid}`, AUTONOMY_PLIST_TARGET], { stdio: 'ignore' });
} catch {}

execFileSync('launchctl', ['bootstrap', `gui/${uid}`, AUTONOMY_PLIST_TARGET], { stdio: 'inherit' });
execFileSync('launchctl', ['enable', `gui/${uid}/${AUTONOMY_SERVICE_LABEL}`], { stdio: 'inherit' });
execFileSync('launchctl', ['kickstart', '-k', `gui/${uid}/${AUTONOMY_SERVICE_LABEL}`], { stdio: 'inherit' });

const state = readRunnerState();
state.enabled = true;
state.mode = 'guarded-override';
state.service_label = AUTONOMY_SERVICE_LABEL;
state.installed_at = localTimestamp();
state.stop_requested = false;
writeRunnerState(state);

console.log(
  JSON.stringify(
    {
      installed: true,
      plist: AUTONOMY_PLIST_TARGET,
      label: AUTONOMY_SERVICE_LABEL,
    },
    null,
    2,
  ),
);
