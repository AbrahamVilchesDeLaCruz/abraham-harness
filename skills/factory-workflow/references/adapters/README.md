# Runtime adapters

Use the adapter for the active runtime. The coordinator preflights role identity, working directory, Git root and HEAD. Check that read-only roles have no write-capable shell, connectors or delegated tools and that builders have an isolated writable checkout with disposable test resources. A generated prompt or worktree alone supplies neither a sandbox nor a credential boundary.

| Runtime | Adapter |
|---|---|
| Claude Code | `claude-code.md` |
| Codex | `codex.md` |
| OpenCode | `opencode.md` |

Record which capabilities you observed. Use the serial fallback in `integration.md` when isolated writers are unavailable. For review, provide a read-only checkout or bounded frozen diff separately. Keep optional model assignments in runtime configuration.
