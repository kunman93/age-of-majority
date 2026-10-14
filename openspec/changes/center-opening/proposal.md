# Proposal

## Why

The card opens with the greeting and intro squeezed into the top-left of the page, with the showcase already
visible below them. Story #46 asks for a focused first impression: the opening alone, centered in the first screen.

## What Changes

- The greeting heading and the intro fill the first screen and sit in its horizontal and vertical center, with
  their text centered.
- The showcase, the family sections and the finale start below the first screen and are otherwise unchanged.
- The heading and intro stay visible on load without animation or interaction.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `birthday-greeting`: adds a requirement that the opening is centered in the first screen at phone to desktop
  widths.

## Impact

- `src/App.tsx`: layout classes of the `<header>` and `<main>`.
- `features/home.feature` and `features/steps/home.steps.ts`: new BDD scenario.
- No new dependencies.
