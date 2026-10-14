# Design

## Context

The opening is the `<header>` (h1 and intro) at the top of `<main>` in `src/App.tsx`. `<main>` is the centered
720px column with vertical padding and `space-y` gaps; the showcase follows the header directly.

## Goals / Non-Goals

**Goals:**

- Center the opening in the first screen with CSS only, fluid at every window size; no fixed heights or breakpoints for
  the centering.

**Non-Goals:**

- No animation or scroll cue for the opening.
- No change to the showcase, the family sections or the finale.

## Decisions

- **Make the header a full-screen flex column.** The header gets `min-h-svh`, `flex flex-col justify-center` and
  `text-center`. `svh` keeps the height stable while mobile browser bars show and hide. `min-h` instead of `h` lets
  the header grow on short windows instead of clipping text. Alternative: absolute or grid centering of a fixed-height
  block, which clips text on short windows.
- **Move `<main>`'s top padding into the header.** With `main`'s top padding in place, a `min-h-svh` header starts
  below the top of the window and is not vertically centered. `main` keeps its bottom padding; the header carries
  vertical padding so the text never touches the window edges on short windows.
- **Keep the header inside `<main>`.** The greeting stays part of the main landmark; the column width and the
  720px limit from `visual-design` still apply.

## Risks / Trade-offs

- [On a window shorter than the opening, the opening cannot be centered] → The header grows and the text starts at
  its top padding; the BDD scenarios use real phone, tablet, laptop and desktop window sizes where it fits.
