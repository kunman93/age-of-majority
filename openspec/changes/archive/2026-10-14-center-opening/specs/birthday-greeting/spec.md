# Spec Delta

## ADDED Requirements

### Requirement: Opening is centered in the first screen
On load, the greeting heading and the intro SHALL be the only content in the first screen. Together they SHALL be centered horizontally and vertically in the window, with their text centered. The rest of the card SHALL start below the first screen. This SHALL hold at every window size from phone to desktop, in portrait and landscape, as long as the window is at least as tall as the opening.

#### Scenario: Visitor opens the card on a phone, landscape phone, tablet, laptop or desktop
- **WHEN** a visitor opens the home page in a phone (390 by 844), landscape phone (667 by 375), tablet (768 by 1024), laptop (1536 by 864) or desktop (1920 by 1080) window
- **THEN** the greeting heading and the intro are centered horizontally and vertically in the window
- **AND** the text of the heading and the intro is centered
- **AND** the content after the intro starts at or below the bottom of the window
