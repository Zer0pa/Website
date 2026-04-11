# ZPE Codec Product Pages — v7 BANKER FREEZE

> **Frozen:** 2026-04-11  
> **Scope:** 10 ZPE codec lane product pages  
> **Status:** LOCKED — Do not modify any artifact listed below

---

## What This Covers

The standalone Python generator and all supporting data for the 10 ZPE codec
repo product pages. These pages are complete, verified, and visually frozen at
**Banker v7**. Any future product-page work (ZPE-IMC, landing page) lives in
separate files and must not alter the artifacts below.

---

## Frozen Artifacts

### Generator (authoritative copy)

| File | MD5 | Lines |
|------|-----|-------|
| `generate_pages_BANKER.py` | `17ed15375608cf483bcb00ea46140f77` | 809 |
| `archive/generate_pages_v7_BANKER.py` | `17ed15375608cf483bcb00ea46140f77` | 809 |

`generate_pages_ITER.py` is the working copy (currently identical logic, diverged
only by the heading-alignment parser update). Future IMC work branches from ITER,
never from BANKER.

### Data Files (local README mirrors)

| File | MD5 |
|------|-----|
| `data/ZPE-Bio.md` | `52f2cd635f6e289489a4a46ed1bbf756` |
| `data/ZPE-FT.md` | `276679a11cf6e7045eeffb986077e0e1` |
| `data/ZPE-Geo.md` | `970503f5fba26391c276986a44df2ce3` |
| `data/ZPE-Ink.md` | `6d2a985c2c16076e9f1a1b1b02199349` |
| `data/ZPE-IoT.md` | `6a90f42666476980c8abefdb54e14b15` |
| `data/ZPE-Mocap.md` | `2d3517eff9d6ffb05699c170742fe87b` |
| `data/ZPE-Neuro.md` | `cf06bdf207e9b36d4834351c899c6888` |
| `data/ZPE-Prosody.md` | `0e10ff9818d270c9c0c140d94b37a7aa` |
| `data/ZPE-Robotics.md` | `4a8acf6f6443bac28c8b555d92701e8c` |
| `data/ZPE-XR.md` | `8cfaf0470ff9ae9eaaabc6a87ba300ae` |

### Generated HTML (output)

| File | MD5 |
|------|-----|
| `generated/ZPE-Bio.html` | `24438f600dc4ca9cc872f1e3be5dae01` |
| `generated/ZPE-FT.html` | `ec5ca55c6e2d35ed4eba41e5c32ee6b2` |
| `generated/ZPE-Geo.html` | `0fb12a5d808a948cbaeb9031b18a194d` |
| `generated/ZPE-Ink.html` | `ed5b2f2a4c29eeb4b3cfca401ad183cd` |
| `generated/ZPE-IoT.html` | `091c4ba3730f42730ec045d361fc5472` |
| `generated/ZPE-Mocap.html` | `ff838b7c18ba921f097d7df1750d63eb` |
| `generated/ZPE-Neuro.html` | `d3b435522fa37da2ea690f5b7f652554` |
| `generated/ZPE-Prosody.html` | `f98979ba03e292290cad336f7f50d4f9` |
| `generated/ZPE-Robotics.html` | `cd566333c12e1c92201eed17ed4b81e1` |
| `generated/ZPE-XR.html` | `dc28730add993ac8c6637d31dc604f3b` |

### Supporting Assets

| File | Purpose |
|------|---------|
| `ZER0PA LOGO.svg` | Header logo |
| `ZER0PA ICON.svg` | Favicon / compact mark |
| `DESIGN.md` | Original design spec |
| `REFINEMENT_PRD.md` | Refinement requirements |

---

## GitHub Repo Commits (README heading alignment)

These are the commits that aligned each repo's README headings with the web
page vocabulary (`## Commercial Readiness`, `## Tests and Verification`).

| Repo | Commit |
|------|--------|
| `Zer0pa/ZPE-Bio` | `82c12e0` |
| `Zer0pa/ZPE-FT` | `339fe2a` |
| `Zer0pa/ZPE-Geo` | `aead1f2` |
| `Zer0pa/ZPE-Ink` | `3bba233` |
| `Zer0pa/ZPE-IoT` | `d9ee4ac` |
| `Zer0pa/ZPE-Mocap` | `8c86ae8` |
| `Zer0pa/ZPE-Neuro` | `534fe74` (squash-merge via PR #10) |
| `Zer0pa/ZPE-Prosody` | `56e8840` (squash-merge via PR #9) |
| `Zer0pa/ZPE-Robotics` | `cf97db7` |
| `Zer0pa/ZPE-XR` | `117a74e` |

---

## Design Decisions (locked)

| Decision | Value |
|----------|-------|
| Background | `#0a0a0a` |
| Surface | `#121212` |
| Success | `#4ade80` |
| Error | `#ff4d4d` |
| Secondary text | `#a3a3a3` |
| Tertiary text | `#525252` |
| Section 02 heading | `COMMERCIAL READINESS` |
| Section 06 heading | `TESTS AND VERIFICATION` |
| Zone 8 text color | All black (single `text-black` class) |
| Zone 8 gradient | `linear-gradient(to bottom, #0a0a0a, #fff 3rem, #fff calc(100%-3rem), #0a0a0a)` |
| Header icons | Reddit (Simple Icons 24px) · HuggingFace (Simple Icons 24px) · GitHub (Octicons 26px) |
| Footer buttons | CLONE REPO · DOWNLOAD LICENSE · READ WHITEPAPER |
| Verdict palette | PASS/WITHSTANDS/SUPPORTED → `#4ade80`, FAIL/NO_GO/BLOCKED/BLOCKED_MISSING_INPUTS → `#ff4d4d`, else → `#a3a3a3` |

---

## Archive History

| Version | File | Notes |
|---------|------|-------|
| v1 | `archive/generate_pages_BANKER_v1.py` | Initial generator |
| v2 | `archive/generate_pages_BANKER_v2.py` | Layout refinements |
| v3 | `archive/generate_pages_BANKER_v3.py` | Color system |
| v4 | `archive/generate_pages_BANKER_v4.py` | Icon + verdict work |
| v6 | `archive/generate_pages_v6_BANKER.py` | Content overhaul |
| v7 | `archive/generate_pages_v7_BANKER.py` | **CURRENT FREEZE** — heading alignment, Zone 8 simplification |

---

## Rules for Future Work

1. **Never edit `generate_pages_BANKER.py` or `archive/generate_pages_v7_BANKER.py`.**
2. **Never edit the 10 `data/ZPE-*.md` files** unless a GitHub repo README changes
   and a deliberate resync is needed.
3. **ZPE-IMC gets its own data file and may extend `generate_pages_ITER.py`.**
   If ITER diverges significantly, fork it — don't break codec page generation.
4. **Landing page** is a separate artifact. It may import the repo list but must
   not alter the per-repo page template.
5. To verify integrity at any time: `md5 -r <file>` and compare against this manifest.
