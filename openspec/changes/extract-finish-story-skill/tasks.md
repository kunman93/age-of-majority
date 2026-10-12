# Tasks

## 1. finish-story skill

- [x] 1.1 Create `.agents/skills/finish-story/SKILL.md` with frontmatter `name: finish-story` and a `description` naming steps 8–10 of the `AGENTS.md` implementation workflow. Add the Create PR section, taking over all of today's step 8 except its approval gate. Verify by reading the doc: the frontmatter `name` matches the directory, and the Copilot CLI lists `finish-story` as a project skill.
- [x] 1.2 Add the Finalize history section as the numbered procedure from design.md (backup, autosquash plus verify, rebase with tiered conflict handling plus step 2 checks plus re-review and re-approval, step-9-only archive slot, push with lease, `ci` with failure loop, delete backup). Verify that every command and failure branch of today's step 9 "Finalize the history" bullet and its archive/`ci`/backup bullets appears once in the section.
- [x] 1.3 Add the Archive and Merge sections, which reference Finalize history instead of repeating it. Merge keeps `gh pr merge --merge --delete-branch`, `git fetch --prune`, and the "`main` moved" path (finalize again without the archive slot, then tell the user). Verify with `grep -c "rebase -i --autosquash" .agents/skills/finish-story/SKILL.md`, which should print `1`.

## 2. AGENTS.md

- [ ] 2.1 Replace steps 8–10 with short entries. Each keeps its heading, "Runs on Sonnet 5.5.", a pointer to the `finish-story` skill section, and its approval gate from design.md. Verify that `grep -n "finish-story" AGENTS.md` shows a match in each of steps 8, 9 and 10, and that `grep -n "autosquash\|graphql\|log-failed" AGENTS.md` shows no match.
- [ ] 2.2 In Feature branches, make the rewrite/force-push permission name the `finish-story` skill alongside steps 8–10. Leave the **Never** list unchanged. Verify by reading the doc, check that every `](#` link in `AGENTS.md` matches a heading, and run `npm run format:check`, which should pass.
- [ ] 2.3 Check rule preservation: go through `git show origin/main:AGENTS.md` steps 8–10 rule by rule and confirm each rule appears in `AGENTS.md` or the skill. Verify by reporting the result. `wc -l AGENTS.md` should show a clear drop from 210.

## Workflow follow-up

- Archive the change after the user approves the PR.
