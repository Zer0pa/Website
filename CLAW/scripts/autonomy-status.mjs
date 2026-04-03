#!/usr/bin/env node

import { loadControlPlane } from './lib/control-plane.mjs';
import { loadActiveQueue, readRunnerState } from './lib/autonomy.mjs';

const control = loadControlPlane();
const queue = loadActiveQueue(control.runtime);
const runner = readRunnerState();

console.log(
  JSON.stringify(
    {
      runner,
      runtime: {
        phase: control.runtime.current_phase,
        press_go: control.runtime.press_go,
        active_cycle: control.runtime.active_cycle,
        active_cadence_profile: control.runtime.active_cadence_profile,
        blockers: control.runtime.blockers,
      },
      queue,
    },
    null,
    2,
  ),
);
