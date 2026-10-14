# Proposal

## Why

The card ends with a quiet, static finale. Story #37 ends it with a celebration instead: Sara blows out the candles on
a birthday cake, and confetti follows. Visitors who prefer reduced motion or have no WebGL must still get the cake and
the interaction, without motion.

## What Changes

- Add a birthday cake with 18 lit candles below the finale's signature, as the last thing on the card.
- The whole cake area is one button with the visible hint "Tap the cake to blow out the candles". A tap, a click,
  Enter or Space blows out the candles, then confetti plays inside the cake area. The hint changes to "Make a wish!"
  and the cake stays blown out.
- Scrolling back up until the cake is below the viewport relights the candles and restores the hint.
- With the 3D background, the cake is drawn with Three.js in its own lazily loaded canvas inside the finale, with
  flickering flames. It follows the existing 3D rules: no download in static mode, at most 2 device pixels per CSS
  pixel, no rendering while hidden or out of view, resources released on removal, and a fall back to static on a load
  failure.
- When the static fallback is shown (reduced motion, no WebGL or a failed 3D load), the cake is a still SVG
  illustration. Blowing switches it at once to unlit candles, without confetti or any animation.
- The finale is no longer free of interaction, and the signature is no longer the last thing on the card.

## Capabilities

### New Capabilities

- `birthday-cake`: the cake below the finale. It covers the candles, blowing them out with pointer and keyboard, the
  confetti, the reset on scroll-up, the 3D and static versions, and the 3D cake's loading, rendering and resources.

### Modified Capabilities

- `birthday-finale`: the cake now follows the signature, and only the finale's heading, message and signature stay
  static and free of interaction.

## Impact

- **Code:** a new `src/cake/` (cake state, static illustration, lazily loaded 3D canvas, candles, flames, confetti),
  and the finale in `src/App.tsx`.
- **Dependencies:** none. Three.js, React Three Fiber and GSAP are already in the project.
- **Tests:** unit tests for candle layout, confetti buffers, the cake state and the components. New BDD feature
  `birthday-cake.feature`. `finale.feature` stays valid.
- **Out of scope:** blowing into the microphone (a possible later Story).
