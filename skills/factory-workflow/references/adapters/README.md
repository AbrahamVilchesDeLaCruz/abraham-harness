# Runtime adapters

The common workflow defines responsibilities and gates. Adapter notes define only how to invoke those responsibilities and what isolation capabilities the runtime exposes. Do not put model assignments in common workflow rules; if a project configures models, keep that mapping in its runtime-specific configuration.

An adapter must report whether it can launch concurrent roles in distinct writable Git worktrees and whether it can verify their working directories. If it cannot, the common fallback is serial execution. Instructions limiting paths are not a sandbox; use actual runtime permissions where available, and still validate changed paths after every task.

| Runtime | Role/workspace notes |
|---|---|
| Claude Code | `claude-code.md` |
| Codex | `codex.md` |
| OpenCode | `opencode.md` |
| Other adapters | Record verified capabilities locally; follow the same common contract and serial fallback. |
