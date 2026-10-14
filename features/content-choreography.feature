Feature: Content choreography

  Scenario: Visitor who prefers reduced motion sees a still card
    Given the visitor prefers reduced motion
    When I open the home page
    Then the greeting and the full intro are shown at once
    And no element animates or transitions
    When I scroll to the family "Family Lorem"
    Then the family "Family Lorem" and its messages are visible
    When I scroll to the finale
    Then the finale heading, message and signature are visible
    And no content has been faded or moved

  Scenario: Visitor without WebGL sees the content move
    Given the browser does not support WebGL
    When I open the home page
    Then the intro is typed out

  Scenario: Visitor watches the intro being typed
    When I open the home page
    Then shortly after load only the first part of the first sentence is visible
    And a blinking cursor follows the last typed character
    When I wait until the first sentence is fully typed
    Then the first sentence is visible and no other sentence is visible
    When I wait a few seconds longer
    Then the second sentence is being typed in place of the first

  Scenario: Visitor sees the intro loop
    When I open the home page
    And I wait until the last sentence of the intro has been typed and erased
    Then the first sentence is typed again

  Scenario: Typewriter pauses while the opening is scrolled away
    When I open the home page
    And the second sentence is partly typed
    And I scroll until the opening is out of the viewport
    Then the visible intro text no longer changes
    When I scroll back to the top
    Then the intro is typed on

  Scenario: Assistive technology reads the full intro at once
    When I open the home page
    Then the accessible text of the intro is the full intro, while its sentences are typed
    And the cursor is hidden from assistive technology

  Scenario: Opening stays in place while the intro is typed
    When I open the home page
    And I remember where the greeting is
    Then the greeting is where it was while each sentence is fully typed

  Scenario: Visitor turns on reduced motion while the intro is typed
    When I open the home page
    And the intro is partly typed
    And the visitor turns on reduced motion
    Then the full intro is shown at once
    And no content has been faded or moved

  Scenario: Visitor scrolls away from the opening and back
    When I open the home page
    And I wait until the first sentence is fully typed
    And I scroll until the opening is half out of the viewport
    Then the opening is partly faded out
    When I scroll back to the top
    Then the greeting and the full intro are fully visible

  Scenario: Visitor scrolls a family into view
    When I open the home page
    And I scroll until the top of the "Family Ipsum" section just enters the viewport from below
    Then the "Family Ipsum" heading is not fully visible
    When I scroll until the "Family Ipsum" heading is in the upper half of the viewport
    Then the "Family Ipsum" heading is fully visible and in its final position

  Scenario: Visitor hovers a message card
    When I open the home page
    And I scroll the first "Family Ipsum" message card into place and remember its tilt and pin
    And I move the pointer over the card
    Then the card is tilted in the opposite direction from before, by at most 2 degrees
    And its pin is at the same position as before
    When I move the pointer away from the card
    Then the card is back at its original tilt

  Scenario: Visitor who prefers reduced motion hovers a message card
    Given the visitor prefers reduced motion
    When I open the home page
    And I scroll the first "Family Ipsum" message card into place and remember its tilt and pin
    And I move the pointer over the card
    Then the card keeps its original tilt

  Scenario: Visitor scrolls back up past a family
    When I open the home page
    And I scroll until the "Family Ipsum" heading is in the upper half of the viewport
    Then the "Family Ipsum" heading is fully visible and in its final position
    When I scroll until the top of the "Family Ipsum" section is just above the bottom of the viewport
    Then the "Family Ipsum" heading is not fully visible

  Scenario: Visitor scrolls to the finale
    When I open the home page
    And I scroll to the end of the page
    Then the finale heading, message and signature are fully visible and in their final position

  Scenario: Visitor reads revealed text
    When I open the home page
    And I scroll each family section and the finale to the middle of the viewport
    Then each of their headings, messages and authors is fully opaque
    And every text has a contrast ratio of at least 4.5 against its background

  Scenario: Assistive technology reads unrevealed content
    When I open the home page
    Then every family heading, message and author and the finale are in the accessibility tree
