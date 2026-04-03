#!/usr/bin/env node

import {
  buildCyclePlan,
  findLockConflicts,
  loadControlPlane,
  materializeCycle,
  validateControlPlane,
} from './lib/control-plane.mjs';

function readArg(prefix) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || null;
}

const materialize = process.argv.includes('--materialize');
const control = loadControlPlane();
const validation = validateControlPlane(control);

if (!validation.clean) {
  console.error(JSON.stringify(validation, null, 2));
  process.exit(1);
}

const cycle = buildCyclePlan(control, {
  phase: readArg('--phase='),
  profile: readArg('--profile='),
  materialize,
});

const lockConflicts = findLockConflicts(cycle);

if (lockConflicts.length > 0) {
  console.error(
    JSON.stringify(
      {
        error: 'lock-conflict',
        lockConflicts,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

if (materialize) {
  const materialized = materializeCycle(control, cycle);
  console.log(
    JSON.stringify(
      {
        validation,
        cycle,
        materialized: {
          queue_file: materialized.queuePath,
          runtime_state: materialized.runtimePath,
        },
      },
      null,
      2,
    ),
  );
} else {
  console.log(
    JSON.stringify(
      {
        validation,
        cycle,
        materialized: false,
      },
      null,
      2,
    ),
  );
}
