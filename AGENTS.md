# Coding Agent Instructions

Read the [README.md](README.md) to understand what the repo is about.

---

## Working Style

- Address the user as "Wannabe Unicorn".
- Prefer the simplest solution that meets the acceptance criteria. Apply YAGNI. Prefer deletion over addition.
- Be direct, concise, and honest. Call out bad ideas plainly.
- Choose boring over clever.
- Follow the conventions already present in the code over introducing new ones.
- Prove behavior with executable validation before declaring work done.
- If something's unclear, ask the user instead of guessing. Never assume.
- Prefix every message that needs the user's action or decision with 🙋, and use 🙋 for nothing else.
- Ask for permission before modifying anything outside the repository.

---

## Git Workflow

All work happens on feature branches. `main` is read-only: inspect it, but never commit to it, rebase it, or modify it in any way.

### Feature branches

- Name branches `feature/<branch-name-based-on-issue>` (use `fix/<...>` for bug fixes, `chore/<...>` for maintenance).
- Commit with the `.agents/skills/git-commit` skill. Make atomic commits: one logical change per commit.
- Pushing the feature branch is allowed.
- Rewrite and force push your own feature branch only as described in steps 8–10 of the Implementation Workflow,
  always with `git push --force-with-lease --force-if-includes`. These steps and the `finish-story` skill are the
  explicit request for `git reset --hard` and force pushes that the `git-commit` skill requires.
- Delete a feature branch only after its PR has been merged (see [10. Merge](#10-merge)).

**Never**:

- Push to, rebase, or rewrite `main`
- Force push with plain `--force`
- Force push outside [8. Create PR](#8-create-pr), [9. Archive](#9-archive) and [10. Merge](#10-merge)

---

## Coding Style

- Do not add comments to config/source files that merely restate what's already
  obvious from the element or identifier name. Only comment when it conveys
  non-obvious rationale or context.
- Never introduce secrets, tokens, or credentials into the repository.

---

## Implementation Workflow

Pick the workflow by the kind of work: a Story issue follows the [Story Workflow](#story-workflow) on a `feature/`
branch, a bug report the [Bug Fix Workflow](#bug-fix-workflow) on a `fix/` branch, and explicitly requested
maintenance the [Chore Workflow](#chore-workflow) on a `chore/` branch.
Stories and bug fixes start from an issue; the user names it and moves its card on the project board.
The main session runs on Sonnet 5.5, except steps 3 and 4 of the Story Workflow, which always run on Opus 5.5 in the
main session. Step 7 runs the `reviewer` subagent, which is pinned to Opus 5.5 in its agent file.

Rules that apply to all three workflows:

- Run the model check from [step 0](#0-check-story-and-model) before starting a step.

### Story Workflow

Runs on a `feature/<...>` branch. To create a Story, use the `write-story` skill (`.agents/skills/write-story`); never create one as a free-form issue.

#### 0. Check Story and model

- Before step 1, check that the user has provided the Story (an issue number or link). If not, ask the user for one and stop. Do not pick an issue yourself and do not start working. If the user has no Story yet, mention that the `write-story` skill can create one.
- Before starting a step, check the main session model reported in your environment information against the model named in the step.
- If it does not match, or if you cannot tell, tell the user which model to pick with `/model` and stop.
- The check covers the main session only; subagent models are set by their agent file or the `model` argument.

#### 1. Create feature branch

Runs on Sonnet 5.5.

- Fetch `main` from origin.
- Create a feature branch based on `origin/main`, following the naming conventions in [Feature branches](#feature-branches).

#### 2. Verify clean state

Runs on Sonnet 5.5. Verify you have a clean state:

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm test` (unit) and `npm run test:bdd` (BDD)
- Lint/format: `npm run lint` and `npm run format:check`

#### 3. Research

Runs on Opus 5.5.

- Research the issue provided as a prompt with the `openspec-explore` skill (`/opsx-explore`).

#### 4. Plan

Runs on Opus 5.5.

- Create a change proposal with the `openspec-propose` skill (`/opsx-propose`).
- Commit the proposal.

#### 5. Approve plan

Runs on Sonnet 5.5.

- Ask the user to review the change proposal (the change's artifacts in `openspec/changes/<change>/`) and wait for their explicit approval in the conversation.
- If the user requests changes, return to [4. Plan](#4-plan) and revise the proposal with the `openspec-update-change` skill (`/opsx-update`). Step 4 runs on Opus 5.5, so the model check applies.
- Only after approval, continue with step 6 (Implement).

#### 6. Implement

Runs on Sonnet 5.5 in the main session.

- Implement the tasks from the change with the `openspec-apply-change` skill (`/opsx-apply`), applying TDD, and make atomic commits with the `.agents/skills/git-commit` skill.
- When done, verify the work with the commands from [2. Verify clean state](#2-verify-clean-state).
- Then continue directly with [7. Review](#7-review) without asking the user.

#### 7. Review

Runs on Sonnet 5.5. The review itself runs in the `reviewer` subagent, which is pinned to Opus 5.5. No `/model` switch is needed, so start it automatically.

Once the implementation is complete, have the reviewer agent
([.github/agents/reviewer.agent.md](.github/agents/reviewer.agent.md)) review the feature branch.
Run it as the custom `reviewer` subagent, not as a general-purpose or code-review agent.

If there are any MAJOR findings, return to [6. Implement](#6-implement) and fix them,
then run the review again. Repeat until the reviewer approves without any MAJOR findings.

#### 8. Create PR

Runs on Sonnet 5.5.

- Clean up the history, push the feature branch, create the PR, wait for `ci`, and handle CI failures and PR review
  findings with the `finish-story` skill (`.agents/skills/finish-story`, section "Create PR").
- Do not archive until the user approves.

#### 9. Archive

Runs on Sonnet 5.5.

- Wait for the user's explicit approval of the PR in the conversation. GitHub does not allow approving your own PR, so this is the approval.
- Then finalize the history, archive the change with the `openspec-archive-change` skill (`/opsx-archive`), push, and
  wait for `ci` with the `finish-story` skill (section "Archive").

#### 10. Merge

Runs on Sonnet 5.5.

- Only when `ci` is green and the user has approved, merge the PR with the `finish-story` skill (section "Merge").
- Never merge without the user's approval.

### Bug Fix Workflow

Runs on a `fix/<...>` branch and uses the Story step numbers. It needs a bug report (an issue number or link); ask for
one and stop if missing, and do not pick an issue yourself. If the user has none, mention that the `write-bug-report`
skill (`.agents/skills/write-bug-report`) can create one; never create a bug report as a free-form issue.

- Step 0: the model check only; the bug report check above replaces the Story check. Steps 1 and 2: as in the Story
  Workflow, with a `fix/` branch.
- Steps 3–5 (research, plan, approve plan): skipped. Reproduce and find the root cause directly. If the fix requires
  changing an OpenSpec spec (`openspec/specs/`), stop and tell the user: it is a change, not a bug, and belongs in the
  Story Workflow.
- Step 6: as in the Story Workflow, but instead of `/opsx-apply`, write a failing test that reproduces the bug (TDD),
  then fix it.
- Steps 7, 8 and 10: as in the Story Workflow.
- Step 9: as in the Story Workflow, but without archiving: wait for the user's approval, then run "Finalize history"
  of the `finish-story` skill without its archive sub-step.

### Chore Workflow

Runs on a `chore/<...>` branch for maintenance work the user explicitly asked for, and uses the Story step numbers.
It needs no issue and no OpenSpec change.

- Steps 1 and 2: as in the Story Workflow, with a `chore/` branch.
- Steps 3–5 (research, plan, approve plan): skipped.
- Step 6: as in the Story Workflow, but instead of `/opsx-apply`, implement the chore, applying TDD where code
  changes.
- Steps 7, 8, 9 and 10: as in the Bug Fix Workflow.

---

## Documentation

- Use progressive disclosure. Start with the smallest relevant doc set.
- Follow the markdown conventions as stated in the [Markdown Guide](https://www.markdownguide.org/).
- Do not create a `.md` file that merely restates or describes an existing
  config/source file. The original file is the documentation; only add prose docs
  when they convey information not already evident from the file itself.
