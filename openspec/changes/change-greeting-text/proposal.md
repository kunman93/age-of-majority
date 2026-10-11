# Proposal

## Why

The card celebrates reaching the age of majority, but the heading says "Happy 18th Birthday!". The heading should name the occasion. This story also serves as a small end-to-end run of the story implementation workflow (#7).

## What Changes

- The home page heading changes from "Happy 18th Birthday!" to "Happy Age of Majority!".
- The unit test and the BDD scenario that assert the heading are updated to the new text.

## Capabilities

### New Capabilities

- `birthday-greeting`: the greeting heading that visitors see on the home page of the card.

### Modified Capabilities

None.

## Impact

- `src/App.tsx`: heading text.
- `src/App.test.tsx`: unit test assertion.
- `features/home.feature`: BDD scenario step.
- No API, dependency, or configuration changes.
