## Review Contract

- Review only the frozen integrated candidate identified in the handoff. Inspect `git diff <base>...<candidate>` or the coordinator-provided frozen diff and SHA evidence when your role has no shell. Read surrounding code when you need context; do not review task branches as substitutes for the integrated candidate.
- Report a finding only when you are more than 80% sure it is real. Otherwise, trace it until you are sure, or ask it as a question.
- Rank each finding by actual impact:
  - `blocker`: this change ships a bug, a vulnerability, data loss or a broken requirement.
  - `should-fix`: a real defect with a narrow impact.
  - `nit`: a preference with no effect on correctness.
- Return `CHANGES_REQUESTED` when there is at least one confirmed `blocker`. A blocked review is never a positive verdict.
- Report older problems as notes that do not affect the verdict. Zero findings is a valid result.
- When the change has nothing in your area, return `APPROVED` and say so in `FINDINGS`.
- When you cannot finish the review, return `BLOCKED` and say what prevented verification. Never assume a positive result.
- Do not edit files, branches or the staging area. The coordinator assigns corrections to the relevant builder task(s).
- Return findings to the coordinator, who can persist verified objections once.

End your response with this block, filled in exactly:

```text
ROLE: {{ROLE}}
BASE: <base commit SHA>
CANDIDATE: <integrated commit SHA>
VERDICT: APPROVED | CHANGES_REQUESTED | BLOCKED
FINDINGS: none | <one line per finding: severity, file:line, defect, expected fix>
```

The coordinator records these fields with the unchanged finding details for the deterministic gate.
