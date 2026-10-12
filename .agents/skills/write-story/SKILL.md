---
name: write-story
description: 'Write and create a Story (GitHub issue) from the issue form .github/ISSUE_TEMPLATE/story.yml. Use whenever the user asks to create, write, draft, or split a Story or user story issue.'
---

# Write a Story

Every Story is created from the form `.github/ISSUE_TEMPLATE/story.yml`. Read it first; it is the source of truth for fields, labels, and required fields. `gh issue create --template` does not support issue forms, so build the body by hand to match what the form renders.

## Body format

One `### <field label>` section per form field, in form order, separated by blank lines:

```markdown
### Story

As a [type of user],
I want [goal],
so that [benefit/value].

### Acceptance criteria

- [ ] First criterion
- [ ] Second criterion

### Depends on

#12, #15

### Additional context

Mockups, constraints, links to related issues, etc.
```

- Fill the required fields of the form (currently `Story` and `Acceptance criteria`) always. If `story.yml` changed, follow it over the example above, including any `title` prefix.
- For an empty optional field (`Depends on`, `Additional context`), keep the heading and write `_No response_`, as GitHub does for forms.
- Keep acceptance criteria observable and testable, one checkbox each.
- Prefer small, independently deliverable Stories. If the request is large, propose a split and set `Depends on` between the parts.

## Create

1. Draft the title (short; use the form's `title` prefix if it defines one) and the body, and show them to the user.
2. Wait for approval, then create the issue with the labels from the form:

   ```sh
   gh issue create --title "<title>" --label "<labels from story.yml>" --body-file - <<'EOF'
   <body>
   EOF
   ```

   The body goes in on stdin, so nothing is written to disk.
3. Report the issue URL.

Do not create Stories as free-form issues, and do not use the `bug_report` or `feature_request` templates for them.
