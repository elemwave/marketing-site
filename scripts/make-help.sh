#!/bin/sh
#
# The `make help` listing: every rule that carries a `## description`.
#
# A target name may hold digits, dots and hyphens — `e2e` is one — so the
# match is on the rule's shape rather than on a character class that happens
# to cover today's names. An assignment such as `foo := bar ## note` is not a
# rule, and neither is a special target such as `.PHONY`.
#
# POSIX sh and awk only, so it runs on a host with no language toolchain.
#
# Usage: scripts/make-help.sh <makefile>...
set -eu

if [ -t 1 ]; then
    colour="$(printf '\033[36m')"
    reset="$(printf '\033[0m')"
else
    colour=''
    reset=''
fi

awk -v colour="$colour" -v reset="$reset" '
    /^[A-Za-z0-9_][A-Za-z0-9_.\/-]*:/ && index($0, "## ") {
        colon = index($0, ":")
        if (substr($0, colon + 1, 1) == "=") next
        printf "%s%-30s%s %s\n", colour, substr($0, 1, colon - 1), reset, substr($0, index($0, "## ") + 3)
    }
' "$@"
