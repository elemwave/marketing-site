#!/bin/sh
#
# Refuse to go on when a workspace's installed dependencies do not match the
# ones it declares.
#
# The repository-level checks run in the Node image with the repository
# mounted, so they read each workspace's own node_modules, which `make deps`
# does not refresh. Without this guard a check run after a lock file change
# passes or fails against the previous versions and says nothing. This only
# looks: it installs nothing and needs no network, and the person it stops
# runs `make deps-workspace`. Whether an installation is current is decided by
# ensure-app-dependencies.sh --check, so the install and this guard agree.
#
# POSIX sh only, so it runs in the Node image and in the gate's tests.
#
# Usage: sh scripts/require-workspace-dependencies.sh <workspace>...   (working directory: the repository)
set -eu

checker="$(cd "$(dirname "$0")" && pwd)/ensure-app-dependencies.sh"
stale=0

for workspace in "$@"; do
    if ! (cd "$workspace" && sh "$checker" --check) 2>/dev/null; then
        echo "$workspace: installed dependencies do not match its package.json and package-lock.json; run 'make deps-workspace'" >&2
        stale=1
    fi
done

exit "$stale"
