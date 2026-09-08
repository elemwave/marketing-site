#!/usr/bin/env bash
#
# An 800-line ceiling on source files, and a list of the ones already past it.
#
# Every other check in this repository asks whether the code is correct. None
# asks whether a file has become too large to read, and file size is invisible
# in a diff: a change that adds four hundred lines to an already unreadable
# class looks exactly like one that adds four hundred lines of new feature.
# One rule, and one list:
#
#   A file may not exceed CEILING lines unless `file-size-budgets.txt` names it.
#
# The list is membership only. It says which files are permitted above the
# ceiling and nothing about how large any of them is, so editing one of them
# never asks anybody to touch it.
#
# It used to carry a line count per entry, and hold each file at it. That was a
# ratchet on the files that are hardest to read, which sounds like exactly the
# right place for one, and in practice it meant every change to one of those
# files also rewrote a shared, path-ordered record that every concurrent change
# was rewriting too — a commit's worth of ceremony for a file that was already
# too long, in return for a limit nobody had chosen. What is given up is stated
# plainly: a listed file can now grow without this gate refusing it. Growth of
# fifty lines or more still earns a line in the run's account, so it reaches a
# reviewer; it is simply not blocked. The list is a debt register to work from
# when repaying, not a budget to defend.
#
# The list has to stay true, which is the one thing that is still refused. An
# entry whose file has come back under the ceiling, or whose path has gone,
# is a standing permission attached to nothing — leave it and the file can grow
# back past 800 with nothing to say so. Both are mechanical to fix (drop the
# line), so `--apply-drift` does it for you; the plain check refuses, which is
# what makes the removal land in the commit.
#
# An `exempt=<reason>` annotation marks an entry as a deliberate size rather
# than debt: a generated file, say. It is kept even when the file is briefly
# under the ceiling, because a generated file that happens to be short this
# time has not repaid anything. A bare path means debt, and that is what makes
# the bare paths a worklist.
#
# Test files are not measured: pressure to shorten tests is pressure in the
# wrong direction.
#
# The list is sorted text rather than JSON. Two
# reasons, both specific to it: this script is host-side shell with no JSON
# parser available to it, and one line per path means a one-file change produces
# a one-line diff.
#
# Runs on the host. Counting lines needs no tooling, so a container would be
# pure latency, and this joins the workspace-ownership check as a gate stage
# that starts nothing.
#
# Two inputs it deliberately does not handle, in the manner
# scripts/lib/formatting.sh documents its own: a path containing a space, and a
# path containing a newline. The list is whitespace-separated, so either would
# be read as a malformed line rather than silently mis-parsed — the gate
# refuses instead of lying. No such path exists here, and the machinery to
# support one is not worth carrying until something needs it.
#
# Usage:
#   scripts/check-file-size-budgets.sh                 # check (default)
#   scripts/check-file-size-budgets.sh --report        # show sizes and movement
#   scripts/check-file-size-budgets.sh --update        # re-record the list
#   scripts/check-file-size-budgets.sh --apply-drift   # record drift, refuse judgement calls
#   scripts/check-file-size-budgets.sh --root DIR ...  # operate on DIR (tests)
#
# Exit codes:
#   0  no unlisted file is over the ceiling and the list matches the tree
#   1  an unlisted file is over the ceiling, or a listed one no longer needs
#      its entry
#   2  the list or the invocation is unusable (missing, duplicated, malformed,
#      or a refused --update)
#
# `--apply-drift` is for the local gate, and exists so a mechanical correction
# never costs a second full run. It drops the entries that no longer belong and
# returns 0, exactly as the formatting stage applies formatting rather than
# reporting it. What it will not do is decide anything: a file over the ceiling
# with no entry needs splitting, and a run holding one records nothing at all.
# The published workflow never passes it, so an uncommitted recording is still
# caught there.
set -Eeuo pipefail

readonly CEILING=800
# A file within this many lines of the ceiling is warned about. Without it the
# ceiling gives a file no trajectory: it passes at 799 and is refused at 801, so
# the first news of a problem is a change being rejected. The first-load budget
# warns before its own ceiling for the same reason.
readonly WARN_FLOOR=700
# Movement of at least this many lines, in either direction, earns a line of its
# own in the report. Below it, a changed file is counted in the summary and
# nothing more — a report that lists every file is unreadable on a large change,
# and an unreadable report is worth the same as no report.
readonly DETAIL_MIN_MOVEMENT=50
readonly BUDGET_BASENAME="file-size-budgets.txt"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MODE="check"
APPLY_DRIFT=0

usage() {
    cat >&2 <<'EOF'
Usage: check-file-size-budgets.sh [--root DIR] [--report | --update | --apply-drift]
EOF
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
        --apply-drift)
            MODE="check"
            APPLY_DRIFT=1
            shift
            ;;
        --root)
            [[ -n "${2:-}" ]] || { usage; exit 2; }
            ROOT_DIR="$(cd "$2" && pwd)"
            shift 2
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

BUDGET_FILE="$ROOT_DIR/$BUDGET_BASENAME"

# Every measured file, as "<lines> <path>", sorted by path.
#
# Extensions are named rather than the directories globbed: `frontend/src` also
# holds CSS, JSON and SVG, and a line count says nothing useful about those.
#
# `wc` is handed the whole list at once rather than run per file. One spawn per
# file cost nine seconds over 1,202 files, which is a ridiculous price for a
# gate whose entire justification is that counting lines needs no tooling.
#
# `wc`'s trailing "total" line is dropped with `sed` rather than `grep -v`, and
# that is not a matter of taste. `grep` exits 1 when it emits nothing, and under
# `pipefail` that failed the whole pipeline on a tree with no measured files —
# so `measured="$(measure)"` aborted the script before `main` could reach the
# branch written to explain exactly that case. Exit 1 and not one byte of
# output is the one outcome a contributor cannot act on. `sed` deletes the same
# line and exits 0 on empty input.
measure() {
    {
        for dir in projects/marketing/app projects/marketing/components projects/marketing/lib projects/marketing/scripts infra; do
            if [[ -d "$ROOT_DIR/$dir" ]]; then
                find "$ROOT_DIR/$dir" -type f \
                    \( -name '*.ts' -o -name '*.tsx' -o -name '*.mjs' \) \
                    ! -path '*/node_modules/*' \
                    ! -name '*.test.*' ! -name '*.spec.*' ! -name '*.d.ts'
            fi
        done
    } | tr '\n' '\0' | xargs -0 --no-run-if-empty wc -l \
        | sed -E 's|^[[:space:]]*([0-9]+)[[:space:]]+(.*)$|\1 \2|' \
        | sed '/^[0-9]* total$/d' \
        | while IFS= read -r line; do printf '%s\n' "${line/ $ROOT_DIR\// }"; done \
        | LC_ALL=C sort -k2,2
}

declare -A LISTED=()
declare -A ANNOTATION=()

# Per-path line movement since the revision this change started from, and a note
# explaining the absence when there is none.
#
# Nothing in the list is a comparison point any more, so history is the only
# place a delta can come from, for every file alike.
declare -A DELTA=()
COMPARISON_NOTE=""

# One `git diff --numstat` rather than a `git show` per file. The per-file form
# costs two process spawns each, and this script already learned that lesson
# where it measures: one spawn per file cost nine seconds over 1,202 files.
#
# Absence of a comparison is a supported state, not an error. Fixture trees hold
# no repository, a shallow checkout may hold no merge base, and a gate that
# refused to run without one would be failing for a reason unrelated to code
# shape.
resolve_comparison() {
    if ! git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        COMPARISON_NOTE="no repository here, so files show current size only"
        return 0
    fi

    local upstream="" base=""
    upstream="$(git -C "$ROOT_DIR" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
    if [[ -n "$upstream" ]]; then
        base="$(git -C "$ROOT_DIR" merge-base HEAD "$upstream" 2>/dev/null || true)"
    fi
    if [[ -z "$base" ]]; then
        base="$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || true)"
    fi
    if [[ -z "$base" ]]; then
        COMPARISON_NOTE="no commit to compare against, so files show current size only"
        return 0
    fi

    local added deleted path
    while read -r added deleted path; do
        # `-` marks a binary file, which has no line count to compare.
        [[ "$added" == "-" || -z "${path:-}" ]] && continue
        DELTA["$path"]=$(( added - deleted ))
    done < <(git -C "$ROOT_DIR" diff --numstat "$base" -- \
                 backend/src frontend/src infrastructure/lib 2>/dev/null || true)

    return 0
}

# Reads the list into LISTED and ANNOTATION, rejecting anything a reader could
# misinterpret. A duplicated path is an error rather than last-one-wins:
# silently keeping one of two entries is how a record comes to disagree with
# itself.
load_baseline() {
    local line path annotation extra
    local -i lineno=0
    local -a duplicates=()
    local -a malformed=()
    local -a sized=()

    while IFS= read -r line || [[ -n "$line" ]]; do
        (( lineno += 1 ))
        [[ -z "${line//[[:space:]]/}" ]] && continue
        [[ "$line" == \#* ]] && continue

        read -r path annotation extra <<<"$line"

        # A line beginning with a number is the format this record used to have,
        # where every entry carried the file's line count. Saying so beats
        # "unreadable line": a branch cut before the sizes were dropped merges
        # cleanly and lands here, and the fix is to delete a number rather than
        # to work out what the format became.
        if [[ "$path" =~ ^[0-9]+$ ]]; then
            sized+=("$lineno: $line")
            continue
        fi
        if [[ -z "$path" ]] || [[ -n "$extra" ]]; then
            malformed+=("$lineno: $line")
            continue
        fi
        if [[ -n "$annotation" && ! "$annotation" =~ ^exempt=[^[:space:]]+$ ]]; then
            malformed+=("$lineno: $line")
            continue
        fi
        if [[ -n "${LISTED[$path]+set}" ]]; then
            duplicates+=("$path")
            continue
        fi

        LISTED["$path"]=1
        ANNOTATION["$path"]="$annotation"
    done <"$BUDGET_FILE"

    if (( ${#sized[@]} > 0 )); then
        echo "$BUDGET_BASENAME no longer records a size per file:" >&2
        printf '  %s\n' "${sized[@]}" >&2
        echo >&2
        echo "Delete the leading number. The list holds paths only — which files" >&2
        echo "are permitted above the ${CEILING}-line ceiling — and says nothing" >&2
        echo "about how large any of them is." >&2
        return 2
    fi

    if (( ${#malformed[@]} > 0 )); then
        echo "Unreadable lines in $BUDGET_BASENAME:" >&2
        printf '  %s\n' "${malformed[@]}" >&2
        echo >&2
        echo "Each line is a path, with an optional 'exempt=<reason>'" >&2
        echo "annotation saying the size is deliberate rather than debt." >&2
        return 2
    fi

    if (( ${#duplicates[@]} > 0 )); then
        echo "Paths listed more than once in $BUDGET_BASENAME:" >&2
        printf '  %s\n' "${duplicates[@]}" >&2
        return 2
    fi

    return 0
}

require_baseline() {
    if [[ ! -f "$BUDGET_FILE" ]]; then
        echo "Missing $BUDGET_BASENAME. Record it with --update." >&2
        return 2
    fi
    load_baseline
}

# Writes the paths permitted above the ceiling, sorted, preserving the
# annotation of any entry that keeps its place.
#
# Preserving them is not a nicety: a re-record that dropped them would quietly
# turn every deliberate size back into debt, and the file would then be pruned
# the first time it dipped under the ceiling.
#
# The header is written every time rather than carried over, so it cannot come
# to describe a format the file no longer has. Which is also why an ad-hoc
# comment does not survive a rewrite, and why the header says so.
write_baseline() {
    local measured="$1"
    local number path annotation

    cat >"$BUDGET_FILE.tmp" <<EOF
# Files permitted above the ${CEILING}-line ceiling: the repository's oversized
# set, and the worklist for repaying it. Sizes are deliberately not recorded
# here — see specs/decisions/code-shape-verification.md. Drop a line
# once its file is back under the ceiling; the local gate drops it for you.
#
# This header is rewritten along with the list, so a lasting note belongs in an
# 'exempt=<reason>' annotation rather than in a comment.
EOF

    while read -r number path; do
        annotation="${ANNOTATION[$path]:-}"

        # Kept: whatever is over the ceiling, and any entry whose annotation
        # says the size is deliberate. Dropped: an entry whose file has come
        # back under the ceiling, because the line would otherwise be a
        # permission attached to nothing.
        #
        # A path that is over the ceiling and has no entry reaches here only at
        # adoption; everywhere else `guard_new_oversized` has already refused
        # it, or `do_check` has.
        if (( number <= CEILING )) && [[ "$annotation" != exempt=* ]]; then
            continue
        fi

        if [[ -n "$annotation" ]]; then
            printf '%s %s\n' "$path" "$annotation"
        else
            printf '%s\n' "$path"
        fi
    done <<<"$measured" >>"$BUDGET_FILE.tmp"

    mv "$BUDGET_FILE.tmp" "$BUDGET_FILE"
}

# Which of the four things a measured file is, given its size. Held in one place
# because `do_check` names them and `do_report` has to know which ones have
# already been named, and two copies of this reasoning would drift.
#
# Sets CLASS to one of: over-ceiling, repaid, approaching, ordinary. A global
# rather than a printed value, because reading a printed one costs a command
# substitution — a fork per measured file, in both callers, in a script whose
# header explains at length why it does not spawn per file.
CLASS=""
classify() {
    local path="$1"
    local number="$2"
    local annotation="${ANNOTATION[$path]:-}"

    if [[ -n "${LISTED[$path]+set}" ]]; then
        # An entry states that the file is above the ceiling. Once that stops
        # being true the line has to go, or the file keeps a permission it no
        # longer needs and can grow back past the ceiling with nothing to say
        # so. An `exempt=` entry is not debt and is not repaid: it records a
        # size somebody decided was right, and a generated file that happens to
        # be short this time has not paid anything back.
        if (( number <= CEILING )) && [[ "$annotation" != exempt=* ]]; then
            CLASS='repaid'
        else
            CLASS='ordinary'
        fi
        return 0
    fi

    if (( number > CEILING )); then
        CLASS='over-ceiling'
    elif (( number >= WARN_FLOOR )); then
        CLASS='approaching'
    else
        CLASS='ordinary'
    fi
}

do_check() {
    local measured="$1"
    local number path
    local -a over_ceiling=()
    local -a repaid=()
    local -a approaching=()
    local -a seen_paths=()

    while read -r number path; do
        seen_paths+=("$path")

        classify "$path" "$number"
        case "$CLASS" in
            over-ceiling) over_ceiling+=("$path|$number") ;;
            repaid)       repaid+=("$path|$number") ;;
            approaching)  approaching+=("$path|$number") ;;
        esac
    done <<<"$measured"

    # An entry for a file that is no longer there is the same kind of untruth as
    # one for a file that is no longer oversized, and it is fixed the same way.
    # It is not treated as a decision to be taken, because the decision it used
    # to represent — was this a rename? — is taken elsewhere: a rename lands the
    # file at its new path, over the ceiling and unlisted, where the ceiling
    # refuses it until somebody writes the new path down.
    local -a absent=()
    local -A present=()
    local seen
    for seen in "${seen_paths[@]}"; do
        present["$seen"]=1
    done
    local listed_path
    for listed_path in "${!LISTED[@]}"; do
        [[ -n "${present[$listed_path]+set}" ]] || absent+=("$listed_path")
    done

    local status=0

    # Dropping a line nobody needs is mechanical, so under --apply-drift it
    # happens here rather than costing a second gate. Only when nothing else is
    # wrong: a file over the ceiling with no entry needs splitting, and
    # recording around that decision would bury it.
    if (( (${#repaid[@]} > 0 || ${#absent[@]} > 0) && APPLY_DRIFT == 1 \
        && ${#over_ceiling[@]} == 0 )); then
        write_baseline "$measured"
        echo "Recorded the entries that no longer belong, so this needs no second run:" >&2
        local entry file current_size
        for entry in "${repaid[@]}"; do
            IFS='|' read -r file current_size <<<"$entry"
            printf '  %s  %s lines, no longer over the ceiling\n' \
                "$file" "$current_size" >&2
        done
        for entry in "${absent[@]}"; do
            printf '  %s  no longer present\n' "$entry" >&2
        done
        echo >&2
        echo "The recording is in your working tree and lands in review like" >&2
        echo "any other change. If a path went missing to a rename rather than" >&2
        echo "a deletion, write the new path down in its place." >&2
        repaid=()
        absent=()
    fi

    if (( ${#over_ceiling[@]} > 0 )); then
        status=1
        echo "These files exceed the ${CEILING}-line ceiling and are not listed in $BUDGET_BASENAME:" >&2
        local entry file current_size
        for entry in "${over_ceiling[@]}"; do
            IFS='|' read -r file current_size <<<"$entry"
            printf '  %s  %s lines\n' "$file" "$current_size" >&2
        done
        echo >&2
        echo "Split them. The ceiling governs what arrives above it; the files" >&2
        echo "already listed keep their permission, so this is not a demand to" >&2
        echo "shrink anything that was here before." >&2
    fi

    if (( ${#repaid[@]} > 0 )); then
        status=1
        (( ${#over_ceiling[@]} > 0 )) && echo >&2
        echo "These files are listed in $BUDGET_BASENAME but no longer exceed the ceiling:" >&2
        local entry file current_size
        for entry in "${repaid[@]}"; do
            IFS='|' read -r file current_size <<<"$entry"
            printf '  %s  %s lines\n' "$file" "$current_size" >&2
        done
        echo >&2
        echo "The debt is repaid. Drop their lines, so the list stays a true" >&2
        echo "statement of what is oversized and none of them can grow back past" >&2
        echo "the ceiling unremarked. The local gate drops them for you." >&2
    fi

    if (( ${#absent[@]} > 0 )); then
        status=1
        (( ${#over_ceiling[@]} > 0 || ${#repaid[@]} > 0 )) && echo >&2
        echo "Listed in $BUDGET_BASENAME but not present:" >&2
        printf '  %s\n' "$(printf '%s\n' "${absent[@]}" | LC_ALL=C sort)" >&2
        echo >&2
        echo "Drop their lines. If one of these was renamed rather than deleted," >&2
        echo "write the new path down in its place — until you do, the ceiling" >&2
        echo "refuses the file under its new name." >&2
    fi

    # Warnings never move the status. The whole point is to be heard before
    # anything is refused, and a warning that failed the gate would just be the
    # ceiling moved down to the floor.
    if (( ${#approaching[@]} > 0 )); then
        (( ${#over_ceiling[@]} > 0 || ${#repaid[@]} > 0 || ${#absent[@]} > 0 )) && echo >&2
        echo "These files are approaching the ${CEILING}-line ceiling:" >&2
        local entry file current_size
        for entry in "${approaching[@]}"; do
            IFS='|' read -r file current_size <<<"$entry"
            printf '  %s  %s lines, %s below the ceiling\n' \
                "$file" "$current_size" "$(( CEILING - current_size ))" >&2
        done
        echo >&2
        echo "Nothing fails yet. Splitting one of these now is cheaper than" >&2
        echo "being refused the change that finally crosses the line." >&2
    fi

    return "$status"
}

# A summary of everything that moved, then per-file detail only for what somebody
# has to act on: a file the check has an opinion about, or movement large enough
# to be worth a reviewer's attention.
#
# This is the only place growth in a listed file is heard. Nothing refuses it any
# more, so a reviewer meets `+312` here or not at all — which is the trade the
# list makes by holding paths instead of sizes.
#
# `standalone` says whether anything else has spoken. In check mode the blocks
# above have already named every file they refused or warned about, with the
# remedy attached, so naming them again here would say it twice in one run — and
# a reader who has to notice that two lines are the same file has been given
# noise, not an account. In `--report` nothing else runs, so this is the only
# place any of it appears.
do_report() {
    local measured="$1"
    local standalone="${2:-no}"
    local number path suffix
    local -i changed=0 net=0 delta=0
    local -a detail=()
    local -A present=()

    while read -r number path; do
        present["$path"]=1
        delta="${DELTA[$path]:-0}"
        if (( delta != 0 )); then
            changed+=1
            net+=delta
        fi

        classify "$path" "$number"
        case "$CLASS" in
            over-ceiling) suffix=", over the ceiling" ;;
            repaid)       suffix=", no longer over the ceiling" ;;
            approaching)  suffix=", $(( CEILING - number )) below the ceiling" ;;
            *)            suffix="" ;;
        esac

        if [[ "$CLASS" != "ordinary" ]]; then
            # Named by a check block already, unless nothing else is running.
            [[ "$standalone" == "yes" ]] || continue
        elif (( delta > -DETAIL_MIN_MOVEMENT && delta < DETAIL_MIN_MOVEMENT )); then
            continue
        fi

        if (( delta != 0 )); then
            detail+=("$(printf '  %s  %s lines (%+d)%s' "$path" "$number" "$delta" "$suffix")")
        else
            detail+=("$(printf '  %s  %s lines%s' "$path" "$number" "$suffix")")
        fi
    done <<<"$measured"

    # An absent entry has no measured line to hang off, so it is collected here
    # rather than in the loop. Check mode has already named it.
    if [[ "$standalone" == "yes" ]]; then
        local listed_path
        local -a missing=()
        for listed_path in "${!LISTED[@]}"; do
            [[ -n "${present[$listed_path]+set}" ]] || missing+=("$listed_path")
        done
        if (( ${#missing[@]} > 0 )); then
            local absent_path
            while IFS= read -r absent_path; do
                detail+=("$(printf '  %s  listed but not present' "$absent_path")")
            done < <(printf '%s\n' "${missing[@]}" | LC_ALL=C sort)
        fi
    fi

    printf '%s measured files, %s listed as oversized; %s changed size' \
        "$(wc -l <<<"$measured")" "${#LISTED[@]}" "$changed"
    if (( changed > 0 )); then
        printf ' for a net %+d lines' "$net"
    fi
    printf '.\n'

    if [[ -n "$COMPARISON_NOTE" ]]; then
        printf 'No comparison revision: %s.\n' "$COMPARISON_NOTE"
    fi

    if (( ${#detail[@]} > 0 )); then
        printf '%s\n' "${detail[@]}"
    fi
}

# Refuses to add a path to the list, so that re-recording cannot be used to
# grandfather in the very thing the ceiling exists to stop. Admission is a
# decision, and a decision is written by hand and read in the diff.
guard_new_oversized() {
    local measured="$1"
    local number path
    local -a offenders=()

    while read -r number path; do
        [[ -n "${LISTED[$path]+set}" ]] && continue
        (( number > CEILING )) && offenders+=("$path|$number")
    done <<<"$measured"

    (( ${#offenders[@]} == 0 )) && return 0

    echo "Refusing to add these files to $BUDGET_BASENAME above the ${CEILING}-line ceiling:" >&2
    local entry file size
    for entry in "${offenders[@]}"; do
        IFS='|' read -r file size <<<"$entry"
        printf '  %s  %s lines\n' "$file" "$size" >&2
    done
    echo >&2
    echo "Split them, or — if the size is genuinely justified — write the path" >&2
    echo "into $BUDGET_BASENAME by hand, with an 'exempt=<reason>' annotation if" >&2
    echo "it is a deliberate size rather than debt, and run --update again." >&2
    echo "Recording it silently is how a ceiling stops meaning anything." >&2
    return 2
}

main() {
    local measured
    measured="$(measure)"

    if [[ -z "$measured" ]]; then
        echo "No measured files found under $ROOT_DIR." >&2
        return 2
    fi

    case "$MODE" in
        update)
            # Adoption is the one time a path may join the list without anybody
            # writing it down.
            if [[ -f "$BUDGET_FILE" ]]; then
                load_baseline || return $?
                guard_new_oversized "$measured" || return $?
            fi
            write_baseline "$measured"
            # `grep -c` prints 0 and exits 1 on no match, which `set -e` would
            # otherwise take as a reason to abort on an empty list.
            printf '%s files listed as permitted above the %s-line ceiling in %s.\n' \
                "$(grep -cv '^#' "$BUDGET_FILE" || true)" "$CEILING" "$BUDGET_BASENAME"
            ;;
        report)
            require_baseline || return $?
            resolve_comparison
            echo "File sizes against $BUDGET_BASENAME:"
            do_report "$measured" yes
            ;;
        check)
            require_baseline || return $?
            # The report runs on a passing tree as well as a failing one: growth
            # that is allowed is exactly the growth nobody would otherwise see,
            # and this is the only place a reviewer of the published log meets it.
            #
            # An unusable list (exit 2) skips it — reporting against a record
            # that could not be read would be noise on top of an error.
            local status=0
            do_check "$measured" || status=$?
            (( status == 2 )) && return "$status"
            resolve_comparison
            do_report "$measured"
            return "$status"
            ;;
    esac
}

main
