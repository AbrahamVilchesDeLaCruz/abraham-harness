# The gate

Every code change needs a positive verdict from `security`, `ux`, `ui` and `code-reviewer` on one staged tree. One negative verdict rejects the candidate.

1. The `builder` stages the change and returns the `git write-tree` SHA.
2. Delegate to the four reviewers in parallel, with that SHA and the plan or feature document path. They review `git diff --cached`.
3. Delegate to `approver` with the four verdict blocks, unchanged.
4. On `APPROVER: REJECTED`, send `BLOCKERS` to `builder`, then repeat from step 2 with the new SHA.

Any change to the staged tree invalidates all verdicts, so all four reviewers run again.

Stop after 3 rejected rounds, and return the open blockers to the user.
