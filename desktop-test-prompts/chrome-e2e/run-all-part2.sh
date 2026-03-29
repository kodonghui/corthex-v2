#!/bin/bash
# CORTHEX App E2E 테스트 자동 실행기 (Part 2)
# 사용법: bash run-all-part2.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMON="$SCRIPT_DIR/common-app.md"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"

mkdir -p "$RESULTS_DIR" "$SCREENSHOTS_DIR"

source "$SCRIPT_DIR/load-token.sh"

PARTS=(
  "part2-01-login-hub"
  "part2-02-dashboard-nexus"
  "part2-03-chat"
  "part2-04-organization"
  "part2-05-agents-memories"
  "part2-06-jobs-workflows"
  "part2-07-knowledge-files"
  "part2-08-reports"
  "part2-09-marketing-sns"
  "part2-10-trading-messenger"
  "part2-11-logs-costs"
  "part2-12-notifications-settings"
)

echo "========================================"
echo " CORTHEX App E2E 테스트 시작 (Part 2)"
echo " 총 ${#PARTS[@]}개 파트"
echo " $(date)"
echo "========================================"

# 범위 실행 지원: START_PART/END_PART 환경변수로 분할 가능 (기본: 전체)
# 예) START_PART=1 END_PART=6 bash run-all-part2.sh   → Part 2-01~2-06 (Mac)
#     START_PART=7 END_PART=12 bash run-all-part2.sh  → Part 2-07~2-12 (Windows)
_START=${START_PART:-1}
_END=${END_PART:-${#PARTS[@]}}

for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  NUM=$((i + 1))

  if [ $NUM -lt $_START ] || [ $NUM -gt $_END ]; then
    continue
  fi

  PART_FILE="$SCRIPT_DIR/${PART}.md"

  echo ""
  echo "──────────────────────────────────────"
  echo " [$NUM/${#PARTS[@]}] $PART 시작..."
  echo " $(date)"
  echo "──────────────────────────────────────"

  if [ ! -f "$PART_FILE" ]; then
    echo " ❌ 파일 없음: $PART_FILE — 건너뜀"
    continue
  fi

  RESULT_FILE="$RESULTS_DIR/part2-$(printf '%02d' $NUM).md"
  if [ -f "$RESULT_FILE" ] && [ -s "$RESULT_FILE" ] && [ "${FORCE_RERUN:-0}" != "1" ]; then
    echo " ⏭  결과 이미 존재: $(basename "$RESULT_FILE") — 건너뜀 (재실행: FORCE_RERUN=1)"
    continue
  fi

  PROMPT="$(cat "$COMMON" | sed "s|{{OAUTH_TOKEN}}|$OAUTH_TOKEN|g")

---

$(cat "$PART_FILE" | sed "s|{{OAUTH_TOKEN}}|$OAUTH_TOKEN|g")

---

작업 완료 후 반드시:
1. 결과를 $RESULTS_DIR/part2-$(printf '%02d' $NUM).md 파일에 보고서 양식대로 저장
2. 스크린샷을 $SCREENSHOTS_DIR/ 폴더에 저장
3. 정해진 단계 끝나면 UX 자유 탐색 실행 (common-app.md 규칙 참고)"

  ATTEMPT=0
  EXIT_CODE=1
  while [ $ATTEMPT -lt 2 ] && [ $EXIT_CODE -ne 0 ]; do
    ATTEMPT=$((ATTEMPT + 1))
    [ $ATTEMPT -gt 1 ] && echo " ↻ 재시도 ($ATTEMPT/2) — 30초 대기..." && sleep 30
    claude --chrome -p "$PROMPT" --dangerously-skip-permissions
    EXIT_CODE=$?
  done

  if [ $EXIT_CODE -ne 0 ]; then
    echo " ⚠️  $PART 비정상 종료 (${ATTEMPT}회 시도, code: $EXIT_CODE)"
  else
    echo " ✅ $PART 완료 (시도: $ATTEMPT)"
  fi
done

echo ""
echo "========================================"
echo " Part 2 전체 테스트 완료: $(date)"
echo " 결과: $RESULTS_DIR/"
echo " 스크린샷: $SCREENSHOTS_DIR/"
echo "========================================"
