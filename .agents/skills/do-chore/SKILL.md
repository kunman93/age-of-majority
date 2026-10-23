---
name: do-chore
description: 'Do a chore (maintenance such as tooling, config, dependencies, docs or refactoring that the user explicitly asked for) on a chore/ branch: implement, review, PR and merge. No issue and no OpenSpec change. Use when the user explicitly asks for a chore or maintenance task that is not a Story or a bug fix.'
---

# Do a Chore

Runs on a `chore/<...>` branch for maintenance work the user explicitly asked for. It needs no issue and no OpenSpec change.

The whole workflow runs on Sonnet 5.5 in the main session. Step 4 runs the `reviewer` subagent, which is pinned to Opus 5.5 in its agent file.

## 0. Check workflow setup

- Before starting a step, check the main session model reported in your environment information against the model named in the step.
- If it does not match, or if you cannot tell, tell the user which model to pick with `/model` and stop.
- Also check that the main session runs the default agent, not a custom agent. If it does not, or if you cannot tell, tell the user to switch with `/agent` and stop.
- The check covers the main session only; subagent models are set by their agent file or the `model` argument.

## 1. Create chore branch

Runs on Sonnet 5.5.

- Fetch `main` from origin.
- Create a branch `chore/<branch-name>` based on `origin/main`.

## 2. Verify clean state

Runs on Sonnet 5.5. Run all commands in the Commands section of `AGENTS.md`.

## 3. Implement

Runs on Sonnet 5.5 in the main session.

- Implement the chore, applying TDD where code changes. Make atomic commits with the `.agents/skills/git-commit` skill, following the Engineering Principles in `AGENTS.md`.
- Frontend work (UI, styling, animation, 3D) is always done by the `react-developer` agent ([.github/agents/react-developer.agent.md](../../../.github/agents/react-developer.agent.md)), run as a custom subagent. It loads the `react-ui` skill, the relevant `gsap-*` skills and the `threejs` skill (`.agents/skills/`) itself. The main session does all other work, such as tests that do not touch UI code, tooling and docs, and reviews and commits the agent's result.
- When done, verify the work with all commands in the Commands section of `AGENTS.md`.
- Then continue directly with step 4 (Review) without asking the user.

## 4. Review

Runs on Sonnet 5.5. The review itself runs in the `reviewer` subagent, which is pinned to Opus 5.5. No `/model` switch is needed, so start it automatically.

Once the implementation is complete, have the reviewer agent
([.github/agents/reviewer.agent.md](../../../.github/agents/reviewer.agent.md)) review the chore branch.
Run it as the custom `reviewer` subagent, not as a general-purpose or code-review agent.

If there are any MAJOR findings, return to step 3 (Implement) and fix them,
then run the review again. Repeat until the reviewer approves without any MAJOR findings.

## 5. Create PR

Runs on Sonnet 5.5.

- Clean up the history, push the chore branch, create the PR, wait for `ci`, and handle CI failures and PR review
  findings with the `finish-work` skill (`.agents/skills/finish-work`, section "Create PR").
- Do not finalize until the user approves.

## 6. Finalize

Runs on Sonnet 5.5.

- Wait for the user's explicit approval of the PR in the conversation. GitHub does not allow approving your own PR, so this is the approval.
- Then finalize the history, push, and wait for `ci` with the `finish-work` skill (section "Finalize history"). There is no OpenSpec change to archive.

## 7. Merge

Runs on Sonnet 5.5.

- Only when `ci` is green and the user has approved, merge the PR with the `finish-work` skill (section "Merge").
- Never merge without the user's approval.
