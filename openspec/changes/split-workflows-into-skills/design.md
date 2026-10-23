# Design

## Context

`AGENTS.md` is always loaded. A skill's body loads only when the agent invokes it, and until then the agent sees only the frontmatter `name` and `description`. So the description decides when a skill loads, and `AGENTS.md` needs a router so the agent picks the right workflow skill. Project skills live in `.agents/skills/<name>/SKILL.md` (for example `finish-story`, `write-story`). `.agents` and `.github` are in `.prettierignore`, so `npm run format:check` covers only `AGENTS.md`.

Today the three workflows sit in `AGENTS.md` "Implementation Workflow". Bug Fix and Chore reuse the Story step numbers and are written as diffs against it ("Steps 7, 8 and 10: as in the Story Workflow"). `finish-story` and both agent files point back into `AGENTS.md` by step number or anchor (`#2-verify-clean-state`, "step 6 (Implement) in `AGENTS.md`").

## Goals / Non-Goals

**Goals:**

- Each workflow skill can be followed on its own, without reading `AGENTS.md` workflow text or another workflow skill.
- Everything that is not a workflow step stays in `AGENTS.md`: Working Style, Git Workflow (including the force-push rules), Engineering Principles, Documentation.

**Non-Goals:**

- Changing any gate, model rule or command.
- Merging the three workflow skills into one with branches, or adding start-branch or review-branch skills (decided in #45).
- Editing archived changes or the OpenSpec-generated `.github/skills/openspec-*` and `.github/prompts/opsx-*` files.

## Decisions

### Skill layout and step numbering

Each skill numbers its own steps consecutively, starting at 0 for the setup check. Shared files refer to steps by name, never by number, because the numbers differ between skills.

```
implement-story            fix-bug                    do-chore
0  Check workflow setup    0  Check workflow setup    0  Check workflow setup
1  Create feature branch   1  Create fix branch       1  Create chore branch
2  Verify clean state      2  Verify clean state      2  Verify clean state
3  Research   (Opus)       3  Implement (repro test)  3  Implement
4  Plan       (Opus)       4  Review                  4  Review
5  Approve plan            5  Create PR               5  Create PR
6  Implement               6  Finalize                6  Finalize
7  Review                  7  Merge                   7  Merge
8  Create PR
9  Archive
10 Merge
```

`implement-story` keeps today's Story numbers, so its sections and the Opus rule ("steps 3 and 4") read the same as before. In `fix-bug` and `do-chore`, "Finalize" is today's step 9 without archiving: wait for the user's approval, then run Finalize history in `finish-work`.

Alternative considered: keep the Story numbers in all three skills. Rejected, because `fix-bug` and `do-chore` would jump from 2 to 6, and cross-references would still be wrong for two of the three skills.

### What each workflow skill holds

Each skill holds:

- Frontmatter: `name` and a trigger-focused `description`, for example "Use when the user asks to work on, start or implement a Story issue".
- The workflow's preconditions: the issue check (Story or bug report, never pick one yourself), the pointer to `write-story` or `write-bug-report`, and for chores, the fact that the user must have asked for the work explicitly.
- The model and agent check (step 0) and the model per step.
- Every step in full, copied from today's text. This includes the approval gates, the `react-developer` delegation rule in Implement, the "continue to Review without asking" rule, the `reviewer` loop on MAJOR findings, and pointers to the `finish-work` sections.

`fix-bug` keeps the stop rule for spec changes but no longer names the Story Workflow: "it is a change, not a bug; tell the user it needs a Story (the `write-story` skill can create one)". This keeps it free of references to other workflow skills. Utility skills (`git-commit`, `finish-work`, `write-story`, the `openspec-*` skills) may still be referenced.

### Router in AGENTS.md

"Implementation Workflow" shrinks to a few lines:

- Story issue → `implement-story`, bug report → `fix-bug`, maintenance the user explicitly asked for → `do-chore`. Load the skill before doing anything else.
- Stories and bug reports are created only with `write-story` and `write-bug-report`, never as free-form issues. This line stays in `AGENTS.md` because the user may ask for an issue outside any workflow.

### Commands section in AGENTS.md

A new `## Commands` section lists the verify commands once. The workflow skills' "Verify clean state" step, `finish-work` and `react-developer` point to it. These are facts about the repo, not workflow steps, and `AGENTS.md` is always loaded.

Alternative considered: copy the commands into each skill and into `react-developer`. Rejected because four copies of a list that changes with tooling would drift apart.

### finish-story becomes finish-work

`git mv .agents/skills/finish-story .agents/skills/finish-work` keeps the history. Changes:

- `name: finish-work`. The description names Stories, bug fixes and chores, and no longer mentions `AGENTS.md` step numbers.
- Section headings lose their step numbers: Create PR, Finalize history, Archive, Merge. The intro says which workflow skill uses which section. The approval gates are repeated in the workflow skills, as they were in `AGENTS.md`.
- References like "workflow step 6 (Implement)" become "the Implement step of the workflow skill in use". "Run the commands from step 2" becomes "the verify commands in `AGENTS.md` Commands".
- The archive sub-step becomes conditional on the branch, not on the workflow: it runs only if the branch adds an unarchived change, that is, if `git diff --name-only --diff-filter=A origin/main...HEAD -- openspec/changes ':!openspec/changes/archive'` lists files. Once a change is archived, it lives under `archive/`, so this check finds nothing on a re-finalize. That replaces today's "skip sub-step 4 because the change is already archived" bookkeeping with one rule. Archive and Merge then simply run Finalize history.

Alternative considered: keep the explicit "with/without sub-step 4" wording. Rejected because #45 asks for archiving to depend on whether a change exists, and the condition already covers the re-finalize case.

### Git Workflow and force-push rules

Feature branches: "Rewrite and force push your own feature branch only in the Create PR, Finalize history and Merge procedures of the `finish-work` skill". Never list: "Force push outside those `finish-work` procedures". This keeps the rule visible at all times while dropping the step anchors.

### Subagent emoji

"Working Style" gets one bullet: each subagent named there prefixes every message with its emoji, `🔍` for `reviewer` and `⚛️` for `react-developer`. This keeps 🙋 reserved for "needs the user". Both agent files tell their agent to follow `AGENTS.md` Working Style (`react-developer` already did; `reviewer` gets the line, because it does not reliably receive `AGENTS.md` otherwise).

### Agent files

- `react-developer.agent.md`: "the Implementation Workflow of the work you were given" becomes "the workflow skill of the work you were given". The `#2-verify-clean-state` link becomes a link to `AGENTS.md#commands`.
- `reviewer.agent.md` check 10: "Fixes go back to step 6 (Implement) in `AGENTS.md`" becomes "Fixes go back to the Implement step of the workflow skill in use".

## Risks / Trade-offs

- [Copied steps drift apart across the three skills] → Each copy is short. Reviewer check 10 (AI instructions freshness) flags a skill that misdescribes the workflow. #45 chose copies over a shared step file.
- [The agent skips the router and works without loading a skill] → The router is the first item under "Implementation Workflow", and each skill's description names its trigger, so the skill can also be selected directly.
- [A rule is lost in the move] → One task compares every rule of `git show origin/main:AGENTS.md` lines 88–221 with the new skills and `AGENTS.md`, and reports the result.
- [The new skills only appear in `/skills` after a session restart] → Ask the user to check `/skills` after the change lands. This session keeps the old list.
