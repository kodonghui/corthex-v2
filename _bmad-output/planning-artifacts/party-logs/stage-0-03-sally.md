# Sally (UX Designer) Review — Step 03: Target Users

**Reviewer:** Sally | UX Designer
**Step:** 03 — Target Users
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 187–294)
**Date:** 2026-03-20

---

## In Character Review

*이수진은 이 제품의 숨은 영웅이다. 에이전트를 만들고, 성격을 불어넣고, 워크플로우를 연결하고, 마침내 CEO를 초대한다. 그리고 나서? 그녀는 자기가 만든 AI 조직이 일하는 걸 본 적이 없다. `/office`는 CEO 앱에만 있기 때문에.*

*v2 교훈(온보딩 순서)이 명시된 건 탁월하다. 이 섹션의 뼈대는 단단하다. 하지만 두 개의 구멍이 보인다: 김도현의 WOW 모먼트가 보장되지 않고, 이수진의 역할이 완성되지 않는다.*

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 이름·나이·기술수준·페이지수·사용빈도 명시. AHA 모먼트 "conscientiousness 1.0 → 체크리스트 자동 작성" 구체적. Gap: Admin이 /office 접근 가능 여부 미기재. |
| D2 완전성 | 8/10 | Primary 2명 + Secondary 2유형 전부 커버. 온보딩 플로우 ✓. Gap: Admin의 /office 접근 여부 미정의 + Secondary Users(일반 직원)의 에이전트 성격 변화 경험 미언급. |
| D3 정확성 | 8/10 | Admin 27페이지 + CEO 42페이지 = 69. v2 audit 71페이지와 2 차이. NEXUS, Soul Templates, Hub, Chat 기능 ✓. |
| D4 실행가능성 | 7/10 | 온보딩 6-step Journey 구체적. Gap: "이 순서를 건너뛰면 빈 화면"이지만 강제 구현 방법(Wizard? Guard? Redirect?) 없음 — 구현자가 해석해야 함. |
| D5 일관성 | 8/10 | Admin=Primary1, CEO=Primary2 결정 반영 ✓. Vision Layer 1-4 기능과 정합. v2 교훈 위치 적절. Admin 기술수준 "중간(코딩 불필요)" vs. Soul Template 작성 tension 있으나 허용 수준. |
| D6 리스크 | 6/10 | v2 온보딩 교훈 ✓. Gap 1: CEO WOW 모먼트 조건 미보장. Gap 2: Admin Big Five AHA 도달 조건 없음 (테스트 채팅 없이 AHA 불가). Gap 3: Secondary Users 에이전트 성격 변화 노출 리스크 언급 없음. |

### 가중 평균 (Sally 가중치: D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 8 | 15% | 1.20 |
| D2 | 8 | 20% | 1.60 |
| D3 | 8 | 15% | 1.20 |
| D4 | 7 | 15% | 1.05 |
| D5 | 8 | 15% | 1.20 |
| D6 | 6 | 20% | 1.20 |

### **가중 평균: 7.45/10 ✅ PASS** (Grade B 기준 충족)

---

## 이슈 목록

### Issue 1 — [D6 HIGH] CEO의 `/office` WOW 모먼트가 보장되지 않음

김도현의 AHA 모먼트: "`/office`를 처음 열었을 때 — 픽셀 캐릭터 에이전트들이 각자 책상에서 실시간으로 타이핑하고..."

그런데 온보딩 플로우를 보면:
```
CEO 앱 첫 로그인 → Hub 대시보드 → Chat 태스크 지시 → /office 관찰
```

**문제:** 김도현이 `/office`를 열 때 에이전트들이 실제로 무언가를 *처리하고 있어야* WOW가 발생한다. 에이전트가 idle 상태이면 빈 사무실만 보인다. 온보딩에 "Admin이 CEO 초대 전 테스트 태스크 1개 예약 실행" 단계가 없으면, 첫 `/office` 경험이 WOW가 아니라 "어, 다들 자고 있네"가 될 수 있다.

**필요한 수정:** 온보딩 플로우에 단계 추가:
```
CEO 계정 초대
  → ⚠️ CEO 첫 로그인 전 테스트 태스크 예약 (Admin 권장) — /office WOW 보장
    → CEO 앱 사용 시작
```

### Issue 2 — [D4 MEDIUM] 온보딩 강제 구현 방법 미기재

L205: "이 순서를 건너뛰면 CEO 앱이 빈 화면을 보여준다. v3 온보딩 UX는 이 플로우를 강제해야 한다."

'강제'의 구현 방법이 없다:
- **Option A — Wizard 방식**: 완료 단계별로 잠금 해제 (Notion/Linear 온보딩 패턴)
- **Option B — Guard 방식**: 조건 미충족 시 redirect + 안내 메시지
- **Option C — Progressive Disclosure**: 빈 상태에서 설정 유도 CTA

어느 패턴인지 Vision에서 결정되지 않으면 Admin이 CEO를 초대했는데 CEO 앱이 아무 안내도 없이 빈 화면이 되는 최악의 UX가 발생할 수 있다.

**필요한 수정:** "v3 온보딩 강제 방식: Wizard (추천) — Admin 완료 단계별 잠금 해제, CEO 초대 전 체크리스트 완료 필수" 또는 명확한 방향 선택.

### Issue 3 — [D2 MEDIUM] Admin이 `/office` 볼 수 없음 — 운영자의 관찰 권리 누락

Vision: "`/office` — CEO 앱 `/office`" (CEO 전용)
Users 섹션: Admin 사용 기능에 `/office` 없음.

이수진은 CORTHEX AI 조직의 설계자이자 운영자다. 그런데 자신이 성격을 부여한 에이전트들이 실제로 일하는 모습을 *볼 수 없다*. 운영 담당자가 운영 상황을 볼 수 없는 것은 UX 원칙상 역할-기능 불일치.

선택지:
1. Admin 앱에도 read-only `/office` 뷰 추가
2. 또는 명시적으로 "Admin은 /office 접근 불가 (의도적 결정 — CEO 전용)"으로 기재

어느 쪽이든 명시가 필요하다. 지금은 정의가 없어 구현자가 임의 결정하게 된다.

---

## Analyst 직접 질문 답변: 페르소나 생동감 + AHA 모먼트 품질

### 페르소나 생동감
**이수진(32, Admin)**: 실명+나이+기술수준+구체적 pain points = 기술적으로 충분. 하지만 *왜 이 회사에 왔는지, 이전에 어떻게 AI 에이전트를 다뤘는지* backstory가 없어 아직 flat. "전략 담당과 고객 응대가 같은 톤이면 안 된다"는 pain point는 excellent — 이 문장이 유일하게 살아있는 순간.

**김도현(38, CEO)**: SaaS 스타트업 대표라는 설정이 구체적. "내 AI 팀이 지금 뭘 하는지 모르겠다"는 pain point는 블랙박스 문제와 직결되어 강력. 생동감 더 높음.

**종합**: 80% — 기술 정보는 완전, 인물 온기는 아직 아쉬움. Grade B 기준에는 충분.

### AHA 모먼트 품질
- **Admin AHA** (Big Five): "이게 진짜 개성이네" — 구체적, 즉각적. ✅
- **CEO AHA 1** (/office 첫 경험): "처음으로 '봤다'" — 감각적, excellent ✅
- **CEO AHA 2** (한 달 후 성장): "이 에이전트가 성장했다" — 시간 경과 감동, 탁월 ✅

**AHA 모먼트 자체는 Grade A 수준**. 단, Issue 1이 지적하듯 AHA에 *도달하는 조건*이 보장되지 않는다는 게 D6 리스크.

---

## Cross-talk 요약

- John/Bob: D4(온보딩 강제 방법)에서 같은 이슈 포착 예상. 스코프 결정에 영향.
- Winston: Admin 27페이지 vs. audit 71페이지 숫자 검증 요청 (D3 확인용).
- Secondary Users(일반 직원) 에이전트 성격 변화 경험 — v1-feature-spec과 충돌 없는지 확인 필요.

---

## [Verified] Round 1 — 2026-03-20

**적용 확인 사항:**
- ✅ Issue 1 (CEO WOW 조건): 온보딩 플로우에 "테스트 태스크 예약 실행" 단계 추가 (L200)
- ✅ Issue 2 (온보딩 강제 구현): Wizard + ProtectedRoute 2단계 방식 명시 (L206-208)
- ✅ Issue 3 (Admin /office 관찰 권리): read-only 뷰로 결정 + 태스크 지시는 CEO 앱 구분 명시 (L236)

**Round 1 점수 재산정:**

| 차원 | 초기 | Round 1 | 근거 |
|------|------|---------|------|
| D1 | 8 | 9 | `getOnboardingStatus` API명 + 온보딩 조건 + solo founder NOTE 추가 |
| D2 | 8 | 9 | Admin /office read-only 추가, 1인 창업자 시나리오 완성 |
| D3 | 8 | 8 | 페이지 수 차이(69 vs 71) 미해소 → Round 2 대기 |
| D4 | 7 | 9 | Wizard(단계 잠금해제) + ProtectedRoute(CEO) 명확히 결정됨 |
| D5 | 8 | 9 | 기존 `getOnboardingStatus` API 활용 — 일관성 ✅ |
| D6 | 6 | 8 | WOW 보장 조건 + 강제 구현 방법 + Admin 가시성 전부 해소 |

### **Round 1 가중 평균: 8.65/10 ✅ PASS**

---

## Winston Cross-talk — D3 이슈 (2026-03-20)

**Winston 발견:** 이전 텍스트 "onboardingStep < 5" = 존재하지 않는 필드 참조 (D3 할루시네이션 후보).
실제 `getOnboardingStatus` 반환값: `{ completed: boolean }` — onboardingStep 없음.

**확인 결과:** [Fixes Applied v2]에서 이미 수정 완료:
- L208: `completed === false`이면 리다이렉트 (올바른 조건)
- L208: API 시그니처 `{ completed: boolean }` 명시
- L311: 페이지 수 71 = Admin 27 + CEO 42 + Login 2, v3 → 73 명시

D3 할루시네이션 리스크: **해소됨** ✅

---

## [Verified] Round 2 — 2026-03-20

**Round 2 추가 적용 확인:**
- ✅ `onboardingStep < 5` → `completed === false` (Winston D3 지적 반영)
- ✅ API 시그니처 `{ completed: boolean }` 명시 (코드 검증 완료 표기)
- ✅ 페이지 수 71 = Admin 27 + CEO 42 + Login 2 분해, v3 → 73 명시 (L311)

**Round 2 점수 재산정:**

| 차원 | Round 1 | Round 2 | 근거 |
|------|---------|---------|------|
| D1 | 9 | 9 | 유지 — `completed === false` 구체성 동등 이상 |
| D2 | 9 | 9 | 유지 |
| D3 | 8 | **9** | 페이지 수 71=27+42+2 분해 + Login 2 설명 + API 시그니처 코드 검증 완료 |
| D4 | 9 | 9 | 유지 — `completed === false` 조건이 오히려 더 명확 |
| D5 | 9 | 9 | 유지 |
| D6 | 8 | 8 | 유지 |

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 9 | 15% | 1.35 |
| D2 | 9 | 20% | 1.80 |
| D3 | 9 | 15% | 1.35 |
| D4 | 9 | 15% | 1.35 |
| D5 | 9 | 15% | 1.35 |
| D6 | 8 | 20% | 1.60 |

### **Round 2 최종 가중 평균: 8.80/10 ✅ PASS (Grade A)**
