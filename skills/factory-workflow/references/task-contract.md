# Task contract

The coordinator creates one contract for each builder. Keep tasks independently verifiable and narrowly scoped. Use the same immutable base commit for every task in a phase.

```markdown
## Task: <id> — <short outcome>
- Phase or lane: <phase id | FTD>
- Goal and acceptance criteria: <observable behavior>
- Dependencies: none | <task ids and required outputs>
- Base commit: <full SHA>
- Branch: <unique local branch name>
- Worktree: <unique path>
- Authorized paths: <explicit paths or globs>
- Forbidden paths: <paths reserved for another task or outside scope>
- Checks: <exact commands and expected results>
- Handoff: <commit SHA, changed paths, check results, blockers>
```

Before launch, ensure each acceptance criterion has evidence, dependencies form an acyclic graph, and concurrent tasks do not write the same paths. If overlap is unavoidable, serialize those tasks or assign the shared files to one owner. Do not treat path instructions as an OS-level sandbox.

Builders must stop and report when a required change falls outside authorized paths, a dependency is missing, the base differs, or a check cannot run. They must not broaden scope themselves. The coordinator may revise contracts and relaunch affected tasks.
