# Spec Delta

## ADDED Requirements

### Requirement: Story object forms from and dissolves to the screen edges
While the 3D background is shown, the story object's particles SHALL start at the edges of the viewport, invisible,
and SHALL fly inward and fade in while the showcase scrolls into the viewport, so the "17" is fully formed once the
showcase fills it. While the showcase scrolls out, the key's particles SHALL fly back out to the edges and fade out.
Both SHALL depend only on the scroll position and reverse on scroll-up.

#### Scenario: Visitor scrolls the showcase into view
- **WHEN** a visitor with the 3D background scrolls until the top of the showcase is halfway up the viewport
- **THEN** the story object is between the screen edges and "17" and only partly visible
- **WHEN** the visitor scrolls to the start of the showcase
- **THEN** the story object shows "17"

#### Scenario: Visitor scrolls the showcase out of view
- **WHEN** a visitor with the 3D background scrolls past the end of the showcase until its bottom is halfway up the viewport
- **THEN** the story object is between the key and the screen edges and only partly visible

#### Scenario: Visitor scrolls back into the showcase from below
- **WHEN** a visitor with the 3D background has scrolled past the showcase
- **AND** scrolls back up to the end of the showcase
- **THEN** the story object shows the key

#### Scenario: Visitor scrolls back above the showcase
- **WHEN** a visitor with the 3D background has seen the "17"
- **AND** scrolls back up until the top of the showcase is halfway up the viewport
- **THEN** the story object is between "17" and the screen edges and only partly visible
