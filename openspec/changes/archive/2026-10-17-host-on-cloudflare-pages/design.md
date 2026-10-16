# Design

## Context

See proposal.md for the motivation. Today `src/families.ts` exports the placeholder `families`, which `App.tsx`
renders. The app is a single static page without client-side routing, about 1.6 MB uncompressed after `npm run build`,
and loads nothing from other sites. The BDD tests run against `npm run dev`; the unit tests run in Vitest. CI builds,
tests and lints, and does not deploy. `.gitignore` ignores `.env.*` but not a file like `families.local.ts`.

### Hosting comparison (to go into the README)

| | GitHub Pages | Cloudflare Pages | Firebase Hosting (Spark) |
| --- | --- | --- | --- |
| Free-tier limits | 1 GB site, 100 GB/month soft | 500 builds/month, unlimited static traffic | 10 GB storage, 360 MB/day transfer, site stops when exceeded |
| Cost | free | free | free |
| Deploy without the repo (git-ignored wishes) | no, builds from the repo or needs a CI secret | yes, `wrangler pages deploy` from the local machine | yes, `firebase deploy` from the local machine |
| Secret link | no, the link is `kunman93.github.io/age-of-majority` | yes, random project name in the subdomain | yes, random project ID in the subdomain |
| Setup effort | lowest | account, Wrangler login, project | account, Firebase CLI, project |

Cloudflare Pages deploys a locally built card under an unguessable link with no traffic cap. Firebase would also work,
but stops serving when the daily transfer cap is reached.

## Goals / Non-Goals

**Goals:**

- Dev server, unit tests, BDD tests and CI never depend on whether the local wishes file or `.env.local` exist.
- A malformed local wishes file stops the deploy, not the birthday.
- Neither the wishes nor the secret link ever appear in the repository.

**Non-Goals:**

- No backend, no submission form, no login.
- No deploy from CI or from Cloudflare's Git integration.
- No automation of the Cloudflare account or project setup; the README documents those manual steps.

## Decisions

### 1. Local wishes in a git-ignored TypeScript module, picked only in production

The maintainer writes `src/families.local.ts`, which exports `families: readonly Family[]`, in the same shape as the
placeholders. `src/families.ts` loads it with `import.meta.glob('./families.local.ts', { eager: true })`, which returns an
empty object when the file is missing, and passes it to a small pure function that returns the local families only when
`import.meta.env.PROD` is true and the file exists, and the placeholders otherwise. Vitest and the dev server are not
production, so all tests keep the placeholders.

The deploy script validates the local file (decision 5), because a build does not run the app and the glob accepts any
export shape.

*Alternatives*: a JSON file read through a Vite alias or env var (no type check, more config); one `VITE_` environment
variable holding the JSON (no type check, and awkward for about 30 wishes); a plain static `import` (fails the build when
the file is missing, which breaks CI and every fresh clone).

### 2. Ignore the wishes file explicitly

`.gitignore` gets the entry `src/families.local.ts`. The existing `*.local` does not match it. `.env.local` is already
ignored by `.env.*`.

### 3. Secret link through a random project name

The maintainer creates the Pages project as `age-of-majority-<32 hex characters>` (128 random bits, 48 characters, within
the 58-character limit), generated with `node -e "console.log('age-of-majority-' +
require('crypto').randomBytes(16).toString('hex'))"`, and stores it as `CLOUDFLARE_PAGES_PROJECT` in `.env.local`. The
link is `https://<project>.pages.dev`; per-deployment URLs (`<hash>.<project>.pages.dev`) share the secret part.

*Alternatives*: a secret path such as `/<secret>/` (rejected: Pages serves `index.html` for unknown paths, so the root
would show the card too); Cloudflare Access with an email one-time PIN (rejected: login friction for a non-technical
birthday child; see proposal.md).

### 4. Robots and referrer meta tags in `index.html`

`index.html` gets `<meta name="robots" content="noindex, nofollow">` and `<meta name="referrer" content="no-referrer">`.
The card loads nothing from other sites today; the referrer tag keeps it that way if a link or resource is added later,
since the secret is in the origin that browsers would otherwise send. Meta tags apply to the dev server too, which is
harmless. *Alternative*: a Pages `_headers` file. Rejected: Pages-only and not visible in tests on the dev server.

### 5. `npm run deploy` runs `scripts/deploy.mjs`

```text
npm run deploy
  -> node --env-file-if-exists=.env.local scripts/deploy.mjs
       1. fail with the file name when src/families.local.ts is missing
       2. fail naming CLOUDFLARE_PAGES_PROJECT and .env.local when it is not set
       3. fail when it is not age-of-majority-<32 hex characters
       4. import the wishes file and validate it with src/validateFamilies.ts (Node strips the types)
       5. npm run build, then fail when the bundle lacks any real family name
       6. npx wrangler@<pinned> pages deploy dist --project-name $CLOUDFLARE_PAGES_PROJECT --branch main
```

The script spawns the commands without a shell and exits with their exit code. `--branch main` makes every deploy the
production deployment, whatever branch is checked out. The guards live in the deploy script, not in the build, so CI's
production build still falls back to the placeholders. Wrangler is run with `npx` at an exact version in the script, not as a dev dependency: it pulls in about 130 MB
(`workerd`) that every `npm ci` and CI run would download for one manual command.

*Alternatives*: an inline `package.json` script with `$CLOUDFLARE_PAGES_PROJECT` (shell-specific and no readable
error); a git-ignored `wrangler.toml` holding the name (an unusual file to ignore, and no guard for the wishes file);
an unpinned `npx wrangler`; a Wrangler dev dependency.

## Risks / Trade-offs

- [The link is forwarded] → Accepted; anyone with the link sees the card. Revoke by creating a new project with a new
  name, deploying to it and deleting the old project.
- [The local wishes file or `.env.local` is lost with the laptop] → The README tells the maintainer to keep a private
  backup of both.
- [A deploy accidentally publishes the placeholders or broken wishes] → The deploy refuses without a valid local wishes
  file and checks that the bundle contains every real family name. It cannot check that the production build
  *shows* them; the README tells the maintainer to preview with `npm run preview` first.
- [The link leaks through a referrer or a search engine] → Meta tags from decision 4.

## Migration Plan

1. Merge the change (no runtime effect: without the local file, the production build still shows the placeholders).
2. The maintainer runs `npx wrangler@4.151.1 login`, generates the project name, writes it to `.env.local` and creates the project
   with `npx wrangler@4.151.1 pages project create <name> --production-branch main`, following the README.
3. The maintainer writes `src/families.local.ts`, runs `npm run deploy` and sends the link to the birthday child.

Rollback: delete the Pages project in the Cloudflare dashboard.
