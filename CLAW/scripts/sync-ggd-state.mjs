#!/usr/bin/env node

import { fileExists, localTimestamp, readJson } from './lib/control-plane.mjs';
import { evaluateRouteGate, loadGapRecords, readGgdState, routeRoleForRoute, writeGgdState, writeStateMarkdown } from './lib/ggd.mjs';

const state = readGgdState();
const runtime = readJson('CLAW/control-plane/state/runtime-state.json');
const binding = readJson('GGD/project.binding.json');
const bundles = readJson('GGD/verification/bundles.json');
const augmentationBacklog = readJson('GGD/augmentations/augmentation-backlog.json').items || [];
const gapRecords = loadGapRecords();
const systemsOptimizerState = readJson(binding.system_optimizer?.state || 'CLAW/control-plane/system-optimizer/state.json');
const systemsOptimizerBacklog = readJson(binding.system_optimizer?.backlog || 'CLAW/control-plane/system-optimizer/backlog.json');
const routeProgressReportPath = 'CLAW/control-plane/reports/route-progress.latest.json';
const routeProgressReport = fileExists(routeProgressReportPath) ? readJson(routeProgressReportPath) : null;
const routeProgressByRoute = new Map((routeProgressReport?.routes || []).map((entry) => [entry.route, entry]));
const xrGate = evaluateRouteGate('integration', '/work/xr');
const ftGate = evaluateRouteGate('integration', '/work/ft');

function withProgress(route, payload) {
  const progress = routeProgressByRoute.get(route);
  if (!progress) {
    return payload;
  }

  return {
    ...payload,
    progress_percent: progress.progress_percentage,
    progress_confidence: progress.progress_confidence,
    progress_source: routeProgressReportPath,
  };
}

const routeStatus = {
  '/': withProgress('/', {
    role: routeRoleForRoute('/'),
    status: runtime.gates?.p1_homepage_canonical ? 'canonical' : 'in-progress',
    summary: runtime.gates?.p1_homepage_canonical ? 'homepage accepted through canonical closure' : 'homepage not yet canonical',
  }),
  '/imc': withProgress('/imc', {
    role: routeRoleForRoute('/imc'),
    status: runtime.gates?.p2_imc_canonical ? 'canonical' : 'in-progress',
    summary: runtime.gates?.p2_imc_canonical ? 'flagship IMC accepted through canonical closure' : 'IMC not yet canonical',
  }),
  '/work/xr': withProgress('/work/xr', {
    role: routeRoleForRoute('/work/xr'),
    status: xrGate.blocking_gaps.length > 0 ? 'blocked' : 'unknown',
    summary: xrGate.blocking_gaps[0]?.summary || 'XR gap not yet exported',
  }),
  '/work/ft': withProgress('/work/ft', {
    role: routeRoleForRoute('/work/ft'),
    status: ftGate.blocking_gaps.length > 0 ? 'blocked' : 'pending-proof',
    summary: ftGate.blocking_gaps[0]?.summary || 'FT replication proof still pending',
  }),
};

state.project_reference.project_md_updated = localTimestamp().slice(0, 10);
state.project_reference.current_focus =
  'Reduce route and system truth from artifacts, keep gap export honest, and push route-family verification closer to equation-native acceptance.';
state.position.current_phase = '4';
state.position.current_phase_name = 'Propagate contract and promote geometry-law evidence';
state.position.current_plan = 'lane-contract-propagation';
state.position.status = 'in_progress';
state.position.last_activity = localTimestamp();
state.position.last_activity_desc =
  'Established executable route progress reduction, exported missing FT gap state, and tightened the contract surfaces around contradiction-aware truth.';
state.position.progress_percent = Number(routeProgressReport?.overall_progress_percentage || 68);
state.command_binding = {
  command_namespace: binding.command_namespace,
  binding_file: binding.binding_file,
  command_surface: binding.command_surface,
  verification_bundle_index: binding.verification_bundle_index,
  gap_dir: binding.gap_dir,
  sync_script: binding.scripts.sync_state,
  export_gap_script: binding.scripts.export_gap,
  verify_binding_script: binding.scripts.verify_binding,
  source_root: binding.external_surface?.source_root || null,
  skills_dir: binding.external_surface?.skills_dir || null,
  agents_dir: binding.external_surface?.agents_dir || null,
  command_catalog: binding.external_surface?.command_catalog || null,
  agent_catalog: binding.external_surface?.agent_catalog || null,
  function_catalog: binding.external_surface?.function_catalog || null,
  equation_engine: binding.external_surface?.equation_engine || null,
  example_lawset: binding.external_surface?.example_lawset || null,
  local_lawset_index: binding.equation_surface?.local_lawset_index || null,
  route_progress_script: 'CLAW/scripts/compute-route-progress.mjs',
  route_progress_report: routeProgressReportPath,
};
state.route_status = routeStatus;
state.route_progress = routeProgressReport
  ? {
      report_file: routeProgressReportPath,
      generated_at: routeProgressReport.generated_at,
      overall_progress_percentage: routeProgressReport.overall_progress_percentage,
      contrast_truth: routeProgressReport.contrast_truth,
      routes: routeProgressReport.routes,
    }
  : null;
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
  'Expose the named bundle entrypoints directly in the ggd-* command surface.',
  'Quarantine contaminated handoffs before they can feed authoritative gap records.',
  'Split shared responsive and contrast artifacts into route-and-cycle-keyed evidence.',
  'Convert recurring XR/product-family rejections into accepted system-level ratchets or explicitly discarded hypotheses.',
  'Keep the systems-optimizer backlog current and measurable.',
];
state.blockers = [
  ...(xrGate.blocking_gaps.length > 0 ? ['XR remains blocked by an open deterministic geometry gap.'] : []),
  ...(ftGate.blocking_gaps.length > 0 ? ['FT remains blocked by open deterministic geometry and breakpoint gap evidence.'] : []),
  ...(runtime.press_go ? [] : ['Press-go remains false until supervised and guarded autonomy proofs are complete.']),
];
state.system_optimizer = {
  command: binding.system_optimizer?.optimizer_command || 'ggd-system-optimize',
  agent: binding.system_optimizer?.optimizer_agent || 'ggd-systems-optimizer',
  state_file: binding.system_optimizer?.state || null,
  backlog_file: binding.system_optimizer?.backlog || null,
  evaluation_script: binding.system_optimizer?.evaluation_script || null,
  backlog_count: (systemsOptimizerBacklog.items || []).length,
  active_hypothesis: systemsOptimizerState.active_hypothesis || null,
  last_kept_change: systemsOptimizerState.last_kept_change || null,
  keep_only_if_better: Boolean(systemsOptimizerState.policy?.keep_only_if_better),
};

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
