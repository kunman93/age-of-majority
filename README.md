# age-of-majority

A birthday card web application for a relative who is turning 18 (the age of majority). Several families send their wishes, which the maintainer collects and adds to the card.

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
| `npm run deploy`       | Build and deploy to Cloudflare Pages |

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs build, unit tests, BDD tests, lint and format check on every pull request to `main` and every push to `main`.

`main` is protected by a ruleset (no bypass) that requires the `ci` check to pass and the branch to be up to date with `main`. The ruleset references the job name, so renaming the `ci` job breaks the required check.

## Deployment

The card is hosted on [Cloudflare Pages](https://pages.cloudflare.com) under a secret link, and deployed from the maintainer's machine with `npm run deploy`.

### Why Cloudflare Pages

|                                                     | GitHub Pages                                         | Cloudflare Pages                           | Firebase Hosting (Spark)                                      |
| --------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Free-tier limits                                    | 1 GB site, 100 GB/month (soft)                       | 500 builds/month, unlimited static traffic | 10 GB storage, 360 MB/day transfer (site stops when exceeded) |
| Cost                                                | free                                                 | free                                       | free                                                          |
| Deploy a locally built card with git-ignored wishes | no, builds from the repo or needs a CI secret        | yes, `wrangler pages deploy`               | yes, `firebase deploy`                                        |
| Secret link                                         | no, the link is `kunman93.github.io/age-of-majority` | yes, random project name                   | yes, random project ID                                        |
| Setup effort                                        | lowest                                               | account, Wrangler login, project           | account, Firebase CLI, project                                |

There is no backend: the wishes are collected by the maintainer, so any static host works. Cloudflare Pages was chosen because it deploys a locally built card under an unguessable link, with no traffic cap.

The repository is public, so the real wishes and the secret link are never committed. Both live in git-ignored files.

The link is only secret, not protected: anyone it is forwarded to can open the card. The page tells search engines not to index it and sends no referrer to other sites. To revoke a leaked link, create a new project with a new name, deploy to it and delete the old project.

### The real wishes

Create `src/families.local.ts` in the shape of the placeholders in `src/families.ts`. A family name is not unique, and a message is signed by the family or by a member:

```ts
import type { Family } from './families'

export const families: readonly Family[] = [
  {
    name: 'Family Example',
    messages: [{ author: 'Family Example', text: 'Happy birthday!' }],
  },
]
```

Only production builds show these wishes. The dev server and all tests always show the placeholders. Preview them with `npm run build && npm run preview`. `npm run deploy` checks the file first and stops with a message for a mistake such as a missing `author`, an empty list or a leftover Lorem ipsum text.

Keep a private backup of `src/families.local.ts` and `.env.local`, because neither is in git.

### One-time setup

1. Create a free Cloudflare account and run `npx wrangler@4.151.1 login`.
2. Generate the project name: `node -e "console.log('age-of-majority-' + require('crypto').randomBytes(16).toString('hex'))"`.
3. Put it in `.env.local`: `CLOUDFLARE_PAGES_PROJECT=<the generated name>`.
4. Create the project: `npx wrangler@4.151.1 pages project create <the generated name> --production-branch main`.

### Deploying

Run `npm run deploy`. It stops without building when `src/families.local.ts` is missing or invalid, or when `CLOUDFLARE_PAGES_PROJECT` is missing or not `age-of-majority-` followed by 32 hexadecimal characters. Otherwise it builds the card, stops if the build does not contain every family name from your file, and uploads it. The link is `https://<the generated name>.pages.dev`.

Send the birthday child a message like this, with the link:

> Happy 18th birthday! Your family made a card for you. Open it on your phone or computer: <link>
> Please don't share the link, it is just for you.
