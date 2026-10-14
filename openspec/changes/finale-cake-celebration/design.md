# Design

## Context

See proposal.md for the motivation. The card picks one `SceneMode` (`'scene'` or `'static'`) in `useSceneMode`. Each 3D
part is a lazily loaded R3F `<Canvas>` inside a `SceneErrorBoundary` that calls `fallBackToStatic`, which switches the
whole card to static: see `Background` (ember canvas) and `Showcase` (story canvas). The finale is a `data-reveal`
section at the end of `<main>` in `App.tsx`, revealed by `useChoreography`. GSAP and ScrollTrigger are in the main
bundle, because the glow tint and the content reveals use them in every mode.

## Goals / Non-Goals

**Goals:**

- One cake state shared by both versions, so switching modes keeps the candles lit or blown out.
- A 3D cake built only from Three.js primitives and shaders, with no new dependency and no model files.
- Tests that check the cake's state, not single frames of its animation.

**Non-Goals:**

- Blowing into the microphone, or relighting the candles with another tap.
- Sound, haptics, or confetti outside the cake's area.

## Decisions

### 1. `Cake` owns the state, the button and the hint; the picture is swapped by mode

`src/cake/Cake.tsx` renders a native `<button>` that holds the picture and, below it, the hint as visible text, so the
hint is the button's accessible name. It owns `blown: boolean`. With `mode === 'scene'` the picture is the lazily
loaded `CakeCanvas` inside `SceneErrorBoundary` and `Suspense`, and with `'static'` it is `CakeIllustration`. Both get
`blown` as a prop, so a mode switch after blowing shows unlit candles.

- After blowing, the button gets `aria-disabled="true"` and ignores clicks, instead of `disabled`, so a keyboard user
  keeps the focus (spec: "keeps keyboard focus").
- The button carries `data-cake-state="lit" | "blown"` so the BDD checks the state without reading pixels.
- A native button handles tap, click, Enter and Space. It gets a visible `focus-visible` ring and `cursor-pointer`.
- The Suspense fallback is the same height as the canvas, so the layout does not jump while the 3D cake loads.

*Alternative:* the hint outside the button with an `aria-label`. Rejected: the visible label would then differ from the
accessible name (WCAG 2.5.3).

### 2. Reset with a ScrollTrigger on the cake

A `ScrollTrigger` on the cake button with `start: 'top bottom'` sets `blown` to `false` in `onLeaveBack`. That fires
when the cake's top moves below the viewport's bottom while scrolling up. The finale is last on the card, so the
visitor can only reach that point by scrolling up. It is created with `useGSAP`, so it runs in both modes and is killed
on unmount.

*Alternative:* an `IntersectionObserver`. Rejected: ScrollTrigger is already loaded everywhere, and `onLeaveBack` gives
the direction for free.

### 3. Pure core in `src/cake/`

- `candleLayout()`: 18 candle positions on two rings on the cake's top, so the candles stay apart on a phone.
  Shared by the 3D cake and the SVG (the SVG uses the projected x and y).
- `createConfetti(count, random)`: per-particle start position, velocity, color from the card's palette, spin and
  delay.
- `CONFETTI_DURATION` and `FLAME_OUT_DURATION` constants.

All are pure and unit-tested with a seeded `random`.

### 4. 3D cake (`CakeCanvas`, `CakeScene`)

- **Canvas:** transparent, `aria-hidden`, `style={{ pointerEvents: 'none' }}` so the tap reaches the button,
  `dpr={[1, 2]}`, `antialias: false`, `powerPreference: 'low-power'`. The aspect is fixed (5:4) with a maximum
  width, and room above the cake for the confetti.
- **Cake body:** two stacked `CylinderGeometry` layers with `MeshStandardMaterial` in warm cream and berry tones, a
  frosting torus and a plate. Lit by a dim ambient light and a warm point light at the flames, which dims as they go
  out. A fixed camera looks slightly down from the front.
- **Candles:** thin cylinders at the `candleLayout` positions, in one `InstancedMesh`.
- **Flames:** one `Points` object, one point per candle, with an additive shader that flickers by `uTime` with a
  per-candle phase. `uOut` (0..1) shrinks and fades all flames. After blowing, `useFrame` moves `uOut` to 1 over
  `FLAME_OUT_DURATION`.
- **Confetti:** one `Points` object with square, colored points. Positions are computed in the vertex shader from
  `uElapsed`, velocity and gravity, and points fade out before `CONFETTI_DURATION`. A piece also fades out just above
  the cake's surface, so confetti is never drawn inside the cake. It is drawn only after
  the flames are out and until the burst ends. A reset sets `uOut` and the burst back at once.
- **Rendering:** `frameloop` is `'always'` while the cake is in the viewport and the page is visible, otherwise
  `'never'`. Visibility comes from `usePageVisible` and an `IntersectionObserver` on the canvas wrapper
  (`useInView`). Disposal of geometries and materials happens on unmount, as R3F does for declarative objects. The
  test checks it like `Embers.test.tsx`.

*Alternative:* the confetti as DOM elements animated with GSAP. Rejected: it would add a second animation system to the
cake and could escape the cake's area.

### 4b. Invitation and rotation (added after review)

- **Rotation:** pointer drag turns a group around the vertical axis (`dragRotation.ts`, pure). A press that moves under
  6 px is a tap. A click that ends a drag is ignored, but keyboard clicks always count. `touch-action: pan-y` keeps
  vertical swipes scrolling the page. Decorations (`decorations.ts`) break the cake's symmetry so the whole cake
  visibly turns. No drei: plain pointer handling avoids a dependency.
- **Invitation:** a pulsing halo behind the picture while lit, and a hint that fades in 2.5 s after the cake enters
  view (set by the existing ScrollTrigger). With reduced motion the halo is static and the hint is visible at once.
- **Overflow:** the halo extends past the picture, so `<main>` has `overflow-x-clip` and only the screen edge crops it.

### 5. Static cake (`CakeIllustration`)

An inline `aria-hidden` SVG in the accent colors: a two-layer cake, 18 candles from `candleLayout`, and a flame path on
each candle only when `blown` is false. No CSS animation or transition. It carries `data-cake-illustration`.

### 6. Placement

`Cake` goes inside the finale `<section>`, after the signature, so it reveals together with the finale and nothing
follows it. `App` passes `mode` and `fallBackToStatic` to it.

### 7. Testing

- **Unit:** `candleLayout`, `createConfetti`, `Cake` (hint, `aria-disabled`, state attribute, ignores a second click,
  reset on `onLeaveBack`, illustration vs. canvas by mode, falls back on error), `CakeIllustration` (18 candles, flames
  by state, `aria-hidden`), `CakeScene` (instance and point counts, `uOut` moves to 1 after blowing, the turntable
  follows `spin`, disposal), `dragRotation` (tap versus drag, inertia), `useInView`, and in `Cake` the drag-versus-tap
  rule, keyboard clicks after a drag, the halo and the hint's invitation states.
- **BDD:** `features/birthday-cake.feature` covers the spec scenarios through `data-cake-state`, the hint, the focus,
  the flame count in the SVG, the canvas box and DPR, and the absence of chunk requests. Not covered by BDD, on
  purpose: the render pause, the confetti look and the flame flicker (pixel diffs and draw-call counts proved
  fragile), and dragging and the invitation animations (a BDD drag scenario passed even with the drag guard removed).
  The pause is covered by the `useInView` and `CakeCanvas` unit tests, dragging and the invitation by the `Cake`,
  `CakeScene` and `dragRotation` unit tests, and the look by manual review.
- **BDD selectors:** `EMBER_CANVAS` in `features/support/canvases.ts` is `canvas:not([data-story-progress] canvas)`,
  which would now also match the cake canvas. Narrow it, add a `CAKE_CANVAS` selector, and add `CakeCanvas` to
  `SCENE_CHUNK`.

## Risks / Trade-offs

- [18 candles get tiny on a phone] → Two rings from `candleLayout` and a 5:4 canvas. Check at phone size in
  manual review.
- [A third WebGL context] → It renders only in view, and browsers allow far more contexts. The story canvas is off-screen
  by then and renders on demand only.
- [A procedural cake looks plain] → Plan a visual review round with the user before the PR, like the scroll-morph needed.
- [A short page where the cake never leaves the viewport] → It then never resets. That is acceptable: there is nothing
  to scroll back to.
- [The reveal moves the button while the finale scrolls in] → It reveals before reaching the middle of the viewport, so
  it is in place before the visitor reaches the cake.
