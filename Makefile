s = app

.PHONY: help
help: ## Display this help message
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# --- Docker ---

.PHONY: init
init: rm build install up ## Build image, install dependencies and start the app

.PHONY: build
build: ## Build containers
	docker compose build

.PHONY: up
up: ## Start containers (detached)
	docker compose up

.PHONY: logs
logs: ## Show docker containers logs (Add "c=..." to see a specific container)
	docker compose logs -f ${c}

.PHONY: stop
stop: ## Stop containers
	docker compose stop

.PHONY: rm
rm: ## Stop and delete containers / clean volumes
	docker compose stop
	docker compose rm -v -f

.PHONY: bash
bash: ## Connect to the app container
	docker compose exec ${s} sh

# --- npm (runs inside the app container) ---

.PHONY: install
install: ## Install project dependencies
	docker compose run --rm ${s} npm ci

.PHONY: app-build
app-build: ## Build the static export of the app (projects/marketing/out)
	docker compose run --rm ${s} npm run build

.PHONY: lint
lint: ## Lint the app
	docker compose run --rm ${s} npm run lint
