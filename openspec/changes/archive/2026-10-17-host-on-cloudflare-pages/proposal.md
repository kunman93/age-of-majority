# Proposal

## Why

The birthday card is only reachable on a dev machine, so the birthday child cannot open it (#4). The card will hold real
names and personal wishes, but the repository is public, so the wishes must never be committed, and the deployed card
must not be findable by anyone who does not have its link.

## What Changes

- Choose **Cloudflare Pages** as the host and document the comparison with GitHub Pages and Firebase Hosting and the
  rationale in the README.
- Publish the card under a **secret link**: a Pages project named `age-of-majority-<32 random hex characters>`, so the
  link cannot be guessed. The name is kept out of the public repository in the git-ignored `.env.local`. The birthday
  child, who is not a developer, opens the card with one tap, without any login.
- The page tells search engines not to index it and sends no referrer to other sites, so the link does not leak.
- Real wishes live in a git-ignored local file that the maintainer fills with the wishes the families send. The
  production build shows them; the dev server and all tests keep showing the Lorem ipsum placeholders.
- Add an `npm run deploy` command that refuses to deploy without a valid local wishes file or a project name in the
  secret format, builds the app and uploads it to Cloudflare Pages with a version-pinned Wrangler (run with `npx`, no
  new dependency).
- No backend: families send their wishes to the maintainer instead of posting them themselves. The backend story (#3)
  is not needed for now.
- No deploy from CI or Cloudflare's Git integration: they build from the repository, which does not contain the real
  wishes, and about 30 wishes do not fit in a single build environment variable (about 5 KB). CI stays as it is.
- Correct the README, which says families post their wishes to the card.

Accepted trade-off: anyone the link is forwarded to can open the card. A stricter login (Cloudflare Access) was
considered and rejected as too much friction for a gift; revoking a leaked link means deploying under a new name.

## Capabilities

### New Capabilities

- `deployment`: How the card is published: the deploy command and its guards, the hosting on Cloudflare Pages and the
  secret link that keeps the card unfindable.

### Modified Capabilities

- `family-messages`: The requirement that all messages are Lorem ipsum placeholders stored in the repository changes:
  the production build shows the real wishes from the git-ignored local file, everything else keeps the placeholders.

## Impact

- Code: `src/families.ts` (pick local wishes in production builds), new git-ignored `src/families.local.ts` (not
  committed), `index.html` (robots and referrer meta tags), `scripts/deploy.mjs`, `package.json` (`deploy` script), README.
- Systems: a Cloudflare account and a Pages project, set up by the maintainer outside the repository.
- CI: unchanged.
- Issue #3 (backend) can be closed as not needed for now; the maintainer decides on GitHub.
