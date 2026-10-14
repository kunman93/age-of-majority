# Spec Delta

## Purpose

Tells the birthday card's story while the visitor scrolls: in a showcase between the opening and the families, a bright
object morphs from "17" to "18" and finally a key. Visitors without the 3D background see the same three stages as
still illustrations.

## ADDED Requirements

### Requirement: Showcase sits between the opening and the families
The card SHALL have a decorative showcase directly after the opening and before the first family. It SHALL be hidden
from assistive technology and SHALL contain no text.

#### Scenario: Visitor scrolls past the opening
- **WHEN** a visitor opens the home page
- **THEN** the showcase follows the opening and comes before the first family
- **AND** the showcase is hidden from assistive technology

### Requirement: Story object morphs through three stages in the showcase
While the 3D background is shown, the showcase SHALL stay in the viewport while the visitor scrolls through it, and a
glowing story object, centered in the viewport, SHALL morph through three stages in this order: the number "17", the
number "18" and a key. Each stage SHALL hold still for a stretch of scrolling before the object blends continuously
into the next. The stage SHALL depend only on the scroll position. After the key, the families SHALL scroll into the
viewport.

#### Scenario: Visitor scrolls through the showcase
- **WHEN** a visitor with the 3D background scrolls to the start of the showcase
- **THEN** the showcase fills the viewport
- **AND** the story object shows "17"
- **WHEN** the visitor keeps scrolling through the showcase
- **THEN** the showcase still fills the viewport
- **AND** the story object shows "18", then the key
- **WHEN** the visitor scrolls past the showcase
- **THEN** the first family scrolls into the viewport

#### Scenario: Each stage holds
- **WHEN** a visitor with the 3D background scrolls a short distance while the story object shows a stage
- **THEN** the story object still shows that stage

#### Scenario: Object blends between stages
- **WHEN** a visitor with the 3D background stops scrolling halfway between "17" and "18"
- **THEN** the story object is between "17" and "18"
- **AND** the story object stops changing its stage

### Requirement: Scrolling up plays the morph in reverse
When the visitor scrolls back up through the showcase, the story object SHALL morph back through the same stages in
reverse order, showing at every scroll position the same stage it showed there on the way down.

#### Scenario: Visitor scrolls back up through the showcase
- **WHEN** a visitor with the 3D background scrolls to the end of the showcase
- **THEN** the story object shows the key
- **WHEN** the visitor scrolls back up through the showcase
- **THEN** the story object shows "18", then "17"

### Requirement: Story object is clearly visible and stays inside the showcase
While the showcase fills the viewport, the story object SHALL be clearly visible at every stage: its brightest point
SHALL have a contrast ratio of at least 3:1, as defined for non-text content by WCAG 2.2, against the page background
color. The story object SHALL be drawn only inside the showcase and SHALL scroll in and out of the viewport with it,
so it is never drawn behind the opening, the families or the finale.

#### Scenario: Visitor sees the object clearly at every stage
- **WHEN** a visitor with the 3D background scrolls the showcase to "17", "18" and the key
- **THEN** at each of them the brightest pixel of the story object has a contrast ratio of at least 3:1 against the page background color

#### Scenario: Visitor reads the opening and the families without the object
- **WHEN** a visitor with the 3D background has seen the story object in the showcase
- **AND** the visitor scrolls the opening, the first family or the finale to the middle of the screen
- **THEN** the story object is not drawn over that section

### Requirement: Story object resources are released
When the story object is removed from the page, it SHALL release the GPU resources it created: its geometry, material
and rendering context. It SHALL then no longer react to scrolling.

#### Scenario: Story object is removed
- **WHEN** the story object is removed from the page
- **THEN** its geometry and material are disposed
- **AND** it no longer reacts to scrolling

#### Scenario: Visitor turns on reduced motion in the showcase
- **WHEN** a visitor with the 3D background turns on reduced motion
- **THEN** the story object's canvas is removed and its rendering context is released

### Requirement: Static stages replace the morph
When the static background is shown, because the visitor prefers reduced motion, the browser does not support WebGL or
the 3D background or the story object fails to load, the showcase SHALL show the three stages as still illustrations in order: "17", "18"
and the key. The showcase SHALL then take only the height of the illustrations and SHALL NOT stay in the viewport
while scrolling. The illustrations SHALL be decorative and SHALL NOT move. With the 3D background, they SHALL NOT be
shown.

#### Scenario: Visitor who prefers reduced motion sees the static stages
- **WHEN** a visitor who prefers reduced motion opens the home page
- **THEN** the showcase shows the "17", "18" and key illustrations in this order
- **AND** the illustrations are hidden from assistive technology
- **AND** no illustration has an animation or a transition
- **AND** the showcase is no taller than the viewport

#### Scenario: Visitor without WebGL sees the static stages
- **WHEN** a visitor whose browser does not support WebGL opens the home page
- **THEN** the showcase shows the three stage illustrations

#### Scenario: 3D background fails to load
- **WHEN** a visitor whose browser supports WebGL opens the home page
- **AND** the 3D background fails to load
- **THEN** the showcase shows the three stage illustrations

#### Scenario: Story object fails to load
- **WHEN** a visitor whose browser supports WebGL opens the home page
- **AND** the story object fails to load
- **THEN** the showcase shows the three stage illustrations

#### Scenario: Visitor with the 3D background sees no static stages
- **WHEN** a visitor with the 3D background opens the home page
- **THEN** no stage illustration is shown

#### Scenario: Visitor turns on reduced motion while the card is open
- **WHEN** a visitor with the 3D background turns on reduced motion
- **THEN** the showcase shows the three stage illustrations
