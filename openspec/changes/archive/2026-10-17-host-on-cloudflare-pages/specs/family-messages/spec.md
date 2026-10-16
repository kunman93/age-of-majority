# Spec Delta

## MODIFIED Requirements

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
