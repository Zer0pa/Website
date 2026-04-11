#!/usr/bin/env python3
"""
Stitch Product Page Generator
Parses standardized ZPE READMEs and generates pixel-accurate HTML pages
from the Stitch template.
"""

import re
import os
import html
import json
from pathlib import Path
from datetime import datetime, timezone

DATA_DIR = Path(__file__).parent / "data"
OUT_DIR = Path(__file__).parent / "generated"
TEMPLATE_PATH = Path(__file__).parent / "code.html"

REPOS = ["Bio", "FT", "Geo", "Ink", "IoT", "Mocap", "Neuro", "Prosody", "Robotics", "XR"]
IMC_REPOS = REPOS + ["IMC"]

REPO_URLS = {r: f"https://github.com/Zer0pa/ZPE-{r}" for r in IMC_REPOS}

# ─── SVG assets (inline, matching Stitch template exactly) ───────────────────

LOGO_SVG = '''<svg viewBox="0 0 701 353" xmlns="http://www.w3.org/2000/svg" class="h-full w-auto"><g transform="translate(-169 -41)"><text fill="#C7C6C6" font-family="Oswald,sans-serif" font-weight="400" font-size="165" transform="matrix(1 0 0 1 272.924 254)">ZER</text><text fill="#FFFFFF" font-family="Oswald,sans-serif" font-weight="400" font-size="165" transform="matrix(1 0 0 1 494.07 254)">0</text><text fill="#C7C6C6" font-family="Oswald,sans-serif" font-weight="400" font-size="165" transform="matrix(1 0 0 1 579.435 254)">PA</text></g></svg>'''

ICON_SVG = '''<svg viewBox="0 0 326 353" xmlns="http://www.w3.org/2000/svg" class="h-full w-auto"><g transform="translate(-1090 -64)"><text fill="#FFFFFF" font-family="Oswald,sans-serif" font-weight="400" font-size="165" transform="matrix(1 0 0 1 1193.6 275)">0</text></g></svg>'''


# ─── Markdown parser ─────────────────────────────────────────────────────────

def parse_readme(repo_name: str) -> dict:
    """Parse a standardized ZPE README into structured data."""
    path = DATA_DIR / f"ZPE-{repo_name}.md"
    md = path.read_text(encoding="utf-8")

    data = {
        "repo": repo_name,
        "identifier": f"ZPE-{repo_name}",
        "url": REPO_URLS[repo_name],
        "what_this_is": "",
        "architecture": "",
        "encoding": "",
        "key_metrics": [],
        "what_we_prove": [],
        "what_we_dont_claim": [],
        "authority": {"verdict": "", "commit_sha": "", "confidence": "", "source": ""},
        "verification": [],
        "proof_anchors": [],
        "repo_shape": {"proof_anchors": "", "modality_lanes": "", "authority_source": ""},
        "related_repos": [],
        "ecosystem": [],
        "quick_start": "",
    }

    sections = split_sections(md)

    # What This Is
    wti = sections.get("What This Is", "")
    # Extract plain text paragraphs (skip images, tables, badges)
    wti_lines = []
    for line in wti.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("<") or line.startswith("|") or line.startswith("[") or line.startswith("!"):
            continue
        if line.startswith("**Readiness:"):
            continue
        if line.startswith("Part of the"):
            continue
        wti_lines.append(strip_md(line))
    data["what_this_is"] = " ".join(wti_lines)

    # Architecture + Encoding from the table under What This Is
    arch_table = parse_kv_table(wti)
    data["architecture"] = arch_table.get("Architecture", "")
    data["encoding"] = arch_table.get("Encoding", "")

    # Key Metrics (4-col: Metric | Value | Baseline | Tag)
    km = sections.get("Key Metrics", "")
    data["key_metrics"] = parse_metric_table(km)

    # What We Prove (bullet list)
    wp = sections.get("What We Prove", "")
    data["what_we_prove"] = parse_bullet_list(wp)

    # What We Don't Claim (bullet list)
    wdc = sections.get("What We Don't Claim", "")
    data["what_we_dont_claim"] = parse_bullet_list(wdc)

    # Commercial Readiness (2-col KV table)
    ca = sections.get("Commercial Readiness", "")
    auth_table = parse_kv_table(ca)
    data["authority"]["verdict"] = auth_table.get("Verdict", "UNKNOWN")
    data["authority"]["commit_sha"] = auth_table.get("Commit SHA", "")
    data["authority"]["confidence"] = auth_table.get("Confidence", "")
    data["authority"]["source"] = auth_table.get("Source", "README.md")

    # Tests and Verification (3-col: Code | Check | Verdict)
    vs = sections.get("Tests and Verification", "")
    data["verification"] = parse_3col_table(vs, "Code", "Check", "Verdict")

    # Proof Anchors (2-col: Path | State)
    pa = sections.get("Proof Anchors", "")
    data["proof_anchors"] = parse_2col_table(pa, "Path", "State")

    # Repo Shape (2-col KV table)
    rs = sections.get("Repo Shape", "")
    rs_table = parse_kv_table(rs)
    data["repo_shape"]["proof_anchors"] = rs_table.get("Proof Anchors", "0")
    data["repo_shape"]["modality_lanes"] = rs_table.get("Modality Lanes", "0")
    data["repo_shape"]["authority_source"] = rs_table.get("Authority Source", "README.md")

    # Ecosystem (bullet list of links)
    eco = sections.get("Ecosystem", "")
    data["ecosystem"] = parse_bullet_list(eco)

    # Quick Start (code block content)
    qs = sections.get("Quick Start", "")
    data["quick_start"] = extract_code_block(qs)

    # Build related repos from ecosystem links
    data["related_repos"] = build_related(repo_name, data["ecosystem"])

    return data


def split_sections(md: str) -> dict:
    """Split markdown into sections by ## headings."""
    sections = {}
    current_heading = None
    current_body = []

    for line in md.split("\n"):
        m = re.match(r"^##\s+(.+)$", line)
        if m:
            if current_heading:
                sections[current_heading] = "\n".join(current_body)
            current_heading = m.group(1).strip()
            current_body = []
        elif current_heading:
            current_body.append(line)

    if current_heading:
        sections[current_heading] = "\n".join(current_body)

    return sections


def parse_kv_table(text: str) -> dict:
    """Parse a 2-column | Field | Value | table into a dict."""
    result = {}
    rows = extract_table_rows(text)
    for row in rows:
        if len(row) >= 2:
            key = strip_md(row[0]).strip()
            val = strip_md(row[1]).strip()
            if key and val and key.lower() not in ("field", "---"):
                result[key] = val
    return result


def parse_3col_table(text: str, h1: str, h2: str, h3: str) -> list:
    """Parse a 3-column markdown table into a list of dicts."""
    result = []
    rows = extract_table_rows(text)
    for row in rows:
        if len(row) >= 3:
            c1 = strip_md(row[0]).strip()
            c2 = strip_md(row[1]).strip()
            c3 = strip_md(row[2]).strip()
            if c1 and c1.lower() != h1.lower() and not re.match(r"^-+$", c1):
                result.append({h1: c1, h2: c2, h3: c3})
    return result


def parse_metric_table(text: str) -> list:
    """Parse Key Metrics table with optional Baseline column (3 or 4 cols)."""
    result = []
    rows = extract_table_rows(text)
    for row in rows:
        if len(row) >= 3:
            c1 = strip_md(row[0]).strip()
            c2 = strip_md(row[1]).strip()
            if c1 and c1.lower() != "metric" and not re.match(r"^-+$", c1):
                baseline = strip_md(row[2]).strip() if len(row) >= 4 else ""
                tag = strip_md(row[3]).strip() if len(row) >= 4 else strip_md(row[2]).strip()
                # Treat em-dash or dash-only as empty baseline
                if baseline in ("—", "-", "–", ""):
                    baseline = ""
                result.append({"Metric": c1, "Value": c2, "Baseline": baseline, "Tag": tag})
    return result


def parse_2col_table(text: str, h1: str, h2: str) -> list:
    """Parse a 2-column markdown table into a list of dicts."""
    result = []
    rows = extract_table_rows(text)
    for row in rows:
        if len(row) >= 2:
            c1 = strip_md(row[0]).strip()
            c2 = strip_md(row[1]).strip()
            if c1 and c1.lower() != h1.lower() and not re.match(r"^-+$", c1):
                result.append({h1: c1, h2: c2})
    return result


def extract_table_rows(text: str) -> list:
    """Extract rows from markdown tables, handling separator lines."""
    rows = []
    for line in text.split("\n"):
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.split("|")]
        # Remove empty first/last from leading/trailing |
        if cells and cells[0] == "":
            cells = cells[1:]
        if cells and cells[-1] == "":
            cells = cells[:-1]
        # Skip separator rows
        if all(re.match(r"^-+$", c) for c in cells):
            continue
        rows.append(cells)
    return rows


def parse_bullet_list(text: str) -> list:
    """Extract bullet items from markdown."""
    items = []
    for line in text.split("\n"):
        m = re.match(r"^\s*[-*]\s+(.+)$", line)
        if m:
            items.append(strip_md(m.group(1).strip()))
    return items


def extract_code_block(text: str) -> str:
    """Extract the first code block from markdown."""
    m = re.search(r"```(?:\w+)?\n(.*?)```", text, re.DOTALL)
    return m.group(1).strip() if m else ""


def strip_md(text: str) -> str:
    """Remove markdown formatting from text."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # links
    text = re.sub(r"`([^`]+)`", r"\1", text)  # inline code
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)  # bold
    text = re.sub(r"\*([^*]+)\*", r"\1", text)  # italic
    return text.strip()


def build_related(current: str, ecosystem: list) -> list:
    """Extract related ZPE repos from ecosystem bullets."""
    related = []
    for item in ecosystem:
        m = re.search(r"ZPE-(\w+)", item)
        if m and m.group(1) != current and m.group(1) != "IMC":
            related.append(f"ZPE-{m.group(1)}")
    # Always include IMC as the platform layer (unless we ARE IMC)
    if current != "IMC" and "ZPE-IMC" not in related:
        related.insert(0, "ZPE-IMC")
    # Fill with other repos from the family
    for r in REPOS:
        if len(related) >= 3:
            break
        name = f"ZPE-{r}"
        if name not in related and r != current:
            related.append(name)
    return related[:3]


# ─── HTML generator ──────────────────────────────────────────────────────────

def esc(text: str) -> str:
    """HTML-escape text."""
    return html.escape(str(text), quote=True)


def verdict_to_status_class(verdict: str) -> str:
    """Map verdict string to Stitch display treatment."""
    v = verdict.upper().strip()
    if v in ("PASS", "WITHSTANDS"):
        return "white"
    elif v in ("FAIL", "NO_GO", "BLOCKED"):
        return "#FFB4AB"
    elif v.startswith("INC"):
        return "#C7C6C6"
    return "white"


def verdict_to_style(verdict: str) -> str:
    """Return inline style for verification grid cells."""
    color = verdict_to_status_class(verdict)
    extra = ""
    v = verdict.upper().strip()
    if v in ("FAIL", "NO_GO", "BLOCKED"):
        extra = " font-style: italic;"
    elif v.startswith("INC"):
        extra = " opacity: 0.4;"
    return f'color: {color}; font-weight: bold;{extra}'


def authority_verdict_display(verdict: str) -> str:
    """Format verdict for the authority badge."""
    return verdict.upper().replace(" ", "_")


def _verification_summary(checks: list) -> str:
    """Summarize verification checks as 'N/M PASS'."""
    if not checks:
        return "—"
    total = len(checks)
    passed = sum(1 for c in checks if c.get("Verdict", "").upper().strip() in ("PASS", "WITHSTANDS"))
    return f"{passed}/{total} PASS"


def confidence_bar_width(confidence: str) -> str:
    """Extract numeric percentage for the confidence bar."""
    m = re.search(r"(\d+(?:\.\d+)?)", confidence)
    if m:
        return f"{min(100, float(m.group(1)))}%"
    return "0%"


def _split_metric_value(value: str) -> tuple:
    """Split a metric value into (number, unit) for display.
    Only splits on recognized technical units to avoid splitting qualifiers
    like 'pass', 'public', 'langs' onto a sub-line.
    e.g. '~54,800 words/sec' -> ('~54,800', 'words/sec')
          '48/48 pass'        -> ('48/48 pass', '')
          '153/153'           -> ('153/153', '')
    """
    UNITS = r'(?:words/sec|dB|μV|µV|ms|mm|m|Hz|kHz|MHz|GHz|KB|MB|GB|TB|s|ns|μs|fps)'
    m = re.match(r'^([~≈]?[\d,./×]+(?:°)?)\s+(' + UNITS + r')$', value)
    if m:
        return m.group(1), m.group(2)
    return value, ""


def build_metric_cards(metrics: list) -> str:
    """Generate Zone 10 metric cards — full-width cells with text-7xl values and optional baseline."""
    cards = []
    for i, m in enumerate(metrics[:4]):
        border_r = ' border-r border-outline-variant' if i < len(metrics[:4]) - 1 else ''
        # Cards 2 and 4 (indices 1, 3) get tighter right padding to prevent value wrapping
        px_cls = 'pl-8 pr-4' if i in (1, 3) else 'px-8'
        baseline = m.get("Baseline", "")
        baseline_html = f'\n<div class="text-base font-mono text-white mt-2">vs {esc(baseline)}</div>' if baseline else ''
        num, unit = _split_metric_value(m["Value"])
        unit_html = f'\n<div class="text-lg font-mono text-secondary mt-1">{esc(unit)}</div>' if unit else ''
        cards.append(f'''<div class="{px_cls} py-12{border_r} border-t border-outline-variant hover:border-white hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
<span class="mono-meta text-secondary group-hover:text-white transition-colors">{esc(m["Metric"].upper().replace(" ", "_"))}</span>
<div class="text-7xl font-headline font-bold text-white mt-4 whitespace-nowrap">{esc(num)}</div>{unit_html}{baseline_html}
</div>''')
    return "\n".join(cards)


def build_prove_chips(items: list) -> str:
    """Generate Zone 11 proof assertion list items with check_circle icons."""
    rows = []
    for item in items[:6]:
        rows.append(f'''<div class="flex items-start gap-4 hover:translate-x-1 transition-transform duration-200 cursor-default">
<span class="material-symbols-outlined text-success mt-1" style="font-variation-settings: 'FILL' 1;">check_circle</span>
<p class="mono-label text-white leading-normal">{esc(item)}</p>
</div>''')
    return "\n".join(rows)


def build_nonclaim_chips(items: list) -> str:
    """Generate Zone 12 non-claim list items with warning icons."""
    rows = []
    for item in items[:5]:
        rows.append(f'''<div class="flex items-start gap-4 hover:translate-x-1 transition-transform duration-200 cursor-default">
<span class="material-symbols-outlined text-error mt-1">warning</span>
<p class="mono-label text-white leading-normal">{esc(item)}</p>
</div>''')
    return "\n".join(rows)


def build_verification_grid(verifications: list) -> str:
    """Generate Zone 13 verification status — 3-col grid with named checks and colored badges."""
    cells = []
    for v in verifications:
        check_name = v.get("Check", "")
        verdict_val = v.get("Verdict", "").upper().strip()
        # Badge color mapping
        if verdict_val in ("PASS", "WITHSTANDS"):
            badge_cls = "bg-success/20 text-success border-success/40"
        elif verdict_val in ("FAIL", "NO_GO", "BLOCKED"):
            badge_cls = "bg-error/20 text-error border-error/40"
        else:
            badge_cls = "bg-tertiary/20 text-tertiary border-tertiary/40"
        # Display name: use check name if available, else code
        display_name = check_name if check_name else v.get("Code", "")
        display_name = display_name.upper().replace(" ", "_")
        if len(display_name) > 35:
            display_name = display_name[:32] + "..."
        cells.append(f'''<div class="border border-outline-variant p-6 flex justify-between items-center hover:border-white/30 hover:bg-surface/30 transition-all duration-300 cursor-default">
<span class="mono-label text-white">{esc(display_name)}</span>
<span class="px-2 py-1 {badge_cls} mono-label text-[11px] border">{esc(verdict_val)}</span>
</div>''')
    return '<div class="grid grid-cols-1 md:grid-cols-3 gap-8">\n' + "\n".join(cells) + "\n</div>"


def build_proof_anchors(anchors: list) -> str:
    """Generate Zone 14 proof anchors — terminal-style with date + path + state comment."""
    lines = []
    for a in anchors[:6]:
        path = a["Path"]
        state = a["State"]
        lines.append(f'''<div class="grid grid-cols-[140px_1fr] gap-4 mb-3 hover:bg-white/5 px-2 -mx-2 py-1 rounded transition-colors duration-200 cursor-default">
<span class="text-secondary">[ 2026.04 ]</span>
<span class="text-white break-all">{esc(path)} <span class="text-tertiary"># {esc(state)}</span></span>
</div>''')
    return "\n".join(lines)


def build_related_repos(related: list, current_repo: str) -> str:
    """Generate Zone 17 related repo cards — arrow-forward list items."""
    cards = []
    for name in related[:3]:
        url = f"https://github.com/Zer0pa/{name}"
        cards.append(f'''<a class="group border border-outline-variant p-5 flex justify-between items-center hover:bg-surface hover:-translate-y-0.5 transition-all duration-300" href="{esc(url)}" target="_blank" rel="noreferrer">
<div>
<span class="mono-meta text-tertiary block mb-1">ZPE_CLUSTER_01</span>
<span class="mono-label text-white group-hover:underline">{esc(name)}</span>
</div>
<span class="material-symbols-outlined text-secondary group-hover:text-white group-hover:translate-x-1 transition-all duration-300">arrow_forward_ios</span>
</a>''')
    return "\n".join(cards)


def generate_page(data: dict) -> str:
    """Generate a complete Stitch HTML page from parsed data.
    Based on Stitch 11 April 2026 design: 'The Dossier of Absolute Truth'.
    """
    identifier = data["identifier"].upper()
    repo_short = identifier.split("-")[1] if "-" in identifier else identifier
    verdict = authority_verdict_display(data["authority"]["verdict"])
    confidence = data["authority"]["confidence"]
    commit_sha = data["authority"]["commit_sha"]
    source = data["authority"]["source"]
    now = datetime.now(timezone.utc).strftime("%Y.%m.%d.%H:%M:%S_UTC")

    # Verdict color class
    v_upper = verdict.upper()
    if v_upper in ("PASS", "WITHSTANDS", "SUPPORTED"):
        verdict_color = "text-success"
    elif v_upper in ("FAIL", "NO_GO", "BLOCKED", "BLOCKED_MISSING_INPUTS"):
        verdict_color = "text-error"
    else:
        verdict_color = "text-secondary"

    # Truncate What This Is to 500 chars max
    wti_text = data["what_this_is"]
    if len(wti_text) > 500:
        idx = wti_text.rfind(".", 0, 500)
        if idx > 200:
            wti_text = wti_text[:idx + 1]

    # Split into sentences → one <p> per sentence, bold the first
    wti_escaped = esc(wti_text)
    sentences = [s.strip() for s in wti_escaped.split(". ") if s.strip()]
    wti_parts = []
    for i, sent in enumerate(sentences):
        # Re-add the period (split removes it), except if sentence already ends with one
        if not sent.endswith("."):
            sent += "."
        if i == 0:
            wti_parts.append(f'<p><strong>{sent}</strong></p>')
        else:
            wti_parts.append(f'<p>{sent}</p>')
    wti_html = "\n".join(wti_parts)

    # Non-claims footer text
    nonclaim_env = "UNSTABLE_PROTOTYPE_ENV"
    v_raw = data["authority"]["verdict"].upper()
    if "BLOCK" in v_raw:
        nonclaim_env = "BLOCKED_DEVELOPMENT_ENV"
    elif "PRIVATE" in v_raw:
        nonclaim_env = "PRIVATE_STAGED_ENV"
    elif v_raw == "PASS":
        nonclaim_env = "VERIFIED_PROTOTYPE_ENV"

    return f'''<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ZER0PA // {esc(identifier)} // FORENSIC_AUDIT</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&amp;family=Courier+Prime:wght@400;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {{
            darkMode: "class",
            theme: {{
                extend: {{
                    colors: {{
                        "background": "#0a0a0a",
                        "surface": "#121212",
                        "primary": "#ffffff",
                        "secondary": "#a3a3a3",
                        "tertiary": "#525252",
                        "error": "#ff4d4d",
                        "success": "#4ade80",
                        "outline-variant": "#262626"
                    }},
                    fontFamily: {{
                        headline: ["Oswald", "sans-serif"],
                        body: ["Courier Prime", "monospace"],
                        label: ["Courier Prime", "monospace"]
                    }}
                }}
            }}
        }}
    </script>
<style>
        .material-symbols-outlined {{
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
        }}
        .hatched-bg {{
            background-image: repeating-linear-gradient(45deg, #121212, #121212 10px, #1a1a1a 10px, #1a1a1a 20px);
        }}
        .grid-overlay {{
            background-size: 60px 60px;
            background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }}
        body {{
            font-family: 'Courier Prime', monospace;
            cursor: crosshair;
        }}
        .mono-label {{
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }}
        .mono-meta {{
            font-size: 12px;
            font-weight: 400;
            letter-spacing: 0.05em;
        }}
        svg text {{ fill: white !important; }}
        svg {{ height: 100%; width: auto; }}
        a {{ text-decoration: none; }}
    </style>
</head>
<body class="bg-background text-primary overflow-x-hidden selection:bg-white selection:text-black">
<!-- HEADER (ZONES 1, 2, 3, 4) -->
<header class="bg-background/65 backdrop-blur-md h-20 fixed top-0 left-0 right-0 z-50 px-8 flex items-center max-w-[1440px] mx-auto transition-transform duration-300">
<!-- ZONE 1: LOGO -->
<a href="#" class="font-headline font-medium text-4xl tracking-tighter select-none shrink-0" style="color: #333333;">ZER<span style="color: #ffffff;">0</span>PA</a>
<!-- ZONE 2: NAVIGATION MENU -->
<nav class="hidden lg:flex gap-10 items-center ml-10">
<a class="mono-label text-white border-b border-white" href="#">ZERO-POINT-ENCODING</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">ZER0SHIP</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">WHITEPAPERS</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">LICENSES</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">CONTACT</a>
</nav>
<!-- ZONE 3 & 4: EXTERNAL LINKS & CTA -->
<div class="flex items-center gap-8 ml-auto">
<div class="flex gap-5 items-center">
<a class="text-secondary hover:text-white transition-colors" href="https://reddit.com/r/zer0pa" target="_blank" rel="noreferrer">
<svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/></svg>
</a>
<a class="text-secondary hover:text-white transition-colors" href="https://huggingface.co/Zer0pa" target="_blank" rel="noreferrer">
<svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12.025 1.13c-5.77 0-10.449 4.647-10.449 10.378 0 1.112.178 2.181.503 3.185.064-.222.203-.444.416-.577a.96.96 0 0 1 .524-.15c.293 0 .584.124.84.284.278.173.48.408.71.694.226.282.458.611.684.951v-.014c.017-.324.106-.622.264-.874s.403-.487.762-.543c.3-.047.596.06.787.203s.31.313.4.467c.15.257.212.468.233.542.01.026.653 1.552 1.657 2.54.616.605 1.01 1.223 1.082 1.912.055.537-.096 1.059-.38 1.572.637.121 1.294.187 1.967.187.657 0 1.298-.063 1.921-.178-.287-.517-.44-1.041-.384-1.581.07-.69.465-1.307 1.081-1.913 1.004-.987 1.647-2.513 1.657-2.539.021-.074.083-.285.233-.542.09-.154.208-.323.4-.467a1.08 1.08 0 0 1 .787-.203c.359.056.604.29.762.543s.247.55.265.874v.015c.225-.34.457-.67.683-.952.23-.286.432-.52.71-.694.257-.16.547-.284.84-.285a.97.97 0 0 1 .524.151c.228.143.373.388.43.625l.006.04a10.3 10.3 0 0 0 .534-3.273c0-5.731-4.678-10.378-10.449-10.378M8.327 6.583a1.5 1.5 0 0 1 .713.174 1.487 1.487 0 0 1 .617 2.013c-.183.343-.762-.214-1.102-.094-.38.134-.532.914-.917.71a1.487 1.487 0 0 1 .69-2.803m7.486 0a1.487 1.487 0 0 1 .689 2.803c-.385.204-.536-.576-.916-.71-.34-.12-.92.437-1.103.094a1.487 1.487 0 0 1 .617-2.013 1.5 1.5 0 0 1 .713-.174m-10.68 1.55a.96.96 0 1 1 0 1.921.96.96 0 0 1 0-1.92m13.838 0a.96.96 0 1 1 0 1.92.96.96 0 0 1 0-1.92M8.489 11.458c.588.01 1.965 1.157 3.572 1.164 1.607-.007 2.984-1.155 3.572-1.164.196-.003.305.12.305.454 0 .886-.424 2.328-1.563 3.202-.22-.756-1.396-1.366-1.63-1.32q-.011.001-.02.006l-.044.026-.01.008-.03.024q-.018.017-.035.036l-.032.04a1 1 0 0 0-.058.09l-.014.025q-.049.088-.11.19a1 1 0 0 1-.083.116 1.2 1.2 0 0 1-.173.18q-.035.029-.075.058a1.3 1.3 0 0 1-.251-.243 1 1 0 0 1-.076-.107c-.124-.193-.177-.363-.337-.444-.034-.016-.104-.008-.2.022q-.094.03-.216.087-.06.028-.125.063l-.13.074q-.067.04-.136.086a3 3 0 0 0-.135.096 3 3 0 0 0-.26.219 2 2 0 0 0-.12.121 2 2 0 0 0-.106.128l-.002.002a2 2 0 0 0-.09.132l-.001.001a1.2 1.2 0 0 0-.105.212q-.013.036-.024.073c-1.139-.875-1.563-2.317-1.563-3.203 0-.334.109-.457.305-.454m.836 10.354c.824-1.19.766-2.082-.365-3.194-1.13-1.112-1.789-2.738-1.789-2.738s-.246-.945-.806-.858-.97 1.499.202 2.362c1.173.864-.233 1.45-.685.64-.45-.812-1.683-2.896-2.322-3.295s-1.089-.175-.938.647 2.822 2.813 2.562 3.244-1.176-.506-1.176-.506-2.866-2.567-3.49-1.898.473 1.23 2.037 2.16c1.564.932 1.686 1.178 1.464 1.53s-3.675-2.511-4-1.297c-.323 1.214 3.524 1.567 3.287 2.405-.238.839-2.71-1.587-3.216-.642-.506.946 3.49 2.056 3.522 2.064 1.29.33 4.568 1.028 5.713-.624m5.349 0c-.824-1.19-.766-2.082.365-3.194 1.13-1.112 1.789-2.738 1.789-2.738s.246-.945.806-.858.97 1.499-.202 2.362c-1.173.864.233 1.45.685.64.451-.812 1.683-2.896 2.322-3.295s1.089-.175.938.647-2.822 2.813-2.562 3.244 1.176-.506 1.176-.506 2.866-2.567 3.49-1.898-.473 1.23-2.037 2.16c-1.564.932-1.686 1.178-1.464 1.53s3.675-2.511 4-1.297c.323 1.214-3.524 1.567-3.287 2.405.238.839 2.71-1.587 3.216-.642.506.946-3.49 2.056-3.522 2.064-1.29.33-4.568 1.028-5.713-.624"/></svg>
</a>
<a class="text-secondary hover:text-white transition-colors" href="{esc(data['url'])}" target="_blank" rel="noreferrer">
<svg fill="currentColor" height="26" viewBox="0 0 16 16" width="26"><path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"/></svg>
</a>
</div>
<a href="{esc(data['url'])}" target="_blank" rel="noreferrer" class="bg-primary text-background px-6 py-2 mono-label font-bold hover:bg-secondary transition-colors">CLONE_REPO</a>
</div>
</header>
<main class="pt-20 grid-overlay min-h-screen w-full max-w-[1440px] mx-auto border-x border-outline-variant">
<!-- HERO SECTION (ZONES 5, 6, 7) -->
<section class="px-12 py-20 border-b border-outline-variant flex justify-between items-start bg-black">
<div class="flex flex-col gap-4">
<!-- ZONE 7: STATUS BADGES -->
<div class="flex gap-4">
<span class="mono-meta text-tertiary">[ FILE: ARCHIVE/ZPE/{esc(repo_short)}_CORE.sys ]</span>
<span class="mono-meta text-secondary">[ STATUS: <span class="text-white">UNREDACTED</span> ]</span>
</div>
<!-- ZONE 6: PRODUCT NAME -->
<h1 class="font-headline text-[8rem] font-bold tracking-tighter uppercase leading-[0.85] text-white">{esc(identifier)}</h1>
<div class="mt-4 flex items-center gap-6">
<span class="px-3 py-1 bg-surface border border-outline-variant mono-label text-white">CLASS: SINGULARITY</span>
<span class="mono-meta text-tertiary">TIMESTAMP: {esc(now)}</span>
</div>
</div>
</section>
<!-- IDENTITY ROW (ZONES 8, 9) -->
<section class="grid grid-cols-1 lg:grid-cols-12 border-b border-outline-variant">
<!-- ZONE 8: WHAT THIS IS -->
<div class="lg:col-span-8 p-12 border-r border-outline-variant" style="background: linear-gradient(to bottom, #0a0a0a, #ffffff 3rem, #ffffff calc(100% - 3rem), #0a0a0a);">
<h2 class="mono-label text-black mb-6">01 // WHAT THIS IS</h2>
<div class="text-xl font-body leading-relaxed max-w-3xl text-black space-y-4">
{wti_html}
</div>
</div>
<!-- ZONE 9: COMMERCIAL READINESS -->
<div class="lg:col-span-4 p-12 bg-surface/50">
<h2 class="mono-label text-secondary mb-6">02 // COMMERCIAL READINESS</h2>
<div class="space-y-6">
<div class="flex justify-between items-end border-b border-outline-variant pb-2 hover:bg-white/5 px-2 -mx-2 transition-colors duration-200 cursor-default">
<span class="mono-meta text-secondary">VERDICT</span>
<span class="mono-label {verdict_color}">{esc(verdict)}</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2 hover:bg-white/5 px-2 -mx-2 transition-colors duration-200 cursor-default">
<span class="mono-meta text-secondary">COMMIT</span>
<span class="mono-label text-white">{esc(commit_sha[:7].upper())}</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2 hover:bg-white/5 px-2 -mx-2 transition-colors duration-200 cursor-default">
<span class="mono-meta text-secondary">VERIFIED</span>
<span class="mono-label text-white">{datetime.now(timezone.utc).strftime("%Y.%m.%d")}</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2 hover:bg-white/5 px-2 -mx-2 transition-colors duration-200 cursor-default">
<span class="mono-meta text-secondary">CONFIDENCE</span>
<span class="mono-label text-white">{esc(confidence)}</span>
</div>
</div>
</div>
</section>
<!-- ZONE 10: KEY METRICS -->
<section class="border-b border-outline-variant">
<div class="px-12 pt-12 pb-6">
<h2 class="mono-label text-secondary">03 // KEY METRICS</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-4">
{build_metric_cards(data["key_metrics"])}
</div>
<div class="px-12 py-4 border-t border-outline-variant">
<p class="text-xs font-mono text-tertiary">* Baselines are approximate analogues — not direct comparisons. Corpus, scope, and conditions differ.</p>
</div>
</section>
<!-- CLAIMS ROW (ZONES 11, 12) -->
<section class="grid grid-cols-1 lg:grid-cols-2 border-b border-outline-variant">
<!-- ZONE 11: WHAT WE PROVE -->
<div class="p-12 border-r border-outline-variant">
<h2 class="mono-label text-success mb-8">04 // WHAT WE PROVE</h2>
<div class="space-y-6">
{build_prove_chips(data["what_we_prove"])}
</div>
</div>
<!-- ZONE 12: WHAT WE DON'T CLAIM -->
<div class="p-12">
<h2 class="mono-label text-error mb-8">05 // WHAT WE DON'T CLAIM</h2>
<div class="space-y-6">
{build_nonclaim_chips(data["what_we_dont_claim"])}
</div>
<div class="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center italic text-error mono-meta">
[!] {esc(nonclaim_env)}
</div>
</div>
</section>
<!-- ZONE 13: TESTS AND VERIFICATION -->
<section class="border-b border-outline-variant p-12">
<h2 class="mono-label text-secondary mb-8">06 // TESTS AND VERIFICATION</h2>
{build_verification_grid(data["verification"])}
</section>
<!-- TRACING & VISUAL (ZONES 14, 15) -->
<section class="grid grid-cols-1 lg:grid-cols-12 border-b border-outline-variant">
<!-- ZONE 14: PROOF ANCHORS -->
<div class="lg:col-span-8 p-12 border-r border-outline-variant min-h-[400px]">
<h2 class="mono-label text-secondary mb-8">07 // PROOF ANCHORS</h2>
<div class="bg-surface p-8 border border-outline-variant font-body text-[14px] leading-relaxed">
<div class="mb-4 text-tertiary">$ ls -R //ARCHIVE/{esc(repo_short)}/PROOF</div>
{build_proof_anchors(data["proof_anchors"])}
<div class="mt-8 p-4 bg-background border-l-2 border-white">
<code class="text-secondary block">
&gt; SCANNING HEX_GEOMETRY... [DONE]<br/>
&gt; CORE_READOUT: 0x000000 [VALID]<br/>
&gt; PROOF_ARTIFACTS_LOCKED
</code>
</div>
</div>
</div>
<!-- ZONE 15: VISUAL / MEDIA -->
<div class="lg:col-span-4 p-12 flex flex-col items-center bg-surface relative overflow-hidden group">
<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
<div class="mb-8 w-full relative z-10">
<h3 class="mono-label text-secondary mb-2">08 // {esc(repo_short)}_VISUALIZER</h3>
<p class="mono-meta text-secondary">GEOMETRIC PROOF OF ZERO-STATE</p>
</div>
<div class="w-full aspect-square border border-outline-variant flex items-center justify-center relative bg-black/50">
<div class="text-white/10 font-headline text-[8rem]">{esc(repo_short)}</div>
<div class="absolute top-4 left-4 mono-meta text-tertiary">LOC: 00.0000 N</div>
<div class="absolute bottom-4 right-4 mono-meta text-tertiary">V: 1.0.0.1</div>
</div>
</div>
</section>
<!-- REPO DETAILS (ZONES 16, 17) -->
<section class="grid grid-cols-1 lg:grid-cols-2">
<!-- ZONE 16: REPO SHAPE -->
<div class="p-12 border-r border-outline-variant border-b border-outline-variant lg:border-b-0">
<h2 class="mono-label text-secondary mb-8">09 // REPO SHAPE</h2>
<div class="grid grid-cols-2 gap-8 mb-10">
<div class="hover:bg-white/5 p-2 -m-2 rounded transition-colors duration-200 cursor-default">
<span class="mono-meta text-tertiary block mb-1">PROOF_ANCHORS</span>
<span class="mono-label text-white">{esc(data["repo_shape"]["proof_anchors"])}</span>
</div>
<div class="hover:bg-white/5 p-2 -m-2 rounded transition-colors duration-200 cursor-default">
<span class="mono-meta text-tertiary block mb-1">MODALITY_LANES</span>
<span class="mono-label text-white">{esc(data["repo_shape"]["modality_lanes"])}</span>
</div>
<div class="hover:bg-white/5 p-2 -m-2 rounded transition-colors duration-200 cursor-default">
<span class="mono-meta text-tertiary block mb-1">ARCHITECTURE</span>
<span class="mono-label text-white">{esc(data.get("architecture", "—") or "—")}</span>
</div>
<div class="hover:bg-white/5 p-2 -m-2 rounded transition-colors duration-200 cursor-default">
<span class="mono-meta text-tertiary block mb-1">ENCODING</span>
<span class="mono-label text-white">{esc(data.get("encoding", "—") or "—")}</span>
</div>
</div>
<div class="grid grid-cols-2 gap-8">
<div class="hover:bg-white/5 p-2 -m-2 rounded transition-colors duration-200 cursor-default">
<span class="mono-meta text-tertiary block mb-1">AUTHORITY_SOURCE</span>
<span class="mono-label text-white break-all">{esc(data["repo_shape"]["authority_source"])}</span>
</div>
<div class="hover:bg-white/5 p-2 -m-2 rounded transition-colors duration-200 cursor-default">
<span class="mono-meta text-tertiary block mb-1">VERIFICATION</span>
<span class="mono-label text-white">{_verification_summary(data["verification"])}</span>
</div>
</div>
</div>
<!-- ZONE 17: RELATED REPOS -->
<div class="p-12">
<h2 class="mono-label text-secondary mb-8">10 // RELATED REPOS</h2>
<div class="grid grid-cols-1 gap-4">
{build_related_repos(data["related_repos"], data["repo"])}
</div>
</div>
</section>
<!-- FOOTER (ZONE 18) -->
<footer class="bg-black py-24 px-12 relative overflow-hidden">
<div class="w-full flex items-center justify-between relative">
<!-- ZER0PA watermark logo — left-justified, off-black, white 0 -->
<div class="font-headline font-medium text-[20rem] leading-none tracking-tighter select-none pointer-events-none" style="color: #111111;">ZER<span style="color: #ffffff;">0</span>PA</div>
<!-- ZONE 18: BUTTONS — stacked, right-justified -->
<div class="flex flex-col gap-3 w-80 shrink-0 relative z-10">
<a href="https://reddit.com/r/zer0pa" target="_blank" rel="noreferrer" class="bg-[#111111] text-white py-4 mono-label font-bold text-xl hover:bg-white hover:text-black transition-all text-center block">REDDIT</a>
<a href="https://huggingface.co/Zer0pa" target="_blank" rel="noreferrer" class="bg-[#111111] text-white py-4 mono-label font-bold text-xl hover:bg-white hover:text-black transition-all text-center block">HUGGING FACE</a>
<a href="https://github.com/Zer0pa" target="_blank" rel="noreferrer" class="bg-[#111111] text-white py-4 mono-label font-bold text-xl hover:bg-white hover:text-black transition-all text-center block">GITHUB</a>
<a href="#" target="_blank" rel="noreferrer" class="bg-[#111111] text-white py-4 mono-label font-bold text-xl hover:bg-white hover:text-black transition-all text-center block">WHITEPAPERS</a>
<a href="https://github.com/Zer0pa/ZPE-IMC/blob/main/LICENSE" target="_blank" rel="noreferrer" class="bg-[#111111] text-white py-4 mono-label font-bold text-xl hover:bg-white hover:text-black transition-all text-center block">DOWNLOAD LICENSES</a>
</div>
</div>
</footer>
</main>
<script>
(function(){{
    const header = document.querySelector('header');
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {{
        const y = window.scrollY;
        if (y > lastY && y > 80) {{
            header.style.transform = 'translateY(-100%)';
        }} else {{
            header.style.transform = 'translateY(0)';
        }}
        lastY = y;
    }});
}})();
</script>
</body></html>'''


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = {}

    for repo in IMC_REPOS:
        print(f"[PARSE] ZPE-{repo}...")
        data = parse_readme(repo)

        # Validation
        errors = []
        if not data["what_this_is"]:
            errors.append("Missing: What This Is")
        if not data["architecture"]:
            errors.append("Missing: Architecture")
        if not data["encoding"]:
            errors.append("Missing: Encoding")
        if len(data["key_metrics"]) < 3:
            errors.append(f"Key Metrics: only {len(data['key_metrics'])} (need ≥3)")
        if not data["authority"]["verdict"]:
            errors.append("Missing: Authority verdict")
        if not data["authority"]["commit_sha"]:
            errors.append("Missing: Commit SHA")
        if len(data["verification"]) < 3:
            errors.append(f"Verification: only {len(data['verification'])} checks (need ≥3)")
        if len(data["proof_anchors"]) < 2:
            errors.append(f"Proof Anchors: only {len(data['proof_anchors'])} (need ≥2)")
        if not data["what_we_prove"]:
            errors.append("Missing: What We Prove")
        if not data["what_we_dont_claim"]:
            errors.append("Missing: What We Don't Claim")

        if errors:
            print(f"  [WARN] {', '.join(errors)}")

        results[repo] = {
            "data": data,
            "errors": errors,
        }

        print(f"[GEN]   ZPE-{repo} → generating HTML...")
        page_html = generate_page(data)
        out_path = OUT_DIR / f"ZPE-{repo}.html"
        out_path.write_text(page_html, encoding="utf-8")
        print(f"  → {out_path.name} ({len(page_html):,} bytes)")

    # Summary
    print("\n" + "=" * 60)
    print("GENERATION REPORT")
    print("=" * 60)
    total_pass = 0
    total_warn = 0
    for repo, result in results.items():
        status = "PASS" if not result["errors"] else f"WARN ({len(result['errors'])})"
        if not result["errors"]:
            total_pass += 1
        else:
            total_warn += 1
        d = result["data"]
        print(f"  ZPE-{repo:10s} | {status:10s} | metrics={len(d['key_metrics'])} verif={len(d['verification'])} anchors={len(d['proof_anchors'])} verdict={d['authority']['verdict']}")
        if result["errors"]:
            for e in result["errors"]:
                print(f"    ⚠ {e}")

    print(f"\nTotal: {total_pass} PASS, {total_warn} WARN out of {len(IMC_REPOS)}")
    print(f"Output: {OUT_DIR}")


if __name__ == "__main__":
    main()
