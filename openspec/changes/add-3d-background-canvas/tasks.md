# Tasks

## 1. Dependencies and test setup

- [x] 1.1 Install `three` and `@react-three/fiber` as dependencies and `@types/three` and `@react-three/test-renderer` as dev dependencies; verify `npm run build` and `npm test` still pass
- [x] 1.2 Add default stubs to `src/test-setup.ts` for `window.matchMedia` (no reduced motion) and `HTMLCanvasElement.prototype.getContext` (returns `null`), as in design.md; verify `npm test` passes without jsdom "not implemented" errors

## 2. Fallback decisions (shell)

- [ ] 2.1 Write failing tests, then implement `usePrefersReducedMotion` and `usePageVisible` in `src/background/` with `useSyncExternalStore`; verify the tests prove both react to `change` / `visibilitychange`
- [ ] 2.2 Write failing tests, then implement `supportsWebGL()` (probe `webgl2` then `webgl`, release the probe context); verify it returns `true` for a stubbed context and `false` for `null`

## 3. Background shell and glow (red BDD first)

- [x] 3.1 Add `features/background-scene.feature` with every scenario from `specs/background-scene/spec.md` and steps in `features/steps/background-scene.steps.ts` as in design.md (reduced motion, no WebGL init script, request recording, draw-call counter, hidden-page override, CDP DPR override, layering checks, screenshot contrast check); verify `npm run test:bdd` runs them and they fail for the expected reasons
- [ ] 3.2 Add the `--color-glow` token to `src/index.css`; write failing `src/background/Background.test.tsx` (with `EmberCanvas` mocked) for: glow always shown; no canvas and no import with reduced motion or without WebGL; canvas stub rendered when supported; `paused` passed while the page is hidden; a throwing canvas leaves the glow and the card intact. Implement `Background.tsx` (glow, `BackgroundErrorBoundary`, `Suspense`, `React.lazy`) and a minimal `EmberCanvas.tsx`, and render `Background` before `<main>` in `src/App.tsx`; verify `npm test` passes, including the existing `App.test.tsx`, and the reduced-motion and no-WebGL BDD scenarios pass

## 4. Ember scene

- [ ] 4.1 Write failing tests, then implement the pure `createEmbers(count, random)` in `src/background/embers.ts`; verify count, bounds and determinism with a seeded `random`
- [ ] 4.2 Write failing `src/background/Embers.test.tsx` with `@react-three/test-renderer` (one `Points` with the expected vertex count, `uTime` grows when frames advance, geometry and material `dispose` called on unmount), then implement `Embers.tsx` (buffer geometry, shader material, `useFrame` uniform update) as in design.md; verify `npm test` passes
- [ ] 4.3 Complete `EmberCanvas.tsx` (fixed `aria-hidden` wrapper with `pointer-events-none` and `-z-10`, `dpr={[1, 2]}`, `frameloop` from `paused`, `gl` options) rendering `<Embers />`; tune ember color and opacity until the contrast scenario passes with margin; verify every scenario in `features/background-scene.feature` passes with `npm run test:bdd`

## 5. Visual design clarification

- [ ] 5.1 Confirm the existing "Visitor sees a static card" scenario still passes with the background in place (the glow and canvas wrapper have no CSS animation or transition); verify with `npm run test:bdd`

## 6. Verification

- [ ] 6.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; verify all pass and `dist/assets` has a separate chunk containing three.js that the entry chunk does not include statically
- [ ] 6.2 Check the card by eye in a browser at 375px, 768px and 1280px, with and without reduced motion, and confirm the embers are subtle, smooth and the text stays easy to read; record any visual issue as a follow-up task before finishing

## Workflow follow-up

- Archive the change after the PR is approved (step 9 of the Story Workflow).
