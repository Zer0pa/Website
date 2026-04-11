<p>
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE-Ink Masthead" width="100%">
</p>

# ZPE-Ink

Deterministic digital-ink codec centered on the `.zpink` packet format. This repo is a private staging snapshot with a current proof subset and rerun surface. It is not release-ready.

<p>
  <img src=".github/assets/readme/section-bars/what-this-is.svg" alt="WHAT THIS IS" width="100%">
</p>

## What This Is

ZPE-Ink is the staged codec surface for `.zpink` stream encoding and decoding. The installable release unit is the Python package under `code/`. The Rust/WASM/Swift/C# bindings are repo-local source surfaces and are not part of the pip install unit.

| Field | Value |
|-------|-------|
| Architecture | STROKE_MANIFOLD |
| Encoding | INK_DELTA_V1 |

## Key Metrics

| Metric | Value | Baseline | Tag |
|--------|-------|----------|-----|
| Compression | 5.59× | brotli 6.83× | VS_RAW_FLOAT32 |
| Bindings | 5 langs | — | PY_RUST_WASM_SWIFT_CS |
| Round Trip | lossless | — | DETERMINISTIC |
| Release | FAIL | — | NOT_READY |

## What We Prove

- Dual-layer encoding: exact delta values plus 8-code compass direction tokens
- Cross-runtime decode parity verified across Python, Rust, WASM, Swift, and C#
- Gestural search queries ink strokes by directional motif on compressed data
- Header contracts (magic, version, header size) enforced across all 5 bindings

<p>
  <img src=".github/assets/readme/section-bars/open-risks-non-blocking.svg" alt="OPEN RISKS (NON-BLOCKING)" width="100%">
</p>

## What We Don't Claim

- No claim of release readiness (release surface FAIL)
- No claim of blind-clone closure (INCONCLUSIVE)
- No claim of hard-corpus pass
- No claim of general digital-ink dominance

<p>
  <img src=".github/assets/readme/section-bars/quickstart-and-authority-point.svg" alt="QUICKSTART AND AUTHORITY POINT" width="100%">
</p>

## Commercial Readiness

| Field | Value |
|-------|-------|
| Verdict | INCONCLUSIVE |
| Commit SHA | 98b5ed734735 |
| Confidence | 67% |
| Source | proofs/INK_WAVE1_RELEASE_READINESS_REPORT.md |

Current authority reflects the latest committed verification surface. It does not imply release readiness.
Confidence basis: 4/6 verification checks currently PASS.

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-2.gif" alt="ZPE-Ink Masthead Option 3.2" width="100%">
</p>

<p>
  <img src=".github/assets/readme/section-bars/lane-status-snapshot.svg" alt="LANE STATUS SNAPSHOT" width="100%">
</p>

## Tests and Verification

| Code | Check | Verdict |
|------|-------|---------|
| V_01 | Structured-tier compression boundary | PASS |
| V_02 | Python/Rust/WASM parity | PASS |
| V_03 | Swift/C# header contracts | PASS |
| V_04 | Pytest regression surface | PASS |
| V_05 | Sovereign release surface | FAIL |
| V_06 | Blind-clone closure | INC |

## Proof Anchors

| Path | State |
|------|-------|
| proofs/INK_WAVE1_RELEASE_READINESS_REPORT.md | VERIFIED |
| proofs/runbooks/20260321T005520Z_codex_receipt.md | VERIFIED |
| proofs/logs/20260321_technical_alignment_cross_runtime.json | VERIFIED |
| proofs/logs/20260321_technical_alignment_binding_contracts.json | VERIFIED |
| proofs/logs/20260321_technical_alignment_pytest.txt | VERIFIED |
| proofs/logs/20260321_technical_alignment_wheel_install.txt | VERIFIED |

Any contradiction across these anchors keeps the repo `INCONCLUSIVE`.

<p>
  <img src=".github/assets/readme/section-bars/repo-shape.svg" alt="REPO SHAPE" width="100%">
</p>

## Repo Shape

| Field | Value |
|-------|-------|
| Proof Anchors | 6 |
| Modality Lanes | 6 |
| Authority Source | proofs/INK_WAVE1_RELEASE_READINESS_REPORT.md |

<p>
  <img src=".github/assets/readme/zpe-masthead-option-3-3.gif" alt="ZPE-Ink Masthead Option 3.3" width="100%">
</p>

## Quick Start

Prereqs for local verification: Python 3.11+, Rust toolchain, and `wasm32-unknown-unknown` target for binding checks.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e './code[dev]'
python -m pytest code/tests -q
python -m zpe_ink demo
python -m zpe_ink verify-roundtrip
```

| Field | Value |
|-------|-------|
| Repository URL | `https://github.com/Zer0pa/ZPE-Ink` |
| Contact | `architects@zer0pa.ai` |

Verification anchors: `proofs/logs/20260321_technical_alignment_pytest.txt`, `proofs/logs/20260321_technical_alignment_wheel_install.txt`.

<p>
  <img src=".github/assets/readme/section-bars/contributing-security-support.svg" alt="CONTRIBUTING, SECURITY, SUPPORT" width="100%">
</p>

## Ecosystem

- [ZPE-IMC](https://github.com/Zer0pa/ZPE-IMC) - reference repo for shared documentation layout and proof-surface conventions.
- [ZPE-Mocap](https://github.com/Zer0pa/ZPE-Mocap) - adjacent motion-stream codec in the ZPE transport family.
- [ZPE-XR](https://github.com/Zer0pa/ZPE-XR) - sibling XR motion compression surface with multi-runtime packaging work.

| Route | Target |
|-------|--------|
| Documentation index | `docs/README.md` |
| Auditor path | `AUDITOR_PLAYBOOK.md` |
| Governance rules | `GOVERNANCE.md` |
| Release gate rules | `RELEASING.md` |
| Contribution workflow | `CONTRIBUTING.md` |
| Security policy | `SECURITY.md` |
| Support routing | `docs/SUPPORT.md` |
