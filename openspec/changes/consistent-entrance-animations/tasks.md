# Tasks

The `react-developer` subagent does the frontend tasks (components, markup, styling, GSAP). The main session does the
BDD steps and feature files, reviews and commits. Every task is test-first.

## 1. Shared motion config and heading entrance

- [x] 1.1 Add `src/choreography/motion.ts` with the shared values and the `scrubbedReveal` trigger factory (design.md
  decision 1), and make `useChoreography` read every motion value from it. Verify there are no motion literals left in
  `useChoreography.ts` (`grep` for `y:`/`x:`/`ease:`/`scrub:` literals) and `npm test` passes
- [x] 1.2 Mark the headings with `data-reveal="heading"` (the overline + "Birthday wishes" wrapper, family `h3`,
  finale `h2`) and the finale body with `data-reveal="fade"`, and give the finale section `data-finale` (design.md
  decision 3). Update `App.markers.test.tsx` and the `main > [data-reveal]` selector in
  `features/steps/visual-design.steps.ts`. Verify the unit tests and the visual-design BDD scenarios pass
- [x] 1.3 Animate every scrolled heading with the shared drop (`from` `HEADING`, scrub 4, real range) and the finale
  body with an opacity-only reveal. Slow the h1 fade to `GREETING_FADE` (opacity only, no drop).
  Replace the old fade-and-rise unit tests with behavior tests: at progress 0 a heading is above its
  place and transparent, at progress 1 it is in place and opaque, and with reduced motion no target has inline styles.
  Verify `npm test` passes and each new test fails when the drop direction is flipped
- [ ] 1.4 Update the BDD support for the catch-up: raise `SETTLE_TIMEOUT_MS` to a named 10000, check the typing
  steps' timeouts cover the 2.5 s greeting fade, and adjust step wording to the modified scenarios
  ("becomes fully visible and settles", "becomes not fully visible again"). Add the scenarios "Visitor sees the
  greeting fade in slowly", "Visitor sees every scrolled heading drop in from above", "Visitor scrolls the birthday wishes
  heading into view" and "Heading entrance does not shift the content" to `features/content-choreography.feature`.
  Verify they pass with `--repeat-each=10`

## 2. Per-family card reveal

- [x] 2.1 Add `data-cards` to each family's card row and replace the board-wide timeline with one scrubbed timeline
  per row, using `CARD` and the shared range, alternating sides by global index (design.md decision 4). Replace the
  "one board timeline" and stagger-number unit tests with a behavior test: at progress 0 consecutive cards are offset
  in opposite directions and transparent, at progress 1 all are in place. Verify `npm test` passes
- [ ] 2.2 Replace the board scenarios with "Visitor scrolls a family's cards into view", "Cards wait for their family
  heading" and "Visitor scrolls back above a family's cards" and their steps. Verify they pass with
  `--repeat-each=10`, and that "Cards wait for their family heading" fails on the old board-wide timeline

## 3. Ornaments

- [x] 3.1 Add `src/ornaments/ornamentLayout.ts` (pure placement data) and `src/ornaments/Ornaments.tsx` (an
  `aria-hidden`, `pointer-events-none` layer of inline SVG sparkles, stars and confetti in the accent colors), with
  unit tests that the layer is hidden from assistive technology, renders no `img`, and renders every ornament of a
  placement. Verify `npm test` passes
- [x] 3.2 Place the ornaments in the opening (hidden on `short` windows) and in the showcase, in both scene and static
  mode (design.md decision 5). Verify the opening stays centered (birthday-greeting BDD) and no horizontal scroll
  (visual-design BDD) at all sizes
- [ ] 3.3 Add the ornament drift to `useChoreography` under the reduced-motion guard, using `ORNAMENT_DRIFT`. Verify
  with a unit test that ornaments have no inline transform with reduced motion
- [ ] 3.4 Add `features/ornaments.feature` with the `ornaments` spec scenarios and their steps. Verify they pass with
  `--repeat-each=10`, and that the overlap scenario fails when an ornament is moved onto the greeting

## 4. Integration

- [ ] 4.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`, and verify all
  pass, with no new `@skip`
- [ ] 4.2 Check by hand at phone and desktop sizes, with and without reduced motion, that nothing flickers or jumps
  while elements animate in, and record the audit table from design.md for the PR description

## Workflow follow-up

- List the audit table from design.md in the PR description.
- Archive the change after the user approves the PR.
