#!/usr/bin/env node

import { activeLocks, loadControlPlane, validateControlPlane } from './lib/control-plane.mjs';

const control = loadControlPlane();
const validation = validateControlPlane(control);
const locks = activeLocks();

const payload = {
  clean: validation.clean,
  phase: control.runtime.current_phase,
  active_cycle: control.runtime.active_cycle,
  active_cadence_profile: control.runtime.active_cadence_profile || null,
  queue: control.runtime.queue || null,
  lock_count: locks.length,
  warnings: validation.warnings,
  issues: validation.issues,
};

console.log(JSON.stringify(payload, null, 2));

process.exit(validation.clean ? 0 : 1);
