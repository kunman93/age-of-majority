# Design

## Context

The opening is the `<header>` (h1 and intro) at the top of `<main>` in `src/App.tsx`. `<main>` is the centered
720px column with vertical padding and `space-y` gaps; the showcase follows the header directly.

## Goals / Non-Goals

**Goals:**

- Center the opening in the first screen with CSS only, fluid at every window size; no fixed heights for the centering.

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
- **Tighten the opening's spacing on short windows only.** The header's normal padding and heading-to-intro gap make
  the opening taller than a landscape phone (667 by 375), so it cannot center there. A `short` custom variant in
  `src/index.css` (`@media (max-height: 540px)`) reduces the header's padding and gap. 540px covers
  landscape phones and any window short enough that the normal padding would not fit, and leaves common laptop windows (for example 1366 by 657) with the normal spacing. Defining the
  variant once names the intent and keeps the threshold in one place. Alternative: reduce spacing for all `sm` windows
  and restore it with a `min-height` query, which also tightens laptops that do not need it.
- **Make the intro text one step larger.** `text-xl sm:text-2xl` instead of `text-lg sm:text-xl`, as requested
  alongside the Story. The `short` spacing absorbs the extra height on landscape phones.
- **Keep the header inside `<main>`.** The greeting stays part of the main landmark; the column width and the
  720px limit from `visual-design` still apply.

## Risks / Trade-offs

- [On a window shorter than the opening, the opening cannot be centered] → The header grows and the text starts at
  its top padding; the `short` spacing pushes this limit down to windows of about 300px. The BDD scenarios use real phone, landscape
  phone, tablet, laptop and desktop window sizes.
- [Spacing on tall windows is not tested; deleting the normal spacing would still pass] → Accepted: it is purely
  visual, and the centering it serves is tested.
