# Dev: the whole development stack in Docker. Set SECRETS_DEV when it needs secrets.

.PHONY: dev dev-down dev-logs dev-status

dev: ## Start the whole development stack in Docker
	$(ensure-docker)
	$(COMPOSE_DEV) up -d --build --wait

dev-down: ## Stop the development stack, and keep its data
	$(ensure-docker)
	$(COMPOSE_DEV) down

dev-logs: ## Follow the logs of the development stack
	$(ensure-docker)
	$(COMPOSE_DEV) logs -f --tail=100

dev-status: ## Show the containers of the development stack
	$(ensure-docker)
	$(COMPOSE_DEV) ps
