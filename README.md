# age-of-majority

A birthday card web application for a relative who is turning 18 (the age of majority). Multiple families can post their wishes to the card.

Built with React, TypeScript, Vite and Tailwind CSS.

## Getting started

Requires Node.js and npm.

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
