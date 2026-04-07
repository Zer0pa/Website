#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { localTimestamp, projectPath } from './lib/control-plane.mjs';
import {
  AUTONOMY_SERVICE_LABEL,
  gitHead,
  readRunnerPolicy,
  readRunnerState,
  updateRuntimeRunnerState,
  writeRunnerState,
} from './lib/autonomy.mjs';

function readArg(prefix, fallback = null) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveLoopIntervals() {
  const override = readArg('--interval-seconds=');
  if (override) {
    const seconds = parsePositiveInt(override, 60);
    return {
      idleSeconds: seconds,
      activeCycleSeconds: seconds,
    };
  }

  const policy = readRunnerPolicy();
  const idleSeconds = parsePositiveInt(policy.execution?.loop_interval_seconds, 60);
  const activeCycleSeconds = parsePositiveInt(
    policy.execution?.active_cycle_interval_seconds,
    Math.min(idleSeconds, 5),
  );
  return {
    idleSeconds,
    activeCycleSeconds,
  };
}

const onceScript = projectPath('CLAW/scripts/autonomy-once.mjs');

function currentCodeHead() {
  try {
    return gitHead(projectPath('.'));
  } catch {
    return null;
  }
}

function nextSleepSeconds() {
  const intervals = resolveLoopIntervals();
  const state = readRunnerState();
  return state.active_cycle ? intervals.activeCycleSeconds : intervals.idleSeconds;
}

async function main() {
  const state = readRunnerState();
  let loadedCodeHead = currentCodeHead();
  state.enabled = true;
  state.mode = 'guarded-override';
  state.service_label = AUTONOMY_SERVICE_LABEL;
  state.pid = process.pid;
  state.started_at = state.started_at || localTimestamp();
  state.last_error = null;
  state.code_head = loadedCodeHead;
  writeRunnerState(state);
  updateRuntimeRunnerState({
    enabled: true,
    mode: 'guarded-override',
    code_head: loadedCodeHead,
  });

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
      updateRuntimeRunnerState({
        enabled: false,
        mode: 'stopped',
      });
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
      updateRuntimeRunnerState({
        enabled: true,
        mode: failed.mode || 'guarded-override',
      });
    }

    const latestCodeHead = currentCodeHead();
    if (latestCodeHead && loadedCodeHead && latestCodeHead !== loadedCodeHead) {
      const reloading = readRunnerState();
      reloading.last_tick_at = localTimestamp();
      reloading.pid = null;
      reloading.code_head = latestCodeHead;
      reloading.last_result = {
        ...(reloading.last_result || {}),
        runner_reload: {
          reason: 'control-plane-head-changed',
          previous_code_head: loadedCodeHead,
          next_code_head: latestCodeHead,
        },
      };
      writeRunnerState(reloading);
      updateRuntimeRunnerState({
        enabled: true,
        mode: 'guarded-override',
        code_head: latestCodeHead,
      });
      break;
    }

    await sleep(nextSleepSeconds() * 1000);
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
  updateRuntimeRunnerState({
    enabled: false,
    mode: 'error',
  });
  console.error(error);
  process.exit(1);
});
