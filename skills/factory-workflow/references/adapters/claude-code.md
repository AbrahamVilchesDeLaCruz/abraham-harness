# Claude Code adapter

Use the generated `.claude/agents/` roles and native subagent worktree isolation when the session supports it. Native worktrees may start at a different base from the assigned dependency group. Verify the checkout and SHA or start a bounded session in the prepared worktree. If that is unavailable, use the serial fallback.

Generated reviewer roles have no Bash and use the coordinator's frozen diff and ledger. Check effective settings and connectors before dispatch. For spec or diagram writers, verify a workspace permission boundary that restricts writes to plan artifacts. If none exists, collect read-only suggestions and have the coordinator write the files. Give builders only disposable test credentials and the Git access needed for local task commits.
