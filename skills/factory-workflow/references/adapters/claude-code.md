# Claude Code adapter

Use the generated role definitions under `.claude/agents/` for responsibilities. Before parallel work, verify the active session can create and address a distinct Git worktree for each builder; if not, use the serial fallback in `integration.md`. Do not infer isolation from agent tool restrictions, which constrain tools but do not by themselves provide a separate checkout. Keep any project-specific model mapping outside the common skill.
