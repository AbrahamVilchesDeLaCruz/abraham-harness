# Managed by abraham-harness, sha256=ba6e484a53a9a050eefb917cf188545f357296e282e9d8b3e249d72975e63688. Put your own targets in make/project.mk.
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
