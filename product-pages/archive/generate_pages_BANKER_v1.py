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

REPO_URLS = {r: f"https://github.com/Zer0pa/ZPE-{r}" for r in REPOS}

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

    # Current Authority (2-col KV table)
    ca = sections.get("Current Authority", "")
    auth_table = parse_kv_table(ca)
    data["authority"]["verdict"] = auth_table.get("Verdict", "UNKNOWN")
    data["authority"]["commit_sha"] = auth_table.get("Commit SHA", "")
    data["authority"]["confidence"] = auth_table.get("Confidence", "")
    data["authority"]["source"] = auth_table.get("Source", "README.md")

    # Verification Status (3-col: Code | Check | Verdict)
    vs = sections.get("Verification Status", "")
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
    # Always include IMC as the platform layer
    if "ZPE-IMC" not in related:
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


def confidence_bar_width(confidence: str) -> str:
    """Extract numeric percentage for the confidence bar."""
    m = re.search(r"(\d+(?:\.\d+)?)", confidence)
    if m:
        return f"{min(100, float(m.group(1)))}%"
    return "0%"


def build_metric_cards(metrics: list) -> str:
    """Generate Zone 10 metric cards — full-width cells with text-7xl values and optional baseline."""
    cards = []
    for i, m in enumerate(metrics[:4]):
        border_r = ' border-r border-outline-variant' if i < len(metrics[:4]) - 1 else ''
        # Cards 2 and 4 (indices 1, 3) get tighter right padding to prevent value wrapping
        px_cls = 'pl-8 pr-4' if i in (1, 3) else 'px-8'
        baseline = m.get("Baseline", "")
        baseline_html = f'\n<div class="text-base font-mono text-white mt-2">vs {esc(baseline)}</div>' if baseline else ''
        cards.append(f'''<div class="{px_cls} py-12{border_r} border-t border-outline-variant hover:border-white transition-colors group">
<span class="mono-meta text-secondary group-hover:text-white transition-colors">{esc(m["Metric"].upper().replace(" ", "_"))}</span>
<div class="text-7xl font-headline font-bold text-white mt-4 whitespace-nowrap">{esc(m["Value"])}</div>{baseline_html}
</div>''')
    return "\n".join(cards)


def build_prove_chips(items: list) -> str:
    """Generate Zone 11 proof assertion list items with check_circle icons."""
    rows = []
    for item in items[:6]:
        rows.append(f'''<div class="flex items-start gap-4">
<span class="material-symbols-outlined text-success mt-1" style="font-variation-settings: 'FILL' 1;">check_circle</span>
<p class="mono-label text-white leading-normal">{esc(item)}</p>
</div>''')
    return "\n".join(rows)


def build_nonclaim_chips(items: list) -> str:
    """Generate Zone 12 non-claim list items with warning icons."""
    rows = []
    for item in items[:5]:
        rows.append(f'''<div class="flex items-start gap-4">
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
        cells.append(f'''<div class="border border-outline-variant p-6 flex justify-between items-center">
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
        lines.append(f'''<div class="grid grid-cols-[140px_1fr] gap-4 mb-3">
<span class="text-secondary">[ 2026.04 ]</span>
<span class="text-white break-all">{esc(path)} <span class="text-tertiary"># {esc(state)}</span></span>
</div>''')
    return "\n".join(lines)


def build_related_repos(related: list, current_repo: str) -> str:
    """Generate Zone 17 related repo cards — arrow-forward list items."""
    cards = []
    for name in related[:3]:
        url = f"https://github.com/Zer0pa/{name}"
        cards.append(f'''<a class="group border border-outline-variant p-5 flex justify-between items-center hover:bg-surface transition-colors" href="{esc(url)}" target="_blank" rel="noreferrer">
<div>
<span class="mono-meta text-tertiary block mb-1">ZPE_CLUSTER_01</span>
<span class="mono-label text-white group-hover:underline">{esc(name)}</span>
</div>
<span class="material-symbols-outlined text-secondary group-hover:text-white">arrow_forward_ios</span>
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

    # Truncate What This Is to 2 paragraphs max
    wti_text = data["what_this_is"]
    if len(wti_text) > 500:
        idx = wti_text.rfind(".", 0, 500)
        if idx > 200:
            wti_text = wti_text[:idx + 1]

    # Bold first sentence
    wti_html = esc(wti_text)
    first_dot = wti_html.find(". ")
    if first_dot > 0:
        wti_html = f'<strong>{wti_html[:first_dot + 1]}</strong>{wti_html[first_dot + 1:]}'

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
<header class="bg-background border-b border-outline-variant h-20 fixed top-0 left-0 right-0 z-50 px-8 flex items-center justify-between max-w-[1440px] mx-auto">
<!-- ZONE 2: NAVIGATION MENU -->
<nav class="hidden lg:flex gap-10 items-center">
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">COMPANY</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">ZER0SHIP</a>
<a class="mono-label text-white border-b border-white" href="#">ZPE</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">WHITEPAPERS</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">LICENSING</a>
<a class="mono-label text-secondary hover:text-white transition-colors" href="#">INVESTORS</a>
</nav>
<!-- ZONE 3 & 4: EXTERNAL LINKS & CTA -->
<div class="flex items-center gap-8">
<div class="flex gap-5 items-center">
<a class="text-secondary hover:text-white transition-colors" href="{esc(data['url'])}" target="_blank" rel="noreferrer">
<svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
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
<div class="lg:col-span-8 p-12 border-r border-outline-variant">
<h2 class="mono-label text-secondary mb-6">08 // WHAT THIS IS</h2>
<p class="text-xl font-body leading-relaxed max-w-3xl text-secondary [&>strong]:text-white">
{wti_html}
</p>
</div>
<!-- ZONE 9: AUTHORITY STATUS -->
<div class="lg:col-span-4 p-12 bg-surface/50">
<h2 class="mono-label text-secondary mb-6">09 // AUTHORITY STATUS</h2>
<div class="space-y-6">
<div class="flex justify-between items-end border-b border-outline-variant pb-2">
<span class="mono-meta text-secondary">VERDICT</span>
<span class="mono-label {verdict_color}">{esc(verdict)}</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2">
<span class="mono-meta text-secondary">COMMIT</span>
<span class="mono-label text-white">{esc(commit_sha[:7].upper())}</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2">
<span class="mono-meta text-secondary">VERIFIED</span>
<span class="mono-label text-white">{datetime.now(timezone.utc).strftime("%Y.%m.%d")}</span>
</div>
<div class="flex justify-between items-end border-b border-outline-variant pb-2">
<span class="mono-meta text-secondary">CONFIDENCE</span>
<span class="mono-label text-white">{esc(confidence)}</span>
</div>
</div>
</div>
</section>
<!-- ZONE 10: KEY METRICS -->
<section class="border-b border-outline-variant">
<div class="px-12 pt-12 pb-6">
<h2 class="mono-label text-secondary">10 // KEY METRICS</h2>
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
<h2 class="mono-label text-success mb-8">11 // WHAT WE PROVE</h2>
<div class="space-y-6">
{build_prove_chips(data["what_we_prove"])}
</div>
</div>
<!-- ZONE 12: WHAT WE DON'T CLAIM -->
<div class="p-12 hatched-bg relative overflow-hidden">
<h2 class="mono-label text-error mb-8">12 // WHAT WE DON'T CLAIM</h2>
<div class="bg-background/95 p-8 border border-error/40 relative z-10">
<div class="space-y-6">
{build_nonclaim_chips(data["what_we_dont_claim"])}
</div>
<div class="mt-8 pt-6 border-t border-error/20 flex justify-between items-center italic text-error mono-meta">
[!] {esc(nonclaim_env)}
</div>
</div>
</div>
</section>
<!-- ZONE 13: VERIFICATION STATUS -->
<section class="border-b border-outline-variant p-12">
<h2 class="mono-label text-secondary mb-8">13 // VERIFICATION STATUS</h2>
{build_verification_grid(data["verification"])}
</section>
<!-- TRACING & VISUAL (ZONES 14, 15) -->
<section class="grid grid-cols-1 lg:grid-cols-12 border-b border-outline-variant">
<!-- ZONE 14: PROOF ANCHORS -->
<div class="lg:col-span-8 p-12 border-r border-outline-variant min-h-[400px]">
<h2 class="mono-label text-secondary mb-8">14 // PROOF ANCHORS</h2>
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
<div class="lg:col-span-4 p-12 flex flex-col items-center justify-center bg-surface relative overflow-hidden group">
<div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
<div class="w-full aspect-square border border-outline-variant flex items-center justify-center relative bg-black/50">
<div class="text-white/10 font-headline text-[8rem]">{esc(repo_short)}</div>
<div class="absolute top-4 left-4 mono-meta text-tertiary">LOC: 00.0000 N</div>
<div class="absolute bottom-4 right-4 mono-meta text-tertiary">V: 1.0.0.1</div>
</div>
<div class="mt-8 text-center">
<h3 class="mono-label text-white mb-2">15 // {esc(repo_short)}_VISUALIZER</h3>
<p class="mono-meta text-secondary">GEOMETRIC PROOF OF ZERO-STATE</p>
</div>
</div>
</section>
<!-- REPO DETAILS (ZONES 16, 17) -->
<section class="grid grid-cols-1 lg:grid-cols-2">
<!-- ZONE 16: REPO SHAPE -->
<div class="p-12 border-r border-outline-variant border-b border-outline-variant lg:border-b-0">
<h2 class="mono-label text-secondary mb-8">16 // REPO SHAPE</h2>
<div class="grid grid-cols-2 gap-8 mb-10">
<div>
<span class="mono-meta text-tertiary block mb-1">PROOF_ANCHORS</span>
<span class="mono-label text-white">{esc(data["repo_shape"]["proof_anchors"])}</span>
</div>
<div>
<span class="mono-meta text-tertiary block mb-1">MODALITY_LANES</span>
<span class="mono-label text-white">{esc(data["repo_shape"]["modality_lanes"])}</span>
</div>
<div>
<span class="mono-meta text-tertiary block mb-1">AUTHORITY</span>
<span class="mono-label text-white break-all">{esc(data["repo_shape"]["authority_source"])}</span>
</div>
<div>
<span class="mono-meta text-tertiary block mb-1">STRUCTURE</span>
<span class="mono-label text-white">FLAT_MEM</span>
</div>
</div>
</div>
<!-- ZONE 17: RELATED REPOS -->
<div class="p-12">
<h2 class="mono-label text-secondary mb-8">17 // RELATED REPOS</h2>
<div class="grid grid-cols-1 gap-4">
{build_related_repos(data["related_repos"], data["repo"])}
</div>
</div>
</section>
<!-- FOOTER (ZONE 18) -->
<footer class="bg-black py-24 px-12 relative overflow-hidden">
<div class="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
<div class="font-headline text-[30rem] leading-none text-white">0</div>
</div>
<div class="max-w-4xl mx-auto text-center flex flex-col items-center gap-12 relative z-10">
<!-- ZONE 18: BUTTONS -->
<div class="flex flex-col sm:flex-row gap-6 w-full">
<a href="{esc(data['url'])}" target="_blank" rel="noreferrer" class="flex-1 bg-white text-black py-6 mono-label font-bold text-xl hover:bg-secondary transition-all text-center block">CLONE THIS REPO</a>
<a href="{esc(data['url'])}/blob/main/LICENSE" target="_blank" rel="noreferrer" class="flex-1 border border-white text-white py-6 mono-label font-bold text-xl hover:bg-white hover:text-black transition-all text-center block">DOWNLOAD LICENSE</a>
</div>
</div>
</footer>
</main>
</body></html>'''


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = {}

    for repo in REPOS:
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

    print(f"\nTotal: {total_pass} PASS, {total_warn} WARN out of {len(REPOS)}")
    print(f"Output: {OUT_DIR}")


if __name__ == "__main__":
    main()
