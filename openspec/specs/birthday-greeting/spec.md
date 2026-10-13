# birthday-greeting Specification

## Purpose

Greets visitors of the birthday card with a heading that names the occasion: reaching the age of majority.

## Requirements

### Requirement: Home page shows the age of majority greeting
The home page SHALL show a heading with the exact text "Happy 18th Birthday, Sara!" as soon as the page loads, without animation or user interaction.

#### Scenario: Visitor opens the home page
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the heading "Happy 18th Birthday, Sara!"
- **AND** the heading "Happy Age of Majority!" is not shown

### Requirement: Home page shows an intro below the greeting
The home page SHALL show, below the greeting heading, a paragraph with the exact text "Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say." It SHALL be visible as soon as the page loads, without animation or user interaction.

#### Scenario: Visitor reads the intro
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the intro text below the heading "Happy 18th Birthday, Sara!"
