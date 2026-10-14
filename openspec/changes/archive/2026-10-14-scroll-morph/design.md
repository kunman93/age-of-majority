# Design

## Context

See proposal.md for the motivation and specs/ for the required behavior.

- `Background.tsx` decides between the 3D scene and the static glow. It uses `usePrefersReducedMotion` and a cached
  `supportsWebGL()` check, and lazy loads `EmberCanvas` (one R3F `<Canvas>` with `Embers`, a single shader `points`
  object). The page content in `App.tsx` does not know which version is shown.
- The opening is a `<header>` around the `h1` and the intro. The families render via `FamilySection`, and the finale
  is a `<section>`. Family names are not unique, so they are never used as identifiers.
- GSAP is not installed. Existing BDD steps already measure text contrast against the brightest background pixel, count
  draw calls and detect downloads of the 3D chunk by URL.

## Goals / Non-Goals

**Goals:**

- One source of truth for the three stage shapes, used by both the 3D morph and the static SVGs.
- Pure, unit-tested core (shapes, sampling, scroll-to-stage mapping). The React and GSAP code stays a thin shell.
- Nothing new in the main bundle except the shape data and the small static illustration component.

**Non-Goals:**

- Text rendering from a font file, mesh morph targets, post-processing such as bloom, or camera moves.
- Content reveals and background color shifts (#36).

## Decisions

### 1. The scene mode is decided once, in `App`

Extract the "3D or static" decision from `Background` into a `useSceneMode()` hook that returns `'scene' | 'static'`.
`App` calls it once and passes the mode and `fallBackToStatic` to `<Background mode>` and to the showcase. The hook keeps today's behavior: no WebGL probe while reduced motion is on, and the probe result is
cached. It also returns `fallBackToStatic()`. `Background` and the showcase pass it to their error boundaries, so a failed
chunk download or a renderer error in either canvas switches the whole card to `'static'`, which shows the glow and
the static showcase.

- *Alternative:* call the hook in both `Background` and `App`. That means two probes and two sources of truth, so it was
  rejected.

### 2. A sticky showcase between the opening and the families

`App` renders a `<Showcase mode>` section (`aria-hidden`, no text) between the opening and the first family.

- **Scene mode:** a container three viewport heights tall (`300svh`) with an inner part that is
  `position: sticky; top: 0; height: 100svh`. The inner part stays in the viewport for two viewport heights of
  scrolling, then the families follow. The sticky part holds the lazily loaded `StoryCanvas`: an R3F `<Canvas>` that
  fills it, is transparent so the embers show through, is `aria-hidden`, catches no pointer input, renders at most
  2 device pixels per CSS pixel and uses `frameloop="demand"`. Because the canvas is part of the page flow, the
  object scrolls in with the showcase and away with it, like the 3D planet in the portfolio project, and it can never
  be drawn behind the opening, the families or the finale. The embers stay in the fixed background canvas.
- **Static mode:** normal height, no sticky part, and the three `StageIllustration`s in one row.

The earlier section anchors (`data-story-stage`, `familyStage`, `spreadAnchors`, `anchorFractions`) and the
illustrations next to the sections are removed. They broke whenever a section's center could not reach the viewport's
center, on short pages and tall windows.

- *Alternative:* GSAP `pin`. It inserts a pin-spacer and moves the element with transforms, which jitters on mobile
  browsers when the address bar hides. CSS `sticky` needs no JavaScript to stay in place and works in the static mode
  too, so it was chosen.
- *Alternative:* draw the object in the fixed background canvas and fade it out when the showcase leaves the
  viewport. This was built first, but on a fast scroll the object still showed behind the next section while it
  faded out, so it was replaced.
- *Alternative:* drei's `View`, which draws into one canvas clipped to the showcase's box. It needs a new dependency
  and still draws in the fixed canvas, so it was rejected. The price of the chosen design is a second WebGL context.
- The `visual-design` "Styling adds no motion" requirement is unaffected: sticky positioning is neither an animation
  nor a transition, and the showcase is decorative and has no content.

### 3. Stage shapes are 2D outlines in a shared module

`src/story/stageShapes.ts` exports, for each stage, a list of filled shapes `{ outline, holes }` in a unit box
(x and y in -1..1). The outlines are:

- **"17" and "18":** polygonal digits. The "8" is two overlapping rings.
- **key:** a ring (circle with a hole), a shaft and two teeth.

The shapes are plain data with no three.js import, so the static SVGs can use them from the main bundle.

- *Alternative:* `TextGeometry` with a typeface JSON font. It was rejected because it adds a font download (and a
  second font next to Fraunces) and still needs a separate key shape.
- A flame stage before "17" was built and dropped: the opening already celebrates the birthday, and the story reads
  more clearly as 17 → 18 → key.

### 4. Static illustrations render the same outlines as SVG

`StageIllustration` renders a stage as an inline `<svg aria-hidden="true">` with one `<path fill-rule="evenodd">` per
shape. It uses the accent colors and has no animation or transition. In static mode the showcase shows all three in
order.

### 5. Particle morph with one buffer per stage

`createStoryParticles(count, random)` fills every stage shape with `count` points by rejection sampling. A point is
inside a stage when it lies inside some shape's outline and outside that shape's holes. It also adds a small random
depth, and it takes an injected `random` like `createEmbers`, so it is pure and testable.

`StoryObject.tsx` is one `points` object. "17" uses the `position` attribute, "18" the `aStage1` attribute and the key
the `aStage2` attribute. The vertex shader reads `uProgress` in 0..2, picks the current segment and `mix`es the two
neighboring positions. Each particle gets a slightly offset `smoothstep`, so the shape dissolves and re-forms instead
of sliding as one block. The fragment shader
reuses the soft, warm, additive point style of the embers, but bright: no text shares the canvas with it, so its
opacity and point size are tuned for the 3:1 visibility check instead of being limited by text contrast. The object is
centered and fills about 70% of the shorter side of the story canvas. It has no time-based animation, so a frame only
changes when the stage or the canvas size changes.

- *Alternative:* mesh morph targets. They need the same topology for every shape, which is unrealistic for digits and
  a key, so they were rejected.

### 6. The scroll driver lives outside the R3F tree

`useStoryScroll`, called by `StoryCanvas` (a DOM component in a lazy chunk), registers `ScrollTrigger` and creates one
trigger with `useGSAP`:

- **Range:** the showcase container from `top top` to `bottom bottom`, exactly the stretch in which the sticky part
  fills the viewport. No anchors are measured, so window size and section heights no longer matter.
- **Scrub:** `scrub: 0.5`, so the morph follows the scroll, catches up within half a second, stops when scrolling stops
  and runs in reverse for free. Scrub only smooths a tween, so the trigger sits on a `gsap.to` of a plain
  `{ value }` object, and `onUpdate` reads that value.
- **Mapping:** `onUpdate` maps the scrubbed value through the pure `showcaseStage(t)` to 0..2. It holds each of the
  three stages for 20% of the range and morphs over 20% between neighbors (3 x 20% + 2 x 20%), with "17" held at the
  start and the key at the end.
- **Rendering:** the value goes into a shared mutable ref that `StoryObject` copies into `uProgress` in `useFrame`,
  so scrolling never re-renders React. After each update the driver calls R3F's `invalidate()`, so with
  `frameloop="demand"` the story canvas renders only while the stage changes or the canvas resizes, and not at all
  while the showcase is out of view or the page is hidden.
- **No visibility handling:** the page flow decides where the object is seen, so there is no fade and no toggle.

`useGSAP`'s cleanup reverts the trigger when the canvas unmounts.

- *Alternative:* a timeline with labeled holds. The pure mapping does the same, is unit tested and has no state.

### 7. Observability for BDD

The driver writes the current stage progress, rounded to two decimals, to `data-story-progress` on the story canvas
wrapper. BDD scrolls to a fraction of the showcase and polls the
attributes: "shows 18" means a progress near 1, and "between 17 and 18" means a progress strictly between 0 and 1.
"Clearly visible" finds the brightest pixel of a screenshot of the sticky viewport and checks its contrast against the
page background color, with the embers' draw calls skipped so only the story object counts. "Not drawn over a section" first shows
the object in the showcase, then scrolls a section to the middle of the screen and checks that the story canvas's box
does not intersect the section's box while the ember scene still renders. The canvas may peek in below the opening
while it scrolls in; that is intended. "Changes shape" compares screenshots of two still stages ("17" and "18")
against a pixel threshold far above the frame-to-frame noise. Exact shape checks would be flaky, so none compare
against reference images.

### 8. Dependencies

- **`gsap`:** for ScrollTrigger, which the acceptance criteria require. Since 3.13 every plugin is free under the
  GSAP Standard License.
- **`@gsap/react`:** for `useGSAP`, which reverts the trigger safely under StrictMode, as the `gsap-react` skill
  recommends.

Both are imported only from the lazy chunks. The BDD download check's chunk pattern gets `gsap` and `StoryCanvas`
added to prove that.

## Risks / Trade-offs

- [A second WebGL context costs memory, and browsers cap the number of contexts] → Two contexts are far below the
  cap. The story canvas renders on demand only, and both canvases release their contexts when the card switches to
  the static fallback.
- [Existing ember opacity lowered from 0.35 to 0.3] → Keeps the contrast scenarios stable, since tangerine text on the
  brightest pixel is near the 4.5:1 limit.
- [Layout shifts after fonts load move the showcase] → ScrollTrigger refreshes on window `load` and on resize, and
  the hook also calls `ScrollTrigger.refresh()` when `document.fonts.ready` resolves (skipped after unmount).
- [Two viewport heights of scrolling without text feels long on phones] → `svh` scales the length with the screen,
  so it is two swipes or so. The length is one constant and can be tuned after a test on a real phone.
- [Mobile browsers resize the viewport when the address bar hides] → `ScrollTrigger.config({ ignoreMobileResize: true })`
  avoids refresh jumps.
- [More GPU work on low-end phones] → One extra `points` draw call with about 3,000 particles, drawn only when the
  stage changes. The pixel ratio cap applies to both canvases. A full performance pass is #38.
