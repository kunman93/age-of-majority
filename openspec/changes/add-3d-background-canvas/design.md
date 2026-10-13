# Design

## Context

`App.tsx` renders a single `<main>` column. `index.css` defines the palette in Tailwind 4 `@theme`; the page background is `night` (`#2a1215`) on `html`. The existing contrast BDD step finds a text's background by walking up the DOM to the first opaque `background-color`, so it cannot see anything painted by a canvas or a gradient. Playwright runs Desktop Chrome only; headless Chromium provides WebGL 2 through SwiftShader. jsdom (Vitest) has neither `matchMedia` nor WebGL. React 19 and R3F 9.x are compatible. Requirements: see `specs/background-scene/spec.md` and `specs/visual-design/spec.md`.

## Goals / Non-Goals

**Goals:**

- A background module that #35 (morph object) and #36 (background shift) extend by adding to the scene, not by rewiring the canvas.
- Prove every acceptance criterion with an executable test, in the browser where it depends on the GPU and in jsdom where it does not.

**Non-Goals:**

- Scroll-driven anything, GSAP, drei, post-processing, loaded models or textures.
- Adaptive quality (FPS-based DPR scaling). Revisit in #38 if the budget needs it.

## Decisions

### Module layout: a light shell plus one lazy chunk

```
App
+-- Background                 (src/background/Background.tsx, in the main bundle)
|   +-- glow <div>             always rendered, CSS only, aria-hidden
|   +-- if motion allowed AND WebGL supported:
|       BackgroundErrorBoundary
|         Suspense fallback={null}
|           lazy(EmberCanvas)  (src/background/EmberCanvas.tsx, own chunk with three + R3F)
|             <Canvas> + <Embers />
+-- main                       unchanged
```

- `Background` is rendered as the first child of a fragment in `App`, before `<main>`, so `<main>` stays the last element (an existing unit test relies on that).
- The glow is always rendered underneath. It is the fallback, the loading state and the backdrop the transparent canvas blends over, so there is no layout or color jump when the scene appears. `Suspense` therefore needs no fallback of its own.
- `React.lazy(() => import('./EmberCanvas'))` keeps `three` and `@react-three/fiber` out of the initial chunk. The import only runs when the canvas is actually rendered, so reduced-motion and no-WebGL visitors never request it.
- Over R3F's own `Canvas fallback` prop: it only kicks in after the chunk is downloaded and a context failed. We need the decision before importing.

### Fallback decisions in the shell

- `usePrefersReducedMotion()` subscribes to `matchMedia('(prefers-reduced-motion: reduce)')` with `useSyncExternalStore`, so toggling the OS setting live switches to the glow and unmounts (and disposes) the scene.
- `supportsWebGL()` creates a throwaway canvas, asks for `webgl2` then `webgl`, and releases the probe context with `WEBGL_lose_context` (mobile Safari caps live contexts). Evaluated once per mount in a `useState` initializer.
- `BackgroundErrorBoundary` (a small class component, React has no hook for it) renders nothing if the chunk fails to load or the renderer throws, leaving the glow. React still reports the error to the console, so nothing is swallowed silently, but a broken decoration never takes the card down.

### Canvas configuration (`EmberCanvas`)

- Wrapper: `fixed inset-0 -z-10 pointer-events-none`, `aria-hidden="true"`. A negative `z-index` paints above the root `html` background but below `<main>`, without touching the content's markup.
- `dpr={[1, 2]}` explicitly (R3F's default, but the cap is a requirement, so it is spelled out).
- `frameloop={paused ? 'never' : 'always'}` where `paused` comes from `usePageVisible()` in the shell (`useSyncExternalStore` on `visibilitychange` / `document.visibilityState`). Browsers already throttle `requestAnimationFrame` in hidden tabs, but not consistently (e.g. visible-but-occluded windows, some embedded webviews); stopping the loop explicitly makes the behavior ours and testable.
- `gl={{ antialias: false, powerPreference: 'low-power' }}`: soft round points need no MSAA, and the integrated GPU is enough and saves battery on dual-GPU laptops.
- R3F creates the `WebGLRenderer` itself, so it owns it and disposes it (and loses the context) when the `Canvas` unmounts.

### Embers: one `THREE.Points` drawn in a single call, drift in the vertex shader

- `src/background/embers.ts` (pure): `createEmbers(count, random)` returns typed arrays for start positions, sizes, speeds and phases inside a fixed box in front of the default camera. `random` is injected so tests are deterministic.
- `Embers.tsx`: `<points>` with a `<bufferGeometry>` and `<bufferAttribute>`s from `useMemo(createEmbers(...))`, and a `<shaderMaterial>` with `transparent`, `depthWrite={false}`, additive blending and a `uTime` uniform.
  - Vertex shader: `y = mod(startY + speed * uTime, height) - height / 2` (rise and wrap) plus a small `sin(uTime + phase)` sway; point size in pixels scaled by the renderer's pixel ratio.
  - Fragment shader: round, soft-edged point (`gl_PointCoord` falloff) in ember/tangerine, opacity capped.
  - `useFrame((_, delta) => uniforms.uTime.value += delta)`: one uniform write per frame, no per-frame allocation or attribute upload, no React state.
- About 60 embers. One draw call regardless of count; the cost is fill rate, which the DPR cap and small, dim points keep low on phones.
- Over updating positions on the CPU each frame: more work and a buffer upload per frame, for the same look. Over `PointsMaterial`: it draws hard squares without a texture, and a texture is one more resource to create and dispose.
- Every three.js object is created through JSX, so R3F disposes geometry and material on unmount. No manual `dispose()` calls are needed; a unit test proves it.

### Readability by construction

- New token `--color-glow: #4a1c18` (luminance 0.024). The glow is a Tailwind radial gradient from `glow` to `night` (`bg-radial-[at_50%_30%] from-glow to-night to-70%`), fixed and full-viewport.
- Contrast of the weakest texts against the glow's brightest stop: tangerine 7.0, blush 9.4, sun 9.9, cream 13.2. To keep every text at 4.5:1, any background pixel must stay below luminance about 0.064 (the tangerine limit). Ember color and opacity are tuned until the BDD check below passes with margin.

### Tests

**Unit (Vitest, jsdom):**

- `src/test-setup.ts` gains a default `matchMedia` stub (no reduced motion) and a `HTMLCanvasElement.prototype.getContext` stub returning `null`, because jsdom has neither. Tests override them per case.
- `embers.test.ts`: count, bounds, determinism with a seeded `random`.
- `usePrefersReducedMotion` / `usePageVisible`: react to `change` / `visibilitychange`.
- `Background.test.tsx` with `EmberCanvas` mocked to a stub that renders its `paused` prop: reduced motion or no WebGL means the glow and no stub, and the module is never imported; supported means the stub is rendered; hiding the page passes `paused`; a throwing stub leaves the glow and the rest of `App` intact.
- `Embers.test.tsx` with `@react-three/test-renderer` (renders R3F without a GPU): one `Points` with the expected vertex count; advancing frames increases `uTime`; after `unmount()` the geometry's and material's `dispose` spies were called.

**BDD (`features/background-scene.feature`, Playwright):**

- Reduced motion: `page.emulateMedia({ reducedMotion: 'reduce' })` before navigation.
- No WebGL: `page.addInitScript` makes `getContext` return `null` for WebGL context types.
- "Request for the 3D scene": record requests and assert none matches `EmberCanvas` or `three` (dev server serves the module and the pre-bundled deps under those names).
- Rendering detection: an init script wraps `WebGL2RenderingContext.prototype.drawArrays` (and the WebGL 1 one) to count draw calls on `window`. "Renders" = the count grows over 300 ms; "stops" = it does not.
- Hidden page: override `document.visibilityState` in the page and dispatch `visibilitychange`, then check the count; restore and check it grows again.
- DPR: a CDP session sets `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 3` before navigation; assert `canvas.width / canvas.clientWidth <= 2` (same for height).
- Coverage and layering: the canvas's bounding box equals the viewport, it sits in an `aria-hidden` ancestor, has `pointer-events: none`, and `elementFromPoint` at the greeting's center returns the greeting.
- Contrast: hide `<main>` with `visibility: hidden`, wait until frames are drawn, take a screenshot, decode it in the page (`Image` + 2D canvas `getImageData`), take the brightest pixel and check every text color (headings, `main p`, `figcaption`) against it with the existing `features/support/color.ts` helpers. No new dependency (no PNG decoder, no axe).

## Risks / Trade-offs

- [SwiftShader in CI could be missing or slow] → It works locally in headless Chromium; if CI lacks it, launch Chromium with `--enable-unsafe-swiftshader` in `playwright.config.ts`. Draw-count checks use growth over time, not an FPS number.
- [Vite dev re-optimizing deps on first visit reloads the page mid-test] → Vite crawls dynamic imports at startup; if a reload still shows up, add `three` and `@react-three/fiber` to `optimizeDeps.include`.
- [Additive embers overlapping could exceed the luminance limit] → Opacity is capped well below the limit and the screenshot check catches regressions. Message cards sit on opaque `plum`, so the check is conservative.
- [three.js is about 150 KB gzip] → In its own lazy chunk, after the text is on screen, and never for fallback visitors. #38 owns the performance budget.
- [The screenshot contrast check samples one moment] → Embers are uniform in brightness, so any frame shows the same peak; the glow is static.
- [Manual verification on iOS/Android Safari, Chrome and Firefox is out of reach of CI] → Covered by #38; this change keeps to features supported everywhere (WebGL 1 fallback, no float textures, no post-processing).
