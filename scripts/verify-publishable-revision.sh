#!/bin/sh
# shellcheck shell=sh
#
# Decide whether a named revision may be published to the environment the
# dispatched branch selected. Allow only when the revision is a 40-character
# hexadecimal object name, is reachable from that branch's current tip, and
# the latest required check named CI on that revision completed successfully.
# Fetching objects is not checking them out.
#
# Usage: scripts/verify-publishable-revision.sh <revision> <branch> <repository>
set -u

refuse() {
    printf '::error title=%s::%s\n' "$1" "$2"
    exit 1
}

if [ "$#" -ne 3 ]; then
    refuse "Invalid arguments" "Usage: scripts/verify-publishable-revision.sh <revision> <branch> <repository>"
fi

revision=$1
branch=$2
repository=$3

case "$revision" in
    ''|*[!0-9a-fA-F]*)
        refuse "Not a revision" "The named revision must be a 40-character hexadecimal object name."
        ;;
esac
if [ "${#revision}" -ne 40 ]; then
    refuse "Not a revision" "The named revision must be a 40-character hexadecimal object name."
fi

if [ -z "${GH_TOKEN-}" ]; then
    refuse "Checks could not be read" "GH_TOKEN is not set; the CI check cannot be read."
fi

if ! git fetch origin "$branch"; then
    refuse "Revision is not on the branch" "Could not fetch branch $branch."
fi
if ! git fetch origin "$revision"; then
    refuse "Revision is not on the branch" "Could not fetch revision $revision."
fi

if ! git merge-base --is-ancestor "$revision" "origin/$branch"; then
    refuse "Revision is not on the branch" "$revision is not reachable from $branch."
fi

wait_seconds=${PUBLISHABLE_REVISION_CHECK_WAIT_SECONDS:-30}
case "$wait_seconds" in
    ''|*[!0-9]*) wait_seconds=30 ;;
esac

checks_summary() {
    awk '
        {
            s = s $0
        }
        END {
            count = 0
            if (match(s, /"total_count":[ ]*[0-9]+/)) {
                line = substr(s, RSTART, RLENGTH)
                sub(/.*:/, "", line)
                gsub(/ /, "", line)
                count = line + 0
            }
            status = ""
            conclusion = ""
            if (match(s, /"check_runs":[ ]*\[/)) {
                rest = substr(s, RSTART)
                if (match(rest, /"status":[ ]*"[^"]*"/)) {
                    st = substr(rest, RSTART, RLENGTH)
                    sub(/.*"status":[ ]*"/, "", st)
                    sub(/".*/, "", st)
                    status = st
                }
                if (match(rest, /"conclusion":[ ]*("[^"]*"|null)/)) {
                    c = substr(rest, RSTART, RLENGTH)
                    sub(/.*"conclusion":[ ]*/, "", c)
                    gsub(/[" ]/, "", c)
                    if (c == "null") c = ""
                    conclusion = c
                }
            }
            printf "%s\t%s\t%s\n", count, status, conclusion
        }
    '
}

start=$(date +%s)
deadline=$((start + wait_seconds))
api_path="repos/${repository}/commits/${revision}/check-runs?check_name=CI&filter=latest"

while :; do
    if ! body=$(gh api "$api_path"); then
        refuse "Required checks did not pass" "Could not read the CI check for $revision."
    fi
    summary=$(printf '%s\n' "$body" | checks_summary)
    status=$(printf '%s\n' "$summary" | cut -f2)
    conclusion=$(printf '%s\n' "$summary" | cut -f3)

    if [ "$status" = completed ] && [ "$conclusion" = success ]; then
        exit 0
    fi
    if [ "$status" = completed ]; then
        refuse "Required checks did not pass" "The latest CI check for $revision concluded $conclusion."
    fi

    now=$(date +%s)
    if [ "$now" -ge "$deadline" ]; then
        refuse "Required checks did not pass" "No completed CI check for $revision yet."
    fi
    sleep 2
done
