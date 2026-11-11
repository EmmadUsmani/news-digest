#!/usr/bin/env bash
# Run via the user service or manually. Never source the secrets file.
set -Eeuo pipefail
umask 077
CONTROL=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# Project identity (PROJECT_NAME, REPO, HEALTH_URL) comes from the tracked
# harness.conf; tuning comes from the environment/systemd unit.
# shellcheck source=/dev/null
[[ ! -f $CONTROL/harness.conf ]] || source "$CONTROL/harness.conf"
PROJECT_NAME=${PROJECT_NAME:-news-digest}
REPO=${REPO:-$HOME/$PROJECT_NAME}
HEALTH_URL=${HEALTH_URL:-http://localhost:8000/healthz}
RUN_HOURS=${RUN_HOURS:-0}
ITER_TIMEOUT_MIN=${ITER_TIMEOUT_MIN:-75}
RETRY_WAIT_MIN=${RETRY_WAIT_MIN:-5}
USAGE_LIMIT_WAIT_MIN=${USAGE_LIMIT_WAIT_MIN:-15}
# Codex quota pacing (real runs only): spread weekly usage over the week so the
# build never burns the whole allowance early and stalls for days.
PACE_WEEKLY=${PACE_WEEKLY:-1}
PACE_SLACK_PCT=${PACE_SLACK_PCT:-10}
PACE_MAX_WAIT_MIN=${PACE_MAX_WAIT_MIN:-60}
USAGE_MAX_WAIT_MIN=${USAGE_MAX_WAIT_MIN:-720}
CODEX_SESSIONS=${CODEX_SESSIONS:-$HOME/.codex/sessions}
SMOKE=${SMOKE:-0}
# When the provider refuses the default model, rerun that iteration on this
# model. Every iteration tries the default first. Empty disables the fallback.
FALLBACK_MODEL=${FALLBACK_MODEL-gpt-6-sol}
python3 - "$RUN_HOURS" "$ITER_TIMEOUT_MIN" "$RETRY_WAIT_MIN" "$USAGE_LIMIT_WAIT_MIN" "$SMOKE" \
    "$PACE_SLACK_PCT" "$PACE_MAX_WAIT_MIN" "$USAGE_MAX_WAIT_MIN" "$PACE_WEEKLY" <<'PY'
import math, sys
hours, timeout, retry, wait, smoke, slack, pace_max, usage_max, pace = sys.argv[1:]
assert all(math.isfinite(float(v)) and float(v) > 0 for v in (timeout, retry, wait, pace_max, usage_max)), 'positive finite time settings required'
assert math.isfinite(float(slack)) and 0 <= float(slack) <= 100, 'PACE_SLACK_PCT must be 0-100'
assert pace in ('0', '1'), 'PACE_WEEKLY must be 0 or 1'
assert math.isfinite(float(hours)) and float(hours) >= 0, 'RUN_HOURS must be nonnegative (0 means continuous)'
assert smoke in ('0', '1'), 'SMOKE must be 0 or 1'
PY
mkdir -p "$CONTROL/logs" "$CONTROL/status"
exec 9>"$CONTROL/status/supervisor.lock"
flock -n 9 || { echo 'Another supervisor is already running.' >&2; exit 1; }
# Child agents must not inherit the supervisor lock descriptor.
cd "$CONTROL"
START_EPOCH=$(date +%s)
DEADLINE_EPOCH=$(python3 -c 'import sys; print(int(int(sys.argv[1])+float(sys.argv[2])*3600) if float(sys.argv[2]) else 0)' "$START_EPOCH" "$RUN_HOURS")
START=$(date -u -d "@$START_EPOCH" +%FT%TZ)
DEADLINE="none (continuous until stopped)"
if (( DEADLINE_EPOCH > 0 )); then DEADLINE=$(date -u -d "@$DEADLINE_EPOCH" +%FT%TZ); fi
RUN_ID=$(date -u +%Y%m%dT%H%M%SZ)-$$
ITERATION=0
NO_PROGRESS=0
# Consecutive failed iterations (crash, timeout, auth, refused model); usage-limit
# waits are expected and leave it unchanged. Feeds the AgentCrashLoop alert.
FAILURES=0
LAST_RC=0
LAST_HEALTH=not_checked
ITER_START=''
ITER_END=''
LAST_SUMMARY=''
ACTIVE_PID=''
GUARD_BASE=''
STOP_REASON=''
OWNER_GUARD_FAILED=0
NEXT_RETRY=''
CODEX_USAGE='not measured'
MODEL_USED=default
PACED=0
STATE=starting
LOG="$CONTROL/logs/supervisor.log"
printf '%s\n' "$$" > "$CONTROL/status/supervisor.pid"

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" | tee -a "$LOG"; }
heartbeat() {
    python3 "$CONTROL/control.py" heartbeat "$CONTROL/status/heartbeat.json" \
        "iteration=$ITERATION" "run_id=$RUN_ID" "started_at=$START" \
        "updated_at=$(date -u +%FT%TZ)" "iteration_started_at=$ITER_START" \
        "iteration_finished_at=$ITER_END" "last_exit_code=$LAST_RC" \
        "consecutive_no_progress=$NO_PROGRESS" "consecutive_failures=$FAILURES" "last_health_result=$LAST_HEALTH" \
        "deadline=$DEADLINE" "next_retry_at=$NEXT_RETRY" "state=$STATE" "stop_reason=$STOP_REASON" \
        "supervisor_pid=$$" "active_pgid=$ACTIVE_PID" "smoke=$SMOKE" "codex_usage=$CODEX_USAGE" "model=$MODEL_USED"
}
retry_wait() {
    local minutes=$1 wake left
    wake=$(python3 -c 'import math,sys,time; print(int(time.time())+max(1,math.ceil(float(sys.argv[1])*60)))' "$minutes")
    if (( DEADLINE_EPOCH > 0 && wake > DEADLINE_EPOCH )); then wake=$DEADLINE_EPOCH; fi
    NEXT_RETRY=$(date -u -d "@$wake" +%FT%TZ)
    log "Retry scheduled at $NEXT_RETRY; failures never stop the supervisor."
    heartbeat
    while (( $(date +%s) < wake )); do
        [[ ! -e $CONTROL/STOP ]] || break
        heartbeat
        left=$((wake - $(date +%s)))
        (( left > 0 )) || break
        if (( left > 5 )); then sleep 5; else sleep "$left"; fi
    done
    NEXT_RETRY=''
}
git_repo() { git -C "$REPO" "$@"; }
terminate_child() {
    if [[ -n $ACTIVE_PID ]]; then
        kill -TERM -- "-$ACTIVE_PID" 2>/dev/null || true
        # Bounded grace, then kill the entire isolated timeout/Codex group.
        for ((j=0; j<20; j++)); do
            kill -0 -- "-$ACTIVE_PID" 2>/dev/null || break
            sleep 1
        done
        kill -KILL -- "-$ACTIVE_PID" 2>/dev/null || true
        wait "$ACTIVE_PID" 2>/dev/null || true
        ACTIVE_PID=''
        rm -f "$CONTROL/status/active.pgid"
    fi
}
run_codex() {
    local prompt=$1 prefix=$2 seconds=$3 workdir=$4 model=${5:-}
    local -a extra=()
    [[ $SMOKE == 1 ]] && extra+=(--skip-git-repo-check)
    [[ -z $model ]] || extra+=(-m "$model")
    setsid timeout --signal=TERM --kill-after=20s "${seconds}s" \
        codex exec --dangerously-bypass-approvals-and-sandbox \
        -C "$workdir" --json -o "$prefix.final.md" "${extra[@]}" - \
        <"$prompt" >"$prefix.jsonl" 2>"$prefix.err" 9>&- &
    ACTIVE_PID=$!
    printf '%s\n' "$ACTIVE_PID" > "$CONTROL/status/active.pgid"
    heartbeat
    if wait "$ACTIVE_PID"; then LAST_RC=0; else LAST_RC=$?; fi
    # Clean up any remaining descendants, including after timeout/crash.
    terminate_child
}
push_ahead() {
    local ahead
    ahead=$(git_repo rev-list --count origin/main..main 2>/dev/null) || return 0
    if (( ahead > 0 )); then
        if timeout 120s git -C "$REPO" push origin main >>"$LOG" 2>&1; then
            log "Pushed $ahead local commit(s)."
        else
            log 'WARNING: push failed; local commits remain for the next iteration.'
        fi
    fi
}
guard_owner_files() {
    [[ $SMOKE == 0 && -n $GUARD_BASE ]] || return 0
    local changed
    # Restore uncommitted edits first, preserving unrelated staged work.
    if ! git_repo diff --quiet HEAD -- MISSION.md BOOTSTRAP.md; then
        log 'WARNING: restoring uncommitted edits to owner files.'
        git_repo checkout HEAD -- MISSION.md BOOTSTRAP.md >>"$LOG" 2>&1 || return 1
    fi
    changed=$(git_repo log --format=%H "$GUARD_BASE..HEAD" -- MISSION.md BOOTSTRAP.md)
    if [[ -n $changed ]]; then
        log "WARNING: iteration commits touched owner files; restoring $GUARD_BASE versions without rewriting history."
        if ! git_repo diff --quiet "$GUARD_BASE" HEAD -- MISSION.md BOOTSTRAP.md; then
            git_repo restore --source="$GUARD_BASE" --staged --worktree -- MISSION.md BOOTSTRAP.md >>"$LOG" 2>&1 || return 1
            git_repo -c core.hooksPath=/dev/null commit --only \
                -m "Restore owner mission and bootstrap after unauthorized agent edits" \
                -- MISSION.md BOOTSTRAP.md >>"$LOG" 2>&1 || return 1
        fi
    fi
    GUARD_BASE=''
}
health_check() {
    if [[ $SMOKE == 1 ]]; then LAST_HEALTH=skipped_smoke; return; fi
    local http=failed services=none units
    {
        printf '\n%s iteration=%s\n' "$(date -u +%FT%TZ)" "$ITERATION"
        if curl --connect-timeout 2 --max-time 10 -fsS "$HEALTH_URL"; then http=ok; fi
        printf '\n'
        # App units follow the <project>-*.service naming convention; the agent
        # unit itself is excluded. No app units yet reports services=none.
        units=$(timeout 15s systemctl --user list-unit-files --no-legend "$PROJECT_NAME-*.service" 2>/dev/null \
            | awk '{print $1}' | grep -v -- "-agent\.service$" | grep -v '@' || true)
        if [[ -n $units ]]; then
            # shellcheck disable=SC2086
            if timeout 15s systemctl --user is-active $units; then services=ok; else services=failed; fi
        fi
        printf 'http=%s services=%s\n' "$http" "$services"
    } >>"$CONTROL/logs/health.log" 2>&1
    LAST_HEALTH="http=$http services=$services"
    log "Health: $LAST_HEALTH"
}
final_report() {
    STATE=reporting
    heartbeat
    GUARD_BASE=$(git_repo rev-parse HEAD) || return 1
    local prompt="$CONTROL/logs/report-$RUN_ID.prompt.md"
    cat >"$prompt" <<EOF
The unattended build has ended. Run start: $START. Deadline: $DEADLINE.
Stop reason: $STOP_REASON. Last iteration: $ITERATION. Last exit code: $LAST_RC.
Last health check: $LAST_HEALTH. Write a concise MORNING_REPORT.md in the repo.
This is a short reporting session, not another build iteration. Do not ask questions.
Read MISSION.md, AGENTS.md, STEERING.md, TASKS.md, PROGRESS.md,
NEEDS_FROM_HUMAN.md and the current git status as available. Do not edit any of
those files or anything in ~/agent-control/. Do not change code or owner files.
Report what works with actual evidence, which content sources are live and
their status, the latest digest produced, latest test results (distinguish
recorded results from new checks), screenshot paths, app URL, how to run/stop
services, open blockers, NEEDS_FROM_HUMAN highlights, and recommended next
steps. Mark anything unknown or unverified honestly. Use quick read-only checks
if needed; no source fetches, full builds or installs.
Commit ONLY MORNING_REPORT.md (git add -- MORNING_REPORT.md; git commit --only
-- MORNING_REPORT.md) with a clear message, then git push origin main.
Supervisor owner-file guard failure flag: $OWNER_GUARD_FAILED. If this is 1,
write the report on disk but do not commit or push; report the guard failure.
Never include preexisting staged code in the report commit. If Git is blocked,
leave the report readable on disk and explain the problem in your final reply.
Never switch model, provider or billing. Never print, log or commit secrets.
EOF
    run_codex "$prompt" "$CONTROL/logs/report-$RUN_ID" 600 "$REPO"
    local report_result
    report_result=$(python3 "$CONTROL/control.py" classify "$CONTROL/logs/report-$RUN_ID.jsonl" "$CONTROL/logs/report-$RUN_ID.err" "$LAST_RC")
    if guard_owner_files; then
        push_ahead
    else
        OWNER_GUARD_FAILED=1
        STOP_REASON=owner_guard_failed
        log 'ERROR: report owner-file guard failed; refusing supervisor push.'
    fi
    log "Morning report session finished: rc=$LAST_RC result=$report_result"
}
on_exit() {
    local exit_code=$?
    trap - EXIT
    # A second signal is ignored while the bounded final report runs. Use the
    # documented immediate-stop command to kill the supervisor and child group.
    trap '' HUP INT TERM
    set +e
    terminate_child
    [[ -n $STOP_REASON ]] || STOP_REASON="supervisor_error_$exit_code"
    if [[ $SMOKE == 0 ]]; then
        if guard_owner_files; then
            push_ahead
        else
            OWNER_GUARD_FAILED=1
            STOP_REASON=owner_guard_failed
            log 'ERROR: owner-file guard failed during exit; refusing supervisor push.'
        fi
        # A stop/deadline must not launch another provider call while it is failing.
        if [[ ${RESULT:-not_started} == ok ]]; then final_report;
        else log "No successful last attempt (${RESULT:-not_started}): skipping final model report; local logs retain evidence."; fi
    fi
    STATE=stopped
    heartbeat
    rm -f "$CONTROL/status/supervisor.pid" "$CONTROL/status/active.pgid"
    log "Stopped: $STOP_REASON (exit=$exit_code)."
    exit "$exit_code"
}
on_signal() { STOP_REASON="signal_$1"; exit "$2"; }
trap on_exit EXIT
trap 'on_signal HUP 129' HUP
trap 'on_signal INT 130' INT
trap 'on_signal TERM 143' TERM

log "Run $RUN_ID starting: smoke=$SMOKE deadline=$DEADLINE"
heartbeat
if [[ $SMOKE == 0 ]]; then
    [[ $(git_repo branch --show-current) == main ]] || { log 'ERROR: checkout main before launching.'; STOP_REASON=wrong_branch; exit 1; }
    # Prevent accidental deletion of owner edits that predate the run.
    git_repo diff --quiet HEAD -- MISSION.md BOOTSTRAP.md || { log 'ERROR: commit owner-file edits before launching.'; STOP_REASON=dirty_owner_files; exit 1; }
fi
while true; do
    if [[ -e $CONTROL/STOP ]]; then STOP_REASON=STOP; break; fi
    if (( DEADLINE_EPOCH > 0 && $(date +%s) >= DEADLINE_EPOCH )); then STOP_REASON=deadline; break; fi
    # Weekly pacing: when ahead of pace, wait (bounded) before the next
    # iteration. After a pacing wait one iteration always runs, which also
    # refreshes the usage snapshot, so stale data can only slow, never halt.
    if [[ $SMOKE == 0 && $PACE_WEEKLY == 1 && $PACED == 0 ]]; then
        read -r PACE_SECS PACE_REASON < <(python3 "$CONTROL/control.py" pace \
            "$CONTROL/status/usage.json" "$PACE_SLACK_PCT" "$PACE_MAX_WAIT_MIN" || echo "0 pacing check failed")
        if (( PACE_SECS > 0 )); then
            STATE=pace_wait
            log "Pacing: $PACE_REASON; waiting $((PACE_SECS / 60))m before the next iteration."
            retry_wait "$(python3 -c 'import sys; print(int(sys.argv[1]) / 60)' "$PACE_SECS")"
            PACED=1
            continue
        fi
    fi
    PACED=0
    ITERATION=$(python3 "$CONTROL/control.py" next "$CONTROL/logs")
    printf -v LABEL '%03d' "$ITERATION"
    PREFIX="$CONTROL/logs/iter-$LABEL"
    ITER_START=$(date -u +%FT%TZ)
    ITER_END=''
    STATE=preparing
    heartbeat
    if [[ $SMOKE == 0 ]]; then
        if timeout 120s git -C "$REPO" fetch origin >>"$LOG" 2>&1; then
            if ! timeout 30s git -C "$REPO" merge --ff-only origin/main >>"$LOG" 2>&1; then
                log 'WARNING: fast-forward failed; continuing with local state.'
            fi
        else
            log 'WARNING: fetch failed; continuing with local state.'
        fi
        BEFORE=$(git_repo rev-parse HEAD)
        GUARD_BASE=$BEFORE
        BUDGET=$(python3 "$CONTROL/control.py" budget "$CONTROL/status/usage.json" "$PACE_SLACK_PCT" \
            || echo 'Codex usage: unknown.')
        python3 "$CONTROL/control.py" render "$CONTROL/ITERATION_PROMPT.md" \
            "$PREFIX.prompt.md" "$ITERATION" "$START" "$DEADLINE" "$LAST_SUMMARY" "$BUDGET"
        WORKDIR=$REPO
    else
        # No git operation, health request or report is allowed in smoke mode.
        printf "Append exactly one line 'smoke ok %s' to %s/smoke.txt. Do not touch %s or its services. Reply with exactly DONE.\n" \
            "$(date -u +%FT%TZ)" "$CONTROL" "$REPO" >"$PREFIX.prompt.md"
        WORKDIR=$CONTROL
    fi
    # Fetch/merge may have consumed the remaining budget; STOP is also checked
    # immediately before dispatch, without interrupting an existing iteration.
    if [[ -e $CONTROL/STOP ]]; then STOP_REASON=STOP; break; fi
    REMAINING=$(python3 -c 'import sys; print(max(1,int(float(sys.argv[1])*60)))' "$ITER_TIMEOUT_MIN")
    if (( DEADLINE_EPOCH > 0 )); then REMAINING=$((DEADLINE_EPOCH - $(date +%s))); fi
    if (( REMAINING <= 0 )); then STOP_REASON=deadline; break; fi
    SECONDS_LIMIT=$(python3 -c 'import sys; print(max(1,min(int(float(sys.argv[1])*60),int(sys.argv[2]))))' "$ITER_TIMEOUT_MIN" "$REMAINING")
    STATE=running
    log "Iteration $ITERATION starting (timeout ${SECONDS_LIMIT}s)."
    ITER_START_EPOCH=$(date +%s)
    MODEL_USED=default
    run_codex "$PREFIX.prompt.md" "$PREFIX" "$SECONDS_LIMIT" "$WORKDIR"
    ITER_END=$(date -u +%FT%TZ)
    RESULT=$(python3 "$CONTROL/control.py" classify "$PREFIX.jsonl" "$PREFIX.err" "$LAST_RC")
    FALLBACK_SECS=$((SECONDS_LIMIT - ($(date +%s) - ITER_START_EPOCH)))
    if [[ $RESULT == model_unavailable && -n $FALLBACK_MODEL && ! -e $CONTROL/STOP ]] && (( FALLBACK_SECS > 60 )); then
        # Keep the refused attempt's evidence; the suffix keeps `next` numbering intact.
        mv -f "$PREFIX.jsonl" "$PREFIX.jsonl.primary"
        mv -f "$PREFIX.err" "$PREFIX.err.primary"
        MODEL_USED="$FALLBACK_MODEL (fallback)"
        log "WARNING: default model unavailable; rerunning iteration $ITERATION on fallback $FALLBACK_MODEL."
        run_codex "$PREFIX.prompt.md" "$PREFIX" "$FALLBACK_SECS" "$WORKDIR" "$FALLBACK_MODEL"
        ITER_END=$(date -u +%FT%TZ)
        RESULT=$(python3 "$CONTROL/control.py" classify "$PREFIX.jsonl" "$PREFIX.err" "$LAST_RC")
    fi
    COMMITS=0
    if [[ $SMOKE == 0 ]]; then
        COMMITS=$(git_repo rev-list --count "$BEFORE..HEAD")
        guard_owner_files
        push_ahead
    fi
    health_check
    if [[ $SMOKE == 0 ]]; then
        if USAGE_LINE=$(python3 "$CONTROL/control.py" usage-update "$CODEX_SESSIONS" "$((ITER_START_EPOCH - 60))" \
                "$PREFIX.jsonl" "$CONTROL/status/usage.json" "$CONTROL/logs/usage.tsv" "$ITERATION" 2>>"$LOG"); then
            CODEX_USAGE=$USAGE_LINE
            log "Codex usage: $USAGE_LINE"
        fi
    fi
    # Keep the last useful handoff when a failed turn has no final message.
    if [[ -s $PREFIX.final.md ]]; then LAST_SUMMARY="$PREFIX.final.md"; fi
    if [[ $RESULT == usage || $RESULT == auth ]]; then :;
    elif [[ $RESULT == ok ]] && (( COMMITS > 0 )); then NO_PROGRESS=0;
    else NO_PROGRESS=$((NO_PROGRESS + 1)); fi
    if [[ $RESULT == ok ]]; then FAILURES=0; elif [[ $RESULT != usage ]]; then FAILURES=$((FAILURES + 1)); fi
    STATE=between_iterations
    heartbeat
    log "Iteration $ITERATION finished: rc=$LAST_RC result=$RESULT model=$MODEL_USED commits=$COMMITS no_progress=$NO_PROGRESS."
    if [[ $SMOKE == 1 && $RESULT == ok ]]; then STOP_REASON=smoke_complete; break; fi
    if [[ $RESULT != ok || $COMMITS == 0 ]]; then
        WAIT_MIN=$RETRY_WAIT_MIN
        STATE=retry_wait
        if [[ $RESULT == usage || $RESULT == auth ]]; then
            WAIT_MIN=$USAGE_LIMIT_WAIT_MIN
            STATE=usage_wait
            # Wait for the reported reset rather than polling (bounded).
            if [[ $RESULT == usage && $SMOKE == 0 ]]; then
                WAIT_MIN=$(python3 "$CONTROL/control.py" usage-wait "$PREFIX.jsonl" "$PREFIX.err" \
                    "$CONTROL/status/usage.json" "$USAGE_LIMIT_WAIT_MIN" "$USAGE_MAX_WAIT_MIN" \
                    || echo "$USAGE_LIMIT_WAIT_MIN")
            fi
        fi
        log "Iteration result=$RESULT; waiting ${WAIT_MIN}m before retry (no failure cutoff)."
        retry_wait "$WAIT_MIN"
    fi
done
