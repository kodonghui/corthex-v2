# Critic-A Review — Stage 0, Step 03: Target Users

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (L187–293)
**Cross-checked:** `v3-corthex-v2-audit.md`, `packages/server/src/routes/onboarding.ts`

---

## 수치 검증

| Vision 주장 | 실제값 | 일치 |
|-------------|--------|------|
| Admin 앱 27개 페이지 (L218) | audit 27개 ✅ | ✅ |
| CEO 앱 42개 페이지 (L253) | audit 42개 ✅ | ✅ |
| `onboarding.ts` 존재 (암묵적 참조) | `packages/server/src/routes/onboarding.ts` 실존 ✅ | ✅ |
| Big Five 특성명 (L226, L232) | `conscientiousness`, `extraversion` 등 정확 ✅ | ✅ |

**추가 발견 (onboarding.ts L17):**
> `"authMiddleware + tenantMiddleware only (no adminOnly — CEO users use onboarding)"`

현재 코드에서 CEO 유저도 `/api/onboarding/*` 접근 가능. 브리프의 "Admin 먼저 → CEO 초대" 플로우와 모순이 아니라 보완 관계 — CEO도 온보딩 상태 확인은 가능. 그러나 CEO가 Admin 설정 없이 CEO 앱을 여는 것을 막는 **게이팅 메커니즘**이 코드에 보이지 않음.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Admin/CEO 페르소나 이름·나이·빈도 명시. Big Five 특성명 정확. AHA 모먼트 2개 구체적. Secondary Users는 2줄 — Grade B 허용 범위. |
| D2 완전성 | 8/10 | Admin first → CEO second 결정 명시. 양 유저 Journey 완성. Secondary Users(직원) 포함. 온보딩 강제 "해야 한다" 선언됨. |
| D3 정확성 | 8/10 | 27/42 페이지 audit 일치. Big Five 특성명 정확. `onboarding.ts` API 실존. **주의: v3에서 Admin+1(n8n), CEO+1(/office) 추가 시 71→73페이지 — 단, Vision 수치는 v2 기준이라 기술적으로 오류는 아님.** |
| D4 실행가능성 | 7/10 | 온보딩 플로우 다이어그램(L195-203) ✅. User Journey 6단계 ✅. **미지정: L205 "이 플로우를 강제해야 한다" — 구현 경로 없음.** `getOnboardingStatus` API 존재하나 CEO 앱 게이팅 방식(미들웨어? 프론트엔드 리다이렉트?) 정의 없음. |
| D5 일관성 | 9/10 | Admin 27 / CEO 42 audit 정합. `/office` 라우트 Vision과 일치. v2 교훈 명시 — planning brief "CEO 먼저 설계한 결과 혼란" 직접 반영. |
| D6 리스크 | 7/10 | v2 온보딩 실패 교훈 명시 ✅. 단, 강제 메커니즘 미정의 = v2와 같은 문제 재발 위험. n8n 워크플로우 Admin 페이지 신규 추가 → Admin 페이지 카운트 변경 미언급. |

### 가중 평균: **7.85/10 ✅ PASS**

- D1: 8 × 0.15 = 1.20
- D2: 8 × 0.15 = 1.20
- D3: 8 × 0.25 = 2.00
- D4: 7 × 0.20 = 1.40
- D5: 9 × 0.15 = 1.35
- D6: 7 × 0.10 = 0.70
- **합계: 7.85/10**

---

## 이슈 목록

### 🟠 Issue 1 — [D4/D6] 온보딩 강제 메커니즘 미정의

**위치:** L205 — "v3 온보딩 UX는 이 플로우를 강제해야 한다."

**Winston:** "요구사항은 맞다. 그런데 어떻게 강제하는가? `onboarding.ts`에 `getOnboardingStatus` API가 있다. CEO 앱이 로드될 때 이 상태를 확인해서 미완료면 온보딩 화면으로 리다이렉트하는 것인가? 아니면 서버 미들웨어가 온보딩 미완료 회사의 CEO 요청을 403으로 차단하는가? 구현 경로가 정해지지 않으면 PRD에서 개발자가 '강제'를 어떤 방식으로든 구현할 수 있다 — 그리고 v2에서 그게 제대로 안 됐다고 브리프 자체가 말하고 있다."

**Fix 필요:** L205에 "강제 방식: CEO 앱 초기 로드 시 `/api/onboarding/status` 확인 → `completed: false`이면 `/onboarding` 화면으로 프론트엔드 리다이렉트" 한 줄 추가.

---

### 🟡 Issue 2 — [D3] v3 페이지 수 변동 미언급

**위치:** L218 "Admin 앱 (27개 페이지)" + Vision L177 "71개 페이지"

**Winston:** "v3는 신규 페이지를 추가한다 — Admin: n8n 관리 페이지(+1), CEO: `/office`(+1) → 최소 73개. Vision의 '71개 페이지'와 여기 'Admin 27개'는 v2 기준 수치다. 제품 브리프에서 v2→v3 페이지 수 변화를 어딘가에 명시하지 않으면, 나중에 Differentiator에서 '71개'를 계속 쓰게 되고, v3 출시 시 실제 수치와 어긋난다. 작은 문제지만 D3 정확성 신뢰도에 영향을 준다."

**Fix 필요:** L218 아래 또는 Secondary Users 뒤에 "(v3 추가 예정: Admin +1 n8n 관리 페이지, CEO +1 /office → v3 총 73개 예상)" 각주 추가.

---

## Cross-talk 요약 (Sally에게)

- **Issue 1 (온보딩 강제)**: UX 관점에서 "강제 리다이렉트 vs 게이팅"은 UX 설계에 직접 영향. Sally가 D4 UX 각도에서도 동일 이슈 지적 권장. CEO가 처음 앱을 열었을 때 어떤 화면을 보는가?
- **Issue 2 (페이지 수)**: Sally가 UX 인벤토리 관점에서 v3 신규 페이지 2개의 기존 네비게이션 영향 검토 권장.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **7.85/10 ✅ PASS** |
| **Priority Fix 🟠** | Issue 1: 온보딩 강제 메커니즘 명시 |
| **Quick Fix 🟡** | Issue 2: v3 페이지 수 변동 각주 |

Admin first 결정, 양 사용자 페르소나, Journey 플로우 모두 건전. 2개 이슈 수정 후 Step 4 진행 권장.
