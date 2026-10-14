# Tasks

## 1. Centered opening

- [x] 1.1 Add BDD scenarios to `features/home.feature` (a scenario outline over phone, tablet, laptop and desktop windows, adding a `tablet` 768×1024 entry to the shared window sizes in `features/steps/scroll-morph.steps.ts`) with steps in
  `features/steps/home.steps.ts` that check the heading and intro are centered horizontally and vertically, their
  text is centered, and the content after the intro starts at or below the window bottom; verify they fail with
  `npm run test:bdd`
- [x] 1.2 Center the opening in `src/App.tsx` as described in design.md (react-developer agent); verify the new
  scenarios and all existing BDD and unit tests pass with `npm run test:bdd` and `npm test`
- [x] 1.3 Verify `npm run build`, `npm run lint` and `npm run format:check` pass

## Workflow follow-up

- Archive the change after the PR is approved.
