# shellcheck shell=sh
#
# Making a pinned tool image available, with bounded retries.
#
# Two gate scripts reach for a container that is not a Compose service — the
# duplication gate's Node image and the one `make ci-images` prepares — and
# both need the same thing: an exact tag, present locally, with a transient
# registry failure retried rather than treated as a verdict.
#
# The shape of the retry is the load-bearing part. `public.ecr.aws` rate-limits
# anonymous pulls by source IP, so a refusal arrives in milliseconds rather
# than as a timeout, and CI's six jobs all start their pull within the same
# second. A short window retried in lockstep therefore fails the same way
# twice: the 3 attempts at a fixed 5s this once held spanned 12 seconds, which
# outlasted no limit and kept the jobs in step. Growing the delay widens the
# window to roughly half a minute, and the jitter pulls concurrent callers
# apart.
#
# The reason a pull failed is reported, not discarded. A gate that prints only
# "failed (attempt 1)" leaves the next reader inferring whether the registry
# refused them, the tag moved, or the network broke.
#
# POSIX sh, so `tools/ci-gate/tests/tool-image.test.js` can exercise it inside
# the Node image, which carries `sh` but not `bash`. Sourcing this file defines
# functions and runs nothing.

TOOL_IMAGE_PULL_ATTEMPTS="${TOOL_IMAGE_PULL_ATTEMPTS:-5}"
TOOL_IMAGE_RETRY_DELAY_SECONDS="${TOOL_IMAGE_RETRY_DELAY_SECONDS:-2}"
TOOL_IMAGE_RETRY_MAX_DELAY_SECONDS="${TOOL_IMAGE_RETRY_MAX_DELAY_SECONDS:-16}"

# A whole number of seconds in 0..$1. Seeded per call from the kernel rather
# than from the clock, because callers that collide are callers that started in
# the same second and a time-seeded generator would hand them the same delay.
tool_image_jitter() {
    tool_image_entropy="$(od -An -N2 -tu2 < /dev/urandom 2>/dev/null | tr -cd '0-9')"
    [ -n "$tool_image_entropy" ] || tool_image_entropy=0
    echo "$(( tool_image_entropy % ($1 + 1) ))"
}

# The registry's own words, indented under the attempt that provoked them.
tool_image_report_reason() {
    [ -s "$1" ] || return 0
    sed 's/^/  /' "$1" >&2
}

# Exit zero only when the exact image is available locally.
ensure_tool_image() {
    tool_image_name="$1"
    tool_image_attempt=1
    tool_image_delay="$TOOL_IMAGE_RETRY_DELAY_SECONDS"

    if docker image inspect "$tool_image_name" >/dev/null 2>&1; then
        return 0
    fi

    tool_image_errors="$(mktemp)"

    while :; do
        if docker pull "$tool_image_name" >/dev/null 2>"$tool_image_errors"; then
            rm -f "$tool_image_errors"
            return 0
        fi

        [ "$tool_image_attempt" -lt "$TOOL_IMAGE_PULL_ATTEMPTS" ] || break

        tool_image_wait="$(( tool_image_delay + $(tool_image_jitter "$TOOL_IMAGE_RETRY_DELAY_SECONDS") ))"
        printf 'Pulling %s failed (attempt %s); retrying in %ss.\n' \
            "$tool_image_name" "$tool_image_attempt" "$tool_image_wait" >&2
        tool_image_report_reason "$tool_image_errors"
        sleep "$tool_image_wait"

        tool_image_delay="$(( tool_image_delay * 2 ))"
        [ "$tool_image_delay" -le "$TOOL_IMAGE_RETRY_MAX_DELAY_SECONDS" ] ||
            tool_image_delay="$TOOL_IMAGE_RETRY_MAX_DELAY_SECONDS"
        tool_image_attempt="$(( tool_image_attempt + 1 ))"
    done

    printf 'Pulling %s failed (attempt %s).\n' "$tool_image_name" "$tool_image_attempt" >&2
    tool_image_report_reason "$tool_image_errors"
    printf 'Could not obtain the pinned image %s after %s attempts.\n' \
        "$tool_image_name" "$TOOL_IMAGE_PULL_ATTEMPTS" >&2
    rm -f "$tool_image_errors"
    return 1
}
