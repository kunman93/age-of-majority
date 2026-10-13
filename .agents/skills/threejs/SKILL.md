---
name: threejs
description: 'Build 3D, WebGL, three.js, React Three Fiber (R3F), drei or shader work. Use for 3D scenes, models, particles, 3D backgrounds and scroll-driven 3D in a React app. Combine with the gsap-* skills for animation.'
---

# three.js in React

## Read the official sources first

Training data about three.js and R3F is often outdated. Before writing 3D code, fetch and follow:

- https://threejs.org/docs/llms.txt
- https://r3f.docs.pmnd.rs/llms.txt

If they contradict what you remember, follow them and say so. If a URL fails, use the official docs sites (threejs.org/docs, r3f.docs.pmnd.rs, drei.docs.pmnd.rs).

## Default approach

React Three Fiber (`@react-three/fiber`, v9 for React 19) inside a `<Canvas>`, adding `@react-three/drei` helpers only when a Story needs one. Drop to raw three.js through refs only for what R3F does not cover. Do not wire a vanilla three.js scene by hand in an effect.

Already installed: `three`, `@react-three/fiber`, `@types/three` and `@react-three/test-renderer` (renders R3F scenes without a GPU in Vitest). Install drei with `npm install @react-three/drei` when first needed.

## Rules

- No React state updates in `useFrame`. Mutate refs (`ref.current.rotation.y += delta`).
- Reuse geometries and materials, and share them between meshes. Do not create objects inside render or `useFrame`.
- R3F disposes what it creates from JSX. Dispose what you create yourself (`geometry.dispose()`, `material.dispose()`, textures, render targets).
- Keep the pixel ratio capped (R3F's `dpr` defaults to `[1, 2]`). Do not raise it above 2.
- Static scenes render on demand: `frameloop="demand"` and `invalidate()`.
- Wrap loaded assets (`useGLTF`, `useTexture`) in `<Suspense fallback={...}>`. Compress and size models and textures for the web.
- Provide a non-WebGL fallback and reduced-motion behavior (no camera drift, no continuous motion).
- Keep the scene in its own lazy-loaded module so it stays out of the initial bundle.

## With GSAP

Animate refs, not React state: create the tween in `useGSAP` (see `gsap-react`) targeting `ref.current` properties such as `position`, `rotation`, `scale` or material values. Drive scroll-linked 3D with ScrollTrigger (see `gsap-scrolltrigger`) updating a ref or a plain object that `useFrame` reads. Never `setState` per frame.
