Feature: Families

  Scenario: Visitor sees all families in order below the intro
    When I open the home page
    Then I see the family headings "Family Lorem, Family Ipsum, Family Dolor" in order
    And the family headings are below the intro

  Scenario: Visitor reads the authors of each family
    When I open the home page
    Then the family "Family Lorem" has messages signed by "Family Lorem"
    And the family "Family Ipsum" has messages signed by "Anna Ipsum, Ben Ipsum"
    And the family "Family Dolor" has messages signed by "Family Dolor, Clara Dolor"

  Scenario: Visitor scrolls to the last family
    Given a short browser window
    When I open the home page
    Then the family "Family Dolor" is not in view
    When I scroll to the family "Family Dolor"
    Then the family "Family Dolor" and its messages are visible
    And the page scrolls without animation
