# Tasks

Frontend tasks (components, SVG, shaders, GSAP, styling) are done by the `react-developer` subagent. Pure logic,
BDD steps and dependency setup are done by the main session. Every task is test-first.

Tasks marked *Superseded* were done for an earlier design and later replaced: the section anchors by section 7, and
the flame stage and the scroll-fraction fade by section 8, and the story object in the background canvas with its
timed fade by section 9. They stay ticked as history; the replaced code no longer
exists.

## 1. Setup

- [x] 1.1 Add `gsap` and `@gsap/react` with `npm install`; verify `npm run build` succeeds and both appear under
  `dependencies` in `package.json`

## 2. Stage shapes and anchors (pure core)

- [x] 2.1 *Partly superseded by 8.1.* Add `src/story/stageShapes.ts` with the four stages (`flame`, `17`, `18`, `key`) as `{ outline, holes }`
  shapes in the unit box, plus a pure `isInsideStage(stage, x, y)`, per design.md decision 3. Verify with unit tests in
  `src/story/stageShapes.test.ts`: every outline stays within -1..1, the hole centers of the "8" and of the key ring are
  outside, and known solid points are inside
- [x] 2.2 *Superseded by 7.2.* Add a pure `familyStage(index, count)` in `src/story/` that returns `"17"` for the first family, `"18"` for the
  last family and nothing otherwise; verify with unit tests
- [x] 2.3 *Superseded by 7.1.* Add a pure `stageProgress(t, anchorFractions)` in `src/story/` that maps linear scroll progress piecewise
  linearly to 0..3, per design.md decision 6; verify with unit tests: each anchor fraction maps to its stage index,
  values clamp outside 0..1, and midpoints fall between stages

## 3. Scene mode and section anchors

- [x] 3.1 Extract `useSceneMode()` from `Background.tsx` (no WebGL probe while reduced motion is on, probe cached,
  `fallBackToStatic()` wired to the error boundary), and have `App` pass the mode to `<Background mode>`, per design.md
  decision 1. Verify that the existing `Background.test.tsx` cases pass after being adapted to the prop, and that new
  `useSceneMode` unit tests cover reduced motion, no WebGL, a live reduced-motion change and a scene error switching
  to `'static'`
- [x] 3.2 *Superseded by 7.2.* Wrap the opening in `<header data-story-stage="flame">`. Give the first and last `FamilySection` their
  `data-story-stage` via `familyStage`, and give the finale `data-story-stage="key"`. Verify with `App.test.tsx`
  assertions on the anchors, that the existing App and finale tests still pass, and that `npm run test:bdd` still
  passes (layout unchanged)

## 4. Static stage illustrations

- [x] 4.1 Add `StageIllustration` (inline `aria-hidden` SVG, one `evenodd` path per shape, accent color, no animation
  or transition), per design.md decision 4. Verify with unit tests: one path per shape, `aria-hidden`, and the
  `data-stage-illustration` attribute names the stage
- [x] 4.2 *Superseded by 7.3.* In `App`, render the matching illustration inside each anchored section only when the mode is `'static'`.
  Verify with `App.test.tsx`: four illustrations in static mode, none in scene mode
- [x] 4.3 Add `features/scroll-morph.feature` with the "Static stages replace the morph" scenarios (reduced motion,
  no WebGL, 3D fails to load, 3D shows none, turning on reduced motion shows them) and steps in
  `features/steps/scroll-morph.steps.ts`. Add the "3D scene fails to load" scenario to
  `features/background-scene.feature`. Simulate the failure by aborting the 3D chunk request with `page.route`. Add
  `gsap` to the BDD `SCENE_CHUNK` pattern. Verify `npm run test:bdd` passes, including the existing "does not download
  the 3D scene" scenarios

## 5. Story object (3D morph)

- [x] 5.1 *Partly superseded by 8.1.* Add a pure `createStoryParticles(count, random)` in `src/background/` that samples every stage by rejection
  sampling with `isInsideStage` and adds a small depth. Verify with unit tests: four buffers of `count` points each,
  every point inside its stage, and a deterministic result for a seeded `random`
- [x] 5.2 *Partly superseded by 8.3.* Add `StoryObject.tsx` (one `points` object with `position` and `aStage1`–`aStage3`, a shader that mixes by
  `uProgress` with a per-particle offset and a flicker, dim additive points, centered and scaled to fit the viewport)
  reading a shared `progress` ref in `useFrame`. Verify with `@react-three/test-renderer` tests like `Embers.test.tsx`:
  the attribute counts, `uProgress` following the ref after a frame, and geometry and material disposed on unmount
- [x] 5.3 *Superseded by 7.4.* Mount `StoryObject` in `EmberCanvas` and add the ScrollTrigger driver with `useGSAP` (`clamp(center center)`
  range over the `[data-story-stage]` anchors, `scrub: 0.5`, anchor fractions measured on refresh,
  `ignoreMobileResize`, `data-story-progress` on the wrapper), per design.md decisions 6 and 7. Verify that
  `npm run build` passes and the morph runs in `npm run dev` when scrolling down and up
- [x] 5.4 *Superseded by 7.6.* Add the morph scenarios to `features/scroll-morph.feature`: the flame on arrival, between flame and "17",
  scrolling through the card (17, 18, key), stopping between sections, scrolling back up (17, flame), and a scenario
  outline for text contrast and a visible story object at each anchor. Verify `npm run test:bdd` passes, and tune the
  particle opacity and count until the contrast scenarios pass
- [x] 5.5 Extend `features/background-scene.feature` and the unit tests for the modified "Background resources are
  released" requirement: the story object's geometry and material are disposed, and the ScrollTrigger is killed on
  unmount (`ScrollTrigger.getAll()` is empty). The "Background resources are released" requirement is covered by unit
  tests (the BDD scenario was removed because it proved nothing). Verify with `npm test`
- [x] 5.6 *Superseded by 7.2.* Fix the anchor spread: `minGap` 0.05 so only near-collapsed anchors move, and keep progress 0 when the page
  cannot scroll. Verify with the `spreadAnchors` and `anchorFractions` unit tests, the tall-window scenario and the
  phone scenario outline in `features/scroll-morph.feature`

## 6. Verification of the section-anchored version

- [x] 6.1 *Superseded by 7.7.* Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify all
  pass. Check the build output to confirm that `gsap` lands only in the lazy 3D chunk

## 7. Showcase (replaces the section anchors, per design.md decisions 2, 6 and 7)

- [x] 7.1 *Superseded by 8.2.* Add a pure `showcaseStage(t)` in `src/story/` that holds each stage for 10% and morphs over 20%. Verify with
  unit tests: 0..0.1 maps to 0, 0.2 to 0.5, 0.3..0.4 to 1, 0.6..0.7 to 2, 0.9..1 to 3, and values clamp outside 0..1
- [x] 7.2 Remove the section anchors: `data-story-stage` on the opening, families and finale, `familyStage`,
  `stageProgress`, `spreadAnchors`, `anchorFractions`, the illustrations next to the sections and their tests. Verify
  with `npm test` and that `grep -r "data-story-stage\|familyStage\|spreadAnchors\|anchorFractions\|stageProgress" src`
  finds nothing
- [x] 7.3 *Partly superseded by 8.4.* Add `Showcase` (`aria-hidden`, no text) between the opening and the first family: in scene mode a `400svh`
  container with a sticky `100svh` inner part, in static mode the four `StageIllustration`s in order, in a row (two by
  two on phones), at normal height. Verify with `App.test.tsx`: the showcase's position, `aria-hidden`, four
  illustrations in static mode and none in scene mode
- [x] 7.4 *Superseded by 9.2.* Rework the scroll driver: one trigger on the showcase from `top top` to `bottom bottom`, `scrub: 0.5`,
  progress through `showcaseStage`, visibility from `onToggle`, and `data-story-progress` and `data-story-visible` on
  the wrapper. Keep the fonts-ready refresh and `ignoreMobileResize`. Verify with unit tests that the trigger is
  created on the showcase and killed on unmount
- [x] 7.5 *Partly superseded by 9.3.* Make the story object bright and showcase-sized: brighter opacity and point size, about 70% of the shorter
  viewport side, and a `uVisible` uniform that eases in during `useFrame` and drops to 0 at once on exit. Verify with `StoryObject` tests
  that `uVisible` eases in, hides on the next frame and follows the shared ref, and with an `EmberCanvas` test that the
  hook's refs reach `StoryObject` and that the existing disposal tests still pass
- [x] 7.6 *Partly superseded by 8.6.* Rewrite `features/scroll-morph.feature` for the new spec: the showcase position, scrolling through it (fills
  the viewport, flame, 17, 18, key, then the first family), holds, between flame and 17 and stopping, scrolling back up,
  the 3:1 visibility at every stage, not shown at the opening, first family and finale, and the static scenarios
  (reduced motion with the height check, no WebGL, failed load, scene shows none, turning on reduced motion). Run the
  scroll scenarios at 1280x720 and on a phone size. Add the "Visitor reads the families over the 3D background"
  scenario to `features/background-scene.feature`. Remove step definitions that are no longer used. Verify
  `npm run test:bdd` passes, and tune the object's brightness until the visibility and contrast scenarios pass
- [x] 7.7 *Superseded by 8.7.* Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify all
  pass. Check the build output to confirm that `gsap` lands only in the lazy 3D chunk

## 8. Three stages and a timed fade (per design.md decisions 2, 3, 5, 6 and 7)

- [x] 8.1 Remove the flame stage: `stageShapes.ts` exports only `17`, `18` and `key`, and `createStoryParticles`
  returns three buffers. Verify with the `stageShapes` and `createStoryParticles` unit tests, adapted to three stages
- [x] 8.2 Change `showcaseStage(t)` to three stages that each hold for 20% and morph over 20%. Verify with unit tests:
  0..0.2 maps to 0, 0.3 to 0.5, 0.4..0.6 to 1, 0.7 to 1.5, 0.8..1 to 2, and values clamp outside 0..1
- [x] 8.3 Rework `StoryObject`: `position` holds "17", `aStage1` "18" and `aStage2` the key, `uProgress` runs 0..2,
  and the flame flicker is removed. Verify with the `StoryObject` tests (attribute counts, `uProgress` following the
  ref, disposal)
- [x] 8.4 Make the scene-mode showcase `300svh` tall and show the three `StageIllustration`s in one row in static
  mode. Verify with `App.test.tsx`: three illustrations in order in static mode, none in scene mode
- [x] 8.5 *Superseded by 9.2 and 9.3.* Replace the scroll-fraction fade (`FADE_FRACTION`, `fadeAt`) with a timed fade: on toggle, tween the shared
  visibility value to 1 or 0 over 0.5 s with `power2.inOut` and `overwrite: true`; `StoryObject` copies it into
  `uVisible` and stops drawing at 0; `data-story-visible` is `true` while the value is above 0. Verify with unit tests
  that entering fades in, leaving fades out to 0 and stops drawing, and the tween is killed on unmount
- [x] 8.6 *Partly superseded by 9.4.* Update the BDD for three stages and the timed fade: "17" on arrival, between "17" and "18", "18" then the
  key, back up to "18" then "17", the 3:1 check at "17", "18" and the key, the "not shown" scenarios waiting up to
  0.5 s for the fade-out, and three static illustrations. Re-measure the "changes shape" pixel threshold. Remove
  unused steps. Verify `npm run test:bdd` passes
- [x] 8.7 *Superseded by 9.5.* Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify all
  pass. Check the build output to confirm that `gsap` lands only in the lazy 3D chunk

## 9. Story object in the page flow (per design.md decisions 1, 2, 5, 6 and 7)

- [x] 9.1 Move the story object into its own canvas: add a lazily loaded `StoryCanvas` (transparent, `aria-hidden`,
  no pointer input, at most 2 device pixels per CSS pixel, `frameloop="demand"`) that fills the showcase's sticky part
  in scene mode, inside an error boundary that calls `fallBackToStatic`, which `App` passes to the showcase.
  `EmberCanvas` renders only the embers. Verify with unit tests: the showcase renders the story canvas inside its sticky
  part in scene mode and none in static mode, a failed load falls back to static, and `EmberCanvas` no longer renders
  `StoryObject`
- [x] 9.2 Rework `useStoryScroll` for `StoryCanvas`: the trigger on the showcase sets the progress and calls
  `invalidate()`, and writes `data-story-progress` on the story canvas wrapper. Remove the visibility tween, the
  `visible` ref and `data-story-visible`. Verify with unit tests that the progress follows the scroll, `invalidate`
  is called on update, and the trigger is killed on unmount
- [x] 9.3 Remove `uVisible` from `StoryObject` and size it to about 70% of the shorter side of its canvas. Verify with
  the `StoryObject` tests (attribute counts, `uProgress` following the ref, disposal)
- [x] 9.4 Update the BDD: "the story object is not drawn over the section" checks that the story canvas's box does not
  intersect the section's box while the ember scene still renders; remove the fade waits; add `StoryCanvas` to the 3D chunk pattern of the no-download
  checks; add the "Visitor turns on reduced motion in the showcase" and "Story object fails to load" scenarios. Remove unused steps. Verify
  `npm run test:bdd` passes, including a fast scroll from the showcase to the first family
- [x] 9.5 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify all
  pass. Check the build output to confirm that `gsap` lands only in the lazy 3D chunks
