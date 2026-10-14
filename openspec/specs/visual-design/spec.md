# visual-design Specification

## Purpose
Gives the birthday card a warm, consistent look with readable text on phone, tablet and desktop screens.

## Requirements

### Requirement: Card has a warm, dark look
The card SHALL use a dark, warm page background with light body text, and SHALL use red, orange and yellow as its accent colors. The greeting heading, the family headings and the finale heading SHALL be shown in an accent color.

#### Scenario: Visitor sees the warm look
- **WHEN** a visitor opens the home page
- **THEN** the page background is a dark, warm color
- **AND** the intro, the messages and the finale message are shown in a light color
- **AND** the greeting, the family headings and the finale heading are shown in red, orange or yellow

### Requirement: Card uses consistent typography
All headings on the card SHALL use one display typeface, and all other text SHALL use one body typeface that differs from the display typeface. This SHALL hold for the Opening, the family sections and the Finale alike.

#### Scenario: Visitor sees consistent typefaces
- **WHEN** a visitor opens the home page
- **THEN** the greeting, every family heading and the finale heading use the same typeface
- **AND** the intro, every message, every author and the finale message and signature use the same typeface, which differs from the heading typeface

### Requirement: Fonts are served from the card's own origin
The card SHALL load its typefaces from its own origin and SHALL NOT request fonts or stylesheets from any other origin.

#### Scenario: Visitor opens the card without third-party requests
- **WHEN** a visitor opens the home page
- **THEN** every font the page loads comes from the card's own origin
- **AND** the page makes no request to another origin

### Requirement: Layout adapts to phone, tablet and desktop widths
The card SHALL lay out its content in a single column that fits the viewport at phone (375px), tablet (768px) and desktop (1280px) widths, without horizontal scrolling. Body text SHALL be at least 16px. On widths wider than the column, the column SHALL be centered and no wider than 720px.

#### Scenario: Visitor reads the card on a phone
- **WHEN** a visitor opens the home page in a 375px wide window
- **THEN** the page does not scroll horizontally
- **AND** the greeting, the intro, every family section and the finale fit within the window width

#### Scenario: Visitor reads the card on a tablet
- **WHEN** a visitor opens the home page in a 768px wide window
- **THEN** the page does not scroll horizontally
- **AND** the content column is centered and no wider than 720px

#### Scenario: Visitor reads the card on a desktop
- **WHEN** a visitor opens the home page in a 1280px wide window
- **THEN** the page does not scroll horizontally
- **AND** the content column is centered and no wider than 720px

#### Scenario: Body text stays legible
- **WHEN** a visitor opens the home page at any of the phone, tablet or desktop widths
- **THEN** the intro, the messages, the authors and the finale message and signature are at least 16px

### Requirement: Text contrast is readable
Every text on the card SHALL have a contrast ratio of at least 4.5:1 against the background directly behind it, as defined by WCAG 2.2 level AA.

#### Scenario: Visitor reads every text comfortably
- **WHEN** a visitor opens the home page
- **THEN** the greeting, the intro, every family heading, message and author, and the finale heading, message and signature each have a contrast ratio of at least 4.5:1 against their background

### Requirement: Styling adds no motion
When the visitor prefers reduced motion, the card SHALL NOT animate or transition any of its content: the greeting, the intro, the family sections and the finale. All content SHALL then be shown in its final style as soon as the page loads. Without reduced motion, the content's motion is governed by the `content-choreography` capability. The decorative background behind the content is not content; its motion is governed by the `background-scene` capability.

#### Scenario: Visitor sees a static card
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** no element on the card has an animation or a transition

### Requirement: Family messages look like scrapbook cards
Each family message SHALL be shown as a paper-like note with a tape strip at the middle of its top edge and a pin
through the middle of the tape. Each note SHALL be tilted around its pin, and consecutive notes SHALL be tilted
slightly in alternating directions, by at most 2 degrees. The cards SHALL contain only text, with no images.
Their text SHALL stay upright enough to read and SHALL meet the card's contrast and size requirements.

#### Scenario: Visitor sees scrapbook cards
- **WHEN** a visitor opens the home page
- **THEN** every message card has a tape strip at the middle of its top edge, with a pin through its middle
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
