Feature: Background scene

  Scenario: Visitor sees the 3D background
    Given I record every request the page makes
    When I open the home page
    Then exactly one canvas covers the whole viewport behind the content
    And the canvas is hidden from assistive technology
    And the canvas does not catch pointer input
    And the 3D scene was downloaded

  Scenario: Background stays in place while scrolling
    Given a short browser window
    When I open the home page
    And I scroll to the finale
    Then exactly one canvas covers the whole viewport behind the content

  Scenario: Visitor with reduced motion does not download the 3D scene
    Given the visitor prefers reduced motion
    And I record every request the page makes
    When I open the home page
    Then the greeting is shown
    And the page did not download the 3D scene

  Scenario: Visitor without WebGL does not download the 3D scene
    Given the browser does not support WebGL
    And I record every request the page makes
    When I open the home page
    Then the greeting is shown
    And the page did not download the 3D scene

  Scenario: Visitor who prefers reduced motion sees the static background
    Given the visitor prefers reduced motion
    When I open the home page
    Then no canvas is shown
    And the static glow covers the whole viewport behind the content

  Scenario: Visitor without WebGL sees the static background
    Given the browser does not support WebGL
    When I open the home page
    Then no canvas is shown
    And the static glow covers the whole viewport behind the content
    And the greeting is shown

  Scenario: 3D scene fails to load
    Given the 3D scene fails to load
    When I open the home page
    Then no canvas is shown
    And the static glow covers the whole viewport behind the content
    And the greeting is shown

  Scenario: Visitor on a high-density screen
    Given the screen has a device pixel ratio of 3
    When I open the home page
    Then the page has a device pixel ratio of 3
    And exactly one canvas covers the whole viewport behind the content
    And the canvas has at most 2 device pixels per CSS pixel

  Scenario: Visitor switches to another tab
    Given I count the draw calls of the page
    When I open the home page
    Then the 3D scene is rendering
    When the page becomes hidden
    Then the 3D scene stops rendering
    When the page becomes visible
    Then the 3D scene is rendering

  Scenario: Visitor reads text over the 3D background
    Given I count the draw calls of the page
    When I open the home page
    Then the 3D scene is rendering
    And every text has a contrast ratio of at least 4.5 against the brightest pixel of the background
    And the embers are visible on the background

  Scenario Outline: Visitor reads the "<section>" over the 3D background
    Given I count the draw calls of the page
    When I open the home page
    Then the 3D scene is rendering
    When I scroll 5 percent through the showcase
    Then the story object shows "17"
    When I scroll the "<section>" to the middle of the screen
    Then the story object is not drawn over the "<section>"
    And every text has a contrast ratio of at least 4.5 against the brightest pixel of the background

    Examples:
      | section      |
      | first family |
      | finale       |

  Scenario: Visitor turns on reduced motion while the card is open
    When I open the home page
    Then exactly one canvas covers the whole viewport behind the content
    And I keep a handle to the canvas rendering context
    When the visitor turns on reduced motion
    Then no canvas is shown
    And the held rendering context is released
    And the static glow covers the whole viewport behind the content

  Scenario: Visitor reads text over the static glow
    Given the visitor prefers reduced motion
    When I open the home page
    Then no canvas is shown
    And every text has a contrast ratio of at least 4.5 against the brightest pixel of the background
