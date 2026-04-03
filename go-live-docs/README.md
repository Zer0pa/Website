# ZER0PA Go-Live Doc Set

This folder is the canonical execution pack from the current in-progress site to a launchable ZER0PA website.

Read in this order:

1. [INVESTIGATION_MEMO.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/INVESTIGATION_MEMO.md)
2. [GO_LIVE_PRD.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/GO_LIVE_PRD.md)
3. [PRD_REVIEW.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/PRD_REVIEW.md)
4. [RUNBOOK_DATA_AND_CONTENT.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/RUNBOOK_DATA_AND_CONTENT.md)
5. [RUNBOOK_PAGE_IMPLEMENTATION.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/RUNBOOK_PAGE_IMPLEMENTATION.md)
6. [RUNBOOK_QA_AND_ACCEPTANCE.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/RUNBOOK_QA_AND_ACCEPTANCE.md)
7. [RUNBOOK_LAUNCH_AND_OPERATIONS.md](/Users/zer0palab/Zer0pa%20Website/Website-main/go-live-docs/RUNBOOK_LAUNCH_AND_OPERATIONS.md)

These are the only authoritative go-live docs in this folder.

Ignore superseded alternates if they appear elsewhere in the repo.

What this pack does:

- consolidates the multiple PRD generations already in the repo
- turns the attached homepage and lane-page references into executable rules
- defines the GitHub-truth and Sanity-editorial boundary
- provides the runbooks needed to finish routes, data, QA, and launch

Current implementation status at the time of this pack:

- the Next.js app runs locally
- `/`, `/work`, and `/work/[slug]` are implemented
- GitHub ingest and packet parsing exist and are materially improved
- the visual result is still not at the required reference quality
- `/imc`, `/proof`, `/about`, and `/contact` still need to be built
