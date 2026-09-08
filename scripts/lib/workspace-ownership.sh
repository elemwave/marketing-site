#!/usr/bin/env bash
#
# The single definition of the directories whose ownership the project repairs.
#
# Generated and verification output is written by containers running as root
# into bind-mounted working trees. Left alone, the next command that runs as
# HOST_UID cannot remove it, and the failure surfaces much later as an
# unrelated-looking EACCES in the CI gate.
#
# Every consumer reads this file:
#   - scripts/heal-workspace-ownership.sh   repairs, using container paths
#   - scripts/check-workspace-ownership.sh  warns, using working-tree paths
#   - docker/backend/docker-entrypoint.sh   normalises at container start
#
# The two consumers do not share a path vocabulary, so the set is held as
# names plus the prefixes that qualify them. Add a directory here and every
# consumer picks it up; there is deliberately nowhere else to add one.

workspace_ownership_services() {
    printf '%s\n' frontend backend infrastructure
}

# Directories each service writes generated or verification output to.
workspace_ownership_names() {
    case "$1" in
        frontend)
            printf '%s\n' \
                node_modules \
                coverage \
                .next \
                .open-next \
                test-results \
                playwright-report \
                next-env.d.ts
            ;;
        backend)
            printf '%s\n' \
                vendor \
                var \
                .phpunit.cache \
                .php-cs-fixer.cache
            ;;
        infrastructure)
            printf '%s\n' \
                node_modules \
                cdk.out
            ;;
        *)
            return 1
            ;;
    esac
}

workspace_ownership_container_prefix() {
    case "$1" in
        frontend) printf '%s' /app/ ;;
        backend) printf '%s' /var/www/backend/ ;;
        infrastructure) printf '%s' /workspace/infrastructure/ ;;
        *) return 1 ;;
    esac
}

workspace_ownership_tree_prefix() {
    case "$1" in
        frontend) printf '%s' frontend/ ;;
        backend) printf '%s' backend/ ;;
        infrastructure) printf '%s' infrastructure/ ;;
        *) return 1 ;;
    esac
}

# How a service's container is started.
#
# `frontend` and `backend` are Compose services. `infrastructure` is not: its
# checks run through a plain `docker run` against a stock Node image with the
# repository mounted, so the heal has to reach it the same way. CDK's own asset
# bundling runs its containers as root, which is what leaves root-owned output
# in cdk.out even though the checks themselves run as the invoking user.
workspace_ownership_runner() {
    case "$1" in
        frontend | backend) printf '%s' compose ;;
        infrastructure) printf '%s' docker ;;
        *) return 1 ;;
    esac
}

# Names mounted as named volumes rather than living in the working tree.
# They are healed inside the container but are invisible to the host guard.
workspace_ownership_is_named_volume() {
    case "$1/$2" in
        frontend/node_modules) return 0 ;;
        backend/vendor) return 0 ;;
        *) return 1 ;;
    esac
}

workspace_ownership_container_path() {
    local service="$1"
    local name="$2"
    local prefix

    prefix="$(workspace_ownership_container_prefix "$service")" || return 1
    printf '%s%s' "$prefix" "$name"
}

# Empty for a named volume: there is no working-tree path to inspect.
workspace_ownership_tree_path() {
    local service="$1"
    local name="$2"
    local prefix

    prefix="$(workspace_ownership_tree_prefix "$service")" || return 1

    if workspace_ownership_is_named_volume "$service" "$name"; then
        return 0
    fi

    printf '%s%s' "$prefix" "$name"
}
