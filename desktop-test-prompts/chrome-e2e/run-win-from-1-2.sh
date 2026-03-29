#!/bin/bash
# 윈도우용: Part 1-02부터 → Part 2 → Part 3 → Part 4 전체 실행
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"
mkdir -p "$RESULTS_DIR" "$SCREENSHOTS_DIR"

# OAuth 토큰 자동 읽기 (~/.claude/.credentials.json)
CRED_FILE="$HOME/.claude/.credentials.json"
if [ -f "$CRED_FILE" ]; then
  OAUTH_TOKEN=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['claudeAiOauth']['accessToken'])" 2>/dev/null \
    || python -c "import json; print(json.load(open('$CRED_FILE'))['claudeAiOauth']['accessToken'])" 2>/dev/null \
    || cat "$CRED_FILE" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "OAuth 토큰 로드 완료: ${OAUTH_TOKEN:0:20}..."
else
  echo "⚠️  ~/.claude/.credentials.json 없음 — OAuth 토큰 없이 진행"
  OAUTH_TOKEN="NO_TOKEN"
fi

run_part() {
  local COMMON="$1" PART="$2" NUM="$3" PREFIX="$4"
  local PART_FILE="$SCRIPT_DIR/${PART}.md"
  echo ""
  echo "── [$PREFIX-$NUM] $PART ──"
  [ ! -f "$PART_FILE" ] && echo " ❌ 없음" && return

  # 결과 이미 존재하면 건너뜀 (재실행: FORCE_RERUN=1)
  local RESULT_FILE="$RESULTS_DIR/${PREFIX}-$(printf '%02d' $NUM).md"
  if [ -f "$RESULT_FILE" ] && [ -s "$RESULT_FILE" ] && [ "${FORCE_RERUN:-0}" != "1" ]; then
    echo " ⏭  결과 이미 존재 — 건너뜀 (재실행: FORCE_RERUN=1)"
    return
  fi

  local PREV=""
  if [ "$PREFIX" = "part4" ] && [ "$NUM" -gt 1 ]; then
    local PREV_FILE="$RESULTS_DIR/part4-$(printf '%02d' $((NUM-1))).md"
    [ -f "$PREV_FILE" ] && PREV="
---
## 이전 파트 결과
$(cat "$PREV_FILE")"
  fi
  local PROMPT="$(cat "$COMMON" | sed "s|{{OAUTH_TOKEN}}|$OAUTH_TOKEN|g")
---
$(cat "$PART_FILE" | sed "s|{{OAUTH_TOKEN}}|$OAUTH_TOKEN|g")$PREV
---
결과를 $RESULTS_DIR/${PREFIX}-$(printf '%02d' $NUM).md 에 저장. 스크린샷은 $SCREENSHOTS_DIR/ 에 저장. UX 자유 탐색도 실행."

  local ATTEMPT=0
  local EXIT_CODE=1
  while [ $ATTEMPT -lt 2 ] && [ $EXIT_CODE -ne 0 ]; do
    ATTEMPT=$((ATTEMPT + 1))
    [ $ATTEMPT -gt 1 ] && echo " ↻ 재시도 ($ATTEMPT/2) — 30초 대기..." && sleep 30
    claude --chrome -p "$PROMPT" --dangerously-skip-permissions
    EXIT_CODE=$?
  done
  [ $EXIT_CODE -ne 0 ] && echo " ⚠️  비정상 (${ATTEMPT}회 시도)" || echo " ✅ 완료 (시도: $ATTEMPT)"
}

echo "╔══════════════════════════════════════╗"
echo "║  윈도우 E2E: 1-02 ~ Part 4          ║"
echo "║  $(date)              ║"
echo "╚══════════════════════════════════════╝"

# Part 1: 02~15
P1=("part1-02-onboarding" "part1-03-dashboard" "part1-04-companies" "part1-05-employees" "part1-06-departments" "part1-07-agents" "part1-08-permissions" "part1-09-tools" "part1-10-costs" "part1-11-credentials" "part1-12-reportlines" "part1-13-soultemplates" "part1-14-monitoring" "part1-15-settings")
echo "━━━ Part 1 (02~15) ━━━"
for i in "${!P1[@]}"; do run_part "$SCRIPT_DIR/common.md" "${P1[$i]}" $((i+2)) "part1"; done

# Part 2: 01~12
P2=("part2-01-login-hub" "part2-02-dashboard-nexus" "part2-03-chat" "part2-04-organization" "part2-05-agents-memories" "part2-06-jobs-workflows" "part2-07-knowledge-files" "part2-08-reports" "part2-09-marketing-sns" "part2-10-trading-messenger" "part2-11-logs-costs" "part2-12-notifications-settings")
echo ""
echo "━━━ Part 2 (App) ━━━"
for i in "${!P2[@]}"; do run_part "$SCRIPT_DIR/common-app.md" "${P2[$i]}" $((i+1)) "part2"; done

# Part 3: 01~02
P3=("part3-01-admin-mobile" "part3-02-app-mobile")
echo ""
echo "━━━ Part 3 (모바일) ━━━"
for i in "${!P3[@]}"; do run_part "$SCRIPT_DIR/common-mobile.md" "${P3[$i]}" $((i+1)) "part3"; done

# Part 4: 01~04
P4=("part4-01-admin-setup" "part4-02-app-first-login" "part4-03-app-chat-workflow" "part4-04-cleanup-verify")
echo ""
echo "━━━ Part 4 (풀플로우) ━━━"
for i in "${!P4[@]}"; do run_part "$SCRIPT_DIR/common-fullflow.md" "${P4[$i]}" $((i+1)) "part4"; done

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  전체 완료! $(date)   ║"
echo "╚══════════════════════════════════════╝"
