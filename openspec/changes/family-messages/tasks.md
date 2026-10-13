# Tasks

## 1. Make existing BDD steps robust to more headings and paragraphs

- [ ] 1.1 In `features/steps/home.steps.ts`, locate the `h1` by name in "the heading is styled with Tailwind" and the intro by its text in "the intro is below the heading"; verify `npm run test:bdd` still passes

## 2. Family data

- [ ] 2.1 Add `src/families.test.ts` asserting the families are "Family Lorem", "Family Ipsum", "Family Dolor" in order, the authors per family match the spec (Lorem: Family Lorem; Ipsum: Anna Ipsum, Ben Ipsum; Dolor: Family Dolor, Clara Dolor), and every text starts with "Lorem ipsum"; verify it fails with `npm test`
- [ ] 2.2 Create `src/families.ts` with the `Message` and `Family` types and the `families` data as in design.md; verify `npm test` passes

## 3. Family section

- [ ] 3.1 Add `src/FamilySection.test.tsx` rendering a test family with two messages, asserting a region named by the family, an `h2` with the name, and each text followed by its author; also render two families with the same name and assert each region has its own label and messages; verify it fails with `npm test`
- [ ] 3.2 Create `src/FamilySection.tsx` with the `section` / `h2` / `figure` markup from design.md; verify `npm test` passes

## 4. Families on the card

- [ ] 4.1 Add a test in `src/App.test.tsx` that the family headings "Family Lorem", "Family Ipsum", "Family Dolor" are rendered in order after the intro; verify it fails with `npm test`
- [ ] 4.2 Render `families` with `FamilySection` after the intro in `src/App.tsx`; verify `npm test` passes
- [ ] 4.3 Add `features/families.feature` with scenarios for the family order below the intro, the authors in each family section, and scrolling to "Family Dolor" showing its heading and messages, plus the steps in `features/steps/families.steps.ts`; verify `npm run test:bdd` passes

## 5. Verification

- [ ] 5.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; verify all pass

## Workflow follow-up

- Archive the change after the PR is approved.
