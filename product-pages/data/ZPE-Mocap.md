<h1 align="center">ZPE-Mocap</h1>

<p align="center">
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE-Mocap Masthead" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-SAL%20v6.0-e5e7eb?labelColor=111111" alt="License: SAL v6.0"></a>
  <a href="code/README.md"><img src="https://img.shields.io/badge/python-reference%20implementation-e5e7eb?labelColor=111111" alt="Python reference implementation"></a>
  <a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_compression_benchmark.json"><img src="https://img.shields.io/badge/current%20authority-2026--02--20%20synthetic%20wave-e5e7eb?labelColor=111111" alt="Current authority: 2026-02-20 synthetic wave"></a>
  <a href="proofs/README.md"><img src="https://img.shields.io/badge/proof%20anchors-wave1%20bundle-e5e7eb?labelColor=111111" alt="Proof anchors: wave1 bundle"></a>
</p>
<p align="center">
  <a href="docs/ARCHITECTURE.md"><img src="https://img.shields.io/badge/architecture-runtime%20map-e5e7eb?labelColor=111111" alt="Architecture runtime map"></a>
  <a href="docs/LEGAL_BOUNDARIES.md"><img src="https://img.shields.io/badge/lane%20boundaries-legal%20caveats-e5e7eb?labelColor=111111" alt="Lane boundaries: legal caveats"></a>
  <a href="AUDITOR_PLAYBOOK.md"><img src="https://img.shields.io/badge/auditor%20path-short%20replay-e5e7eb?labelColor=111111" alt="Auditor path"></a>
  <a href="PUBLIC_AUDIT_LIMITS.md"><img src="https://img.shields.io/badge/public%20audit-limits%20%2B%20non--claims-e5e7eb?labelColor=111111" alt="Public audit limits and non-claims"></a>
</p>

<table align="center" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="25%"><a href="#quickstart-and-license"><img src=".github/assets/readme/nav/quickstart-and-license.svg" alt="Quickstart & License" width="100%"></a></td>
    <td width="25%"><a href="#what-this-is"><img src=".github/assets/readme/nav/what-this-is.svg" alt="What This Is" width="100%"></a></td>
    <td width="25%"><a href="#current-authority"><img src=".github/assets/readme/nav/current-authority.svg" alt="Current Authority" width="100%"></a></td>
    <td width="25%"><a href="#runtime-proof-wave-1"><img src=".github/assets/readme/nav/runtime-proof.svg" alt="Runtime Proof" width="100%"></a></td>
  </tr>
  <tr>
    <td width="25%"><a href="#modality-status-snapshot"><img src=".github/assets/readme/nav/modality-snapshot.svg" alt="Modality Snapshot" width="100%"></a></td>
    <td width="25%"><a href="#throughput"><img src=".github/assets/readme/nav/throughput.svg" alt="Throughput" width="100%"></a></td>
    <td width="25%"><a href="#public-ml-workbooks"><img src=".github/assets/readme/nav/public-ml-workbooks.svg" alt="Public ML Workbooks" width="100%"></a></td>
    <td width="25%"><a href="#go-next"><img src=".github/assets/readme/nav/go-next.svg" alt="Go Next" width="100%"></a></td>
  </tr>
</table>

---

<a id="commercial-front-door"></a>

## What This Is

ZPE-Mocap applies the ZPE deterministic 8-primitive encoding architecture to motion-capture data — compression, search, and retrieval for spatial-temporal skeletal signals. All current evidence is bounded to the **synthetic corpus from the 2026-02-20 wave1 bundle**. Nothing here claims real-world validation.

On that synthetic corpus: **85.19× compression ratio**, joint-angle fidelity at **RMSE ≈ 1.16e-07 degrees**, positional fidelity at **MPJPE 1.19 mm**, p@10 = 1.0 search ranking, and p95 query latency of 43.4 ms. Full evidence bundle: `proofs/artifacts/2026-02-20_zpe_mocap_wave1/`. Falsification results and integration readiness contract are included.

Animation studios, game engines, and motion-data infrastructure teams evaluating deterministic mocap compression can benchmark against these synthetic numbers. The gap to commercial readiness is real-world corpus validation — no Blender runtime pass, no CMU commercialization-safe closure, no clean-clone verification exist.

**Readiness: staged, synthetic evidence only.** Public repository. No real-world corpus validation.

**Not claimed:** CMU or commercial corpus validation, Blender runtime compatibility, clean-clone verification, commercialization-safe closure.

| Proof anchor | Location |
|---|---|
| Wave1 evidence bundle | `proofs/artifacts/2026-02-20_zpe_mocap_wave1/` |
| Compression / fidelity / search / latency | wave1 bundle artifacts |
| Falsification results | wave1 bundle |

Part of the [Zer0pa](https://github.com/zer0-point-energy) family. Platform layer: [ZPE-IMC](https://github.com/zer0-point-energy/ZPE-IMC).

---

<p>
  <img src=".github/assets/readme/section-bars/what-this-is.svg" alt="WHAT THIS IS" width="100%">
</p>

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.4.gif" alt="ZPE-Mocap Upper Insert" width="100%">
</p>

<a id="what-this-is"></a>
## What This Is

ZPE-Mocap is Zero-Point Encoding's motion-capture compression and retrieval sector. This repo contains a deterministic Python reference implementation plus an imported synthetic-corpus proof bundle dated 2026-02-20. Every public claim below is limited to that synthetic evidence. No Blender runtime pass, no CMU commercialization-safe closure, and no clean-clone verification are claimed here.

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
      <td valign="top">A deterministic mocap compression and retrieval reference stack backed by a synthetic corpus with preserved proof lineage.</td>
    </tr>
    <tr>
      <td valign="top">What is the current authority state?</td>
      <td valign="top">Imported <code>2026-02-20_zpe_mocap_wave1</code> synthetic-corpus proof bundle; no new run-of-record has been accepted inside this repo boundary.</td>
    </tr>
    <tr>
      <td valign="top">What is actually proved?</td>
      <td valign="top">Synthetic-corpus compression ratio, joint-angle fidelity, positional fidelity, search ranking, and query-latency metrics in the wave1 bundle.</td>
    </tr>
    <tr>
      <td valign="top">What is not being claimed?</td>
      <td valign="top">No CMU-backed commercialization-safe closure, no Blender runtime pass, and no clean-clone verification. The bundle is historical and may retain machine-absolute paths.</td>
    </tr>
    <tr>
      <td valign="top">Where should an outsider acquire and verify?</td>
      <td valign="top">Clone <code>https://github.com/Zer0pa/ZPE-Mocap.git</code>, run the quick verify path below, and inspect <code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/</code> as the authority surface.</td>
    </tr>
  </tbody>
</table>

| Field | Value |
| --- | --- |
| Architecture | SKELETON_MANIFOLD |
| Encoding | JOINT_ANGLE_V2 |

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.5.gif" alt="ZPE-Mocap Lower Insert" width="100%">
</p>

## Key Metrics

| Metric | Value | Baseline | Tag |
| --- | --- | --- | --- |
| Compression | 85.19× | gzip ~3× on BVH | SYNTHETIC |
| Joint Fidelity | 1.16e-07° | — | RMSE |
| Position Error | 1.19 mm | — | MPJPE |
| Query Latency | 26.14 ms | — | P95 |

## What We Prove

- Paired compass tokens per joint encode motion in XY and XZ planes simultaneously
- Parent-relative skeletal storage eliminates redundant global-space representation
- Motion-motif suffix indexing enables search on compressed skeletal streams
- Joint-angle and positional fidelity verified at sub-millimeter and sub-microdegree precision
- Search ranking achieves p@10 = 1.0 with 26 ms p95 query latency

## What We Don't Claim

- Validation beyond the synthetic corpus
- Release readiness
- Production motion-pipeline integration
- Blender or Maya plugin support

<a id="current-authority"></a>
## Commercial Readiness

| Field | Value |
| --- | --- |
| Verdict | PASS |
| Commit SHA | 34d94f1f29b4 |
| Confidence | 92% |
| Source | `proofs/artifacts/2026-02-20_zpe_mocap_wave1/quality_gate_scorecard.json` |

## Tests and Verification

| Code | Check | Verdict |
| --- | --- | --- |
| V_01 | Synthetic compression benchmark | PASS |
| V_02 | Joint-angle fidelity | PASS |
| V_03 | Position fidelity | PASS |
| V_04 | Search ranking | PASS |
| V_05 | Query latency | PASS |
| V_06 | Claim accuracy | PASS |
| V_07 | Integration readiness contract | INC |

## Proof Anchors

| Path | State |
| --- | --- |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_compression_benchmark.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_joint_fidelity.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_position_fidelity.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_search_eval.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_query_latency.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/quality_gate_scorecard.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/commercialization_claim_adjudication.json` | VERIFIED |
| `proofs/artifacts/2026-02-20_zpe_mocap_wave1/integration_readiness_contract.json` | PARTIAL |

## Repo Shape

| Field | Value |
| --- | --- |
| Proof Anchors | 8 |
| Modality Lanes | 1 |
| Authority Source | `proofs/artifacts/2026-02-20_zpe_mocap_wave1/quality_gate_scorecard.json` |

<p>
  <img src=".github/assets/readme/section-bars/quickstart-and-license.svg" alt="QUICKSTART AND LICENSE" width="100%">
</p>

<a id="quickstart-and-license"></a>
<a id="quick-start"></a>
## Quick Start

### Quick Verify

Use the clone/install path below as repository verification guidance, not packaged public-release guidance.

```bash
git clone https://github.com/Zer0pa/ZPE-Mocap.git
cd ZPE-Mocap
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ./code
python -m unittest discover -s code/tests -v
python - <<'PY'
from zpe_mocap.codec import decode_zpmoc, encode_clip
from zpe_mocap.synthetic import generate_clip

clip = generate_clip(
    clip_id="readme_smoke",
    label="walk",
    frames=120,
    fps=60,
    seed=20260220,
    noise_scale=0.0002,
)
enc = encode_clip(clip, seed=20260220)
dec = decode_zpmoc(enc.payload)
print(enc.compression_ratio, dec.clip_id)
PY
```

Expected outputs:

- <code>python -m unittest discover -s code/tests -v</code> completes locally after the editable install.
- The smoke snippet prints a compression ratio and returns <code>readme_smoke</code> as the decoded clip id.
- Evidence remains anchored in <code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/</code>.

Shortest outsider path:

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top" align="center"><a href="docs/README.md"><code>docs/README.md</code></a></td>
    <td width="33%" valign="top" align="center"><a href="docs/ARCHITECTURE.md"><code>docs/ARCHITECTURE.md</code></a></td>
    <td width="34%" valign="top" align="center"><a href="AUDITOR_PLAYBOOK.md"><code>AUDITOR_PLAYBOOK.md</code></a></td>
  </tr>
</table>

### License Boundary

- Free tier boundary: annual gross revenue at or below USD 100M under SAL v6.0.
- SPDX tag: <code>LicenseRef-Zer0pa-SAL-6.0</code>.
- Commercial or hosted use above threshold must follow the contact and enforcement terms in <a href="LICENSE">LICENSE</a>.

## Ecosystem

| Workstream | Route | Notes |
| --- | --- | --- |
| ZPE-Mocap | [github.com/Zer0pa/ZPE-Mocap](https://github.com/Zer0pa/ZPE-Mocap) | This motion-capture compression and retrieval workstream. |
| ZPE-IMC | [github.com/Zer0pa/ZPE-IMC](https://github.com/Zer0pa/ZPE-IMC) | Portfolio reference repo reused for documentation and structure alignment. |
| ZPE-XR | [github.com/Zer0pa/ZPE-XR](https://github.com/Zer0pa/ZPE-XR) | Adjacent spatial-media workstream in the ZPE portfolio. |
| ZPE-Robotics | [github.com/Zer0pa/ZPE-Robotics](https://github.com/Zer0pa/ZPE-Robotics) | Sibling workstream for robotics motion and control surfaces. |
| ZPE-Bio | [github.com/Zer0pa/ZPE-Bio](https://github.com/Zer0pa/ZPE-Bio) | Another proof-anchored codec workstream in the same portfolio. |

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-2.gif" alt="ZPE-Mocap Mid Masthead" width="100%">
</p>

<p>
  <img src=".github/assets/readme/section-bars/runtime-proof-wave-1.svg" alt="RUNTIME PROOF (WAVE-1)" width="100%">
</p>

<a id="runtime-proof-wave-1"></a>
## Runtime Proof (Wave-1)

The only promoted proof surface is the imported <code>2026-02-20_zpe_mocap_wave1</code> synthetic-corpus bundle. No clean-clone verification, Blender runtime pass, or CMU-backed closure is promoted beyond this evidence.

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="50%" valign="top">
      <strong>Evidence bundle</strong><br>
      <code>2026-02-20_zpe_mocap_wave1</code><br><br>
      Imported synthetic-corpus proof artifacts retained for lineage and current claims.
    </td>
    <td width="50%" valign="top">
      <strong>Runtime boundary</strong><br>
      <code>python reference only</code><br><br>
      No Blender runtime verification or clean-clone replay is promoted here.
    </td>
  </tr>
</table>

### Historical Authority Surface

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top">
      <strong>Accepted authority bundle</strong><br>
      <code>2026-02-20_zpe_mocap_wave1</code><br><br>
      Imported synthetic-corpus evidence bundle. No later run-of-record is promoted.
    </td>
    <td width="33%" valign="top">
      <strong>Backend truth</strong><br>
      <code>backend=python</code><br><br>
      Python reference implementation; no compiled runtime authority is claimed here.
    </td>
    <td width="34%" valign="top">
      <strong>Performance authority</strong><br>
      <code>zpmoc_mean_cr=85.1893</code>, <code>mpjpe_mean_mm=1.1901</code>, <code>query_latency_p95_ms=26.1375</code><br><br>
      Promoted synthetic-corpus headline metrics from the wave1 bundle.
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
      <td valign="top">Authority bundle</td>
      <td valign="top"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/</code></td>
      <td valign="top">Current proof surface for all promoted metrics.</td>
    </tr>
    <tr>
      <td valign="top">Corpus type</td>
      <td valign="top"><code>synthetic</code></td>
      <td valign="top">All current claims are synthetic-corpus claims; no CMU-backed closure is promoted.</td>
    </tr>
    <tr>
      <td valign="top">Compression ratio</td>
      <td valign="top"><code>zpmoc_mean_cr=85.1893</code></td>
      <td valign="top">Synthetic-corpus mean compression ratio from the wave1 benchmark artifact.</td>
    </tr>
    <tr>
      <td valign="top">Joint-angle fidelity</td>
      <td valign="top"><code>joint_angle_rmse_deg≈1.16e-07</code></td>
      <td valign="top">Synthetic joint-angle RMSE for wave1 fidelity tests.</td>
    </tr>
    <tr>
      <td valign="top">Position fidelity</td>
      <td valign="top"><code>mpjpe_mean_mm=1.1901</code></td>
      <td valign="top">Synthetic mean per-joint position error from wave1.</td>
    </tr>
    <tr>
      <td valign="top">Search ranking</td>
      <td valign="top"><code>p_at_10=1.0</code></td>
      <td valign="top">Synthetic search evaluation for the wave1 corpus.</td>
    </tr>
    <tr>
      <td valign="top">Query latency</td>
      <td valign="top"><code>query_latency_p95_ms=26.1375</code></td>
      <td valign="top">Synthetic query latency p95 from the wave1 benchmark.</td>
    </tr>
    <tr>
      <td valign="top">ACL comparator</td>
      <td valign="top"><code>zpmoc_mean_ratio=57.0328</code>, <code>acl_mean_ratio_same_raw_bvh32=19.1487</code></td>
      <td valign="top">Direct ACL comparator captured on the same synthetic raw-BVH32 baseline.</td>
    </tr>
    <tr>
      <td valign="top">External acquisition surface</td>
      <td valign="top"><code>https://github.com/Zer0pa/ZPE-Mocap.git</code></td>
      <td valign="top">Public clone target for this repo.</td>
    </tr>
  </tbody>
</table>

### Authority Notes

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
      <td width="33%" valign="top">The imported wave1 bundle is the current authority surface; no later run-of-record has been re-accepted inside this repo boundary.</td>
      <td width="33%" valign="top">Blender runtime verification remains unpromoted; existing compatibility notes are simulated only.</td>
      <td width="34%" valign="top">CMU-backed commercialization-safe closure and clean-clone verification remain gaps and are explicitly not claimed.</td>
  </tr>
</table>

### Proof Anchor Notes

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_compression_benchmark.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_compression_benchmark.json</code></a><br><br>Compression ratio metrics for the synthetic corpus.</td>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_joint_fidelity.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_joint_fidelity.json</code></a><br><br>Joint-angle RMSE evidence for the synthetic corpus.</td>
  </tr>
  <tr>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_position_fidelity.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_position_fidelity.json</code></a><br><br>MPJPE positional fidelity evidence for the synthetic corpus.</td>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_search_eval.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_search_eval.json</code></a><br><br>Search ranking evidence for the synthetic corpus.</td>
  </tr>
  <tr>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_query_latency.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/mocap_query_latency.json</code></a><br><br>Query latency p95 evidence for the synthetic corpus.</td>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/acl_direct_comparator_table.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/acl_direct_comparator_table.json</code></a><br><br>ACL comparator table for the same raw-BVH32 baseline.</td>
  </tr>
  <tr>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/integration_readiness_contract.json"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/integration_readiness_contract.json</code></a><br><br>Integration readiness contract captured in the bundle.</td>
    <td width="50%" valign="top"><a href="proofs/artifacts/2026-02-20_zpe_mocap_wave1/falsification_results.md"><code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/falsification_results.md</code></a><br><br>Falsification results for the synthetic wave.</td>
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
      <td valign="top">Synthetic compression</td>
      <td valign="top"><code>zpmoc_mean_cr=85.1893</code></td>
      <td valign="top">Compression ratio on the synthetic corpus.</td>
    </tr>
    <tr>
      <td valign="top">Synthetic joint fidelity</td>
      <td valign="top"><code>joint_angle_rmse_deg≈1.16e-07</code></td>
      <td valign="top">Joint-angle RMSE on the synthetic corpus.</td>
    </tr>
    <tr>
      <td valign="top">Synthetic position fidelity</td>
      <td valign="top"><code>mpjpe_mean_mm=1.1901</code></td>
      <td valign="top">Mean per-joint position error on the synthetic corpus.</td>
    </tr>
    <tr>
      <td valign="top">Synthetic search ranking</td>
      <td valign="top"><code>p_at_10=1.0</code></td>
      <td valign="top">Search evaluation at <code>p@10</code> on the synthetic corpus.</td>
    </tr>
    <tr>
      <td valign="top">Synthetic query latency</td>
      <td valign="top"><code>query_latency_p95_ms=26.1375</code></td>
      <td valign="top">p95 query latency for the synthetic corpus.</td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/section-bars/modality-status-snapshot.svg" alt="MODALITY STATUS SNAPSHOT" width="100%">
</p>

<a id="modality-status-snapshot"></a>
## Modality Status Snapshot

ZPE-Mocap is a motion-capture sector. The status below reports only the synthetic-corpus evidence that exists today and marks the missing Blender, CMU, and clean-clone gates.

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="18%">Surface</th>
      <th align="left" width="12%">Status</th>
      <th align="left" width="28%">Proved now</th>
      <th align="left" width="42%">Boundary and evidence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Compression</td>
      <td valign="top"><code>GREEN</code></td>
      <td valign="top">Synthetic compression ratio evidence in wave1.</td>
      <td valign="top"><code>zpmoc_mean_cr=85.1893</code> from the wave1 benchmark artifact.</td>
    </tr>
    <tr>
      <td valign="top">Joint-angle fidelity</td>
      <td valign="top"><code>GREEN</code></td>
      <td valign="top">Synthetic joint-angle RMSE in wave1.</td>
      <td valign="top"><code>joint_angle_rmse_deg≈1.16e-07</code> in <code>mocap_joint_fidelity.json</code>.</td>
    </tr>
    <tr>
      <td valign="top">Position fidelity</td>
      <td valign="top"><code>GREEN</code></td>
      <td valign="top">Synthetic MPJPE in wave1.</td>
      <td valign="top"><code>mpjpe_mean_mm=1.1901</code> in <code>mocap_position_fidelity.json</code>.</td>
    </tr>
    <tr>
      <td valign="top">Search ranking</td>
      <td valign="top"><code>GREEN</code></td>
      <td valign="top">Synthetic search evaluation in wave1.</td>
      <td valign="top"><code>p_at_10=1.0</code> in <code>mocap_search_eval.json</code>.</td>
    </tr>
    <tr>
      <td valign="top">Query latency</td>
      <td valign="top"><code>GREEN</code></td>
      <td valign="top">Synthetic latency p95 in wave1.</td>
      <td valign="top"><code>query_latency_p95_ms=26.1375</code> in <code>mocap_query_latency.json</code>.</td>
    </tr>
    <tr>
      <td valign="top">Blender runtime</td>
      <td valign="top"><code>RED</code></td>
      <td valign="top">No Blender runtime proof is promoted.</td>
      <td valign="top">Compatibility notes remain simulated only.</td>
    </tr>
    <tr>
      <td valign="top">CMU closure</td>
      <td valign="top"><code>RED</code></td>
      <td valign="top">No CMU-backed commercialization-safe closure.</td>
      <td valign="top">Workspace CMU clone lacks usable corpus files.</td>
    </tr>
    <tr>
      <td valign="top">Clean-clone verification</td>
      <td valign="top"><code>RED</code></td>
      <td valign="top">No clean-clone verification has been run from this repo boundary.</td>
      <td valign="top">Evidence remains imported and unrerun in this repo.</td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/section-bars/throughput.svg" alt="THROUGHPUT" width="100%">
</p>

<a id="throughput"></a>
## Throughput

No throughput benchmark is promoted. The only performance numbers currently promoted are synthetic-corpus compression and query-latency metrics from the wave1 bundle.

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="50%" valign="top">
      <strong>Compression ratio</strong><br>
      <code>zpmoc_mean_cr=85.1893</code><br><br>
      Synthetic-corpus compression ratio from wave1.
    </td>
    <td width="50%" valign="top">
      <strong>Query latency p95</strong><br>
      <code>query_latency_p95_ms=26.1375</code><br><br>
      Synthetic query latency p95 from wave1.
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
      <td valign="top">Latency unit</td>
      <td valign="top"><code>ms (p95)</code></td>
      <td valign="top">All latency values are p95 in milliseconds.</td>
    </tr>
    <tr>
      <td valign="top">Compression ratio</td>
      <td valign="top"><code>zpmoc_mean_cr=85.1893</code></td>
      <td valign="top">Mean compression ratio on the synthetic corpus.</td>
    </tr>
    <tr>
      <td valign="top">Query latency p95</td>
      <td valign="top"><code>query_latency_p95_ms=26.1375</code></td>
      <td valign="top">Search query latency p95 on the synthetic corpus.</td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-3.gif" alt="ZPE-Mocap Lower Masthead" width="100%">
</p>

<a id="public-ml-workbooks"></a>
## Public ML Workbooks

No public ML workbook is promoted for ZPE-Mocap at this time. All promoted evidence remains in the local wave1 proof bundle under <code>proofs/artifacts/2026-02-20_zpe_mocap_wave1/</code>.

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="32%">Role</th>
      <th align="left" width="28%">Run name</th>
      <th align="left" width="40%">Workbook</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">Current promoted public twin</td>
      <td valign="top"><code>NONE</code></td>
      <td valign="top"><code>NOT_PUBLISHED</code></td>
    </tr>
    <tr>
      <td valign="top">Historical lineage</td>
      <td valign="top"><code>2026-02-20_zpe_mocap_wave1</code></td>
      <td valign="top"><code>LOCAL_BUNDLE_ONLY</code></td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/section-bars/repo-shape.svg" alt="REPO SHAPE" width="100%">
</p>

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
      <td valign="top">Understand the runtime map and authority classes</td>
      <td valign="top"><a href="docs/ARCHITECTURE.md"><code>docs/ARCHITECTURE.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Navigate the documentation surface</td>
      <td valign="top"><a href="docs/README.md"><code>docs/README.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Read legal and lane-specific public boundaries</td>
      <td valign="top"><a href="docs/LEGAL_BOUNDARIES.md"><code>docs/LEGAL_BOUNDARIES.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Audit historical compatibility and replay boundaries</td>
      <td valign="top"><a href="AUDITOR_PLAYBOOK.md"><code>AUDITOR_PLAYBOOK.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Read public audit limits and explicit non-claims</td>
      <td valign="top"><a href="PUBLIC_AUDIT_LIMITS.md"><code>PUBLIC_AUDIT_LIMITS.md</code></a></td>
    </tr>
    <tr>
      <td valign="top">Inspect proof artifacts and logs directly</td>
      <td valign="top"><a href="proofs/"><code>proofs/</code></a></td>
    </tr>
  </tbody>
</table>

<table width="100%" border="1" bordercolor="#111111" cellpadding="14" cellspacing="0">
  <thead>
    <tr>
      <th align="left" width="38%">Area</th>
      <th align="left" width="62%">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top"><a href="README.md"><code>README.md</code></a>, <a href="CONTRIBUTING.md"><code>CONTRIBUTING.md</code></a>, <a href="SECURITY.md"><code>SECURITY.md</code></a>, <a href="SUPPORT.md"><code>SUPPORT.md</code></a>, <a href="LICENSE"><code>LICENSE</code></a></td>
      <td valign="top">Root governance and release-facing metadata</td>
    </tr>
    <tr>
      <td valign="top"><a href="code/"><code>code/</code></a></td>
      <td valign="top">Installable package and codec implementation surface</td>
    </tr>
    <tr>
      <td valign="top"><a href="docs/"><code>docs/</code></a></td>
      <td valign="top">Architecture, legal boundaries, support, and documentation routing</td>
    </tr>
    <tr>
      <td valign="top"><a href="proofs/"><code>proofs/</code></a></td>
      <td valign="top">Proof corpus, baselines, and falsification evidence</td>
    </tr>
  </tbody>
</table>

<p>
  <img src=".github/assets/readme/section-bars/open-risks-non-blocking.svg" alt="OPEN RISKS (NON-BLOCKING)" width="100%">
</p>

<a id="open-risks-non-blocking"></a>
## Open Risks (Non-Blocking)

- Blender runtime proof remains unpromoted; compatibility notes are simulated only.
- CMU-backed commercialization-safe closure is not available in this repo boundary.
- Clean-clone verification has not been executed from this repo.
- Historical artifacts can retain machine-absolute paths from the 2026-02-20 bundle.
- No public ML workbook has been published for this repo; evidence is local to the wave1 bundle.

<p>
  <img src=".github/assets/readme/section-bars/contributing-security-support.svg" alt="CONTRIBUTING, SECURITY, SUPPORT" width="100%">
</p>

<a id="contributing-security-support"></a>
## Contributing, Security, Support

<table width="100%" border="1" bordercolor="#111111" cellpadding="16" cellspacing="0">
  <tr>
    <td width="33%" valign="top">Contribution workflow: <a href="CONTRIBUTING.md"><code>CONTRIBUTING.md</code></a></td>
    <td width="33%" valign="top">Security policy and reporting: <a href="SECURITY.md"><code>SECURITY.md</code></a></td>
    <td width="34%" valign="top">User support channel guide: <a href="docs/SUPPORT.md"><code>docs/SUPPORT.md</code></a></td>
  </tr>
  <tr>
    <td width="33%" valign="top">Documentation index: <a href="docs/README.md"><code>docs/README.md</code></a></td>
    <td colspan="2" width="67%" valign="top">Autonomous agents and AI systems using this repository are subject to Section 6 of the <a href="LICENSE">Zer0pa SAL v6.0</a>.</td>
  </tr>
</table>

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.6.gif" alt="ZPE-Mocap Authority Insert" width="100%">
</p>

<a id="ecosystem-cross-links"></a>
<h2 align="center">Ecosystem Cross-Links</h2>

- <a href="https://github.com/Zer0pa/ZPE-IMC"><code>ZPE-IMC</code></a> — reference repo for shared repository structure and documentation alignment.
- <a href="code/README.md"><code>code/README.md</code></a> — installable package surface for the ZPE-Mocap workstream.
- <a href="docs/README.md"><code>docs/README.md</code></a> — documentation router for architecture, legal boundaries, and support surfaces.
- <a href="proofs/README.md"><code>proofs/README.md</code></a> — proof-corpus entrypoint for the evidence carried inside this repo.
