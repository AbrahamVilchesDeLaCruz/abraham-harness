# Review gate

Review the frozen, integrated candidate—not individual task branches. The coordinator selects reviewers with `review-matrix.md`, records risk and rationale, and sends every reviewer the same base and candidate commit SHAs.

1. Confirm the phase's required local seam checks passed, its check ledger names exact commands and results, and the candidate worktree is clean. Apply the project verification policy before the shared full-local-unit default: if it reserves full suites for CI, focused local evidence is sufficient for review and the full CI gate remains pending. A final feature candidate means the whole feature, not each SDD phase. Record CI typecheck, lint, API/client units, coverage and E2E as pending until the pull request gate runs on the required candidate. Reviewer approval does not waive a required CI gate before merge, deployment or phase publication.
2. Run all selected reviewers in parallel against `git diff <base>...<candidate>`.
3. Send the selected reviewer set, rationale, base/candidate SHAs and unchanged verdict blocks to `approver`.
4. Approve only when every required reviewer returned `VERDICT: APPROVED` for the exact candidate SHA. Missing, blocked or negative verdicts reject.
5. Return findings to the coordinator, who assigns corrections to the affected task contract(s). Reintegrate, rerun seam checks and create a new candidate before reviewing again.

Any candidate change invalidates every verdict for the old SHA. Stop after 3 rejected rounds and report remaining blockers to the user. The approver synthesizes verdicts; it does not perform a substitute review or waive a required reviewer.
