#!/usr/bin/env bash
#
# Make one pinned image available locally, retrying a transient pull failure.
#
# Usage:
#   scripts/ensure-ci-images.sh <image>
#
# Exit codes:
#   0  the image is present locally
#   1  the image could not be obtained after the retry budget
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/tool-image.sh
source "$SCRIPT_DIR/lib/tool-image.sh"

ensure_tool_image "$1"
