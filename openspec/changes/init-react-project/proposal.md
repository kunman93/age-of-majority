# Proposal

## Why

The repository is empty. Before any birthday-card feature can be built (#2), a React project and its developer tooling (styling, lint, format, unit and BDD tests) must exist.

## What Changes

- Initialize a Vite + React + TypeScript single-page app (npm).
- Add Tailwind CSS v4 via `@tailwindcss/vite`.
- Add ESLint (flat config) and Prettier, aligned with `.editorconfig` and `eslint-config-prettier`.
- Add Vitest + Testing Library for unit/component tests (replaces Jest from the issue; agreed acceptable).
- Add Playwright with `playwright-bdd` for Gherkin/Cucumber-style BDD tests.
- Add one smoke test per layer (unit and BDD) to prove the wiring works.
- Fill in the build, test and lint command placeholders in `AGENTS.md`.
- Update `README.md` with an intro on what the repo is about and getting-started commands.

Out of scope: backend for wishes (#3), hosting (#4), CI.

## Capabilities

### New Capabilities

None. This is tooling only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New files at the repo root: `package.json`, lockfile, Vite/TypeScript/ESLint/Prettier/Vitest/Playwright configs, `src/`, `features/`.
- `AGENTS.md` updated with real commands; `README.md` gains an intro and getting-started section.
- New dev dependencies; no runtime services.
