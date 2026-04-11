<p align="center">
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE-FT Masthead" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-SAL%20v6.0-e5e7eb?labelColor=111111" alt="License: SAL v6.0"></a>
  <a href="pyproject.toml"><img src="https://img.shields.io/badge/python-%3E%3D3.11-e5e7eb?labelColor=111111" alt="Python >=3.11"></a>
  <a href="proofs/FINAL_STATUS.md"><img src="https://img.shields.io/badge/release%20posture-NOT__PUBLIC__READY-e5e7eb?labelColor=111111" alt="Release posture: NOT_PUBLIC_READY"></a>
  <a href="proofs/CONSOLIDATED_PROOF_REPORT.md"><img src="https://img.shields.io/badge/controlled%20proof-2026--02--21%20Wave--1-e5e7eb?labelColor=111111" alt="Controlled proof: 2026-02-21 Wave-1"></a>
  <a href="proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json"><img src="https://img.shields.io/badge/phase%2006-BLOCKED__MISSING__INPUTS-e5e7eb?labelColor=111111" alt="Phase 06: BLOCKED_MISSING_INPUTS"></a>
</p>
<p align="center">
  <a href="docs/AUDITOR_PLAYBOOK.md"><img src="https://img.shields.io/badge/quick%20audit-playbook%20%2B%20limits-e5e7eb?labelColor=111111" alt="Quick audit: playbook and limits"></a>
  <a href="docs/ARCHITECTURE.md"><img src="https://img.shields.io/badge/architecture-runtime%20%2B%20proof%20map-e5e7eb?labelColor=111111" alt="Architecture: runtime and proof map"></a>
  <a href="proofs/"><img src="https://img.shields.io/badge/proof%20anchors-logs%20%2B%20bundles-e5e7eb?labelColor=111111" alt="Proof anchors: logs and bundles"></a>
  <a href="docs/INTEGRATION_PATTERN.md"><img src="https://img.shields.io/badge/observability-Comet%20tracking%20hooks-e5e7eb?labelColor=111111" alt="Observability: Comet tracking hooks"></a>
  <a href="pyproject.toml"><img src="https://img.shields.io/badge/native%20helper-optional-e5e7eb?labelColor=111111" alt="Native helper: optional"></a>
  <a href="https://github.com/Zer0pa/ZPE-FT"><img src="https://img.shields.io/badge/public%20repo-source--available%20snapshot-e5e7eb?labelColor=111111" alt="Public repo: source-available snapshot"></a>
</p>
<table align="center" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="25%"><a href="#quickstart-and-license"><img src=".github/assets/readme/nav/quickstart-and-license.svg" alt="Quickstart & License" width="100%"></a></td>
    <td width="25%"><a href="#what-this-is"><img src=".github/assets/readme/nav/what-this-is.svg" alt="What This Is" width="100%"></a></td>
    <td width="25%"><a href="#current-authority"><img src=".github/assets/readme/nav/current-authority.svg" alt="Current Authority" width="100%"></a></td>
    <td width="25%"><a href="#runtime-proof-wave-1"><img src=".github/assets/readme/nav/runtime-proof.svg" alt="Runtime Proof" width="100%"></a></td>
  </tr>
  <tr>
    <td width="25%"><a href="#modality-status-snapshot"><img src=".github/assets/readme/nav/modality-snapshot.svg" alt="Surface Status Snapshot" width="100%"></a></td>
    <td width="25%"><a href="#throughput"><img src=".github/assets/readme/nav/throughput.svg" alt="Throughput" width="100%"></a></td>
    <td width="25%"><a href="#public-ml-workbooks"><img src=".github/assets/readme/nav/public-ml-workbooks.svg" alt="Public Market Workbooks" width="100%"></a></td>
    <td width="25%"><a href="#go-next"><img src=".github/assets/readme/nav/go-next.svg" alt="Go Next" width="100%"></a></td>
  </tr>
</table>

---

## Overview

ZPE-FT is a deterministic financial time-series codec — OHLCV bars, tick streams, pattern search, and market replay in a single compressed format. Built for teams that need to store, query, and replay delayed-feed market data with bounded fidelity guarantees and no incumbent lock-in.

The current evidence is anchored on the Wave-1 controlled proof surface (February 21, 2026). Repo-local install verifies and the pytest surface passes. Phase 06 contract freeze is blocked on missing inputs — an engineering boundary, not a capability failure. Comet observability hooks are wired for proof tracking. An optional Rust native helper provides a lower-level fallback path.

The repo is **private-stage**. This is a source-available snapshot with retained evidence — not a release-ready package. The public release gate is not closed.

**Not claimed:** public release readiness, broad incumbent displacement, full contract freeze, universal financial data coverage, or runtime coupling to ZPE-IMC.

| Anchor | Artifact |
|---|---|
| Final status | [`FINAL_STATUS.md`](proofs/FINAL_STATUS.md) |
| Controlled proof report | [`CONSOLIDATED_PROOF_REPORT.md`](proofs/CONSOLIDATED_PROOF_REPORT.md) |
| Phase 06 blocked status | [`missing_inputs_packet.json`](proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json) |

---

<a id="quickstart-and-license"></a>
## Quick Start

### Quick Verify

The steps below verify the current repository surface. They are not a claim
that the public-release gate is closed.

```bash
git clone https://github.com/Zer0pa/ZPE-FT.git
cd ZPE-FT
python -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install -e .
python - <<'PY'
import zpe_finance
from zpe_finance.rust_bridge import rust_version
print("exports", sorted(zpe_finance.__all__))
print("rust_bridge", rust_version())
PY
```

After a successful run you should see:

- the package imports cleanly from the repo root
- the exported surface comes from `python/zpe_finance/`
- `rust_bridge` truthfully reports `python-fallback` unless you explicitly
  build the optional helper under `core/`
- shipped install and pytest evidence remains at
  `proofs/artifacts/operations/20260321T202948Z_build.log`,
  `proofs/artifacts/operations/20260321T202948Z_clean_install_verify.log`,
  and `proofs/artifacts/operations/20260321T202948Z_pytest_alignment.log`

Quickest outsider orientation:

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top" align="center"><a href="docs/AUDITOR_PLAYBOOK.md"><code>docs/AUDITOR_PLAYBOOK.md</code></a></td>
    <td width="33%" valign="top" align="center"><a href="docs/PUBLIC_AUDIT_LIMITS.md"><code>docs/PUBLIC_AUDIT_LIMITS.md</code></a></td>
    <td width="34%" valign="top" align="center"><a href="docs/ARCHITECTURE.md"><code>docs/ARCHITECTURE.md</code></a></td>
  </tr>
</table>

### License Boundary

- Free to use at or below USD 100M annual gross revenue under SAL v6.0.
- SPDX tag: <code>LicenseRef-Zer0pa-SAL-6.0</code>.
- Commercial or hosted use above that threshold requires contact at
  <a href="mailto:architects@zer0pa.ai">architects@zer0pa.ai</a>.
- `LICENSE` is the legal source of truth; `CHANGELOG.md` and `CITATION.cff`
  are release metadata, not substitute license terms.

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.4.gif" alt="ZPE-FT Upper Insert" width="100%">
</p>

<a id="what-this-is"></a>
## What This Is

ZPE-FT is a deterministic financial time-series codec and pattern-search
workstream. The repo exposes an installable Python package, an optional
repo-local Rust helper, retained proof bundles for controlled Wave-1 codec
claims, and explicit blocker artifacts for the still-open enterprise benchmark.

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="26%">Question</th>
      <th align="left" width="74%">Answer</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">What is this?</td>
      <td valign="top">A source-available repo for a financial time-series codec, query surface, and proof packet. It is real software with retained evidence, not a marketing shell.</td>
    </tr>
    <tr>
      <td valign="top">What is the current authority state?</td>
      <td valign="top">Three surfaces matter: shipped package/build/install evidence, the retained controlled Wave-1 codec bundle, and the current Phase 06 blocker packet for the open-access enterprise benchmark.</td>
    </tr>
    <tr>
      <td valign="top">What is actually proved?</td>
      <td valign="top">The repo-native package path works, the carried Wave-1 bundle supports bounded codec/search claims on the controlled corpus, and the delayed-feed acquisition/freeze/refresh path is real on a bounded SPY/AAPL smoke.</td>
    </tr>
    <tr>
      <td valign="top">What is not being claimed?</td>
      <td valign="top">No claim of public-release readiness, open-access enterprise benchmark closure, Timescale equivalence, or broad incumbent displacement.</td>
    </tr>
    <tr>
      <td valign="top">Where should an outsider start?</td>
      <td valign="top">Clone from <code>https://github.com/Zer0pa/ZPE-FT.git</code>, run the quick verify steps above, then read <code>docs/AUDITOR_PLAYBOOK.md</code>, <code>docs/PUBLIC_AUDIT_LIMITS.md</code>, and <code>proofs/FINAL_STATUS.md</code> together.</td>
    </tr>
  </tbody>
</table>

| Field | Value |
|-------|-------|
| Architecture | MARKET_STREAM |
| Encoding | OHLCV_DELTA |

## Key Metrics

| Metric | Value | Baseline | Tag |
|--------|-------|----------|-----|
| Compression | 5.94–10.9× | Parquet+ZSTD ~3–5× | PUBLIC_MARKET |
| Query Latency | 0.70 ms | 43.9 ms (baseline) | P95_SPY |
| Tick RMSE | 0.0 | — | LOSSLESS |
| Datasets | 3 public | — | YAHOO_BINANCE_KAGGLE |

## What We Prove

- 8-state ordinal alphabet encodes market moves as directional primitives
- Compressed-domain pattern search operates without decompression
- Deterministic tick-level reconstruction verified as lossless (0.0 RMSE)
- Bounded benchmark across 3 public datasets (Yahoo, Binance, Kaggle)
- Repo-local install, pytest surface, and Comet observability hooks wired

## What We Don't Claim

- No claim of public release readiness
- No claim of Phase 06 contract closure (blocked on missing inputs)
- No claim of real-time trading system integration
- No claim of regulatory compliance (market data use)

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.5.gif" alt="ZPE-FT Lower Insert" width="100%">
</p>

<a id="current-authority"></a>
## Commercial Readiness

| Field | Value |
|-------|-------|
| Verdict | BLOCKED_MISSING_INPUTS |
| Commit SHA | 7394b4bd04e0 |
| Confidence | 67% |
| Source | proofs/FINAL_STATUS.md |

`Confidence` derives from `4` PASS outcomes across `6` named retained checks in `proofs/FINAL_STATUS.md` and `proofs/CONSOLIDATED_PROOF_REPORT.md`.

## Tests and Verification

| Code | Check | Verdict |
|------|-------|---------|
| V_01 | Package build / install / import truth | PASS |
| V_02 | FT-C001 OHLCV compression | PASS |
| V_03 | FT-C002 tick compression | PASS |
| V_04 | FT-C004 pattern search | PASS |
| V_05 | Phase 06 contract freeze | FAIL |
| V_06 | DB breadth beyond SQLite | INC |

### Authority Notes

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top">
      <strong>Package / install truth</strong><br>
      <code>SUPPORTED</code><br><br>
      Current build, clean install, import, and pytest alignment logs are
      shipped under <code>proofs/artifacts/operations/</code>.
    </td>
    <td width="33%" valign="top">
      <strong>Controlled codec authority</strong><br>
      <code>2026-02-21_ft_wave1_final</code><br><br>
      Promoted codec/search claims remain tied to the carried Wave-1 controlled
      corpus bundle.
    </td>
    <td width="34%" valign="top">
      <strong>Benchmark gate posture</strong><br>
      <code>BLOCKED_MISSING_INPUTS</code><br><br>
      The open-access enterprise benchmark still lacks `33` named corpus
      exports plus the auditable query catalog and truth labels.
    </td>
  </tr>
</table>

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="24%">Surface</th>
      <th align="left" width="32%">Locked value</th>
      <th align="left" width="44%">Why it matters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Repository URL</td>
      <td valign="top"><code>https://github.com/Zer0pa/ZPE-FT.git</code></td>
      <td valign="top">This is the live public acquisition surface for the workstream.</td>
    </tr>
    <tr>
      <td valign="top">Current controlled bundle</td>
      <td valign="top"><code>proofs/artifacts/2026-02-21_ft_wave1_final/</code></td>
      <td valign="top">The promoted OHLCV, tick, fidelity, query-latency, and SQLite roundtrip claims stay bounded to this carried bundle.</td>
    </tr>
    <tr>
      <td valign="top">Current blocker packet</td>
      <td valign="top"><code>proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json</code></td>
      <td valign="top">This is the sovereign open-access enterprise benchmark truth until the missing inputs exist and a clean freeze/replay closes.</td>
    </tr>
    <tr>
      <td valign="top">Bounded market smoke</td>
      <td valign="top"><code>proofs/reruns/2026-03-19_alpaca_demo_smoke/</code></td>
      <td valign="top">Shows the repo-native delayed-feed acquisition, freeze, and refresh path is real on SPY and AAPL, but does not close the enterprise gate.</td>
    </tr>
    <tr>
      <td valign="top">Current release posture</td>
      <td valign="top"><code>NOT_PUBLIC_READY</code></td>
      <td valign="top">The repo can be cloned and verified, but the release gate remains open.</td>
    </tr>
    <tr>
      <td valign="top">DB posture</td>
      <td valign="top"><code>SQLite supported</code>; <code>Timescale INCONCLUSIVE</code></td>
      <td valign="top">Current DB truth is narrower than general incumbent-displacement claims.</td>
    </tr>
  </tbody>
</table>

<h3 align="center">Three Dimensions Of Authority</h3>

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top">
      <strong>Package Surface</strong><br>
      The install/import/build path is real and auditable from the repo root.
    </td>
    <td width="33%" valign="top">
      <strong>Controlled Codec Evidence</strong><br>
      Performance and pattern-search claims are bounded to the retained Wave-1
      controlled corpus bundle.
    </td>
    <td width="34%" valign="top">
      <strong>Benchmark Honesty</strong><br>
      The repo carries a named blocker packet instead of narrating an unearned
      pass on the open-access enterprise benchmark.
    </td>
  </tr>
</table>

<a id="runtime-proof-wave-1"></a>
## Proof Anchors

All promoted FT values should be read through the package/build/install logs,
the retained controlled Wave-1 bundle, and the blocker packet together.

| Path | State |
|------|-------|
| proofs/FINAL_STATUS.md | VERIFIED |
| proofs/CONSOLIDATED_PROOF_REPORT.md | VERIFIED |
| proofs/artifacts/operations/20260321T202948Z_clean_install_verify.log | VERIFIED |
| proofs/artifacts/2026-02-21_ft_wave1_final/ | VERIFIED |
| proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json | VERIFIED |

### Anchor Details

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="50%" valign="top"><a href="proofs/artifacts/operations/20260321T202948Z_build.log"><code>proofs/artifacts/operations/20260321T202948Z_build.log</code></a><br><br>Build and package preparation proof for the current repo surface.</td>
    <td width="50%" valign="top"><a href="proofs/artifacts/operations/20260321T202948Z_clean_install_verify.log"><code>proofs/artifacts/operations/20260321T202948Z_clean_install_verify.log</code></a><br><br>Clean install and import proof for the public clone path.</td>
  </tr>
  <tr>
    <td width="50%" valign="top"><a href="proofs/artifacts/operations/20260321T202948Z_pytest_alignment.log"><code>proofs/artifacts/operations/20260321T202948Z_pytest_alignment.log</code></a><br><br>Pytest alignment log for the shipped Python package surface.</td>
    <td width="50%" valign="top"><a href="proofs/CONSOLIDATED_PROOF_REPORT.md"><code>proofs/CONSOLIDATED_PROOF_REPORT.md</code></a><br><br>Claim-by-claim reading guide covering bounded codec evidence and unresolved surfaces.</td>
  </tr>
</table>

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="24%">Proof rung</th>
      <th align="left" width="34%">Locked value</th>
      <th align="left" width="42%">What it proves now</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Package / install proof</td>
      <td valign="top"><code>SUPPORTED</code></td>
      <td valign="top">The public clone path installs and imports from the repo surface as documented.</td>
    </tr>
    <tr>
      <td valign="top">Controlled codec bundle</td>
      <td valign="top"><code>2026-02-21_ft_wave1_final</code></td>
      <td valign="top">Carries the promoted OHLCV, tick, fidelity, pattern-search, latency, and SQLite roundtrip claims on the controlled corpus.</td>
    </tr>
    <tr>
      <td valign="top">Delayed-feed market smoke</td>
      <td valign="top"><code>BOUNDED</code></td>
      <td valign="top">Confirms the repo-native acquisition/freeze/refresh path on a two-series sample without upgrading it into authority-bearing market proof.</td>
    </tr>
    <tr>
      <td valign="top">Enterprise benchmark gate</td>
      <td valign="top"><code>BLOCKED_MISSING_INPUTS</code></td>
      <td valign="top">The gate remains open until the named missing exports, query catalog, and truth labels exist.</td>
    </tr>
    <tr>
      <td valign="top">DB breadth</td>
      <td valign="top"><code>SQLite supported</code>; <code>Timescale INCONCLUSIVE</code></td>
      <td valign="top">Current retained evidence does not justify broader Timescale-backed equivalence claims.</td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-2.gif" alt="ZPE-FT Mid Masthead" width="100%">
</p>

<a id="modality-status-snapshot"></a>
## Surface Status Snapshot

Status is reported per evidence surface, not by rhetorical confidence. Each row
below reflects the current retained repo truth.

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="20%">Surface</th>
      <th align="left" width="12%">Status</th>
      <th align="left" width="28%">Proved now</th>
      <th align="left" width="40%">Boundary and evidence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Package / install</td>
      <td valign="top"><code>SUPPORTED</code></td>
      <td valign="top">The repo builds, installs, imports, and clears the retained pytest alignment run.</td>
      <td valign="top">Anchored by the March 21 operations logs under <code>proofs/artifacts/operations/</code>.</td>
    </tr>
    <tr>
      <td valign="top">OHLCV compression</td>
      <td valign="top"><code>SUPPORTED</code></td>
      <td valign="top"><code>19.19x</code> on the carried Wave-1 controlled corpus.</td>
      <td valign="top">Bounded to <code>proofs/artifacts/2026-02-21_ft_wave1_final/ft_ohlcv_benchmark.json</code>.</td>
    </tr>
    <tr>
      <td valign="top">Tick compression</td>
      <td valign="top"><code>SUPPORTED</code></td>
      <td valign="top"><code>20.57x</code> on the carried Wave-1 controlled corpus.</td>
      <td valign="top">Bounded to <code>proofs/artifacts/2026-02-21_ft_wave1_final/ft_tick_benchmark.json</code>.</td>
    </tr>
    <tr>
      <td valign="top">Pattern search</td>
      <td valign="top"><code>SUPPORTED</code></td>
      <td valign="top">Mean <code>P@10 = 0.90</code> on the carried canonical-template workload.</td>
      <td valign="top">Bounded to the controlled bundle; the delayed-feed smoke remains <code>NEEDS_LABELS</code>.</td>
    </tr>
    <tr>
      <td valign="top">Query latency</td>
      <td valign="top"><code>SUPPORTED</code></td>
      <td valign="top">Local query latency <code>p95 = 0.0567 ms</code> on the carried benchmark workload.</td>
      <td valign="top">Current retained evidence is local-bundle truth, not a broad DB displacement claim.</td>
    </tr>
    <tr>
      <td valign="top">Delayed-feed smoke</td>
      <td valign="top"><code>BOUNDED</code></td>
      <td valign="top">The repo-native market data path is real on SPY and AAPL.</td>
      <td valign="top">Bounded by <code>proofs/reruns/2026-03-19_alpaca_demo_smoke/</code>; not authority-bearing market proof.</td>
    </tr>
    <tr>
      <td valign="top">Enterprise benchmark</td>
      <td valign="top"><code>BLOCKED</code></td>
      <td valign="top">A named blocker packet exists instead of a false pass narrative.</td>
      <td valign="top">The governing blocker lives at <code>proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json</code>.</td>
    </tr>
  </tbody>
</table>

<a id="throughput"></a>
## Throughput

Compression, query latency, and pattern-search headlines remain bounded to the
retained Wave-1 controlled corpus. They are useful, but they are not the same
thing as enterprise-market benchmark closure.

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="50%" valign="top">
      <strong>OHLCV compression</strong><br>
      <code>19.19x</code><br><br>
      Current retained controlled-corpus compression anchor.
    </td>
    <td width="50%" valign="top">
      <strong>Tick compression</strong><br>
      <code>20.57x</code><br><br>
      Current retained controlled-corpus tick compression anchor.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Pattern search mean P@10</strong><br>
      <code>0.90</code><br><br>
      Current retained controlled workload retrieval quality.
    </td>
    <td width="50%" valign="top">
      <strong>Query latency p95</strong><br>
      <code>0.0567 ms</code><br><br>
      Current retained local benchmark query latency anchor.
    </td>
  </tr>
</table>

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="24%">Measure</th>
      <th align="left" width="28%">Locked value</th>
      <th align="left" width="48%">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">OHLCV compression</td>
      <td valign="top"><code>19.19x</code></td>
      <td valign="top">Compression on the carried Wave-1 controlled corpus.</td>
    </tr>
    <tr>
      <td valign="top">Tick compression</td>
      <td valign="top"><code>20.57x</code></td>
      <td valign="top">Tick-stream compression on the carried Wave-1 controlled corpus.</td>
    </tr>
    <tr>
      <td valign="top">Max RMSE</td>
      <td valign="top"><code>0.0</code></td>
      <td valign="top">Retained fidelity ceiling on the carried bundle.</td>
    </tr>
    <tr>
      <td valign="top">Pattern search mean P@10</td>
      <td valign="top"><code>0.90</code></td>
      <td valign="top">Controlled canonical-template retrieval quality.</td>
    </tr>
    <tr>
      <td valign="top">Query latency</td>
      <td valign="top"><code>p95 = 0.0567 ms</code></td>
      <td valign="top">Local carried-bundle latency, not a broad warehouse benchmark claim.</td>
    </tr>
    <tr>
      <td valign="top">DB breadth</td>
      <td valign="top"><code>SQLite supported</code>; <code>Timescale INCONCLUSIVE</code></td>
      <td valign="top">Current DB truth remains narrower than full incumbent-comparison narratives.</td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-3.gif" alt="ZPE-FT Lower Masthead" width="100%">
</p>

<a id="public-ml-workbooks"></a>
## Public Market Workbooks

This repo exposes repo-native observability hooks, but it does not currently
promote an external public workbook as an authority-bearing front-door claim.
Use the proof artifacts and docs below as the public evidence path.

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="28%">Role</th>
      <th align="left" width="30%">Surface</th>
      <th align="left" width="42%">Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Lane-local Comet adapter</td>
      <td valign="top"><a href="python/zpe_finance/comet_logging.py"><code>python/zpe_finance/comet_logging.py</code></a></td>
      <td valign="top">Defines the workstream-local Comet project defaults and logging hooks.</td>
    </tr>
    <tr>
      <td valign="top">Dual-tracker observability flow</td>
      <td valign="top"><a href="python/zpe_finance/tracking.py"><code>python/zpe_finance/tracking.py</code></a></td>
      <td valign="top">Carries the verify-or-create tracking pattern for classic Comet and Opik.</td>
    </tr>
    <tr>
      <td valign="top">Observability design note</td>
      <td valign="top"><a href="docs/INTEGRATION_PATTERN.md"><code>docs/INTEGRATION_PATTERN.md</code></a></td>
      <td valign="top">Explains how FT tracking aligns with the broader repo family pattern.</td>
    </tr>
    <tr>
      <td valign="top">Public evidence path</td>
      <td valign="top"><a href="proofs/artifacts/operations/"><code>proofs/artifacts/operations/</code></a></td>
      <td valign="top">Current public-facing proof path for install/build/test reality in this repo.</td>
    </tr>
  </tbody>
</table>

<a id="go-next"></a>
## Go Next

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="38%">If you need to...</th>
      <th align="left" width="62%">Open this</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Audit the current front-door truth quickly</td>
      <td valign="top"><a href="docs/AUDITOR_PLAYBOOK.md"><code>docs/AUDITOR_PLAYBOOK.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Understand the runtime, helper, scripts, and proof layout</td>
      <td valign="top"><a href="docs/ARCHITECTURE.md"><code>docs/ARCHITECTURE.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Read the bounded public audit rules and non-claims</td>
      <td valign="top"><a href="docs/PUBLIC_AUDIT_LIMITS.md"><code>docs/PUBLIC_AUDIT_LIMITS.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Inspect proof posture and claim-by-claim evidence</td>
      <td valign="top"><a href="proofs/FINAL_STATUS.md"><code>proofs/FINAL_STATUS.md</code></a> and <a href="proofs/CONSOLIDATED_PROOF_REPORT.md"><code>proofs/CONSOLIDATED_PROOF_REPORT.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Inspect the current enterprise blocker directly</td>
      <td valign="top"><a href="proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json"><code>proofs/reruns/2026-03-21_phase06_contract_freeze_attempt_v3/missing_inputs_packet.json</code></a></td>
    </tr>
    <tr>
      <td valign="top">Understand integration and observability details</td>
      <td valign="top"><a href="docs/INTEGRATION_PATTERN.md"><code>docs/INTEGRATION_PATTERN.md</code></a></td>
    </tr>
  </tbody>
</table>

## Repo Shape

| Field | Value |
|-------|-------|
| Proof Anchors | 5 |
| Modality Lanes | 2 |
| Authority Source | proofs/FINAL_STATUS.md |

`Modality Lanes` counts the two retained financial data lanes called out in the current proof surface: OHLCV bars and tick streams.

### Directory Map

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="38%">Area</th>
      <th align="left" width="62%">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top"><a href="README.md"><code>README.md</code></a>, <a href="CHANGELOG.md"><code>CHANGELOG.md</code></a>, <a href="CONTRIBUTING.md"><code>CONTRIBUTING.md</code></a>, <a href="SECURITY.md"><code>SECURITY.md</code></a>, <a href="CITATION.cff"><code>CITATION.cff</code></a>, <a href="LICENSE"><code>LICENSE</code></a></td>
      <td valign="top">Root governance, release metadata, and legal terms</td>
    </tr>
    <tr>
      <td valign="top"><a href="python/"><code>python/</code></a>, <a href="core/"><code>core/</code></a>, <a href="scripts/"><code>scripts/</code></a></td>
      <td valign="top">Installable package, optional helper, and repo-local runners</td>
    </tr>
    <tr>
      <td valign="top"><a href="docs/"><code>docs/</code></a></td>
      <td valign="top">Audit, routing, architecture, support, and contract docs</td>
    </tr>
    <tr>
      <td valign="top"><a href="proofs/"><code>proofs/</code></a></td>
      <td valign="top">Controlled bundle, reruns, proof summaries, and historical boundaries</td>
    </tr>
  </tbody>
</table>

<a id="open-risks-non-blocking"></a>
## Open Risks (Non-Blocking)

- The optional native helper is still a deliberate opt-in path; the truthful
  default quick verify may remain on `python-fallback`.
- The delayed-feed March smoke is real but bounded to a two-series sample and
  does not close the enterprise benchmark.
- Timescale-backed DB equivalence remains unresolved.
- The live public repo can tell the truth without being public-release-ready;
  do not collapse those states.
- Historical lineage artifacts may preserve machine-local traces and should be
  read as evidence, not as live front-door instructions.

<a id="contributing-security-support"></a>
## Contributing, Security, Support

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top">Contribution workflow: <a href="CONTRIBUTING.md"><code>CONTRIBUTING.md</code></a></td>
    <td width="33%" valign="top">Security policy and reporting: <a href="SECURITY.md"><code>SECURITY.md</code></a></td>
    <td width="34%" valign="top">Support routing: <a href="docs/SUPPORT.md"><code>docs/SUPPORT.md</code></a></td>
  </tr>
  <tr>
    <td width="33%" valign="top">Frequently asked questions: <a href="docs/FAQ.md"><code>docs/FAQ.md</code></a></td>
    <td colspan="2" width="67%" valign="top">Autonomous agents and AI systems are subject to Section 6 of the <a href="LICENSE">Zer0pa SAL v6.0</a>.</td>
  </tr>
</table>

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.6.gif" alt="ZPE-FT Authority Insert" width="100%">
</p>

## Ecosystem

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="34%" valign="top"><a href="https://github.com/Zer0pa/ZPE-IMC"><code>ZPE-IMC</code></a></td>
    <td width="66%" valign="top">Sibling Zer0pa workstream used as adjacent portfolio context and documentation reference. It does not substitute for this repo's proof or benchmark state.</td>
  </tr>
</table>
