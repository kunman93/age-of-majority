# Spec Delta

## MODIFIED Requirements

### Requirement: Home page shows the age of majority greeting
The home page SHALL show a heading with the exact text "Happy 18th Birthday, Sara!" without user interaction. When the visitor prefers reduced motion, it SHALL be shown as soon as the page loads, without animation; otherwise it SHALL drop in on load as described by the `content-choreography` capability.

#### Scenario: Visitor opens the home page
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the heading "Happy 18th Birthday, Sara!"
- **AND** the heading "Happy Age of Majority!" is not shown
