<p align="center">
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE Prosody Masthead" width="100%">
</p>

---

<a id="commercial-front-door"></a>

<a id="what-this-is"></a>
## What This Is

<p>
  <img src=".github/assets/readme/section-bars/what-this-is.svg" alt="WHAT THIS IS" width="100%">
</p>
ZPE-Prosody applies the ZPE deterministic 8-primitive encoding architecture to speech-prosody signals — pitch, rhythm, stress patterns. This is the voice-analytics lane of the Zer0pa family, and **the current lane verdict is FAIL**.

Gate-by-gate: **PRO-C001 PASS** (codec round-trip fidelity), **PRO-C002 PASS** (deterministic reproducibility), **PRO-C003 PASS** (prosodic feature extraction), **PRO-C004 PASS** (test coverage). **PRO-C005 PAUSED_EXTERNAL** (blocked on external dependency). **PRO-C006 FAIL** — retrieval closure on the accepted path is below threshold. Authority bundle: `proofs/artifacts/2026-02-20_zpe_prosody_wave1/`.

The architecture applies. Four of six gates pass. But the lane has not cleared — retrieval closure failed and an external dependency blocks a fifth gate. This repo exists to demonstrate that the ZPE encoding approach extends to speech domains, and to preserve auditable claim tracking for future work.

**Readiness: private-stage, lane verdict FAIL.** Not a public release surface. No commercial-safe transfer closure. No Phase 4.5 performance augmentation or Phase 5 blind-clone verification.

`ZPE Prosody` is the private staging repository for the ZPE Prosody Wave-1 lane. It is the authority surface for lane status and accepted claims, and it is not a public release surface.

| Field | Value |
|-------|-------|
| Architecture | PROSODIC_CONTOUR |
| Encoding | F0_DELTA_V1 |

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <a href="#quickstart"><img src=".github/assets/readme/nav/quickstart-and-license.svg" alt="Quickstart" width="180"></a>
    </td>
    <td align="center">
      <a href="#what-this-is"><img src=".github/assets/readme/nav/what-this-is.svg" alt="What This Is" width="180"></a>
    </td>
    <td align="center">
      <a href="#canonical-authority"><img src=".github/assets/readme/nav/current-authority.svg" alt="Current Authority" width="180"></a>
    </td>
    <td align="center">
      <a href="#supporting-docs"><img src=".github/assets/readme/nav/go-next.svg" alt="Go Next" width="180"></a>
    </td>
  </tr>
</table>

## Key Metrics

| Metric | Value | Baseline | Tag |
|--------|-------|----------|-----|
| F0 RMSE | 1.44 Hz | WORLD ~5–10 Hz | LIBRISPEECH |
| Timing Error | 0.0 ms | — | PERFECT |
| Encode Latency | 2.67 ms | — | PER_UTTERANCE |
| Lane Verdict | FAIL | — | RETRIEVAL_BLOCKED |

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.5.gif" alt="ZPE Prosody Lower Insert" width="100%">
</p>

## What We Prove

- Contour channels (f0, energy, duration) decomposed into directional primitives
- Codec round-trip fidelity verified with F0 RMSE 1.44 Hz (vs WORLD ~5–10 Hz)
- Deterministic reproducibility across encode-decode cycles confirmed
- Architecture extends ZPE encoding approach to non-spatial speech domains

## What We Don't Claim

<p>
  <img src=".github/assets/readme/section-bars/out-of-scope.svg" alt="OUT OF SCOPE" width="100%">
</p>
- No claim of lane pass (verdict is FAIL)
- No claim of retrieval closure above threshold (PRO-C006 FAIL)
- No claim of external dependency resolution (PRO-C005 PAUSED)
- No claim of release readiness or commercial transfer

## Commercial Readiness

<a id="canonical-authority"></a>
<p>
  <img src=".github/assets/readme/section-bars/lane-status-snapshot.svg" alt="LANE STATUS SNAPSHOT" width="100%">
</p>
| Field | Value |
|-------|-------|
| Verdict | FAIL |
| Commit SHA | 27fecfdc506f |
| Confidence | 67% |
| Source | proofs/FINAL_STATUS.md |

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.6.gif" alt="ZPE Prosody Authority Insert" width="100%">
</p>

## Tests and Verification

| Code | Check | Verdict |
|------|-------|---------|
| V_01 | Codec round-trip fidelity (PRO-C001) | PASS |
| V_02 | Deterministic reproducibility (PRO-C002) | PASS |
| V_03 | Prosodic feature extraction (PRO-C003) | PASS |
| V_04 | Test coverage (PRO-C004) | PASS |
| V_05 | External dependency resolution (PRO-C005) | INC |
| V_06 | Retrieval closure (PRO-C006) | FAIL |

## Proof Anchors

| Path | State |
|------|-------|
| proofs/FINAL_STATUS.md | VERIFIED |
| proofs/PROOF_INDEX.md | VERIFIED |
| proofs/artifacts/2026-02-20_zpe_prosody_wave1/ | VERIFIED |

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-2.gif" alt="ZPE Prosody Mid Masthead" width="100%">
</p>

<a id="supporting-docs"></a>
<p>
  <img src=".github/assets/readme/section-bars/where-to-go.svg" alt="WHERE TO GO" width="100%">
</p>
Supporting docs and authority anchors (start here for verification):
- `docs/CANONICAL_DOC_REGISTRY.md`
- `proofs/PROOF_INDEX.md`
- `proofs/FINAL_STATUS.md`
- `AUDITOR_PLAYBOOK.md`
- `PUBLIC_AUDIT_LIMITS.md`
- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/LEGAL_BOUNDARIES.md`

## Repo Shape

<p>
  <img src=".github/assets/readme/section-bars/repo-shape.svg" alt="REPO SHAPE" width="100%">
</p>
| Field | Value |
|-------|-------|
| Proof Anchors | 3 |
| Modality Lanes | 1 |
| Authority Source | proofs/FINAL_STATUS.md |

- `src/zpe_prosody/`: lane package
- `scripts/`: gate and packaging scripts
- `tests/`: unit coverage
- `data/fixtures/`: deterministic fixtures
- `proofs/`: proof index, final status, runbooks, adjudicated bundle
- `docs/`: architecture, legal boundaries, release-contract notes

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-3.gif" alt="ZPE Prosody Lower Masthead" width="100%">
</p>

## Quick Start

<a id="quickstart"></a>
<p>
  <img src=".github/assets/readme/section-bars/quick-start.svg" alt="QUICK START" width="100%">
</p>
```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
make repo-sanity
make package-sanity
make test
```
Optional install surfaces:
- `python -m pip install ".[api]"` for the FastAPI/Uvicorn wrapper
- `python -m pip install ".[benchmarks]"` for the NumPy-backed benchmark helpers

Technical release truth:
- The base wheel ships only the `src/zpe_prosody` package.
- `scripts/` remains a repo-local operational harness, not an installed CLI surface.
- `make package-sanity` builds sdist and wheel, then verifies isolated base, `api`, and `benchmarks` installs from the built wheel.

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3.4.gif" alt="ZPE Prosody Upper Insert" width="100%">
</p>

## Ecosystem

<p>
  <img src=".github/assets/readme/section-bars/family-alignment.svg" alt="ZPE ECOSYSTEM" width="100%">
</p>
This package is part of the [Zer0pa ZPE](https://github.com/Zer0pa) codec portfolio.

See also:
- [ZPE-IMC](https://github.com/Zer0pa/ZPE-IMC)
- `zpe-iot`
- `zpe-xr`
- `zpe-robotics`
- `zpe-geo`
- `zpe-finance`
- `zpe-ink`
- `zpe-neuro`
- `zpe-mocap`
- `zpe-bio`
