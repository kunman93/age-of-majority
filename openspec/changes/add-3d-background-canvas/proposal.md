# Proposal

## Why

The card is styled but flat. Story #34 adds a smooth 3D background so the card feels special, without slowing down phones or hurting readability. It lays the 3D foundation that the scroll morph (#35) and the background shift (#36) build on.

## What Changes

- Add one fixed, full-viewport Three.js canvas (React Three Fiber) behind the content. It shows dim, warm embers drifting slowly upward.
- Lazy load the 3D scene in its own chunk, so the text renders first and visitors who get the fallback never download it.
- Cap the pixel ratio at 2 and stop rendering while the tab is hidden.
- Show a static warm glow (CSS only) behind the content. It is the whole background when the browser has no WebGL or the visitor prefers reduced motion, and it is visible while the 3D scene loads.
- Dispose the scene's GPU resources when the background unmounts.
- Keep every text readable: the brightest point of the background still gives every text a contrast of at least 4.5:1.
- Clarify the existing "Styling adds no motion" requirement: it covers the card's content, not the decorative background.

Out of scope: the morphing 3D object (#35), scroll reveals and the background color shift (#36), the cake finale (#37), and manual cross-browser and device QA (#38).

## Capabilities

### New Capabilities

- `background-scene`: the decorative background behind the card: the 3D ember scene, its static fallback, when it loads, how it saves resources, and that it keeps text readable.

### Modified Capabilities

- `visual-design`: "Styling adds no motion" is narrowed to the card's content, so the animated background owned by `background-scene` does not violate it.

## Impact

- New `src/background/` module: the background shell (fallback, reduced-motion and WebGL checks, page visibility), the lazy-loaded R3F canvas and the ember scene, plus pure ember math.
- `src/App.tsx`: renders the background next to `<main>`.
- `src/index.css`: a glow token and the static glow.
- New BDD feature `features/background-scene.feature` with steps; `features/steps/visual-design.steps.ts` unchanged.
- New dependencies: `three` and `@react-three/fiber` (runtime), `@types/three` and `@react-three/test-renderer` (dev, to test the scene and its disposal without a GPU). No drei, because nothing needs it yet.
- Bundle: three.js adds roughly 150 KB gzip in a separate, lazily loaded chunk; the initial chunk grows only by the small shell.
