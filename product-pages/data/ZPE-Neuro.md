<h1 align="center">ZPE-Neuro</h1>

<p align="center">
  <img src=".github/assets/readme/zpe-masthead.gif" alt="ZPE-Neuro Masthead" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-SAL%20v6.0-e5e7eb?labelColor=111111" alt="License: SAL v6.0"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/python-3.11-e5e7eb?labelColor=111111" alt="Python 3.11"></a>
  <a href="proofs/manifests/CURRENT_AUTHORITY_PACKET.md"><img src="https://img.shields.io/badge/authority-2026--03--21%20repo%20snapshot-e5e7eb?labelColor=111111" alt="Authority: 2026-03-21 repo snapshot"></a>
  <a href="RELEASING.md"><img src="https://img.shields.io/badge/release-private%20staged-e5e7eb?labelColor=111111" alt="Release: private staged"></a>
  <a href="docs/LEGAL_BOUNDARIES.md"><img src="https://img.shields.io/badge/lane-extracellular%20recording-e5e7eb?labelColor=111111" alt="Lane: extracellular recording"></a>
</p>
<p align="center">
  <a href="AUDITOR_PLAYBOOK.md"><img src="https://img.shields.io/badge/quick%20verify-audit%20path-e5e7eb?labelColor=111111" alt="Quick verify"></a>
  <a href="docs/ARCHITECTURE.md"><img src="https://img.shields.io/badge/architecture-runtime%20map-e5e7eb?labelColor=111111" alt="Architecture runtime map"></a>
  <a href="PUBLIC_AUDIT_LIMITS.md"><img src="https://img.shields.io/badge/limits-honest%20reading-e5e7eb?labelColor=111111" alt="Honest reading limits"></a>
  <a href="docs/README.md"><img src="https://img.shields.io/badge/docs-canonical%20registry-e5e7eb?labelColor=111111" alt="Canonical docs registry"></a>
</p>

<table align="center" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="25%"><a href="#what-this-is"><img src=".github/assets/readme/nav/what-this-is.svg" alt="What This Is" width="100%"></a></td>
    <td width="25%"><a href="#current-authority"><img src=".github/assets/readme/nav/current-authority.svg" alt="Current Authority" width="100%"></a></td>
    <td width="25%"><a href="#runtime-proof-wave-1"><img src=".github/assets/readme/nav/runtime-proof.svg" alt="Runtime Proof" width="100%"></a></td>
    <td width="25%"><a href="#quickstart-and-license"><img src=".github/assets/readme/nav/quickstart-and-license.svg" alt="Quickstart and License" width="100%"></a></td>
  </tr>
  <tr>
    <td width="25%"><a href="#proof-corpus"><img src=".github/assets/readme/nav/proof-corpus.svg" alt="Proof Corpus" width="100%"></a></td>
    <td width="25%"><a href="#open-risks"><img src=".github/assets/readme/nav/open-gaps.svg" alt="Open Risks" width="100%"></a></td>
    <td width="25%"><a href="#go-next"><img src=".github/assets/readme/nav/go-next.svg" alt="Go Next" width="100%"></a></td>
    <td width="25%"><a href="docs/README.md"><img src=".github/assets/readme/nav/docs-registry.svg" alt="Docs Registry" width="100%"></a></td>
  </tr>
</table>

---

<p>
  <img src=".github/assets/readme/section-bars/what-this-is.svg" alt="WHAT THIS IS" width="100%">
</p>

<a id="commercial-front-door"></a>
<a id="what-this-is"></a>
## What This Is

ZPE-Neuro applies the ZPE deterministic 8-primitive encoding architecture to extracellular neural recordings. It is the neuro-signal lane of the Zer0pa family, scoped strictly to extracellular data rather than broad neural generality.

The strongest current evidence is DANDI 000034 extracellular validation with deterministic round-trip fidelity plus an IBL second-target PASS under bounded refinement conditions. Both datasets are real public datasets with auditable lineage routed through `proofs/manifests/CURRENT_AUTHORITY_PACKET.md`, and AJILE12 out-of-family handling is explicitly documented rather than silently excluded.

For neurotech research-infrastructure teams evaluating deterministic encoding for reproducible signal pipelines, this repo is the inner repository for the Wave-1 neural signal package, the current curated proof corpus, and the release-surface documentation for the Neuro workstream. It remains a private staged repo, not a tagged public release, and the proof corpus under `proofs/` carries the current manifest lineage.

The current scope lock remains a narrower extracellular lane. The strongest honest repo claim is a truthful Python package surface plus a bounded evidence surface anchored on DANDI `000034`, a counted IBL second-target `PASS` under bounded refinement, explicit AJILE12 out-of-family handling, and unresolved blind-clone and commercialization gates.

| Field | Value |
|-------|-------|
| Architecture | SPIKE_STREAM |
| Encoding | NEURO_DELTA_V1 |

## Key Metrics

| Metric | Value | Baseline | Tag |
|--------|-------|----------|-----|
| Compression | 401× | NWB+gzip ~2–3× | DANDI_000034 |
| RMSE | 78.4 μV | — | PER_CHANNEL |
| IBL Compression | 224× | HDF5+lz4 ~5–15× | REAL_PROBE |
| Peak Recovery | 41/41 | — | ZERO_DROP |

## What We Prove

- Spike-event grammar tokenizes extracellular recordings into deterministic event windows
- Event-layer reconstruction preserves peak morphology (41/41 zero-drop recovery)
- DANDI 000034 public anchor: real-world validation with auditable lineage
- IBL second-target PASS under bounded refinement conditions
- AJILE12 out-of-family boundary explicitly documented as limitation, not gap

## What We Don't Claim

- No claim of blind-clone verification
- No claim of commercialization-safe closure
- No claim of tagged release
- No claim beyond extracellular lane

<p>
  <img src=".github/assets/readme/section-bars/current-authority.svg" alt="CURRENT AUTHORITY" width="100%">
</p>

<a id="current-authority"></a>
## Commercial Readiness

| Field | Value |
|-------|-------|
| Verdict | STAGED |
| Commit SHA | da657d0e12a2 |
| Confidence | 100% |
| Source | proofs/manifests/CURRENT_AUTHORITY_PACKET.md |

### Authority Detail

| Field | Current truth | Authority |
|---|---|---|
| Authority snapshot date | `2026-03-21` | [proofs/manifests/CURRENT_AUTHORITY_PACKET.md](proofs/manifests/CURRENT_AUTHORITY_PACKET.md) |
| Repository / acquisition surface | Canonical GitHub repo: `https://github.com/Zer0pa/ZPE-Neuro` for authorized readers. Clone surface for authorized readers: `git clone https://github.com/Zer0pa/ZPE-Neuro.git`. | `AUDITOR_PLAYBOOK.md`, `docs/ARCHITECTURE.md` |
| Repo posture | `PRIVATE_STAGED`. Package, install, docs, and proof surfaces are aligned for the current repo state, but this is not a public release and not a clean-clone-closed authority packet. | `RELEASING.md`, `PUBLIC_AUDIT_LIMITS.md` |
| Top unresolved gate | A fresh clean-clone replay of the authority packet remains the top unresolved acceptance gate. | `RELEASING.md` |
| Gate status | `OPEN` for blind-clone and public-release gates. `PASS` for the current clean packaged baseline and the tracked release-alignment gate slice. | [proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/](proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/README.md) |
| Current lane / scope lock | Lane 1 is a narrow extracellular recording lane. AJILE12 is explicitly `OUT_OF_FAMILY` for the current codec; broader human or intracranial coverage is not claimed here. | `proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/public_corpus_summary.json` |
| Primary positive public anchor | DANDI `000034` remains the strongest positive public waveform anchor in the current repo surface. | `proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/public_corpus_summary.json` |
| Counted breadth verdict | `PASS` in the current bounded local evidence packet after the March 21 IBL refinement. This does not upgrade blind-clone status or broader release claims. | `proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/public_corpus_summary.json` |
| Family-boundary decision | `OUT_OF_FAMILY` for AJILE12 in the current lane. | `proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/public_corpus_summary.json` |
| Packaged clean baseline | `PASS` for the packaged `.`, `.[gate]`, `.[public]`, and `.[proof]` surfaces that are actually declared for clean install/import. IBL chunked-waveform tooling and Allen parity remain operator-only. | `proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/verification_summary.md`, `pyproject.toml`, `docs/ARCHITECTURE.md` |
| Blind-clone verification status | `OPEN` | `PUBLIC_AUDIT_LIMITS.md`, `RELEASING.md` |
| Release status | `NO_PUBLIC_RELEASE`. The current repo surface is documented and internally coherent, but no public-release verdict is claimed. | `RELEASING.md` |
| Commercialization status | `OPEN`. Allen parity and commercialization closure remain unresolved. | `docs/LEGAL_BOUNDARIES.md`, `RELEASING.md` |
| Primary authority artifacts | `proofs/manifests/CURRENT_AUTHORITY_PACKET.md`, `proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/`, `proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/` | `proofs/README.md` |
| Audit route | Start with the short replay path, then read the limits note before widening any claim. | `AUDITOR_PLAYBOOK.md`, `PUBLIC_AUDIT_LIMITS.md` |

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3-2.gif" alt="ZPE-Neuro Mid Masthead" width="100%">
</p>

<p>
  <img src=".github/assets/readme/section-bars/runtime-proof-wave-1.svg" alt="RUNTIME PROOF (WAVE-1)" width="100%">
</p>

<a id="runtime-proof-wave-1"></a>
## Tests and Verification

| Code | Check | Verdict |
|------|-------|---------|
| V_01 | DANDI 000034 public anchor | PASS |
| V_02 | IBL second-target bounded refinement | PASS |
| V_03 | AJILE12 family boundary memo | PASS |
| V_04 | Breadth adjudication summary | PASS |
| V_05 | Release-alignment Gate C summary | PASS |
| V_06 | Release-alignment Gate D summary | PASS |
| V_07 | Blind-clone authority replay | INC |

### Runtime Proof And Package Truth

| Surface | Current state | Why it matters |
|---|---|---|
| Core package build/import | `PASS` | The repo now ships a truthful Python package surface rather than relying on undeclared runtime assumptions. |
| Repo-local tests | `PASS` on the current shipped unit slice | The staged code surface has a small but real regression check that ships with the repo. |
| Synthetic gate baseline | `PASS` for sequential Gate C and Gate D replay in the current clean packaged gate stack | This is the strongest current shipped replay baseline in the repo. |
| Public replay import surface | `PASS` for the declared `.[proof]` import stack | This keeps the docs honest about what the packaged replay stack actually installs cleanly. |
| IBL and Allen operator paths | `OPERATOR_ONLY` | Those paths currently require manual dependency or toolchain work around `ONE-api`, `ibl-neuropixel`, `llvmlite` or `numba`, or `allensdk` conflicts and are intentionally not shipped as clean extras. |
| Release automation | `PASS` for static verification coverage | The repo now has a verification workflow that checks package, build, and install truth without implying a live publish pipeline or automated publish step. |

<p>
  <img src=".github/assets/readme/section-bars/proof-corpus.svg" alt="PROOF CORPUS" width="100%">
</p>

## Proof Anchors

| Path | State |
|------|-------|
| proofs/manifests/CURRENT_AUTHORITY_PACKET.md | VERIFIED |
| proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/verification_summary.md | VERIFIED |
| proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/gate_c_summary.json | VERIFIED |
| proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/gate_d_summary.json | VERIFIED |
| proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/public_corpus_eval_dandi_000034_mouse412804_ecephys.json | VERIFIED |
| proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/public_corpus_ibl_waveform_eval.json | VERIFIED |
| proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/ajile12_family_boundary_decision.md | VERIFIED |

## Repo Shape

| Field | Value |
|-------|-------|
| Proof Anchors | 7 |
| Modality Lanes | 1 |
| Authority Source | proofs/manifests/CURRENT_AUTHORITY_PACKET.md |

<a id="proof-corpus"></a>
### Proof Corpus

| Packet | Class | How to read it |
|---|---|---|
| [proofs/manifests/CURRENT_AUTHORITY_PACKET.md](proofs/manifests/CURRENT_AUTHORITY_PACKET.md) | `CURRENT` | The routing manifest for what is current, what is historical, and which packet owns each claim layer. |
| [proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/](proofs/selected_artifacts/2026-03-21_zpe_neuro_release_alignment/README.md) | `CURRENT` | Tracked summaries for the March 21 release-alignment technical pass. |
| [proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/](proofs/selected_artifacts/2026-03-21_zpe_neuro_ibl_refinement/README.md) | `CURRENT` | Current bounded local extracellular breadth packet, including the counted IBL second-target `PASS`. |
| [CHANGELOG.md](CHANGELOG.md) and [runbooks/README.md](runbooks/README.md) | `SUPPORTING` | Chronology, receipts, and operational history. Use them to understand how the current repo state was reached, not as current proof authority. |

<p>
  <img src=".github/assets/readme/section-bars/open-risks.svg" alt="OPEN RISKS" width="100%">
</p>

<a id="open-risks"></a>
### Open Risks

| Surface | Class | Current truth |
|---|---|---|
| Blind-clone authority pack | `OPEN` | The repo does not yet prove a fresh blind-clone authority replay. |
| Public release | `OPEN` | No tagged or public release readiness is claimed from this repo state. |
| IBL / Allen operator paths | `OPERATOR_ONLY` | These remain outside the clean packaged release surface because the upstream dependency chains are not currently truthful for a clean install. |
| Commercialization closure | `OPEN` | Allen parity and commercialization-safe closure remain unresolved. |
| Broader neural scope | `PARKED_BY_SCOPE` | Broader human or intracranial coverage is outside the current lane. |
| Historical path residue | `KNOWN_RESIDUE` | Some tracked runtime artifacts still contain machine-absolute paths inside captured traces. They are evidence lineage, not current filesystem instructions. |

<p>
  <img src=".github/assets/readme/section-bars/quickstart-and-license.svg" alt="QUICKSTART AND LICENSE" width="100%">
</p>

<a id="quickstart-and-license"></a>
## Quick Start

Acquire from the private GitHub repo if you have authorized access, then verify the shipped package surface from a checkout.

```bash
git clone https://github.com/Zer0pa/ZPE-Neuro.git
cd ZPE-Neuro

python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
python -c "import zpe_neuro"
```

Repo-local test slice:

```bash
python -m pip install -e '.[dev]'
python -m pytest tests
```

Repo-local synthetic gate slice:

```bash
python -m pip install -e '.[gate,dev]'
python tools/run_gate_c.py --artifact-root artifacts/manual_gate_c --seed 20260220
python tools/run_gate_d.py --artifact-root artifacts/manual_gate_d --replay-seeds 20260220,20260221,20260222,20260223,20260224
```

Repo-local clean public replay import surface:

```bash
python -m pip install -e '.[proof]'
```

The `tools/` runners are repo-local scripts, not installed console entry points. `LICENSE` is the legal source of truth. Read `docs/LEGAL_BOUNDARIES.md` before turning any repo result into a wider legal or commercial claim.

<p align="center">
  <img src=".github/assets/readme/zpe-masthead-option-3-3.gif" alt="ZPE-Neuro Lower Masthead" width="100%">
</p>

<p>
  <img src=".github/assets/readme/section-bars/where-to-go.svg" alt="WHERE TO GO" width="100%">
</p>

## Ecosystem

| Surface | Link | Role |
|---|---|---|
| Zer0pa portfolio namespace | [github.com/Zer0pa](https://github.com/Zer0pa) | Parent portfolio namespace for the workstream |
| ZPE-IMC reference repo | [github.com/Zer0pa/ZPE-IMC](https://github.com/Zer0pa/ZPE-IMC) | Shared docs and README reference line for structure and quality, not for inherited proof claims |
| Proof surface registry | [proofs/README.md](proofs/README.md) | Canonical proof surface entry points for this repo |
| Reproducing guide | [REPRODUCING.md](REPRODUCING.md) | Offline verify, public DANDI download, and benchmark replay commands for this repo |
| Open dataset surfaces | [docs/OPEN_DATASET_SURFACES.md](docs/OPEN_DATASET_SURFACES.md) | Verified next-step public breadth targets without widening the current extracellular lane claim |
| KiloSort4 operator note | [docs/KILOSORT4.md](docs/KILOSORT4.md) | Benchmark-only comparator guidance and current operator install posture |

<a id="go-next"></a>
### Where To Go

| Need | Start here |
|---|---|
| Shortest honest audit path | `AUDITOR_PLAYBOOK.md` |
| Current authority routing | `proofs/manifests/CURRENT_AUTHORITY_PACKET.md` |
| Architecture and package boundaries | `docs/ARCHITECTURE.md` |
| Limits and caveats | `PUBLIC_AUDIT_LIMITS.md`, `docs/LEGAL_BOUNDARIES.md` |
| Release gate | `RELEASING.md` |
| Support and contact routing | `docs/SUPPORT.md` |
| Canonical doc registry | `docs/README.md` |
