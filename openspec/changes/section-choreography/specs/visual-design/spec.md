# Spec Delta

## MODIFIED Requirements

### Requirement: Styling adds no motion
When the visitor prefers reduced motion, the card SHALL NOT animate or transition any of its content: the greeting, the intro, the family sections and the finale. All content SHALL then be shown in its final style as soon as the page loads. Without reduced motion, the content's motion is governed by the `content-choreography` capability. The decorative background behind the content is not content; its motion is governed by the `background-scene` capability.

#### Scenario: Visitor sees a static card
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** no element on the card has an animation or a transition

## ADDED Requirements

### Requirement: Family messages look like scrapbook cards
Each family message SHALL be shown as a paper-like note with a pin at the middle of its top edge and a tape strip at a
top corner. Consecutive notes SHALL be tilted slightly in alternating directions, by at most 2 degrees. The cards SHALL contain only text, with no images.
Their text SHALL stay upright enough to read and SHALL meet the card's contrast and size requirements.

#### Scenario: Visitor sees scrapbook cards
- **WHEN** a visitor opens the home page
- **THEN** every message card has a pin at the middle of its top edge and a tape strip at a top corner
- **AND** consecutive message cards are tilted in opposite directions by at most 2 degrees
- **AND** no message card contains an image

#### Scenario: Visitor reads a scrapbook card on a phone
- **WHEN** a visitor opens the home page in a 375px wide window
- **THEN** the page does not scroll horizontally
- **AND** every message card fits within the window width

### Requirement: Birthday wishes are laid out in rows
On a window at least 640px wide, the message cards of a family SHALL sit side by side in centered rows that wrap onto a
new row when they do not fit, and the "Birthday wishes" section MAY be wider than the rest of the card. There, every
card SHALL be at least 400px wide, as long as the window leaves room for it. On a narrower window, the message cards
SHALL be stacked vertically. Every card SHALL have the same width within a row.

#### Scenario: Visitor reads the wishes on a wide screen
- **WHEN** a visitor opens the home page in a 1280px wide window
- **THEN** the two "Family Ipsum" message cards are side by side, with their tops at the same height
- **AND** every message card is at least 400px wide
- **AND** the page does not scroll horizontally

#### Scenario: Visitor reads the wishes on a phone
- **WHEN** a visitor opens the home page in a 375px wide window
- **THEN** the two "Family Ipsum" message cards are stacked vertically
- **AND** every message card fits within the window width

### Requirement: Birthday wishes are pinned to a board
All family headings and message notes of the "Birthday wishes" section SHALL sit on one board that looks like a cork
pin board, drawn without images. The "Birthday wishes" heading and its overline SHALL be above the board. The overline
"From your family" and the family headings on the board SHALL meet the card's contrast and size requirements.

#### Scenario: Visitor sees the board
- **WHEN** a visitor opens the home page
- **THEN** every family heading and every message card is inside one board
- **AND** the heading "Birthday wishes" is above the board
- **AND** the board contains no image

#### Scenario: Visitor reads the board on a phone
- **WHEN** a visitor opens the home page in a 375px wide window
- **THEN** the board fits within the window width
- **AND** the page does not scroll horizontally
