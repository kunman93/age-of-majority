# Design

## Context

See proposal.md for the motivation. Today all content motion lives in `src/choreography/useChoreography.ts`, inside one
`gsap.matchMedia('(prefers-reduced-motion: no-preference)')` block: a load timeline (greeting fade + typewriter), a
scrubbed opening fade-out, one scrubbed fade-and-rise per `[data-reveal]` element and one board-wide card timeline.
Values (`scrub: 0.5`, `y: 40`, `x: 100`, `back.inOut(3)`, `0.15`) are written inline. The cake's hint uses a CSS keyframe
and the card hover a CSS transition.

The reference is kunman93/portfolio's `GsapAnimationService`: section titles (overline and title together) animate
`from { opacity: 0, y: -100, ease: 'power2.inOut' }` with `scrub: 4`, and cards slide `x: ±100` with
`ease: 'back.inOut(3-4)'` and `scrub: 4`, all from one shared service. Its title trigger uses `end: 'top 100%'`, the
same as the default start, so the reveal is a jump in progress smoothed by the 4 s scrub. It feels time-based but
stays scroll-linked.

### UI/UX audit (to be listed in the PR)

| # | Screen / element | Today | Fix |
|---|---|---|---|
| 1 | Greeting h1 | fade, 0.8 s on load, feels abrupt | slower fade, 2.5 s, no drop (deliberate exemption) |
| 2 | "From your family" + "Birthday wishes" | no entrance at all | shared heading drop, both together |
| 3 | Family headings | fade + rise 40 px from below, linear, scrub 0.5 | shared heading drop |
| 4 | Finale | whole section rises as one block, heading has no own entrance | heading drops, body fades after it |
| 5 | Message cards | one board timeline: lower families' cards are in place before their heading | per-family timeline after its heading |
| 6 | Message cards | `back.inOut(3)` with scrub 0.5 jerks the card backwards on every scroll tick | same ease, smoothed by scrub 4 |
| 7 | Motion values | inline literals in several places | one shared motion config |
| 8 | Opening + showcase | ~4 screens with only text or the particle object | sparkles, stars, confetti ornaments |
| 9 | Cake hint | CSS keyframe, 1 s ease-out, 2.5 s delay | kept: an interaction invitation, not an entrance |
| 10 | Card hover swing | CSS 300 ms overshoot | kept: an interaction, not an entrance |

## Goals / Non-Goals

**Goals:**

- One heading entrance, defined once, used for all four heading kinds.
- Every motion value in one module, `src/choreography/motion.ts`.
- Ornaments with no layout impact and no accessibility footprint.

**Non-Goals:**

- No change to the typewriter, the scroll-morph 3D object, the background, the cake or the card hover.
- No new animation library or plugin.

## Decisions

### 1. Shared motion config in `src/choreography/motion.ts`

A plain module exporting frozen objects: `HEADING` (`{ y: -100, ease: 'power2.inOut' }`), `CARD`
(`{ x: 100, ease: 'back.inOut(3)', stagger: 0.15 }`), `SCRUB = 4`, `GREETING_FADE = 2.5`, `OPENING_FADE_SCRUB = 0.5`,
`ORNAMENT_DRIFT` and the trigger factory `scrubbedReveal(trigger)`. `useChoreography` and the ornament drift read only
from it. *Alternative*: Tailwind theme tokens. Rejected: the values feed GSAP, not CSS.

### 2. Scroll-scrubbed with `scrub: 4`, real scroll range

Headings, finale body and cards use `start: 'top bottom'`, `end: 'clamp(top 60%)'` (cards: `clamp(top 50%)`) and
`scrub: 4`. This keeps the portfolio's smooth catch-up, but the range is real, not degenerate, so the reveal still
follows the scroll and reverses on scroll-up. *Alternative*: the portfolio's `end: 'top 100%'`. Rejected: a zero-length
range makes the "partly revealed" state impossible to observe and is effectively a toggle.

The greeting is exempt from the drop at the user's request: it keeps its opacity-only `from` tween at the start of the
load timeline, now over `GREETING_FADE` (2.5 s) with `power2.inOut`, and the typewriter still follows it. A fade does
not move the greeting, so the "Opening stays in place" check stays as it is.

### 3. Reveal markers

- `data-reveal="heading"`: the overline + "Birthday wishes" wrapper, each family `h3` and the finale `h2`.
- `data-reveal="fade"`: the finale's message, signature and cake button. Opacity only, triggered by the finale heading.
- `data-reveal="card"`: unchanged on each card wrapper (GSAP must not touch the tilted `figure`).
- `data-cards` on each family's card row: the trigger of that family's card timeline.

The finale `section` loses `data-reveal` and gets `data-finale` so the layout BDD step can still find its column.

### 4. Per-family card timeline

For each `[data-cards]` row, one timeline scrubbed on that row with the shared range. Cards alternate sides by their
global index, as today, so the alternation runs across families. The heading is above its row, so its trigger fires
first and finishes earlier (`top 60%` of a higher element), which guarantees "cards not before their heading" without
coupling the two timelines. Opacity keeps its own linear tween so the bounce never flickers the text.

### 5. Ornaments as one data-driven component

`src/ornaments/ornamentLayout.ts` holds pure data: per placement (`opening`, `showcase`) a list of
`{ kind: 'sparkle' | 'star' | 'confetti', left, top, size, color, drift }` with `left`/`top` as percentages.
`src/ornaments/Ornaments.tsx` renders an `aria-hidden`, `pointer-events-none`, `absolute inset-0` layer of inline
SVGs, each with `data-ornament` and `data-drift`. The opening header gets `relative` and an `<Ornaments placement="opening" />`.
The showcase renders `<Ornaments placement="showcase" />` inside its sticky viewport (scene mode) or around its grid
(static mode). Positions stay in the outer bands (top/bottom 15% and the side margins) so the centered text and the
story object stay clear. On `short` windows the opening ornaments are hidden, since there is no free band there.

The drift lives in `useChoreography` under the same reduced-motion guard: for each `[data-ornament]`, a scrubbed
`y` tween of `data-drift` pixels over the page scroll of its container. *Alternative*: CSS `animation-timeline: scroll()`.
Rejected: not supported in Firefox and outside the GSAP reduced-motion revert.

The ornaments sit in `main`, which already has `overflow-x-clip`, so they cannot cause horizontal scrolling.

## Risks / Trade-offs

- [Scrub 4 lags up to ~4 s behind the scroll] → BDD reveal steps poll; `SETTLE_TIMEOUT_MS` grows from 5000 to a named
  10000. No fixed waits.
- [The slower greeting fade delays the typewriter by ~1.7 s] → BDD typing steps already poll for the intro state;
  check their timeouts still cover 2.5 s plus typing.
- [Positioned ornaments paint above in-flow text] → they are placed only in free bands, and a BDD scenario checks for no
  overlap with the greeting and intro at phone and desktop sizes.
- [Existing unit tests assert wiring and magic numbers (`0.15` stagger, "one board timeline")] → delete the ones for
  removed behavior. Replace them with behavior tests: at reveal progress 0 a heading is above its final place and
  transparent, at progress 1 it is in place and opaque, and with reduced motion nothing has inline styles.
- [Ornaments in the sticky showcase overlap the 3D object on a phone] → bands only at the top/bottom of the sticky viewport.
