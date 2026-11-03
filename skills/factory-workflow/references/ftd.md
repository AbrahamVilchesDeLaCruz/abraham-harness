# FTD: Fast-Track Development

The default lane for change. It keeps the discipline about evidence without the coordination of the chain.

Write one feature document before the first change, at `.agents/plans/{YYYY_MM_DD}-{name}/{name}-ftd.md`:

```markdown
# {Feature}

## Intent
What changes, and why it is worth doing.

## Scope
What is in, and what is explicitly out.

## Checklist
- [ ] One line per task, with what would prove it done.

## Evidence
The observed output per completed task.

## Next
The single next step, so an interruption costs nothing.
```

1. Write the document. Keep it short, even for a small change, because it is what survives an interruption.
2. Delegate to `builder` with the document path.
3. Run the gate in `gate.md` when the change touches code.
4. Report to the user and stop.

Do not create a spec or a plan in this lane. If decisions start to affect each other, or the work turns out to be large, promote it to SDD with this document as its input.
