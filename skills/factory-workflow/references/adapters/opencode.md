# OpenCode adapter

Use the generated role definitions under `.opencode/agents/` for responsibilities. Before parallel work, verify the active session can create and address a distinct Git worktree for each builder; if not, use the serial fallback in `integration.md`. Edit permissions do not create a separate checkout. Keep any project-specific model mapping outside the common skill.

When a builder reports, cancel any background task it left running (such as a wait loop) and confirm none remains, so a finished builder does not look alive.