# Vendored skills

Skills copied unchanged from upstream. Do not edit them here. `git-commit` is also copied from upstream (github/awesome-copilot, `skills/git-commit`); it records its source in its own frontmatter `metadata`, so it is not listed in the table below.

| Skills                                                                                                       | Source                                                         | Commit                                     | License |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------ | ------- |
| `gsap-core`, `gsap-react`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-performance`, `gsap-utils` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT     |

Each vendored directory contains the upstream `LICENSE` next to its `SKILL.md`.

`gsap-frameworks` is not vendored: it covers Vue, Nuxt and Svelte, and this repo uses React. The vendored skills may still mention it.

## Updating

1. Pick a new upstream commit.
2. Re-copy `skills/<name>/SKILL.md` and the root `LICENSE` of each listed skill into `.agents/skills/<name>/`.
3. Compare every copied file with the upstream file at that commit, for example `cmp <(gh api "repos/greensock/gsap-skills/contents/skills/<name>/SKILL.md?ref=<commit>" --jq .content | base64 -d) .agents/skills/<name>/SKILL.md`.
4. Update the commit in the table above.

## Known upstream errata

- `gsap-scrolltrigger/SKILL.md`, the "fake horizontal scroll" example: `Max.max(0, window.innerWidth - scrollingEl.offsetWidth)` is a typo for `Math`, the value is pixels but is used as `xPercent`, and `Math.max(0, negative)` is always 0 so nothing would move. Do not copy it as is: use a function-based `x` (pixels) such as `() => -(scrollingEl.scrollWidth - window.innerWidth)` with `scrub: true`.
