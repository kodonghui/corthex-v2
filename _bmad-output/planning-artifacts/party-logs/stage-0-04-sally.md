# Sally (UX Designer) Review — Step 04: Success Metrics

**Reviewer:** Sally | UX Designer
**Step:** 04 — Success Metrics
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 313–358)
**Date:** 2026-03-20

---

## In Character Review

*처음 이 섹션을 읽으면서 두 가지 감정이 교차했다. 첫 번째: 안도. `/office` 5분+ 체류 비율이 Layer 1 KPI에 명확히 박혀있다. John과 내가 Step 3에서 챙기자고 합의했던 그 지표다. 두 번째: 찜찜함. "CEO /office 일간 사용률"이라는 지표가 비즈니스 목표 표에 버젓이 앉아있는데 — v2에 event analytics가 있는지 아무도 확인하지 않았다.*

*"가볍게 잡고 넘어가라"는 방침을 이해한다. Metrics 섹션이 PRD 단계 전에 수치로 과하게 채워지면 오히려 제약이 된다. 그 방침 안에서 이 섹션은 꽤 잘 쓰여졌다. Layer 1~4 KPI 구조가 Vision 구조를 그대로 반영한 점이 특히 좋다. 다만 "가볍게" 안에서도 측정 가능성은 확보되어야 한다. 몇 가지가 그 선을 살짝 넘고 있다.*

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | WOW 달성률 90%+, 에러율 < 1%, 성공률 > 95%, 200KB 하드 한도, soul-renderer 100% — 기술 KPI 구체적. Gap: 온보딩 완료율·Big Five 채택률·CEO 일간 사용률에 방향만 있고 수치 기준선 없음 (정책상 허용). |
| D2 완전성 | 8/10 | User Success 4개 + Layer 1~4 KPI + Business Objectives 4개 전부 커버. AHA 1 (/office 5분 체류) ✅, AHA 2 (재수정 감소) ✅. Gap: Secondary Users(직원) 경험 지표 없음. |
| D3 정확성 | 7/10 | `/ws/office`, soul-renderer.ts `{{personality_traits}}`, agent_memories Option B, ARGOS 크론 모두 ✓. Gap: "Admin 7단계 완료" 퍼널 — 5번째 n8n이 "(선택)"인데 7단계 완료 기준에 포함되면 선택 단계를 건너뛴 사용자를 "미완료"로 집계하는 정확도 오류 발생. |
| D4 실행가능성 | 7/10 | /office 체류 시간(WebSocket duration), 에러율, 번들 크기, DB 쿼리 기반 지표들은 구현 가능. Gap 1: "CEO /office 일간 사용률" — event analytics 인프라 존재 여부 미언급. Gap 2: "soul-renderer.ts 주입 성공률 100%" — 측정 메커니즘(엔진 로그? 성공/실패 이벤트?) 없음. |
| D5 일관성 | 8/10 | Vision Layer 1~4 순서 그대로 KPI 구조 반영 ✅. ARGOS 유지 ✅, Option B ✅. Gap: WOW 달성률 90%+ 목표 vs. 테스트 태스크가 "[권장]"(비필수) — 비필수 단계가 90% 목표를 보장할 수 없음. |
| D6 리스크 | 7/10 | Layer 4 Reflection 비용 ⚠️ 이월 명시 ✅. Gap 1: "CEO /office 일간 사용률" 측정 인프라 없을 경우 출시 후 측정 불가 리스크. Gap 2: "재수정 횟수" 6개월 지표의 실패 기준 없음 (감소 0%면 메모리 미동작 판단 기준 불명). Gap 3: soul-renderer 100% = 실패 감지 방법 미기재. |

### 가중 평균 (Sally 가중치: D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 8 | 15% | 1.20 |
| D2 | 8 | 20% | 1.60 |
| D3 | 7 | 15% | 1.05 |
| D4 | 7 | 15% | 1.05 |
| D5 | 8 | 15% | 1.20 |
| D6 | 7 | 20% | 1.40 |

### **가중 평균: 7.50/10 ✅ PASS** (Grade B)

---

## 이슈 목록

### Issue 1 — [D4/D6 MEDIUM] "CEO /office 일간 사용률" 측정 인프라 미확인

비즈니스 목표 표 (L355): "CEO /office 일간 사용률 — 3개월 후 측정"

v2에 event analytics 인프라(페이지 뷰 로깅, 세션 추적)가 있는지 이 섹션에 확인이 없다. WebSocket 연결 수는 server 로그에서 볼 수 있지만, "일간 사용률"은 unique user × 날짜 기반 집계로 별도 인프라가 필요하다.

만약 v2에 analytics가 없다면:
- 지표가 정의되었지만 3개월 후 측정 시 "어떻게 측정하지?"가 되는 상황 발생
- Zero Regression 철학 위반 없이 analytics를 추가할 수 있는지 PRD에서 결정 필요

**필요한 수정 (가볍게):** "측정 방법: WebSocket 연결 로그 집계 — v2 기존 server 로그 활용 가능 여부 PRD 확인" 한 줄.

### Issue 2 — [D3 MEDIUM] n8n "(선택)" 단계가 "7단계 완료" 퍼널에 포함

온보딩 플로우 L195~203:
```
Admin 계정 생성(1) → 회사 설정(2) → 조직 구성(3) → AI 에이전트 설정(4)
→ 테스트 태스크(5) → n8n 연결(6, 선택) → CEO 초대(7)
```

L323: "Admin 7단계 완료 → CEO 초대 완료 퍼널"

n8n이 "(선택)"인데 "7단계 완료" 퍼널 기준에 들어가면:
- n8n을 쓰지 않는 사용자(대다수 초기 유저)는 영원히 "6단계 완료"로 집계
- 퍼널 완료율이 낮게 나와 실제보다 나쁜 온보딩으로 오해될 수 있음

**필요한 수정:** "온보딩 완료율 — Admin 필수 6단계 완료 (n8n 선택 단계 제외)" 또는 "6+1 퍼널로 분리 측정."

### Issue 3 — [D5 LOW] WOW 달성률 90%+ vs. 테스트 태스크 "[권장]" 불일치

L324: "CEO /office 첫 접속 WOW 달성률 — 90%+ 목표 (테스트 태스크 온보딩으로 보장)"

L200: "→ [권장] 테스트 태스크 예약 실행 — CEO /office WOW 모먼트 보장"

"권장"(optional)이 90% 목표를 "보장"한다는 건 논리적으로 성립하지 않는다. 권장 단계를 건너뛰면 /office를 열었을 때 에이전트가 idle이고 WOW는 발생하지 않는다.

선택지:
1. "[권장]" → "[필수: CEO 초대 전]"으로 격상 (온보딩 Wizard에 포함)
2. 또는 90% 목표 수치를 현실적으로 조정 + "권장" 실행 시 달성 가능으로 명시

**가볍게 처리 가능:** "(테스트 태스크 권장 단계 완료 시 90%+ 달성 가능)" 표현으로 조정.

---

## Analyst 사전 요청 항목 확인

### AHA 1 지표 — /office 5분 리텐션
✅ **존재함**: L331 "Layer 1 KPI: `/office` 페이지 5분+ 체류 비율 (WOW 리텐션 지표)"
John과 합의한 그 지표. 명확하고 측정 방법도 WebSocket session duration으로 실현 가능.

### AHA 2 지표 — 6개월 후 에이전트 성장 감동
✅ **존재함**: L326 "에이전트 재수정 횟수 감소 — 동일 유형 태스크 수정 요청 횟수 추이 ↓ 6개월 후 초기 대비"
다만 "초기 대비 얼마나 감소해야 성공인가" 기준이 없음 (PRD 이월로 허용 가능).

---

## Cross-talk 요약

- **Winston**: D3 — n8n "(선택)" 단계 7단계 카운트 문제, agent_memories Option B KPI 정합성 검토 요청.

### Winston Cross-talk 결과 (2026-03-20)

**Issue 2 심각도 상향 [D3 MEDIUM → D4 HIGH]:**
- Winston 코드 확인: `onboarding.ts`는 `{ completed: boolean }` 만 반환 — step-level 추적 자체 없음
- "7단계 완료 퍼널" 지표는 현재 API로 **구현 불가** — 표현 수정만으로 해소 안 됨
- 구현하려면 `onboarding.ts`에 `completedSteps: string[]` 배열 추가 필요 (PRD 범위 결정 사안)
- n8n 분리 집계 기술 경로: `onboarding/complete` API proxy + companies.settings JSONB (v2 기존 구조 재활용) — 구현 부담 낮음
- Analyst에게 Issue 2 업그레이드 전달 완료.
- **John**: D4/D6 — analytics 인프라 이슈. PM 관점에서 v2 server 로그 범위 확인 요청.
- **Bob**: D5 — "[권장]" vs. 90% 목표 불일치. 스코프 결정(필수화 vs. 수치 조정) 영향.

### Bob Cross-talk 결과 (2026-03-20)

**Issue 3 (WOW 90% vs. 권장) → Option B 채택 확정:**
- Bob: Option A(필수 격상)는 온보딩 중 LLM API 과금 발생 → 비즈니스 모델 검토 사안. Brief 단계에서 필수화는 과함.
- Sally 추가 인식: 온보딩 과금 각도는 내가 놓친 D6 리스크. Bob 보완으로 해소.
- **결정**: "보장" → 삭제, "권장 완료 시 달성 가능" 조건부 표현으로 약화 (Option B)

**Bob 추가 이슈: UXUI 리셋 KPI 없음 [D2 MEDIUM]**
- Differentiator 5(428 색상 혼재 해소) 대응 지표가 Metrics 섹션에 없음.
- Sally 제안 3개: ① 색상 토큰 컴플라이언스율(하드코딩 0) ② 비작동 UI 요소 0건 ③ Phase 0 완료 게이트(≥95% 일치율)
- Analyst에게 공동 플래그 전달 완료.
- **Bob 보완**: ① 색상 토큰 컴플라이언스 = ESLint hardcoded color rule로 빌드 타임 자동화 → Sprint story 1개로 해결. 별도 측정 Epic 불필요. Issue 1(analytics 인프라)과 별개 문제 — CEO 일간 사용률은 여전히 PRD 확인 필요.

---

## [Verified] Round 1 — 2026-03-20

**파일 직접 확인:**
- ✅ Issue 1: L360 `/ws/office` duration 서버 로깅 명시 + L364 측정 인프라 NOTE
- ✅ Issue 2: L323 필수 4단계 기준 + `completed === true` proxy + `completedSteps` PRD 이월
- ✅ Issue 3: L324 WOW "보장" → "(테스트 태스크 완료 시 달성 가능, 권장)"
- ✅ Issue 4: L350-353 Layer 0 UXUI 리셋 KPI 신설 (ESLint + Playwright + Phase 0 ≥95%)
- ✅ **Bonus**: L343 soul-renderer.ts 100% 측정 메커니즘 — `renderSoul()` try-catch + `task_executions.error_code` + fallback (요청하지 않은 D4 이슈까지 해소)

**Round 1 점수 재산정:**

| 차원 | 초기 | Verified | 근거 |
|------|------|---------|------|
| D1 | 8 | 9 | UXUI KPI 3개 추가 + 온보딩 퍼널 측정 방법 구체화 |
| D2 | 8 | 9 | Layer 0 UXUI 신설 — Differentiator 5 대응 지표 완성 |
| D3 | 7 | 9 | n8n/테스트태스크 optional 제외, completed===true proxy 명시 |
| D4 | 7 | 9 | soul-renderer 측정 경로 + /ws/office duration logging + 퍼널 구현 경로 |
| D5 | 8 | 9 | WOW "보장" → 조건부 표현 — 논리 일관성 복원 |
| D6 | 7 | 8 | 측정 인프라 리스크 해소 + soul-renderer fallback 경로 명시 |

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 9 | 15% | 1.35 |
| D2 | 9 | 20% | 1.80 |
| D3 | 9 | 15% | 1.35 |
| D4 | 9 | 15% | 1.35 |
| D5 | 9 | 15% | 1.35 |
| D6 | 8 | 20% | 1.60 |

### **최종: 8.80/10 ✅ PASS (Grade A)**

(초기 7.50 → 8.80 — 4개 이슈 + bonus soul-renderer 측정 경로 추가로 상향)
