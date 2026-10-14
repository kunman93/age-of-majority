# family-messages Specification

## Purpose
Shows the families on the birthday card and the messages each family sends to the birthday child, so visitors can scroll through every family's wishes.

## Requirements

### Requirement: Card shows a section per family below the intro
The home page SHALL show, below the intro, a "Birthday wishes" section headed by the heading "Birthday wishes" with the
overline "From your family" above it. Inside it, the page SHALL show one section per family in this order: "Family
Lorem", "Family Ipsum", "Family Dolor". Each family section SHALL be headed by the family name, one heading level below
"Birthday wishes".

#### Scenario: Visitor sees the birthday wishes heading
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the heading "Birthday wishes" below the intro
- **AND** the visitor sees the overline "From your family" directly above it

#### Scenario: Visitor sees all families in order
- **WHEN** a visitor opens the home page
- **THEN** the visitor sees the family headings "Family Lorem", "Family Ipsum" and "Family Dolor", in that order
- **AND** every family heading is below the heading "Birthday wishes"

#### Scenario: Families share a name
- **WHEN** two families have the same name
- **THEN** each family is shown as its own section with its own heading and messages

### Requirement: Each message shows its text and author
Each family section SHALL show all messages of that family. Each message SHALL show its text and, below it, its author. A message sent by the whole family SHALL have the family name as its author; a message sent by a family member SHALL have the member's name as its author.

#### Scenario: Family sends one message as a whole family
- **WHEN** a visitor reads the "Family Lorem" section
- **THEN** the visitor sees exactly one message, signed by "Family Lorem"

#### Scenario: Family members send individual messages
- **WHEN** a visitor reads the "Family Ipsum" section
- **THEN** the visitor sees exactly two messages, signed by "Anna Ipsum" and "Ben Ipsum"

#### Scenario: Family sends both a family message and a member message
- **WHEN** a visitor reads the "Family Dolor" section
- **THEN** the visitor sees exactly two messages, signed by "Family Dolor" and "Clara Dolor"

### Requirement: Messages are Lorem ipsum placeholders stored in the repo
Every message text SHALL be Lorem ipsum placeholder text, and all families and messages SHALL be stored in the repository.

#### Scenario: Message texts are placeholders
- **WHEN** a visitor reads any message
- **THEN** its text is Lorem ipsum placeholder text

### Requirement: Families are reached by plain scrolling
All family sections SHALL be part of the normal page flow and reachable by plain scrolling, without scroll snapping or smooth scrolling. When the visitor prefers reduced motion, every message SHALL be visible as soon as it is scrolled into view, without animation. Otherwise every message SHALL reveal while it scrolls into view and SHALL be fully visible once it is in the upper half of the viewport, as described by the `content-choreography` capability.

#### Scenario: Visitor scrolls to the last family
- **WHEN** a visitor scrolls the "Family Dolor" section to the top of the viewport
- **THEN** the "Family Dolor" heading and its messages are visible

#### Scenario: Visitor who prefers reduced motion scrolls to the last family
- **WHEN** a visitor who prefers reduced motion scrolls until the "Family Dolor" heading just enters the viewport
- **THEN** the "Family Dolor" heading is fully visible
