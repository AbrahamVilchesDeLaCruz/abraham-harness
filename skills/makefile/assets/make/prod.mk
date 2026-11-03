# Prod: the whole production stack in Docker. Set SECRETS_PROD when it needs secrets.

.PHONY: prod prod-down prod-logs prod-status

prod: ## Start the whole production stack in Docker
	$(ensure-docker)
	$(COMPOSE_PROD) up -d --build --wait

prod-down: ## Stop the production stack, and keep its data
	$(ensure-docker)
	$(COMPOSE_PROD) down

prod-logs: ## Follow the logs of the production stack
	$(ensure-docker)
	$(COMPOSE_PROD) logs -f --tail=100

prod-status: ## Show the containers of the production stack
	$(ensure-docker)
	$(COMPOSE_PROD) ps
