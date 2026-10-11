# Design

## Context

`AGENTS.md` defines steps 1-9 of the implementation workflow. The agent cannot run slash commands such as `/model`. It can only choose the model of the subagents it starts. "Never force push" is a hard rule. The `gh` token has no `project` scope, so the agent cannot touch the project board.

## Goals / Non-Goals

**Goals:**

- No `/model` switching is needed during a run.
- PR history is clean without ever force pushing.
- PR findings are picked up via `gh` instead of being pasted by the dev.

**Non-Goals:**

- Project board automation (see proposal.md, Out of scope).
- Scripts or CI automation. The workflow stays prose that the agent follows.

## Decisions

### Main session on Opus 5.5, implementation on a Sonnet 5.5 subagent

Research (step 3) is a conversation with the dev, so it must run in the main session to avoid relaying questions through a subagent. Orchestrating the workflow (git, review loop, PR findings) also needs judgment. Step 5 uses the most tokens, so it goes to a `general-purpose` subagent with `model: claude-sonnet-5.5`. If that subagent fails, the main session retries the work on Opus 5.5 without involving the dev.

The new step 0 checks the session model and asks the dev to switch to Opus 5.5 if needed. That is the only `/model` interaction.

Alternative considered: a Sonnet main session with Opus subagents for steps 3, 4 and 6. Rejected because step 3's questions would be relayed through Sonnet, which adds a hop where nuance can get lost.

### History cleanup before the first push only

Before the first push of the branch:

1. `git branch backup/<branch>`
2. Rewrite the history (squash fixups, reword, reorder) into atomic conventional commits.
3. Run `git diff backup/<branch> HEAD`. It must be empty, which proves the content is unchanged.
4. `git branch -D backup/<branch>`, then push and create the PR.

After the first push, the history is never rewritten, because that would need a force push. Fixes for PR findings land as new commits.

### PR findings loop

After creating the PR, wait for the dev. When the dev reports that the review is done, read the findings with `gh pr view --comments` and the review threads (`gh api repos/{owner}/{repo}/pulls/{n}/comments`). If there are findings, return to step 5, run step 6 again, and push.

### Dependency field in the Story template

Add an optional `textarea` named **Depends on**, with a placeholder like `#12, #15`. It is optional because most Stories have no dependencies. It is for traceability only. Since the dev names the Story, the agent does not use it to select work.

Alternative considered: native GitHub "blocked by" issue relationships. Not used because they live outside the issue body and are not prompted by the template.

### Archive without the revert path

Archiving happens only after the dev approves, and all findings are resolved before approval. The "revert the archive commit" fallback is therefore removed.

## Risks / Trade-offs

- [The Sonnet subagent lacks the conversation context] → The delegation prompt must include the change name, branch and relevant decisions.
- [The interactive rebase needs an editor] → Use a non-interactive form (`GIT_SEQUENCE_EDITOR` with a prepared todo, or `git reset --soft` and recommit). The empty-diff check guards the result either way.
