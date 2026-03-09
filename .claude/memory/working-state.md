# 현재 작업 상태
> 마지막 업데이트: 2026-03-09 12:50

## 지금 하고 있는 것
- UXUI 리팩토링 파이프라인 Phase 0 완료, Phase 1 진행 직전
- Playwright e2e 테스트 환경 세팅 완료 (packages/e2e)

## 핵심 결정사항
- Playwright 테스트는 배포 URL(corthex-hq.com) 대상 — 이유: 실제 사용자 환경과 동일
- VS Code Playwright 확장 사용 (Show Browser로 시각적 확인) — 이유: 비개발자가 테스트 과정 관찰 가능
- mobile 프로젝트는 Chromium 사용 — 이유: WebKit 미설치, Chromium이면 충분
- .env.test 경로는 path.resolve(__dirname) 사용 — 이유: VS Code 확장이 프로젝트 루트에서 실행되므로 상대경로 불가

## 다음 할 것
1. Phase 1 — 스모크 테스트 결과 리포트 생성 (phase1-baseline.md)
2. admin 3개 페이지 버그 확인 (admin-home, costs, settings → 로그인 페이지로 튕김)
3. 페이지별 UXUI 리팩토링 시작 (spec → Banana2 → code → Playwright)

## 주의사항
- 새 패키지 추가 시 Dockerfile COPY 목록 반드시 업데이트 (lockfile 불일치 방지)
- 커밋 전 `./node_modules/.bin/tsc --noEmit -p packages/server/tsconfig.json` 실행 (npx tsc 안 됨)
- admin 스모크 테스트 64/67 통과 (3개 실패는 앱 자체 버그)
- 메모리 브랜치(claude/review-photos-jV8j4) main에 머지 완료
