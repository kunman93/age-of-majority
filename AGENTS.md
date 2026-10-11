# Coding Agent Instructions

Read the [README.md](README.md) to understand what the repo is about.

---

## Working Style

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
- Delete a feature branch only after its PR has been merged (see [9. Merge](#9-merge)).

**Never**:

- Force push

---

## Coding Style

- Do not add comments to config/source files that merely restate what's already
  obvious from the element or identifier name. Only comment when it conveys
  non-obvious rationale or context.
- Never introduce secrets, tokens, or credentials into the repository.

---

## Implementation Workflow

The user names the Story to work on and moves its card on the project board.
Everything except step 5 runs in the main session on Opus 5.5. Step 5 is delegated to Sonnet 5.5.

### 0. Check model

- Check the model reported in your environment information. If it is not Opus 5.5, or if you cannot tell, ask the user to switch with `/model` and stop.

### 1. Create feature branch

- Fetch `main` from origin.
- Create a feature branch based on `origin/main`, following the naming conventions in [Feature branches](#feature-branches).

### 2. Verify clean state

Before starting with the research, verify you have a clean state:

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm test` (unit) and `npm run test:bdd` (BDD)
- Lint/format: `npm run lint` and `npm run format:check`

### 3. Research

- Research the issue provided as a prompt with the `openspec-explore` skill (`/opsx-explore`).

### 4. Plan

- Create a change proposal with the `openspec-propose` skill (`/opsx-propose`).
- Commit the proposal.

### 5. Implement

- Delegate implementation to a `general-purpose` subagent with model `claude-sonnet-5.5`. Give it the change name, the branch, and the decisions from research and planning.
- The subagent implements the tasks from the change with the `openspec-apply-change` skill (`/opsx-apply`), applying TDD, and makes atomic commits with the `.agents/skills/git-commit` skill.
- When the subagent is done, verify its work in the main session with the commands from [2. Verify clean state](#2-verify-clean-state). If the subagent fails or its work does not pass verification, finish the work in the main session.

### 6. Review

Once the implementation is complete, have the reviewer agent
([.github/agents/reviewer.agent.md](.github/agents/reviewer.agent.md)) review the feature branch.
Run it as the custom `reviewer` subagent, not as a general-purpose or code-review agent.

If there are any MAJOR findings, return to [5. Implement](#5-implement) and fix them,
then run the review again. Repeat until the reviewer approves without any MAJOR findings.

### 7. Create PR

- Before the first push, clean up the history into atomic commits:
  1. Create a backup: `git branch backup/<branch>`.
  2. Rewrite the history, for example by squashing fixups and rewording.
  3. Verify the content is unchanged: `git diff backup/<branch> HEAD` must be empty.
     If it is not, run `git reset --hard backup/<branch>` and retry.
  4. Delete the backup: `git branch -D backup/<branch>`.
- Push the feature branch and create a PR targeting `main`.
- Once pushed, never rewrite the history again.
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

- If there are findings, return to [5. Implement](#5-implement), fix them with new commits, review again, and push.
  Then tell the user and wait for their next review report. Do not archive until the user approves.

### 8. Archive

- Wait for the user's explicit approval of the PR in the conversation. GitHub does not allow approving your own PR, so this is the approval.
- Archive the completed change on the feature branch with the `openspec-archive-change` skill (`/opsx-archive`), commit, and push.

### 9. Merge

- After the user's approval and the archive push, merge the PR with a merge commit and delete the feature branch: `gh pr merge --merge --delete-branch`.
- Never merge without the user's approval.

---

## Documentation

- Use progressive disclosure. Start with the smallest relevant doc set.
- Follow the markdown conventions as stated in the [Markdown Guide](https://www.markdownguide.org/).
- Do not create a `.md` file that merely restates or describes an existing
  config/source file. The original file is the documentation; only add prose docs
  when they convey information not already evident from the file itself.
