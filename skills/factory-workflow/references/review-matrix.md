# Reviewer selection

The coordinator records change surfaces, risk and the reason for each selected reviewer before dispatch. `code-reviewer` is required for every code change. Add reviewers based on the actual diff; a reviewer with no applicable surface is not required. Documentation/configuration-only changes continue to skip the code gate.

| Change surface or risk signal | Required reviewers |
|---|---|
| Backend, domain, application, persistence, tests, build behavior or general code | `code-reviewer` |
| Authentication, authorization, external input, secrets, dependency changes, sensitive data, migrations, logging or exposed errors | `security`, `code-reviewer` |
| User flows, messages, loading/empty/error/success states or accessibility | `ux`, `code-reviewer` |
| Components, styling, layout, responsive behavior or visual tokens | `ui`, `code-reviewer` |
| User-facing change affecting both interaction and visual presentation | `ux`, `ui`, `code-reviewer` |
| Cross-cutting architecture or externally consumed contract | `code-reviewer`, plus `security`, `ux` and/or `ui` when their surfaces are affected |
| High-risk change involving security, data integrity/loss, broad migration or sensitive boundary | `security`, `code-reviewer`, plus surface reviewers that apply |

When several rows apply, take the union; do not dispatch duplicate reviews. The coordinator may add a relevant reviewer for a concern not captured by the table, documenting why. It may not omit a reviewer required by a matching row. If a needed capability has no available role, stop and tell the user rather than treating another role as a substitute.

The approver receives the selected set and rationale, verifies every required verdict refers to the same frozen candidate SHA, and synthesizes the result. A missing, blocked or negative verdict means rejection.
