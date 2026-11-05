---
name: stack-typeorm
description: "Trigger: When a project uses TypeORM and a concept skill applies to the code. Maps the concept skills to TypeORM for persistence: entities, repositories, migrations and seeds."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill together with a concept skill (`api-*`, `client-*`) when the project uses TypeORM. Use another stack skill, or the official documentation, when it does not.

## Hard Rules

- The concept skill defines the rule, and this skill only shows how to apply it with TypeORM. When they disagree, follow the concept skill and report the conflict.
- Framework code stays in the infrastructure or view layer that the concept skill names. It never enters the domain.
- These references name no library version. Read the installed version from the project's manifest, and confirm the API in the official documentation when your code depends on a detail that may have changed.

## Execution Steps

1. Apply the concept skill.
2. Read `references/{concept-skill}.md` in this skill, when it exists. For example, `api-infrastructure` and `api-repository` map to their matching references.
3. Follow its patterns, and verify them against the installed version.
4. Read `references/engineering-*.md` for how `engineering-conventions` applies to this stack.
