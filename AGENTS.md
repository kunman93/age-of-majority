# Coding Agent Instructions

Read the [README.md](README.md) to understand what the repo is about.

---

## Working Style

- Address the user as "Wannabe Unicorn".
- Prefer the simplest solution that meets the acceptance criteria. Apply YAGNI. Prefer deletion over addition.
- Be direct, concise, and honest. Call out bad ideas plainly.
- Choose boring over clever.
- Follow the conventions already present in the code over introducing new ones.
- Prove behavior with executable validation before declaring work done.
- If something's unclear, ask the user instead of guessing. Never assume.
- Ask for permission before modifying anything outside the repository.

---

## Git Workflow

All work happens on feature branches. `main` is read-only: inspect it, but never commit to it, rebase it, or modify it in any way.

### Feature branches

- Name branches `feature/<branch-name-based-on-issue>` (use `fix/<...>` for bug fixes, `chore/<...>` for maintenance).
- Commit with the `.agents/skills/git-commit` skill. Make atomic commits: one logical change per commit.
- Pushing the feature branch is allowed.
- Rewrite and force push your own feature branch only as described in steps 8–10, always with
  `git push --force-with-lease --force-if-includes`. These steps are the explicit request for `git reset --hard` and
  force pushes that the `git-commit` skill requires.
- Delete a feature branch only after its PR has been merged (see [10. Merge](#10-merge)).

**Never**:

- Push to, rebase, or rewrite `main`
- Force push with plain `--force`
- Force push outside [9. Archive](#9-archive) and [10. Merge](#10-merge)

---

## Coding Style

- Do not add comments to config/source files that merely restate what's already
  obvious from the element or identifier name. Only comment when it conveys
  non-obvious rationale or context.
- Never introduce secrets, tokens, or credentials into the repository.

---

## Implementation Workflow

The user names the Story to work on and moves its card on the project board.
The main session runs on Sonnet 5.5, except steps 3 and 4, which always run on Opus 5.5 in the main session.
Step 7 runs the `reviewer` subagent, which is pinned to Opus 5.5 in its agent file.

### 0. Check model

- Before starting a step, check the main session model reported in your environment information against the model named in the step.
- If it does not match, or if you cannot tell, tell the user which model to pick with `/model` and stop.
- The check covers the main session only; subagent models are set by their agent file or the `model` argument.

### 1. Create feature branch

Runs on Sonnet 5.5.

- Fetch `main` from origin.
- Create a feature branch based on `origin/main`, following the naming conventions in [Feature branches](#feature-branches).

### 2. Verify clean state

Runs on Sonnet 5.5. Before starting with the research, verify you have a clean state:

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm test` (unit) and `npm run test:bdd` (BDD)
- Lint/format: `npm run lint` and `npm run format:check`

### 3. Research

Runs on Opus 5.5.

- Research the issue provided as a prompt with the `openspec-explore` skill (`/opsx-explore`).

### 4. Plan

Runs on Opus 5.5.

- Create a change proposal with the `openspec-propose` skill (`/opsx-propose`).
- Commit the proposal.

### 5. Approve plan

Runs on Sonnet 5.5.

- Ask the user to review the change proposal (the change's artifacts in `openspec/changes/<change>/`) and wait for their explicit approval in the conversation.
- If the user requests changes, return to [4. Plan](#4-plan) and revise the proposal with the `openspec-update-change` skill (`/opsx-update`). Step 4 runs on Opus 5.5, so the model check applies.
- Only after approval, continue with step 6 (Implement).

### 6. Implement

Runs on Sonnet 5.5 in the main session.

- Implement the tasks from the change with the `openspec-apply-change` skill (`/opsx-apply`), applying TDD, and make atomic commits with the `.agents/skills/git-commit` skill.
- When done, verify the work with the commands from [2. Verify clean state](#2-verify-clean-state).

### 7. Review

Runs on Sonnet 5.5. The review itself runs in the `reviewer` subagent, which is pinned to Opus 5.5.

Once the implementation is complete, have the reviewer agent
([.github/agents/reviewer.agent.md](.github/agents/reviewer.agent.md)) review the feature branch.
Run it as the custom `reviewer` subagent, not as a general-purpose or code-review agent.

If there are any MAJOR findings, return to [6. Implement](#6-implement) and fix them,
then run the review again. Repeat until the reviewer approves without any MAJOR findings.

### 8. Create PR

Runs on Sonnet 5.5.

- Before the first push, clean up the history into atomic commits:
  1. Create a backup: `git branch -f backup/<branch>` (`-f` so a stale backup never blocks).
  2. Rewrite the history, for example by squashing fixups and rewording.
  3. Verify the content is unchanged: `git diff backup/<branch> HEAD` must be empty.
     If it is not, run `git reset --hard backup/<branch>` and retry.
  4. Delete the backup: `git branch -D backup/<branch>`.
- Push the feature branch and create a PR targeting `main`.
- After the first push, do not rewrite the history during review. Fix CI failures and review findings with
  `git commit --fixup=<sha>` commits targeting the commit they belong to, and push them normally, so the user can
  review incremental changes. They are squashed in [9. Archive](#9-archive). Never reword `fixup!` subjects (autosquash
  matches on them). A finding that is a new logical change, not belonging to an existing commit, gets a normal atomic
  commit with the `git-commit` skill instead.
- Wait for CI with `gh pr checks <n> --watch`. Right after a push it may report "no checks reported" before the run
  registers; wait briefly and retry, it is not a failure. If `ci` fails, get the run id from
  `gh run list --branch <branch> --limit 1` (or the link printed by `gh pr checks`), read the log with
  `gh run view <run-id> --log-failed`,
  return to [6. Implement](#6-implement) and fix it with fixup commits. Do the same after pushing fixes for review findings.
- When the user reports the PR review is done, read the findings:
  - Review summaries and PR comments: `gh pr view <n> --json reviews,comments`.
  - Inline review threads (skip those with `isResolved: true`; if `hasNextPage` is true, tell the user that some threads were not read):

    ```bash
    gh api graphql -F owner='{owner}' -F repo='{repo}' -F n=<n> -f query='
      query($owner: String!, $repo: String!, $n: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $n) {
            reviewThreads(first: 100) {
              pageInfo { hasNextPage }
              nodes { isResolved path line comments(first: 50) { nodes { body } } }
            }
          }
        }
      }'
    ```

- If there are findings, return to [6. Implement](#6-implement), fix them with fixup commits, review again, and push.
  Then tell the user and wait for their next review report. Do not archive until the user approves.

### 9. Archive

Runs on Sonnet 5.5.

- Wait for the user's explicit approval of the PR in the conversation. GitHub does not allow approving your own PR, so this is the approval.
- Finalize the history:
  1. Create a backup: `git branch -f backup/<branch>` (`-f` so a stale backup never blocks).
  2. Squash the fixups: `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash $(git merge-base HEAD origin/main)`.
     If it stops on a conflict, run `git rebase --abort` and `git reset --hard backup/<branch>`, and ask the user how to
     proceed. Otherwise verify `git diff backup/<branch> HEAD` is empty. If it is not, run
     `git reset --hard backup/<branch>` and ask the user how to proceed. Keep the backup until the user decides;
     delete it if finalizing is abandoned.
  3. Run `git fetch origin main` and `git rebase origin/main`. If it stops on conflicts, resolve them commit by commit
     and continue with `git rebase --continue`:
     - A conflict is non-trivial if it touches logic, behavior or specs, or if one side must win. This overrides the
       trivial examples below. Ask the user how to resolve it.
     - Otherwise it is trivial if it is a textual overlap where both sides' intent is clear and can be combined (for
       example adjacent edits, list or import ordering, lockfile regeneration). Resolve it yourself.
     - If you are unsure whether it is trivial, start a `general-purpose` subagent with model `claude-opus-5.5`. Give
       it the conflicted files, the commit being replayed, the change name, and these two definitions. It either
       resolves the conflict, or makes no edits and reports it as non-trivial, in which case ask the user.

     If `main` brought in changes, run the commands from [2. Verify clean state](#2-verify-clean-state) and tell the user. If there were conflicts, also run
     [7. Review](#7-review), push with `git push --force-with-lease --force-if-includes`, tell the user, and wait for
     their re-approval before continuing.
- Archive the completed change on the feature branch with the `openspec-archive-change` skill (`/opsx-archive`), commit,
  push with `git push --force-with-lease --force-if-includes`, and wait for `ci` with `gh pr checks <n> --watch`.
  If `ci` fails, fix it with fixup commits ([6. Implement](#6-implement)), push them normally, finalize the history
  again, push with lease, and wait for `ci`.
- Delete the backup only once `ci` is green: `git branch -D backup/<branch>`.

### 10. Merge

Runs on Sonnet 5.5.

- Only when `ci` is green and the user has approved, merge the PR with a merge commit and delete the feature branch:
  `gh pr merge --merge --delete-branch`. Then run `git fetch --prune` to remove the stale remote-tracking branch.
- If GitHub refuses because `main` moved since step 9, finalize the history again as in [9. Archive](#9-archive) (this
  includes running the step 2 checks), push with lease, wait for `ci` (handle failures as in step 9), delete the backup once `ci` is green, and tell the
  user.
- Never merge without the user's approval.

---

## Documentation

- Use progressive disclosure. Start with the smallest relevant doc set.
- Follow the markdown conventions as stated in the [Markdown Guide](https://www.markdownguide.org/).
- Do not create a `.md` file that merely restates or describes an existing
  config/source file. The original file is the documentation; only add prose docs
  when they convey information not already evident from the file itself.
