#!/bin/bash
cd "$(dirname "$0")/../.." || exit 1
REPORT="desktop-test-prompts/chrome-e2e/results/fix-report.md"
if [ ! -f "$REPORT" ]; then
  echo "fix-report.md 없음"
  exit 1
fi
claude --chrome -p "아래 버그 수정 보고서를 읽고, 수정된 항목을 https://corthex-hq.com/admin (admin/admin1234) 에서 크롬으로 직접 하나씩 재테스트해라. 각 항목마다 스크린샷 찍고, 결과를 desktop-test-prompts/chrome-e2e/results/verify-report.md 에 PASS/FAIL로 저장해라.

$(cat "$REPORT")" --dangerously-skip-permissions
