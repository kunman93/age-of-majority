Feature: Birthday cake

  Scenario: Visitor scrolls to the cake
    Given the visitor prefers reduced motion
    When I open the home page
    And I scroll to the end of the page
    Then I see a cake with 18 lit candles below the finale's signature
    And nothing follows the cake
    And a button named "Tap the cake to blow out the candles" contains the cake

  Scenario: Assistive technology reads the cake
    Given the visitor prefers reduced motion
    When I open the home page
    Then the button "Tap the cake to blow out the candles" is announced
    And the cake's picture is hidden from assistive technology

  Scenario: Visitor taps the cake
    Given the visitor prefers reduced motion
    When I open the home page
    And I click the cake
    Then all 18 candles are out
    And the hint reads "Make a wish!"

  Scenario: Keyboard user blows out the candles
    Given the visitor prefers reduced motion
    When I open the home page
    And I move the focus to the cake with Tab
    Then the cake button shows a focus indicator
    When I press "Enter"
    Then all 18 candles are out
    And the cake button still has the focus

  Scenario: Keyboard user blows out the candles with Space
    Given the visitor prefers reduced motion
    When I open the home page
    And I move the focus to the cake with Tab
    And I press "Space"
    Then all 18 candles are out

  Scenario: Visitor taps the blown-out cake again
    Given the visitor prefers reduced motion
    When I open the home page
    And I click the cake
    And I click the cake again
    Then all 18 candles are out
    And the cake button is reported as disabled

  Scenario: Visitor scrolls up and back down
    Given the visitor prefers reduced motion
    When I open the home page
    And I click the cake
    And I scroll up until the cake is below the viewport
    And I scroll to the end of the page
    Then all 18 candles are lit
    And the hint reads "Tap the cake to blow out the candles"
    When I click the cake
    Then all 18 candles are out

  Scenario: Visitor scrolls up only a little
    Given the visitor prefers reduced motion
    When I open the home page
    And I click the cake
    And I scroll up a little
    Then all 18 candles are out

  Scenario: Visitor who prefers reduced motion blows out the candles
    Given the visitor prefers reduced motion
    When I open the home page
    Then all 18 candles are lit
    And no cake element has an animation or a transition
    When I click the cake
    Then all 18 candles are out
    And no cake element has an animation or a transition
    And no canvas is shown

  Scenario: Visitor without WebGL sees the static cake
    Given the browser does not support WebGL
    When I open the home page
    Then all 18 candles are lit
    And no canvas is shown
