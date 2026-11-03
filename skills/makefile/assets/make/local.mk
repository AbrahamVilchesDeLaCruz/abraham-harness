# Managed by abraham-harness, sha256=b7326bb7a3c83b11e3bca98a6597ee42d9e012ce9cd01a3efa507eadcaa5d807. Put your own targets in make/project.mk.
# Local: the whole stack in Docker, with no paid services and no remote secrets.

.PHONY: setup local local-down local-logs local-status local-reset

APP_DIRS ?= apps/api apps/client

setup: ## Create .env.local from .env.example in each app, keeping existing files
	@for dir in $(APP_DIRS); do \
		if [ -f "$$dir/.env.example" ] && [ ! -f "$$dir/.env.local" ]; then \
			cp "$$dir/.env.example" "$$dir/.env.local"; \
			echo "Created $$dir/.env.local"; \
		fi; \
	done

local: setup ## Start the whole local stack in Docker
	$(ensure-docker)
	$(COMPOSE_LOCAL) up -d --build --wait

local-down: ## Stop the local stack, and keep its data
	$(ensure-docker)
	$(COMPOSE_LOCAL) down

local-logs: ## Follow the logs of the local stack
	$(ensure-docker)
	$(COMPOSE_LOCAL) logs -f --tail=100

local-status: ## Show the containers of the local stack
	$(ensure-docker)
	$(COMPOSE_LOCAL) ps

local-reset: ## DELETE local volumes and start again (needs CONFIRM=yes)
	@if [ "$(CONFIRM)" != "yes" ]; then \
		echo "This deletes all local data. Run: make local-reset CONFIRM=yes"; \
		exit 1; \
	fi
	$(ensure-docker)
	$(COMPOSE_LOCAL) down -v
	$(COMPOSE_LOCAL) up -d --build --wait
