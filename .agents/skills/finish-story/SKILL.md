---
name: finish-story
description: 'Finish a Story, bug fix or chore in the AGENTS.md implementation workflow: clean up history and create the PR, wait for CI, read PR review findings, finalize history (autosquash and rebase on origin/main), archive the change (Stories only), and merge. Use when the implementation is reviewed and it is time to push, open or update the PR, archive, or merge.'
---

# Finish a Story, Bug Fix or Chore

Procedures for steps 8 (Create PR), 9 (Archive) and 10 (Merge) of the Story Workflow in `AGENTS.md`. The Bug Fix and Chore Workflows use Create PR and Merge, and run Finalize history without its archive sub-step before Merge. The approval gates stay in `AGENTS.md`. Every step runs on Sonnet 5.5, so run the model and agent check from step 0 first.

## Create PR (step 8)

Before creating the PR, clean up the history into atomic commits:

1. Create a backup: `git branch -f backup/<branch>` (`-f` so a stale backup never blocks).
2. Rewrite the history, for example by squashing fixups and rewording.
3. Verify the content is unchanged: `git diff backup/<branch> HEAD` must be empty.
   If it is not, run `git reset --hard backup/<branch>` and retry.
4. Delete the backup: `git branch -D backup/<branch>`.

Then push the feature branch and create a PR targeting `main`. If the branch was already pushed, push with
`git push --force-with-lease --force-if-includes`.

Whenever you create a PR, always give the user its URL in this form: `🔀 PR: <url>`.

After the first push, do not rewrite the history during review. Fix CI failures and review findings with
`git commit --fixup=<sha>` commits targeting the commit they belong to, and push them normally, so the user can
review incremental changes. They are squashed in [Finalize history](#finalize-history). Never reword `fixup!` subjects
(autosquash matches on them). A finding that is a new logical change, not belonging to an existing commit, gets a normal
atomic commit with the `git-commit` skill instead.

### Wait for CI

Wait with `gh pr checks <n> --watch`. Right after a push it may report "no checks reported" before the run registers;
wait briefly and retry, it is not a failure. If `ci` fails, get the run id from `gh run list --branch <branch> --limit 1`
(or the link printed by `gh pr checks`), read the log with `gh run view <run-id> --log-failed`, return to workflow step 6
(Implement) and fix it with fixup commits. Do the same after pushing fixes for review findings.

### Read review findings

When the user reports the PR review is done, read the findings:

- Review summaries and PR comments: `gh pr view <n> --json reviews,comments`.
- Inline review threads (skip those with `isResolved: true`; if `hasNextPage` is true, tell the user that some threads
  were not read):

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

If there are findings, return to step 6 (Implement), fix them with fixup commits, review again (step 7), and push. Then
tell the user and wait for their next review report. Do not archive until the user approves.

## Finalize history

Squashes the fixups and rebases the branch on `origin/main`. Archive runs it with sub-step 4; Merge, and the pre-merge finalize of bug fixes and chores, run it without sub-step 4.

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
     it the conflicted files, the commit being replayed, the change name (if any), and these two definitions. It either
     resolves the conflict, or makes no edits and reports it as non-trivial, in which case ask the user.

   If `main` brought in changes, run the commands from workflow step 2 (Verify clean state) and tell the user. If there
   were conflicts, also run workflow step 7 (Review), push with
   `git push --force-with-lease --force-if-includes`, tell the user, and wait for their re-approval before continuing.
4. (Archive only) Archive the completed change on the feature branch with the `openspec-archive-change` skill
   (`/opsx-archive`) and commit.
5. Push with `git push --force-with-lease --force-if-includes` and wait for `ci` with `gh pr checks <n> --watch`.
   If `ci` fails, fix it with fixup commits (workflow step 6, Implement), push them normally, and run this procedure
   again from sub-step 1, skipping sub-step 4 (the change is already archived).
6. Delete the backup only once `ci` is green: `git branch -D backup/<branch>`.

## Archive (step 9)

1. Wait for the user's explicit approval of the PR in the conversation. GitHub does not allow approving your own PR,
   so this is the approval.
2. Run [Finalize history](#finalize-history) including sub-step 4.

## Merge (step 10)

1. Only when `ci` is green and the user has approved, merge the PR with a merge commit and delete the feature branch:
   `gh pr merge --merge --delete-branch`. Then run `git fetch --prune` to remove the stale remote-tracking branch.
2. If GitHub refuses because `main` moved since step 9, run [Finalize history](#finalize-history) without sub-step 4
   (this includes the Verify clean state checks; handle `ci` failures as described there), and tell the user.
3. Never merge without the user's approval.
