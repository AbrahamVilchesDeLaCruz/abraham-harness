# Message Bus — Reference

The full adapter is in the messaging stack skill, in `references/api-events-infra.md`. Its wiring is in the HTTP framework stack skill, in the file of the same name.

## What the adapter must do

- Setting up a consumer creates the exchange, the main queue, one retry queue per delay and the `.dead_letter` queue, all durable, and binds the main queue.
- Publishing sends each event as a JSON payload with `aggregateId`, `eventId`, `occurredOn` and `data`. `data` holds the event attributes, not `attributes` nor `toPrimitives()`.
- Each message is persistent, and it starts with a retry count of 0.
- A failed message is resent with its original bytes, without re-serializing.
- The queue name is passed as a parameter — it is not read from the delivered message.
- A payload without `data` is invalid (`InvalidEventPayload`).
- A dead-lettered message carries the failure reason and the time it was exhausted.
- A mutex prevents concurrent connection attempts from creating two connections.
- A failed reconnection is retried after `RECONNECT_DELAY_MS`.
- `dispatchInProcess()` invokes the registered handlers without publishing to the broker. E2E tests use it to avoid flaky cross-BC async delivery in CI.

## Retry flow

On handler failure, publish the original bytes to the queue for the next delay, or to the manual dead-letter queue when exhausted. Confirm the publish before acknowledging the original. If publishing fails, keep the original recoverable and use a bounded reconnect or redelivery policy. A crash after confirmation and before acknowledgement can duplicate delivery, so consumers must be idempotent.

Each fixed-delay queue routes expired messages back to the main queue. If retention across broker delivery failures is required, use a broker configuration that meets the guarantee or implement a durable retry store. Verify actual retry and exhausted-message behavior with the real adapter.

## Dead-letter recovery

Fix the cause, then explicitly move the messages from `<queue_name>.dead_letter` back to `<queue_name>`.

## Idempotency

### Natural idempotency

Use an atomic operation that converges under duplicate or concurrent delivery. A separate read followed by a write is insufficient unless the write enforces the invariant and treats an already-applied operation consistently.

### Inbox for effects in the same database

Acquire a unique event ID and write the business effect in the same transaction. Duplicate IDs skip the effect. Failure rolls back the marker and effect together. Retain markers for the replay window. For external effects, use a durable outbox and a downstream idempotency key; a local database transaction cannot cover the external call.
