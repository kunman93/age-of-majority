Feature: Visual design

  Scenario: Visitor sees the warm look
    Given the visitor prefers reduced motion
    When I open the home page
    Then the page background is dark and warm
    And the intro, the messages and the finale message are light
    And the greeting, the family headings and the finale heading are red, orange or yellow

  Scenario: Visitor sees consistent typefaces
    Given the visitor prefers reduced motion
    When I open the home page
    Then the display and body fonts are loaded
    And all headings use the same typeface
    And all other text uses one typeface that differs from the headings

  Scenario: Visitor opens the card without third-party requests
    Given the visitor prefers reduced motion
    And I record the requests the page makes
    When I open the home page
    Then the page loaded fonts
    And every request goes to the card's own origin

  Scenario Outline: Visitor reads the card on a <device>
    Given the visitor prefers reduced motion
    And a <width>px wide window
    When I open the home page
    Then the page does not scroll horizontally
    And all content fits within the window width
    And the content column is centered and no wider than 720px
    And all body text is at least 16px

    Examples:
      | device  | width |
      | phone   | 375   |
      | tablet  | 768   |
      | desktop | 1280  |

  Scenario: Visitor reads every text comfortably
    Given the visitor prefers reduced motion
    When I open the home page
    Then every text has a contrast ratio of at least 4.5 against its background

  Scenario: Visitor sees a static card
    Given the visitor prefers reduced motion
    When I open the home page
    Then no element animates or transitions

  Scenario: Visitor sees scrapbook cards
    Given the visitor prefers reduced motion
    When I open the home page
    Then every message card has a tape strip at its top edge
    And consecutive message cards are tilted in opposite directions by at most 2 degrees
    And no message card contains an image

  Scenario: Visitor reads the wishes on a wide screen
    Given the visitor prefers reduced motion
    And a 1280px wide window
    When I open the home page
    Then the two "Family Ipsum" message cards are side by side, with their tops at the same height
    And the page does not scroll horizontally

  Scenario: Visitor reads the wishes on a phone
    Given the visitor prefers reduced motion
    And a 375px wide window
    When I open the home page
    Then the two "Family Ipsum" message cards are stacked vertically
    And every message card fits within the window width

  Scenario: Visitor reads a scrapbook card on a phone
    Given the visitor prefers reduced motion
    And a 375px wide window
    When I open the home page
    Then the page does not scroll horizontally
    And every message card fits within the window width
