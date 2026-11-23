---
name: archify
description: "Create validated, interactive diagrams as standalone HTML. Trigger: visualize architecture, domain models, workflows, sequences, data flows or state transitions."
license: MIT
---

# Archify

## Activation Contract

Use for requested architecture, domain, infrastructure, workflow, sequence, data-flow and lifecycle diagrams, or to convert Mermaid into an explorable HTML artifact. Inspect project evidence when the diagram represents existing code; distinguish facts, proposals and unknowns. Honor the requested output format and project rules.

## Hard Rules

- Follow the packaged [authoring and delivery workflow](UPSTREAM.md), including its schemas, examples, validation, delivery and browser evidence. Run its commands from this skill directory, with paths to the requested artifact location.
- Choose the diagram type that best represents the question. For domain models, use architecture diagrams for boundaries and relationships, and retain the glossary, invariants, domain types and unresolved decisions required by the task. Include supporting information in the artifact or a companion file when the schema cannot express it directly.
- Keep authored content in the user's language and disclose the viewer's English fallback when applicable. Preserve semantic labels, evidence and accessible navigation.
- Report validation, browser evidence and visual review separately; never claim checks that did not pass or run. Respect the user's requested format or existing artifact requirements when HTML is unsuitable.
