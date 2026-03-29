#!/bin/bash
# 전체 E2E 테스트: Part 1 → Part 2 → Part 3 → Part 4 순차 실행
# 자고 일어나면 전부 끝나 있음
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "╔══════════════════════════════════════╗"
echo "║  CORTHEX 전체 E2E 테스트 시작        ║"
echo "║  Part 1 (Admin) + Part 2 (App)       ║"
echo "║  Part 3 (모바일) + Part 4 (풀플로우)  ║"
echo "║  $(date)              ║"
echo "╚══════════════════════════════════════╝"

echo ""
echo "━━━ Part 1: Admin (15파트) ━━━"
bash "$SCRIPT_DIR/run-all.sh"

echo ""
echo "━━━ Part 2: App (12파트) ━━━"
bash "$SCRIPT_DIR/run-all-part2.sh"

echo ""
echo "━━━ Part 3: 모바일 (2파트) ━━━"
bash "$SCRIPT_DIR/run-all-part3.sh"

echo ""
echo "━━━ Part 4: 풀 플로우 (4파트) ━━━"
bash "$SCRIPT_DIR/run-all-part4.sh"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  전체 테스트 완료!                    ║"
echo "║  $(date)              ║"
echo "║  결과: results/ 폴더 확인             ║"
echo "╚══════════════════════════════════════╝"
