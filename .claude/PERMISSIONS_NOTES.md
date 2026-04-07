# Claude Code Permissions

## What this file is

`.claude/settings.json` configures which Bash commands, file reads, and file writes
Claude Code agents may run **without prompting the user for approval**.

It is checked into version control so all worktrees and CI runs share the same baseline.
`settings.local.json` files inside worktrees are agent-generated one-offs; those were
the source of the permission-prompt spam you were experiencing.

## Why not YOLO mode (`--dangerously-skip-permissions`)

Two reasons:

1. **Broken on recent Claude Code.** See anthropics/claude-code#36168. The flag causes
   crashes / hangs in versions ≥ 1.x shipped in 2025-2026.
2. **Unsafe on host machines.** `bypassPermissions` / `--dangerously-skip-permissions`
   skips every safety check (except hardcoded protected paths). On a developer laptop
   it lets agents touch `~/.ssh`, `~/.aws`, system crontabs, etc. with no confirmation.
   The docs recommend this mode only inside containers or VMs with no network.

The correct fix is a well-scoped allow-list — which is what `settings.json` provides.

## How the permission system works

Rules are evaluated: **deny → ask → allow**. First match wins; deny always beats allow.

`defaultMode: "acceptEdits"` auto-approves:
- All file **reads** in the working directory (and additional directories)
- All file **edits / writes** in the working directory (except protected paths)

The `allow` list then auto-approves the Bash commands that CLAW agents run constantly:
git inspection and mutation, `node`/`npm`/`npx`, file inspection, `launchctl` (service
management), keychain reads (`security find-generic-password`), and the `codex` CLI.

The `deny` list hard-blocks the dangerous subset regardless of any allow rule:
force-push, direct push to `main`/`master`, catastrophic `rm -rf /`, and `sudo`.

Read rules for `/opt/homebrew`, `/usr/local`, and `~/.nvm` let agents discover toolchain
binaries without prompting.

## How to add a new allow rule when an agent gets blocked

1. Note the **exact command** shown in the permission prompt (it shows the full string).
2. Open `.claude/settings.json`.
3. Add a rule to `permissions.allow` using glob wildcards where arguments vary:
   ```json
   "Bash(my-tool *)"
   ```
   The space before `*` enforces a word boundary: `Bash(my-tool *)` matches
   `my-tool --flag value` but NOT `my-toolbox`. Without the space (`Bash(my-tool*)`)
   both would match. Use the space form unless you specifically need prefix matching.
4. Commit the change so all worktrees pick it up immediately.

For Read/Edit paths outside the repo root:
```json
"Read(//absolute/path/**)"   // absolute path (double slash = filesystem root)
"Read(~/relative/to/home/**)"
```

Do NOT add allow rules for commands that mutate shared state outside the repo
(remote pushes, cloud uploads, secret writes). Those should remain as prompts.

## How to test what triggers a prompt

Run a non-interactive probe and observe which tools pause:

```bash
claude --print "run: git status && npm run claw:health" --output-format stream-json
```

Any tool call that lacks a matching allow rule and isn't covered by `acceptEdits` will
surface as a `tool_use` pause event. Add the matching allow rule and re-run to confirm.

## What is still deliberately left to prompt

- `git push *` (any push — agents should not push without human review)
- `git push --force *` and `git push * main` (explicitly denied — never auto-approve)
- `rm` without -rf, and `rm -rf` on non-catastrophic paths (prompts by default)
- `curl`, `wget`, `ssh`, network tools (not in allow list; leave them to prompt)
- `npm publish`, `npx create-*`, package manager global installs

If an agent legitimately needs one of these, approve it once during the session or
add a scoped allow rule here after review.

## Reconciliation with existing settings.local.json files

The worktree `settings.local.json` files found in `.claude/worktrees/*/` contained
agent-accumulated one-off approvals using the deprecated `:*` colon suffix syntax
(e.g. `"Bash(npm run:*)"` instead of `"Bash(npm run *)"`). Those per-worktree files
are still valid but superseded by this project-level `settings.json`. Their rules are
absorbed into the allow list here using the current space-wildcard syntax.
