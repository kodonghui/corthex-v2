#!/bin/bash
# CORTHEX E2E 버그 수정 + 검증 자동 실행기
# 사용법: bash run-fix.sh
# Part 1 테스트 완료 후 실행. 리포트를 읽고 → 코드 수정 → push → 배포 대기 → 크롬으로 재검증.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
SCREENSHOTS_DIR="$SCRIPT_DIR/screenshots"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 모든 리포트를 하나로 합침
ALL_REPORTS=""
BUG_COUNT=0

echo "========================================"
echo " CORTHEX E2E 버그 수정 + 검증 시작"
echo " $(date)"
echo "========================================"

for f in "$RESULTS_DIR"/part1-*.md; do
  if [ -f "$f" ]; then
    CONTENT="$(cat "$f")"
    ALL_REPORTS="$ALL_REPORTS

---
## $(basename "$f")
$CONTENT"
    # FAIL이나 BUG 카운트
    BUGS=$(grep -ci "FAIL\|BUG-" "$f" 2>/dev/null || echo 0)
    BUG_COUNT=$((BUG_COUNT + BUGS))
  fi
done

if [ "$BUG_COUNT" -eq 0 ]; then
  echo "버그 0건 — 수정할 것 없음. 종료."
  exit 0
fi

echo "총 FAIL/BUG 라인: $BUG_COUNT건 발견. 수정 시작..."

PROMPT="$(cat <<'ENDPROMPT'
# CORTHEX E2E 버그 수정 + 검증

당신은 CORTHEX 프로젝트의 버그 수정 엔지니어입니다.

## 작업 흐름

1. **아래 E2E 테스트 리포트를 분석**하여 FAIL/BUG 항목을 모두 추출하세요.
2. 각 버그에 대해:
   a. 원인을 파악하세요 (코드를 직접 읽어서)
   b. 코드를 수정하세요
   c. `npx tsc --noEmit` 로 타입 에러 없는지 확인
3. 모든 수정이 끝나면:
   a. `git add -A && git commit -m "fix(e2e): chrome QA 버그 수정" && git push`
   b. `gh run list -L 1` 으로 배포 시작 확인
   c. 배포 완료 대기 (1~2분 간격으로 `gh run list -L 1` 체크, completed 될 때까지)
4. 배포 완료 후:
   a. https://corthex-hq.com/admin 에 접속 (admin / admin1234)
   b. 수정한 버그 각각을 **크롬에서 직접 재현 단계대로 테스트**
   c. 스크린샷 촬영
5. 최종 보고서를 `results/fix-report.md` 에 저장:

```markdown
# 버그 수정 + 검증 보고서

## 수정 내역
| # | 버그 | 파일 | 수정 내용 | 검증 결과 |
|---|------|------|-----------|-----------|
| 1 | ... | ... | ... | PASS/FAIL |

## 미해결 (수정 불가능)
- (있으면 사유 포함)

## 스크린샷
- screenshots/fix-001.png
```

## 규칙
- 코드 수정은 최소한으로. 관련 없는 코드 건드리지 마세요.
- Cosmetic 등급 버그도 빠짐없이 수정하세요.
- 수정 후 반드시 크롬으로 직접 확인. "됐을 것이다" 금지.
- 확인 안 되면 다시 고쳐서 다시 push → 다시 배포 대기 → 다시 확인.
- 한 번에 안 되면 최대 3회까지 반복.

## 프로젝트 정보
- 모노레포: packages/admin (React+Vite), packages/server (Hono+Bun)
- Admin URL: https://corthex-hq.com/admin
- App URL: https://corthex-hq.com
- 로그인: admin / admin1234

ENDPROMPT
)

## E2E 테스트 리포트 (아래 내용 기반으로 버그 수정)

$ALL_REPORTS
"

echo ""
echo "──────────────────────────────────────"
echo " claude --chrome 으로 수정+검증 시작..."
echo "──────────────────────────────────────"

claude --chrome -p "$PROMPT" --dangerously-skip-permissions

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "⚠️  비정상 종료 (code: $EXIT_CODE)"
else
  echo "✅ 수정+검증 완료"
fi

echo ""
echo "========================================"
echo " 완료: $(date)"
echo " 수정 보고서: $RESULTS_DIR/fix-report.md"
echo " 스크린샷: $SCREENSHOTS_DIR/"
echo "========================================"
