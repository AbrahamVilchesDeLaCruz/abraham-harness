---
name: api-repository
description: "Trigger: When defining, implementing, testing or reviewing an API repository port or persistence adapter. Keeps aggregate access, query semantics and persistence mapping behind a stable boundary."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill whenever work changes a repository interface, its use-case contract, a persistence implementation, or repository-focused tests. It owns the boundary between domain/application needs and persistence details.

## Hard Rules

- Define the port around an aggregate root's capabilities, not table operations. Keep the interface in the bounded context's domain; implement it in infrastructure/persistence.
- The default contract is `save(aggregate)`, `search(id)`, `match(criteria)` and `remove(id)`. `search` returns `null` when absent. Add `count(criteria)` only when callers need totals; add batch operations only for a measured batch-write requirement.
- Do not add field-specific or filter-combination finder methods. The use case or domain service builds `Criteria`; the repository consumes it. Load `api-criteria` for filter, ordering and pagination rules.
- Return domain aggregates from aggregate repositories, never persistence entities. Keep entity-to-domain and domain-to-entity mapping inside the adapter.
- Keep ORM, query-builder, SQL and transport concepts out of the port and application layer. Name concrete adapters for their persistence technology.
- Mock the port in application tests; exercise a real adapter/database only in an integration test. Load `api-testing` for test placement and doubles.
- Add a repository method only for a distinct domain capability or retrieval requirement, not as a shortcut around the agreed query model. Record an unclear boundary as a question rather than silently changing it.

## Decision Gates

| Work | Route |
|---|---|
| Define or change the repository port | `api-repository` plus `api-domain` for aggregate invariants |
| Add filters, order or pagination | `api-repository` plus `api-criteria` |
| Implement persistence mapping | `api-repository` plus `api-infrastructure` and the persistence stack skill |
| Test a use case or adapter | `api-repository` plus `api-testing` and its stack skill |

## Execution Steps

1. Identify the aggregate root, caller needs and bounded context; inspect existing ports and adapter behavior.
2. State the contract and absent/empty semantics before changing the interface.
3. Keep query intent in the application/domain caller and translate it only inside the persistence adapter.
4. Add or update a port mock test and an adapter integration test when persistence behavior changes.
5. Load the project's persistence stack skill and read `references/api-repository.md` when available.

## Output Contract

Report the port and adapter paths, contract/method semantics, query behavior, tests and observed results, and any new capability that justified expanding the interface.

## References

- `references/repository-contract.md` — port/adapter boundary and method semantics.
- `api-domain` — aggregates, identifiers and domain invariants.
- `api-criteria` — filter, ordering and pagination query model.
- `api-infrastructure` — persistence entities and framework modules.
- `api-testing` — repository port doubles and integration-test placement.
