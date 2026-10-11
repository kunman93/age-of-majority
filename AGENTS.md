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

- Implement the tasks from the change with the `openspec-apply-change` skill (`/opsx-apply`), applying TDD.
- Make atomic commits with the `.agents/skills/git-commit` skill.

### 6. Review

Once the implementation is complete, have the reviewer agent
([.github/agents/reviewer.agent.md](.github/agents/reviewer.agent.md)) review the feature branch.
Run it as the custom `reviewer` subagent, not as a general-purpose or code-review agent.

If there are any MAJOR findings, return to [5. Implement](#5-implement) and fix them,
then run the review again. Repeat until the reviewer approves without any MAJOR findings.

### 7. Create PR

- Push the feature branch and create a PR targeting `main`.

### 8. Archive

- Wait for the user's explicit approval of the PR in the conversation. GitHub does not allow approving your own PR, so this is the approval.
- Archive the completed change on the feature branch with the `openspec-archive-change` skill (`/opsx-archive`), commit, and push.
- If further fixes are needed after archiving, `git revert` the archive commit, fix, review again, then archive again.

### 9. Merge

- Only the user merges the PR. Never merge it yourself.
- After the merge, delete the local feature branch. Never delete the remote branch; the user does that on GitHub.

---

## Documentation

- Use progressive disclosure. Start with the smallest relevant doc set.
- Follow the markdown conventions as stated in the [Markdown Guide](https://www.markdownguide.org/).
- Do not create a `.md` file that merely restates or describes an existing
  config/source file. The original file is the documentation; only add prose docs
  when they convey information not already evident from the file itself.
