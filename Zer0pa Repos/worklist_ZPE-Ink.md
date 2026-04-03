# ZPE-Ink — Initial Worklist
> **Repo**: [github.com/Zer0pa/ZPE-Ink](https://github.com/Zer0pa/ZPE-Ink)
> **Full Name**: ZPE-Ink V0.0 — Deterministic Digital Ink Codec
> **Tagline**: .zpink Streams | Stroke Compression | 5×+ vs Float32 | Rust | WASM | Swift | C# Cross-Runtime
> **License**: Zer0pa SAL v6.0

---

## Key Metrics

| Metric | Value | Evidence |
|---|---|---|
| Structured-tier CR | **5.59×** vs raw float32 | `baseline_results.json` |
| Brotli comparator | **6.83×** | baseline |
| MathWriting CR | **1.09×** | baseline |
| CROHME CR | **1.30×** | baseline |
| Calliar CR | **2.77×** | `calliar_benchmark.json` |
| Cross-runtime parity | **PASS** | local logs |
| Sovereign release | **FAIL** | contradiction manifest |
| Blind clone | **INCONCLUSIVE** | — |

## What It Is
- Deterministic digital-ink codec centered on `.zpink` packet format
- Python install surface + repo-local Rust/WASM/Swift/C# bindings
- Structured-tier compression exceeds 5× vs raw float32
- Cross-runtime parity (Rust, WASM, Swift, C#) — unique multi-platform angle

## Topics / SEO Keywords
`digital-ink` `handwriting` `stroke-compression` `WASM` `Swift` `C#` `cross-runtime` `codec` `zpink`

## Website Content Hooks
- [ ] Cross-runtime story: Rust → WASM → Swift → C# — write once, decode anywhere
- [ ] Digital ink / handwriting recognition use cases
- [ ] `.zpink` format as a new standard proposal
- [ ] 5×+ compression angle
- [ ] MathWriting & CROHME benchmark anchors

## Open Risks to Note on Site
- Sovereign release surface: FAIL
- Blind-clone verification: INCONCLUSIVE
- UNIPEN/IAM access unresolved
- Not release-ready

## Key Repo Docs for Copy Source
- `AUDITOR_PLAYBOOK.md`
- `GOVERNANCE.md`
- `docs/README.md`
