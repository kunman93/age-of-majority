Feature: Ornaments

  Scenario: Visitor sees ornaments in the opening
    When I open the home page
    Then ornaments are shown in the first screen
    And no ornament is an image

  Scenario: Visitor sees ornaments next to the showcase
    When I open the home page
    And I scroll to the showcase
    Then ornaments are shown in the viewport next to the showcase

  Scenario: Visitor sees different compositions in the opening and the showcase
    When I open the home page
    And I scroll to the showcase
    Then the showcase shows a different ornament composition than the opening

  Scenario: Visitor without the 3D background sees ornaments
    Given the browser does not support WebGL
    When I open the home page
    Then ornaments are shown in the first screen

  Scenario: Assistive technology ignores the ornaments
    When I open the home page
    Then no ornament is in the accessibility tree

  Scenario Outline: Ornaments leave the text and layout alone on a <device>
    Given a <device> window
    When I open the home page
    And the greeting and the first sentence of the intro are shown
    Then no ornament overlaps the greeting or the intro
    And the page does not scroll horizontally

    Examples:
      | device |
      | phone  |
      | tall   |

  Scenario: Visitor scrolls past the ornaments
    When I open the home page
    And I remember where the ornaments are
    And I scroll down a little
    Then at least one ornament has moved

  Scenario: Visitor who prefers reduced motion scrolls past the ornaments
    Given the visitor prefers reduced motion
    When I open the home page
    And I remember where the ornaments are
    And I scroll down a little
    Then no ornament has moved
