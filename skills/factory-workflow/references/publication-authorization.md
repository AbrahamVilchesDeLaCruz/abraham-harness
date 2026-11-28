# Feature delivery

At the start of authorized implementation, create or reuse its feature branch. Resolve the base and remote from the project's configuration. Keep the original feature base SHA for the final review. Preserve unrelated user changes.

## Authority

Record repository, remote, feature branch, PR base, permitted operations and conditions in the feature plan. A project delivery policy and the user's instruction may authorize first push, subsequent pushes and PR creation together for the same feature. Apply standing authorization when it covers the exact target; ask only when a required target or permission is missing. Merge, publishing into a protected branch, deployment and deletion require their own authorization.

## Delivery order

1. Once the first verified commit lands on the feature branch, push that commit to the authorized remote. Do not push task worktree branches. When push is not authorized, keep implementing locally.
2. Continue all technical phases. Verify the final combined tree, freeze the candidate, and review from the original feature base. Integrate into the feature branch while preserving its reviewed candidate. A different resulting candidate requires relevant rechecks and review.
3. Push the final candidate to the same authorized branch and open or update one PR to the configured base. Use `pull-request.md` for evidence. The project may require a draft; otherwise the PR may be ready for human review with pending CI clearly shown.
4. Track required CI against the verified PR head and record the actual ref or SHA tested, including a synthetic merge commit when applicable. Pending, failed, stale or missing CI blocks a required merge or deployment. CI and human review remain distinct. A project-required gate for a separately delivered phase applies to that phase.
5. Address recoverable problems in the same scope. Before retrying a remote write after a timeout, check refs and the open PR for the authorized head and base. Report what succeeded and what remains pending.

Before each operation verify remote, target, source SHA and existing PR state. A first push uses the first verified feature commit; final delivery uses the reviewed candidate. Never overwrite unrelated changes or widen an operation by force-pushing, resetting or targeting another branch.
