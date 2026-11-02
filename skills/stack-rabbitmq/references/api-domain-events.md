# api-domain-events with RabbitMQ

Apply the rules of `api-domain-events`. These are the RabbitMQ details.

- `AmqpMessageBus` publishes and consumes the events in RabbitMQ. See `references/api-events-infra.md`.
- `fromPrimitives()` is required for deserialization by the AMQP consumer.
- The exchange uses `eventName` as the routing key.

## External Documentation

- [RabbitMQ — Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript) — how the exchange works with `eventName` as the routing key
