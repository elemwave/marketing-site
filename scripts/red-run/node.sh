#!/usr/bin/env bash
#
# Stands in for `node` in the red run (.overboards/red-run.json). The worker
# gives Node's own runner every *.test.js outside a Vitest package, which here
# means the gate tooling tests under tools/, and runs each from the tree's
# root as `--test --test-reporter=junit --test-reporter-destination=<report>
# ./<file>`. Those tests are Vitest's: projects/marketing/vitest.config.mjs
# includes ../../tools/**/*.test.{js,mjs}. A file that imports vitest is
# therefore run by Vitest from projects/marketing, and its JSON results are
# written as the junit report Node's runner would have written
# (vitest-junit.mjs). Any other file runs under node itself.
set -Eeuo pipefail

# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

workdir="$(red_run_workdir)"
red_run_report_mounts "$@"
file="${*: -1}"
file="${file#./}"
if ! grep -Eq "from ['\"]vitest['\"]" "$workdir/$file" 2>/dev/null; then
    red_run_in_node "$workdir" node "$@"
    exit
fi

report=''
for arg in "$@"; do
    case "$arg" in
        --test-reporter-destination=*) report="${arg#*=}" ;;
    esac
done
[ -n "$report" ] || red_run_fail 'no --test-reporter-destination to write the junit report to'
app="$RED_RUN_TREE/projects/marketing"
mkdir -p "$(dirname "$report")"
results="$(mktemp -d "$(dirname "$report")/vitest.XXXXXX")"
# shellcheck disable=SC2329 # run by the EXIT trap
remove_results() { rm -rf "$results"; }
trap remove_results EXIT

red_run_modules "$app"
status=0
red_run_in_node "$app" npx --no -- vitest run "$workdir/$file" \
    --reporter=json --outputFile="$results/results.json" || status=$?
if [ -s "$results/results.json" ]; then
    red_run_in_node "$RED_RUN_TREE" node scripts/red-run/vitest-junit.mjs \
        "$results/results.json" "$file" "$report"
fi
exit "$status"
