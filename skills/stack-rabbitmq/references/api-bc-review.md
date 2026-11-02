# api-bc-review with RabbitMQ

Apply the process of `api-bc-review`. These are the RabbitMQ forms of its checks.

- BCs communicate via domain events over AMQP, or via API calls.
- Audit checklist, Phase 6: `fromPrimitives()` static method exists for AMQP deserialization.
- Phase 7, cross-cutting docs: sync `docs/domain/rabbitmq-design.md` (exchanges, queues, handlers) if the BC emits or consumes events.
- Documentation lag signal: undocumented RabbitMQ queues (`update_progress_on_payment_recorded`).
- Anti-pattern: a new subscriber without a row in `rabbitmq-design.md` and `bounded-contexts.md`.

## Suggested commits per responsibility

```
feat({bc}): log {event} in {DomainService}
feat({bc}): document GET /{resource} in OpenAPI
docs({bc}): sync spec, bounded-contexts and rabbitmq design
test({bc}): add catalog/domain parity tests
test({bc}): add GET /{resource} e2e coverage
test({bc}): add domain object mothers
feat(client): type {resource} API response with ApiEnvelope
```
