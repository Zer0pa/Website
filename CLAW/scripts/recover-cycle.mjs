#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  CONTROL_ROOT,
  activeLocks,
  controlPath,
  loadControlPlane,
  localTimestamp,
  projectPath,
  readJson,
  writeJson,
} from './lib/control-plane.mjs';

function readArg(prefix) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || null;
}

const maxAgeMinutes = Number.parseInt(readArg('--max-age-minutes=') || '180', 10);
const now = Date.now();
const control = loadControlPlane();
const runtime = structuredClone(control.runtime);
const locks = activeLocks();
const staleLocks = locks.filter((lock) => {
  const expiresAt = lock.payload.expires_at ? Date.parse(lock.payload.expires_at) : null;
  if (!runtime.active_cycle) {
    return true;
  }
  if (Number.isFinite(expiresAt)) {
    return expiresAt < now;
  }
  const heartbeatAt = lock.payload.heartbeat_at ? Date.parse(lock.payload.heartbeat_at) : Date.parse(lock.payload.acquired_at);
  return Number.isFinite(heartbeatAt) && heartbeatAt + maxAgeMinutes * 60 * 1000 < now;
});

const releasedLocks = [];
for (const lock of staleLocks) {
  if (fs.existsSync(lock.absolutePath)) {
    fs.unlinkSync(lock.absolutePath);
    releasedLocks.push(path.relative(projectPath('.'), lock.absolutePath));
  }
}

const eventId = `RECOVER-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
const event = {
  event_id: eventId,
  cycle_id: runtime.active_cycle?.cycle_id || null,
  reason: staleLocks.length > 0 ? 'stale-lock-recovery' : 'no-op',
  released_locks: releasedLocks,
  runtime_mutation: staleLocks.length > 0 ? 'active cycle cleared after stale lock recovery' : 'none',
  created_at: localTimestamp(),
};

writeJson(controlPath('recoveries', `${eventId}.json`), event);

if (staleLocks.length > 0) {
  const queueIndexPath = controlPath('queue', 'index.json');
  const queueIndex = fs.existsSync(queueIndexPath)
    ? readJson(queueIndexPath)
    : { version: 1, active: null, history: [] };
  queueIndex.active = null;
  writeJson(queueIndexPath, queueIndex);

  runtime.active_cycle = null;
  runtime.active_jobs = [];
  runtime.locks = [];
  runtime.queue = {
    active: null,
    history: queueIndex.history,
  };
  runtime.heartbeat_at = null;
  runtime.last_recovery_event = `CLAW/control-plane/recoveries/${eventId}.json`;
  runtime.last_updated = localTimestamp();
  writeJson(path.join(CONTROL_ROOT, 'state', 'runtime-state.json'), runtime);
}

console.log(JSON.stringify(event, null, 2));
