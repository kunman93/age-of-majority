Feature: Home page

  Scenario: Visitor sees the birthday greeting
    When I open the home page
    Then I see the heading "Happy Age of Majority!"
    And the heading is styled with Tailwind
