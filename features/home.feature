Feature: Home page

  Scenario: Visitor sees the birthday greeting
    When I open the home page
    Then I see the heading "Happy 18th Birthday, Sara!"

  Scenario: Visitor reads the intro
    When I open the home page
    Then I see the intro "Today you come of age. This card gathers wishes from your family, near and far, to celebrate you and everything ahead of you. Scroll on and read what they have to say."
    And the intro is below the heading
