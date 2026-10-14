# Tasks

The `react-developer` subagent does the frontend tasks (components, styling, GSAP, shaders). The main session does
pure logic, BDD steps and setup. Every task is test-first.

## 1. Shared GSAP setup

- [x] 1.1 Add `src/gsap.ts`, which registers `useGSAP` and `ScrollTrigger`, sets `ignoreMobileResize` and refreshes
  ScrollTrigger once after `document.fonts.ready`. Make `useStoryScroll` import from it and drop its own registration
  and fonts refresh (design.md decision 8). Remove `gsap` from the BDD `SCENE_CHUNK` pattern. Verify that `npm test`,
  `npm run build` and `npm run test:bdd` pass, including "does not download the 3D scene"

## 2. Glow tint (pure core and background)

- [x] 2.1 Add a pure `glowTint(progress)` in `src/choreography/glowTint.ts` with three dark stops (yellow, orange and
  red = today's `--color-glow`), interpolated in RGB and clamped (design.md decision 6). Verify with unit tests: the
  stops at 0, 0.5 and 1, a midpoint between stops, clamping outside 0..1, and every text color in `index.css` at
  4.5:1 or more against each stop
- [x] 2.2 Drive the tint with one page-wide ScrollTrigger outside any reduced-motion condition, writing
  `--glow-tint` on the glow `div`, with the gradient using it. Verify with a `Background` unit test that the variable
  is set on load. Add the background-scene scenarios "Visitor scrolls from the opening to the finale", "Visitor
  scrolls back to the top", "Visitor who prefers reduced motion sees the tint shift" and "Visitor reads the finale
  over the red glow" to `features/background-scene.feature`, and verify that they pass

## 3. Content choreography (reveals and opening)

- [x] 3.1 Add the `data-opening`, `data-intro` and `data-reveal` markers to `App.tsx` and `FamilySection.tsx`
  (design.md decision 2). Verify with `App.test.tsx`: one `data-reveal` per family heading, per message and on the
  finale. Run it with two families that share a name
- [x] 3.2 Add `useChoreography(scope, mode)` in `src/choreography/`, using `gsap.matchMedia` with
  `(prefers-reduced-motion: no-preference)`. Inside the condition, add the scrubbed `from` reveals on `opacity` and
  `y` (never `autoAlpha`), the h1 load fade, the header scroll fade-out, and `mode` as a refresh dependency (design.md
  decisions 1, 3, 4 and 9). Call it in `App`. Verify with unit tests: with reduced motion, no inline `opacity` is set
  on any target. Then add `features/content-choreography.feature` with the scenarios "Visitor without WebGL sees the
  content move", "Visitor who prefers reduced motion sees a still card", "Visitor scrolls away from the opening and
  back", "Visitor scrolls a family into view", "Visitor scrolls back up past a family", "Visitor scrolls to the
  finale", "Visitor reads revealed text" and "Assistive technology reads unrevealed content", and verify that they pass

## 4. Typewriter intro

- [x] 4.1 Restructure the intro into a `sr-only` full text and an `aria-hidden` typed part, a cursor and an untyped
  rest. The default markup is the final state. Add the counter tween, the blinking cursor that fades out about 2 s
  after typing, and the `data-typed="done"` marker. On revert, restore the full text (design.md decision 5). Verify
  with unit tests: with reduced motion, the visible text is the full intro and the cursor is hidden. Add the scenarios
  "Visitor watches the intro being typed", "Assistive technology reads the full intro at once", "Opening stays in
  place while the intro is typed" and "Visitor turns on reduced motion while the intro is typed", and verify that
  they pass
- [x] 4.2 Adapt the existing `home`, `visual-design`, `families` and `finale` steps and features to the modified
  specs. The intro steps wait for `data-typed="done"`. "Visitor sees a static card" runs with reduced motion. Add the
  reduced-motion scenarios for the greeting, the last family and the finale. Verify that `npm run test:bdd` passes in
  full

## 5. Scrapbook cards

- [x] 5.1 Style each message `<figure>` as a paper-like card with a tape strip at its top edge, alternating tilt of
  at most 2 degrees through the CSS `rotate` property, and text only. Verify with the visual-design scenarios "Visitor
  sees scrapbook cards" and "Visitor reads a scrapbook card on a phone". The existing contrast, size and
  no-horizontal-scroll scenarios must still pass. Check the look in `npm run dev`

## 6. Story object edge entry and exit

- [ ] 6.1 Add a pure `createEdgePoints(count, random)` to `storyParticles.ts` that puts points on the border of the
  -1..1 square (design.md decision 7). Verify with unit tests: `count` points, each with `|x|` or `|y|` equal to 1,
  and deterministic for a seeded `random`
- [ ] 6.2 Add the `aEdge` attribute and the `uEntry`, `uExit` and `uExtent` uniforms to `StoryObject`. Add the entry
  (`top bottom` to `top top`) and exit (`bottom bottom` to `bottom top`) ScrollTriggers to `useStoryScroll`, writing
  `data-story-entry` and `data-story-exit`. Verify with `StoryObject` and `useStoryScroll` unit tests that the
  uniforms follow the refs. Add the scroll-morph scenarios "Visitor scrolls the showcase into view", "Visitor scrolls
  the showcase out of view", "Visitor scrolls back into the showcase from below" and "Visitor scrolls back above the
  showcase", and verify that they and the existing scroll-morph scenarios pass
- [ ] 6.3 Show the edge fade to the user in `npm run dev`. Switch to plan B (blurred edges in place) only if the user
  asks for it

## 7. Integration

- [ ] 7.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify
  that all pass
- [ ] 7.2 Validate the change with `openspec validate section-choreography --strict` and verify that it reports it
  as valid

## Workflow follow-up

- Archive the change after the user approves the PR (AGENTS.md step 9).
