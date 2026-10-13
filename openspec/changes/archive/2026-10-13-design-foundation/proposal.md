# Proposal

## Why

The card shows all its content (Opening, Families, Finale) but is still unstyled browser defaults, which feels unfinished on every screen. Story #33 gives it a warm, consistent look that works on phone, tablet and desktop, and lays the visual foundation the animation stories (#34–#37) build on.

## What Changes

- Define design tokens in Tailwind 4 `@theme`:
  - A dark, warm base: a deep maroon background with cream text, chosen to fit the later 3D background (#34) and the candle finale (#37).
  - Red, orange and yellow as accent colors for headings, highlights and decoration.
  - Typography: Fraunces (display serif) for headings and Nunito (rounded sans) for body text, self-hosted through Fontsource, with system fallbacks.
- Apply the tokens to the Opening (greeting and intro), the family sections and their messages, and the Finale.
- Mobile-first layout: one centered, readable column with spacing and type sizes that grow at tablet and desktop widths, and no horizontal scrolling at any of those widths.
- Every text and background pair meets WCAG AA contrast (at least 4.5:1).
- No animation or transition is added. Content stays visible and static as the existing specs require, and a scenario proves it for all content.

Out of scope: the 3D background (#34), scroll morph (#35), scroll reveals and background shift (#36), the cake celebration (#37), cross-browser and device QA (#38), photos and sound.

## Capabilities

### New Capabilities

- `visual-design`: the card's palette, typography, responsive layout and readable contrast across all content.

### Modified Capabilities

_None._ The greeting, family messages and finale keep their text, order and static behavior.

## Impact

- `src/index.css`: `@theme` tokens and base styles for the page.
- `src/main.tsx`: imports the two Fontsource fonts.
- `src/App.tsx`, `src/FamilySection.tsx`: Tailwind utility classes that use the tokens.
- New pure test helper `features/support/color.ts` (contrast ratio, luminance, hue, saturation) with unit tests, used by the BDD steps. `vite.config.ts` includes its tests in the Vitest run.
- `features/home.feature`, `features/steps/home.steps.ts`: the step "the heading is styled with Tailwind" asserts a fixed 30px heading size, which the new type scale changes. It is replaced by the visual design scenarios.
- `features/steps/families.steps.ts`: the "short browser window" grows from 160px to 640px tall, because the styled sections no longer fit in 160px. It is shared with `features/finale.feature`.
- New BDD feature `features/visual-design.feature` with steps.
- New dependencies: `@fontsource-variable/fraunces` and `@fontsource-variable/nunito` (OFL-1.1, self-hosted, no third-party request at runtime).
