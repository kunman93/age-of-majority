# Spec Delta

## MODIFIED Requirements

### Requirement: Styling adds no motion
When the visitor prefers reduced motion, the card SHALL NOT animate or transition any of its content: the greeting, the intro, the family sections and the finale. All content SHALL then be shown in its final style as soon as the page loads. Without reduced motion, the content's motion is governed by the `content-choreography` capability. The decorative background behind the content is not content; its motion is governed by the `background-scene` capability.

#### Scenario: Visitor sees a static card
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** no element on the card has an animation or a transition

## ADDED Requirements

### Requirement: Family messages look like scrapbook cards
Each family message SHALL be shown as a paper-like card with a tape strip at its top edge. Consecutive cards SHALL be
tilted slightly in alternating directions, by at most 2 degrees. The cards SHALL contain only text, with no images.
Their text SHALL stay upright enough to read and SHALL meet the card's contrast and size requirements.

#### Scenario: Visitor sees scrapbook cards
- **WHEN** a visitor opens the home page
- **THEN** every message card has a tape strip at its top edge
- **AND** consecutive message cards are tilted in opposite directions by at most 2 degrees
- **AND** no message card contains an image

#### Scenario: Visitor reads a scrapbook card on a phone
- **WHEN** a visitor opens the home page in a 375px wide window
- **THEN** the page does not scroll horizontally
- **AND** every message card fits within the window width
