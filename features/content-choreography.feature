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

  Scenario: Visitor scrolls away from the opening and back
    When I open the home page
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
