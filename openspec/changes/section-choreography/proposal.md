# Proposal

## Why

The card's content is completely static today. Only the background and the showcase move. Story #36 makes reading
the wishes feel alive. The intro types its sentences in a loop, and the sections and family cards reveal as the visitor scrolls.
The background warms from yellow through orange to red, and the story object flies in from the screen edges and back
out. Visitors who prefer reduced motion keep a fully readable, still card.

## What Changes

- **BREAKING (spec):** content may now move. The `visual-design` rule "Styling adds no motion" changes to: content
  moves only when the visitor does not prefer reduced motion. With reduced motion, the card stays fully static as
  today. Motion depends only on the reduced-motion preference, not on WebGL support or a failed 3D load.
- Opening: on load, the greeting fades in and the intro's three sentences are typed like a typewriter, one at a time
  in an endless loop (about 30 ms per character, a 2 s hold, then erased, with a red blinking cursor). The loop pauses
  while the opening is scrolled away. The full intro is available to assistive technology at all times and the space
  of the longest sentence is reserved, so the opening does not move. The intro's text is left-aligned, and the
  heading stays centered. When the visitor scrolls away, the opening
  fades out, and it fades back in when the visitor scrolls back.
- Families and finale: each family heading and the finale reveal (fade and rise) as they scroll into view. Each family
  card fades in and slides in from alternating sides with a bounce, as in the portfolio. All reveals are driven by GSAP
  ScrollTrigger with `scrub`. Scrolling up plays them in reverse. Each reveal is finished
  before the element reaches the middle of the viewport, so text is read at full contrast.
- The families are grouped under a "Birthday wishes" heading with the overline "From your family", in the style of
  the portfolio's skills section. Each family's cards sit side by side in centered, wrapping flex rows in a section
  wider than the rest of the card, and stack vertically on phones. The cards are at least 400px wide on larger
  screens. All family headings and cards sit on one cork pin board drawn in CSS.
- Family cards get a scrapbook look: paper-like notes with a slight alternating tilt, a pin at the top and a tape
  strip at a top corner. They stay text only, with no images. With motion, a note swings to the opposite tilt and lifts
  slightly on hover.
- Background: the static glow behind the content shifts its tint with the scroll position, from a dark yellow at the
  top through dark orange to dark red at the finale. The shift also runs with reduced motion because it is a color
  change, not movement. Text keeps at least 4.5:1 contrast. The embers are unchanged.
- Showcase: while the showcase scrolls into view, the story object's particles fly in from the screen edges, fading
  in, and form the "17". While it scrolls out, the key's particles fly back out to the edges, fading out. Both are
  scroll-driven and reverse on scroll-up. Plan B, only with the user's sign-off: if the particles do not look good,
  the 17 and the key fade in and out in place with soft, blurred edges.
- GSAP moves from the lazily loaded 3D chunk into the main bundle, because the content reveals also run without
  WebGL. GSAP's `TextPlugin` is part of the existing `gsap` package. No new dependency.

## Capabilities

### New Capabilities

- `content-choreography`: motion of the card's content. It covers the looping typewriter intro, the opening fade-in
  and fade-out, the scroll reveals of the families and the finale, the bouncing slide-in and hover tilt of the cards, reverse playback on scroll-up, readability during
  motion, and the reduced-motion fallback to a static card.

### Modified Capabilities

- `visual-design`: "Styling adds no motion" now applies only with reduced motion, and the motion itself is owned by
  `content-choreography`. Family cards get the scrapbook look with pin and tape, and the birthday wishes are laid out in
  wrapping rows on a cork board.
- `birthday-greeting`: the greeting and the intro are no longer shown in their final state without animation on
  load. With motion, the intro's sentences are typed one at a time in a loop. With reduced motion, the full text shows instantly.
  The intro's text is left-aligned, while the opening stays centered in the first screen.
- `family-messages`: the families are grouped under a "Birthday wishes" heading with an overline. They are still in
  the normal page flow without scroll snapping or smooth scrolling. With
  motion, a message is fully visible once it is in the upper half of the viewport rather than as soon as it enters.
- `birthday-finale`: the finale is still reachable by plain scrolling without a celebration effect, but with motion
  it reveals as it scrolls into view.
- `background-scene`: the static glow shifts from yellow through orange to red with the scroll position and is no
  longer fixed in color.
- `scroll-morph`: the story object forms from the screen edges while the showcase scrolls in and dissolves to the
  edges while it scrolls out.

## Impact

- **Code:** `src/App.tsx` (opening, birthday wishes section, finale), `src/FamilySection.tsx` (scrapbook cards, reveal targets), a new
  `src/choreography/` module (reveal and typewriter hooks, glow tint mapping), `src/background/Background.tsx` (glow
  tint), `src/background/StoryObject.tsx` and `useStoryScroll.ts` (entry and exit phases), `src/index.css` (scrapbook
  styles).
- **Dependencies:** none new. `gsap` and `@gsap/react` are now in the main bundle, which makes it about 30 kB gzip
  larger. Visitors who prefer reduced motion still download no 3D scene.
- **Tests:** unit tests for the pure tint mapping and the entry and exit mapping, and for the hooks under reduced
  motion. New BDD feature `content-choreography.feature`. In `visual-design.feature`, the "static card" scenario
  becomes reduced-motion only. The `home`, `families` and `finale` steps wait for reveals to finish. `gsap` is removed
  from the BDD `SCENE_CHUNK` pattern.
- **Out of scope:** the finale cake and celebration effect (#37), and images on the family cards.
