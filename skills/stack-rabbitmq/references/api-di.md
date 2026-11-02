# api-di with RabbitMQ

The concept skill `api-di` defines the rules.

- `DOMAIN_EVENT_CONSUMER` consumes AMQP queues.
- `AmqpMessageBus` is one singleton under two distinct contracts: `DOMAIN_EVENT_PUBLISHER` and `DOMAIN_EVENT_CONSUMER`. See `references/api-di.md` in `stack-nestjs` for its registration with `useExisting`.
- `Amqp*` concrete classes are registered only in the infrastructure module, and are never exported.
