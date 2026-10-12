# Tasks

## 1. AGENTS.md workflow

- [x] 1.1 Replace the model sentence under `## Implementation Workflow` with the split: main session on Sonnet 5.5, steps 3 and 4 on Opus 5.5 in the main session, step 6 via the Opus-pinned `reviewer`. Name each step's model next to its heading or in its first line. Verify by reading the doc.
- [x] 1.2 Rewrite `### 0. Check model` as the per-step gate: before starting a step, check the main session model. If it does not match the step's model, or cannot be determined, tell the dev which model to pick with `/model` and stop. Verify by reading the doc.
- [x] 1.3 Rewrite `### 5. Implement` to run in the main session on Sonnet 5.5, with `/opsx-apply`, TDD and atomic commits. Remove the subagent delegation and fallback. Verify with `grep -n "subagent" AGENTS.md`, which should show no match in step 5.
- [x] 1.4 In `### 8. Archive`, replace "resolve them commit by commit as implementation work" with the tiered escalation and the trivial/non-trivial definition from design.md. Keep the rest of step 8 (post-conflict review and re-approval) intact. Verify by reading the doc.
- [x] 1.5 Run `npm run format:check`. Verify it passes, and `grep -n -i "opus\|sonnet" AGENTS.md` shows no leftover statement that the main session runs on Opus outside steps 3 and 4.

## Workflow follow-up

- Archive the change after the dev approves the PR.
