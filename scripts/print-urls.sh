#!/bin/sh
#
# The addresses the running stack publishes, for `make up` and `make urls`.
#
# The host port is chosen by whoever starts the stack (APP_HTTP_PORT), so the
# address printed has to follow it; port 80 is left implicit, as a browser
# leaves it.
#
# Usage: scripts/print-urls.sh <host port>
set -eu

port="${1:?usage: scripts/print-urls.sh <host port>}"
host='test.localhost.elemwave.com'

if [ "$port" = 80 ]; then
    printf 'app: http://%s\n' "$host"
else
    printf 'app: http://%s:%s\n' "$host" "$port"
fi
