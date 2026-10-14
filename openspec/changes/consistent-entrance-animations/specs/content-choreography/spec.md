# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Family headings and finale reveal while scrolling`
- TO: `### Requirement: Headings and finale reveal while scrolling`

## MODIFIED Requirements

### Requirement: Content moves only without reduced motion
The card's content (the greeting, the intro, the "Birthday wishes" heading and its overline, the family sections and
the finale) SHALL move only when the visitor does not prefer reduced motion, regardless of WebGL support or whether the
3D background loads. With reduced motion, all content SHALL be shown in its final state as soon as the page loads, and
nothing SHALL animate or transition.

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
When the content moves, the greeting SHALL drop in on load as described in "Every heading drops in the same way", then
the intro's sentences SHALL be typed one at a time at about 30 ms per character. Each sentence SHALL stay fully shown
for about 2 s and then be erased before the next sentence is typed in its place. After the last sentence, the loop
SHALL start again with the first. A blinking accent-colored cursor SHALL follow the last typed character.

#### Scenario: Visitor watches the intro being typed
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** shortly after load only the first part of the first sentence is visible
- **AND** a cursor follows the last typed character
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
- **AND** the greeting has dropped into its final position
- **THEN** the greeting stays at that position while each sentence is fully typed

### Requirement: Text is readable once revealed
Whenever a family or finale text is in the upper half of the viewport and the visitor has stopped scrolling for a few
seconds, it SHALL be fully revealed and fully opaque and SHALL meet the card's contrast requirements. While the opening
fills the first screen after the greeting has dropped in, its text SHALL be fully opaque. Motion SHALL NOT change any
text, its order or its availability to assistive technology.

#### Scenario: Visitor reads revealed text
- **WHEN** a visitor who does not prefer reduced motion scrolls each family section and the finale to the middle of the viewport
- **THEN** each of their headings, messages and authors is fully opaque once the scroll has come to rest
- **AND** each has a contrast ratio of at least 4.5:1 against its background

#### Scenario: Assistive technology reads unrevealed content
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** every family heading, message and author and the finale are in the accessibility tree before they are scrolled into view

### Requirement: Headings and finale reveal while scrolling
When the content moves, the "Birthday wishes" heading with its overline, each family heading and the finale heading
SHALL drop in as described in "Every heading drops in the same way" while they scroll into the viewport. After the
finale heading, the finale's message, signature and cake SHALL fade in without moving. Each reveal SHALL follow the
scroll position with a smooth catch-up, SHALL be complete once the element is in the upper half of the viewport and
the scroll has come to rest, and SHALL play in reverse when the visitor scrolls back up.

#### Scenario: Visitor scrolls a family into view
- **WHEN** a visitor who does not prefer reduced motion scrolls until the top of the "Family Ipsum" section just enters the viewport from below
- **THEN** the "Family Ipsum" heading is not fully visible
- **WHEN** the visitor scrolls until the "Family Ipsum" heading is in the upper half of the viewport
- **THEN** the heading becomes fully visible and settles in its final position

#### Scenario: Visitor scrolls back up past a family
- **WHEN** a visitor who does not prefer reduced motion has revealed the "Family Ipsum" section
- **AND** scrolls back up until the top of the section is just above the bottom of the viewport
- **THEN** the "Family Ipsum" heading becomes not fully visible again

#### Scenario: Visitor scrolls the birthday wishes heading into view
- **WHEN** a visitor who does not prefer reduced motion scrolls until the "Birthday wishes" heading just enters the viewport from below
- **THEN** the "Birthday wishes" heading and the overline "From your family" are not fully visible
- **WHEN** the visitor scrolls until the "Birthday wishes" heading is in the upper half of the viewport
- **THEN** the heading and the overline become fully visible and settle in their final positions

#### Scenario: Visitor scrolls to the finale
- **WHEN** a visitor who does not prefer reduced motion scrolls to the end of the page
- **THEN** the finale heading, message and signature become fully visible and settle in their final position

## ADDED Requirements

### Requirement: Every heading drops in the same way
When the content moves, every heading of the card (the greeting, the "Birthday wishes" heading with its overline, the
family headings and the finale heading) SHALL enter the same way: it SHALL fade in while it drops down from above into
its final position, over the same distance and with the same easing. No heading SHALL appear without this entrance,
and the entrance SHALL NOT shift any other content.

#### Scenario: Visitor sees the greeting drop in
- **WHEN** a visitor who does not prefer reduced motion opens the home page
- **THEN** shortly after load the greeting is above its final position and not fully opaque
- **WHEN** the visitor waits a moment
- **THEN** the greeting is fully opaque and in its final position

#### Scenario: Visitor sees every scrolled heading drop in from above
- **WHEN** a visitor who does not prefer reduced motion scrolls until the "Birthday wishes" heading, a family heading or the finale heading just enters the viewport from below
- **THEN** that heading is above its final position and not fully opaque

#### Scenario: Heading entrance does not shift the content
- **WHEN** a visitor who does not prefer reduced motion scrolls until the "Family Ipsum" heading just enters the viewport from below
- **THEN** the "Family Ipsum" message cards are at the same place in the page as when the heading has settled

### Requirement: Message cards slide in after their family heading
When the content moves, each family's message cards SHALL fade in and slide in sideways, one shortly after the other
and from alternating sides, with a bounce, while the family scrolls into view. A family's cards SHALL NOT be fully
revealed before its heading. The reveal SHALL follow the scroll with the same catch-up as the headings, SHALL be
complete once the cards are in the upper half of the viewport and the scroll has come to rest, and SHALL reverse on
scroll-up.

#### Scenario: Visitor scrolls a family's cards into view
- **WHEN** a visitor who does not prefer reduced motion scrolls until the top of the "Family Ipsum" cards just enters the viewport from below
- **THEN** consecutive "Family Ipsum" message cards are shifted sideways from their places, in opposite directions
- **AND** no "Family Ipsum" message card is fully visible
- **WHEN** the visitor scrolls until the "Family Ipsum" cards are in the upper half of the viewport
- **THEN** every "Family Ipsum" message card becomes fully visible and settles in its final position
- **AND** the page does not scroll horizontally

#### Scenario: Cards wait for their family heading
- **WHEN** a visitor who does not prefer reduced motion scrolls until the "Family Dolor" heading just enters the viewport from below
- **THEN** no "Family Dolor" message card is fully visible

#### Scenario: Visitor scrolls back above a family's cards
- **WHEN** a visitor who does not prefer reduced motion has revealed the "Family Ipsum" message cards
- **AND** scrolls back up until the top of the "Family Ipsum" section is just above the bottom of the viewport
- **THEN** no "Family Ipsum" message card is fully visible again

## REMOVED Requirements

### Requirement: Message cards slide in together when the board is reached
**Reason**: All cards on one board-wide timeline revealed the lower families' cards before their own family heading.
**Migration**: Replaced by "Message cards slide in after their family heading", which reveals the cards per family.
