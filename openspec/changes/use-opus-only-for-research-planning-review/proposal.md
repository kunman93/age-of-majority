# Proposal

## Why

The implementation workflow in `AGENTS.md` runs almost everything on Opus 5.5, even mechanical steps like git, CI and archiving. Only research, planning and review need Opus. Moving everything else to Sonnet 5.5 uses fewer AI credits (#13).

## What Changes

- Replace the model rule in `AGENTS.md`: the main session runs on Sonnet 5.5, except steps 3 (Research) and 4 (Plan), which always run on Opus 5.5 in the main session.
- Turn `### 0. Check model` into a per-step gate: every step names its model. Before starting a step, the agent checks the main session model. If it is wrong, or the agent cannot tell, it tells the dev which model to pick with `/model` and stops. The dev switches to Opus before step 3 and back to Sonnet before step 5.
- Add `### 5. Approve plan` on Sonnet 5.5: the agent asks the dev to review the change proposal and waits for approval before implementing. If the dev requests changes, the workflow returns to step 4. Implement, Review, Create PR, Archive and Merge are renumbered to 6-10.
- `### 6. Implement` runs directly in the main session on Sonnet 5.5. The delegation to a Sonnet subagent and its main-session fallback are removed.
- `### 7. Review` keeps running the `reviewer` agent, which is pinned to Opus 5.5.
- `### 9. Archive`: rebase conflicts with `origin/main` are escalated in tiers. Sonnet resolves trivial conflicts. If it is unsure, a `general-purpose` subagent on Opus 5.5 takes over. If Opus judges a conflict non-trivial, the agent asks the dev. `AGENTS.md` defines trivial and non-trivial conflicts.

Out of scope:

- A custom Opus agent that runs research and planning as a subagent, with questions relayed through the Sonnet main session. The dev chose manual `/model` switching for now, so that research stays a direct conversation with Opus.

## Capabilities

### New Capabilities

None. This changes contributor workflow docs only, so the change sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `AGENTS.md` (Implementation Workflow section).
