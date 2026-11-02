# git-workflow — Docs & References

## Related Skills

None: this skill cuts across all the others.

## External Documentation

- [Conventional Commits — Spec](https://www.conventionalcommits.org/en/v1.0.0/) — commit message format
- [commitlint — Docs](https://commitlint.js.org/) — commit validation (configured in `commitlint.config.ts`)
- [Husky — Docs](https://typicode.github.io/husky/) — git hooks (`.husky/` at the monorepo root)
- [lint-staged — Docs](https://github.com/okonet/lint-staged) — ESLint + Prettier on staged files
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) — the base flow (branching from main, PRs)

## Branch types reference

```
feat/    → new feature
fix/     → bug fix
refactor/ → refactoring with no behavior change
test/    → tests only
docs/    → documentation only
chore/   → infrastructure, dependencies, configuration
ci/      → GitHub Actions, CI scripts
```

## Commit types reference

```
feat     → new functionality (increments MINOR in semver)
fix      → bug fix (increments PATCH in semver)
refactor → refactoring with no bug fix or feature
test     → add or modify tests
docs     → documentation
chore    → maintenance tasks
perf     → performance improvement
ci       → CI/CD changes
revert   → revert a previous commit
```

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/git-workflow.md` | Complete guide to the project's branching, merge strategy and branch protection |
