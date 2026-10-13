# birthday-finale Specification

## Purpose
Closes the birthday card with a final birthday message after all family messages, so the card ends with a proper finale.

## Requirements

### Requirement: Card ends with the final birthday message
The home page SHALL show, below the last family section, a finale with the heading "Here's to you, Sara!", followed by the message "Eighteen years of you, and the best is still ahead. Whatever you choose next, your family is cheering you on. Happy birthday!", followed by the signature "With love, your family". Nothing else SHALL follow the finale on the card.

#### Scenario: Visitor reads the finale
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the heading "Here's to you, Sara!", then the message, then the signature "With love, your family"
- **AND** the finale is below the "Family Dolor" section

### Requirement: Finale is static
The finale SHALL be part of the normal page flow, reachable by plain scrolling, and fully visible as soon as it is scrolled into view, without animation, celebration effect or user interaction.

#### Scenario: Visitor scrolls to the finale
- **WHEN** a visitor scrolls to the finale
- **THEN** the finale heading, message and signature are visible
