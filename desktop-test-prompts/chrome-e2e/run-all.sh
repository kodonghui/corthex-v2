#!/bin/bash
# CORTHEX Admin E2E 테스트 자동 실행기
# 사용법: bash run-all.sh
# 맥북에서 claude --chrome -p 로 파트별 순차 실행

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMON="$SCRIPT_DIR/common.md"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"

mkdir -p "$RESULTS_DIR" "$SCREENSHOTS_DIR"

# OAuth 토큰 자동 로드
source "$SCRIPT_DIR/load-token.sh"

PARTS=(
  "part1-01-login"
  "part1-02-onboarding"
  "part1-03-dashboard"
  "part1-04-companies"
  "part1-05-employees"
  "part1-06-departments"
  "part1-07-agents"
  "part1-08-permissions"
  "part1-09-tools"
  "part1-10-costs"
  "part1-11-credentials"
  "part1-12-reportlines"
  "part1-13-soultemplates"
  "part1-14-monitoring"
  "part1-15-settings"
)

echo "========================================"
echo " CORTHEX Admin E2E 테스트 시작"
echo " 총 ${#PARTS[@]}개 파트"
echo " $(date)"
echo "========================================"

for i in "${!PARTS[@]}"; do
  PART="${PARTS[$i]}"
  NUM=$((i + 1))
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

  # common.md + part 파일을 합쳐서 프롬프트로 전달
  PROMPT="$(cat "$COMMON" | sed "s|{{OAUTH_TOKEN}}|$OAUTH_TOKEN|g")

---

$(cat "$PART_FILE" | sed "s|{{OAUTH_TOKEN}}|$OAUTH_TOKEN|g")

---

작업 완료 후 반드시:
1. 결과를 $RESULTS_DIR/part1-$(printf '%02d' $NUM).md 파일에 보고서 양식대로 저장
2. 스크린샷을 $SCREENSHOTS_DIR/ 폴더에 저장
3. 정해진 단계 끝나면 UX 자유 탐색 실행 (common.md 규칙 참고)"

  claude --chrome -p "$PROMPT" --dangerously-skip-permissions

  EXIT_CODE=$?

  if [ $EXIT_CODE -ne 0 ]; then
    echo " ⚠️  $PART 비정상 종료 (code: $EXIT_CODE)"
  else
    echo " ✅ $PART 완료"
  fi
done

echo ""
echo "========================================"
echo " 전체 테스트 완료: $(date)"
echo " 결과: $RESULTS_DIR/"
echo " 스크린샷: $SCREENSHOTS_DIR/"
echo "========================================"
