<p>
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE-IMC Masthead" width="100%">
</p>

# ZPE-IMC

[![CI](https://github.com/zer0pa/zpe-imc/actions/workflows/imc-ci.yml/badge.svg)](https://github.com/zer0pa/zpe-imc/actions/workflows/imc-ci.yml)
[![PyPI](https://img.shields.io/pypi/v/zpe-multimodal)](https://pypi.org/project/zpe-multimodal/)
[![Python](https://img.shields.io/badge/python-3.11%20%7C%203.12-blue)](https://github.com/zer0pa/zpe-imc)
[![License](https://img.shields.io/badge/license-SAL%20v5.1-orange)](https://github.com/zer0pa/zpe-imc/blob/main/LICENSE)

---

## What This Is

ZPE-IMC (Integrated Modality Codec) is the integration and dispatch layer for the Zero-Point Encoding architecture family. Where each sibling ZPE codec repo handles a single domain — mocap, geospatial, finance — IMC unifies all 10 modalities (text, emoji, diagram, image, music, voice, mental, touch, smell, taste) into one encode/decode pipeline through a single Python package: [`zpe-multimodal`](https://pypi.org/project/zpe-multimodal/).

The canonical proof surface is the Wave-1 demo run, which streams all 10 modalities through the encoder and produces a deterministic output of **844 ZPE words** — the unified pipeline processed text, image, audio, and sensation inputs in a single pass and the output is bitwise reproducible. On the benchmark suite, the encoder processes all 10 modalities at approximately **54,800 words/sec** with every roundtrip verified lossless. The demo run passed 153/153 tests with a determinism hash match.

All current evidence is bounded to synthetic and reference inputs. No real-world production workload validation exists.

**Readiness: staged, synthetic evidence only.** Public repository. No production workload validation.

**Not claimed:** Production deployment readiness, specialist-encoder parity, CLI/demo equivalence, audio support beyond Python 3.11/3.12.

Part of the [Zer0pa](https://github.com/Zer0pa) family. Sibling codec repos: [ZPE-Bio](https://github.com/Zer0pa/ZPE-Bio), [ZPE-FT](https://github.com/Zer0pa/ZPE-FT), [ZPE-Geo](https://github.com/Zer0pa/ZPE-Geo), [ZPE-Ink](https://github.com/Zer0pa/ZPE-Ink), [ZPE-IoT](https://github.com/Zer0pa/ZPE-IoT), [ZPE-Mocap](https://github.com/Zer0pa/ZPE-Mocap), [ZPE-Neuro](https://github.com/Zer0pa/ZPE-Neuro), [ZPE-Prosody](https://github.com/Zer0pa/ZPE-Prosody), [ZPE-Robotics](https://github.com/Zer0pa/ZPE-Robotics), [ZPE-XR](https://github.com/Zer0pa/ZPE-XR).

| Field | Value |
| --- | --- |
| Architecture | MULTIMODAL_DISPATCH |
| Encoding | UNIFIED_20BIT_WORD |

## Key Metrics

| Metric | Value | Baseline | Tag |
| --- | --- | --- | --- |
| Modalities | 10 | — | UNIFIED |
| Encode Throughput | ~54,800 words/sec | — | ALL_MODALITIES |
| Wave-1 Tests | 153/153 | — | PASS |
| Roundtrip Fidelity | 10/10 | — | ALL_MODALITIES |

## What We Prove

- Unified 20-bit word envelope dispatches across all 10 modalities through a single API
- Deterministic roundtrip encoding and decoding verified for every modality
- Mixed-stream demo produces a canonical 844-word output with bitwise reproducible hash
- Per-lane regression suite (62/62 PASS) maintained independently from sibling codec repos
- ONNX export parity achieved for the tokenizer operator

## What We Don't Claim

- Production deployment readiness
- Performance parity with single-modality specialist encoders
- Validation on real-world production workloads
- CLI surface equivalence to demo path (tracked 780 vs 844 word split)
- Audio toolchain support beyond Python 3.11/3.12

## Commercial Readiness

| Field | Value |
| --- | --- |
| Verdict | STAGED |
| Commit SHA | 933adca9 |
| Confidence | 85% |
| Source | `v0.0/proofs/artifacts/modality_benchmarks.json` |

## Tests and Verification

| Code | Check | Verdict |
| --- | --- | --- |
| V_01 | Wave-1 runtime test suite (153/153) | PASS |
| V_02 | Modality roundtrip (10/10) | PASS |
| V_03 | Regression battery (62/62) | PASS |
| V_04 | Determinism hash match | PASS |
| V_05 | ONNX export parity | PASS |
| V_06 | Mixed-stream canonical count (844) | PASS |
| V_07 | Taste regression (2 legacy path tests) | FAIL |
| V_08 | CLI/demo parity (780 vs 844) | FAIL |
| V_09 | Path portability cleanup | INC |

## Proof Anchors

| Path | State |
| --- | --- |
| `v0.0/proofs/artifacts/modality_benchmarks.json` | VERIFIED |
| `v0.0/proofs/artifacts/2026-02-24_program_maximal/A6/metrics/onnx_parity.json` | VERIFIED |
| `v0.0/proofs/artifacts/2026-02-24_program_maximal/A6/TEST_RESULTS.md` | VERIFIED |
| `v0.0/proofs/artifacts/2026-02-24_program_maximal/A6/CHECKSUMS.sha256` | VERIFIED |
| `v0.0/proofs/artifacts/2026-02-24_program_maximal/A6/DELIVERY.md` | VERIFIED |

## Repo Shape

| Field | Value |
| --- | --- |
| Proof Anchors | 5 |
| Modality Lanes | 10 |
| Authority Source | `v0.0/proofs/artifacts/modality_benchmarks.json` |

## Quick Start

```bash
git clone https://github.com/zer0pa/zpe-imc
cd zpe-imc
pip install zpe-multimodal
python v0.0/executable/demo.py
```

Expected output: the demo runs all 10 modalities and prints the canonical mixed-stream word count (`total_words: 844`). This is the authority proof path.

## Ecosystem

| Workstream | Route | Notes |
| --- | --- | --- |
| ZPE-Bio | [github.com/Zer0pa/ZPE-Bio](https://github.com/Zer0pa/ZPE-Bio) | Biology codec workstream |
| ZPE-FT | [github.com/Zer0pa/ZPE-FT](https://github.com/Zer0pa/ZPE-FT) | Finance codec workstream |
| ZPE-Geo | [github.com/Zer0pa/ZPE-Geo](https://github.com/Zer0pa/ZPE-Geo) | Geospatial codec workstream |
| ZPE-Ink | [github.com/Zer0pa/ZPE-Ink](https://github.com/Zer0pa/ZPE-Ink) | Handwriting codec workstream |
| ZPE-IoT | [github.com/Zer0pa/ZPE-IoT](https://github.com/Zer0pa/ZPE-IoT) | IoT telemetry codec workstream |
| ZPE-Mocap | [github.com/Zer0pa/ZPE-Mocap](https://github.com/Zer0pa/ZPE-Mocap) | Motion capture codec workstream |
| ZPE-Neuro | [github.com/Zer0pa/ZPE-Neuro](https://github.com/Zer0pa/ZPE-Neuro) | Neural signal codec workstream |
| ZPE-Prosody | [github.com/Zer0pa/ZPE-Prosody](https://github.com/Zer0pa/ZPE-Prosody) | Speech prosody codec workstream |
| ZPE-Robotics | [github.com/Zer0pa/ZPE-Robotics](https://github.com/Zer0pa/ZPE-Robotics) | Robotics codec workstream |
| ZPE-XR | [github.com/Zer0pa/ZPE-XR](https://github.com/Zer0pa/ZPE-XR) | XR spatial codec workstream |
| Package | [v0.0/code/README.md](v0.0/code/README.md) | Installable `zpe-multimodal` package |
| Proof corpus | [v0.0/proofs/](v0.0/proofs/) | Evidence and benchmark artifacts |

---

## Lane Status

Workstream-level status for the IMC platform and sibling codecs reporting through IMC.

| Workstream | Status |
| --- | --- |
| IMC Wave-1 | GO (7/7 phase gates PASS; 52/52 regression PASS) |
| IoT Wave-1 | READY_FOR_USER_RATIFICATION (27/27 strict DT PASS) |
| Bio Wave-1 | GO (RC rehearsal: 38 tests passed) |
| Sector board | GO_QUALIFIED=6, INCONCLUSIVE=1, NO_GO/FAIL=3 |
| Tokenizer | INCONCLUSIVE_FOR_DEPLOYMENT |

### 844-Word Canonical Breakdown

The 844-word count comes from the Wave-1 demo run which streams all 10 modalities. This table shows how it has been verified at multiple checkpoints.

| Checkpoint | Word Count | Evidence |
| --- | --- | --- |
| Runtime snapshot anchor | 844 | 153/153 tests, determinism hash match |
| Post-lane integration anchor | 844 | 62/62 regression PASS |
| Family contract freeze | 844 | wave1.0 metric authority |
| CLI surface (non-canonical) | 780 | Tracked split; demo path remains authority |

### Per-Lane Verification

| Lane | Verification | Key Metric |
| --- | --- | --- |
| TEXT_EMOJI | pytest=9 passed; determinism cases 12 | Mixed-stream text count 52 |
| DIAGRAM_IMAGE | pytest=16 passed; mean distance 0.44–0.79 | Enhancement PSNR 45.95 dB |
| MUSIC | Events 4; packed words 34 | Mixed-stream music count 42 |
| VOICE | all_pass=true; replay all_same=true | Mixed-stream voice count 70 |
| MENTAL | pytest=28 passed | Mixed-stream mental count 7 |
| TOUCH | pytest=20 passed | Raw:549 → ZPE:87 |
| SMELL | Comparator cases 116 | Mixed-stream smell count 6 |
| TASTE | Merged unique InChIKey 13510; anchor cases 6 | Mixed-stream taste count 29 |

---

## Open Risks (Non-Blocking)

- CLI and demo surfaces report different stream counts (780 vs 844 words); canonical authority remains the demo path at 844.
- Optional audio dependency chain may fail on Python 3.14; Python 3.11/3.12 is the practical baseline.
- Some scripts and docs still include machine-absolute paths and need portability cleanup.
- Taste regression coverage contains 2 failing tests tied to legacy hardcoded paths.
- Legal text finalization is pending owner-supplied content in [LICENSE](LICENSE).

| Risk | Current State |
| --- | --- |
| Authority metric | 844 canonical |
| Audio toolchain | Python 3.11/3.12 baseline |
| Path portability | Cleanup pending |
| Taste regression | 2 failing tests remain |
| Legal text | Owner-supplied content pending |

## Contributing, Security, Support

- Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- Security policy and reporting: [SECURITY.md](SECURITY.md)
- User support channel guide: [v0.0/docs/SUPPORT.md](v0.0/docs/SUPPORT.md)
- Frequently asked questions: [v0.0/docs/FAQ.md](v0.0/docs/FAQ.md)
- Contact: `architects@zer0pa.ai`
