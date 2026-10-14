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

### 5. Typewriter: a counter tween writes two text nodes; the rest of the text stays in layout

The intro `<p>` contains:

- a `sr-only` span with the full text, which is what assistive technology reads, and
- an `aria-hidden` span made of a typed part, a zero-width cursor (`absolute`, accent color) and the untyped rest with
  `opacity: 0`.

By default the typed part holds the full text and the rest is empty, which is the final state. With motion, one tween
moves a counter from 0 to the text length (`ease: 'none'`, duration = length × 0.03 s). On each update it writes
`text.slice(0, n)` and `text.slice(n)` into the two spans. The full text is always laid out, so line breaks and the
centered position never change while typing. A `yoyo` tween makes the cursor blink. About 2 s after the last
character, it fades out and the blink stops. On revert, the spans get the full text back and the cursor is hidden.

- *Alternative:* GSAP `TextPlugin`, as in the portfolio. Rejected because it replaces the element's text, so the
  untyped rest leaves the layout. The lines of centered text would then re-wrap and shift while typing, which breaks
  "Opening stays in place".
- *Alternative:* React state per character. Rejected because it means about 190 re-renders for something GSAP can
  write directly.

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

## Risks / Trade-offs

- [Main bundle grows by about 30 kB gzip for GSAP] → accepted. Motion now runs without WebGL. Reduced-motion
  visitors still skip the 3D scene, three.js and R3F.
- [`from` tweens hide content before first paint, and a JS error would leave it hidden] → `useGSAP` reverts its
  context on unmount. The markup itself is the final state, so a failure before the hook runs leaves the card
  readable.
- [The typewriter delays reading the intro by about 6 s] → assistive technology gets the full text immediately.
  Reduced motion shows it at once.
- [BDD runtime grows because steps wait for typing and reveals] → steps that do not test motion run with reduced
  motion or wait for the `data-intro` element's `data-typed="done"` marker. Only `content-choreography.feature`
  exercises the full motion.
- [The particle edge fade may look busy or noisy] → plan B (decision 7) after the user's review in `npm run dev`.
- [Scrub lag can leave a reveal briefly incomplete when the visitor jumps by scrolling fast] → `end: 'top 60%'`
  leaves a margin. BDD waits for scrub to settle before measuring.
