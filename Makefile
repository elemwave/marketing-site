s = app

# Containers that mount the working tree run as the invoking user, so the gate
# leaves no root-owned files behind. A caller that already exports these
# (a rootless Docker host mapping 0:0 to the shared workspace owner) is
# respected instead of being overridden.
export HOST_UID ?= $(shell id -u)
export HOST_GID ?= $(shell id -g)

# The host port nginx publishes. Choose another when port 80 is already taken,
# for example by a second checkout's stack: `make up APP_HTTP_PORT=8081`.
export APP_HTTP_PORT ?= 80

# Pinned to the major version CI runs, so a local failure belongs to the change
# rather than to the image. Official images come from the approved registry;
# Playwright publishes no official image, so its own is pinned to the
# @playwright/test version instead.
NODE_IMAGE = public.ecr.aws/docker/library/node:24-alpine
PLAYWRIGHT_IMAGE = mcr.microsoft.com/playwright:v1.63.0-noble
repo-run = docker run --rm -u $(HOST_UID):$(HOST_GID) -e HOME=/tmp \
	-v "$(CURDIR):/repo" -w /repo $(NODE_IMAGE) sh -lc

.PHONY: help
help: ## Display this help message
	@sh scripts/make-help.sh $(MAKEFILE_LIST)

# --- Verification ---

.PHONY: ci
ci: ## Run every CI check: prepare, then the cheap tier in parallel, then verify (no way to leave a tier out)
	@sh scripts/run-ci-gate.sh

.PHONY: ci-stages
ci-stages: ## List the gate's stages by the names make ci prints
	@sh scripts/run-ci-stage.sh --list

.PHONY: ci-stage
ci-stage: ## Re-run one gate stage as a diagnostic, never a verdict: make ci-stage STAGE="Lint"
	@sh scripts/run-ci-stage.sh "$(STAGE)"

.PHONY: ci-images
# The Playwright image is left to `make e2e`, whose `docker run` pulls it on
# first use: pulling it here would cost every job that never runs a browser.
ci-images: ## Make the Node image and the app image available (idempotent)
	@docker image inspect $(NODE_IMAGE) >/dev/null 2>&1 || docker pull --quiet $(NODE_IMAGE)
	docker compose build ${s}

.PHONY: node-modules-ownership
node-modules-ownership: ## Give the node_modules volume back to the invoking user (idempotent)
	@docker compose run --rm --no-deps --user 0:0 ${s} sh -lc \
		'[ -z "$$(find /app/node_modules ! -user $(HOST_UID) | head -n 1)" ] || chown -R $(HOST_UID):$(HOST_GID) /app/node_modules'

.PHONY: deps
deps: node-modules-ownership ## Ensure the app's dependencies are present in the container (idempotent)
	@docker compose run --rm ${s} sh -lc 'test -x node_modules/.bin/eslint || npm ci'

.PHONY: deps-workspace
# Compose mounts the app's node_modules volume inside the bind-mounted app
# directory, so on a fresh checkout Docker creates projects/marketing/node_modules
# on the host as root, and an install into it as the invoking user fails.
# Both directories are created here too: under a rootless engine the invoking
# user is not the owner of the bind-mounted tree inside the container, so npm
# cannot create node_modules itself.
deps-workspace: ## Install the app and infrastructure dependencies the repository-level checks read
	@docker run --rm --user 0:0 -v "$(CURDIR):/repo" $(NODE_IMAGE) sh -c \
		'for d in /repo/projects/marketing/node_modules /repo/infra/node_modules; do \
			mkdir -p "$$d"; \
			[ -z "$$(find "$$d" ! -user $(HOST_UID) | head -n 1)" ] || chown -R $(HOST_UID):$(HOST_GID) "$$d"; \
		done'
	$(repo-run) 'cd projects/marketing && npm ci --silent'
	$(repo-run) 'cd infra && npm ci --silent'

.PHONY: lint
lint: ## Lint the app (add FILES="a.tsx b.tsx" to narrow)
	docker compose run --rm ${s} npm run lint -- $(FILES)

.PHONY: typecheck
typecheck: ## Type-check the app and the infrastructure (whole-project; tsc takes no file argument)
	docker compose run --rm ${s} npm run typecheck
	$(repo-run) 'cd infra && npx tsc --noEmit'

.PHONY: test
test: test-app test-infrastructure ## App and infrastructure tests with the coverage gates

.PHONY: test-app
test-app: ## App and tooling tests with the coverage gates (whole suite; coverage needs every file)
	$(repo-run) 'cd projects/marketing && npm run test:coverage'

.PHONY: test-infrastructure
test-infrastructure: ## Infrastructure tests (add PATHS=... to narrow)
	$(repo-run) 'cd infra && npx jest $(PATHS)'

# --- Docker ---

.PHONY: e2e
e2e: ## Browser tests across the supported browsers (build first)
	docker run --rm -u $(HOST_UID):$(HOST_GID) -e HOME=/tmp -e CI=1 \
		-v "$(CURDIR):/repo" -w /repo/projects/marketing \
		$(PLAYWRIGHT_IMAGE) npx playwright test

.PHONY: audit
audit: ## Fail on high or critical dependency advisories in every ecosystem
	$(repo-run) 'cd projects/marketing && node /repo/tools/audit-gate/run.js --scope marketing'
	$(repo-run) 'cd infra && node /repo/tools/audit-gate/run.js --scope infrastructure'

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
init: rm build install deps-workspace up ## Build image, install dependencies and start the app

.PHONY: build
build: ## Build containers
	docker compose build

.PHONY: up
up: ## Start containers (detached)
	docker compose up -d
	@$(MAKE) --no-print-directory urls

.PHONY: urls
urls: ## Reprint the addresses the running stack publishes
	@sh scripts/print-urls.sh "$(APP_HTTP_PORT)"

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
install: node-modules-ownership ## Install project dependencies
	docker compose run --rm ${s} npm ci

.PHONY: performance-budget
performance-budget: ## Check the static export against the performance budget (build first)
	docker compose run --rm ${s} npm run perf:budget

.PHONY: up-prod
up-prod: ## Build the static export and serve it on the same port as make up
	$(MAKE) --no-print-directory app-build
	docker compose run --rm --service-ports ${s} npm run start:export

.PHONY: app-build
app-build: ## Build the static export of the app (projects/marketing/out)
	docker compose run --rm ${s} npm run build
