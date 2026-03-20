# Critic-A Review — Stage 0, Step 03: Target Users

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (L187–310)
**Cross-checked:** `v3-corthex-v2-audit.md`, `packages/server/src/routes/onboarding.ts`, `packages/app/src/App.tsx`

---

## 수치 검증

| Vision 주장 | 실제값 | 일치 |
|-------------|--------|------|
| Admin 앱 27개 페이지 | audit 27개 ✅ | ✅ |
| CEO 앱 42개 페이지 | audit 42개 ✅ | ✅ |
| `onboarding.ts` API 존재 | `packages/server/src/routes/onboarding.ts` ✅ | ✅ |
| Big Five 특성명 (`conscientiousness` 등) | 정확 ✅ | ✅ |

---

## 아키텍처 핵심 발견 (Bob 요청 검증)

**`packages/app/src/App.tsx` 직접 확인:**

```
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)  // L54
  // ← onboarding status 체크 없음
}
```

`/onboarding` 라우트는 존재하고 ProtectedRoute로 감싸져 있음 — 그러나 ProtectedRoute는 **인증 여부만 확인**. 온보딩 미완료 상태에서도 CEO가 `/home`, `/chat`, `/office` 등 모든 라우트에 접근 가능.

**결론:** v2에서 "Admin 설정 없이 CEO 앱 접근" 문제가 반복됐던 이유가 코드에서 확인됨. ProtectedRoute에 온보딩 완료 체크가 없다. v3의 "강제" 요구사항은 이 코드를 수정해야 달성됨 — 단순 UX 의도가 아닌 **코드 변경 필요 사항**이다.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Admin/CEO 페르소나 이름·나이·빈도 명시. Big Five 특성명 정확. AHA 모먼트 2개 구체적. Secondary Users 표 추가됨. |
| D2 완전성 | 8/10 | Admin first → CEO second 결정 명시. 양 유저 Journey 완성. 온보딩 강제 요구사항 선언됨. |
| D3 정확성 | 8/10 | 27/42 페이지 audit 일치. **단, v3 신규 2페이지(Admin +n8n, CEO +/office) 추가 → 71→73개 변동 미언급.** onboarding.ts API 실존. ProtectedRoute 온보딩 미체크 = v2 실제 코드 상태 정확히 반영 (버그임). |
| D4 실행가능성 | 6/10 | 온보딩 플로우 다이어그램 ✅. User Journey 6단계 ✅. **[핵심 미지정]** L205 "강제해야 한다" — App.tsx ProtectedRoute에 onboarding 체크 없음이 코드로 확인됨. v3에서 어디를 수정해야 하는지 미명시. Brief에 있으면 PRD/architecture가 바로 반영 가능. |
| D5 일관성 | 9/10 | Admin 27 / CEO 42 audit 정합. `/office` Vision 일치. v2 교훈 직접 반영 — planning brief "혼란 반복" 정확히 계승. |
| D6 리스크 | 7/10 | v2 온보딩 실패 교훈 명시 ✅. **그러나 강제 메커니즘 미정의 = v3도 같은 문제 재발 위험.** ProtectedRoute 수정 없이 v3 출시하면 "강제"는 문서상 선언에 불과. |

### 가중 평균: **7.65/10 ✅ PASS**

- D1: 8 × 0.15 = 1.20
- D2: 8 × 0.15 = 1.20
- D3: 8 × 0.25 = 2.00
- D4: 6 × 0.20 = 1.20
- D5: 9 × 0.15 = 1.35
- D6: 7 × 0.10 = 0.70
- **합계: 7.65/10**

---

## 이슈 목록

### 🟠 Issue 1 — [D4/D6] 온보딩 강제 미구현 — 코드 검증됨

**위치:** L205 + `packages/app/src/App.tsx` L53-54

**Winston:** "`ProtectedRoute`가 `isAuthenticated`만 확인하고 온보딩 상태를 체크하지 않는다 — 코드로 직접 확인했다. `/onboarding` 페이지는 존재하지만 접근이 강제되지 않는다. v2에서 같은 문제가 반복된 이유가 이것이다. v3에서 '강제'를 실현하려면 두 가지 경로가 있다: (A) `ProtectedRoute`에 `getOnboardingStatus` 체크 추가 → 미완료면 `/onboarding`으로 리다이렉트, (B) App.tsx 최상단에 startup hook 추가 → 로그인 직후 onboarding status 확인. (A)가 더 깔끔하다. 이 결정이 Brief에 없으면 PRD 작성자가 또 '어딘가에서 강제되겠지'라고 넘어간다."

**Fix 필요:** L205 아래 한 줄: "구현 방식: CEO 앱 `ProtectedRoute`에 `getOnboardingStatus` 확인 추가 → `isCompleted: false`이면 `/onboarding` 리다이렉트 (인증 체크와 동일 레이어)."

---

### 🟡 Issue 2 — [D3] v3 페이지 수 변동 미언급

**위치:** L218 "Admin 앱 (27개 페이지)" + Key Differentiators "71개 페이지"

**Winston:** "v3는 Admin에 n8n 관리 페이지(+1), CEO에 `/office`(+1) 추가 — 71→73개 예상. 브리프 어딘가에 'v2 기준 71개, v3 +2 예정'을 명시하지 않으면 Differentiator의 '71개 페이지' 수치가 v3 출시 후 틀린 정보가 된다."

**Fix 필요:** Secondary Users 아래 또는 사용자 세그먼트 표에 `(v3: Admin +1 n8n 페이지, CEO +1 /office 페이지 → 총 73개 예정)` 각주 추가.

---

## Cross-talk 요약

- **Bob(SM)**: 아키텍처 검증 완료 — 미들웨어 레벨이 아닌 **프론트엔드 ProtectedRoute 레벨** 수정이 정답. `tenantMiddleware`는 온보딩 상태를 체크하지 않음(서버 미들웨어에 onboarding 체크 없음 확인). 프론트엔드 접근 제어가 올바른 경로.
- **Sally**: CEO 초기 접속 시 온보딩 미완료 상태 UX 설계 필요 — 빈 화면이 아닌 "Admin이 설정 중입니다, 기다려주세요" 또는 온보딩 안내 화면.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **7.65/10 ✅ PASS** |
| **Priority Fix 🟠** | Issue 1: ProtectedRoute 온보딩 게이팅 메커니즘 명시 |
| **Quick Fix 🟡** | Issue 2: v3 페이지 수 변동 각주 |

Admin first 결정, 페르소나, Journey 플로우 건전. Issue 1 수정 시 v2 반복 실패 방지 가능.
