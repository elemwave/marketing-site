s = app

# Containers that mount the working tree run as the invoking user, so the gate
# leaves no root-owned files behind.
export HOST_UID := $(shell id -u)
export HOST_GID := $(shell id -g)

# Pinned to the major version CI runs, so a local failure belongs to the change
# rather than to the image.
NODE_IMAGE = node:22-alpine
repo-run = docker run --rm -u $(HOST_UID):$(HOST_GID) -e HOME=/tmp \
	-v "$(CURDIR):/repo" -w /repo $(NODE_IMAGE) sh -lc
infra-run = docker run --rm -u $(HOST_UID):$(HOST_GID) -e HOME=/tmp \
	-v "$(CURDIR)/infra:/infra" -w /infra $(NODE_IMAGE) sh -lc

.PHONY: help
help: ## Display this help message
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# --- Verification ---

.PHONY: ci
ci: deps lint typecheck test shape audit ## Run every CI check (see lint/typecheck/test for narrowed forms)

.PHONY: deps
deps: ## Ensure the app's dependencies are present in the container (idempotent)
	@docker compose run --rm --user 0:0 ${s} sh -lc \
		'[ "$$(stat -c %u /app/node_modules)" = "$(HOST_UID)" ] || chown -R $(HOST_UID):$(HOST_GID) /app/node_modules'
	@docker compose run --rm ${s} sh -lc 'test -x node_modules/.bin/eslint || npm ci'

.PHONY: lint
lint: ## Lint the app (add FILES="a.tsx b.tsx" to narrow)
	docker compose run --rm ${s} npm run lint -- $(FILES)

.PHONY: typecheck
typecheck: ## Type-check the app and the infrastructure (whole-project; tsc takes no file argument)
	docker compose run --rm ${s} npm run typecheck
	$(infra-run) 'npm ci --silent && npx tsc --noEmit'

.PHONY: test
test: ## Infrastructure tests (add PATHS="test/x.test.ts" to narrow)
	$(infra-run) 'npm ci --silent && npx jest $(PATHS)'

# --- Docker ---

.PHONY: audit
audit: ## Fail on high or critical dependency advisories in every ecosystem
	$(repo-run) 'cd projects/marketing && npm ci --silent && node /repo/tools/audit-gate/run.js --scope marketing'
	$(repo-run) 'cd infra && npm ci --silent && node /repo/tools/audit-gate/run.js --scope infrastructure'

.PHONY: shape
shape: shape-size shape-duplication shape-complexity ## Run every code-shape gate (whole tree; no narrowed form)

.PHONY: shape-size shape-size-report shape-size-update
shape-size: ## File size against the 800-line ceiling
	./scripts/check-file-size-budgets.sh
shape-size-report: ## File sizes, safe on a failing tree
	./scripts/check-file-size-budgets.sh --report
shape-size-update: ## Re-record the file size baseline
	./scripts/check-file-size-budgets.sh --update

.PHONY: shape-duplication shape-duplication-report shape-duplication-update
shape-duplication: ## Duplication against the per-area budgets
	./scripts/check-duplication-budgets.sh
shape-duplication-report: ## Duplication, safe on a failing tree
	./scripts/check-duplication-budgets.sh --report
shape-duplication-update: ## Re-record the duplication budgets
	./scripts/check-duplication-budgets.sh --update

.PHONY: shape-complexity shape-complexity-report shape-complexity-update
shape-complexity: ## Complexity against the recorded counts
	docker compose run --rm ${s} npm run shape
shape-complexity-report: ## Complexity, safe on a failing tree
	docker compose run --rm ${s} npm run shape:report
shape-complexity-update: ## Re-record the complexity baseline
	docker compose run --rm ${s} npm run shape:update

.PHONY: shape-apply-drift
shape-apply-drift: ## Apply the mechanical baseline drift (local only; never run in CI)
	./scripts/check-file-size-budgets.sh --apply-drift

.PHONY: init
init: rm build install up ## Build image, install dependencies and start the app

.PHONY: build
build: ## Build containers
	docker compose build

.PHONY: up
up: ## Start containers (detached)
	docker compose up -d
	@$(MAKE) --no-print-directory urls

.PHONY: urls
urls: ## Reprint the addresses the running stack publishes
	@echo "app: http://test.localhost.elemwave.com"

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

.PHONY: performance-budget
performance-budget: ## Check the static export against the performance budget (build first)
	docker compose run --rm ${s} npm run test:scripts
	docker compose run --rm ${s} npm run perf:budget

.PHONY: app-build
app-build: ## Build the static export of the app (projects/marketing/out)
	docker compose run --rm ${s} npm run build
