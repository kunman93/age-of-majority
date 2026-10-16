# ornaments Specification

## Purpose
Frames the otherwise empty side margins of the opening and the showcase with elegant botanical compositions, so the
first screens of the card do not look empty, without hurting readability, accessibility or the layout.

## Requirements

### Requirement: Opening and showcase are decorated with ornaments
The opening and the showcase SHALL each be decorated with an elegant botanical composition drawn without images: a
few large pieces (gold stems with leaves and buds, watercolor-style blossoms with soft gradients and fine gold dust) in
the card's palette, framing the content from the left and right side margins. The ornaments SHALL be shown with and
without the 3D background and with and without reduced motion.

#### Scenario: Visitor sees ornaments in the opening
- **WHEN** a visitor opens the home page
- **THEN** ornaments are shown in the first screen
- **AND** no ornament is an image

#### Scenario: Visitor sees ornaments next to the showcase
- **WHEN** a visitor scrolls to the showcase
- **THEN** ornaments are shown in the viewport next to the showcase

#### Scenario: Visitor sees different compositions in the opening and the showcase
- **WHEN** a visitor scrolls from the opening to the showcase
- **THEN** the showcase shows a different ornament composition than the opening

#### Scenario: Visitor without the 3D background sees ornaments
- **WHEN** a visitor whose browser does not support WebGL opens the home page
- **THEN** ornaments are shown in the first screen

### Requirement: Ornaments are decorative only
The ornaments SHALL be hidden from assistive technology, SHALL NOT catch pointer input and SHALL NOT cover the
greeting or the intro. They SHALL NOT change the layout of the card: the opening SHALL stay centered as before and the
page SHALL NOT scroll horizontally because of them.

#### Scenario: Assistive technology ignores the ornaments
- **WHEN** a visitor opens the home page
- **THEN** no ornament is in the accessibility tree

#### Scenario: Ornaments leave the text and layout alone
- **WHEN** a visitor opens the home page in a phone (390 by 844) or desktop (1920 by 1080) window
- **THEN** no ornament overlaps the greeting or the intro
- **AND** the page does not scroll horizontally

### Requirement: Ornaments drift with the scroll
When the visitor does not prefer reduced motion, the ornaments SHALL drift slightly vertically while the visitor scrolls,
each layer (stems, blossoms, dust) at its own rate, depending only on the scroll position, and SHALL drift back when
the visitor scrolls back up.
With reduced motion, the ornaments SHALL stay still.

#### Scenario: Visitor scrolls past the ornaments
- **WHEN** a visitor who does not prefer reduced motion scrolls down a little from the top of the page
- **THEN** at least one ornament has moved relative to the greeting

#### Scenario: Visitor who prefers reduced motion scrolls past the ornaments
- **WHEN** a visitor who prefers reduced motion scrolls down a little from the top of the page
- **THEN** no ornament has moved relative to the greeting
