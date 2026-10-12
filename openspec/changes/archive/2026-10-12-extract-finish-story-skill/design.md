# Design

## Context

Project skills live in `.agents/skills/<name>/SKILL.md` (see `git-commit`). The agent sees only a skill's frontmatter `name` and `description` until it invokes the skill, so the description decides when the skill gets loaded. `AGENTS.md` is always loaded. `.agents` is in `.prettierignore`, so `npm run format:check` covers `AGENTS.md` but not the skill.

## Goals / Non-Goals

**Goals:**

- Rules that must be visible at all times stay in `AGENTS.md`: the approval gates, the force-push rules, and the model per step.
- The finalize-history procedure exists once.

**Non-Goals:**

- Changing any workflow behavior or command.

## Decisions

### One skill, `finish-story`, for steps 8–10

Steps 8–10 run back to back at the end of every Story and share the finalize procedure, so one skill fits. Three skills would mean three loads and a shared procedure that has to live somewhere. "Story" is the term `AGENTS.md` already uses. The `ship-pr` alternative sounds like step 8 only, and `pr-lifecycle` is vague.

The frontmatter has only `name` and `description`. The description names steps 8–10 of the `AGENTS.md` implementation workflow (create PR, wait for CI, read review findings, finalize history, archive, merge) so that the agent loads it at that point.

### Skill sections

```
finish-story/SKILL.md
  Create PR        <- AGENTS.md step 8
  Finalize history <- used by Archive and Merge
  Archive          <- AGENTS.md step 9
  Merge            <- AGENTS.md step 10
```

The skill refers back to `AGENTS.md` steps by number and name, for example "run the checks from step 2 (Verify clean state)", "return to step 6 (Implement)" and "run step 7 (Review)". It does not copy them.

### Finalize history with an archive slot

Finalize history is a numbered procedure:

1. Backup
2. Autosquash and verify diff
3. Fetch and rebase on `origin/main`, with the tiered conflict handling, the step 2 checks, and re-review plus re-approval after conflicts
4. (Step 9 only) Archive with `openspec-archive-change` and commit
5. Push with lease
6. Wait for `ci`. On failure, add fixups, push normally, and finalize again (skipping step 4, since the change is already archived).
7. Delete the backup once `ci` is green

Step 10's re-finalize, and any re-finalize after a `ci` failure, skips step 4. This keeps today's order, where the archive happens after the rebase.

Alternative considered: archive first, then run an unconditional Finalize. Rejected. It saves one line, but the archive commit (which moves `openspec/changes/<change>`) would then be replayed by autosquash and rebase, which can conflict. An abandoned finalize would also leave the change archived.

### Step 8's pre-push cleanup stays separate

The pre-push cleanup also uses a backup and a diff check, but on a mismatch it resets and retries instead of asking the user. It also does not rebase, push with lease or wait for `ci`. It stays its own short list in the Create PR section and is not folded into Finalize history.

### What stays in AGENTS.md for steps 8–10

Each entry keeps its heading (so the existing `#9-archive` and `#10-merge` anchors still resolve), the model line, and a pointer to the `finish-story` skill section. The approval gates stay inline:

- Step 8: do not archive until the user approves.
- Step 9: wait for the user's explicit approval of the PR before finalizing.
- Step 10: merge only when `ci` is green and the user has approved, and never merge without the user's approval.

The Feature branches bullet that permits rewriting and force pushing "only as described in steps 8–10" also names the skill, so that the permission still points to where the procedure lives.

### Conflict check stays a `general-purpose` subagent

A custom agent file pinned to Opus 5.5 would remove the need for the `model` argument. But conflicts are rare and the current mechanism works (YAGNI).

## Risks / Trade-offs

- [The agent reaches step 8 without loading the skill] → Each `AGENTS.md` entry names the skill explicitly, as steps 3–7 already do for theirs.
- [A rule is lost in the move] → Before committing, check every rule in `origin/main`'s steps 8–10 and confirm it appears in `AGENTS.md` or the skill.
- [The skill is not format-checked because `.agents` is prettierignored] → Accepted. This matches `git-commit`.
