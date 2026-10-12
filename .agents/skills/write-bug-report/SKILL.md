---
name: write-bug-report
description: 'Write and create a bug report (GitHub issue) from the issue form .github/ISSUE_TEMPLATE/bug_report.yml. Use whenever the user asks to create, write, or draft a bug report or bug issue.'
---

# Write a Bug Report

Every bug report is created from the form `.github/ISSUE_TEMPLATE/bug_report.yml`. Read it first; it is the source of truth for fields, labels, title prefix, and required fields. `gh issue create --template` only reads Markdown (`.md`) templates, not issue forms (`.yml`), so build the body by hand to match what the form renders.

## Body format

One `### <field label>` section per form field, in form order, separated by blank lines:

```markdown
### What happened?

What you see, and what you expected to happen instead.

### Steps to reproduce

1. Go to '...'
2. Enter '...'
3. See error

### What browsers are you seeing the problem on?

Firefox, Chrome

### Relevant log output

<pasted logs in a shell code block>
```

- Fill the required fields of the form (currently `What happened?` and `Steps to reproduce`) always. If `bug_report.yml` changed, follow it over the example above.
- For an empty optional field, keep the heading and write `_No response_`, as GitHub does for forms. For empty logs, write `_No response_` as plain text, not in a code block.
- Render non-empty `Relevant log output` as a fenced `shell` code block, because the form sets `render: shell`.
- Use only the browser options listed in the form.
- Make the steps reproducible with the exact input data and the order of steps, so a failing test can be written from them.
- Report one bug per issue.

## Create

1. Draft the title (short; use the form's `title` prefix) and the body, and show them to the user.
2. Wait for approval, then create the issue with the labels from the form:

   ```sh
   gh issue create --title "<title>" --label "<labels from bug_report.yml>" --body-file - <<'EOF'
   <body>
   EOF
   ```

   The body goes in on stdin, so nothing is written to disk.
3. Report the issue URL.

Do not create bug reports as free-form issues.
