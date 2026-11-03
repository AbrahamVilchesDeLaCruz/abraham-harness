---
name: doc-create
description: "Trigger: When the user corrects the agent on a project convention, or asks to document one. Turns the correction or description into a document in the project's docs/ folder."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill after the user corrects your work on a convention that is not documented yet, or when the user asks to document a convention or decision.

## Hard Rules

- Document only what belongs to this project: its domain, its decisions and its deliberate differences from the shared conventions.
- Do not copy a shared convention from the skills into `docs/`. If the correction changes a shared convention, tell the user it belongs in the `abraham-harness` repository, and do not write it here.
- Write only what the user said or what the code shows. Mark anything else as an assumption.
- Update an existing document instead of creating a duplicate.

## Decision Gates

| What you learned | Where it goes |
| --- | --- |
| A rule or term of the project's domain | `docs/domain/` |
| A decision with lasting consequences | `docs/adr/{number}-{title}.md` |
| Another project convention | `docs/{category}/`, in an existing category when one fits |

## Execution Steps

1. Identify the convention, why it matters, and what it prevents. In a new conversation, use the user's description and the code.
2. List `docs/`, and choose where it goes.
3. Write the rule first, then the reason, then one correct and one incorrect example from this project.
4. Add the document to the map in `docs/README.md`, so that agents can find it without reading everything.

## Output Contract

Return the document path, and any assumption you marked.
