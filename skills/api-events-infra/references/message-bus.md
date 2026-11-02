# Message Bus — Reference

The full adapter is in the messaging stack skill, in `references/api-events-infra.md`. Its wiring is in the HTTP framework stack skill, in the file of the same name.

## What the adapter must do

- Setting up a consumer creates the exchange, the main queue, the `.retry` queue and the `.dead_letter` queue, all durable, and binds the main queue.
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

```
Message fails
     ↓
reject the message             ← no requeue to main queue
     ↓
retryCount < 3 ?
  YES → send to .retry with a per-message expiration
         ↓
         After the expiration → back to main queue (retry)
  NO  → send to .dead_letter with the failure reason
         ↓
         Manual intervention required
```

## Dead-letter recovery

Fix the cause, then explicitly move the messages from `<queue_name>.dead_letter` back to `<queue_name>`.

## Idempotency

### Option A — Natural (default)

```typescript
async handle(event: DomainEvent): Promise<void> {
  const existing = await this.repo.search(id);
  if (existing) return; // already processed
  await this.useCase.execute({ ... });
}
```

### Option B — Inbox table (critical irreversible operations)

```typescript
async handle(event: DomainEvent): Promise<void> {
  if (await this.inboxRepo.exists(event.eventId)) return;
  await this.useCase.execute({ ... });
  await this.inboxRepo.save(event.eventId, event.eventName());
}
```

Table: `processed_events(event_id UUID PK, event_name, processed_at)` — purge > 30 days.
