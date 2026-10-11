# Tasks

## 1. Greeting heading

- [x] 1.1 Update the heading assertion in `src/App.test.tsx` to "Happy Age of Majority!" and assert that "Happy 18th Birthday!" is absent; verify `npm test` fails before the source change
- [x] 1.2 Update the step in `features/home.feature` to expect the heading "Happy Age of Majority!"; verify `npm run test:bdd` fails before the source change
- [x] 1.3 Change the `<h1>` text in `src/App.tsx` to "Happy Age of Majority!"; verify `npm test` and `npm run test:bdd` pass
- [x] 1.4 Make the BDD heading step match the heading text exactly (case-sensitive, whole string); verify `npm run test:bdd` fails when the heading is temporarily changed to "Happy Age Of Majority!" and passes with "Happy Age of Majority!"

## 2. Integration checks

- [x] 2.1 Verify `npm run build`, `npm run lint` and `npm run format:check` pass

## Workflow follow-up

- Archive the change after the user approves the PR.
