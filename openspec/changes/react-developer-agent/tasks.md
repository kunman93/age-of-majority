# Tasks

## 1. Vendored GSAP skills

- [ ] 1.1 Copy `skills/<name>/SKILL.md` and the root `LICENSE` from `greensock/gsap-skills` at commit `aed9cfd3277740755f6bfc1155c7aa645403b760` into `.agents/skills/<name>/SKILL.md` and `.agents/skills/<name>/LICENSE` for `gsap-core`, `gsap-react`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-performance`, `gsap-utils`. Verify byte equality for all 14 files against `gh api "repos/greensock/gsap-skills/contents/<path>?ref=<commit>" --jq .content | base64 -d`, and that `.agents/skills/gsap-frameworks` does not exist.
- [ ] 1.2 Add `.agents/skills/VENDORED.md` with the source repository, the pinned commit, the 7 vendored skills, the skipped `gsap-frameworks` and why, and the update procedure (re-copy at a new commit, re-run the byte comparison from 1.1). Verify by reading it and checking that the commit in it matches the one used in 1.1.

## 2. Own skills

- [ ] 2.1 Create `.agents/skills/react-ui/SKILL.md` with `name` and a trigger-rich `description` frontmatter and the contents listed in design.md "`react-ui` skill" (stack facts, React reading of the engineering principles, non-negotiables, TDD for UI, animation and WebGL, routing to `gsap-*` and `threejs`). Verify the frontmatter parses (`name` equals the directory name, `description` non-empty) and each design bullet maps to a section.
- [ ] 2.2 Create `.agents/skills/threejs/SKILL.md` with `name` and a trigger-rich `description` frontmatter and the contents listed in design.md "`threejs` skill" (fetch the official `llms.txt` first, R3F + drei default with raw three.js through refs, the rules, GSAP with R3F, installation). Verify the frontmatter parses as in 2.1 and that both `llms.txt` URLs return HTTP 200 with `curl -sfI`.

## 3. React Developer agent

- [ ] 3.1 Create `.github/agents/react-developer.agent.md` with frontmatter `name: react-developer`, a `description`, `model: Claude Sonnet 5.5`, `tools: ["read", "edit", "search", "execute", "web"]`, and the body from design.md "`react-developer` agent" (persona, follows `AGENTS.md` incl. Engineering Principles, loads `react-ui`/`gsap-*`/`threejs`, quality bar with every reference site from #25 as inspiration only, verifies with the step 2 commands). Verify the frontmatter mirrors the field names of `.github/agents/reviewer.agent.md`, every reference URL from #25 is listed, and the body does not restate skill content.
- [ ] 3.2 Smoke-test the agent: start it as a `react-developer` subagent with a read-only prompt asking it to name the skills it would load for "add a scroll-triggered 3D intro" and the model it runs on. Verify it names `react-ui`, `gsap-scrolltrigger` (or another `gsap-*`) and `threejs`, and can read `.agents/skills/threejs/SKILL.md`. If the `tools` list blocks skill loading, adjust `tools` and repeat.

## 4. AGENTS.md

- [ ] 4.1 Replace `## Coding Style` with `## Engineering Principles` and move the four engineering bullets out of `## Working Style`, as in the table in design.md "`## Engineering Principles` in `AGENTS.md`": the priority rule (KISS and YAGNI win ties, simplest solution, deletion over addition, boring over clever; apply a principle only when it makes code simpler to change, test or read, explainable in one sentence), then the code, design, architecture and quality groups from proposal.md, with Onion/Hexagonal reduced to functional core with inward dependencies, and a note that language-specific readings live in skills. Verify that `## Coding Style` is gone, `grep -rn "Coding Style" --include=*.md . | grep -v node_modules | grep -v openspec/changes` finds nothing, each of the six rules in the table appears exactly once in `AGENTS.md`, `## Working Style` keeps only the five collaboration bullets, and the section contains no React-specific content.
- [ ] 4.2 In Story Workflow `#### 6. Implement`, add the bullet: for UI, animation or 3D work, load `react-ui`, the relevant `gsap-*` skills and `threejs`, and follow `## Engineering Principles`; the `react-developer` agent is available as a subagent on request. Verify the Bug Fix and Chore Workflows still reach it through "Step 6: as in the Story Workflow" without edits.

## 5. Integration check

- [ ] 5.1 Run `npm run build`, `npm test`, `npm run test:bdd`, `npm run lint` and `npm run format:check`; all must pass. Verify `git diff --stat origin/main...HEAD` touches only `.agents/skills/`, `.github/agents/react-developer.agent.md`, `AGENTS.md` and `openspec/changes/react-developer-agent/`.

## Workflow follow-up

- Archive the change after the dev approves the PR.
