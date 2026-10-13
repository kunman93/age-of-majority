# Proposal

## Why

The card ends abruptly after the last family's messages. Story #23 adds a final birthday message so the card closes with a proper finale. It is part 3 of 4 (Opening, Families, Finale, Animations) and follows the Families story (#22).

## What Changes

- Add a finale below the last family section, as the last content of the card:
  - Heading: "Here's to you, Sara!"
  - Message: "Eighteen years of you, and the best is still ahead. Whatever you choose next, your family is cheering you on. Happy birthday!"
  - Signature below the message: "With love, your family"
- The finale is static: no celebration effect, no animation, visible as soon as it is scrolled into view.

Out of scope: the cake and confetti celebration (#37), other animations (#24, #34–#36), palette, typography and layout (#33).

## Capabilities

### New Capabilities

- `birthday-finale`: the closing message shown at the end of the card.

### Modified Capabilities

_None._

## Impact

- `src/App.tsx`: finale markup after the family sections.
- `src/App.test.tsx`, `features/steps/families.steps.ts`: family heading checks are narrowed to family headings, because the finale adds another level-2 heading.
- New tests: unit test in `src/App.test.tsx`, BDD feature `features/finale.feature` with steps.
- No new dependencies.
