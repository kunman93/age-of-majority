# Proposal

## Why

The AI instructions (`AGENTS.md`, skills, custom agents, prompts) drift from the code and the workflow when a diff changes something they describe and nobody updates them. The `reviewer` agent is the natural gate, but it has no check for this, and its template placeholders were never filled in (#17).

## What Changes

- Fill in the template placeholders in `.github/agents/reviewer.agent.md`: `<BASE_BRANCH>` → `main`, `<TEST_COMMAND>` → `npm test` and `npm run test:bdd`, `<LINT_COMMAND>` → `npm run lint` and `npm run format:check`. Remove the template note.
- Replace the placeholder comment under "Project checks" with an AI instructions freshness check:
  - If the diff changes commands, conventions, file layout, workflow or tooling that `AGENTS.md`, `.agents/skills/`, `.github/skills/`, `.github/agents/` or `.github/prompts/` describe, and those files were not updated in the same diff, that is a finding.
  - Instructions that now misdescribe the repo (wrong command, stale path, removed step) are **MAJOR**, consistent with check 9. Instructions that are incomplete but not wrong are **MINOR**.
  - For the OpenSpec-generated files (`.github/skills/openspec-*`, `.github/prompts/opsx-*`), the suggested direction is to regenerate them with `openspec update`, not to edit them by hand.
  - The reviewer stays read-only. It reports the needed update with `file:line` and a suggested direction. Fixes go back to step 6 (Implement).
- Reword the "Hard rules" reference to "the test command, and the linter" so it covers the two test and two lint commands.

## Capabilities

### New Capabilities

None. This changes contributor workflow docs only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `.github/agents/reviewer.agent.md`.
