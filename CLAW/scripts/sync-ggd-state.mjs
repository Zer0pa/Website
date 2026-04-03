#!/usr/bin/env node

import { localTimestamp, readJson } from './lib/control-plane.mjs';
import {
  GGD_AUGMENTATION_BACKLOG_PATH,
  GGD_BINDING_PATH,
  GGD_BUNDLE_INDEX_PATH,
  loadGapRecords,
  readGgdState,
  writeGgdState,
  writeStateMarkdown,
} from './lib/ggd.mjs';

const state = readGgdState();
const runtime = readJson('CLAW/control-plane/state/runtime-state.json');
const binding = readJson('GGD/project.binding.json');
const bundles = readJson('GGD/verification/bundles.json');
const augmentationBacklog = readJson('GGD/augmentations/augmentation-backlog.json').items || [];
const gapRecords = loadGapRecords();

const routeStatus = {
  '/': {
    role: 'home',
    status: runtime.gates?.p1_homepage_canonical ? 'canonical' : 'in-progress',
    summary: runtime.gates?.p1_homepage_canonical ? 'homepage accepted through canonical closure' : 'homepage not yet canonical',
  },
  '/imc': {
    role: 'flagship',
    status: runtime.gates?.p2_imc_canonical ? 'canonical' : 'in-progress',
    summary: runtime.gates?.p2_imc_canonical ? 'flagship IMC accepted through canonical closure' : 'IMC not yet canonical',
  },
  '/work/xr': {
    role: 'product-family',
    status: gapRecords.find((gap) => gap.route === '/work/xr') ? 'blocked' : 'unknown',
    summary:
      gapRecords.find((gap) => gap.route === '/work/xr')?.summary ||
      'XR gap not yet exported',
  },
  '/work/ft': {
    role: 'product-family',
    status: gapRecords.find((gap) => gap.route === '/work/ft') ? 'blocked' : 'pending-proof',
    summary:
      gapRecords.find((gap) => gap.route === '/work/ft')?.summary ||
      'FT replication proof still pending',
  },
};

state.project_reference.project_md_updated = localTimestamp().slice(0, 10);
state.project_reference.current_focus =
  'Bind the installed ggd-* command surface to the live Zer0pa Website GGD/CLAW state, verification bundles, route gaps, and deterministic augmentation backlog.';
state.position.current_phase = '2';
state.position.current_phase_name = 'Build the verification catalog and command binding';
state.position.current_plan = 'binding-bundles-gaps-sync';
state.position.status = 'in_progress';
state.position.last_activity = localTimestamp();
state.position.last_activity_desc =
  'Bound GGD command surface to project binding, verification bundle index, route gaps, and augmentation backlog.';
state.position.progress_percent = 40;
state.command_binding = {
  command_namespace: binding.command_namespace,
  binding_file: binding.binding_file,
  verification_bundle_index: binding.verification_bundle_index,
  gap_dir: binding.gap_dir,
  sync_script: binding.scripts.sync_state,
  export_gap_script: binding.scripts.export_gap,
  verify_binding_script: binding.scripts.verify_binding,
};
state.route_status = routeStatus;
state.verification_bundle_index = {
  file: binding.verification_bundle_index,
  bundle_count: (bundles.bundles || []).length,
  bundle_ids: (bundles.bundles || []).map((bundle) => bundle.id),
};
state.gap_records = gapRecords.map((gap) => ({
  id: gap.id,
  route: gap.route,
  status: gap.status,
  severity_counts: gap.severity_counts,
  source_handoff: gap.source_handoff,
}));
state.augmentation_backlog = augmentationBacklog;
state.pending_todos = [
  'Teach CLAW runtime promotion logic to read GGD gap records before promoting product-family work.',
  'Add explicit FT route-gap export once the first FT falsification exists.',
  'Bind named GGD verification bundles to executable audit entrypoints in the command surface.',
];
state.blockers = [
  ...(gapRecords.some((gap) => gap.route === '/work/xr') ? ['XR remains blocked by an open deterministic geometry gap.'] : []),
  ...(runtime.press_go ? [] : ['Press-go remains false until supervised and guarded autonomy proofs are complete.']),
];

writeGgdState(state);
writeStateMarkdown(state);

console.log(
  JSON.stringify(
    {
      synced: true,
      route_status: state.route_status,
      gap_count: state.gap_records.length,
      bundle_count: state.verification_bundle_index.bundle_count,
      augmentation_count: state.augmentation_backlog.length,
    },
    null,
    2,
  ),
);
