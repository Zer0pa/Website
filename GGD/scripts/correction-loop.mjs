#!/usr/bin/env node
/**
 * M5: Correction Loop Runner
 * Orchestrates: evaluate lawsets → generate tokens → build → compile fixes → report.
 */
import { readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { evaluateLawset } from './evaluate-lawset.mjs';

const __filename = decodeURIComponent(new URL(import.meta.url).pathname);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');
const LAWSETS_DIR = resolve(__dirname, '../equations/lawsets');
const SITE_DIR = resolve(ROOT, 'site');

function log(msg) { process.stderr.write(`[correction-loop] ${msg}\n`); }

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
  } catch (err) {
    return { error: true, message: err.message, stderr: err.stderr || '', stdout: err.stdout || '' };
  }
}

async function main() {
  const startTime = Date.now();
  const report = {
    version: 1,
    started_at: new Date().toISOString(),
    steps: [],
    success: false,
  };

  // ── Step 1: Evaluate all lawsets ──
  log('Step 1: Evaluating all lawsets...');
  const lawsetFiles = readdirSync(LAWSETS_DIR).filter(f => f.endsWith('.json'));
  const evaluations = {};
  let totalConstraints = 0;
  let passedConstraints = 0;
  let failedConstraints = 0;

  for (const file of lawsetFiles) {
    const filePath = resolve(LAWSETS_DIR, file);
    const result = evaluateLawset(filePath);
    evaluations[result.id] = result;
    for (const c of result.constraint_results) {
      totalConstraints++;
      if (c.passed) passedConstraints++;
      else failedConstraints++;
    }
  }

  report.steps.push({
    step: 'evaluate_lawsets',
    status: 'ok',
    lawsets_evaluated: lawsetFiles.length,
    total_constraints: totalConstraints,
    passed: passedConstraints,
    failed: failedConstraints,
  });
  log(`  ${lawsetFiles.length} lawsets, ${passedConstraints}/${totalConstraints} constraints pass`);

  // ── Step 2: Generate tokens ──
  log('Step 2: Generating CSS tokens...');
  const tokenResult = run(`node "${resolve(__dirname, 'generate-tokens.mjs')}"`, { cwd: ROOT });
  if (tokenResult && tokenResult.error) {
    report.steps.push({ step: 'generate_tokens', status: 'error', message: tokenResult.message });
    log(`  ERROR: ${tokenResult.message}`);
  } else {
    report.steps.push({ step: 'generate_tokens', status: 'ok' });
    log('  Tokens generated.');
  }

  // ── Step 3: Build verification ──
  log('Step 3: Verifying build...');
  const buildResult = run('npm run build', { cwd: SITE_DIR, timeout: 120000 });
  if (buildResult && buildResult.error) {
    report.steps.push({ step: 'build', status: 'error', message: 'npm run build failed' });
    log('  ERROR: Build failed. Stopping.');
    report.finished_at = new Date().toISOString();
    report.duration_ms = Date.now() - startTime;
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  } else {
    report.steps.push({ step: 'build', status: 'ok' });
    log('  Build succeeded.');
  }

  // ── Step 4: Compile fixes ──
  log('Step 4: Compiling fix manifests...');
  const fixResult = run(`node "${resolve(__dirname, 'compile-fixes.mjs')}"`, { cwd: ROOT });
  if (fixResult && fixResult.error) {
    report.steps.push({ step: 'compile_fixes', status: 'error', message: fixResult.message });
    log(`  ERROR: ${fixResult.message}`);
  } else {
    // Count fix manifests
    const fixesDir = resolve(__dirname, '../fixes');
    let fixCount = 0;
    try {
      fixCount = readdirSync(fixesDir).filter(f => f.endsWith('.fix-manifest.json')).length;
    } catch { /* dir may not exist */ }
    report.steps.push({ step: 'compile_fixes', status: 'ok', manifests_written: fixCount });
    log(`  ${fixCount} fix manifest(s) written.`);
  }

  // ── Step 5: Summary ──
  report.success = report.steps.every(s => s.status === 'ok');
  report.finished_at = new Date().toISOString();
  report.duration_ms = Date.now() - startTime;
  report.constraint_summary = {
    total: totalConstraints,
    passed: passedConstraints,
    failed: failedConstraints,
    pass_rate: totalConstraints > 0 ? Math.round((passedConstraints / totalConstraints) * 1000) / 10 : 0,
  };

  // Write report
  const reportDir = resolve(__dirname, '../fixes');
  mkdirSync(reportDir, { recursive: true });
  const reportPath = resolve(reportDir, 'correction-cycle-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  log(`\nCorrection cycle ${report.success ? 'PASSED' : 'COMPLETED WITH ISSUES'} in ${report.duration_ms}ms`);
  log(`Constraints: ${passedConstraints}/${totalConstraints} (${report.constraint_summary.pass_rate}%)`);

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
