# Spec Delta

## MODIFIED Requirements

### Requirement: Static fallback background
The card SHALL always show a static warm glow behind its content. When the browser does not support WebGL, the visitor prefers reduced motion or the 3D scene fails to load, the glow SHALL be the whole background and no 3D canvas SHALL be shown. The glow SHALL NOT move or change its shape; only its tint SHALL change with the scroll position, as described in "Glow shifts from yellow to red while scrolling".

#### Scenario: Visitor who prefers reduced motion sees the static background
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** no canvas is shown
- **AND** the static glow is shown behind the content

#### Scenario: Visitor without WebGL sees the static background
- **WHEN** a visitor whose browser does not support WebGL opens the home page
- **THEN** no canvas is shown
- **AND** the static glow is shown behind the content
- **AND** the greeting is shown

#### Scenario: 3D scene fails to load
- **WHEN** a visitor whose browser supports WebGL opens the home page
- **AND** the 3D scene fails to load
- **THEN** no canvas is shown
- **AND** the static glow is shown behind the content
- **AND** the greeting is shown

## ADDED Requirements

### Requirement: Glow shifts from yellow to red while scrolling
The glow's tint SHALL depend only on the scroll position: a dark yellow at the top of the page, a dark orange halfway
and a dark red at the end, blending continuously in between. Scrolling back up SHALL shift it back. This SHALL hold
with and without reduced motion, with the 3D background or the static glow. The embers SHALL keep their color.

#### Scenario: Visitor scrolls from the opening to the finale
- **WHEN** a visitor opens the home page
- **THEN** the glow's tint is a dark yellow
- **WHEN** the visitor scrolls halfway down the page
- **THEN** the glow's tint is a dark orange
- **WHEN** the visitor scrolls to the end of the page
- **THEN** the glow's tint is a dark red

#### Scenario: Visitor scrolls back to the top
- **WHEN** a visitor has scrolled to the end of the page
- **AND** scrolls back to the top
- **THEN** the glow's tint is the same dark yellow as on load

#### Scenario: Visitor who prefers reduced motion sees the tint shift
- **WHEN** a visitor who prefers reduced motion scrolls from the top to the end of the page
- **THEN** the glow's tint shifts from a dark yellow to a dark red

#### Scenario: Visitor reads the finale over the red glow
- **WHEN** a visitor who prefers reduced motion scrolls to the end of the page
- **THEN** every text color on the card has a contrast ratio of at least 4.5:1 against the brightest pixel of the background
