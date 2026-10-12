# Design

## Context

The checks already exist as npm scripts (see step 2 of `AGENTS.md`). `playwright.config.ts` already reads `CI` to disable server reuse. BDD tests need a Chromium browser installed. The repository is public and `main` has no branch protection or ruleset. Commits are merged with merge commits, and force pushing is allowed only on the own feature branch with `--force-with-lease --force-if-includes`.

## Goals / Non-Goals

**Goals:**

- One required check that is green only if every local verification step passes.
- `gh pr merge` refuses to merge while the check is red, missing, or the branch is behind `main`.

**Non-Goals:**

- Build matrix, caching beyond npm, artifacts, or deployment.

## Decisions

### One workflow, one job named `ci`

`.github/workflows/ci.yml` triggers on `pull_request` to `main` and `push` to `main`. A single job `ci` on `ubuntu-latest` with `timeout-minutes: 15` runs (a top-level `concurrency` group per ref cancels superseded runs):

1. `actions/checkout@v7`
2. `actions/setup-node@v7` with `node-version: 24` and `cache: npm`
3. `npm ci`
4. `npm run lint`, `npm run format:check` (fail fast)
5. `npx playwright install --with-deps chromium`
6. `npm run build`, `npm test`, `npm run test:bdd`

Alternative considered: parallel jobs per check. Rejected: more YAML and more required check names for a tiny project. One job gives one stable check name for the ruleset.

Node 24 is the current LTS and satisfies `engines`. Reading the version from `package.json` was rejected because `engines.node` is a range spanning several majors.

### Ruleset instead of classic branch protection

A repository ruleset `main` targets the default branch with a `required_status_checks` rule:

- context `ci`, `integration_id: 15368` (GitHub Actions), so only Actions can satisfy it.
- `strict_required_status_checks_policy: true`, so the branch must be up to date with `main`.
- No bypass actors, so the check also binds the repository owner, whose token the agent uses for `gh pr merge`.

It is created after the PR's first `ci` run has reported, so the check name exists and this PR is the first one gated. The user approved creating it in the research conversation. Exact request:

```bash
gh api --method POST repos/kunman93/age-of-majority/rulesets --input - <<'EOF'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [],
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [{ "context": "ci", "integration_id": 15368 }]
      }
    }
  ]
}
EOF
```

Verify with `gh api repos/kunman93/age-of-majority/rules/branches/main`, which must list a `required_status_checks` rule with context `ci`, `integration_id` 15368 and `strict_required_status_checks_policy: true`. The ruleset (`gh api repos/kunman93/age-of-majority/rulesets/<id>`) must have `enforcement: "active"` and empty `bypass_actors`.

Alternative considered: classic branch protection. Rulesets are GitHub's current mechanism and are listable via `gh api .../rulesets`.

### Workflow changes in `AGENTS.md`

- Feature branches: never push to, rebase or rewrite `main`, never force push with plain `--force`, and never force push outside steps 8 and 9. The own feature branch is rewritten and force pushed only as the workflow describes, always with `git push --force-with-lease --force-if-includes`.
- Step 7: after pushing, wait with `gh pr checks <n> --watch` (if it reports "no checks reported", wait briefly and retry). If `ci` fails, read the log with `gh run view <run-id> --log-failed`, return to step 5, and fix with `git commit --fixup=<sha>` commits. Review findings are fixed the same way; no history rewrite after the first push during review.
- Step 8: after the user's approval, create a backup branch (`git branch -f`, so a stale backup never blocks) and squash the fixups with `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash $(git merge-base HEAD origin/main)`. If autosquash conflicts, abort, reset to the backup, and ask the user. Otherwise verify an empty diff against the backup; if not empty, reset to the backup and ask the user. Then `git fetch origin main` and `git rebase origin/main`. Conflicts are resolved within the rebase as implementation work; if `main` brought in changes, run the step 2 checks, and after conflicts also re-review, push with lease, tell the user, and wait for re-approval. Then archive, commit, push with lease, and wait for `ci`. If `ci` is red, fix with fixup commits, push normally, and finalize the history again. The backup is deleted only once `ci` is green. The same applies if the merge in step 9 is refused because `main` moved: the history is finalized again, and the backup is deleted once `ci` is green.
- Step 9: only when `ci` is green, run `gh pr merge --merge --delete-branch`, which deletes the local and the remote branch. Then run `git fetch --prune`: the remote branch is deleted via the API, so the local remote-tracking ref `origin/<branch>` remains. If GitHub refuses because `main` moved since step 8, finalize the history again as in step 8 (including the step 2 checks), push with lease, wait for `ci`, and tell the user.

### History strategy

- Fixup commits during review keep GitHub's incremental review diffs.
- Squashing and rebasing once after approval gives atomic commits on an up-to-date, linear branch.
- A merge commit keeps each feature grouped (semi-linear history).
- `--force-with-lease --force-if-includes` prevents overwriting remote work that was not seen locally.

Alternatives considered: squashing every review round (rejected: loses incremental review diffs); squash merge or rebase merge (rejected: the user chose merge commits, and squash loses atomic commits).

## Risks / Trade-offs

- [No bypass blocks urgent fixes if CI itself is broken] → The owner can edit or disable the ruleset in Settings > Rules.
- [Strict up-to-date policy costs an extra CI run when `main` moved] → Acceptable for a solo repository with few parallel PRs.
- [Rebasing after approval changes commits the user approved] → The squash is checked with an empty diff against the backup; the user is told when `main` brought in changes or conflicts arise.
- [Renaming the job silently breaks the required check] → README states the job name is referenced by the ruleset.
