# Tasks

## 1. Finale

- [x] 1.1 Add a failing unit test in `src/App.test.tsx` that the finale heading, message and signature render in that order after the "Family Dolor" section, then narrow the existing family heading test to `name: /^Family /`; verify with `npm test`
- [x] 1.2 Add the finale section to `src/App.tsx` as in design.md; verify `npm test` passes
- [x] 1.3 Add `features/finale.feature` with scenarios "Visitor reads the finale" and "Visitor scrolls to the finale" (short window, not in view, scroll, heading, message and signature fully in view, visible, with opacity 1 and no animation or transition on them or any ancestor), add steps in `features/steps/finale.steps.ts`, and narrow the family heading step to `name: /^Family /`; verify `npm run test:bdd` passes

## 2. Verification

- [x] 2.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; verify all pass
