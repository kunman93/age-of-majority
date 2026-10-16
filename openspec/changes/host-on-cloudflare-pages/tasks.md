# Tasks

There is no UI work in this change, so the main session does every task. Every code task is test-first.

## 1. Local wishes in production builds

- [x] 1.1 Add `src/families.local.ts` to `.gitignore` (design.md decision 2). Verify `git check-ignore -v
  src/families.local.ts .env.local` reports an ignore rule for both
- [x] 1.2 Add a pure function that returns the local families when the build is production and the local module exists,
  and the placeholders otherwise, with unit tests for the three cases (production with local file, production without,
  not production with local file). Wire it into `src/families.ts` with `import.meta.glob('./families.local.ts',
  { eager: true })` and `import.meta.env.PROD` (design.md decision 1). Verify `npm test` passes, each new test fails
  when its condition is flipped, and the existing `families.test.ts` still passes with a local file present
- [x] 1.3 With a temporary `src/families.local.ts` (one made-up family): verify `npm run build && npm run preview` shows
  it, `npm run dev` and `npm run test:bdd` still show the placeholders, `git status` does not list the file, and a
  wish with a missing `author` fails `npm run build`. Delete the temporary file afterwards

## 2. Keeping the link private

- [x] 2.1 Add the robots (`noindex, nofollow`) and referrer (`no-referrer`) meta tags to `index.html` (design.md
  decision 4), with a BDD scenario in a new `features/deployment.feature` that checks the page tells search engines not
  to index or follow it and sets the no-referrer policy. Verify the scenario passes with `--repeat-each=10` and fails
  when either tag is removed

## 3. Deploy command

- [ ] 3.1 Add Wrangler as a dev dependency with `npm install --save-dev wrangler`. Verify `npx wrangler --version`
  prints the pinned version and `npm ci` succeeds
- [ ] 3.2 Add `scripts/deploy.mjs` and the `deploy` script `node --env-file-if-exists=.env.local scripts/deploy.mjs`
  (design.md decision 5). Verify: without `src/families.local.ts`, `npm run deploy` exits non-zero naming the file,
  before building; with the file but without `CLOUDFLARE_PAGES_PROJECT`, it exits non-zero naming the variable and
  `.env.local`, before building; and `npm run lint` and `npm run format:check` cover the new script

## 4. Documentation

- [ ] 4.1 Update the README: correct the intro (the maintainer collects the wishes, families do not post them), add
  `npm run deploy` to the scripts table, and add a Deployment section with the hosting comparison and rationale from
  design.md, the shape of `src/families.local.ts` with an example, previewing the real wishes with `npm run build &&
  npm run preview`, a reminder to keep a private backup of the wishes file and `.env.local`, the one-time setup in this
  order (`npx wrangler login`, generate the project name, write `CLOUDFLARE_PAGES_PROJECT` to `.env.local`,
  `npx wrangler pages project create <name> --production-branch main`), then `npm run deploy`, how to revoke a
  leaked link, and a short ready-to-send message for the birthday child with the link. Verify every documented command,
  variable and file name matches `package.json` and the code

## 5. Integration

- [ ] 5.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check` without a local
  wishes file or `.env.local`, and verify all pass

## Workflow follow-up

- The maintainer performs the one-time Cloudflare setup from the README, deploys, and opens the link once on a phone
  to check the card shows the real wishes without a login.
- The maintainer decides whether to close #3 (backend) as not needed for now.
- Archive the change after the PR is approved.
