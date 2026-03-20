# Critic-A Review — Stage 0, Step 04: Success Metrics

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (L313–358)
**Cross-checked:** `packages/server/src/routes/onboarding.ts`, `packages/server/src/engine/soul-renderer.ts`, `v3-corthex-v2-audit.md`

---

## 수치 검증 (D3 우선)

| Metrics 주장 | 실제값 | 일치 |
|-------------|--------|------|
| soul-renderer.ts `{{personality_traits}}` 주입 100% | soul-renderer.ts + extraVars 실존 (Step 02 검증) | ✅ 존재, ❌ 측정 경로 없음 |
| `agent_memories` 단절률 0% (Option B 기준) | schema.ts L1589 agent_memories + memory-extractor.ts 실존 | ✅ |
| 485 API 보존 (Business Objectives) | audit 485개 | ✅ |
| ARGOS 크론 중단율 0% | v2에 ARGOS 크론 실존 | ✅ |
| Admin 7단계 완료 퍼널 | `onboarding.ts` → `{ completed: boolean }` — step 카운팅 없음 | ❌ |
| WebSocket `/ws/office` 에러율 < 1% | v3 신규 채널 (v2 audit 14채널 + v3 +1) | ✅ 선언 정확 |

**핵심 발견: `onboarding.ts` `getOnboardingStatus` 코드 직접 확인:**
```
GET /api/onboarding/status → { completed: boolean, selectedTemplateId: string }
```
Step-level 완료 상태 없음. "Admin 7단계 완료 퍼널" 측정을 위한 step 추적 API가 v2에 존재하지 않는다.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | Layer KPI 수치 명시: WebSocket <1%, PixiJS <200KB, n8n >95%, ARGOS 0%, soul-renderer 100%. WOW 90%+. 그러나 온보딩 완료율·Big Five 채택률·CEO 일간 사용률은 방향만 (정책상 허용). |
| D2 완전성 | 7/10 | User Success 4개 + Layer 1~4 KPI + Business Objectives 4개 + Reflection 비용 이월 명시. Gap 1: UXUI 완전 리셋(Differentiator 5)의 Success Metric 없음. Gap 2: n8n 선택 단계 포함 시 "7단계 완료"의 완전성 기준 불명확. |
| D3 정확성 | 7/10 | agent_memories ✅, 485 API ✅, ARGOS ✅. **오류**: L323 "Admin 7단계 완료 퍼널" — onboarding.ts는 `{ completed: boolean }`만 반환. step 단위 추적 없음. 7단계 중 "[권장]"(step 5)과 "(선택)"(step 6) 2개가 optional인데 "7단계 완료" 기준이 코드에서 구현 불가한 정의. |
| D4 실행가능성 | 6/10 | PixiJS 번들(빌드타임), ARGOS 0%(바이너리), agent_memories 단절(DB 쿼리) — 구현 가능 ✅. **미정의**: (1) soul-renderer.ts 주입 성공률 측정 경로 없음, (2) CEO /office 5분+ 체류·일간 사용률 — event analytics 인프라 v2에 없음, (3) "Admin 7단계 퍼널" step API 미존재. |
| D5 일관성 | 9/10 | VPS 200KB ✅, Option B 0% 단절 ✅, ARGOS ✅, 485 API ✅, Vision Layer 1~4 순서 정합 ✅. 전체 문서 일관성 탁월. |
| D6 리스크 | 6/10 | Reflection LLM 비용 ⚠️ 이월 명시 ✅. Gap 1: WOW 90%+ — "[권장]" 단계(optional)로 달성 보장 불가. Gap 2: soul-renderer.ts 100% KPI인데 renderSoul() 실패 감지 메커니즘 없음. |

### 가중 평균: **7.00/10 ✅ PASS**

- D1: 7 × 0.15 = 1.05
- D2: 7 × 0.15 = 1.05
- D3: 7 × 0.25 = 1.75
- D4: 6 × 0.20 = 1.20
- D5: 9 × 0.15 = 1.35
- D6: 6 × 0.10 = 0.60
- **합계: 7.00/10**

---

## 이슈 목록

### 🟠 Issue 1 — [D3/D4] "Admin 7단계 완료 퍼널" — onboarding.ts step 추적 없음

**위치:** L323 — "Admin 7단계 완료 → CEO 초대 완료 퍼널"

**Winston:** "`getOnboardingStatus` API를 코드로 직접 확인했다 — `{ completed: boolean, selectedTemplateId: string }` 반환. step 단위 완료 추적 없다. 따라서 '7단계 완료율'을 현재 API로 측정하는 것은 불가능하다. 추가로 Sally가 이미 지적한 것처럼, 7단계 중 step 5([권장])와 step 6((선택))이 optional인데 이 둘을 포함한 '7단계 완료' 기준은 대다수 사용자를 영원히 '미완료'로 집계한다. 아키텍처 관점 경로는 두 가지다: (A) v3 onboarding service에 `completedSteps: number[]` 배열 추가 → step별 추적, (B) CEO 계정 존재 여부로 proxy 측정 (CEO 초대가 사실상 last step이므로). (B)가 Zero Regression에 더 가깝다 — onboarding.ts 응답 구조 최소 변경."

**Fix 필요:** L323 수정: "온보딩 완료율 측정 — 필수 5단계(1~4, 7) 완료 기준. n8n(6단계)·테스트 태스크(5단계) optional 제외. 측정: CEO 계정 초대 완료 이벤트를 proxy로 사용 (`onboarding/complete` API 호출 수)."

---

### 🟡 Issue 2 — [D4/D6] soul-renderer.ts 주입 성공률 100% — 측정 메커니즘 없음

**위치:** L343 — "soul-renderer.ts `{{personality_traits}}` 주입 성공률: 100%"

**Winston:** "soul-renderer.ts `renderSoul()` extraVars 파라미터 실존 확인됨 (Step 02). 그런데 '100% 주입 성공률'을 어디서 측정하는가? v2 현재 코드에 renderSoul() 에러 카운터가 없다. `personality_traits` extraVar 주입 실패는 agent-loop.ts에서 renderSoul() 예외로 잡히거나 prompt가 `{{personality_traits}}` 변수를 그대로 출력하는 침묵 실패(silent failure)로 나타날 수 있다. '100%'를 KPI로 두려면 측정 경로가 있어야 한다."

**Fix 필요:** L343에 "측정: agent-loop.ts renderSoul() try-catch 에러 → task_executions 테이블 error_code 기록 (기존 실패 추적 경로 재활용). silent failure 방지: extraVars에 `personality_traits` 누락 시 fallback 문자열 주입 + worker log 경고." 추가.

---

## Cross-talk 요약

- **Bob(SM)**: Issue 1 Sally와 동일 — UXUI 리셋 KPI 없음 + analytics 인프라 이슈. onboarding.ts step 추적 없음은 Sprint에서 별도 story 필요 여부 판단 요청.
- **Sally**: Issue 1 공동 지지 (n8n 선택 단계 문제). soul-renderer 측정 Issue 2는 측정 인프라 부재 이슈의 아키텍처 레이어. WOW [권장] vs. 90% 불일치(Sally Issue 3) — Winston 동의, [권장] → "CEO 초대 전 필수" 격상이 아키텍처적으로 올바름.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **7.00/10 ✅ PASS** |
| **Priority Fix 🟠** | Issue 1: 퍼널 정의 — 필수 5단계 기준 + proxy 측정 명시 |
| **Quick Fix 🟡** | Issue 2: soul-renderer 주입 성공률 측정 경로 추가 |

D5 일관성이 높은 것이 이 섹션의 장점 — Layer 순서, Option B, VPS, ARGOS 모두 정합. 2개 이슈 수정 후 Step 5 진행 권장.
