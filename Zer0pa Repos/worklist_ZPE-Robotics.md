# ZPE-Robotics — Initial Worklist
> **Repo**: [github.com/Zer0pa/ZPE-Robotics](https://github.com/Zer0pa/ZPE-Robotics)
> **Full Name**: ZPE-Robotics V0.0 — Deterministic Motion Kernel
> **Tagline**: Wire-V1 Transport | Replay | Search Without Decode | Anomaly Detection | 187× Real-Data
> **License**: Zer0pa SAL v6.0
> **Package**: `pip install zpe-motion-kernel` (v0.1.0 — **publicly installable**)

---

## Key Metrics

| Metric | Value | Evidence |
|---|---|---|
| Real-data Compression | **187.13×** | `lerobot/columbia_cairlab_pusht_real` |
| Named Blockers | B1, B2, B3, B4, B5 | `ENGINEERING_BLOCKERS.md` |

## What It Is
- Public repo for `zpe-motion-kernel` — standalone Python package
- Frozen wire-v1 motion transport, replay, search, and audit workflows
- `.zpbot` file format for robotics motion data
- Search-without-decode capability — query compressed data directly
- Anomaly detection built-in
- 1 public release on GitHub
- Engineering surface in blocker-state (March 21 evidence)

## Topics / SEO Keywords
`robotics` `motion-kernel` `wire-v1` `replay` `anomaly-detection` `compression` `search` `lerobot` `motion-planning`

## Website Content Hooks
- [ ] **Only publicly pip-installable package** in the family — lead with this
- [ ] 187× compression on real data — strongest headline number
- [ ] Search-without-decode — unique technical differentiator
- [ ] Anomaly detection — safety/inspection angle
- [ ] `.zpbot` format as robotics data standard
- [ ] LeRobot/Columbia benchmark anchoring
- [ ] Link to `docs/OPERATOR_RUNBOOK.md` for practitioner credibility

## Open Risks to Note on Site
- 5 named engineering blockers (B1–B5)
- Blocker-state docs are authority, not the package release alone
- No IMC runtime import coupling

## Key Repo Docs for Copy Source
- `docs/AUDITOR_PLAYBOOK.md`
- `docs/OPERATOR_RUNBOOK.md`
- `docs/RELEASE_CANDIDATE.md`
- `proofs/ENGINEERING_BLOCKERS.md`
- `proofs/enterprise_benchmark/GATE_VERDICTS.json`
- `proofs/red_team/red_team_report.json`
- `CITATION.cff`
