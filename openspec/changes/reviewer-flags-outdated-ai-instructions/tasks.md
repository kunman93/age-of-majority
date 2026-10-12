# Tasks

## 1. Reviewer agent

- [x] 1.1 In `.github/agents/reviewer.agent.md`, replace `<BASE_BRANCH>` with `main`, `<TEST_COMMAND>` with `npm test` and `npm run test:bdd`, and `<LINT_COMMAND>` with `npm run lint` and `npm run format:check`. Remove the template note. Verify that `grep -nE "<BASE_BRANCH>|<TEST_COMMAND>|<LINT_COMMAND>|Template note" .github/agents/reviewer.agent.md` finds nothing, and that the `git fetch`/`diff`/`log` commands in "Your job" run as written.
- [ ] 1.2 Replace the placeholder comment under `## Project checks` with check `10.` **AI instructions freshness**, as described in design.md: the five instruction paths, the trigger (diff changes commands, conventions, file layout, workflow or tooling they describe, without updating them), MAJOR for misdescribing and MINOR for incomplete, `openspec update` for `.github/skills/openspec-*` and `.github/prompts/opsx-*`, and read-only reporting with `file:line` and a suggested direction, with fixes going back to step 6 (Implement). Verify by reading the section and checking that `grep -n "<!--" .github/agents/reviewer.agent.md` finds nothing.
- [ ] 1.3 In "Hard rules", replace "the test command, and the linter" with "the test and lint commands listed in check 7". Verify by reading the doc and running `npm run format:check`, which must pass.

## Workflow follow-up

- Archive the change after the dev approves the PR.
