# Zer0pa Website

Working repository for the Zer0pa website build, ingestion pipeline, live-data UI, and deterministic layout refinement system.

## Remote

- GitHub: `https://github.com/Zer0pa/Website`
- Default collaboration target: root of this repository

## What Is In This Repo

- `site/`: Next.js application, parser, GitHub ingestion, cached lane packets, Sanity sync, layout audit scripts.
- `design-reference/`: authoritative screenshots used as visual targets for homepage and IMC/product page refinement.
- `deterministic-design-system/`: PRD, runbooks, layout maps, and verification artifacts for the geometric/color refinement workflow.
- `go-live-docs/`: go-live PRD and operational runbooks.
- `brand foundations/`, `prior artwork/`, `Zer0pa Repos/`: source materials and supporting context used during design/content work.

## Fast Start

```bash
cd site
npm install
npm run dev
```

Then open `http://127.0.0.1:3000`.

## Useful Commands

```bash
cd site
npm run build
npm run test:parser
npm run ingest
npm run audit:responsive -- --baseUrl=http://127.0.0.1:3000
```

## Environment

Use [`site/.env.example`](/Users/Zer0pa/Zer0pa%20Website/site/.env.example) as the template for local environment variables.

- Sanity is optional for local rendering. Without it, the app falls back to `site/.cache/packets/`.
- `GITHUB_TOKEN` is recommended for ingestion to avoid GitHub rate limits.

## Current Collaboration State

- The local project is runnable from clone.
- Cached packets are committed so collaborators can render the site immediately.
- The design target is anchored by the screenshots in `design-reference/`.
