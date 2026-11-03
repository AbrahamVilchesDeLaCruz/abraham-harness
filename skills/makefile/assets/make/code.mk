# Code: the same commands in every project, through the package manager.

.PHONY: test test-e2e lint format typecheck

test: ## Run the unit tests
	$(PM) test

test-e2e: ## Run the end-to-end tests
	$(PM) test:e2e

lint: ## Run the linter
	$(PM) lint

format: ## Format the code
	$(PM) format

typecheck: ## Check the types
	$(PM) typecheck
