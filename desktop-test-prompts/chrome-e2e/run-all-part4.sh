#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMON="$SCRIPT_DIR/common-fullflow.md"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"
mkdir -p "$RESULTS_DIR" "$SCREENSHOTS_DIR"

PARTS=("part4-01-admin-setup" "part4-02-app-first-login" "part4-03-app-chat-workflow" "part4-04-cleanup-verify")

echo "========================================"
echo " Part 4: 풀 플로우 테스트 (${#PARTS[@]}파트)"
echo " ⚠️  순서 중요 — 이전 파트 데이터를 다음에서 사용"
echo " $(date)"
echo "========================================"

for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  NUM=$((i + 1))
  PART_FILE="$SCRIPT_DIR/${PART}.md"
  echo ""
  echo " [$NUM/${#PARTS[@]}] $PART..."
  [ ! -f "$PART_FILE" ] && echo " ❌ 파일 없음" && continue

  # Part 4는 이전 결과 참조 필요 — 이전 파트 결과를 컨텍스트로 추가
  PREV_RESULTS=""
  if [ $NUM -gt 1 ]; then
    PREV_NUM=$((NUM - 1))
    PREV_FILE="$RESULTS_DIR/part4-$(printf '%02d' $PREV_NUM).md"
    if [ -f "$PREV_FILE" ]; then
      PREV_RESULTS="

---
## 이전 파트 결과 (참고용 — 여기서 생성한 데이터/비밀번호 사용)
$(cat "$PREV_FILE")"
    fi
  fi

  PROMPT="$(cat "$COMMON")
---
$(cat "$PART_FILE")$PREV_RESULTS
---
결과를 $RESULTS_DIR/part4-$(printf '%02d' $NUM).md 에 저장. 스크린샷은 $SCREENSHOTS_DIR/ 에 저장."
  claude --chrome -p "$PROMPT" --dangerously-skip-permissions
  [ $? -ne 0 ] && echo " ⚠️  비정상 종료" || echo " ✅ 완료"
done
echo ""
echo "========================================"
echo " Part 4 완료: $(date)"
echo "========================================"
