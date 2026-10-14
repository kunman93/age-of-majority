# Design

## Context

See proposal.md for the motivation and specs/ for the required behavior.

- `App.tsx` renders the opening `<header>` (h1 and intro `<p>`), the `Showcase`, one `FamilySection` per family (each
  message is a `<figure>`) and the finale `<section>`. `useSceneMode()` decides `'scene' | 'static'` once in `App`.
  Reduced motion, no WebGL and a failed 3D load all lead to `'static'`.
- GSAP and `@gsap/react` are only imported by `useStoryScroll` (in the lazy `StoryCanvas` chunk). That module
  registers `ScrollTrigger`, sets `ignoreMobileResize` and refreshes ScrollTrigger after `document.fonts.ready`.
- `StoryObject` is one `points` object whose shader mixes three stage buffers by `uProgress` (0..2) with a
  per-particle offset. `useStoryScroll` maps the showcase scroll (`top top` to `bottom bottom`, `scrub: 0.5`) through
  `showcaseStage()`.
- The glow is a fixed `div` with a Tailwind radial gradient from `--color-glow` (#4a1c18) to `--color-night`.
- The BDD steps measure contrast against the brightest screenshot pixel, use `toBeVisible()` (true even at opacity 0),
  and treat any request matching `/…|gsap/` as a 3D chunk download.
- Family names are not unique, so they are never keys, ids or selectors.

## Goals / Non-Goals

**Goals:**

- One GSAP context for all content motion, gated by `prefers-reduced-motion` alone and reverted cleanly when it flips.
- The rendered markup is the final, readable state. Motion is applied on top in a layout effect before the first
  paint, so with reduced motion or a revert nothing is left hidden.
- Pure, unit-tested core: glow tint mapping and edge point sampling.

**Non-Goals:**

- Smooth scrolling, pinning content, or animating text per word or line.
- Changing the stage morph timing (`showcaseStage`) or the static showcase.

## Decisions

### 1. Content motion uses `gsap.matchMedia()` inside one `useGSAP`, not `SceneMode`

A `useChoreography(scope)` hook in `src/choreography/` runs `useGSAP` scoped to `<main>`. Inside, a
`gsap.matchMedia()` condition `(prefers-reduced-motion: no-preference)` creates the load timeline and all scroll
reveals. When the visitor turns on reduced motion, GSAP reverts every tween and ScrollTrigger in that condition and
restores the original inline styles, so the content returns to its final state with no React state involved.

- *Alternative:* gate on `mode === 'scene'`. Rejected because no-WebGL visitors must still see the motion (spec).
- *Alternative:* `usePrefersReducedMotion()` plus React conditionals. Rejected because it duplicates what
  `gsap.matchMedia` already does, including cleanup.

### 2. Targets are marked with data attributes

The opening gets `data-opening`, the intro gets `data-intro`, and every family heading, every message `<figure>` and
the finale get `data-reveal`. The hook selects them with `gsap.utils.toArray` within its scope. No family name is
used as a selector.

### 3. Reveals are scrubbed `from` tweens on opacity and `y`

Each `[data-reveal]` gets `gsap.from(el, { opacity: 0, y: 40, ease: 'none', scrollTrigger: { trigger: el, start:
'top bottom', end: 'top 60%', scrub: 0.5 } })`. Scrub makes the reveal depend only on the scroll position and reverse on
scroll-up. `end: 'top 60%'` finishes before the element's top reaches the middle of the viewport (spec), with a margin
for `scrub` lag.

- Use `opacity`, never `autoAlpha`: `visibility: hidden` would remove unrevealed content from the accessibility tree,
  which the spec forbids.
- The scrapbook tilt uses the CSS `rotate` property (Tailwind v4 `rotate-*`). GSAP tweens `transform`, so the two
  compose instead of overwriting each other.
- *Alternative:* `toggleActions: 'play none none reverse'` (time-based). Rejected because it is not tied to the scroll
  position and can leave text half-faded while the visitor reads it.

### 4. Opening: load timeline and scroll fade-out on different elements

The load timeline fades the `h1` in (about 0.8 s), then runs the typewriter. A separate scrubbed tween fades the
whole `[data-opening]` header to `opacity: 0` from `top top` to `bottom top`. The load fade targets the `h1` and the
scroll fade targets the header, so they never fight over the same property. Their opacities multiply.

### 5. Typewriter: a looping timeline types and erases each sentence in a reserved grid cell

A pure `splitSentences(text)` splits the intro after each `.`, `!` or `?` followed by a space. The intro `<p>` contains:

- a `sr-only` span with the full text, which is what assistive technology reads, and
- an `aria-hidden` grid whose single cell holds one span per sentence, stacked with `col-start-1 row-start-1`. The cell
  is as tall as the longest sentence, so the centered opening never moves. Every sentence span is made of a typed
  part, a zero-width cursor (`absolute`, accent color) and the untyped rest with `opacity: 0`, so the sentence keeps
  its line breaks while it is typed. Only the active sentence is shown. The others have `opacity: 0`.

By default the grid shows the full intro as one span, with the cursor hidden. This is the final state for reduced
motion and after a revert. With motion, one `repeat: -1` timeline handles each sentence in turn. It types the
sentence with a counter tween from 0 to its length (`ease: 'none'`, length × 0.03 s), writing `slice(0, n)` and
`slice(n)` into the two spans. It then holds the sentence for 2 s and erases it with the counter running back to 0 at
about twice the typing speed. A `yoyo` tween makes the cursor blink for the whole loop. A ScrollTrigger on
`[data-opening]` (`top top` to `bottom top`) calls `pause()` on leave and `resume()` on enter back.

For BDD, the `<p>` carries `data-typed` (`typing`, `shown`, `erasing`, or `done` for the static full text) and
`data-sentence` (the active index). Steps that do not test the typewriter run with reduced motion.

- *Alternative:* GSAP `TextPlugin`, as in the portfolio. Rejected because it replaces the element's text, so the
  untyped rest leaves the layout. The lines of centered text would then re-wrap and shift while typing, which breaks
  "Opening stays in place".
- *Alternative:* React state per character. Rejected because a loop would re-render without end, for something GSAP
  can write directly.
- *Alternative:* type all three sentences one after the other in the same paragraph. Rejected because the user chose
  type, hold and erase, one sentence at a time.

### 6. Glow tint: a pure mapping, driven by a ScrollTrigger outside the reduced-motion condition

`glowTint(progress)` in `src/choreography/glowTint.ts` interpolates linearly in RGB between three stops: dark yellow
(top), dark orange (half) and dark red (end, today's `--color-glow`). Progress is clamped to 0..1. One ScrollTrigger
over the whole page (`start: 0`, `end: 'max'`, no scrub) writes the tint to a `--glow-tint` custom property on the glow
`div`, and the gradient uses `from-(--glow-tint)`. The trigger is created outside the `matchMedia` condition because
the shift also runs with reduced motion. It is a color change, not movement. The stops are chosen so every text color
keeps at least 4.5:1 against the brightest stop. A unit test checks this with the existing contrast helper logic.

- *Alternative:* a CSS scroll-driven animation (`animation-timeline: scroll()`). Rejected because it is not supported
  in every target browser, and it is a CSS animation, which the reduced-motion "no animation" check would flag.

### 7. Story object: entry and exit uniforms with edge points in the shader

`createEdgePoints(count, random)` (pure, in `storyParticles.ts`) returns, for each particle, a point on the border of
the unit square (-1..1). It becomes a new `aEdge` attribute. The shader gets `uEntry` (0..1), `uExit` (0..1) and
`uExtent` (half the viewport size divided by the object's scale, set in `useFrame`, so the edges are the canvas
edges at any aspect ratio). The position is `mix(aEdge * uExtent, shape, entry)` before the morph and
`mix(shape, aEdge * uExtent, exit)` after it, using the same per-particle `aOffset` stagger as the morph. The alpha is
multiplied by `entry * (1 - exit)`.

`useStoryScroll` adds two scrubbed ScrollTriggers on the showcase: entry from `top bottom` to `top top` and exit from
`bottom bottom` to `bottom top`. They write to `entry` and `exit` refs and to `data-story-entry` and
`data-story-exit` on the wrapper for BDD. The existing `top top` to `bottom bottom` morph range is unchanged, so
"shows 17 at the start of the showcase" and the 3:1 contrast checks still hold.

Plan B (blurred edges in place) is only a shader change to `entry`/`exit` (fade plus point size growth with no edge
travel). It needs the user's sign-off and does not change the specs' "only partly visible" scenarios.

### 8. GSAP setup moves into a shared module in the main bundle

`src/gsap.ts` registers `useGSAP` and `ScrollTrigger`, sets `ignoreMobileResize`, and refreshes ScrollTrigger once
after `document.fonts.ready`. `useChoreography` and `useStoryScroll` import from it, and the fonts refresh moves out
of `useStoryScroll`. The BDD `SCENE_CHUNK` pattern drops `gsap`, because GSAP is no longer part of the 3D scene.

### 9. ScrollTrigger positions are refreshed when the showcase height changes

The showcase is `300svh` tall in scene mode and only as tall as the illustrations in static mode. When the mode
changes (for example, a failed 3D load), every reveal below the showcase would keep stale positions. `useChoreography`
takes `mode` as a `useGSAP` dependency and calls `ScrollTrigger.refresh()` when it changes.

### 10. Birthday wishes: a wider section with wrapping flex rows per family

`App` wraps the family sections in a `<section>` labelled by an `h2` "Birthday wishes", with a `<p>` overline "From
your family" (uppercase, letter-spaced, `text-blush`) above it, as in the portfolio's skills section. The family
headings become `h3`. `<main>` drops its `max-w-[720px]`, the opening, showcase and finale each keep that column, and
the wishes section gets `max-w-6xl`. The cards of each family sit in `flex flex-col items-center gap-10 sm:flex-row
sm:flex-wrap sm:justify-center`. Each card's reveal wrapper is `w-full sm:w-80`, so the cards in a row share one width
and the lines stay short. The tilt and tape strip are unchanged, and each card keeps its own `data-reveal`.

- *Alternative:* all cards of all families in one row, without family headings. Rejected because it drops the
  "section per family" grouping, which helps readers find their own family.
- *Alternative:* keep the 720px column. Rejected because only two cards of about 20rem fit next to each other, which
  makes the row too cramped for long messages.

## Risks / Trade-offs

- [Main bundle grows by about 30 kB gzip for GSAP] → accepted. Motion now runs without WebGL. Reduced-motion
  visitors still skip the 3D scene, three.js and R3F.
- [`from` tweens hide content before first paint, and a JS error would leave it hidden] → `useGSAP` reverts its
  context on unmount. The markup itself is the final state, so a failure before the hook runs leaves the card
  readable.
- [The typewriter delays reading the intro, and only one sentence is visible at a time] → assistive technology gets
  the full text immediately. Reduced motion shows it at once.
- [The endless loop does not meet WCAG 2.2.2 (Pause, Stop, Hide), because it has no pause control] → accepted by the
  user. It is limited to the first screen: it pauses while the opening is scrolled away, and reduced motion stops it
  entirely.
- [BDD runtime grows because steps wait for typing and reveals] → steps that do not test motion run with reduced
  motion. Only `content-choreography.feature` exercises the full motion.
- [The particle edge fade may look busy or noisy] → plan B (decision 7) after the user's review in `npm run dev`.
- [Scrub lag can leave a reveal briefly incomplete when the visitor jumps by scrolling fast] → `end: 'top 60%'`
  leaves a margin. BDD waits for scrub to settle before measuring.
