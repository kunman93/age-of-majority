# Proposal

## Why

`AGENTS.md` is always loaded and is 229 lines long. More than half of it is the step-by-step Story, Bug Fix and Chore workflows, but only one of them applies to any task. Moving each workflow into its own skill loads only the workflow in use and keeps `AGENTS.md` small (issue #45).

## What Changes

- New project skills in `.agents/skills/`: `implement-story`, `fix-bug` and `do-chore`. Each has a trigger-focused `description` and holds one complete workflow, including the model and agent check and the model per step. Each skill is self-contained: shared steps are copied, and no workflow skill references another one. Each skill numbers its own steps.
- **BREAKING** (contributor workflow): `finish-story` is renamed `finish-work`. Its archive sub-step runs only when the branch has an unarchived OpenSpec change. It refers to workflow steps by name ("Implement", "Review") instead of by Story step number.
- `AGENTS.md` loses the Implementation Workflow steps. A short router maps the kind of work (Story, bug report, explicitly requested maintenance) to its skill.
- `AGENTS.md` gets a "Commands" section with the verify commands (install, build, unit and BDD tests, lint, format check). The workflow skills and `react-developer` point to it instead of to the removed `#2-verify-clean-state` anchor.
- `AGENTS.md` "Git Workflow" refers to `finish-work` instead of steps 8–10.
- "Working Style" in `AGENTS.md` defines an emoji per subagent: `🔍` for `reviewer`, `⚛️` for `react-developer`. The subagent prefixes every message with it.
- `reviewer.agent.md` and `react-developer.agent.md` drop references to `AGENTS.md` step numbers and anchors.
- Workflow behavior does not change: same gates, same model per step, same commands.

## Capabilities

### New Capabilities

None. This changes contributor workflow docs only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `AGENTS.md`
- `.agents/skills/implement-story/SKILL.md`, `.agents/skills/fix-bug/SKILL.md`, `.agents/skills/do-chore/SKILL.md` (new)
- `.agents/skills/finish-story/` renamed to `.agents/skills/finish-work/`
- `.github/agents/reviewer.agent.md`, `.github/agents/react-developer.agent.md`
- No app code, dependencies or CI changes. Archived changes under `openspec/changes/archive/` stay as they are (historical record).
