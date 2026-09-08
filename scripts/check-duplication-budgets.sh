#!/usr/bin/env bash
#
# Per-area duplication budgets.
#
# Runs jscpd once over the source trees and holds each of five areas against the
# duplication threshold recorded for it in `duplication-budgets.json`.
# The attribution and the comparison live in `scripts/lib/duplication-report.mjs`;
# this script's whole job is to produce a report for it.
#
# It needs a container of its own because the frontend container mounts only
# `./frontend` and therefore cannot see `backend/`, and a measurement that spans
# both is the point — the clone between `JiraApiClient` and `TaigaApiClient` is
# invisible to any per-stack run. The pattern follows `check-schema-drift.sh`,
# which reaches `@dbml/cli` through a throwaway Node container for the same
# reason.
#
# Three parts of the invocation below are load-bearing. Change any of them and
# every recorded percentage becomes a number produced by a different instrument:
#
#   * **The pinned jscpd version.** Not `@latest`. jscpd 4 and 5.0.12 disagree
#     substantially on the same tree — 827 clones against 1,641, and less than
#     half the backend duplication — so an unpinned version would fail this gate
#     on a pull request that changed nothing, and the failure would look like the
#     contributor's fault. A version bump is a deliberate act that re-records
#     every budget and says so.
#   * **`--absolute`.** jscpd strips the common path prefix without it, and the
#     reporter cannot attribute a clone to an area from a stripped path. It
#     refuses rather than guessing, but the flag is what makes that unnecessary.
#   * **The detection threshold, 8 lines / 60 tokens**, which is what
#     `measurements.md` recorded. Loosening it lowers every percentage at once.
#
# The exclusions are part of the measurement too, not housekeeping. Without them
# the figure is dominated by vendored and generated code — `node_modules`,
# `vendor`, `.next`, `cdk.out` — and means nothing at all.
#
# The report is usually written to a temporary directory outside the working
# tree, so there is no new generated directory to register in
# `scripts/lib/workspace-ownership.sh`, and the container runs as the invoking
# user so nothing it does leaves root-owned files in a bind mount. Not every
# daemon can see this process's `/tmp`, so the mount is probed before it is
# relied on and falls back to an ignored workspace-local temporary parent.
#
# Usage:
#   scripts/check-duplication-budgets.sh              # check (default)
#   scripts/check-duplication-budgets.sh --report     # show current value, threshold and headroom
#   scripts/check-duplication-budgets.sh --update     # record rounded-up thresholds
#
# Exit codes:
#   0  every area is at or below its recorded threshold
#   1  an area holds more duplication than its threshold permits
#   2  the report, the baseline, the tooling, or the invocation is unusable
set -Eeuo pipefail

# Pinned exactly. See the header: an unpinned version moves the numbers more
# than a quarter of code changes do.
readonly JSCPD_VERSION="5.0.12"
readonly NODE_IMAGE="${DUPLICATION_NODE_IMAGE:-public.ecr.aws/docker/library/node:22-alpine}"

# The setting `measurements.md` recorded. Changing either value invalidates
# every recorded percentage.
readonly MIN_LINES=8
readonly MIN_TOKENS=60

readonly SCANNED_PATHS=(
    projects/marketing
    infra
    infra/test
)

readonly IGNORE_PATTERN='**/node_modules/**,**/vendor/**,**/.next/**,**/.open-next/**,**/cdk.out/**,**/coverage/**,**/test-results/**,**/playwright-report/**,**/*.lock,**/package-lock.json,**/.git/**'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=lib/tool-image.sh
source "$SCRIPT_DIR/lib/tool-image.sh"

MODE="check"

usage() {
    echo "Usage: check-duplication-budgets.sh [--report | --update]" >&2
}

while (( $# > 0 )); do
    case "$1" in
        --report|--update)
            MODE="${1#--}"
            shift
            ;;
        --check)
            MODE="check"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown argument: $1" >&2
            usage
            exit 2
            ;;
    esac
done

REPORT_PARENT="${TMPDIR:-/tmp}"
REPORT_PARENT_CREATED=0
REPORT_DIR=""
cleanup() {
    local status=$?
    [[ -n "$REPORT_DIR" ]] && rm -rf "$REPORT_DIR"
    if [[ "$REPORT_PARENT_CREATED" -eq 1 ]]; then
        rmdir "$REPORT_PARENT" 2>/dev/null || true
    fi
    return "$status"
}
trap cleanup EXIT

ensure_tool_image "$NODE_IMAGE" || exit 2

# Whether the daemon can reach a directory bind-mounted from here, and whether a
# container running as this user can then write into it.
#
# `DOCKER_HOST` does not answer that. This script used to infer the answer from
# it — anything other than unset or `unix://` meant a daemon with a filesystem
# of its own — but a rootless daemon, or one reached through a Docker context,
# has exactly that isolation without ever setting the variable. Where the daemon
# cannot see the path it mounts a fresh root-owned directory in its place, and
# jscpd then fails writing its own report with `Permission denied (os error 13)`,
# which reads as jscpd being broken rather than as the mount never having
# arrived. `scripts/tests/duplication-budgets-test.sh` already learned this for
# the fixture mount it needs; the report mount needs it for the same reason.
#
# Probing writes rather than reads because writing is what the gate does, and a
# directory the daemon can read is not necessarily one this uid can write to.
bind_mount_writable() {
    local dir="$1"
    local seen=""

    rm -f "$dir/.bind-probe"
    docker run --rm \
        -u "$(id -u):$(id -g)" \
        -v "$dir:/probe" \
        "$NODE_IMAGE" \
        sh -c 'printf writable > /probe/.bind-probe' >/dev/null 2>&1 || return 1

    seen="$(cat "$dir/.bind-probe" 2>/dev/null)" || seen=""
    rm -f "$dir/.bind-probe"

    [[ "$seen" == "writable" ]]
}

new_report_dir() {
    REPORT_DIR="$(mktemp -d "$REPORT_PARENT/boards-duplication.XXXXXX")"
    # Remote Docker bind mounts may map the directory owner to nobody; the report
    # holds only generated duplication metrics, and the cleanup removes it.
    chmod 0777 "$REPORT_DIR"
}

new_report_dir

# The repository is bind-mounted successfully by every other container in this
# project, so it is the fallback when the temporary directory cannot be reached.
# Removed on exit either way; `.gitignore` covers an interrupted run.
if ! bind_mount_writable "$REPORT_DIR"; then
    rm -rf "$REPORT_DIR"
    REPORT_DIR=""
    REPORT_PARENT="$ROOT_DIR/.duplication-test-tmp.docker"
    mkdir -p "$REPORT_PARENT"
    chmod 0777 "$REPORT_PARENT"
    REPORT_PARENT_CREATED=1
    new_report_dir

    if ! bind_mount_writable "$REPORT_DIR"; then
        echo "Docker cannot write to a directory bind-mounted from this host." >&2
        echo "Tried ${TMPDIR:-/tmp} and $REPORT_PARENT; a file written from inside" >&2
        echo "the container was absent on the host, or could not be written at all." >&2
        echo "A rootless daemon, a Docker context, a daemon with a private /tmp or" >&2
        echo "user-namespace remapping does this. jscpd cannot produce a report" >&2
        echo "until it is resolved, and its own error would name only itself." >&2
        exit 2
    fi
fi

# Only the reporter's mount varies by mode. jscpd's is unconditionally
# read-only below, because jscpd never writes to the tree whatever mode this
# script was called in; the reporter writes `duplication-budgets.json`, and then
# only for `update`. Two mounts rather than one shared variable, so neither
# grows write access it has no use for.
repo_mount="$ROOT_DIR:/repo:ro"
if [[ "$MODE" == "update" ]]; then
    repo_mount="$ROOT_DIR:/repo"
fi

# Every clone jscpd can find in the scanned trees, reported as JSON with
# absolute paths.
if ! docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$ROOT_DIR:/repo:ro" \
    -v "$REPORT_DIR:/out" \
    -e npm_config_cache=/tmp/.npm \
    -e HOME=/tmp \
    -w /repo \
    "$NODE_IMAGE" \
    npx --yes "jscpd@$JSCPD_VERSION" \
    --min-lines "$MIN_LINES" \
    --min-tokens "$MIN_TOKENS" \
    --absolute \
    --reporters json \
    --output /out \
    --ignore "$IGNORE_PATTERN" \
    "${SCANNED_PATHS[@]}" \
    >"$REPORT_DIR/jscpd.log" 2>&1
then
    echo "jscpd failed to run. Output:" >&2
    cat "$REPORT_DIR/jscpd.log" >&2
    exit 2
fi

if [[ ! -f "$REPORT_DIR/jscpd-report.json" ]]; then
    echo "jscpd produced no report. Output:" >&2
    cat "$REPORT_DIR/jscpd.log" >&2
    exit 2
fi

# The reporter reads the tree to count each area's total lines, because the
# jscpd report carries no per-file line counts of its own.
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$repo_mount" \
    -v "$REPORT_DIR:/out:ro" \
    -e HOME=/tmp \
    -w /repo \
    "$NODE_IMAGE" \
    node /repo/scripts/lib/duplication-report.mjs \
    --root /repo \
    --report /out/jscpd-report.json \
    --budgets /repo/duplication-budgets.json \
    --mode "$MODE"
