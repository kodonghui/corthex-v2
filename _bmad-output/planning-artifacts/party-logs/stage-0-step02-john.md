# Critic-C Review — Step 02: Vision (Executive Summary + Core Vision)

**Reviewer:** John (PM) — Critic-C (Product + Delivery)
**Date:** 2026-03-20
**File reviewed:** `product-brief-corthex-v3-2026-03-20.md` lines 65–164

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 수치 대부분 명확: 485 API, 86 테이블, 71 페이지, 10,154 테스트, 5단계 상태 enum, `personality_traits JSONB`, 0.0~1.0 슬라이더, `/ws/office`, `/office` 라우트, PixiJS 8 + @pixi/react. 단, Reflection 크론 주기 미명시, `observations`/`memories` 테이블 컬럼 미명시. |
| D2 완전성 | 7/10 | Problem→Impact→Gap→Solution→Differentiator 5단계 구조 완전 커버. 단, **"그래서 사용자 비즈니스에 어떤 결과가 생기나"** 연결 부족. 비용 절감%, 처리 속도 등 정량적 비즈니스 가치 없음. Differentiator 5(UXUI 리셋)가 기술 부채 해결이지 사용자 가치 서술 아님. |
| D3 정확성 | 8/10 | agent-loop.ts 불변(CLAUDE.md 일치), pgvector Epic 10 기존 설치(MEMORY.md 일치), Big Five OCEAN 모델 표준 순서 일치. "14채널 WebSocket", "68개 built-in 도구", "6개 백그라운드 워커" 수치는 audit doc으로 검증 가능하나 본 리뷰에서 미검증. |
| D4 실행가능성 | 8/10 | 4개 레이어 각각 구현 경로 명확: 라이브러리명, DB 컬럼명, 상태 enum, 라우트, "코드 분기 없음" 접근법. 크론 주기, observations 스키마 세부는 미정이나 epic 레벨에서 결정 가능. |
| D5 일관성 | 9/10 | 핵심 메시지("개성·성장·실제로 일하는 모습") 전체 관통. v3-openclaw-planning-brief 4기능 1:1 대응. CLAUDE.md "if it worked in v1" → "제로 회귀 철학"으로 명시. documentPriority 순서 준수. |
| D6 리스크 | 6/10 | **[주요 누락 2개]** (1) 3단계 메모리의 Reflection 크론 실행 시 LLM API 비용 폭발 리스크 미언급 — 모든 observation을 주기적으로 요약하면 비용이 선형 증가. (2) Big Five JSON + 메모리 컨텍스트 동시 주입 시 프롬프트 크기 폭증 → context window 비용/한도 리스크 미언급. n8n 기존 워크플로우 마이그레이션 전략도 없음. |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 8 | 15% | 1.20 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 6 | 20% | 1.20 |

### **가중 평균: 7.5/10 ✅ PASS**

---

## 이슈 목록

### Issue #1 [D6 리스크] — 메모리 아키텍처의 LLM API 비용 리스크 미언급 ⚠️ HIGH

"에이전트가 경험에서 배우고 성장한다"는 게 제품 핵심 가치지만, Reflection 크론이 실행될 때마다 LLM API가 호출된다. 에이전트 수 × 관찰 빈도 × 반성 주기 = 비용이 기하급수적으로 증가할 수 있다.

추가로: Big Five JSON(5개 특성) + Reflection 메모리 컨텍스트가 모든 에이전트 실행마다 시스템 프롬프트에 추가되면 기존 프롬프트 대비 context window 소비가 얼마나 증가하는지 미언급.

WHY IT MATTERS: 비용 모델 없이 "성장하는 AI 조직"을 팔면 사용자가 실제 운영 후 요금 폭탄을 맞을 수 있다. Vision 단계에서 "메모리 비용은 tier별 상한 설정" 같은 가드레일을 명시해야 한다.

**수정안:** Vision에 리스크 callout 추가: "Reflection 크론 비용 = 에이전트 수 × 주기 함수. 기본값: 일 1회, tier별 한도. 상세는 Step 4(Metrics)에서 정의."

### Issue #2 [D2 완전성] — 비즈니스 가치 → 정량적 결과 연결 없음 ⚠️ MEDIUM

PM으로서 묻는다: **"이걸 도입한 CEO가 6개월 후 어떤 구체적 결과를 볼 수 있나?"**

현재 Vision은 기능을 설명하는 데 뛰어나지만, 사용자 입장의 비즈니스 결과(outcome)가 없다:

- "메모리가 없으면 반복 실수로 비용 낭비" → 메모리가 있으면 **얼마나** 줄어드나?
- "6개월 후 처음보다 훨씬 똑똑하게" → 어떤 지표로 측정?
- "AI 도구가 아니라 진짜 AI 조직" → 그게 고객에게 어떤 가치?

Step 4(Metrics)에서 다뤄지겠지만, Vision에서 방향성 수준의 정량 목표는 있어야 한다.

**수정안:** Executive Summary 끝에 1줄: "핵심 성과 목표: 반복 태스크 오류율 -30%, 에이전트 응답 일관성 점수 +40%, 신규 워크플로우 설정 시간 -70%. (측정 방법: Step 4)"

### Issue #3 [D6 리스크] — n8n 기존 워크플로우 마이그레이션 전략 없음 ⚠️ LOW

"기존 버그 많은 자체 워크플로우 코드 대체"라고 했는데, v2에서 이미 워크플로우를 사용 중인 사용자는 어떻게 되는가? 기존 워크플로우 데이터·설정이 n8n으로 자동 이전되는가, 수동 재설정인가?

이 질문에 답이 없으면 scope 결정 시 마이그레이션 비용이 누락된다.

**수정안:** n8n Layer 설명에 1줄: "기존 워크플로우: v3 마이그레이션 불필요 — n8n은 신규 자동화 전용. 기존 크론잡(ARGOS)은 그대로 유지."

---

## Cross-talk 요약

- Sally가 UX 관점에서 "Differentiator 5 UXUI 리셋"을 볼 때 사용자 가치 서술이 빠진 것을 지적할 가능성 높음. John Issue #2와 연결.
- Bob이 D6에서 메모리 비용 리스크를 잡을 가능성 있음. John Issue #1과 overlap 예상.
- Winston이 D3에서 "14채널 WebSocket", "68개 도구" 수치 검증할 예정 — 결과 기다림.
- **전체 Vision 품질은 높음.** A 등급 문서 기준으로 7.5 PASS. Issue #1만 D6 추가 callout으로 수정하면 8점대 가능.
