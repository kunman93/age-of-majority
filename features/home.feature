Feature: Home page

  Scenario: Visitor sees the birthday greeting
    Given the visitor prefers reduced motion
    When I open the home page
    Then I see the heading "Happy 18th Birthday, Sara!"

  Scenario: Visitor reads the intro
    When I open the home page
    Then the accessible text of the intro is "Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say."
    And the intro is below the heading

  Scenario: Visitor who prefers reduced motion reads the intro at once
    Given the visitor prefers reduced motion
    When I open the home page
    Then the greeting and the full intro are shown at once

  Scenario Outline: Visitor sees the opening centered on a <device> window
    Given the visitor prefers reduced motion
    And a <device> window
    When I open the home page
    Then the heading and the intro are centered in the window
    And the text of the heading is centered
    And the text of the intro is left-aligned
    And the content after the intro starts at or below the bottom of the window

    Examples:
      | device |
      | phone  |
      | landscape |
      | tablet |
      | laptop |
      | tall   |
      | shortwide |
      | tiny |
