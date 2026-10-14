# Proposal

## Why

The 3D background (#34) is ambient. It does not react to the card. Story #35 makes scrolling tell Sara's story: a
glowing object morphs from "17" to "18" and finally a key, the symbol of coming of age. It runs in reverse when the
visitor scrolls back up. The opening already celebrates the birthday, so the story starts at 17. Visitors who prefer reduced motion or have no WebGL must get the same
story as still pictures.

## What Changes

- Add a decorative showcase between the opening and the first family. While the visitor scrolls through it, it stays
  in the viewport and a bright, centered particle object morphs through three stages: "17", "18" and key. Each
  stage holds for a stretch of scrolling before the next morph starts. Then the families scroll in.
- Drive the morph with GSAP ScrollTrigger with `scrub`, so scrolling down plays it forward and scrolling up plays it
  in reverse.
- Draw the story object in its own canvas inside the showcase, so it is part of the page flow: it scrolls in with the
  showcase, stays while the showcase fills the viewport and scrolls away with it. It never overlaps the opening, the
  families or the finale, which keep the dim ember background.
- When the static fallback is shown (reduced motion, no WebGL or a failed 3D load), the showcase shows the three stages
  as a row of still, decorative illustrations at normal height. Nothing from the 3D scene or GSAP is downloaded.
- Add the `gsap` and `@gsap/react` dependencies, loaded only with the lazy 3D scene.

## Capabilities

### New Capabilities

- `scroll-morph`: the scroll-driven story object in the showcase. It covers its stages, forward and reverse playback,
  its visibility and placement, and the static stage illustrations shown instead of it.

### Modified Capabilities

- `background-scene`: the static fallback also applies when the 3D scene fails to load. Text readability is also
  checked with the families and the finale in the viewport. The story object is not part of the background.

## Impact

- **Code:** `src/background/` (story canvas, story object, shape sampling, scroll driver), `src/story/` (shapes,
  stage mapping, illustrations), a new showcase section in `src/App.tsx`, and the shared choice between the 3D and static versions,
  which today lives in `Background.tsx`.
- **Dependencies:** `gsap` and `@gsap/react` are new runtime packages, kept in the lazily loaded 3D chunks.
- **Tests:** unit tests for shape sampling and stage mapping. New BDD feature `scroll-morph.feature`.
  `background-scene.feature` gains the load-failure scenario.
- **Out of scope:** content scroll reveals and the background color shift (#36), and the finale cake (#37).
