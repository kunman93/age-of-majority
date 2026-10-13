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
The card SHALL NOT animate or transition any of its content: the greeting, the intro, the family sections and the finale. All content SHALL be shown in its final style as soon as the page loads. The decorative background behind the content is not content; its motion is governed by the `background-scene` capability.

#### Scenario: Visitor sees a static card
- **WHEN** a visitor opens the home page
- **THEN** no element on the card has an animation or a transition
