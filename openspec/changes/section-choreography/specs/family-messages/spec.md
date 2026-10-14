# Spec Delta

## MODIFIED Requirements

### Requirement: Families are reached by plain scrolling
All family sections SHALL be part of the normal page flow and reachable by plain scrolling, without scroll snapping or smooth scrolling. When the visitor prefers reduced motion, every message SHALL be visible as soon as it is scrolled into view, without animation. Otherwise every message SHALL reveal while it scrolls into view and SHALL be fully visible once it is in the upper half of the viewport, as described by the `content-choreography` capability.

#### Scenario: Visitor scrolls to the last family
- **WHEN** a visitor scrolls the "Family Dolor" section to the top of the viewport
- **THEN** the "Family Dolor" heading and its messages are visible

#### Scenario: Visitor who prefers reduced motion scrolls to the last family
- **WHEN** a visitor who prefers reduced motion scrolls until the "Family Dolor" heading just enters the viewport
- **THEN** the "Family Dolor" heading is fully visible
