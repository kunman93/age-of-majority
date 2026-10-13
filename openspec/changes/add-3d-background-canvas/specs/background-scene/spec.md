# Spec Delta

## Purpose

Gives the birthday card a decorative, warm background behind its content: a smooth 3D ember scene where the device supports it and a static glow where it does not, without hurting readability or performance.

## ADDED Requirements

### Requirement: Animated 3D background behind the content
The card SHALL show one 3D canvas that covers the whole viewport, stays fixed while the visitor scrolls and sits behind all content. It SHALL show dim, warm embers that drift slowly. The canvas SHALL be decorative: hidden from assistive technology and never catching pointer input.

#### Scenario: Visitor sees the 3D background
- **WHEN** a visitor whose browser supports WebGL and who does not prefer reduced motion opens the home page
- **THEN** exactly one canvas covers the whole viewport behind the content
- **AND** the canvas is hidden from assistive technology
- **AND** the canvas does not catch pointer input

#### Scenario: Background stays in place while scrolling
- **WHEN** a visitor with the 3D background scrolls to the finale
- **THEN** the canvas still covers the whole viewport

### Requirement: 3D scene is loaded lazily
The card SHALL show its content without waiting for the 3D scene. The 3D scene SHALL be loaded separately after the page starts, and SHALL NOT be downloaded at all when the static fallback is shown.

#### Scenario: Visitor with reduced motion does not download the 3D scene
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** the page makes no request for the 3D scene

#### Scenario: Visitor without WebGL does not download the 3D scene
- **WHEN** a visitor whose browser does not support WebGL opens the home page
- **THEN** the page makes no request for the 3D scene

### Requirement: Static fallback background
The card SHALL always show a static warm glow behind its content. When the browser does not support WebGL or the visitor prefers reduced motion, the glow SHALL be the whole background and no 3D canvas SHALL be shown. The glow SHALL NOT move.

#### Scenario: Visitor who prefers reduced motion sees the static background
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** no canvas is shown
- **AND** the static glow is shown behind the content

#### Scenario: Visitor without WebGL sees the static background
- **WHEN** a visitor whose browser does not support WebGL opens the home page
- **THEN** no canvas is shown
- **AND** the static glow is shown behind the content
- **AND** the greeting is shown

### Requirement: Rendering is limited to save resources
The 3D canvas SHALL render at most 2 device pixels per CSS pixel, even on screens with a higher pixel density. It SHALL stop rendering while the page is hidden, for example in a background tab, and resume when the page becomes visible again.

#### Scenario: Visitor on a high-density screen
- **WHEN** a visitor with a device pixel ratio of 3 opens the home page
- **THEN** the canvas has at most 2 device pixels per CSS pixel in width and height

#### Scenario: Visitor switches to another tab
- **WHEN** the page with the 3D background becomes hidden
- **THEN** the 3D scene stops rendering
- **AND** it renders again once the page is visible

### Requirement: Background resources are released
When the 3D background is removed from the page, it SHALL release the GPU resources it created: its geometries, materials and rendering context.

#### Scenario: Background is removed
- **WHEN** the 3D background is removed from the page
- **THEN** every geometry and material of the ember scene is disposed

### Requirement: Background keeps text readable
Every text on the card SHALL keep a contrast ratio of at least 4.5:1, as defined by WCAG 2.2 level AA, against the brightest point of the background, whether the 3D scene or the static glow is shown.

#### Scenario: Visitor reads text over the 3D background
- **WHEN** a visitor opens the home page and the 3D background is rendering
- **THEN** every text color on the card has a contrast ratio of at least 4.5:1 against the brightest pixel of the background

#### Scenario: Visitor reads text over the static glow
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** every text color on the card has a contrast ratio of at least 4.5:1 against the brightest pixel of the background
