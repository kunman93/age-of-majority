# Tasks

## 1. Color helper

- [x] 1.1 Add `features/support/**/*.test.ts` to the Vitest `include` in `vite.config.ts`, then write failing unit tests in `features/support/color.test.ts` for parsing `rgb()`/`rgba()` (and throwing on other formats), relative luminance, contrast ratio (black/white 21:1, equal colors 1:1, a known pair from design.md) and hue; verify `npm test` fails
- [x] 1.2 Implement the pure functions in `features/support/color.ts`; verify `npm test` passes

## 2. Visual design scenarios (red)

- [x] 2.1 Add `features/visual-design.feature` with the spec scenarios (warm look, consistent typefaces, no third-party requests, phone, tablet and desktop widths, legible body text, readable contrast) and steps in `features/steps/visual-design.steps.ts` as in design.md; remove the step "the heading is styled with Tailwind" from `features/home.feature` and `features/steps/home.steps.ts`; verify `npm run test:bdd` runs and the new scenarios fail for the expected reasons

## 3. Tokens and fonts

- [x] 3.1 Install `@fontsource-variable/fraunces` and `@fontsource-variable/nunito` as dependencies and import them in `src/main.tsx`; verify `npm run build` succeeds and the built `dist/assets` contains woff2 files
- [x] 3.2 Define the color and font tokens in `@theme` and the base styles (`color-scheme: dark`, page background, body text and font, heading font) in `src/index.css` as in design.md; verify the warm look, typeface and third-party scenarios pass with `npm run test:bdd`

## 4. Layout and component styling

- [x] 4.1 Style `src/App.tsx` (main column, greeting, intro, finale) and `src/FamilySection.tsx` (family heading, message cards, author) mobile first with the token utilities as in design.md, without any transition or animation; verify all scenarios in `features/visual-design.feature` and the existing features pass with `npm run test:bdd`, and `npm test` still passes

## 5. Review fixes

- [x] 5.1 Add scenarios and steps for no animation or transition anywhere, and for the loaded fonts; check the left edge in the width step; drop the synthetic italic on the signature; verify `npm run test:bdd` passes

## 6. Verification

- [x] 6.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; verify all pass
- [x] 6.2 Check the card by eye in a browser at 375px, 768px and 1280px and confirm it looks warm and polished; record any visual issue as a follow-up task before finishing
