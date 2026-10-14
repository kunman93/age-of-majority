---
name: react-ui
description: 'Build or change UI in this repo: React components, hooks, Tailwind styling, layout, interaction, accessibility and animation. Use for any frontend work, including animated or 3D landing-page style sites. Routes to the gsap-* skills for animation and to threejs for 3D.'
---

# React UI

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4. Tests: Vitest + Testing Library (units and components), Playwright-BDD (user-visible behavior). Follow the existing structure in `src/` and `features/` before introducing a new one.

## Principles, read for React

`AGENTS.md` "Engineering Principles" apply. In React that means:

- **SRP**: a component renders one thing, a custom hook owns one concern.
- **Functional core**: logic that is not about rendering lives in plain TypeScript modules without React imports, so it is unit-testable.
- **DIP**: pass dependencies (data, callbacks) through props, or through context when many levels need them. Components do not import I/O directly.
- **Composition over configuration**: prefer `children` and compound components to props that switch behavior. Do not add a boolean prop for a second use case you do not have yet.
- **State**: derive instead of storing, keep it as local as possible, no `useEffect` to sync state that can be computed during render.

## Non-negotiables

- Semantic HTML first (`button`, `a`, `nav`, headings in order). Everything interactive works by keyboard and has a visible focus style.
- Text contrast meets WCAG AA. Images have `alt`, or `alt=""` when decorative.
- Every animation respects `prefers-reduced-motion`. With GSAP use `gsap.matchMedia()` and give the reduced branch no or minimal motion.
- Animate `transform` and `opacity`. Never animate layout properties (`width`, `top`, `margin`).
- Clean up everything created in effects (listeners, observers, GSAP, WebGL) on unmount.
- Lazy-load heavy code and assets (`React.lazy`, dynamic `import()`, code-split 3D scenes) so the first paint stays fast.

## TDD for UI

- Components: Vitest + Testing Library. Query like a user (`getByRole`, `getByText`), assert what the user sees or can do, not implementation details.
- Every new test must pass the three checks under "Quality level" in `AGENTS.md` (mutation check, observable outcome, repeat runs). Do not test that a prop is forwarded or a mock was called.
- User-visible outcomes: a Gherkin scenario in `features/` through Playwright-BDD.
- Animation: assert the end state, with reduced motion enabled to make it deterministic. Do not assert intermediate frames. jsdom has no `window.matchMedia`; `src/test-setup.ts` stubs it globally with `matches: false` (no reduced motion), which the background tests rely on. Override the stub per test with `matches: true` for `(prefers-reduced-motion: reduce)` before testing code that uses `gsap.matchMedia()`. In Playwright use `test.use({ reducedMotion: 'reduce' })` or `page.emulateMedia({ reducedMotion: 'reduce' })`. Do not mock GSAP away.
- WebGL does not render in jsdom. Unit-test the pure logic around a scene. Cover the canvas itself through Playwright, which runs Chromium with WebGL.

## Choosing other skills

- Any animation, scroll effect or timeline: the `gsap-*` skills (`gsap-react` first, `gsap-scrolltrigger` for scroll).
- Anything 3D or WebGL: the `threejs` skill.
