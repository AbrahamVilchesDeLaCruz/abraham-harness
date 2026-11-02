# api-shared with RabbitMQ

The concept skill `api-shared` defines the rules.

- `AmqpMessageBus` implements `DOMAIN_EVENT_PUBLISHER` and `DOMAIN_EVENT_CONSUMER`: it publishes events to the bus and consumes them from it.
- It is a singleton shared by all modules, in `shared/infrastructure/event-bus/amqp-message-bus.ts`.
- `AMQP_URI` for RabbitMQ (not `RABBITMQ_URL`).
