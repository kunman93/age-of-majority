Feature: Visual design

  Scenario: Visitor sees the warm look
    When I open the home page
    Then the page background is dark and warm
    And the intro, the messages and the finale message are light
    And the greeting, the family headings and the finale heading are red, orange or yellow

  Scenario: Visitor sees consistent typefaces
    When I open the home page
    Then all headings use the same typeface
    And all other text uses one typeface that differs from the headings

  Scenario: Visitor opens the card without third-party requests
    Given I record the requests the page makes
    When I open the home page
    Then the page loaded fonts
    And every request goes to the card's own origin

  Scenario Outline: Visitor reads the card on a <device>
    Given a <width>px wide window
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
    When I open the home page
    Then every text has a contrast ratio of at least 4.5 against its background
