# shellcheck shell=sh
#
# Runs the gate's stages: a tier at a time, the lanes of a tier in parallel,
# and every failure in a tier reported together once all its lanes finish.
#
# Reporting after the whole tier rather than at the first failure is the point:
# the cheap tier's defects are the quickest to fix, and learning about them one
# gate run at a time costs a run per defect.
#
# A stage runs its make target through `ci_gate_runner`, logs to its own file
# and records its exit status beside it. A later stage of the same lane, or a
# stage whose `after` dependency did not pass, is reported as not run rather
# than failed, so the summary names the stages that actually broke.
#
# Before sourcing: source scripts/lib/ci-stages.sh, define
# `ci_gate_runner <target>`, and set LOG_DIR to an empty writable directory.
# The entry points are scripts/run-ci-gate.sh and scripts/run-ci-stage.sh.
#
# POSIX sh. Sourcing this file defines functions and runs nothing.

ci_gate_status_file() {
    printf '%s/%s.status\n' "$LOG_DIR" "$(ci_stage_slug "$1")"
}

ci_gate_log_file() {
    printf '%s/%s.log\n' "$LOG_DIR" "$(ci_stage_slug "$1")"
}

ci_gate_mark_not_run() {
    printf 'NOT RUN: %s (%s)\n' "$1" "$2"
    printf 'not run: %s\n' "$2" > "$(ci_gate_status_file "$1")"
}

# Run one stage. Waits for its `after` dependency's recorded status first.
ci_gate_run_stage() {
    ci_gate_after="$(ci_stage_after "$1")"
    if [ -n "$ci_gate_after" ]; then
        while [ ! -f "$(ci_gate_status_file "$ci_gate_after")" ]; do
            sleep 1
        done
        if [ "$(cat "$(ci_gate_status_file "$ci_gate_after")")" != 0 ]; then
            ci_gate_mark_not_run "$1" "$ci_gate_after did not pass"
            return 1
        fi
    fi

    printf '==> %s\n' "$1"
    # Standard input is closed: `docker compose run` reads it by default, and
    # would otherwise swallow the stage list its lane is reading.
    if ci_gate_runner "$(ci_stage_target "$1")" < /dev/null > "$(ci_gate_log_file "$1")" 2>&1; then
        ci_gate_status=0
    else
        ci_gate_status=$?
    fi
    printf '%s\n' "$ci_gate_status" > "$(ci_gate_status_file "$1")"

    if [ "$ci_gate_status" = 0 ]; then
        printf -- '--- %s passed\n' "$1"
    else
        printf -- '--- %s failed (exit %s)\n' "$1" "$ci_gate_status"
    fi
    return "$ci_gate_status"
}

ci_gate_tier_lanes() {
    printf '%s\n' "$CI_STAGES" | awk -F'|' -v tier="$1" '$2 == tier && !seen[$3]++ { print $3 }'
}

ci_gate_lane_stages() {
    printf '%s\n' "$CI_STAGES" | awk -F'|' -v tier="$1" -v lane="$2" '$2 == tier && $3 == lane { print $1 }'
}

# Run one lane's stages in order. After a failure the rest are not run.
ci_gate_run_lane() {
    ci_gate_lane_failed=0
    ci_gate_lane_stages "$1" "$2" > "$LOG_DIR/lane-$1-$2.stages"
    while IFS= read -r ci_gate_stage; do
        if [ "$ci_gate_lane_failed" = 1 ]; then
            ci_gate_mark_not_run "$ci_gate_stage" 'an earlier stage in its lane did not pass'
            continue
        fi
        ci_gate_run_stage "$ci_gate_stage" || ci_gate_lane_failed=1
    done < "$LOG_DIR/lane-$1-$2.stages"
    return "$ci_gate_lane_failed"
}

# Name every stage of the tier that did not pass, with the tail of its log.
# A stage that recorded no result at all fails the tier: silence is never a pass.
ci_gate_report_tier() {
    ci_gate_unrecorded=0
    ci_stages_in_tier "$1" > "$LOG_DIR/tier-$1.stages"
    while IFS= read -r ci_gate_stage; do
        ci_gate_status_path="$(ci_gate_status_file "$ci_gate_stage")"
        if [ ! -f "$ci_gate_status_path" ]; then
            printf 'NOT RECORDED: %s (its lane ended before it ran)\n' "$ci_gate_stage" >&2
            ci_gate_unrecorded=1
            continue
        fi
        ci_gate_recorded="$(cat "$ci_gate_status_path")"
        case "$ci_gate_recorded" in
            0) ;;
            'not run: '*)
                printf 'NOT RUN: %s (%s)\n' "$ci_gate_stage" "${ci_gate_recorded#not run: }" >&2
                ;;
            *)
                printf '\nFAILED: %s (exit %s, full log %s)\n' \
                    "$ci_gate_stage" "$ci_gate_recorded" "$(ci_gate_log_file "$ci_gate_stage")" >&2
                tail -n 40 "$(ci_gate_log_file "$ci_gate_stage")" | sed 's/^/    /' >&2
                ;;
        esac
    done < "$LOG_DIR/tier-$1.stages"
    return "$ci_gate_unrecorded"
}

ci_gate_run_tier() {
    ci_gate_tier_lanes "$1" > "$LOG_DIR/tier-$1.lanes"
    ci_gate_pids=''
    while IFS= read -r ci_gate_lane; do
        ci_gate_run_lane "$1" "$ci_gate_lane" &
        ci_gate_pids="$ci_gate_pids $!"
    done < "$LOG_DIR/tier-$1.lanes"

    ci_gate_tier_status=0
    for ci_gate_pid in $ci_gate_pids; do
        wait "$ci_gate_pid" || ci_gate_tier_status=1
    done

    ci_gate_report_tier "$1" || ci_gate_tier_status=1
    return "$ci_gate_tier_status"
}

# The whole gate: every tier in order, stopping after the first red tier.
ci_gate_run_all() {
    for ci_gate_tier in $CI_TIERS; do
        printf '\n=== %s tier\n' "$ci_gate_tier"
        if ! ci_gate_run_tier "$ci_gate_tier"; then
            printf '\nGate failed in the %s tier; the tiers after it did not run.\n' "$ci_gate_tier" >&2
            return 1
        fi
    done
    printf '\nGate passed: every stage of every tier.\n'
}

# One named stage, in the gate's environment: the prepare tier, then the
# stage's `after` dependency, then the stage. A diagnostic, never a verdict.
ci_gate_run_single() {
    if ! ci_gate_single_tier="$(ci_stage_tier "$1")"; then
        printf 'Unknown stage: %s\nThe gate'"'"'s stages are:\n' "$1" >&2
        ci_stages_list >&2
        return 2
    fi

    printf 'Running "%s" on its own: diagnostic only — not a verification verdict.\n' "$1"
    printf 'Only make ci gives a verdict.\n'

    if [ "$ci_gate_single_tier" = prepare ]; then
        ci_stages_in_tier prepare > "$LOG_DIR/single.stages"
        while IFS= read -r ci_gate_stage; do
            ci_gate_run_stage "$ci_gate_stage" || return 1
            if [ "$ci_gate_stage" = "$1" ]; then
                break
            fi
        done < "$LOG_DIR/single.stages"
        return 0
    fi

    ci_gate_run_tier prepare || return 1

    ci_gate_single_after="$(ci_stage_after "$1")"
    if [ -n "$ci_gate_single_after" ]; then
        ci_gate_run_stage "$ci_gate_single_after" || {
            cat "$(ci_gate_log_file "$ci_gate_single_after")" >&2
            return 1
        }
    fi

    ci_gate_run_stage "$1"
    ci_gate_single_status=$?
    cat "$(ci_gate_log_file "$1")"
    return "$ci_gate_single_status"
}
