# Managed by abraham-harness, sha256=3207ea728e9b4d98d4bf4a1a3de45c64f9931c5cf911ba161afa0161341c67ec. Put your own targets in make/project.mk.
# Code: the same commands in every project, through the package manager.

.PHONY: test test-e2e lint format typecheck

test: ## Run the unit tests
	$(PM) run test

test-e2e: ## Run the end-to-end tests
	$(PM) run test:e2e

lint: ## Run the linter
	$(PM) run lint

format: ## Format the code
	$(PM) run format

typecheck: ## Check the types
	$(PM) run typecheck
