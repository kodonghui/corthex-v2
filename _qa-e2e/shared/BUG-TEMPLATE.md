# 버그 리포트 템플릿

## BUG-{접두사}{번호}: {한줄 요약}

- **심각도**: Critical / Major / Minor / Cosmetic
  - Critical: 페이지가 아예 안 뜸, 사용 불가
  - Major: 주요 기능이 안 됨, 레이아웃 완전 깨짐
  - Minor: 사소한 UI 문제, 정렬 어긋남
  - Cosmetic: 색상 미세 차이, 간격 약간 다름
- **페이지**: /{path}
- **재현 단계**:
  1. https://corthex-hq.com/{path} 접속
  2. {어떤 동작}
  3. {무엇이 발생}
- **기대 결과**: {정상이면 어떻게 보여야 하는지}
- **실제 결과**: {실제로 어떻게 보이는지 — 구체적으로!}
- **스크린샷**: {파일명 or 스크린샷 설명}
- **콘솔 에러**: {있으면 복사}
- **브라우저/해상도**: {Chrome 131 / 1920x1080 등}
- **추정 원인**: {가능하면 — 파일경로:라인번호}

## 접두사 규칙
- P = Playwright (Claude Code)
- G = Gemini (Antigravity)
- D = Desktop (Claude Desktop)
