Feature: Deployment

  Scenario: Search engines are told to stay away from the card
    When I open the home page
    Then the page tells search engines not to index it or follow its links

  Scenario: The card does not reveal its link to other sites
    When I open the home page
    Then the page sends no referrer to other sites
