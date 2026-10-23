# Coding Agent Instructions

Read the [README.md](README.md) to understand what the repo is about.

---

## Working Style

- Address the user as "Wannabe Unicorn".
- Be direct, concise, and honest. Call out bad ideas plainly.
- If something's unclear, ask the user instead of guessing. Never assume.
- Prefix every message that needs the user's action or decision with 🙋, and use 🙋 for nothing else.
- Each subagent named here prefixes every message it sends with its emoji: 🔍 for `reviewer`, ⚛️ for `react-developer`.
- Ask for permission before modifying anything outside the repository.

---

## Commands

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm test` (unit) and `npm run test:bdd` (BDD)
- Lint/format: `npm run lint` and `npm run format:check`

---

## Git Workflow

All work happens on feature branches. `main` is read-only: inspect it, but never commit to it, rebase it, or modify it in any way.

### Feature branches

- Name branches `feature/<branch-name-based-on-issue>` (use `fix/<...>` for bug fixes, `chore/<...>` for maintenance).
- Commit with the `.agents/skills/git-commit` skill. Make atomic commits: one logical change per commit.
- Pushing the feature branch is allowed.
- Rewrite and force push your own feature branch only in the Create PR, Finalize history and Merge procedures of the
  `finish-work` skill, always with `git push --force-with-lease --force-if-includes`. That skill is the explicit
  request for `git reset --hard` and force pushes that the `git-commit` skill requires.
- Delete a feature branch only after its PR has been merged (see the Merge section of the `finish-work` skill).

**Never**:

- Push to, rebase, or rewrite `main`
- Force push with plain `--force`
- Force push outside the `finish-work` procedures named above

---

## Engineering Principles

Apply to everyone who writes code or config here: the main session and every custom agent.

**Priority rule:** KISS and YAGNI win ties. Prefer the simplest solution that meets the acceptance criteria, prefer deletion over addition, and choose boring over clever. Apply a principle below only when it makes the code simpler to change, test or read, and you can say how in one sentence. Otherwise leave it out: no speculative abstraction, no pattern for its own sake.

### Code level

- Follow the conventions already present in the code over introducing new ones.
- Clean Code: intention-revealing names, small focused functions, no dead code. Do not add comments to config/source files that merely restate what is already obvious from the element or identifier name. Only comment when it conveys non-obvious rationale or context.
- DRY with the rule of three: tolerate duplication until the third occurrence. The wrong abstraction costs more than duplication.
- Prefer immutability and pure functions.
- Fail fast: validate at the boundaries and never swallow errors.

### Design level

- SOLID, pragmatically. Single responsibility and dependency inversion pay off most. Apply the others when they fit.
- Composition over inheritance.
- Law of Demeter: do not reach through objects.
- Use a design pattern only for a recurring problem you already have, never pre-emptively.

### Architecture level

- Separation of concerns: functional core, imperative shell. Keep domain logic pure and free of UI, I/O and framework code. Dependencies point inward.
- Full Onion or Hexagonal layering (ports and adapters) only once there is a real backend or several adapters to justify it.

### Quality level

- TDD, and prove behavior with executable validation before declaring work done. Test behavior, not implementation, and keep the test pyramid: many unit tests, few end-to-end tests.
  Do not write tests that are fragile and bring no value: no assertions on the exact state of an animation at one
  instant (for example a blink phase or an opacity of exactly 0 or 1 mid-loop) and no fixed waits to reach a state:
  poll for it instead. A fixed window is allowed only to prove that something does not change, and must be a named
  constant. Leave the animation detail to a unit test of its config or to manual review.
  Prefer fewer tests that each catch a real regression over many that raise coverage.
  Before keeping any new test, check three things, and delete the test if one fails:
  1. It fails when the behavior it names breaks. Break the production code on purpose (flip a condition, drop a
     guard) and see it fail. A test that still passes proves nothing.
  2. It asserts an outcome a user or caller can observe, not how the code is wired: no assertions that a prop or
     object is passed through, that a mock was called, or on call counts, pixel diffs, or magic numbers.
  3. It passes every time: run it at least 10 times (for Playwright, `--repeat-each=10`) and under load. Fix the
     cause of a failure; never dismiss it as flakiness.
- Boy Scout rule, limited to code you are already touching.
- Minimal dependencies: justify every new package.
- Secure by default: never introduce secrets, tokens, or credentials into the repository, sanitize input, use least privilege.

Language- and framework-specific readings of these principles live in skills, for example `.agents/skills/react-ui`.

---

## Implementation Workflow

Load the matching skill before starting any work, and follow it:

- A Story issue: `implement-story` (`feature/` branch).
- A bug report: `fix-bug` (`fix/` branch).
- Maintenance the user explicitly asked for: `do-chore` (`chore/` branch).

Stories and bug reports are created only with the `write-story` and `write-bug-report` skills, never as free-form issues.

---

## Documentation

- Use progressive disclosure. Start with the smallest relevant doc set.
- Follow the markdown conventions as stated in the [Markdown Guide](https://www.markdownguide.org/).
- Do not create a `.md` file that merely restates or describes an existing
  config/source file. The original file is the documentation; only add prose docs
  when they convey information not already evident from the file itself.
