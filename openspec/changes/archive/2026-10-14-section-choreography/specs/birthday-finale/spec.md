# Spec Delta

## MODIFIED Requirements

### Requirement: Finale is static
The finale SHALL be part of the normal page flow, reachable by plain scrolling, without celebration effect or user interaction. When the visitor prefers reduced motion, it SHALL be fully visible as soon as it is scrolled into view, without animation. Otherwise it SHALL reveal while it scrolls into view and SHALL be fully visible once it is in the upper half of the viewport, as described by the `content-choreography` capability.

#### Scenario: Visitor scrolls to the finale
- **WHEN** a visitor scrolls to the end of the page
- **THEN** the finale heading, message and signature are visible

#### Scenario: Visitor who prefers reduced motion scrolls to the finale
- **WHEN** a visitor who prefers reduced motion scrolls until the finale heading just enters the viewport
- **THEN** the finale heading is fully visible
