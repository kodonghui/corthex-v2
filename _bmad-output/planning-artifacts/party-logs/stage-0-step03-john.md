# Critic-C Review — Step 03: Target Users

**Reviewer:** John (PM) — Critic-C (Product + Delivery)
**Date:** 2026-03-20
**File reviewed:** `product-brief-corthex-v3-2026-03-20.md` lines 187–280

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 이수진(32세 Admin) + 김도현(38세 CEO) 페르소나 명확. 앱 페이지 수(Admin 27, CEO 42), 사용 빈도, AHA Moment, User Journey 6단계 모두 구체적. conscientousness 1.0 → 체크리스트 예시 탁월. 단, 회사 규모/업종 없음 (acceptable). |
| D2 완전성 | 7/10 | Primary 1+2 + Secondary Users 커버. 온보딩 플로우 ASCII 다이어그램 ✓. 단, **1인 창업자(Admin=CEO 동일인) 시나리오 없음**. 구매 결정권자가 누구인지(B2B 세일즈 플로우) 없음. Admin 부재 시 처리 없음. |
| D3 정확성 | 8/10 | Hub/Chat 용어 MEMORY.md 일치 ✓. NEXUS Epic 9 실재 ✓. Admin 27 + CEO 42 = 69페이지 (v2 audit 71 중 2 차이 — v3 신규 페이지 반영 가능). Agora 언급(line 290) — v2 기능 유지 주장이나 확인 불가. |
| D4 실행가능성 | 7/10 | 온보딩 플로우 ASCII 다이어그램이 구현 기반. 그러나 "v3 온보딩 UX는 이 플로우를 강제해야 한다" — **어떻게 강제하는지 없음**. Route guard? Onboarding wizard? Admin 설정 완료 체크 API? 미명시 시 개발자가 독자 결정. |
| D5 일관성 | 9/10 | Admin First 순서 → v2 교훈 일관 반영. Hub/Chat/Dashboard 용어 Step 2 Vision + MEMORY.md PRD 용어 일치. Big Five, n8n, /office, NEXUS — Step 2와 완전 정합. |
| D6 리스크 | 6/10 | Admin 미설정 → CEO 빈 화면 언급 ✓. 그러나 **3개 리스크 미언급**: (1) Admin=CEO 동일인(1인 창업자) 시 온보딩 플로우 적용 방법, (2) CEO가 Admin 설정 대기 중 이탈 리스크, (3) Admin 퇴사/부재 시 CEO 앱 접근 불가 단일 장애점. |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 6 | 20% | 1.20 |

### **가중 평균: 7.35/10 ✅ PASS**

---

## 이슈 목록

### Issue #1 [D2 완전성 + D6 리스크] — 1인 창업자(Admin=CEO 동일인) 시나리오 없음 ⚠️ HIGH

"Admin 먼저, CEO 나중" 강제 순서가 이 섹션의 핵심인데 — 1인 스타트업 창업자는 Admin 앱과 CEO 앱 **모두** 본인이 사용한다. 이 경우:
- Admin 계정 설정 완료 후 CEO 앱으로 전환하는 플로우가 어떻게 되는가?
- Admin과 CEO가 같은 계정인가, 별도 계정인가?
- 1인 창업자가 CORTHEX의 핵심 초기 타겟이라면 이 시나리오가 없는 것은 Product 관점의 공백.

**수정안:** 온보딩 플로우 하단에 "(1인 창업자의 경우: Admin 설정 완료 후 CEO 앱으로 전환. 동일 계정으로 두 앱 접근 가능)" 1줄 추가.

### Issue #2 [D4 실행가능성 + D6 리스크] — 온보딩 강제 메커니즘 미명시 ⚠️ MEDIUM

"v3 온보딩 UX는 이 플로우를 강제해야 한다" — 요구사항은 명시됐지만 어떻게 강제하는지 없다. 개발자가 이 한 줄을 보고 구현할 수 있는가?

선택지:
- Route guard: CEO 앱 모든 route에서 `company.onboardingComplete` 체크
- Onboarding wizard: 첫 로그인 시 강제 스텝 플로우
- API 레벨: Admin 설정 미완료 시 CEO 앱 API 403 반환

어느 방법인지 불명확하면 Epic 착수 시 설계 결정을 다시 해야 한다.

**수정안:** "강제 메커니즘: CEO 앱 라우트에 `onboardingComplete` 체크 미들웨어. `company.settings.onboardingStep < 5`이면 `/onboarding` 리다이렉트."

### Issue #3 [D6 리스크] — Admin 단독 의존성 단일 장애점 ⚠️ LOW

Admin이 퇴사하거나 계정에 접근 불가 시 CEO 앱 설정 변경 불가. v3가 "AI 조직 운영 플랫폼"을 표방하는데 운영 담당자 1명이 단일 장애점이 되면 엔터프라이즈 신뢰성 문제.

**수정안:** Secondary Users 섹션에 "Super Admin 개념: 회사당 최소 2개 Admin 계정 권장. 단, v3 MVP에서는 Admin 다중 계정은 이미 v2 구현 (스코프 내)" 1줄.

---

## Cross-talk 요약

- Sally(UX)가 AHA Moment 품질과 /office 첫 경험 UX에 긍정 평가할 것으로 예상. 다만 1인 창업자 시나리오 누락을 지적할 가능성.
- Bob(SM)이 온보딩 강제 메커니즘을 Sprint 구현 관점에서 지적할 것으로 예상. Issue #2와 overlap 예상.
- Winston(Arch)이 Admin 27 + CEO 42 = 69 vs 71 페이지 수치 불일치 지적 가능.
- **전반적 평가**: 페르소나 품질 좋음. AHA Moment가 특히 강력. 온보딩 순서 강제 이슈만 해결하면 8점대 달성 가능.
