#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { localTimestamp, projectPath } from './lib/control-plane.mjs';
import { AUTONOMY_SERVICE_LABEL, readRunnerState, writeRunnerState } from './lib/autonomy.mjs';

function readArg(prefix, fallback = null) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const intervalSeconds = Number.parseInt(readArg('--interval-seconds=', '300'), 10);
const onceScript = projectPath('CLAW/scripts/autonomy-once.mjs');

async function main() {
  const state = readRunnerState();
  state.enabled = true;
  state.mode = 'guarded-override';
  state.service_label = AUTONOMY_SERVICE_LABEL;
  state.pid = process.pid;
  state.started_at = state.started_at || localTimestamp();
  state.last_error = null;
  writeRunnerState(state);

  while (true) {
    const latest = readRunnerState();
    if (latest.stop_requested) {
      latest.enabled = false;
      latest.mode = 'stopped';
      latest.pid = null;
      latest.active_job = null;
      latest.active_cycle = null;
      latest.last_tick_at = localTimestamp();
      writeRunnerState(latest);
      break;
    }

    try {
      execFileSync('node', [onceScript], {
        cwd: projectPath('.'),
        stdio: 'inherit',
      });
    } catch (error) {
      const failed = readRunnerState();
      failed.last_tick_at = localTimestamp();
      failed.last_error = error instanceof Error ? error.message : String(error);
      writeRunnerState(failed);
    }

    await sleep(intervalSeconds * 1000);
  }
}

main().catch((error) => {
  const failed = readRunnerState();
  failed.enabled = false;
  failed.mode = 'error';
  failed.pid = null;
  failed.last_tick_at = localTimestamp();
  failed.last_error = error instanceof Error ? error.message : String(error);
  writeRunnerState(failed);
  console.error(error);
  process.exit(1);
});
