# Spec Delta

## Purpose

Publishes the birthday card with the real wishes to the web under a secret link, so that the birthday child can open it
with one tap, while the real wishes and the link never enter the public repository.

## ADDED Requirements

### Requirement: Deploy publishes the production build with the real wishes
The deploy command SHALL build the card in production mode with the real wishes from the local wishes file and publish
it as the production deployment of the Cloudflare Pages project named in the local environment file.

#### Scenario: Maintainer deploys with the local wishes file and project name
- **WHEN** the maintainer, logged in to Cloudflare, runs the deploy command with the local wishes file and the project
  name present
- **THEN** the card at the secret link shows the families and wishes from the local wishes file

### Requirement: Deploy refuses to publish without valid inputs
The deploy command SHALL fail before building or uploading anything when the local wishes file or the project name is
missing or invalid, and SHALL name the problem in its error message.

#### Scenario: Maintainer deploys without the local wishes file
- **WHEN** the maintainer runs the deploy command and the local wishes file does not exist
- **THEN** the command fails with an error that names the missing file
- **AND** nothing is uploaded to Cloudflare Pages

#### Scenario: Maintainer deploys without the project name
- **WHEN** the maintainer runs the deploy command and the project name is not set
- **THEN** the command fails with an error that names the missing setting and the file it belongs in
- **AND** nothing is uploaded to Cloudflare Pages

#### Scenario: Maintainer deploys with a project name that is not secret
- **WHEN** the maintainer runs the deploy command and the project name is not `age-of-majority-` followed by 32
  hexadecimal characters
- **THEN** the command fails with an error that names the setting
- **AND** nothing is uploaded to Cloudflare Pages

#### Scenario: Maintainer deploys with a malformed wishes file
- **WHEN** the maintainer runs the deploy command and the local wishes file has no families, a family without a name
  or messages, a message without an author or text, or a Lorem ipsum placeholder text
- **THEN** the command fails with an error that says what is wrong
- **AND** nothing is uploaded to Cloudflare Pages

### Requirement: Real wishes and the secret link stay out of the repository
The local wishes file and the local environment file holding the project name SHALL be ignored by git, so that neither
the real wishes nor the secret link are ever committed to the public repository.

#### Scenario: Maintainer adds the local files
- **WHEN** the maintainer creates the local wishes file and the local environment file
- **THEN** git does not list either of them as a change to commit

### Requirement: Card is reachable only through its secret link
The card SHALL be published under a link that contains the project name `age-of-majority-` followed by 32 random
hexadecimal characters, so that the link cannot be guessed. The birthday child SHALL open the card through the link
without any login.

#### Scenario: Birthday child opens the link
- **WHEN** the birthday child opens the secret link
- **THEN** the birthday card is shown without a login

### Requirement: Card stays out of search engines
The card SHALL tell search engines not to index it and not to follow its links.

#### Scenario: Search engine visits the card
- **WHEN** a search engine crawler loads the card
- **THEN** the page tells it not to index the page and not to follow its links

### Requirement: Card does not leak its link to other sites
The card SHALL send no referrer with any request or navigation to another site, so that the secret link is not revealed
to other sites.

#### Scenario: Card requests a resource from another site
- **WHEN** the card loads a resource from or navigates to another site
- **THEN** the request carries no referrer
