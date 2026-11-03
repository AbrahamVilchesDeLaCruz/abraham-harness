# Root Makefile: a thin dispatcher. Targets live in the modules under make/.
# Run `make` to see every target.

.DEFAULT_GOAL := help
.PHONY: help

PROJECT ?= {{PROJECT_NAME}}
PM      ?= pnpm

# Commands that provide secrets to an environment, for example:
#   SECRETS_DEV = doppler run --config dev --
SECRETS_LOCAL ?=
SECRETS_DEV   ?=
SECRETS_PROD  ?=

COMPOSE       = docker compose --project-directory .
COMPOSE_LOCAL = $(SECRETS_LOCAL) $(COMPOSE) -p $(PROJECT)-local -f infra/docker-compose.local.yml
COMPOSE_DEV   = $(SECRETS_DEV) $(COMPOSE) -p $(PROJECT)-dev -f infra/docker-compose.dev.yml
COMPOSE_PROD  = $(SECRETS_PROD) $(COMPOSE) -p $(PROJECT)-prod -f infra/docker-compose.prod.yml

# Starts Docker when it is not running, and stops the target when it cannot.
define ensure-docker
	@if ! docker info > /dev/null 2>&1; then \
		echo "Docker is not running. Trying to start it..."; \
		if [ "$$(uname)" = "Darwin" ]; then \
			open -a Docker; \
		elif [ "$$(uname)" = "Linux" ]; then \
			sudo systemctl start docker; \
		fi; \
		for i in $$(seq 1 30); do \
			docker info > /dev/null 2>&1 && break; \
			sleep 2; \
		done; \
		if ! docker info > /dev/null 2>&1; then \
			echo "Docker could not start. Start it manually and try again."; \
			exit 1; \
		fi; \
	fi
endef

include make/local.mk
include make/dev.mk
include make/prod.mk
include make/code.mk
-include make/project.mk

help: ## Show this help
	@grep -hE '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) \
		| sed -E 's/:.*## / ## /' \
		| awk 'BEGIN {FS = " ## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
