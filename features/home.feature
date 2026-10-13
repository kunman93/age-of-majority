Feature: Home page

  Scenario: Visitor sees the birthday greeting
    When I open the home page
    Then I see the heading "Happy 18th Birthday, Sara!"
    And the heading is styled with Tailwind
