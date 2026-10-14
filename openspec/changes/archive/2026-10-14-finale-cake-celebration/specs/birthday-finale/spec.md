# Spec Delta

## MODIFIED Requirements

### Requirement: Card ends with the final birthday message
The home page SHALL show, below the last family section, a finale with the heading "Here's to you, Sara!", followed by the message "Eighteen years of you, and the best is still ahead. Whatever you choose next, your family is cheering you on. Happy birthday!", followed by the signature "With love, your family". Only the birthday cake, as described by the `birthday-cake` capability, SHALL follow the signature on the card.

#### Scenario: Visitor reads the finale
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the heading "Here's to you, Sara!", then the message, then the signature "With love, your family"
- **AND** the finale is below the "Family Dolor" section

### Requirement: Finale is static
The finale's heading, message and signature SHALL be part of the normal page flow, reachable by plain scrolling, without celebration effect or user interaction. The celebration belongs to the cake below them, as described by the `birthday-cake` capability. When the visitor prefers reduced motion, the finale SHALL be fully visible as soon as it is scrolled into view, without animation. Otherwise it SHALL reveal while it scrolls into view and SHALL be fully visible once it is in the upper half of the viewport, as described by the `content-choreography` capability.

#### Scenario: Visitor scrolls to the finale
- **WHEN** a visitor scrolls to the end of the page
- **THEN** the finale heading, message and signature are visible

#### Scenario: Visitor who prefers reduced motion scrolls to the finale
- **WHEN** a visitor who prefers reduced motion scrolls until the finale heading just enters the viewport
- **THEN** the finale heading is fully visible
