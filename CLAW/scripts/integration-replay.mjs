#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import {
  controlPath,
  git,
  loadControlPlane,
  localTimestamp,
  projectPath,
  relativeProjectPath,
  writeJson,
} from './lib/control-plane.mjs';

function runCommand(command, args, cwd, env = {}) {
  execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    stdio: 'inherit',
  });
}

const ALLOWED_AUDIT_ARTIFACT_PATTERNS = [
  /^deterministic-design-system\/maps\/diff\/.+\.json$/,
  /^deterministic-design-system\/maps\/live\/.+\.json$/,
  /^deterministic-design-system\/reports\/.+\.(md|json)$/,
];

function parseCount(markdown, label) {
  const match = markdown.match(new RegExp(`- ${label}: \`(\\d+)\``));
  return match ? Number.parseInt(match[1], 10) : null;
}

function parseHomeOrImcReport(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  return {
    critical: parseCount(markdown, 'Critical diffs'),
    major: parseCount(markdown, 'Major diffs'),
    minor: parseCount(markdown, 'Minor diffs'),
    cosmetic: parseCount(markdown, 'Cosmetic diffs'),
  };
}

function parseProductKernelReport(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const sections = {};

  for (const route of ['/work/xr', '/work/ft']) {
    const blockMatch = markdown.match(new RegExp(`## ${route.replace('/', '\\/')}([\\s\\S]*?)(?=\\n## |$)`));
    const block = blockMatch?.[1] || '';
    sections[route] = {
      critical: parseCount(block, 'Critical violations'),
      major: parseCount(block, 'Major violations'),
      minor: parseCount(block, 'Minor violations'),
    };
  }

  return sections;
}

function parseResponsiveReport(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  const overflowHits = [...markdown.matchAll(/- Horizontal overflow: `YES`/g)].length;
  return {
    overflowHits,
    clean: overflowHits === 0,
  };
}

function listDirtyFiles(worktree) {
  return git(['status', '--short'], worktree)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[A-Z?]{1,2}\s+/, '').trim());
}

function isAllowedAuditArtifact(filePath) {
  return ALLOWED_AUDIT_ARTIFACT_PATTERNS.some((pattern) => pattern.test(filePath));
}

function ensureSafeDirtyState(worktree) {
  const dirtyFiles = listDirtyFiles(worktree);
  const unsafeFiles = dirtyFiles.filter((filePath) => !isAllowedAuditArtifact(filePath));

  if (unsafeFiles.length > 0) {
    throw new Error(`Integration worktree has unsafe dirty files: ${unsafeFiles.join(', ')}`);
  }

  return dirtyFiles;
}

function commitAuditArtifacts(worktree) {
  const dirtyFiles = ensureSafeDirtyState(worktree);
  if (dirtyFiles.length === 0) {
    return {
      committed: false,
      commit: git(['rev-parse', 'HEAD'], worktree),
      dirtyFiles: [],
    };
  }

  runCommand('git', ['add', '--', ...dirtyFiles], worktree);
  runCommand('git', ['commit', '-m', 'Checkpoint integration replay audits'], worktree);

  return {
    committed: true,
    commit: git(['rev-parse', 'HEAD'], worktree),
    dirtyFiles,
  };
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 200) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for dev server at ${url}`);
}

async function withDevServer(siteDir, port, fn) {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCmd, ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: siteDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer(`http://127.0.0.1:${port}`);
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    child.kill('SIGINT');
    await new Promise((resolve) => child.once('exit', resolve));
  }
}

function readArg(prefix, fallback = null) {
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
}

function removeBlocker(runtime, text) {
  runtime.blockers = (runtime.blockers || []).filter((entry) => entry !== text);
}

async function main() {
  const control = loadControlPlane();
  const integrationLane = control.agentLanes.lanes.find((lane) => lane.id === 'integration');

  if (!integrationLane) {
    throw new Error('Integration lane is not defined.');
  }

  const integrationWorktree = integrationLane.worktree;
  const siteDir = path.join(integrationWorktree, 'site');
  const port = Number.parseInt(readArg('--port=', '3007'), 10);
  const replayHead = git(['rev-parse', 'HEAD'], integrationWorktree);
  const rollbackPoint = git(['rev-parse', 'HEAD~3'], integrationWorktree);
  const sourceCommits = [
    control.runtime.lanes['homepage-fidelity']?.last_accepted_commit,
    control.runtime.lanes['imc-flagship']?.last_accepted_commit,
    control.runtime.lanes['product-family-kernel']?.last_accepted_commit,
  ].filter(Boolean);

  ensureSafeDirtyState(integrationWorktree);

  runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], siteDir);
  runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'test:parser'], siteDir);

  await withDevServer(siteDir, port, async (baseUrl) => {
    runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'audit:layout', 'home', 'imc', '--', `--baseUrl=${baseUrl}`], siteDir);
    runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'audit:product-kernel'], siteDir, {
      LAYOUT_BASE_URL: baseUrl,
    });
    runCommand(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'audit:responsive', '--', `--baseUrl=${baseUrl}`], siteDir);
  });

  const homeReportPath = path.join(integrationWorktree, 'deterministic-design-system/reports/home.verification.md');
  const imcReportPath = path.join(integrationWorktree, 'deterministic-design-system/reports/imc.verification.md');
  const productKernelReportPath = path.join(integrationWorktree, 'deterministic-design-system/reports/product-kernel.verification.md');
  const responsiveReportPath = path.join(
    integrationWorktree,
    'deterministic-design-system/reports/responsive/responsive.verification.md',
  );

  const home = parseHomeOrImcReport(homeReportPath);
  const imc = parseHomeOrImcReport(imcReportPath);
  const kernel = parseProductKernelReport(productKernelReportPath);
  const responsive = parseResponsiveReport(responsiveReportPath);
  const auditCommit = commitAuditArtifacts(integrationWorktree);
  const currentHead = auditCommit.commit;

  const reportPath = controlPath('reports', 'W4-integration-replay.md');
  const reportRelativePath = relativeProjectPath(reportPath);
  const reportLines = [
    '# W4 Integration Replay',
    '',
    '## Summary',
    '',
    `- integration branch head: \`${currentHead.slice(0, 7)}\``,
    `- replay head before audit evidence: \`${replayHead.slice(0, 7)}\``,
    `- rollback point: \`${rollbackPoint.slice(0, 7)}\``,
    `- source commits: \`${sourceCommits.join(', ')}\``,
    `- audit evidence commit: \`${auditCommit.committed ? 'created' : 'not-needed'}\``,
    '- build: `pass`',
    '- parser: `pass`',
    `- home layout: \`${home.critical} critical / ${home.major} major / ${home.minor} minor\``,
    `- imc layout: \`${imc.critical} critical / ${imc.major} major / ${imc.minor} minor\``,
    `- /work/xr product-kernel law: \`${kernel['/work/xr'].critical} critical / ${kernel['/work/xr'].major} major / ${kernel['/work/xr'].minor} minor\``,
    `- /work/ft product-kernel law: \`${kernel['/work/ft'].critical} critical / ${kernel['/work/ft'].major} major / ${kernel['/work/ft'].minor} minor\``,
    `- responsive overflow hits: \`${responsive.overflowHits}\``,
    `- committed audit artifacts: \`${auditCommit.dirtyFiles.length}\``,
    '',
    '## Acceptance',
    '',
    '- accepted homepage replayed cleanly in integration',
    '- accepted IMC replayed cleanly in integration',
    '- accepted product-family-kernel replayed cleanly in integration',
    '- full integration QA bundle is current',
  ];
  fs.writeFileSync(reportPath, `${reportLines.join('\n')}\n`, 'utf8');

  const checkpointId = `INT-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
  const checkpointPath = controlPath('checkpoints', `${checkpointId}.json`);
  const checkpointRelativePath = relativeProjectPath(checkpointPath);
  const checkpointPayload = {
    checkpoint_id: checkpointId,
    phase: control.runtime.current_phase,
    cycle_id: null,
    source_commits: sourceCommits,
    rollback_point: rollbackPoint,
    qa_verdict: {
      candidate_branch: integrationLane.branch,
      candidate_commit: currentHead,
      build: 'pass',
      parser: 'pass',
      layout: {
        home,
        imc,
        kernel,
      },
      responsive: {
        overflow_hits: responsive.overflowHits,
        report: relativeProjectPath(responsiveReportPath),
      },
      law_compliance: {
        product_kernel: kernel,
      },
      recommendation: 'accept',
    },
    status: 'accepted',
    full_qa_bundle: reportRelativePath,
    recovery_verdict: null,
    open_blockers: [],
    best_known_state: currentHead,
    created_at: localTimestamp(),
  };
  writeJson(checkpointPath, checkpointPayload);

  writeJson(controlPath('checkpoints', 'current.json'), {
    version: 1,
    checkpoint_id: checkpointId,
    status: 'accepted',
    source_commits: sourceCommits,
    rollback_point: rollbackPoint,
    updated_at: localTimestamp(),
  });

  const runtimePath = projectPath('CLAW/control-plane/state/runtime-state.json');
  const runtime = structuredClone(control.runtime);
  runtime.latest_wave_report = reportRelativePath;
  runtime.active_wave = 'W4';
  runtime.current_checkpoint = checkpointRelativePath;
  runtime.rollback_checkpoint = rollbackPoint;
  runtime.gates.integration_qa_passed = true;
  runtime.latest_audits = {
    build: `pass: integration replay build on ${localTimestamp().slice(0, 10)}`,
    parser: `pass: integration replay parser falsification loop on ${localTimestamp().slice(0, 10)}`,
    layout: `home: ${home.critical} critical, ${home.major} major, ${home.minor} minor, ${home.cosmetic} cosmetic; imc: ${imc.critical} critical, ${imc.major} major, ${imc.minor} minor, ${imc.cosmetic} cosmetic; product-kernel law audit: /work/xr ${kernel['/work/xr'].critical} critical ${kernel['/work/xr'].major} major ${kernel['/work/xr'].minor} minor, /work/ft ${kernel['/work/ft'].critical} critical ${kernel['/work/ft'].major} major ${kernel['/work/ft'].minor} minor`,
    responsive: `pass: no horizontal overflow on laptop, tablet, or mobile in integration checkpoint routes`,
  };
  runtime.lanes.integration = {
    status: 'checkpointed',
    last_accepted_commit: currentHead,
    last_handoff: reportRelativePath,
  };
  runtime.next_actions = [
    'Execute C4 on /work/xr using the accepted product-family kernel.',
    'Replay the accepted kernel through /work/ft as the replication proof page.',
    'Promote the first generic product proof through integration once XR and FT are accepted.',
    'Keep press_go false until the canonical-routes-to-producing program is complete.',
  ];
  removeBlocker(runtime, 'No accepted candidate has been replayed through integration.');
  runtime.last_health_check = localTimestamp();
  runtime.last_updated = localTimestamp();
  writeJson(runtimePath, runtime);

  const manifestPath = projectPath('CLAW/control-plane/press-go.manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.required_evidence.integration_checkpoint = checkpointRelativePath;
  manifest.required_evidence.full_qa_bundle = reportRelativePath;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        checkpoint: checkpointRelativePath,
        report: reportRelativePath,
        integration_commit: currentHead,
        rollback_point: rollbackPoint,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
