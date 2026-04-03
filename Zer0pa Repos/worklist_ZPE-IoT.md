# ZPE-IoT — Initial Worklist
> **Repo**: [github.com/Zer0pa/ZPE-IoT](https://github.com/Zer0pa/ZPE-IoT)
> **Full Name**: ZPE-IoT V0.0 — Deterministic IoT Sensor Codec
> **Tagline**: 1D Time-Series | Chemosense | 17× Mean Compression | Rust Core | PyO3 Native | Edge-Deployable
> **License**: Zer0pa SAL v6.0

---

## Key Metrics

| Metric | Value | Evidence |
|---|---|---|
| Mean Compression | **17.16×** | E1 benchmark |
| E1 Wins | **10/11** vs comparators | bench summary |
| Preflight Gates | **27/27 PASS** | preflight report |
| DT Gates | **17 PASS / 0 FAIL / 1 DEFERRED** | — |
| Strict DT | **PASS** | DT report |
| Native Wheel | Verified | phase 7 verification |

## What It Is
- Deterministic sensor compression SDK for 1D IoT time-series
- Canonical Rust core in `core/`, exposed through Python via PyO3 native build
- Chemosense packetization — unique sensor modality
- Edge-deployable architecture
- DS-01 through DS-12 dataset coverage (DS-11 blocked)

## Topics / SEO Keywords
`IoT` `sensor` `compression` `edge-computing` `time-series` `Rust` `PyO3` `chemosense` `deterministic`

## Website Content Hooks
- [ ] Hero stat: 17× compression, 10/11 benchmark wins
- [ ] Edge-deployable — key for IoT narrative
- [ ] Rust core + PyO3 — performance + Python accessibility story
- [ ] Chemosense as novel modality
- [ ] 27/27 preflight gates — trust/quality angle
- [ ] Link to `docs/BENCHMARKS.md` & `docs/API.md`

## Open Risks to Note on Site
- DS-11 blocked
- Tag/index publication deferred pending owner approval
- Private-stage; not public package yet

## Key Repo Docs for Copy Source
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/BENCHMARKS.md`
- `docs/CLI_CONTRACT.md`
- `AUDITOR_PLAYBOOK.md`
- `proofs/PROOF_INDEX.md`
- `docs/RELEASE_CHECKLIST.md`
