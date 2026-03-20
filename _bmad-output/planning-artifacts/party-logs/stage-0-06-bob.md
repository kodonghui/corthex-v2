## Critic-C Review (Bob, SM) — Step 06: Final Assembly Review

**Reviewed by:** Bob the Scrum Master
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (전체 문서)
**My weights:** D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%
**Grade target:** Grade C AUTO (7.0+ required)

---

### 검증 항목 (Analyst [Review Request] 기준)

#### ✅ Sprint 순서·의존성 일관성

| 위치 | 내용 | 상태 |
|------|------|------|
| L132 (Core Vision) | Layer 3→2→4→1 순서 명시 | ✅ |
| L376-383 (MVP Scope) | Pre-Sprint(Phase 0) → L3(Sprint 1) → L2(Sprint 2) → L4(Sprint 3) → L1(Sprint 4) | ✅ |
| L380 | Phase 0 "Sprint 1 착수 전 완료 필수" | ✅ |
| L382 | Sprint 3 블로커 "PRD Tier 비용 한도 확정" | ✅ |
| L383 | Sprint 4 블로커 "Stage 1 Technical Research 에셋 품질 승인" | ✅ |

Sprint 순서와 의존성은 Vision→Scope 전 섹션 일관 ✅

#### ⚠️ memory-reflection.ts + observations 3단계 흐름 일관성

| 위치 | 내용 | 상태 |
|------|------|------|
| L155 (Core Vision) | `"기존 memory-extractor.ts: Reflection 크론 모드 확장 (기존 즉시 추출 모드 유지)"` | ❌ 구버전 |
| L409 (MVP Scope) | `"memory-extractor.ts 직접 확장 대신 신규 memory-reflection.ts 분리"` | ✅ 현행 |
| L411 (MVP Scope) | 3단계 흐름: `observations(raw) → memory-reflection.ts 크론 → agent_memories[reflection]` | ✅ |

**불일치 발견**: Core Vision L155가 Step 05 수정 사항(memory-reflection.ts 분리)을 반영하지 못함. MVP Scope는 정확하지만, Core Vision에서 PRD 저자가 먼저 읽으면 옛 방식(memory-extractor.ts 직접 확장)으로 착각할 수 있음.

#### ✅ PRD 이월 블로커 명시

| 위치 | 내용 | 상태 |
|------|------|------|
| L349 (Metrics) | Tier 비용 한도 `"⚠️ 이월 — PRD에서 미정의 시 v3 출시 블로커"` | ✅ |
| L382 (Scope Sprint표) | `"PRD Tier 비용 한도 확정 선행 필수 (미확정 시 Sprint 3 블로커)"` | ✅ |
| L413 (Layer 4 In Scope) | `"⚠️ Sprint 3 블로커"` | ✅ |

PRD 이월 블로커 3곳에서 일관되게 명시됨 ✅

---

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 레이어별 파일명·경로·API 수·Sprint 순서 완비. E8 경계는 L431에서 "신규 서비스 레이어에서 호출만 허용"으로 부분 정의됨 — Brief 수준에서 허용 가능. |
| D2 완전성 | 9/10 | YAML frontmatter stepsCompleted:[1..6]+status:COMPLETE ✅. VPS 제약 블록 ✅. Known Risks 블록 ✅. Future Vision ✅. PRD 블로커 ⚠️ 3중 표기 ✅. |
| D3 정확성 | 9/10 | soul-renderer.ts extraVars ✅ (Winston 확인). ARGOS 유지 ✅. Option B agent_memories ✅. Hono 프록시 패턴 ✅. onboarding `completed===false` ✅. |
| D4 실행가능성 | 9/10 | Pre-Sprint Phase 0 + 8개 Go/No-Go 게이트 + Sprint별 블로커 명시. Solo dev 용량 고려됨. |
| D5 일관성 | 7/10 | Sprint 순서 전 섹션 일관 ✅. PRD 블로커 다중 표기 일관 ✅. **Gap: L155 Core Vision이 memory-extractor.ts 직접 확장 방식을 아직 기술 — L409 MVP Scope의 memory-reflection.ts 분리 결정과 충돌.** |
| D6 리스크 | 9/10 | Go/No-Go #2 silent failure(빈 문자열 FAIL) ✅. Go/No-Go #8 에셋 품질 ✅. n8n 포트 5678 보안 ✅. Reflection 비용 블로커 ✅. Zero Regression 다중 표기 ✅. |

---

### 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 9 | 20% | 1.80 |
| D2 완전성 | 9 | 20% | 1.80 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 9 | 15% | 1.35 |
| D5 일관성 | 7 | 10% | 0.70 |
| D6 리스크 | 9 | 20% | 1.80 |
| **합계** | | **100%** | **8.80** |

### 최종 점수: **8.80/10 ✅ PASS (Grade A)**

---

### 이슈 목록

**Issue 1 — [D5 일관성] Core Vision L155 memory-extractor.ts 구버전 기술 (Priority: MEDIUM)**

L155 (Core Vision, Layer 4 설명):
> `"기존 memory-extractor.ts: Reflection 크론 모드 확장 (기존 즉시 추출 모드 유지)"`

이는 Step 05 이전 방침이다. Step 05 수정을 통해 L409 (MVP Scope)는:
> `"memory-extractor.ts 직접 확장 대신 신규 memory-reflection.ts 분리"`

로 최종 확정됐다. Core Vision 섹션이 갱신되지 않아 같은 문서에서 Layer 4 구현 방식이 두 가지로 기술된다. PRD 저자가 Vision을 먼저 읽으면 옛 방식으로 이해할 위험.

**수정 방법**: L155를 `"기존 memory-extractor.ts: 즉시 추출 모드 유지. Reflection 크론 모드는 신규 memory-reflection.ts(별도 파일)로 분리"`로 교체.

---

### Bob's SM Comment

> "8.80 — Brief 전체 완성도 우수. Sprint 순서·의존성이 Vision→Scope까지 일관되고, PRD 블로커 3중 표기가 명확하다. Go/No-Go 8개 게이트가 출시 기준을 구체적으로 잡아줬다. 수정이 필요한 건 하나 — Core Vision L155가 Step 05에서 확정된 memory-reflection.ts 분리 결정을 반영하지 않았다. 같은 문서 안에서 Layer 4 구현 방식이 두 가지로 읽히면 PRD 작성 시 혼선이 생긴다. 한 줄 수정으로 해결 가능하다."

---

### Step 07+ Watch Items (SM 관점)
- L155 수정 확인 (memory-reflection.ts 분리 반영)
- PRD 진입 시: Tier 비용 한도 수치 확정이 Sprint 3 블로커 — PRD Phase 에서 가장 먼저 해결해야 할 항목
- soul-renderer.ts `renderSoul()` 호출 패턴이 PRD FR에서 soul-enricher.ts/soul-renderer.ts 명칭 혼용 없이 일관되게 사용되는지 확인 필요
