#!/bin/sh
#
# One gate stage on its own, and the list of stages.
#
# When one stage goes red, re-running the whole gate to retest it pays for
# every other stage again. This runs that stage by the name the gate printed,
# through the gate's own runner and targets, after the prepare tier and the
# stage's own dependency — so it reproduces the stage as the gate runs it.
#
# It is a diagnostic, never a verification verdict: it runs neither the cheap
# tier nor the other stages, and only `make ci` answers whether a tree passes.
#
# Usage:
#   scripts/run-ci-stage.sh --list           # make ci-stages
#   scripts/run-ci-stage.sh "<stage name>"   # make ci-stage STAGE="<stage name>"
set -u

root="$(cd "$(dirname "$0")/.." && pwd)" || exit 1
cd "$root" || exit 1

. "$root/scripts/lib/ci-stages.sh"
. "$root/scripts/lib/ci-gate.sh"

ci_gate_runner() {
    make --no-print-directory "$1"
}

case "${1:-}" in
    --list)
        ci_stages_list
        exit 0
        ;;
    '')
        printf 'A stage name is required, for example: make ci-stage STAGE="Lint"\n' >&2
        ci_stages_list >&2
        exit 2
        ;;
esac

LOG_DIR="$(mktemp -d)" || exit 1

ci_gate_run_single "$1"
status=$?

printf 'Stage logs: %s\n' "$LOG_DIR"
exit "$status"
