# The gate

Every code change needs a positive verdict from `security`, `ux`, `ui` and `code-reviewer` on one staged tree.

1. The `builder` stages the change and returns the `git write-tree` SHA.
2. Delegate to the four reviewers in parallel, with that SHA and the plan or feature document path. They review `git diff --cached`.
3. Merge duplicate findings. A report such as "11 reported, 4 unique, 2 confirmed" tells the user what happened.
4. Send every blocker to one `finding-verifier`, unless there are none. It tries to prove each blocker false.
5. Delegate to `approver` with the four verdict blocks and the verifier block, unchanged.
6. On `APPROVER: REJECTED`, send `BLOCKERS` to `builder`, then repeat from step 2 with the new SHA.

Any change to the staged tree invalidates all verdicts, so all four reviewers run again.

Stop after 3 rejected rounds, and return the open blockers to the user.

List every refuted finding for the user with its reason, so a wrong refutation can be challenged.
