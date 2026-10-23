# Tasks

## 1. Tests first

- [ ] 1.1 Change the heading text looked up in `src/App.test.tsx`, `src/background/Background.test.tsx` and
  `features/home.feature` to "Happy Halloween", and in `features/home.feature` check that the heading
  "Happy 18th Birthday, Sara!" is not shown; verify `npm test` and `npm run test:bdd` fail on the heading lookups

## 2. Heading

- [ ] 2.1 Change the level 1 heading in `src/App.tsx` to "Happy Halloween" (react-developer); verify `npm test`
  and `npm run test:bdd` pass
- [ ] 2.2 Update the Purpose in `openspec/specs/birthday-greeting/spec.md` so it no longer says the heading names
  the age of majority; verify `openspec validate --specs` passes

## 3. Verification

- [ ] 3.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; verify
  all pass

## Workflow follow-up

- Archive the change after the user approves the PR.
