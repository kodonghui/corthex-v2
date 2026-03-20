# Stage 0 Step 03 — Target Users Fixes Applied

Date: 2026-03-20
Writer: analyst (Mary)
Avg score before fix: 7.525/10 (John 7.35 ✅, Bob 7.45 ✅, Sally 7.45 ✅, Winston 7.85 ✅)

---

## Fixes Applied

### Common Issue [HIGH — D6] ✅ FIXED: 온보딩 강제 메커니즘 미명시
**Issue (John/Bob/Sally/Winston 공통):** "v3 온보딩 UX는 이 플로우를 강제해야 한다" 선언만 있고 구현 방향 없음.
**Fix:** 온보딩 플로우 하단에 강제 구현 블록 추가:
- CEO 계정은 Admin이 직접 초대해야만 생성됨 (Bob Option C 채택)
- CEO 앱 첫 로드 시 `getOnboardingStatus` API 확인 (Winston 검증: API 실존)
- `company.settings.onboardingStep < 5`이면 `/onboarding` 리다이렉트 (John 수정안)

### John Issue 1 [HIGH — D6] ✅ FIXED: 1인 창업자 시나리오 없음
**Issue:** Admin=CEO 동일인 케이스 공백 — 초기 스타트업 고객에게 치명적.
**Fix:** 온보딩 플로우 하단 "1인 창업자 노트" 추가:
- Admin 설정 완료 후 CEO 앱으로 전환
- 동일 계정으로 두 앱 접근 가능 (Admin: `/admin/...`, CEO: `/...`)
- 온보딩 순서는 동일하게 적용

### Sally Issue 1 [HIGH — D6] ✅ FIXED: CEO `/office` WOW 도달 조건 미보장
**Issue:** 에이전트가 idle이면 /office는 빈 사무실 → WOW 모먼트 미달성.
**Fix:** 온보딩 플로우에 "[권장] 테스트 태스크 예약 실행 — CEO /office WOW 모먼트 보장" 단계 추가 (CEO 초대 직전 위치).

### Bob Issue 2 [MEDIUM — D4] ✅ FIXED: Admin 27페이지 v2 기준 미표기
**Issue:** v3에서 n8n 관리 페이지 추가되는데 27개가 v2 기준인지 불명확.
**Fix:** "27개 페이지 v2 기준, v3 +1 예정"으로 수정.

### Winston Issue 2 [MEDIUM — D3] ✅ FIXED: v3 신규 페이지 수 변동 미언급
**Issue:** CEO 42 + Admin 27 모두 v3에서 각 +1 예정인데 미표기.
**Fix:** CEO 앱도 "42개 페이지 v2 기준, v3 +1 예정"으로 수정.

### Sally Issue 3 [MEDIUM — D2] ✅ FIXED: Admin의 `/office` 접근 여부 미정의
**Issue:** Admin이 에이전트 운영 상태를 /office에서 볼 수 없으면 역할-기능 불일치.
**Fix:** Admin v3 주요 사용 기능 목록에 `/office` read-only 뷰 추가 (태스크 지시는 CEO 앱에서).

### John Issue 3 [LOW — D2] ✅ FIXED: Admin 단독 의존성 단일 장애점
**Issue:** Admin 퇴사/부재 시 CEO 앱 설정 변경 불가.
**Fix:** Admin User Journey 마지막에 "(엔터프라이즈) Admin 다중 계정 추가 → 단일 장애점 해소 (v2 기능, 유지)" 추가.

### Cross-talk Round 2: ProtectedRoute 구체화 + Wizard 패턴 [D4/D6] ✅ FIXED

**Winston/Bob 코드 검증**: `packages/app/src/App.tsx` L53-54 `ProtectedRoute`가 `isAuthenticated`만 체크. 온보딩 완료 미체크 = v2 문제 재발 경로.

**Fix:** "강제 구현" 블록을 2단계로 재작성:
- Admin 측: Wizard 방식 (Step 1~6 잠금 해제, Notion/Linear 패턴)
- CEO 측: `ProtectedRoute`에 `getOnboardingStatus()` 추가 → `isCompleted: false`면 Setup Required 리다이렉트

### Cross-talk Round 2: 페이지 수 69/71 차이 해소 [D3] ✅ FIXED
**Sally 지적**: Admin 27 + CEO 42 = 69, audit 71과 차이 → Login 2 페이지 누락.
**Fix:** User Segment 표 하단에 "페이지 수 참고" 추가: v2 총 71개 = Admin 27 + CEO 42 + Login 2. v3 +2 → 73개 예상.

### CEO /office WOW 조건 (John 크로스톡) — 이미 적용됨 ✅
**확인**: Round 1에서 이미 온보딩 플로우에 "[권장] 테스트 태스크 예약 실행" 단계 추가 완료.

---

## Summary
- 총 9개 이슈 전부 적용 (Round 1: 7개 + Round 2: 2개 신규)
- 온보딩 강제: Wizard(Admin) + ProtectedRoute 체크(CEO) — v2 미구현 원인까지 코드 수준 명시
- 1인 창업자 엣지 케이스 명시
- 페이지 수 71개 분해 (27+42+2) + v3 +2 → 73 예상 표기
- Admin /office read-only 뷰 의도 명시
