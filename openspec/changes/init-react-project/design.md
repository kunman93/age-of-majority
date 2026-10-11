# Design

## Context

Greenfield repo: only `README.md`, `AGENTS.md`, `.editorconfig` and OpenSpec/agent files exist. Node 26 and npm 11 are available. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One command each to build, lint/format-check, unit-test and BDD-test.
- Gherkin features that can later mirror OpenSpec scenarios.

**Non-Goals:**
- App features, routing, state management, backend, hosting, CI.

## Decisions

- **Vite + React + TypeScript, npm.** Boring, minimal SPA scaffold; no server needed yet. Alternative: Next.js, only worthwhile with SSR/own backend (deferred to #3).
- **Tailwind v4 via `@tailwindcss/vite`.** No PostCSS or `tailwind.config` file needed.
- **ESLint flat config + Prettier.** `eslint-config-prettier` disables conflicting rules; Prettier runs as a separate command, not as an ESLint rule. Prettier follows `.editorconfig` (2 spaces, LF).
- **Vitest + Testing Library instead of Jest.** Native to Vite, same `describe/it/expect` API, avoids Babel/ts-jest config. Agreed with the user.
- **Playwright + `playwright-bdd`.** One runner and config for BDD; features in `features/`, step definitions in `features/steps/`. Alternative: raw `@cucumber/cucumber` + Playwright needs extra glue. Playwright starts the Vite dev server via `webServer`.
- **npm scripts as the command surface:** `build`, `lint`, `format`, `format:check`, `test` (Vitest), `test:bdd` (generate + run Playwright). AGENTS.md references these.
- **Smoke tests:** one Vitest component test and one Gherkin scenario against the starter page.

## Risks / Trade-offs

- [Tool versions drift quickly] → Pin via lockfile; use current stable majors at install time.
- [Playwright browsers are a large download] → Install only Chromium.
- [Vitest differs from the issue's Jest] → Accepted by the user; same test API.
