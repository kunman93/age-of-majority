Feature: Finale

  Scenario: Visitor reads the finale
    Given the visitor prefers reduced motion
    When I open the home page
    Then I see the finale "Here's to you, Sara!" with the message "Eighteen years of you, and the best is still ahead. Whatever you choose next, your family is cheering you on. Happy birthday!" and the signature "With love, your family"
    And the finale is below the family "Family Dolor"

  Scenario: Visitor scrolls to the finale
    Given the visitor prefers reduced motion
    And a short browser window
    When I open the home page
    Then the finale is not in view
    When I scroll to the finale
    Then the finale heading, message and signature are visible

  Scenario: Visitor who prefers reduced motion scrolls to the finale
    Given the visitor prefers reduced motion
    When I open the home page
    And I scroll until the finale heading just enters the viewport
    Then the finale heading is fully visible without moving
