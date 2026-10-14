# Spec Delta

## Purpose

Makes reading the birthday card feel alive. The intro types its sentences in a loop, and the opening, the families and
the finale move in and out with the scroll, while every text stays readable and visitors who prefer reduced motion get
a still card.

## ADDED Requirements

### Requirement: Content moves only without reduced motion
The card's content (the greeting, the intro, the family sections and the finale) SHALL move only when the visitor does
not prefer reduced motion, regardless of WebGL support or whether the 3D background loads. With reduced motion, all
content SHALL be shown in its final state as soon as the page loads, and nothing SHALL animate or transition.

#### Scenario: Visitor without WebGL sees the content move
- **WHEN** a visitor whose browser does not support WebGL and who does not prefer reduced motion opens the home page
- **THEN** the intro is typed out

#### Scenario: Visitor who prefers reduced motion sees a still card
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** the greeting and the full intro are shown at once
- **AND** no content element has an animation or a transition
- **WHEN** the visitor scrolls to the first family and to the finale
- **THEN** their headings and texts are fully visible without moving

#### Scenario: Visitor turns on reduced motion while the intro is typed
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **AND** turns on reduced motion while a sentence of the intro is typed
- **THEN** the full intro is shown at once
- **AND** no content element moves any longer

### Requirement: Intro is typed sentence by sentence in a loop
When the content moves, the greeting SHALL fade in on load, then the intro's sentences SHALL be typed one at a time at
about 30 ms per character. Each sentence SHALL stay fully shown for about 2 s and then be erased before the next
sentence is typed in its place. After the last sentence, the loop SHALL start again with the first. A blinking
accent-colored cursor SHALL follow the last typed character.

#### Scenario: Visitor watches the intro being typed
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** shortly after load only the first part of the first sentence is visible
- **AND** a blinking cursor follows the last typed character
- **WHEN** the visitor waits until the first sentence is fully typed
- **THEN** the first sentence is visible and no other sentence is visible
- **WHEN** the visitor waits a few seconds longer
- **THEN** the second sentence is being typed in place of the first

#### Scenario: Visitor sees the intro loop
- **WHEN** a visitor who does not prefer reduced motion waits until the last sentence of the intro has been typed and erased
- **THEN** the first sentence is typed again

### Requirement: Typed intro stays accessible and in place
While the intro is typed, the full intro SHALL be available to assistive technology at all times, and the space of
the longest sentence SHALL be reserved so the opening does not move.

#### Scenario: Assistive technology reads the full intro at once
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** the accessible text of the intro is the full intro, while its sentences are typed
- **AND** the cursor is hidden from assistive technology

#### Scenario: Opening stays in place while the intro is typed
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** the greeting heading is at the same position shortly after load and while each sentence is fully typed

### Requirement: Typewriter pauses while the opening is out of view
When the content moves, the intro's typing loop SHALL pause while the opening is out of the viewport and SHALL resume
where it stopped when the opening is back in view.

#### Scenario: Typewriter pauses while the opening is scrolled away
- **WHEN** a visitor who does not prefer reduced motion scrolls the opening out of the viewport while a sentence is typed
- **THEN** the visible intro text no longer changes
- **WHEN** the visitor scrolls back to the top
- **THEN** the intro is typed on

### Requirement: Opening fades out when scrolled away
When the content moves, the opening SHALL fade out while the visitor scrolls it out of the viewport and SHALL fade back
in, in reverse, when the visitor scrolls back up. Its fade SHALL depend only on the scroll position.

#### Scenario: Visitor scrolls away from the opening and back
- **WHEN** a visitor who does not prefer reduced motion has watched the first sentence of the intro being typed
- **AND** scrolls until the opening is half out of the viewport
- **THEN** the opening is partly faded out
- **WHEN** the visitor scrolls back to the top
- **THEN** the greeting and the intro are fully opaque

### Requirement: Families and finale reveal while scrolling
When the content moves, each family heading, each message card and the finale SHALL fade in and rise into place while
they scroll into the viewport. Each reveal SHALL depend only on the scroll position and SHALL be complete before the
element's top reaches the middle of the viewport. Scrolling back up SHALL play each reveal in reverse.

#### Scenario: Visitor scrolls a family into view
- **WHEN** a visitor who does not prefer reduced motion scrolls until the top of the "Family Ipsum" section just enters the viewport from below
- **THEN** the "Family Ipsum" heading is not yet fully visible
- **WHEN** the visitor scrolls until the "Family Ipsum" heading is in the upper half of the viewport
- **THEN** the heading is fully visible and in its final position

#### Scenario: Visitor scrolls back up past a family
- **WHEN** a visitor who does not prefer reduced motion has revealed the "Family Ipsum" section
- **AND** scrolls back up until the top of the section is just above the bottom of the viewport
- **THEN** the "Family Ipsum" heading is not fully visible again

#### Scenario: Visitor scrolls to the finale
- **WHEN** a visitor who does not prefer reduced motion scrolls to the end of the page
- **THEN** the finale heading, message and signature are fully visible and in their final position

### Requirement: Text is readable once revealed
Whenever a family or finale text is in the upper half of the viewport, it SHALL be fully revealed and fully opaque
and SHALL meet the card's contrast requirements. While the opening fills the first screen after the greeting has
faded in, its text SHALL be fully opaque. Motion SHALL NOT change any text, its order or its availability to assistive
technology.

#### Scenario: Visitor reads revealed text
- **WHEN** a visitor who does not prefer reduced motion scrolls each family section and the finale to the middle of the viewport
- **THEN** each of their headings, messages and authors is fully opaque
- **AND** each has a contrast ratio of at least 4.5:1 against its background

#### Scenario: Assistive technology reads unrevealed content
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** every family heading, message and author and the finale are in the accessibility tree before they are scrolled into view
