# age-of-majority

A birthday card web application for a relative who is turning 18 (the age of majority). Multiple families can post their wishes to the card.

Built with React, TypeScript, Vite and Tailwind CSS.

## Getting started

Requires npm and Node.js 22.22.2+, 24.15+ or 26+.

```bash
npm install
npx playwright install chromium   # once, for BDD tests
npm run dev
```

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the dev server                 |
| `npm run build`        | Type-check and build for production  |
| `npm run lint`         | Lint with ESLint                     |
| `npm run format`       | Format with Prettier                 |
| `npm run format:check` | Check formatting                     |
| `npm test`             | Run unit tests (Vitest)              |
| `npm run test:bdd`     | Run BDD tests (Playwright + Gherkin) |

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs build, unit tests, BDD tests, lint and format check on every pull request to `main` and every push to `main`.

`main` is protected by a ruleset (no bypass) that requires the `ci` check to pass and the branch to be up to date with `main`. The ruleset references the job name, so renaming the `ci` job breaks the required check.
