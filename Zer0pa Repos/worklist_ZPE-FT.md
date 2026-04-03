# ZPE-FT — Initial Worklist
> **Repo**: [github.com/Zer0pa/ZPE-FT](https://github.com/Zer0pa/ZPE-FT)
> **Full Name**: ZPE-FT V0.0 — Deterministic Financial Time-Series Codec
> **Tagline**: OHLCV | Tick Streams | Pattern Search | Market Replay | Subsecond Latency
> **License**: Zer0pa SAL v6.0 (free ≤ USD 100M revenue)
> **Languages**: Python 99.2% · Rust 0.8%

---

## Key Metrics (Wave-1 Controlled Corpus)

| Metric | Value | Evidence |
|---|---|---|
| OHLCV Compression | **19.19×** | `ft_ohlcv_benchmark.json` |
| Tick Compression | **20.57×** | `ft_tick_benchmark.json` |
| Pattern Search P@10 | **0.90** | proof bundle |
| Query Latency p95 | **0.0567 ms** | proof bundle |
| DB Backend | SQLite ✅ · Timescale INCONCLUSIVE | — |

## What It Is
- Deterministic financial time-series codec & pattern-search workstream
- Installable Python package + optional repo-local Rust helper
- Retained proof bundles for Wave-1 codec claims
- Enterprise benchmark still open (blocker: missing inputs)

## Topics / SEO Keywords
`python` `rust` `compression` `time-series` `trading` `fintech` `market-data` `codec` `pattern-recognition` `quantitative-finance` `algorithmic-trading` `transport-protocol` `information-theory` `computational-physics` `nature-inspired-algorithms` `geometric-unification`

## Website Content Hooks
- [ ] Hero stat card: 19–20× compression, sub-0.06ms query latency
- [ ] "Deterministic" messaging — no neural network, no training loop
- [ ] Financial use-case spotlight: OHLCV + tick streams + market replay
- [ ] Live link to GitHub repo README for technical detail
- [ ] Link to `AUDITOR_PLAYBOOK.md` for credibility/trust page
- [ ] Comet ML integration angle (observability hooks exist)

## Open Risks to Note on Site
- Enterprise benchmark not yet closed
- Timescale backend inconclusive
- Rust helper is opt-in; default is Python fallback

## Key Repo Docs for Copy Source
- `docs/ARCHITECTURE.md`
- `docs/AUDITOR_PLAYBOOK.md`
- `docs/PUBLIC_AUDIT_LIMITS.md`
- `docs/INTEGRATION_PATTERN.md`
- `proofs/CONSOLIDATED_PROOF_REPORT.md`
- `CITATION.cff`
