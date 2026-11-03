## Review Contract

- Review only the staged candidate: run `git diff --cached`. Read the surrounding code when you need context.
- Report a finding only when you are more than 80% sure it is real. Otherwise, trace it until you are sure, or ask it as a question.
- Rank each finding by actual impact:
  - `blocker`: this change ships a bug, a vulnerability, data loss or a broken requirement.
  - `should-fix`: a real defect with a narrow impact.
  - `nit`: a preference with no effect on correctness.
- Return `CHANGES_REQUESTED` only when there is at least one `blocker`.
- Report older problems as notes that do not affect the verdict. Zero findings is a valid result.
- When the change has nothing in your area, return `APPROVED` and say so in `FINDINGS`.
- When you cannot finish the review, return `CHANGES_REQUESTED` and say what blocked you. Never assume a positive result.
- Do not edit files or the staging area. The builder applies the corrections.
- When Engram is available, save each `blocker` and `should-fix` finding as an objection before you return the verdict. Saving to Engram is not an edit.

End your response with this block, filled in exactly:

```text
ROLE: {{ROLE}}
CANDIDATE: <`git write-tree` SHA>
VERDICT: APPROVED | CHANGES_REQUESTED
FINDINGS: none | <one line per finding: severity, file:line, defect, expected fix>
```
