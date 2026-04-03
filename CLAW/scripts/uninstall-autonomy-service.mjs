#!/usr/bin/env node

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  AUTONOMY_PLIST_TARGET,
  AUTONOMY_SERVICE_LABEL,
  readRunnerState,
  writeRunnerState,
} from './lib/autonomy.mjs';
import { localTimestamp } from './lib/control-plane.mjs';

const uid = process.getuid?.();
if (!uid) {
  throw new Error('Unable to determine local user id for launchd bootout.');
}

try {
  execFileSync('launchctl', ['bootout', `gui/${uid}`, AUTONOMY_PLIST_TARGET], {
    stdio: 'ignore',
  });
} catch {}

if (fs.existsSync(AUTONOMY_PLIST_TARGET)) {
  fs.unlinkSync(AUTONOMY_PLIST_TARGET);
}

const state = readRunnerState();
state.enabled = false;
state.mode = 'uninstalled';
state.stop_requested = true;
state.pid = null;
state.active_job = null;
state.active_cycle = null;
state.last_tick_at = localTimestamp();
writeRunnerState(state);

console.log(
  JSON.stringify(
    {
      uninstalled: true,
      label: AUTONOMY_SERVICE_LABEL,
    },
    null,
    2,
  ),
);
