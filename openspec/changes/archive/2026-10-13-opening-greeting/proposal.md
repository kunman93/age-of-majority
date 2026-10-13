# Proposal

## Why

The card still opens with the placeholder heading "Happy Age of Majority!" from the workflow test in #8. Story #21 replaces it with the real opening, so visitors are welcomed to Sara's 18th birthday card properly. It is part 1 of 4 (Opening, Families, Finale, Animations).

## What Changes

- Replace the placeholder heading with "Happy 18th Birthday, Sara!".
- Add a short intro paragraph below the heading: "Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say."
- The opening is static: no animations, shown as soon as the page loads.
- **BREAKING** (spec): the greeting no longer uses the text "Happy Age of Majority!", and "Happy 18th Birthday" is now allowed.

Out of scope: palette, typography and layout (#33), animations (#24, #34–#37), family messages (#22), finale (#23), browser tab title (stays `age-of-majority`).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `birthday-greeting`: the heading text changes to the real greeting, and an intro paragraph is added below it.

## Impact

- `src/App.tsx`: opening markup.
- `src/App.test.tsx`, `features/home.feature`, `features/steps/home.steps.ts`: updated to the new text.
- No new dependencies.
