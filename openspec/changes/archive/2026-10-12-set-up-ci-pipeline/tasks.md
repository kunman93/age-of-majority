# Tasks

## 1. CI workflow

- [x] 1.1 Add `.github/workflows/ci.yml` with one job `ci` as described in design.md. Verify that the YAML parses with `python3 -c 'import yaml; yaml.safe_load(open(".github/workflows/ci.yml"))'`. The real run is verified on the PR in step 7.
- [x] 1.2 Add a "Continuous integration" section to `README.md`: what runs, when, and that `main` requires the `ci` check (job name referenced by the ruleset) and an up-to-date branch. Verify `npm run format:check` passes.

## 2. AGENTS.md workflow

- [x] 2.1 Extend `### 7. Create PR`: after pushing, wait for CI with `gh pr checks <n> --watch`; on failure read `gh run view <run-id> --log-failed`, return to step 5 and fix with fixup commits. Verify by reading the doc and `npm run format:check` (covers `AGENTS.md`).
- [x] 2.2 Extend `### 9. Merge`: merge only when `ci` is green with `gh pr merge --merge --delete-branch`; if `main` moved since step 8, finalize the history again as in step 8 (including the step 2 checks). Verify by reading the doc and `npm run format:check` (covers `AGENTS.md`).
- [x] 2.3 Add the history strategy to `### Feature branches` and steps 7-8: fixup commits during review, autosquash and rebase onto `origin/main` after approval with defined error paths and backup lifecycle, force push only with `--force-with-lease --force-if-includes`. Verify by reading the doc and `npm run format:check`.
- [x] 2.4 Run `git fetch --prune` after the merge in step 9. Verify by reading the doc.

## 3. Merge gate (main session, after the PR is pushed)

- [x] 3.1 After the PR's first `ci` run is green, create the `main` ruleset with the command in design.md (the user approved this in the research conversation, satisfying the AGENTS.md rule about changes outside the repository). Verify with the `gh api repos/kunman93/age-of-majority/rules/branches/main` assertions in design.md and `enforcement: active`.

## Workflow follow-up

- Archive the change after the dev approves the PR.
