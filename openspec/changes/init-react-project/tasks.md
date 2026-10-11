# Tasks

## 1. Project scaffold

- [ ] 1.1 Scaffold Vite + React + TypeScript in the repo root with npm (keeping existing files) and verify `npm run build` succeeds
- [ ] 1.2 Remove starter demo content, leaving a minimal `App` page with a heading, and verify `npm run dev` serves it

## 2. Styling

- [ ] 2.1 Add Tailwind CSS v4 with `@tailwindcss/vite` and verify a Tailwind utility class on the heading appears in the built CSS

## 3. Lint and format

- [ ] 3.1 Configure ESLint flat config with `eslint-config-prettier` and add the `lint` script; verify `npm run lint` passes
- [ ] 3.2 Configure Prettier (consistent with `.editorconfig`) and add `format` and `format:check` scripts; verify `npm run format:check` passes

## 4. Unit tests

- [ ] 4.1 Add Vitest + Testing Library (jsdom) with a `test` script and a smoke test rendering `App`; verify `npm test` passes

## 5. BDD tests

- [ ] 5.1 Add Playwright (Chromium only) and `playwright-bdd` with a `webServer` on the Vite dev server and a `test:bdd` script
- [ ] 5.2 Add a smoke `.feature` with step definitions for the home page and verify `npm run test:bdd` passes

## 6. Project docs and commands

- [ ] 6.1 Fill in the build, test and lint commands in `AGENTS.md` and verify each runs as written
- [ ] 6.2 Update `README.md` with an intro (birthday card web app for a relative turning 18, where multiple families post their wishes) and a short "Getting started" section; verify the commands run as written
- [ ] 6.3 Run build, lint, format check, unit and BDD tests together from a clean `npm ci` and verify all pass

## Workflow follow-up

- Review the branch with the reviewer agent, open a PR to `main`, then archive the change.
