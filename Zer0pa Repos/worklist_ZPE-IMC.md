# ZPE-IMC — Initial Worklist
> **Repo**: [github.com/Zer0pa/ZPE-IMC](https://github.com/Zer0pa/ZPE-IMC)
> **Full Name**: ZPE-IMC V0.0 — Multimodal Multi-Sensorial Codec
> **Tagline**: Text | Emojis | Images | Diagrams | Voice | Music | Touch | Taste | Smell | Mental
> **License**: Zer0pa SAL v6.0

---

## Key Metrics

| Metric | Value | Evidence |
|---|---|---|
| Tests Passed | **170 operator / 169+1skip public** | canonical run |
| Throughput (total) | **276,799 words/sec** | Comet logged |
| Encode | **94,105 words/sec** | Comet |
| Decode | **296,146 words/sec** | Comet |
| Backend | **Rust** (compiled, no fallback) | — |

## What It Is
- Wave-1 integration & dispatch layer for Zero-Point Encoding
- Deterministic, CPU-native transport system — **no GPU, no neural network**
- 10 modalities through a single **20-bit transport word**
- 8 lane families: TEXT_EMOJI, DIAGRAM_IMAGE, MUSIC, VOICE, MENTAL, TOUCH, SMELL, TASTE
- Core claim: transport integrity across mixed modalities

## Topics / SEO Keywords
`multimodal` `multi-sensorial` `codec` `transport` `CPU-native` `deterministic` `emoji` `voice` `music` `touch` `taste` `smell`

## Website Content Hooks
- [ ] **Flagship repo** — this is the unifying IMC layer across all ZPE codecs
- [ ] Hero stat: 10 modalities, 1 transport word, 276K words/sec
- [ ] "No GPU, no neural network" messaging
- [ ] Sensorial modalities (touch, taste, smell) — highly unique differentiator
- [ ] Comet ML dashboard link for live proof
- [ ] Lane family architecture diagram opportunity

## Open Risks to Note on Site
- Pre-release; first tagged public release pending

## Key Repo Docs for Copy Source
- `proofs/logs/phase6_run_of_record_manifest.json`
- Comet dashboard: [Comet link](https://www.comet.com/zer0pa/zpe-imc-performance/)
