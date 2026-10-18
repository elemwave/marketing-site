#!/usr/bin/env bash
#
# Stands in for `npx` in the red run (.overboards/red-run.json), for Vitest in
# projects/marketing and Jest in infra: npx in the Node image, in the package
# directory the worker started it in, with every argument it adds unchanged
# and that package's node_modules (see red_run_modules in lib.sh).
set -Eeuo pipefail

# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

workdir="$(red_run_workdir)"
[ -f "$workdir/package-lock.json" ] || red_run_fail "$workdir is not a package directory"
red_run_modules "$workdir"
red_run_report_mounts "$@"
red_run_in_node "$workdir" npx "$@"
