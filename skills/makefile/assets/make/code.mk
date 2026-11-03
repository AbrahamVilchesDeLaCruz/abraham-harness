# Managed by abraham-harness, sha256=15edcaf2a5962bcf4b274de9a092ee72b79563dfcdd3eccac5d765bfa8a925c0. Put your own targets in make/project.mk.
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
