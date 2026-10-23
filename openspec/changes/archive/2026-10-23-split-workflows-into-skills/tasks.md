# Tasks

## 1. finish-work skill

- [x] 1.1 Run `git mv .agents/skills/finish-story .agents/skills/finish-work`. Set `name: finish-work` and write a `description` that names Stories, bug fixes and chores and no `AGENTS.md` step numbers. Verify that `ls .agents/skills/finish-work/SKILL.md` succeeds and the frontmatter `name` matches the directory.
- [x] 1.2 Remove the step numbers from the section headings (Create PR, Finalize history, Archive, Merge). Rewrite the intro to say which workflow skill uses which section. Replace every "workflow step N" with the step name in "the workflow skill in use". Replace the step 2 command reference with a pointer to the `AGENTS.md` Commands section. Verify that `grep -nE "step [0-9]|steps [0-9]|AGENTS.md step|Story Workflow" .agents/skills/finish-work/SKILL.md` prints nothing (only "sub-step" references to its own procedure may remain).
- [x] 1.3 Make the archive sub-step of Finalize history conditional on the branch adding an unarchived change, using the `git diff --name-only --diff-filter=A origin/main...HEAD -- openspec/changes ':!openspec/changes/archive'` check from design.md. Remove the "with/without sub-step 4" and "skipping sub-step 4" wording from Archive, Merge and the `ci` failure loop. Verify by running the check on this branch, which lists `openspec/changes/split-workflows-into-skills/` files, and on `origin/main` (`git diff --name-only --diff-filter=A origin/main...origin/main -- …`), which prints nothing.

## 2. AGENTS.md Commands section

- [x] 2.1 Add a `## Commands` section with the verify commands (`npm ci`, `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint`, `npm run format:check`). Verify that each command runs as written: the clean-state run on this branch already passed with these exact commands.

## 3. Workflow skills

- [x] 3.1 Create `.agents/skills/implement-story/SKILL.md` with steps 0–10 copied from today's Story Workflow. It includes the Story issue check and the `write-story` pointer, the model per step (Opus 5.5 for 3 and 4), the `react-developer` and `reviewer` rules, and the Approve, Archive and Merge gates. Create PR, Archive and Merge point to the `finish-work` sections, and Verify clean state points to `AGENTS.md` Commands. Verify that the frontmatter `name` matches the directory, and that `grep -nE "fix-bug|do-chore|AGENTS.md#[0-9]" .agents/skills/implement-story/SKILL.md` prints nothing.
- [x] 3.2 Create `.agents/skills/fix-bug/SKILL.md` with steps 0–7 from design.md. It includes the bug report check and the `write-bug-report` pointer, the all-Sonnet model rule, the reproduce-first TDD rule, the spec-change stop rule that points to a Story via `write-story`, and Finalize without archiving. Verify that the frontmatter `name` matches the directory, and that `grep -nE "implement-story|do-chore|Story Workflow|AGENTS.md#[0-9]" .agents/skills/fix-bug/SKILL.md` prints nothing.
- [x] 3.3 Create `.agents/skills/do-chore/SKILL.md` with steps 0–7 from design.md. It includes the explicit-request precondition (no issue, no OpenSpec change), the all-Sonnet model rule, TDD where code changes, and Finalize without archiving. Verify that the frontmatter `name` matches the directory, and that `grep -nE "implement-story|fix-bug|Story Workflow|Bug Fix Workflow|AGENTS.md#[0-9]" .agents/skills/do-chore/SKILL.md` prints nothing.

## 4. AGENTS.md router, Git Workflow and Working Style

- [x] 4.1 Replace the "Implementation Workflow" body with the router from design.md (kind of work → skill, and the `write-story` / `write-bug-report` rule). Verify that `grep -nE "^#### |Story Workflow|Bug Fix Workflow|Chore Workflow" AGENTS.md` prints nothing, and that `wc -l AGENTS.md` shows a clear drop from 229.
- [x] 4.2 Point the Feature branches rewrite/force-push rule and its **Never** entry at the `finish-work` procedures instead of steps 8–10 and their anchors. Verify that every `](#…)` link in `AGENTS.md` matches a heading, and that `grep -n "finish-story\|steps 8" AGENTS.md` prints nothing.
- [x] 4.3 Add the subagent emoji bullet to Working Style (`🔍` reviewer, `⚛️` react-developer). Verify by reading the doc, and run `npm run format:check`, which should pass.

## 5. Agent files

- [x] 5.1 In `react-developer.agent.md`, change "Implementation Workflow" to the workflow skill wording and point the verify link to `../../AGENTS.md#commands`. In `reviewer.agent.md` check 10, change "step 6 (Implement) in `AGENTS.md`" to the Implement step of the workflow skill in use. Verify that `grep -rnE "AGENTS.md#[0-9]|step [0-9]+ \(|Implementation Workflow of" .github/agents` prints nothing.

## 6. Integration checks

- [x] 6.1 Search for leftover references: `grep -rnE "finish-story|Story Workflow|Bug Fix Workflow|Chore Workflow|#[0-9]+-[a-z-]+\)" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive .` matches only this change's own artifacts. Verify by reporting the output.
- [x] 6.2 Check that no rule was lost: go through `git show origin/main:AGENTS.md` lines 88–221 and the old `finish-story` skill rule by rule, and confirm each rule appears in `AGENTS.md`, the matching workflow skill(s) or `finish-work`. Verify by reporting the result per workflow.
- [x] 6.3 Run the verify commands from `AGENTS.md` Commands. All of them should pass.
- [x] 6.4 Make sure both agent files tell their agent to follow `AGENTS.md` Working Style, including the emoji prefix (`reviewer.agent.md` gets the line). Verify with `grep -n "Working Style" .github/agents/*.agent.md`, which should match both files.

## Workflow follow-up

- After merge, ask the user to restart the session and confirm that `/skills` lists `implement-story`, `fix-bug`, `do-chore` and `finish-work`, and no longer lists `finish-story`.
- Archive the change after the user approves the PR.
