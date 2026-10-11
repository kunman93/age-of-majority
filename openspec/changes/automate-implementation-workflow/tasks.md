# Tasks

## 1. Story template

- [x] 1.1 Add an optional **Depends on** textarea to `.github/ISSUE_TEMPLATE/story.yml`. Verify that the YAML parses and that `npm run format:check` passes.

## 2. AGENTS.md workflow

- [x] 2.1 Add `### 0. Check model`: when given a Story, confirm the main session runs on Opus 5.5, otherwise ask the dev to switch with `/model` and stop. Verify by reading the doc.
- [x] 2.2 Document model use: main session on Opus 5.5, step 5 delegated to a Sonnet 5.5 `general-purpose` subagent with Opus fallback. Verify by reading the doc.
- [x] 2.3 Extend `### 7. Create PR` with backup-and-compare history cleanup before the first push, and the findings loop: read findings via `gh` when the dev reports the review is done, return to step 5, new commits only. Verify that the documented `gh` commands return review summaries, comments and inline threads (with `isResolved`) on a PR that has reviews (e.g. cli/cli#13084).
- [x] 2.4 Remove the revert bullet from `### 8. Archive`. Verify with `grep -n "revert" AGENTS.md`, which should return no match in step 8.
- [x] 2.5 Run `npm run format:check`. Verify it passes.

## Workflow follow-up

- Test the workflow end to end on #8.
- Archive the change after the dev approves the PR.
