#!/usr/bin/env bash
#
# Making a pinned tool image available, with bounded retries.
#
# Two gate scripts reach for a container that is not a Compose service — the
# duplication gate's Node image and the file-convention gate's checker — and
# both need the same thing: an exact tag, present locally, with a transient
# registry failure retried rather than treated as a verdict.
#
# This is deliberately *not* `scripts/pull-ci-tool-image.sh`, which implements
# the repository's CI tool-image acquisition policy. That script validates its
# argument against `^…:[0-9]+\.[0-9]+\.[0-9]+$` — the tag must begin with a
# digit — and `editorconfig-checker` publishes `v3.8.0`. Passing it would exit
# 64 before pulling anything. Widening a shared, tested policy regex to suit one
# caller is a worse trade than this, so the two coexist: that script owns
# CI-acquired images with digit tags, this one owns pinned images a gate script
# pulls for itself, in the manner `check-schema-drift.sh` already established
# for its Node and Python images.
#
# Do not "unify" the two without changing the regex and its test.

readonly TOOL_IMAGE_PULL_ATTEMPTS="${TOOL_IMAGE_PULL_ATTEMPTS:-3}"
readonly TOOL_IMAGE_RETRY_DELAY_SECONDS="${TOOL_IMAGE_RETRY_DELAY_SECONDS:-5}"

# Exit zero only when the exact image is available locally.
ensure_tool_image() {
    local image="$1"
    local attempt

    if docker image inspect "$image" >/dev/null 2>&1; then
        return 0
    fi

    for (( attempt = 1; attempt <= TOOL_IMAGE_PULL_ATTEMPTS; attempt++ )); do
        if docker pull "$image" >/dev/null 2>&1; then
            return 0
        fi

        if (( attempt < TOOL_IMAGE_PULL_ATTEMPTS )); then
            echo "Pulling $image failed (attempt $attempt); retrying in ${TOOL_IMAGE_RETRY_DELAY_SECONDS}s." >&2
            sleep "$TOOL_IMAGE_RETRY_DELAY_SECONDS"
        fi
    done

    echo "Could not obtain the pinned image $image after $TOOL_IMAGE_PULL_ATTEMPTS attempts." >&2
    return 1
}
