# Proposal

## Why

The card opens with the greeting and intro squeezed into the top-left of the page, with the showcase already
visible below them. Story #46 asks for a focused first impression: the opening alone, centered in the first screen.

## What Changes

- The greeting heading and the intro fill the first screen and sit in its horizontal and vertical center, with
  their text centered.
- The showcase, the family sections and the finale start below the first screen and are otherwise unchanged.
- The ember background blends with max blending instead of additive, so overlapping embers can no longer brighten a
  pixel past a single ember. This removes a flaky 4.5:1 contrast check; no spec requirement changes.
- On short windows, such as phones in landscape, the opening uses tighter spacing so it still fits and centers.
- The intro text is one size step larger (requested alongside the Story).
- The heading and intro stay visible on load without animation or interaction.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `birthday-greeting`: adds a requirement that the opening is centered in the first screen from phone to desktop,
  including landscape phones.

## Impact

- `src/App.tsx`: layout classes of the `<header>` and `<main>`, and the intro text size.
- `src/background/Embers.tsx`: blending mode and premultiplied fragment color.
- `src/index.css`: a `short` custom variant for windows up to 540px tall.
- `features/home.feature` and `features/steps/home.steps.ts`: new BDD scenario.
- No new dependencies.
