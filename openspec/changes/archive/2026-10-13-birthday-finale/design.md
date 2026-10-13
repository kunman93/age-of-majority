# Design

## Context

`src/App.tsx` renders the `h1` greeting, the intro and one `FamilySection` per family inside `<main>`. Each family is a `<section aria-labelledby>` with an `h2`. Two tests collect every level-2 heading and expect exactly the family names: "renders the family headings in order after the intro" in `src/App.test.tsx` and the step "I see the family headings {string} in order" in `features/steps/families.steps.ts`. Requirements: see `specs/birthday-finale/spec.md`.

## Goals / Non-Goals

**Goals:**

- Give the later cake story (#37) a clear place to attach to.

**Non-Goals:**

- A data module or component for the finale. It is one fixed block of text, used once.

## Decisions

### Inline markup in `App`, after the families

```
<section aria-labelledby={id}>
  <h2 id={id}>Here's to you, Sara!</h2>
  <p>{message}</p>
  <p>{signature}</p>
</section>
```

- A named section with an `h2` follows the family sections' pattern, keeps the heading outline flat and gives screen readers and tests a region named "Here's to you, Sara!".
- The id comes from `useId()`, as in `FamilySection`.
- Inline in `App` over a `Finale` component: KISS, and it matches how the greeting and intro are written. Extract it when #37 adds behavior.
- Over a `<footer>`: a footer suggests page meta information, not content, and its landmark meaning depends on where it sits.

### Narrow the family heading checks to family headings

The finale adds a fourth `h2`, so the two existing checks would fail. They select level-2 headings whose name starts with "Family" (`name: /^Family /`).

- Over asserting the finale in the family list: the families test would then check another capability.
- Over a wrapper around the families just for tests: adds markup with no user value.

## Risks / Trade-offs

- [The `/^Family /` filter relies on family names starting with "Family"] → True for all placeholder data, and the tests already hard-code those names. Revisit when real family names arrive.
