# Stage 0 Step 04 — Success Metrics Fixes Applied

Date: 2026-03-20
Writer: analyst (Mary)
Avg score before fix: 7.275/10 (John 7.10 ✅, Bob 7.50 ✅, Sally 7.50 ✅, Winston 7.00 ✅)

---

## Fixes Applied

### Issue 1 [HIGH — D3/D4] ✅ FIXED: 온보딩 퍼널 구현 불가
**Issue (John/Sally/Winston 공통):** "Admin 7단계 완료 퍼널" — `onboarding.ts`는 `{ completed: boolean }` 반환, step-level 추적 없음. 또한 n8n(선택)·테스트태스크(권장) 2개가 optional인데 "7단계 완료" 기준에 포함 시 대다수 미완료 집계.
**Fix:** 온보딩 완료율 측정 방법 전면 교체:
- "필수 단계(회사설정·조직구성·에이전트설정·CEO초대) 기준. n8n·테스트태스크 optional 제외"
- "측정 proxy: `getOnboardingStatus` `completed === true` 기준"
- "step-level 퍼널 필요 시 `completedSteps` 배열 추가 — PRD 결정"

### Issue 2 [MEDIUM — D2] ✅ FIXED: UXUI 리셋 KPI 없음
**Issue (Bob/Sally/John 공통):** Layer 1~4 KPI 있는데 Differentiator 5(UXUI 완전 리셋)만 성공 기준 없음.
**Fix:** "Layer 0 — UXUI 리셋 (Design System)" 섹션 추가:
- 하드코딩 색상: themes.css 외 0곳 (428→0, ESLint 룰 게이팅)
- Dead button: 0개 (Playwright E2E)
- Phase 0 디자인 게이팅: ≥ 95% Subframe 일치율

### Issue 3 [LOW — D5] ✅ FIXED: WOW "보장" 논리 모순
**Issue (Sally/Bob 공통):** "테스트 태스크 온보딩으로 보장" — 테스트 태스크는 "[권장]"(선택)이므로 "보장" 불가.
**Fix:** "↑ 90%+ 목표 (테스트 태스크 완료 시 달성 가능, 권장)"으로 약화.

### Issue 4 [MEDIUM — D6] ✅ FIXED: Analytics 인프라 미언급
**Issue (Bob/Sally/John 공통):** 측정 인프라 실존 여부 미확인.
**Fix:** 비즈니스 목표 표에 측정 방법 컬럼 추가 + 하단 주석:
- CEO /office 체류율: `/ws/office` 세션 duration 서버 로깅 (v3 신규 구현, 별도 Epic 불필요)
- 기타: execution log 기반 또는 PRD 결정

### Issue 5 [D4/D6] ✅ FIXED: soul-renderer.ts 주입 성공률 측정 경로 없음
**Issue (Winston):** `renderSoul()` silent failure 감지 불가.
**Fix:** Layer 3 KPI에 측정 경로 추가: "renderSoul() try-catch 에러 → task_executions.error_code 기록. extraVars 누락 시 fallback + worker log 경고 — 기존 실패 추적 경로 재활용"

### Issue 6 [LOW] ✅ FIXED: Business Objectives 측정 방법 미명시
**Issue (John):** User Success 표와 비대칭 — 측정 방법 없음.
**Fix:** 비즈니스 목표 표에 "측정 방법" 컬럼 추가, 각 행에 구체적 측정 경로 명시.

### Issue 7 [LOW] ✅ FIXED: Reflection 이월 블로커 조건 미명시
**Issue (John):** 이월 표시만 있고 미정의 시 결과 없음.
**Fix:** "(⚠️ 이월 — PRD에서 미정의 시 v3 출시 블로커)" 추가.

---

## Summary
- 총 7개 이슈 전부 적용
- 온보딩 퍼널: 필수 단계 기준 + completed 기반 측정 + completedSteps PRD 이월
- UXUI 리셋 Layer 0 KPI 신설 (하드코딩 색상, dead button, Phase 0 게이팅)
- soul-renderer.ts 측정 경로: task_executions 재활용
- 측정 인프라: /ws/office 서버 로깅 + execution log 기반 명시
