# Design

## Context

The agent cannot run `/model` itself. It can only read its own model from the environment information and choose the model of the subagents it starts. A custom agent can pin its model in its frontmatter (`.github/agents/reviewer.agent.md` pins Opus 5.5). A skill cannot. Research (step 3) is a conversation with the dev, and subagents cannot talk to the dev directly.

## Goals / Non-Goals

**Goals:**

- Research and planning keep a direct conversation between the dev and Opus.
- A step never runs on the wrong main session model without the dev noticing.

**Non-Goals:**

- Automating `/model` switches. The agent cannot do that.

## Decisions

### Dev switches the main session model for steps 3 and 4

Steps 0-2 run on Sonnet. Before step 3, the agent asks the dev to switch to Opus 5.5 and stops. Steps 3 and 4 run in the main session on Opus. Before step 5, the agent asks the dev to switch back to Sonnet 5.5 and stops. That makes at least two `/model` switches per Story, plus two per round of requested plan changes.

Alternative considered: a Sonnet main session with a custom `planner` agent pinned to Opus that runs steps 3 and 4 as a multi-turn subagent, with questions and answers relayed verbatim. Rejected for now. It adds a relay hop and some Sonnet tokens per turn, Sonnet might paraphrase or batch questions, and Opus has to re-read the context. The dev preferred research quality over saving two switches.

### Dev approves the plan before implementation

Step 5 (Approve plan) asks the dev to review the change proposal and waits for explicit approval before step 6 starts. It runs on Sonnet, since waiting for approval needs no planning. If the dev requests changes, the workflow returns to step 4, where Opus revises the change with `openspec-update-change` (`/opsx-update`), and the gate asks the dev to switch to Opus again. The new step shifts Implement through Merge to 6-10.

### Per-step model gate replaces the one-time check

Every step names its model, and step 0 states the rule: before starting a step, check the main session model. If it does not match, or cannot be determined, tell the dev which model to pick with `/model` and stop. The dev resumes the workflow after switching. The gate only covers the main session. Subagent models are fixed by frontmatter (`reviewer`) or by the `model` argument (the step 9 escalation).

A loop back to step 6 (from review findings in step 7 or 8, or from CI failures) stays on Sonnet. A loop back to step 7 runs the `reviewer` subagent. Neither needs a switch.

### Step 6 (Implement) runs in the main session

Once the main session is on Sonnet, delegating to a Sonnet subagent saves nothing and loses the conversation context. The subagent delegation and its main-session fallback are removed.

### Tiered conflict escalation in step 9

When `git rebase origin/main` stops on conflicts:

1. Sonnet (the main session) resolves a conflict itself only if it is **trivial**: a textual overlap where both sides' intent is clear and can be combined, for example adjacent edits, list or import ordering, or lockfile regeneration.
2. If Sonnet is unsure whether a conflict is trivial, it starts a `general-purpose` subagent with model `claude-opus-5.5`. The prompt gives the conflicted files, the commit being replayed, the change name, and the trivial/non-trivial definitions. Opus either resolves the conflict, or makes no edits and reports it as non-trivial.
3. A **non-trivial** conflict touches logic, behavior or specs, or one side must win. The agent asks the dev how to resolve it. This definition overrides the trivial examples, so Sonnet checks it first.

A subagent fits tier 2 because no conversation with the dev is needed. The rest of step 9 stays as it is (the autosquash-conflict abort, the re-review and re-approval after conflicts).

## Risks / Trade-offs

- [The dev forgets to switch back to Sonnet before step 5] → The gate stops the agent before step 5 until the main session runs on Sonnet.
- [Sonnet judges a non-trivial conflict as trivial] → The definition errs toward escalation ("unsure" goes to Opus). After any conflict, step 9 already requires a review (step 7, on Opus) and the dev's re-approval.
- [At least two manual switches per Story] → Accepted. The relay agent stays an option if the switches become a burden.
