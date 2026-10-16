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
The repository SHALL store only Lorem ipsum placeholder families and messages. The production build SHALL show the
families and messages from the git-ignored local wishes file when it exists, and the placeholders otherwise. The dev
server and all tests SHALL always show the placeholders, whether or not the local wishes file exists. Every other
scenario of this capability that names the placeholder families describes that placeholder data.

#### Scenario: Message texts are placeholders
- **WHEN** a visitor reads any message on the dev server
- **THEN** its text is Lorem ipsum placeholder text

#### Scenario: Production build shows the real wishes
- **WHEN** the card is built for production with the local wishes file present
- **AND** a visitor opens the built card
- **THEN** the visitor sees the families and messages from the local wishes file, in the file's order

#### Scenario: Production build without real wishes shows the placeholders
- **WHEN** the card is built for production without the local wishes file
- **AND** a visitor opens the built card
- **THEN** the visitor sees the placeholder families "Family Lorem", "Family Ipsum" and "Family Dolor"

#### Scenario: Tests ignore the real wishes
- **WHEN** the local wishes file exists and the unit or BDD tests run
- **THEN** the tests see only the placeholder families and messages

### Requirement: Families are reached by plain scrolling
All family sections SHALL be part of the normal page flow and reachable by plain scrolling, without scroll snapping or smooth scrolling. When the visitor prefers reduced motion, every message SHALL be visible as soon as it is scrolled into view, without animation. Otherwise every message SHALL reveal while it scrolls into view and SHALL be fully visible once it is in the upper half of the viewport, as described by the `content-choreography` capability.

#### Scenario: Visitor scrolls to the last family
- **WHEN** a visitor scrolls the "Family Dolor" section to the top of the viewport
- **THEN** the "Family Dolor" heading and its messages are visible

#### Scenario: Visitor who prefers reduced motion scrolls to the last family
- **WHEN** a visitor who prefers reduced motion scrolls until the "Family Dolor" heading just enters the viewport
- **THEN** the "Family Dolor" heading is fully visible
