# Claude Code adapter

Use the generated role definitions under `.claude/agents/` for responsibilities. Before parallel work, verify the active session can create and address a distinct Git worktree for each builder; if not, use the serial fallback in `integration.md`. Do not infer isolation from agent tool restrictions, which constrain tools but do not by themselves provide a separate checkout. Keep any project-specific model mapping outside the common skill.

Use runtime or personal settings for scoped command allow rules and additional worktree directories, subject to managed policy. Allow only the dependency, local Git and test database operations needed by the workflow; check the effective sandbox separately. Run migration tests only against a verified disposable target. To suppress Claude commit attribution, set `attribution.commit` to an empty string in the applicable Claude settings; preserve other settings.

When a builder reports, cancel any background task it left running (such as a wait loop) and confirm none remains, so a finished builder does not look alive.
