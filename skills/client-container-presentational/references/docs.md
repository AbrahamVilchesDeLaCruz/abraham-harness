# client-container-presentational — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `client-pods` | Where the Container and the Component live inside the pod |
| `client-query` | Server-state hooks the Container uses |
| `client-hooks` | When to extract logic from the Container to hooks |
| `client-testing` | Component is tested with a view renderer + props; Container with a view renderer + HTTP interception |

## External Documentation

- [Dan Abramov — Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) — the original article (2015)

## Decision: Container/Component vs. hooks everywhere

With a server-state library it is tempting to run queries directly in any component. The Container/Component pattern adds an explicit separation that:
1. Makes the Component testable with mocked props (no HTTP interception needed)
2. Isolates the fetching responsibility — easier to reason about
3. Allows changing the fetching strategy without touching the UI

## Internal Docs

| Doc | Relevant content |
|---|---|
| `docs/engineering/frontend-architecture.md` | Container-Presentational pattern: contracts, examples, structure — source of truth |
| `docs/engineering/engineering-principles.md` | SRP in the frontend — one Container = one data source, one Component = UI |
