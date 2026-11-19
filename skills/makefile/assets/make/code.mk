# Managed by abraham-harness, sha256=699d2c6f91551ce3e452e01f80ba02fd9935d723f746ad270685dae83a828b87. Put your own targets in make/project.mk.
# Code: the same commands in every project, through the package manager.

.PHONY: test test-e2e lint format typecheck

test: ## Run the unit tests
	$(PM) run test

test-e2e: ## Run the root full-test orchestrator (unit + E2E)
	$(PM) run test:e2e

lint: ## Run the linter
	$(PM) run lint

format: ## Format the code
	$(PM) run format

typecheck: ## Check the types
	$(PM) run typecheck
