#!/usr/bin/env bash
#
# Shared by the red-run launchers beside it, which .overboards/red-run.json
# names. Sourced, never run.
#
# Overboards' convergence runs a card's changed tests in a base tree and a
# work tree, each its own copy of these scripts, with no Git history. A
# launcher stands in for one runner's program and runs it in the Node image
# the Makefile pins (NODE_IMAGE), as every check here runs, with the tree
# mounted at its own path: the working directory, the test paths and the
# report the worker names inside the tree then mean the same in the container
# as outside it. It finds its tree from its own location, never a fixed
# checkout, so the base and the work each test their own files.
# Anything it prints for a person goes to stderr; stdout is the program's.

set -Eeuo pipefail

RED_RUN_TREE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
RED_RUN_UID="${HOST_UID:-$(id -u)}"
RED_RUN_GID="${HOST_GID:-$(id -g)}"
RED_RUN_LOCK="${RED_RUN_LOCK:-${TMPDIR:-/tmp}/marketing-site-red-run.lock}"
RED_RUN_IMAGE="$(sed -n 's/^NODE_IMAGE = //p' "$RED_RUN_TREE/Makefile")"

# shellcheck source=../lib/tool-image.sh
source "$RED_RUN_TREE/scripts/lib/tool-image.sh"

red_run_fail() {
    printf 'red-run: %s\n' "$1" >&2
    exit 1
}

# The caller's working directory, refused when outside the tree: the worker
# starts a command in a directory inside the tree being tested.
red_run_workdir() {
    local here
    here="$(pwd -P)"
    case "$here/" in
        "$RED_RUN_TREE"/*) printf '%s\n' "$here" ;;
        *) red_run_fail "$here is outside the tree $RED_RUN_TREE" ;;
    esac
}

# Adds to MOUNTS a mount for each absolute report destination named outside
# the tree, so the report is readable on the host afterwards. One inside the
# tree, where the worker puts it, is already reachable through the tree.
red_run_report_mounts() {
    local previous='' arg destination directory
    for arg in "$@"; do
        destination=''
        case "$previous" in
            --outputFile) destination="$arg" ;;
        esac
        case "$arg" in
            --outputFile=* | --test-reporter-destination=*) destination="${arg#*=}" ;;
        esac
        previous="$arg"
        case "$destination" in
            /*) ;;
            *) continue ;;
        esac
        directory="$(dirname "$destination")"
        case "$directory/" in
            "$RED_RUN_TREE"/*) continue ;;
        esac
        mkdir -p "$directory"
        MOUNTS+=(-v "$directory:$directory")
    done
}

# Runs "$@" holding the one lock every launcher shares, so that a one-time
# image pull or volume fill is done by one launcher while the others wait.
red_run_locked() {
    exec 9>"$RED_RUN_LOCK"
    flock 9
    "$@"
    exec 9>&-
}

# Fills a node_modules volume from the package's own lock file: created
# empty, which Docker makes owned by root, handed to the run's identity, then
# installed with `npm ci`. A second, empty volume marks it as complete, so a
# launcher killed part-way never mistakes a half-filled one for done.
red_run_fill_modules() {
    local volume="$1" package="$2"
    docker volume inspect "$volume-filled" >/dev/null 2>&1 && return 0
    docker volume rm -f "$volume" >/dev/null
    docker run --rm -u 0:0 -v "$volume:/modules" "$RED_RUN_IMAGE" \
        chown "$RED_RUN_UID:$RED_RUN_GID" /modules >&2
    docker run --rm -u "$RED_RUN_UID:$RED_RUN_GID" -e HOME=/tmp \
        -v "$RED_RUN_TREE:$RED_RUN_TREE" -v "$volume:$package/node_modules" -w "$package" \
        "$RED_RUN_IMAGE" npm ci --no-audit --no-fund >&2
    docker volume create "$volume-filled" >/dev/null
}

# Adds to MOUNTS the node_modules of one package directory of the tree
# (projects/marketing or infra). The worker gives a Vitest or Jest directory's
# node_modules a link to each entry of the agent's installed one, outside the
# tree: the directory those links point into is mounted, read-only, at its own
# path, so they resolve in the container. Where the agent's node_modules is
# the empty mount point of the Compose volume, there is nothing to link, and
# a volume installed from the package's lock file stands in.
red_run_modules() {
    local package="$1" entry target volume
    for entry in "$package"/node_modules/* "$package"/node_modules/.[!.]*; do
        [ -e "$entry" ] || [ -L "$entry" ] || continue
        if [ -L "$entry" ] && target="$(readlink "$entry")" && [ "${target#/}" != "$target" ]; then
            MOUNTS+=(-v "$(dirname "$target"):$(dirname "$target"):ro")
        fi
        return 0
    done
    volume="marketing-site-red-run-modules-$({ printf '%s\n' "$RED_RUN_IMAGE"; cat "$package/package.json" \
        "$package/package-lock.json"; } | sha256sum | cut -c1-12)-$RED_RUN_UID-$RED_RUN_GID"
    red_run_locked red_run_fill_modules "$volume" "$package"
    mkdir -p "$package/node_modules"
    MOUNTS+=(-v "$volume:$package/node_modules")
}

# Runs "$@" in the Node image as the run's identity, in the given directory,
# with the tree and MOUNTS.
red_run_in_node() {
    local workdir="$1"
    shift
    docker run --rm -u "$RED_RUN_UID:$RED_RUN_GID" -e HOME=/tmp -e CI \
        -v "$RED_RUN_TREE:$RED_RUN_TREE" ${MOUNTS[@]+"${MOUNTS[@]}"} -w "$workdir" "$RED_RUN_IMAGE" "$@"
}

MOUNTS=()
red_run_locked ensure_tool_image "$RED_RUN_IMAGE"
