# Task contract

The coordinator creates one contract for each builder. Keep tasks independently verifiable and narrowly scoped. Use the same immutable base commit for every task in a phase.

```markdown
## Task: <id> — <short outcome>
- Phase or lane: <phase id | FTD>
- Goal and acceptance criteria: <observable behavior>
- Discovery: <authoritative handoff path, concise confirmed-decision digest, and worktree-readable snapshot/prototype path when needed>
- Dependencies: none | <task ids and required outputs>
- Base commit: <full SHA>
- Branch: <unique local branch name>
- Worktree: <unique path>
- Authorized paths: <explicit paths or globs>
- Forbidden paths: <paths reserved for another task or outside scope>
- Skills: <exact SKILL.md and reference paths for this task, with the few rules that matter here>
- Environment: <what the coordinator already prepared in the worktree: install, env file, dedicated database; or `none`>
- Iteration checks: <narrowest commands covering the affected files, run while iterating>
- Early checks: <existing suites for risks the task touches, such as concurrency, idempotency or state transitions; run before the first commit>
- Closing checks: <exact commands run once before the final commit; never the full slow suite>
- Commit hooks: <which hooks run on task commits, for example `commit-msg` only>
- Handoff: <commit SHA, changed paths, check results, blockers, background processes stopped>
```

Before launch, ensure each acceptance criterion has evidence, dependencies form an acyclic graph, and concurrent tasks do not write the same paths. If overlap is unavoidable, serialize those tasks or assign the shared files to one owner. Do not treat path instructions as an OS-level sandbox.

Builders must stop and report when a required change falls outside authorized paths, a dependency is missing, the base differs, or a check cannot run. They must not broaden scope themselves. The coordinator may revise contracts and relaunch affected tasks.

## Staged verification

Verification gets more expensive as it widens, so the contract orders it:

1. **Iteration checks** run on every cycle and cover only the affected files or module, such as one spec file.
2. **Early checks** run once, soon after the first working change. Name the existing tests that already cover the risks the task touches (concurrency, double operations, parent/child state), so failures show up before the task closes, not at seam checks.
3. **Closing checks** run once before the final commit: focused lint, typecheck and the task's own tests.
4. The full slow suite (for example e2e) runs once, by the coordinator, as part of the seam checks in `integration.md`. A builder runs it only when its contract says so.

## Context and environment

- The coordinator resolves skills once and passes exact paths plus a short summary of the rules that apply. Builders read those paths and do not rediscover skills or reference modules.
- Keep one authoritative discovery handoff. Put only task-relevant confirmed decisions in each contract, and provide a readable snapshot of detailed handoff/prototype files inside the builder's workspace when needed. Verify access before launch; a path in the coordinator's ignored `.agents/` directory is not enough. Builders inspect the source paths they need. Reviewers independently inspect the integrated candidate.
- The coordinator prepares each worktree once, with a project script when one exists: dependency install, environment file and any dedicated database. Builders never repeat this setup; if it is missing or broken, they stop and report.
- Task commits skip repeated work that the builder's checks already did. Keep `commit-msg` validation on every commit; run the full lint and format check once at closing, in the seam checks.
- Before reporting, a builder stops every process it started, including wait loops, watchers and background jobs, and states that it did so in the handoff.
