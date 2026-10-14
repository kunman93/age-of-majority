# Tasks

Frontend tasks (components, SVG, shaders, R3F, GSAP, styling) are done by the `react-developer` subagent. Pure logic,
BDD steps and test support are done by the main session. Every task is test-first.

## 1. Pure core

- [x] 1.1 Add `src/cake/candleLayout.ts` with a pure `candleLayout(count)` that places the candles on two rings on the
  cake's top, per design.md decision 3. Verify with unit tests: 18 positions, all inside the top's radius, no two
  closer than a minimum gap, and a deterministic result
- [x] 1.2 Add `src/cake/confetti.ts` with a pure `createConfetti(count, random)` (start positions, upward velocities,
  palette colors, spin, delays) and the `CONFETTI_DURATION` and `FLAME_OUT_DURATION` constants. Verify with unit
  tests: buffer lengths match `count`, velocities point upward, colors come from the palette, and a seeded `random`
  gives a deterministic result

## 2. Cake button, state and static cake

- [x] 2.1 Add `CakeIllustration` (inline `aria-hidden` SVG, two-layer cake, 18 candles from `candleLayout`, one flame
  per candle only while lit, `data-cake-illustration`, no animation or transition), per design.md decision 5. Verify
  with unit tests: 18 candles, 18 flames when lit and none when blown, `aria-hidden`
- [x] 2.2 Add `Cake` (native button with the picture and the visible hint, `blown` state, `aria-disabled` and ignored
  clicks once blown, `data-cake-state`, `focus-visible` ring, the reset ScrollTrigger with `onLeaveBack` through
  `useGSAP`), rendering `CakeIllustration` in both modes for now, per design.md decisions 1 and 2. Place it after the
  signature in the finale in `App.tsx`, with `mode` and `fallBackToStatic`. Verify with unit tests: the hint is the
  button's name, a click blows out and shows "Make a wish!", a second click changes nothing, focus stays, `onLeaveBack`
  resets, and the trigger is killed on unmount. Verify with `App.test.tsx` that the cake is the last element of the
  finale and that the existing finale tests pass
- [ ] 2.3 Add `features/birthday-cake.feature` and `features/steps/birthday-cake.steps.ts` with the static scenarios:
  the cake below the signature and last on the card, the accessible name and hidden picture, tap, Enter and Space,
  the focus indicator, tapping again, reset after scrolling up and back down, no reset after scrolling up a little,
  reduced motion (lit, then unlit at once, no animation, no confetti, no 3D cake request), and no WebGL. Verify
  `npm run test:bdd` passes

## 3. 3D cake

- [ ] 3.1 Add `CakeScene` (two cylinder layers, frosting, plate, lights, candles as one `InstancedMesh`, flames as
  flickering additive `Points` with `uOut`, confetti `Points` driven by `uTime - uStart`), taking `blown` as a prop,
  per design.md decision 4. Verify with `@react-three/test-renderer` tests: 18 candle instances, 18 flame points,
  `uOut` reaches 1 after `blown` turns true and goes back to 0 on reset, the confetti is drawn only after the flames
  are out, and every geometry and material is disposed on unmount
- [ ] 3.2 Add the lazily loaded `CakeCanvas` (transparent, `aria-hidden`, no pointer input, `dpr={[1, 2]}`,
  `frameloop` `'always'` only while in view and the page is visible, fixed aspect with room for confetti) and a
  `useInView` hook. In scene mode, `Cake` renders it inside `SceneErrorBoundary` and a `Suspense` fallback of the same
  size. Verify with unit tests: scene mode renders the canvas and no illustration, static mode the reverse, a failed
  load calls `fallBackToStatic`, `useInView` follows the observer, and the frameloop follows view and page visibility
- [ ] 3.3 Extend the BDD for the 3D cake: narrow `EMBER_CANVAS`, add `CAKE_CANVAS`, and add `CakeCanvas` to
  `SCENE_CHUNK`. Add the scenarios: the 3D cake in a canvas inside the button with no illustration, tapping blows out
  (state attribute), confetti played inside the cake's area (canvas box within the button, above the hint), DPR at most
  2, stops rendering out of view and while hidden and resumes, turning on reduced motion removes the canvas and shows
  the unlit illustration, and a failed 3D cake load shows the illustration. Verify `npm run test:bdd` passes, including
  the existing background and scroll-morph scenarios

## 4. Integration

- [ ] 4.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify
  all pass. Check the build output to confirm that `CakeCanvas` is its own lazy chunk
- [ ] 4.2 Ask the user to review the cake in `npm run dev` on desktop and phone sizes (look, flame flicker, confetti,
  reset), and verify the user's feedback is resolved
