<p align="center">
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE Geo Masthead" width="100%">
</p>

<h1 align="center">ZPE Geo</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-SAL%20v6.0-e5e7eb?labelColor=111111" alt="License: SAL v6.0"></a>
  <a href="code/README.md"><img src="https://img.shields.io/badge/python-3.11%2B-e5e7eb?labelColor=111111" alt="Python 3.11+"></a>
  <a href="proofs/FINAL_STATUS.md"><img src="https://img.shields.io/badge/release%20posture-not%20release--ready-e5e7eb?labelColor=111111" alt="Release posture: not release-ready"></a>
  <a href="proofs/artifacts/2026-03-21_operator_status/README.md"><img src="https://img.shields.io/badge/current%20operator%20state-red%20claims%20remain-e5e7eb?labelColor=111111" alt="Current operator state: red claims remain"></a>
  <a href="proofs/artifacts/2026-02-20_zpe_geo_wave1/claim_status_delta.md"><img src="https://img.shields.io/badge/historical%20bundle-archived%20only-e5e7eb?labelColor=111111" alt="Historical bundle: archived only"></a>
</p>
<p align="center">
  <a href="code/README.md"><img src="https://img.shields.io/badge/quick%20verify-package%20surface-e5e7eb?labelColor=111111" alt="Quick verify: package surface"></a>
  <a href="proofs/FINAL_STATUS.md"><img src="https://img.shields.io/badge/proof%20anchors-final%20status%20%2B%20operator%20pack-e5e7eb?labelColor=111111" alt="Proof anchors: final status and operator pack"></a>
  <a href="docs/ARCHITECTURE.md"><img src="https://img.shields.io/badge/architecture-repo%20map-e5e7eb?labelColor=111111" alt="Architecture: repo map"></a>
  <a href="PUBLIC_AUDIT_LIMITS.md"><img src="https://img.shields.io/badge/public%20limits-explicit%20boundary-e5e7eb?labelColor=111111" alt="Public limits: explicit boundary"></a>
  <a href="docs/README.md"><img src="https://img.shields.io/badge/docs-routing%20index-e5e7eb?labelColor=111111" alt="Docs routing index"></a>
</p>
<table align="center" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="25%"><a href="#quick-start"><img src=".github/assets/readme/nav/quickstart-and-license.svg" alt="Quickstart And License" width="100%"></a></td>
    <td width="25%"><a href="#what-this-is"><img src=".github/assets/readme/nav/what-this-is.svg" alt="What This Is" width="100%"></a></td>
    <td width="25%"><a href="#current-authority"><img src=".github/assets/readme/nav/current-authority.svg" alt="Current Authority" width="100%"></a></td>
    <td width="25%"><a href="#go-next"><img src=".github/assets/readme/nav/go-next.svg" alt="Go Next" width="100%"></a></td>
  </tr>
</table>

---

## What This Is

ZPE-Geo compresses and indexes movement traces — fleet routes, vessel tracks, AV telemetry, logistics trajectories — so they stay searchable after compression. H3 hexagonal spatial indexing, maneuver-aware search, and deterministic fidelity validation all operate on the compressed representation.

This is for teams that store or transmit large volumes of trajectory data and need compression that preserves query capability. The codec does not just shrink traces; it indexes maneuvers during encoding so downstream search never touches the raw stream.

ZPE Geo is the Git-backed workstream repo for deterministic geospatial trajectory compression, fidelity checks, maneuver search, H3 roundtrip validation, proof custody, and documentation routing. SAL v6.0 is free below $100M annual revenue. See [LICENSE](LICENSE).

| Field | Value |
|-------|-------|
| Architecture | TRAJECTORY_MANIFOLD |
| Encoding | H3_HEX_PACK |

## Key Metrics

| Metric | Value | Baseline | Tag |
|--------|-------|----------|-----|
| AIS Compression | 475× | Douglas-Peucker ~315× | SYNTHETIC_AIS |
| AV Compression | 107× | — | SYNTHETIC_AV |
| Query Latency | 0.064 ms | PostGIS R-tree ~1–10 ms | P95_H3 |
| Spatial RMSE | 0.82 m | — | AV_ROUTES |

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3.4.gif" alt="ZPE Geo Upper Insert" width="100%">
</p>

## What We Prove

- Compass direction tokens map trajectory segments to 8-primitive geometry
- H3 hexagonal spatial indexing computed during encoding, not post-hoc
- Maneuver grammar enables compressed-domain search without decompression
- Multi-source trajectory unification (AIS, AV, logistics) via shared primitive layer
- Deterministic fidelity validated at sub-meter RMSE on AV route corpus

## What We Don't Claim

- No claim of blind-clone closure (GEO-C001)
- No claim of full-corpus closure (GEO-C002)
- No claim of release readiness (GEO-C004)
- No claim of superiority over incumbent geospatial compression

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3.5.gif" alt="ZPE Geo Lower Insert" width="100%">
</p>

## Commercial Readiness

| Field | Value |
|-------|-------|
| Verdict | BLOCKED |
| Commit SHA | bb9b5e39fc2e |
| Confidence | 62.5% |
| Source | proofs/FINAL_STATUS.md |

- Supporting operator pack: [proofs/artifacts/2026-03-21_operator_status/README.md](proofs/artifacts/2026-03-21_operator_status/README.md)
- Open gates: `GEO-C001`, `GEO-C002`, `GEO-C004`
- Confidence basis: `5 / 8` tracked claims green on [proofs/artifacts/2026-03-21_operator_status/phase0311_runpod/max_claim_resource_map.json](proofs/artifacts/2026-03-21_operator_status/phase0311_runpod/max_claim_resource_map.json)

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3-2.gif" alt="ZPE Geo Mid Masthead" width="100%">
</p>

## Tests and Verification

| Code | Check | Verdict |
|------|-------|---------|
| V_01 | Repo-local package surface | PASS |
| V_02 | Lightweight code tests | PASS |
| V_03 | GEO-C001 blind-clone closure | FAIL |
| V_04 | GEO-C002 full-corpus closure | FAIL |
| V_05 | GEO-C004 release readiness | FAIL |
| V_06 | H3 roundtrip consistency | PASS |

## Proof Anchors

| Path | State |
|------|-------|
| proofs/FINAL_STATUS.md | VERIFIED |
| proofs/CONSOLIDATED_PROOF_REPORT.md | VERIFIED |
| proofs/artifacts/2026-03-21_operator_status/README.md | VERIFIED |
| proofs/artifacts/2026-03-21_operator_status/phase0311_runpod/max_claim_resource_map.json | VERIFIED |
| proofs/artifacts/2026-03-21_operator_status/release_alignment/TECHNICAL_ALIGNMENT_REPORT.md | VERIFIED |

Quickest outsider orientation:

| Route | Why |
| --- | --- |
| [proofs/FINAL_STATUS.md](proofs/FINAL_STATUS.md) | Governing current repo verdict |
| [PUBLIC_AUDIT_LIMITS.md](PUBLIC_AUDIT_LIMITS.md) | Explicit public claim boundary |
| [AUDITOR_PLAYBOOK.md](AUDITOR_PLAYBOOK.md) | Audit route and reading order |
| [code/README.md](code/README.md) | Install-facing package surface |

## Repo Shape

| Field | Value |
|-------|-------|
| Proof Anchors | 5 |
| Modality Lanes | 4 |
| Authority Source | proofs/FINAL_STATUS.md |

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3-3.gif" alt="ZPE Geo Lower Masthead" width="100%">
</p>

## Quick Start

### Quick Verify

The steps below verify the current repo-local package surface. They do not prove blind-clone closure, full-corpus closure, or release readiness.

```bash
git clone https://github.com/Zer0pa/ZPE-Geo.git zpe-geo
cd zpe-geo
python -m venv .venv
source .venv/bin/activate
python -m pip install -e "./code[dev,h3]"
python -m pytest code/tests -q
python - <<'PY'
from zpe_geo import H3Bridge, ManeuverSearchIndex, decode_trajectory, encode_trajectory
print("zpe-geo import OK")
print("h3 backend:", H3Bridge().backend)
print("search surface:", ManeuverSearchIndex.__name__)
PY
```

After a successful repo-local verification you should have:

- an editable install of the inner `code/` package surface
- passing lightweight repo-local tests under `code/tests`
- an importable `zpe_geo` surface without relying on outer-workspace material

### License Boundary

- This repo uses the same SAL v6.0 license text as the current `ZPE-IMC` reference surface.
- SPDX tag: `LicenseRef-Zer0pa-SAL-6.0`.
- Commercial or hosted use above the SAL threshold requires contact at `architects@zer0pa.ai`.
- `LICENSE` is the legal source of truth. Repo docs summarize it; they do not override it.

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3.6.gif" alt="ZPE Geo Authority Insert" width="100%">
</p>

## Ecosystem

| Workstream | Route | Notes |
| --- | --- | --- |
| ZPE Geo | [github.com/Zer0pa/ZPE-Geo](https://github.com/Zer0pa/ZPE-Geo) | This geospatial codec, search, and H3 workstream. |
| ZPE-IMC | [github.com/Zer0pa/ZPE-IMC](https://github.com/Zer0pa/ZPE-IMC) | Current documentation-structure reference surface reused by sibling repos. |
| ZPE-FT | [github.com/Zer0pa/ZPE-FT](https://github.com/Zer0pa/ZPE-FT) | Parallel ZPE family workstream. |
| ZPE-Bio | [github.com/Zer0pa/ZPE-Bio](https://github.com/Zer0pa/ZPE-Bio) | Parallel ZPE family workstream. |
| ZPE-IoT | [github.com/Zer0pa/ZPE-IoT](https://github.com/Zer0pa/ZPE-IoT) | Parallel ZPE family workstream. |

## Historical Context Only

The archived bundle under [proofs/artifacts/2026-02-20_zpe_geo_wave1/](proofs/artifacts/2026-02-20_zpe_geo_wave1/) remains part of the repo because it contains real historical evidence:

- archived performance metrics across all eight promoted claims
- archived comparator notes, including an in-repo AIS baseline comparison
- preserved contradictions that explain why archived success does not equal current release authorization

Read those facts as historical-only context through [proofs/CONSOLIDATED_PROOF_REPORT.md](proofs/CONSOLIDATED_PROOF_REPORT.md), not as current release status.

## Go Next

| Need | Route |
| --- | --- |
| Current verdict and release posture | [proofs/FINAL_STATUS.md](proofs/FINAL_STATUS.md) |
| Detailed current evidence and historical bundle interpretation | [proofs/CONSOLIDATED_PROOF_REPORT.md](proofs/CONSOLIDATED_PROOF_REPORT.md) |
| Audit path | [AUDITOR_PLAYBOOK.md](AUDITOR_PLAYBOOK.md) |
| Audit limits and exclusions | [PUBLIC_AUDIT_LIMITS.md](PUBLIC_AUDIT_LIMITS.md) |
| Architecture and evidence map | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Docs ownership map | [docs/CANONICAL_DOC_REGISTRY.md](docs/CANONICAL_DOC_REGISTRY.md) |
| FAQ and support | [docs/FAQ.md](docs/FAQ.md), [docs/SUPPORT.md](docs/SUPPORT.md) |
| Community conduct | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| Install surface | [code/README.md](code/README.md) |

## Contributing, Security, Support

| Need | Route |
| --- | --- |
| Contribution rules and docs hygiene | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Community conduct and evidence norms | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| Vulnerability reporting and secret-exposure handling | [SECURITY.md](SECURITY.md) |
| Reader routing and response expectations | [docs/SUPPORT.md](docs/SUPPORT.md) |
