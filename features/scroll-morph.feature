Feature: Scroll morph

  Scenario: Visitor scrolls past the opening
    When I open the home page
    Then the showcase follows the opening and comes before the first family
    And the showcase is hidden from assistive technology
    And the showcase contains no text

  Scenario: Visitor scrolls through the showcase
    When I open the home page
    And I scroll 0 percent through the showcase
    Then the showcase fills the viewport
    And the story object shows "17"
    When I scroll 50 percent through the showcase
    Then the showcase fills the viewport
    And the story object shows "18"
    When I scroll 95 percent through the showcase
    Then the showcase fills the viewport
    And the story object shows the key
    When I scroll past the showcase
    Then the first family is in the viewport

  Scenario: Each stage holds
    When I open the home page
    And I scroll 45 percent through the showcase
    Then the story object shows "18"
    When I scroll 55 percent through the showcase
    Then the story object shows "18"

  Scenario: Object blends between stages
    When I open the home page
    And I scroll 30 percent through the showcase
    Then the story object is between "17" and "18"
    And the story object stops changing its stage

  Scenario: Visitor scrolls back up through the showcase
    When I open the home page
    And I scroll 100 percent through the showcase
    Then the story object shows the key
    When I scroll 50 percent through the showcase
    Then the story object shows "18"
    When I scroll 5 percent through the showcase
    Then the story object shows "17"

  Scenario Outline: Visitor sees the object "<stage>" clearly
    Given I count the draw calls of the page
    When I open the home page
    Then the 3D scene is rendering
    When I scroll <percent> percent through the showcase
    Then the story object shows "<stage>"
    And the brightest pixel of the story object has a contrast ratio of at least 3 against the page background color
    And the story object is visible on the background

    Examples:
      | percent | stage |
      | 5       | 17    |
      | 50      | 18    |
      | 95      | key   |

  Scenario: Object changes shape between stages
    When I open the home page
    And I scroll 5 percent through the showcase
    Then the story object shows "17"
    When I remember how the center of the screen looks
    And I scroll 50 percent through the showcase
    Then the story object shows "18"
    And the center of the screen looks different from what I remembered

  Scenario Outline: Visitor reads the "<section>" without the object drawn over it
    Given I count the draw calls of the page
    When I open the home page
    And I scroll 5 percent through the showcase
    Then the story object shows "17"
    And the story object is visible on the background
    When I scroll the "<section>" to the middle of the screen
    Then the story object is not drawn over the "<section>"
    And the 3D scene is rendering

    Examples:
      | section      |
      | opening      |
      | first family |
      | finale       |

  Scenario Outline: Visitor on a <device> window sees "<stage>" in the showcase
    Given a <device> window
    When I open the home page
    And I scroll <percent> percent through the showcase
    Then the showcase fills the viewport
    And the story object shows "<stage>"

    Examples:
      | device | percent | stage |
      | phone  | 5       | 17    |
      | phone  | 50      | 18    |
      | phone  | 95      | key   |
      | laptop | 5       | 17    |
      | laptop | 50      | 18    |
      | laptop | 95      | key   |
      | tall   | 5       | 17    |
      | tall   | 50      | 18    |
      | tall   | 95      | key   |

  Scenario: Visitor who prefers reduced motion sees the static stages
    Given the visitor prefers reduced motion
    When I open the home page
    Then the showcase shows the "17", "18" and key illustrations in this order
    And the illustrations are hidden from assistive technology
    And no illustration has an animation or a transition
    And the showcase is no taller than the viewport

  Scenario: Visitor without WebGL sees the static stages
    Given the browser does not support WebGL
    When I open the home page
    Then the showcase shows the three stage illustrations

  Scenario: 3D background fails to load
    Given the 3D scene fails to load
    When I open the home page
    Then the showcase shows the three stage illustrations

  Scenario: Story object fails to load
    Given the story object fails to load
    When I open the home page
    Then the showcase shows the three stage illustrations

  Scenario: Visitor with the 3D background sees no static stages
    When I open the home page
    Then exactly one canvas covers the whole viewport behind the content
    And no stage illustration is shown

  Scenario: Visitor turns on reduced motion while the card is open
    When I open the home page
    Then exactly one canvas covers the whole viewport behind the content
    When the visitor turns on reduced motion
    Then the showcase shows the three stage illustrations

  Scenario: Visitor turns on reduced motion in the showcase
    When I open the home page
    And I scroll 50 percent through the showcase
    Then the story object shows "18"
    And I keep a handle to the story canvas rendering context
    When the visitor turns on reduced motion
    Then the story canvas is removed
    And the held rendering context is released
