# Proposal

## Why

The card should greet visitors with the Halloween message instead of the birthday greeting (Story #59).

## What Changes

- The main (level 1) heading reads "Happy Halloween" instead of "Happy 18th Birthday, Sara!".
- The unit tests and the BDD feature that look up the heading by its text use the new text.
- The `birthday-greeting` Purpose no longer claims the heading names the age of majority.

Out of scope: the intro paragraph, the page title, the family messages, the heading's styling and its
animation. They stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `birthday-greeting`: the greeting heading's exact text changes to "Happy Halloween", and the intro
  scenario refers to the heading by its new text.

## Impact

- `src/App.tsx`: heading text.
- `src/App.test.tsx`, `src/background/Background.test.tsx`, `features/home.feature`: heading lookups.
- `openspec/specs/birthday-greeting/spec.md`: Purpose.
