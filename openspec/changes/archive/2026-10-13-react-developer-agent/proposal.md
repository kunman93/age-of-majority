# Proposal

## Why

The birthday card should become an expressive, animated website (GSAP, three.js) in the league of the showcase sites listed in #25. Today the implementing agent has no frontend-specific guidance, relies on possibly outdated training knowledge for GSAP and three.js, and follows no stated engineering principles, so quality depends on luck.

## What Changes

- Vendor 7 of the 8 official GSAP agent skills from `greensock/gsap-skills` (MIT) unchanged into `.agents/skills/`: `gsap-core`, `gsap-react`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-performance`, `gsap-utils`. `gsap-frameworks` (Vue, Nuxt, Svelte) is left out. The upstream commit and the MIT notice are kept.
- Add the `react-ui` skill (`.agents/skills/react-ui/`): React 19, Tailwind CSS 4, accessibility, `prefers-reduced-motion`, performance, the React reading of the engineering principles, and how to apply TDD to UI, animation and WebGL work.
- Add the `threejs` skill (`.agents/skills/threejs/`): React Three Fiber + drei by default, raw three.js through refs when needed, disposal, performance, GSAP integration, and the official `llms.txt` of three.js and React Three Fiber as the sources to fetch before writing 3D code.
- Add the custom agent `.github/agents/react-developer.agent.md`, pinned to Sonnet 5.5: a thin persona with a quality bar (the reference sites from #25), which loads the skills above and follows `AGENTS.md`.
- `AGENTS.md`:
  - New `## Engineering Principles` section for every implementing agent (main session or custom agent), replacing `## Coding Style`: KISS and YAGNI win ties (simplest solution, deletion over addition, boring over clever); follow existing conventions; Clean Code (including the former comment rule), DRY (rule of three), immutability, fail fast, pragmatic SOLID, composition over inheritance, Law of Demeter, design patterns only for a problem already present, separation of concerns with a functional core and dependencies pointing inward (full Onion/Hexagonal layering only with real adapters), TDD and proving behavior with executable validation, Boy Scout rule limited to touched code, minimal dependencies, secure by default (including the former no-secrets rule).
  - `## Working Style` keeps only collaboration rules. Its four engineering bullets (simplest solution/YAGNI/deletion, boring over clever, follow existing conventions, prove behavior with executable validation) move into Engineering Principles.
  - Story Workflow step 6 (Implement): for UI, animation or 3D work, load `react-ui`, the `gsap-*` skills and `threejs`. The `react-developer` agent is available as a subagent on request. Bug fix and chore workflows inherit this through their reference to step 6.

Out of scope:

- Installing `gsap`, `@gsap/react`, `three`, `@react-three/fiber` or `@react-three/drei`. The first Story that needs them installs them as the skills describe.
- Delegating step 6 to the `react-developer` subagent (option B in research). Revisit if the main session ignores the skills.
- Any change to the app itself.

## Capabilities

### New Capabilities

None. This changes contributor tooling and workflow docs only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New: `.agents/skills/gsap-{core,react,timeline,scrolltrigger,plugins,performance,utils}/`, `.agents/skills/react-ui/`, `.agents/skills/threejs/`, `.github/agents/react-developer.agent.md`.
- Changed: `AGENTS.md`.
- No runtime dependencies, app code, tests or CI change.
