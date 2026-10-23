# birthday-greeting Specification

## Purpose

Greets visitors of the birthday card with a Halloween heading.

## Requirements

### Requirement: Home page shows the age of majority greeting
The home page SHALL show a heading with the exact text "Happy 18th Birthday, Sara!" without user interaction. When the visitor prefers reduced motion, it SHALL be shown as soon as the page loads, without animation; otherwise it SHALL fade in on load as described by the `content-choreography` capability.

#### Scenario: Visitor opens the home page
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the heading "Happy 18th Birthday, Sara!"
- **AND** the heading "Happy Age of Majority!" is not shown

### Requirement: Home page shows an intro below the greeting
The home page SHALL show, below the greeting heading, a paragraph with the exact text "Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say." without user interaction. When the visitor prefers reduced motion, the full text SHALL be visible as soon as the page loads, without animation; otherwise its sentences SHALL be typed one at a time in a loop as described by the `content-choreography` capability.

#### Scenario: Visitor reads the intro
- **WHEN** a visitor opens the home page
- **THEN** the accessible text of the paragraph below the heading "Happy 18th Birthday, Sara!" is the full intro text

#### Scenario: Visitor who prefers reduced motion reads the intro at once
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** the visitor sees the full intro text at once

### Requirement: Opening is centered in the first screen
On load, the greeting heading and the intro SHALL be the only content in the first screen. Together they SHALL be centered horizontally and vertically in the window. The text of the heading and the intro SHALL be left-aligned. The rest of the card SHALL start below the first screen. This SHALL hold at every window size from phone to desktop, in portrait and landscape, as long as the window is at least as tall as the opening.

#### Scenario: Visitor opens the card on a phone, landscape phone, tablet, laptop or desktop
- **WHEN** a visitor opens the home page in a phone (390 by 844), landscape phone (667 by 375), tablet (768 by 1024), laptop (1536 by 864) or desktop (1920 by 1080) window
- **THEN** the greeting heading and the intro are centered horizontally and vertically in the window
- **AND** the text of the heading and the intro is left-aligned
- **AND** the content after the intro starts at or below the bottom of the window
