# Pull request evidence

Use the project's PR template and add the sections needed to review the actual change. Build the body from the verified feature plan and ledger.

- Explain the outcome, prior behavior, approved scope and consequential decisions.
- Give a review order with meaningful file links. Map acceptance criteria to tests or artifacts. Record the reviewed base, final head, actual CI ref or SHA when known, exact check status, and unresolved risks and findings.
- For UI changes, capture comparable before/after states with the same inputs, viewport and crop. Include mobile and desktop when affected. Add a short recording when interactions matter.
- For an API or event contract, show representative results for the same inputs and meaningful error or compatibility cases. For an architecture change, show the affected interfaces and call order when a diagram improves review.
- For migrations, security or operational changes, show the affected data or permission boundaries, rollout and recovery evidence. Include only relevant sections.
- Use disposable data. Redact secrets and personal data from reports, screenshots and logs. Follow the target's authorized attachment and publication rules. Link observed evidence and name gaps explicitly.

At handoff, make CI status visible. An open PR can be ready for human review while CI is pending. Record passing required checks before any authorized merge.
