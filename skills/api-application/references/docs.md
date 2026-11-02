# api-application — Docs & References

## Related Skills

| Skill                | Why read it                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `api-domain`         | Aggregate, Value Objects and Domain Errors the use case consumes |
| `api-di`             | How to define tokens and register the use case as a provider     |
| `api-infrastructure` | How the controller builds the `Request*` and calls the use case  |
| `api-events`         | `EventBus` interface and how to publish domain events            |
| `api-testing`        | How to test use cases with mocks and Object Mothers              |

## Architectural Decisions

- The application layer **never** imports from the application framework (except its injectable and injection markers)
- Domain Services vs Use Cases: Domain Services coordinate **pure** domain logic; Use Cases coordinate infrastructure (repositories, eventBus, logger)
- One Use Case = one business transaction. If you need two atomic actions, consider a Use Case that coordinates them or a shared Domain Service.

## Internal Docs

| Doc                                                                                  | Relevant content                                                      |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `docs/engineering/engineering-principles.md`                 | SRP — one use case = one reason to change; dependency inversion       |
| `docs/engineering/backend-architecture.md`                     | What Application can import (Domain yes, Infrastructure no)           |
