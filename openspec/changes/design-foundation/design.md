# Design

## Context

`src/index.css` only imports Tailwind. `App.tsx` and `FamilySection.tsx` render semantic markup (`main`, `section aria-labelledby`, `h1`/`h2`, `figure > blockquote + figcaption`) with a single utility class on the `h1`. Playwright runs Desktop Chrome only. The step "the heading is styled with Tailwind" pins the `h1` to 30px/700. Existing scroll scenarios assert that no element or ancestor has an animation or transition. Requirements: see `specs/visual-design/spec.md`.

## Goals / Non-Goals

**Goals:**

- One place to change the palette and typefaces, so #34–#37 reuse the same tokens.
- Prove contrast and layout in a real browser, not in jsdom, which has no CSS.

**Non-Goals:**

- A JS/TS token module or theme context. Nothing in JS reads the tokens yet.
- New components or markup changes beyond class names.
- Light mode or a theme switch.

## Decisions

### Tokens in Tailwind 4 `@theme` in `src/index.css`

| Token | Value | Use | Contrast on `night` / `plum` |
| --- | --- | --- | --- |
| `--color-night` | `#2a1215` | page background | — |
| `--color-plum` | `#3d1c20` | message card background | — |
| `--color-cream` | `#fff4e6` | body text | 16.2 / 14.0 |
| `--color-blush` | `#f4c9a8` | authors, signature | 11.5 / 9.9 |
| `--color-sun` | `#ffd166` | greeting, finale heading | 12.2 / 10.5 |
| `--color-tangerine` | `#ff9f43` | family headings | 8.6 / 7.4 |
| `--color-ember` | `#ff6b5b` | decorative accent (card border) | 6.3 / 5.4 |
| `--font-display` | `'Fraunces Variable', Georgia, serif` | all headings | |
| `--font-body` | `'Nunito Variable', system-ui, sans-serif` | everything else | |

- Colors are hex, so Chromium reports computed colors as `rgb()`, which the BDD steps parse. Tailwind's default palette is oklch; mixing them in would break the parsing.
- `@theme` over a separate tokens file: Tailwind 4 generates the utilities (`bg-night`, `text-sun`, `font-display`) from it directly.
- Base styles in `@layer base`: `html` gets `color-scheme: dark`, `bg-night`, `text-cream` and `font-body`; `h1, h2` get `font-display`. Headings get the typeface once, not per element.

### Fonts self-hosted through Fontsource variable packages

`src/main.tsx` imports `@fontsource-variable/fraunces` and `@fontsource-variable/nunito`. Vite bundles the woff2 files into the build, so they are served from the card's origin, and Fontsource's `font-display: swap` keeps text visible with the fallback font while loading.

- Over Google Fonts: a third-party request at runtime, which leaks visitor IP addresses.
- Over a system font stack: no new dependency, but no character, which the Story asks for.
- Variable packages: one file per family covers every weight, instead of one per weight.

### Mobile-first layout with Tailwind breakpoints

- `main`: `mx-auto max-w-[720px] px-5 py-12 sm:px-8 sm:py-16 lg:py-24`, sections spaced with `space-y`.
- Type scale grows by breakpoint, for example the greeting `text-4xl sm:text-5xl lg:text-6xl`, family headings `text-2xl sm:text-3xl`, body `text-base sm:text-lg` with a relaxed line height.
- Each message `figure` is a card: `bg-plum`, rounded, a left border in `ember`, padded. The author in `blush`.
- Long words (`break-words`) so a long name cannot push the page wider than a phone.
- No `transition` or `animation` utilities, so the existing static-scroll scenarios keep passing.

### Visual checks as BDD scenarios, color math as a pure helper

- `features/visual-design.feature` covers the spec scenarios. Width scenarios set the viewport per scenario (`page.setViewportSize`) instead of adding Playwright projects, so every other feature still runs once.
- Steps read `getComputedStyle` in the page. The background behind a text is the first ancestor with a non-transparent `background-color`.
- `features/support/color.ts` holds pure functions: parse `rgb()`, relative luminance and contrast ratio (WCAG 2.2), and hue. Unit tested with known values (black/white 21:1, equal colors 1:1). Vitest `include` adds `features/support/**/*.test.ts`.
- "Dark warm background": luminance below 0.05 and a hue between 0° and 60°. "Light text": luminance above 0.5. "Red, orange or yellow": hue between 0° and 60° with high saturation.
- Typeface checks compare the first family in computed `font-family`, not the whole stack.
- Third-party check: record every request on page load and assert all share the page's origin.
- The step "the heading is styled with Tailwind" and its line in `home.feature` are removed. It tested a utility class, not behavior, and the new scenarios cover styling.
- Over a contrast library such as axe-core: one more dependency for a check that is a few lines of math.

## Risks / Trade-offs

- [Dark backgrounds make long text more tiring] → Generous body size, line height and a 720px maximum column.
- [Fonts add about 100 KB of woff2] → Variable fonts, and Fontsource's `unicode-range` subsets mean the browser only downloads the subsets the text uses. `swap` keeps text visible during load.
- [Hue and luminance thresholds in tests are heuristics] → They encode the spec's "dark, warm" and "red, orange or yellow" wording. The contrast check, which matters most, is exact.
- [Computed colors could come back in another format if tokens change to oklch] → The parser fails loudly on anything that is not `rgb()`/`rgba()`.
