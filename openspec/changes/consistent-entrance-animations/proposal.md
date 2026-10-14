# Proposal

## Why

The card's entrances are inconsistent (#52). The greeting only fades in, the "Birthday wishes" heading and its overline do
not move at all, the family headings rise linearly, the finale rises as one block, and the message cards of the lower
families are in place before their own family heading appears. The opening and the 17-18-key showcase also look empty:
about four screens with only text or a lone particle object. The card should feel polished and consistent from start to
finish, in the style of the owner's portfolio (kunman93/portfolio).

## What Changes

- Every heading below the opening ("Birthday wishes" with its overline, family headings and finale heading) uses the
  same entrance: it drops in from above while it fades in, with one shared distance and easing, following the scroll
  position with a smooth catch-up, as in the portfolio.
- The greeting keeps a fade-in on load without moving, but much slower (about 2.5 s instead of 0.8 s), and the
  typewriter starts after it. This deliberately exempts the greeting from the shared drop.
- The finale's message, signature and cake fade in with the scroll, with the same smooth catch-up, after the finale
  heading.
- The message cards reveal per family: each family's cards slide in sideways from alternating sides, with a bounce,
  right after their family heading, instead of all cards on one board-wide timeline.
- All motion values (distances, easings, catch-up, trigger positions) live in one shared motion config instead of
  being repeated inline.
- New decorative ornaments (inline SVG sparkles, stars and confetti in the accent colors) fill the side margins of the
  opening and the showcase. They drift slightly with the scroll, are hidden from assistive technology, never catch
  pointer input and stay still with reduced motion.
- The UI/UX audit of all screens and its findings are listed in the PR.
- **BREAKING** (behavior): scrolled reveals now settle shortly after the scroll stops instead of matching the scroll
  position exactly.

## Capabilities

### New Capabilities

- `ornaments`: decorative SVG ornaments in the margins of the opening and the showcase, their motion and their
  accessibility.

### Modified Capabilities

- `content-choreography`: one shared entrance for every heading below the opening, per-family card reveals, finale
  content fade, smooth catch-up of scrolled reveals, and a slower greeting fade.

## Impact

- Code: `src/choreography/useChoreography.ts` (rewritten around a shared motion config), a new
  `src/choreography/motion.ts`, `src/App.tsx` and `src/FamilySection.tsx` (reveal markers), a new ornaments component
  used by the opening and `src/story/Showcase.tsx`.
- Tests: BDD steps in `features/steps/content-choreography.steps.ts` that check reveals must poll for the settled state;
  the
  greeting fade timing is checked by polling. New unit and BDD tests for the
  ornaments.
- No new dependencies.
