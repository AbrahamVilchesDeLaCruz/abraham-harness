# Reviewer selection

The coordinator records change surfaces, risk and the reason for each selected reviewer before dispatch. `code-reviewer` is required for every code change. Add reviewers based on the actual diff; a reviewer with no applicable surface is not required. Editorial documentation and inert metadata skip the code gate. Treat CI, hooks, dependency manifests, agent permissions and executable configuration according to impact.

| Change surface or risk signal | Required reviewers |
|---|---|
| Backend, domain, application, persistence, tests, build behavior or general code | `code-reviewer` |
| Authentication, authorization, external input, secrets, dependency changes, sensitive data, migrations, logging or exposed errors | `security`, `code-reviewer` |
| User flows, messages, loading/empty/error/success states or accessibility | `ux`, `code-reviewer` |
| Components, styling, layout, responsive behavior or visual tokens | `ui`, `code-reviewer` |
| User-facing change affecting both interaction and visual presentation | `ux`, `ui`, `code-reviewer` |
| Cross-cutting architecture or externally consumed contract | `code-reviewer`, plus `security`, `ux` and/or `ui` when their surfaces are affected |
| High-risk change involving security, data integrity/loss, broad migration or sensitive boundary | `security`, `code-reviewer`, plus surface reviewers that apply |

When several rows apply, take the union; do not dispatch duplicate reviews. The coordinator may add a relevant reviewer for a concern not captured by the table, documenting why. It may not omit a reviewer required by a matching row. If a required independent reviewer is unavailable, try a compatible read-only route. Record the review as blocked if the capability remains unavailable; continue independent work.

Validate the required set, frozen candidate and all verdicts with the bundled gate script.
