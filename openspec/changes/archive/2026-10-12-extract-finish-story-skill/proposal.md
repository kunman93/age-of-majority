# Proposal

## Why

`AGENTS.md` is 210 lines, and steps 8–10 (Create PR, Archive, Merge) make up about half of them. They only matter at the end of a Story, yet every session loads them. The "finalize history" procedure is also spelled out in step 9 and repeated in step 10 (#16).

## What Changes

- Add a project skill `.agents/skills/finish-story/SKILL.md`, loaded on demand, that holds the full procedures of steps 8–10. It contains these sections:
  - Create PR: pre-push history cleanup, push and open the PR, fixup rules during review, waiting for `ci`, and reading review findings.
  - Finalize history: backup, autosquash, verify diff, rebase on `origin/main` with the tiered conflict handling, push with lease, wait for `ci`, handle failures, and delete the backup. It is written once and has a step-9-only slot to archive and commit between the rebase and the push.
  - Archive: runs Finalize history with the archive slot.
  - Merge: merge and prune. If GitHub refuses because `main` moved, it runs Finalize history again.
- Shrink steps 8–10 in `AGENTS.md` to short entries. Each names its model (Sonnet 5.5) and the `finish-story` skill, and keeps its approval gate visible:
  - Step 8: do not archive until the user approves.
  - Step 9: wait for the user's explicit approval of the PR.
  - Step 10: never merge without the user's approval.
- Keep everything else in `AGENTS.md` unchanged, except that the force-push permission under Feature branches also names the skill. That covers Working Style, Coding Style, Documentation, Feature branches, the **Never** list, the permission for `git reset --hard` and force pushes, step 0 and step 2.

No workflow behavior changes. Every rule in today's steps 8–10 is kept in either `AGENTS.md` or the skill.

Out of scope:

- A custom agent pinned to Opus 5.5 for the "unsure whether trivial" conflict check. Conflicts are rare, and the `general-purpose` subagent with a `model` argument works (YAGNI).
- A custom agent for the workflow as a whole. The approval gates and `/model` switches need the main session.

## Capabilities

### New Capabilities

None. This changes contributor workflow docs only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `AGENTS.md` (Git Workflow: Feature branches; Implementation Workflow: steps 8–10).
- New `.agents/skills/finish-story/SKILL.md`.
