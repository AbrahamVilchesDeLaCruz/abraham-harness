---
name: stack-observability
description: "Trigger: When a project uses Pino, Prometheus and OpenTelemetry and a concept skill applies to the code. Maps the concept skills to Pino, Prometheus and OpenTelemetry for logs, metrics and traces."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill together with a concept skill (`api-*`, `client-*`) when the project uses Pino, Prometheus and OpenTelemetry. Use another stack skill, or the official documentation, when it does not.

## Hard Rules

- The concept skill defines the rule, and this skill only shows how to apply it with Pino, Prometheus and OpenTelemetry. When they disagree, follow the concept skill and report the conflict.
- Framework code stays in the infrastructure or view layer that the concept skill names. It never enters the domain.
- These references name no library version. Read the installed version from the project's manifest, and confirm the API in the official documentation when your code depends on a detail that may have changed.

## Execution Steps

1. Apply the concept skill.
2. Read `references/{concept-skill}.md` in this skill, when it exists. For example, `api-infrastructure` maps to `references/api-infrastructure.md`.
3. Follow its patterns, and verify them against the installed version.
