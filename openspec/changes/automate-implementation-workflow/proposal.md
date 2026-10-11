# Proposal

## Why

Running the implementation workflow in `AGENTS.md` takes a lot of manual steering: the dev switches models with `/model`, tidies git history by hand, and has to point the agent at PR findings (#7). The agent should drive these steps itself so that the dev only has to step in for decisions and approvals.

## What Changes

- Add `### 0. Check model` to `AGENTS.md`: when the dev hands over a Story, check that the main session runs on Opus 5.5. If not, ask the dev to switch with `/model` and stop.
- Define model use: the main session (Opus 5.5) runs research, planning and review. Step 5 (Implement) is delegated to a Sonnet 5.5 subagent, with Opus 5.5 as fallback.
- Extend `### 7. Create PR`:
  - Before the first push, clean up the git history safely (backup branch, rewrite, compare tree, delete backup).
  - When the dev reports the PR review is done, read the findings via `gh`. If there are any, return to step 5 and fix them with new commits.
- Remove the "revert the archive commit" bullet from `### 8. Archive`. It is no longer needed because findings are handled in step 7, before approval.
- Add an optional **Depends on** field to `.github/ISSUE_TEMPLATE/story.yml`, so that dependencies between Stories are traceable.

Out of scope:

- Picking the next Story from the project board and moving board cards. The dev declined to grant `gh` the `project` scope because it cannot be limited to one board. The dev keeps naming the Story and moving cards manually.
- Testing the new workflow end to end. That happens on #8.

## Capabilities

### New Capabilities

None. This changes contributor workflow docs and an issue template only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `AGENTS.md` (Implementation Workflow section).
- `.github/ISSUE_TEMPLATE/story.yml`.
