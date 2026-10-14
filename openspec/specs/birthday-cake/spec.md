# birthday-cake Specification

## Purpose
Ends the birthday card with a celebration: a birthday cake below the finale whose candles the visitor blows out with a
tap, a click or the keyboard, followed by confetti where motion is allowed.

## Requirements

### Requirement: Cake with 18 lit candles ends the card
The card SHALL show a birthday cake with 18 lit candles directly below the finale's signature, as the last thing on
the card. The cake SHALL be one button whose visible label is the hint "Tap the cake to blow out the candles". The
cake's picture SHALL be decorative and hidden from assistive technology.

#### Scenario: Visitor scrolls to the cake
- **WHEN** a visitor scrolls to the end of the page
- **THEN** the visitor sees a cake with 18 lit candles below the finale's signature
- **AND** nothing follows the cake on the card
- **AND** a button named "Tap the cake to blow out the candles" contains the cake

#### Scenario: Assistive technology reads the cake
- **WHEN** a visitor using assistive technology reaches the cake
- **THEN** it announces the button "Tap the cake to blow out the candles"
- **AND** the cake's picture is hidden from assistive technology

### Requirement: Visitor blows out the candles
Activating the cake button with a tap, a click, Enter or Space SHALL blow out all 18 candles. The hint SHALL then read
"Make a wish!". The cake SHALL stay blown out: the button SHALL report itself as disabled, SHALL keep keyboard focus
and SHALL ignore further activation until the cake resets.

#### Scenario: Visitor taps the cake
- **WHEN** a visitor taps or clicks the cake
- **THEN** all 18 candles go out
- **AND** the hint reads "Make a wish!"

#### Scenario: Keyboard user blows out the candles
- **WHEN** a keyboard user moves the focus to the cake with Tab
- **THEN** the cake button shows a visible focus indicator
- **WHEN** the user presses Enter
- **THEN** all 18 candles go out
- **AND** the cake button still has the focus

#### Scenario: Keyboard user blows out the candles with Space
- **WHEN** a keyboard user focuses the cake and presses Space
- **THEN** all 18 candles go out

#### Scenario: Visitor taps the blown-out cake again
- **WHEN** a visitor has blown out the candles
- **AND** taps the cake again
- **THEN** the candles stay out
- **AND** the cake button is reported as disabled

### Requirement: Confetti follows the blown-out candles
While the 3D background is shown, the flames SHALL go out first and confetti SHALL then burst from the cake once. The
confetti SHALL stay inside the cake's area, SHALL never cover any text and SHALL be gone within a few seconds.

#### Scenario: Visitor with the 3D background blows out the candles
- **WHEN** a visitor with the 3D background taps the cake
- **THEN** the flames go out
- **AND** confetti plays inside the cake's area
- **AND** the confetti is gone after a few seconds

### Requirement: Scrolling back up resets the cake
When the visitor scrolls back up until the whole cake is below the viewport, the cake SHALL reset: all 18 candles SHALL
be lit again, any confetti SHALL be gone, the hint SHALL read "Tap the cake to blow out the candles" and the button
SHALL accept activation again. This SHALL hold with the 3D cake and the static cake.

#### Scenario: Visitor scrolls up and back down
- **WHEN** a visitor has blown out the candles
- **AND** scrolls back up until the cake is below the viewport
- **AND** scrolls back down to the cake
- **THEN** all 18 candles are lit
- **AND** the hint reads "Tap the cake to blow out the candles"
- **AND** tapping the cake blows the candles out again

#### Scenario: Visitor scrolls up only a little
- **WHEN** a visitor has blown out the candles
- **AND** scrolls up while part of the cake stays in the viewport
- **THEN** the candles stay out

### Requirement: 3D cake with the 3D background
While the 3D background is shown, the cake SHALL be a 3D cake with candles whose flames flicker, drawn in its own
canvas inside the cake button. The canvas SHALL scroll with the page and SHALL NOT catch pointer input itself. No
static cake illustration SHALL be shown.

#### Scenario: Visitor with the 3D background sees the 3D cake
- **WHEN** a visitor with the 3D background scrolls to the cake
- **THEN** the cake is drawn in a canvas inside the cake button
- **AND** the canvas is hidden from assistive technology
- **AND** no static cake illustration is shown

### Requirement: Static cake replaces the 3D cake
When the static background is shown, because the visitor prefers reduced motion, the browser does not support WebGL or
a 3D part of the card fails to load, the cake SHALL be a still illustration with 18 lit candles. Blowing them out SHALL
show unlit candles at once, without confetti, animation or transition.

#### Scenario: Visitor who prefers reduced motion blows out the candles
- **WHEN** a visitor who prefers reduced motion scrolls to the cake
- **THEN** the cake is a still illustration with 18 lit candles
- **WHEN** the visitor taps the cake
- **THEN** the illustration shows 18 unlit candles at once
- **AND** no element of the cake has an animation or a transition
- **AND** no confetti is shown

#### Scenario: Visitor without WebGL sees the static cake
- **WHEN** a visitor whose browser does not support WebGL scrolls to the cake
- **THEN** the cake is a still illustration with 18 lit candles

#### Scenario: 3D cake fails to load
- **WHEN** a visitor whose browser supports WebGL opens the home page
- **AND** the 3D cake fails to load
- **THEN** the cake is a still illustration with 18 lit candles

#### Scenario: Visitor turns on reduced motion after blowing out the candles
- **WHEN** a visitor with the 3D background has blown out the candles
- **AND** turns on reduced motion
- **THEN** the cake is a still illustration with 18 unlit candles

### Requirement: 3D cake is loaded lazily
The card SHALL show its content without waiting for the 3D cake. The 3D cake SHALL be loaded separately and SHALL NOT
be downloaded at all when the static cake is shown.

#### Scenario: Visitor with reduced motion does not download the 3D cake
- **WHEN** a visitor who prefers reduced motion scrolls to the cake
- **THEN** the page makes no request for the 3D cake

### Requirement: 3D cake rendering is limited
The 3D cake's canvas SHALL render at most 2 device pixels per CSS pixel. It SHALL render only while the cake is in the
viewport and the page is visible, and SHALL resume when both hold again.

#### Scenario: Visitor on a high-density screen
- **WHEN** a visitor with the 3D background and a device pixel ratio of 3 scrolls to the cake
- **THEN** the cake's canvas has at most 2 device pixels per CSS pixel in width and height

#### Scenario: Cake scrolls out of view
- **WHEN** a visitor with the 3D background scrolls the cake out of the viewport
- **THEN** the cake stops rendering
- **AND** it renders again once the cake is back in the viewport

#### Scenario: Visitor switches to another tab
- **WHEN** the page with the 3D cake in the viewport becomes hidden
- **THEN** the cake stops rendering
- **AND** it renders again once the page is visible

### Requirement: 3D cake resources are released
When the 3D cake is removed from the page, it SHALL release the GPU resources it created: its geometries, materials
and rendering context.

#### Scenario: 3D cake is removed
- **WHEN** the 3D cake is removed from the page
- **THEN** every geometry and material of the cake, the flames and the confetti is disposed

#### Scenario: Visitor turns on reduced motion at the cake
- **WHEN** a visitor with the 3D background turns on reduced motion
- **THEN** the cake's canvas is removed and its rendering context is released

### Requirement: Visitor turns the 3D cake by dragging
With the 3D background, dragging horizontally on the cake SHALL turn the cake around its vertical axis and SHALL keep
turning it briefly after release. A press that moves less than 6 pixels SHALL still count as a tap, and a drag SHALL NOT
blow out the candles. A vertical swipe on a touch screen SHALL still scroll the page.

#### Scenario: Visitor drags the cake
- **WHEN** a visitor with the 3D background drags horizontally across the lit cake
- **THEN** the cake turns around its vertical axis
- **AND** the candles stay lit

### Requirement: Cake invites the visitor to blow out the candles
While the cake is lit, a soft glow around the cake SHALL pulse and the hint SHALL fade in after a short delay. When the
visitor has turned on reduced motion, the glow SHALL be static and the hint SHALL be visible at once. Once the cake is
blown out the glow SHALL be gone.

#### Scenario: Visitor waits at the lit cake
- **WHEN** a visitor who allows motion looks at the lit cake
- **THEN** a glow pulses around the cake
- **AND** the hint fades in after a short delay

#### Scenario: Visitor with reduced motion looks at the lit cake
- **WHEN** a visitor with reduced motion looks at the lit cake
- **THEN** the glow does not move
- **AND** the hint is visible at once
