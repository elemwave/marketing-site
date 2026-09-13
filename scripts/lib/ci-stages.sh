# shellcheck shell=sh
#
# The full gate's stages.
#
# This is the one declaration of what the gate runs. `make ci` runs it,
# `make ci-stages` lists it, `make ci-stage` runs one entry of it, and the CI
# parity test holds the workflow to the same targets. A stage added anywhere
# else is a stage one of those four does not know about.
#
# One stage per line: name|tier|lane|target|after
#
#   name    What the gate prints and `make ci-stage STAGE=...` accepts.
#   tier    prepare, cheap or verify, run in that order. A tier starts only
#           once every stage of the tier before it has passed. The cheap tier
#           holds every check that needs no service, build or test suite, so
#           its failures arrive in seconds rather than after the expensive
#           stages, and nothing can run the verify tier without it.
#   lane    Lanes within a tier run in parallel; the stages of one lane run in
#           order. Stages that write the same artefacts share a lane: the app
#           tests write coverage and the export writes .next and out, both
#           under projects/marketing.
#   target  The make target the stage runs. CI calls the same target.
#   after   A stage of the same tier that must pass before this one starts.
#
# POSIX sh, so a worker host needs no language toolchain to run the gate.
# Sourcing this file defines functions and runs nothing.

CI_STAGES='Tool images|prepare|deps|ci-images|
App dependencies|prepare|deps|deps|
Workspace dependencies|prepare|deps|deps-workspace|
Lint|cheap|lint|lint|
Type-check|cheap|typecheck|typecheck|
File size|cheap|size|shape-size|
Duplication|cheap|duplication|shape-duplication|
Complexity|cheap|complexity|shape-complexity|
Audit|cheap|audit|audit|
App tests|verify|app|test-app|
Static export|verify|app|app-build|
Infrastructure tests|verify|infrastructure|test-infrastructure|
Browser tests|verify|browser|e2e|Static export
Performance budget|verify|budget|performance-budget|Static export'

CI_TIERS='prepare cheap verify'

ci_stages_list() {
    printf '%s\n' "$CI_STAGES" | cut -d'|' -f1
}

ci_stages_in_tier() {
    printf '%s\n' "$CI_STAGES" | awk -F'|' -v tier="$1" '$2 == tier { print $1 }'
}

# Print one field of the named stage, or nothing when it is empty.
# Status 2 when no stage has that name.
ci_stage_field() {
    printf '%s\n' "$CI_STAGES" | awk -F'|' -v name="$1" -v field="$2" '
        $1 == name { found = 1; if ($field != "") print $field }
        END { exit found ? 0 : 2 }
    '
}

ci_stage_tier() {
    ci_stage_field "$1" 2
}

ci_stage_lane() {
    ci_stage_field "$1" 3
}

ci_stage_target() {
    ci_stage_field "$1" 4
}

ci_stage_after() {
    ci_stage_field "$1" 5
}

ci_stage_slug() {
    printf '%s\n' "$1" | tr 'A-Z ' 'a-z-'
}
