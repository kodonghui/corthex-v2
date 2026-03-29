#!/bin/bash
# Part 2: 3번부터 재시작
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMON="$SCRIPT_DIR/common-app.md"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"
mkdir -p "$RESULTS_DIR" "$SCREENSHOTS_DIR"

PARTS=(
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
echo " Part 2: 3/12부터 재시작 (10개)"
echo " $(date)"
echo "========================================"

for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  NUM=$((i + 3))
  PART_FILE="$SCRIPT_DIR/${PART}.md"
  echo ""
  echo "──────────────────────────────────────"
  echo " [$NUM/12] $PART 시작..."
  echo " $(date)"
  echo "──────────────────────────────────────"
  [ ! -f "$PART_FILE" ] && echo " ❌ 파일 없음 — 건너뜀" && continue
  PROMPT="$(cat "$COMMON")
---
$(cat "$PART_FILE")
---
작업 완료 후 반드시:
1. 결과를 $RESULTS_DIR/part2-$(printf '%02d' $NUM).md 파일에 보고서 양식대로 저장
2. 스크린샷을 $SCREENSHOTS_DIR/ 폴더에 저장
3. 정해진 단계 끝나면 UX 자유 탐색 실행"
  claude --chrome -p "$PROMPT" --dangerously-skip-permissions
  [ $? -ne 0 ] && echo " ⚠️  비정상 종료" || echo " ✅ 완료"
done

echo ""
echo "========================================"
echo " 완료: $(date)"
echo "========================================"
