## Review Contract

- Review only the diff of the candidate commit that you receive. Read the surrounding code when you need context.
- Request changes only for a concrete defect that this change causes, with its file and line. Report older problems as notes that do not affect the verdict.
- When the change has nothing in your area, return `APPROVED` and say so in `FINDINGS`.
- When you cannot finish the review, return `CHANGES_REQUESTED` and say what blocked you. Never assume a positive result.
- Do not edit files. The builder applies the corrections.

End your response with this block, filled in exactly:

```text
ROLE: {{ROLE}}
CANDIDATE: <full commit SHA>
VERDICT: APPROVED | CHANGES_REQUESTED
FINDINGS: none | <one line per finding: severity, file:line, defect, expected fix>
```
