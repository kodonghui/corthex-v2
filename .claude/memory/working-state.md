# 현재 작업 상태
> 마지막 업데이트: 2026-03-10 03:30

## 지금 하고 있는 것
- VS Code Claude Code에서 Subframe UXUI 리팩토링 준비 완료

## 핵심 결정사항
- Subframe 중심 파이프라인 v8 확정 — design(브라우저 프리뷰) → develop(코드 변환)
- 이 서버(Ubuntu)에서는 Subframe MCP OAuth 불가 → VS Code에서 작업
- 이전 리디자인 4회 실패 → 전부 원복 완료
- 모든 페이지 처음부터 다시 (dashboard 포함)
- Pro Max = 참고 DB, LibreUIUX = 감사 도구, Subframe = 디자인+코드 생성 도구

## 다음 할 것
1. VS Code에서 `/kdh-uxui-pipeline design command-center` 실행
2. Subframe 디자인 확인 → 확정 → `/kdh-uxui-pipeline develop command-center`
3. 1순위 9페이지 순서: command-center → chat → dashboard → trading → agora → nexus → agents → departments → credentials

## 주의사항
- 커밋 전 `npx tsc --noEmit -p packages/server/tsconfig.json` 필수
- 배포 후 완료까지 대기 → 사용자에게 보고
- Subframe 컴포넌트: packages/app/src/ui/components/ (50개+)
- .subframe/sync.json 프로젝트 ID: fe1d14ed3033
