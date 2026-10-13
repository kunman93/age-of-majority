# Design

## Context

`src/App.tsx` renders a single `<main>` with the `h1` greeting and the intro `<p>`. There is no data layer and no component besides `App`. Two existing BDD steps locate elements without a name (`page.getByRole('heading')` in "the heading is styled with Tailwind" and `page.getByRole('paragraph')` in "the intro is below the heading"). Once the page has more headings and paragraphs, Playwright's strict mode makes those steps fail. Requirements: see `specs/family-messages/spec.md`.

## Goals / Non-Goals

**Goals:**

- Adding a family or a message is a data-only change.
- Keep the data pure and separate from rendering (functional core, imperative shell).

**Non-Goals:**

- Styling beyond the existing defaults (#33), loading data at runtime (#3).

## Decisions

### Typed TypeScript module for the data

`src/families.ts` exports the types `Message = { author: string; text: string }` and `Family = { name: string; messages: readonly Message[] }`, plus `families: readonly Family[]`.

- Over JSON: TypeScript type-checks every entry at build time with no extra config or runtime validation. When #3 brings a backend, only the data source is replaced, not the types.

### One message shape, author always required

A whole-family message uses the family name as `author`, and a member message uses the member's name. This needs no optional field and no fallback branch in the renderer (the user chose option A over an optional author).

### `FamilySection` component, `App` maps over the data

`src/FamilySection.tsx` renders one `Family`:

```
<section aria-labelledby={id}>
  <h2 id={id}>{name}</h2>
  for each message:
    <figure>
      <blockquote><p>{text}</p></blockquote>
      <figcaption>{author}</figcaption>
    </figure>
</section>
```

`App` renders `families.map(f => <FamilySection key={f.name} family={f} />)` after the intro.

- `figure` + `blockquote` + `figcaption` is the standard HTML pattern for a quote with its attribution, and gives the text-then-author order the spec requires.
- `aria-labelledby` turns each section into a named region, which tests and screen readers can find by family name. The id is derived from the name, for example `family-lorem`.
- The component takes a `Family` prop instead of reading the module, so its tests use their own data. That proves any family renders, not only the three placeholders.
- Message keys use the list index. The list is static and never reorders.

### Placeholder texts start with "Lorem ipsum"

This makes the "Lorem ipsum placeholder" requirement checkable with a simple unit test over the data. Placeholder members: Anna Ipsum, Ben Ipsum and Clara Dolor.

### Plain scrolling needs no code

Sections are in normal document flow. No scroll library, `scroll-behavior` or snap CSS is added.

### Make the ambiguous BDD steps specific

The Tailwind step targets the `h1` by its name. The intro step locates the intro by its text instead of `getByRole('paragraph')`.

## Risks / Trade-offs

- [Family names are used as React keys and section ids, so duplicates would clash] → Names are unique by nature, and a data unit test asserts uniqueness.
- [Placeholder data ships to production until real messages exist] → Intended by the Story. Real content is a later data-only change.
