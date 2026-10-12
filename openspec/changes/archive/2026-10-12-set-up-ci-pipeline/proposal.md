# Proposal

## Why

Nothing checks a PR before it is merged. Build, tests, lint and formatting run only when someone runs them locally, so a red change can land on `main` (#11).

## What Changes

- Add a GitHub Actions workflow that runs the same checks as step 2 of the implementation workflow (install, build, unit tests, BDD tests, lint, format check) on every PR to `main` and every push to `main`.
- Add a repository ruleset on `main` that requires this check to pass and the branch to be up to date with `main` before merging, with no bypass.
- Update the implementation workflow in `AGENTS.md`: wait for CI after pushing, fix CI failures and review findings with fixup commits, after approval autosquash and rebase onto `origin/main` and force push with lease, then merge with a merge commit and run `git fetch --prune`.
- Document CI in `README.md`.

Out of scope:

- Deployment, release, or preview environments.
- Testing on multiple Node versions or operating systems.

## Capabilities

### New Capabilities

None. This adds tooling and contributor workflow only and does not change app behavior, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New `.github/workflows/ci.yml`.
- New repository ruleset on `main` (GitHub setting, outside the repository).
- `AGENTS.md` (Git Workflow: Feature branches; Implementation Workflow: steps 7–9).
- `README.md`.
