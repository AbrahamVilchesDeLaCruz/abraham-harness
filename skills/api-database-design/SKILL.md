---
name: api-database-design
description: "Trigger: When designing or changing a relational schema, its constraints, indexes or data lifecycle."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use when a change affects relational data modeling or schema evolution. Use `api-domain` for domain models, `api-repository` for persistence ports, and `api-migrations` to implement schema changes.

## Hard Rules

- Identify ownership, access patterns, cardinality and lifecycle before selecting tables and relationships. Keep domain invariants in the domain; enforce durable data integrity at the database boundary as well.
- Specify primary and foreign keys, nullability, uniqueness, defaults, checks and deletion behavior explicitly. Choose transaction boundaries and concurrency controls for invariants spanning writes.
- Choose indexes for observed query and join patterns, accounting for selectivity, ordering, write cost and existing indexes. Validate assumptions with representative data and query plans when available; do not index every column by default.
- Consider sensitive data, retention and least privilege. Avoid placing production data or credentials in fixtures.
- Plan schema evolution for existing data and mixed application versions: assess compatibility, backfills, locking, rollback and verification. Separate destructive removal from the compatible transition when needed.
- Test migration and constraints against an identified disposable test database. Never infer that a database is disposable from its name alone; verify the configured target before mutating it.

## Decision Gates

Use schema constraints for durable integrity and domain rules for business behavior; use the matching stack guidance for implementation.

## Execution Steps

Assess access patterns and invariants, design the schema, plan its evolution, then verify against the disposable test target.

## Output Contract

Document the schema decisions, invariants, access patterns, migration and verification evidence, including unresolved operational risks. Load the matching persistence stack reference if one exists.
