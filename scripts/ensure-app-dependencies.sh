#!/bin/sh
#
# Install the app's dependencies unless the last installation already matches
# the declared ones.
#
# Run from the app directory, whose node_modules is a persistent volume that
# outlives checkouts and branches: the presence of an installed tool says
# nothing about whether it was installed from the dependencies now declared.
# A digest of the manifest and the lock file, written beside the installation
# only after `npm ci` succeeds, does. An installation with no digest, such as
# one made before this script existed, is treated as stale.
#
# POSIX sh only, so it runs in the Node image and in the gate's tests.
#
# Usage: sh scripts/ensure-app-dependencies.sh   (working directory: the app)
set -eu

marker=node_modules/.deps-fingerprint
declared="$(cat package.json package-lock.json | sha256sum | cut -d ' ' -f 1)"

if [ -f "$marker" ] && [ "$(cat "$marker")" = "$declared" ]; then
    echo 'Dependencies current: skipping npm ci'
    exit 0
fi

echo 'Dependencies changed: running npm ci'
rm -f "$marker"
npm ci
printf '%s\n' "$declared" > "$marker"
