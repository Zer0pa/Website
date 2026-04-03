# Runbook: QA And Acceptance

## 1. Purpose

Verify that the site is visually correct, truth-correct, route-complete, and launchable.

## 2. Data QA

Run:

```bash
cd "/Users/zer0palab/Zer0pa Website/Website-main/site"
npm run ingest
npm run test:parser
npm run build
```

- `npm run ingest` passes
- `npm run build` passes
- major lanes parse correct authority states:
  - IMC = `SUPPORTED`
  - IoT = `STAGED`
  - XR = `BLOCKED`
- GitHub-truth fields are rendered without obvious parser noise

## 3. Visual QA

- homepage composition matches the attached reference
- lane page composition matches the attached reference
- mastheads use Oswald
- UI/data/body use Courier
- black/grey/white palette only
- no gradients or decorative effects

Verify visually in a browser at:

- `http://127.0.0.1:3000`
- `http://127.0.0.1:3000/work`
- `http://127.0.0.1:3000/work/imc`
- `http://127.0.0.1:3000/work/xr`
- `http://127.0.0.1:3000/work/iot`

## 4. Route QA

Required routes must exist and render:

- `/`
- `/imc`
- `/work`
- `/work/[slug]`
- `/proof`
- `/about`
- `/contact`

## 5. Truth QA

- blocked lanes are visibly blocked
- explicit non-claims are visible
- proof anchors are clickable and relevant
- no fabricated metrics are present

## 6. Accessibility QA

- keyboard navigation works
- focus states are visible
- headings are hierarchical
- text contrast meets minimum accessibility requirements
- reduced motion is respected

Minimum tooling:

- browser keyboard-only pass
- Lighthouse accessibility pass
- reduced-motion manual toggle test

## 7. Performance QA

- production build succeeds
- pages are static-first where practical
- 3D and heavier visuals are lazy or conditional
- no route should require GitHub runtime fetches to render

## 8. Manual Acceptance Checklist

The reviewer should be able to answer “yes” to all of these:

- Does this feel like the attached ZER0PA references?
- Can I tell what is proved vs not claimed?
- Can I see that the homepage is backed by real lane data?
- Do blocker states look honest rather than smoothed over?
- Do the routes feel like one coherent system?

## 9. Failure Triggers

Reject release if any are true:

- a dead route appears in main navigation
- font substitution is visible
- data noise damages the reading experience
- a blocked lane is visually dressed as a pass narrative
- a truth module is hardcoded
- a required route renders empty or with placeholder text
