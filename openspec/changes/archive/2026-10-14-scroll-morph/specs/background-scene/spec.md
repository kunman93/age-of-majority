# Spec Delta

## MODIFIED Requirements

### Requirement: Static fallback background
The card SHALL always show a static warm glow behind its content. When the browser does not support WebGL, the visitor prefers reduced motion or the 3D scene fails to load, the glow SHALL be the whole background and no 3D canvas SHALL be shown. The glow SHALL NOT move.

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

### Requirement: Background keeps text readable
Every text on the card SHALL keep a contrast ratio of at least 4.5:1, as defined by WCAG 2.2 level AA, against the brightest point of the background whenever that text is in the viewport, whether the 3D scene or the static glow is shown.

#### Scenario: Visitor reads text over the 3D background
- **WHEN** a visitor opens the home page and the 3D background is rendering
- **THEN** every text color on the card has a contrast ratio of at least 4.5:1 against the brightest pixel of the background
- **AND** the embers are visible on the background

#### Scenario: Visitor reads the families over the 3D background
- **WHEN** a visitor with the 3D background scrolls to the first family and to the finale
- **THEN** at each of them every text color on the card has a contrast ratio of at least 4.5:1 against the brightest pixel of the background

#### Scenario: Visitor reads text over the static glow
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** every text color on the card has a contrast ratio of at least 4.5:1 against the brightest pixel of the background
