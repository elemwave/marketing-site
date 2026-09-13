#!/bin/sh
#
# The full verification gate, as `make ci` runs it.
#
# Every stage scripts/lib/ci-stages.sh declares runs, a tier at a time:
#
#   prepare  image and dependency preparation
#   cheap    every check needing no service, build or test suite, in parallel
#   verify   the test suites, the static export, and what reads the export
#
# A tier starts only once the tier before it is green, and every failure in a
# tier is reported together. There is no argument, flag or environment variable
# that leaves a tier out, so a pass from this script covers every stage.
# `make ci-stage STAGE="..."` re-runs one stage as a diagnostic; only this
# script gives a verdict.
#
# Judge it by its own exit status: piping its output reports the pipe's.
#
# Usage: scripts/run-ci-gate.sh
set -u

root="$(cd "$(dirname "$0")/.." && pwd)" || exit 1
cd "$root" || exit 1

. "$root/scripts/lib/ci-stages.sh"
. "$root/scripts/lib/ci-gate.sh"

ci_gate_runner() {
    make --no-print-directory "$1"
}

LOG_DIR="$(mktemp -d)" || exit 1
printf 'Stage logs: %s\n' "$LOG_DIR"

ci_gate_run_all
status=$?

printf 'Stage logs: %s\n' "$LOG_DIR"
exit "$status"
