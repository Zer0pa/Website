#!/usr/bin/env node

import { localTimestamp, readJson } from './lib/control-plane.mjs';
import { evaluateRouteGate, loadGapRecords, readGgdState, routeRoleForRoute, writeGgdState, writeStateMarkdown } from './lib/ggd.mjs';

const state = readGgdState();
const runtime = readJson('CLAW/control-plane/state/runtime-state.json');
const binding = readJson('GGD/project.binding.json');
const bundles = readJson('GGD/verification/bundles.json');
const augmentationBacklog = readJson('GGD/augmentations/augmentation-backlog.json').items || [];
const gapRecords = loadGapRecords();
const xrGate = evaluateRouteGate('integration', '/work/xr');
const ftGate = evaluateRouteGate('integration', '/work/ft');

const routeStatus = {
  '/': {
    role: routeRoleForRoute('/'),
    status: runtime.gates?.p1_homepage_canonical ? 'canonical' : 'in-progress',
    summary: runtime.gates?.p1_homepage_canonical ? 'homepage accepted through canonical closure' : 'homepage not yet canonical',
  },
  '/imc': {
    role: routeRoleForRoute('/imc'),
    status: runtime.gates?.p2_imc_canonical ? 'canonical' : 'in-progress',
    summary: runtime.gates?.p2_imc_canonical ? 'flagship IMC accepted through canonical closure' : 'IMC not yet canonical',
  },
  '/work/xr': {
    role: routeRoleForRoute('/work/xr'),
    status: xrGate.blocking_gaps.length > 0 ? 'blocked' : 'unknown',
    summary: xrGate.blocking_gaps[0]?.summary || 'XR gap not yet exported',
  },
  '/work/ft': {
    role: routeRoleForRoute('/work/ft'),
    status: ftGate.blocking_gaps.length > 0 ? 'blocked' : 'pending-proof',
    summary: ftGate.blocking_gaps[0]?.summary || 'FT replication proof still pending',
  },
};

state.project_reference.project_md_updated = localTimestamp().slice(0, 10);
state.project_reference.current_focus =
  'Propagate the GGD contract into active lane worktrees, require geometry-law evidence in lane execution, and resume route-family closure under one horizon program.';
state.position.current_phase = '4';
state.position.current_phase_name = 'Propagate contract and promote geometry-law evidence';
state.position.current_plan = 'lane-contract-propagation';
state.position.status = 'in_progress';
state.position.last_activity = localTimestamp();
state.position.last_activity_desc =
  'Established the horizon program, promoted geometry-law evidence into lane contracts, and began contract propagation into active worktrees.';
state.position.progress_percent = 68;
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
  'Propagate the current GGD/CLAW contract commits into the active lane worktrees.',
  'Run contract-readiness verification after worktree propagation.',
  'Resume XR closure under the stronger geometry-law contract.',
  'Add explicit FT route-gap export once the first FT falsification exists.',
  'Expose the named bundle entrypoints directly in the ggd-* command surface.',
];
state.blockers = [
  ...(xrGate.blocking_gaps.length > 0 ? ['XR remains blocked by an open deterministic geometry gap.'] : []),
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
