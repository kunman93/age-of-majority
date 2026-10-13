# Spec Delta

## MODIFIED Requirements

### Requirement: Styling adds no motion
The card SHALL NOT animate or transition any of its content: the greeting, the intro, the family sections and the finale. All content SHALL be shown in its final style as soon as the page loads. The decorative background behind the content is not content; its motion is governed by the `background-scene` capability.

#### Scenario: Visitor sees a static card
- **WHEN** a visitor opens the home page
- **THEN** no element on the card has an animation or a transition
