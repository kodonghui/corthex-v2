#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMON="$SCRIPT_DIR/common-mobile.md"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"
mkdir -p "$RESULTS_DIR" "$SCREENSHOTS_DIR"

source "$SCRIPT_DIR/load-token.sh"

PARTS=("part3-01-admin-mobile" "part3-02-app-mobile")

echo "========================================"
echo " Part 3: 모바일 반응형 테스트 (${#PARTS[@]}파트)"
echo " $(date)"
echo "========================================"

for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  NUM=$((i + 1))
  PART_FILE="$SCRIPT_DIR/${PART}.md"
  echo ""
  echo " [$NUM/${#PARTS[@]}] $PART..."
  [ ! -f "$PART_FILE" ] && echo " ❌ 파일 없음" && continue
  PROMPT="$(cat "$COMMON")
---
$(cat "$PART_FILE")
---
결과를 $RESULTS_DIR/part3-$(printf '%02d' $NUM).md 에 저장. 스크린샷은 $SCREENSHOTS_DIR/ 에 저장. UX 자유 탐색도 실행."
  claude --chrome -p "$PROMPT" --dangerously-skip-permissions
  [ $? -ne 0 ] && echo " ⚠️  비정상 종료" || echo " ✅ 완료"
done
echo ""
echo "========================================"
echo " Part 3 완료: $(date)"
echo "========================================"
