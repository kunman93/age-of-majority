# Tasks

## 1. AGENTS.md workflow

- [x] 1.1 Replace the model sentence under `## Implementation Workflow` with the split: main session on Sonnet 5.5, steps 3 and 4 on Opus 5.5 in the main session, step 7 via the Opus-pinned `reviewer`. Name each step's model next to its heading or in its first line. Verify by reading the doc.
- [x] 1.2 Rewrite `### 0. Check model` as the per-step gate: before starting a step, check the main session model. If it does not match the step's model, or cannot be determined, tell the dev which model to pick with `/model` and stop. Verify by reading the doc.
- [x] 1.3 Rewrite `### 6. Implement` to run in the main session on Sonnet 5.5, with `/opsx-apply`, TDD and atomic commits. Remove the subagent delegation and fallback. Verify with `grep -n "subagent" AGENTS.md`, which should show no match in step 6.
- [x] 1.4 In `### 9. Archive`, replace "resolve them commit by commit as implementation work" with the tiered escalation and the trivial/non-trivial definition from design.md. Keep the rest of step 9 (post-conflict review and re-approval) intact. Verify by reading the doc.
- [x] 1.5 Run `npm run format:check`. Verify it passes, and `grep -n -i "opus\|sonnet" AGENTS.md` shows no leftover statement that the main session runs on Opus outside steps 3 and 4.
- [x] 1.6 Add `### 5. Approve plan` on Sonnet 5.5 (ask the dev to review the change proposal, wait for approval, return to step 4 on requested changes) and renumber Implement to Merge as 6-10, updating every step reference and anchor link. Verify that every `](#` link in `AGENTS.md` matches a heading, and `npm run format:check` passes.

## Workflow follow-up

- Archive the change after the dev approves the PR.
