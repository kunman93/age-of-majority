# Tasks

## 1. Greeting heading

- [x] 1.1 Update `src/App.test.tsx` to expect the heading "Happy 18th Birthday, Sara!" and no "Happy Age of Majority!"; verify it fails with `npm test`
- [x] 1.2 Change the heading in `src/App.tsx`, keeping its Tailwind classes; verify `npm test` passes
- [x] 1.3 Update `features/home.feature` to the new heading text; verify `npm run test:bdd` passes

## 2. Intro paragraph

- [x] 2.1 Add a unit test in `src/App.test.tsx` for the intro paragraph text; verify it fails with `npm test`
- [x] 2.2 Add the intro paragraph below the heading in `src/App.tsx`; verify `npm test` passes
- [x] 2.3 Add a BDD step and scenario line in `features/home.feature` / `features/steps/home.steps.ts` checking the intro is visible below the heading; verify `npm run test:bdd` passes

## 3. Verification

- [x] 3.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; verify all pass

## Workflow follow-up

- Record the AIC used to implement this Story as a comment on issue #21 (acceptance criterion).
- Archive the change after the PR is approved.
