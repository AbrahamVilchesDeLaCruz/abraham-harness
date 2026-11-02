# api-events with RabbitMQ

Apply the rules of `api-events`. This reference shows the flow over RabbitMQ.

## Full flow

```
UseCase
  → domainEventPublisher.publish(aggregate.pullDomainEvents())
    → AmqpMessageBus.publish() → RabbitMQ exchange
      → subscriber's queue
        → SubscribersBootstrapper.onModuleInit() → subscriber.init()
          → AmqpMessageBus.consume() → automatic setupQueues()
            → subscriber.on(event) → corresponding UseCase
```

`AmqpMessageBus` implements `DomainEventPublisher` and `DomainEventConsumer`. See `references/api-events-infra.md`.

## External Documentation

- [RabbitMQ — Concepts](https://www.rabbitmq.com/tutorials/amqp-concepts) — exchanges, queues, bindings, routing keys
- [RabbitMQ — Topic Exchange](https://www.rabbitmq.com/tutorials/tutorial-five-javascript) — routing by topic (our pattern)
- [amqplib — npm](https://www.npmjs.com/package/amqplib) — Node.js library used in `AmqpMessageBus`
