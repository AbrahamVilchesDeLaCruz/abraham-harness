# FTD: Fast-Track Development

The default lane for change. It keeps the discipline about evidence without the coordination of the chain.

Write one feature document before the first change, at `.agents/plans/{YYYY_MM_DD}-{name}/{name}-ftd.md`:

```markdown
# {Feature}

## Intent
What changes, and why it is worth doing.

## Scope
What is in, and what is explicitly out.

## Discovery
Observed behavior, source paths, risks, assumptions, interview answers and frontend design choice. Link a prototype when selected.

## Checklist
- [ ] One line per task, with what would prove it done.

## Evidence
The observed output per completed task.

## Next
The single next step, so an interruption costs nothing.
```

1. Follow `discovery.md`, including its interview invitation and applicable frontend design choice. Write the discovery handoff in this document before the first change. Keep it short, even for a small change, because it is what survives an interruption.
2. Create one or more task contracts from the handoff. Split only work with independent dependencies and authorized paths.
3. Delegate tasks under `task-contract.md`; use parallel builders only with isolated workspaces.
4. Integrate task commits and run seam checks in `integration.md`. The single FTD candidate is the final feature candidate. Apply the project's verification policy first; the shared default runs full local units, while a CI-only project keeps local checks focused. CI runs the required complete suite before merge or deployment.
5. Run the gate in `gate.md` when the change touches code.
6. If delivery is explicitly authorized, follow `publication-authorization.md`. Otherwise report the frozen candidate to the user and stop.

Do not create a spec or a plan in this lane. If decisions start to affect each other, or the work turns out to be large, promote it to SDD with this document as its input.
