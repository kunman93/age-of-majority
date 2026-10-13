# Proposal

## Why

The intro invites visitors to "Scroll on and read what they have to say", but nothing follows it yet. Story #22 adds the families and their messages, so the card actually carries the wishes. It is part 2 of 4 (Opening, Families, Finale, Animations).

## What Changes

- Below the intro, show one section per family, in a fixed order: Family Lorem, Family Ipsum, Family Dolor.
- Each section shows the family name as a heading and the family's messages. Each message shows its text and its author.
- A family can send one message as a whole family (the family name is the author), messages from individual members, or both.
- The content lives in the repo as a typed data list with Lorem ipsum texts and placeholder names. Adding a family or a message means adding a data entry, with no change to the rendering code.
- Visitors reach every family by plain page scrolling: no animations, scroll snapping or smooth scrolling.

Out of scope: real family names and messages, a backend for storing wishes (#3), styling and layout (#33), animations (#24, #34–#37), finale (#23).

## Capabilities

### New Capabilities

- `family-messages`: the families shown on the card and the messages each family sends to the birthday child.

### Modified Capabilities

_None._

## Impact

- New `src/families.ts`: family and message types plus the placeholder data.
- `src/App.tsx`: renders the family sections below the intro.
- `src/App.test.tsx`, `features/`: new unit and BDD tests. Existing BDD steps that locate "the" heading or "the" paragraph without a name must become specific, because the page will then have several headings and paragraphs.
- No new dependencies.
