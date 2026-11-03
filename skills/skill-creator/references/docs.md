# skill-creator — Docs & References

## Related Skills

| Skill | Why read it |
|---|---|
| `skill-sync` | After creating a skill, sync `AGENTS.md` |

## External Documentation

- [agentskills.io — Spec](https://agentskills.io/home) — complete format specification
- [agentskills.io — Frontmatter](https://agentskills.io/spec/frontmatter) — required and optional metadata fields
- [YAML — Frontmatter](https://yaml.org/spec/1.2.2/) — syntax of the `---` block

## File structure for a complete skill

```
skills/{skill-name}/
├── SKILL.md                    ← Required: frontmatter + instructions (< 200 lines)
├── assets/                     ← Templates, code scaffolds, checklists
│   └── {entity}.template.md
├── references/                 ← Deep documentation, ADRs, external links
│   ├── {pattern}.md            ← Code patterns and full implementations
│   └── docs.md                 ← ADRs, related skills, external docs
└── resources/                  ← Setup guides, one-time configuration
    └── setup.md
```

## SKILL.md frontmatter

```yaml
---
name: skill-name                  # lowercase, hyphens, max 64 chars
description: "Trigger: {When the AI should load this skill}. {One-line description of what this skill does}."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---
```

## Internal Docs

| Doc | Relevant content |
|---|---|
| `engineering-principles.md` in `engineering-conventions` | The principles that new skills must reflect: SRP, consistency, why it matters |
