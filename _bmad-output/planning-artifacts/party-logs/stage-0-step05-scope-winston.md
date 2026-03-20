# Critic-A Review — Stage 0, Step 05: MVP Scope (GATE)

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (L367–450)
**Cross-checked:** `packages/server/src/db/schema.ts`, `packages/server/src/services/memory-extractor.ts`, `packages/server/src/services/argos-service.ts`, `v3-corthex-v2-audit.md`
**Grade:** A (7.0+ required, 3 retries max)

---

## 코드 검증 (D3 — GATE 핵심)

| Scope 주장 | 코드 실제값 | 일치 |
|-----------|-----------|------|
| `agents.personality_traits JSONB` 추가 (신규) | schema.ts L145~171 agents 테이블 — `personality_traits` 없음 | ✅ 신규 맞음 |
| `soul-renderer.ts` extraVars 확장 (기존) | Step 02 검증 — extraVars?: Record<string,string> 실존 | ✅ |
| `memoryTypeEnum`에 'reflection', 'observation' 추가 | schema.ts L28: `['learning', 'insight', 'preference', 'fact']` — 두 값 모두 없음 | ✅ 추가 필요 확인 |
| `observations` 테이블 신규 추가 | schema.ts 전체 검색 — observations 없음 | ✅ 신규 맞음 |
| `memory-extractor.ts` 크론 모드 확장 (기존) | 파일 실존. reflection/observation 코드 없음 | ✅ 확장 대상 확인 |
| `argos-service.ts` 유지 | `packages/server/src/services/argos-service.ts` 실존 | ✅ |
| WebSocket 14 → 15채널 (`/ws/office` 추가) | audit 14채널. v3 +1 = 15 | ✅ |
| `agent-loop.ts` 직접 수정 = Out of Scope (E8 경계) | Step 02 검증 — E8 경계 준수 원칙 확립 | ✅ |

**전체 8개 코드 참조 정확. 할루시네이션 없음.**

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Sprint 순서 표 ✅, Layer별 In Scope 상세 ✅, Out of Scope 경계선 명확 ✅, Go/No-Go 7개 게이트 ✅. Gap: Sprint 3 시작 선행 조건 미명시 (Tier 비용 한도 블로커가 표에 없음). |
| D2 완전성 | 8/10 | Layer 0~4 전부 커버 ✅, Out of Scope ✅, Future Vision ✅, Option B 해소 ✅. Gap: observations 테이블 데이터 흐름(input → process → output 3단계) 기술 없음. Out of Scope "대체 신규 테이블 금지"와 In Scope "observations 추가" 관계 미설명. |
| D3 정확성 | 9/10 | 8개 코드 참조 전부 검증 ✅. personality_traits 미존재·memoryTypeEnum 현재값·observations 미존재·argos-service 실존 모두 코드 직접 확인. 수치(14→15 WS) audit 일치. |
| D4 실행가능성 | 7/10 | Sprint 순서 합리적 (Layer 3 독립 → 2 독립 → 4 복잡 → 1 에셋 의존) ✅. Go/No-Go 7개 모두 binary 테스트 가능 ✅. Gap: Sprint 3 의존성 표에 "Tier 비용 한도 PRD 확정 선행 필수" 조건 없음 — 미기재 시 Sprint 3 시작 후 중간 블로킹 위험. |
| D5 일관성 | 9/10 | Option B 일관 ✅, E8 경계 ✅, Zero Regression 경계(삭제/변경 금지, 추가 허용) ✅, soul-renderer.ts extraVars ✅, argos-service.ts ✅. Sprint 순서가 Step 02 확정 구현 순서와 일치 ✅. |
| D6 리스크 | 7/10 | n8n 포트 보안 명시 ✅, Reflection 비용 블로커 ⚠️ 명시 ✅, PixiJS 에셋 선행 의존 명시 ✅. Gap: `memoryTypeEnum` ALTER TYPE은 PostgreSQL에서 트랜잭션 내 실행 불가 — 마이그레이션 특이사항 미언급. Sprint 3 마이그레이션 작성 시 개발자가 별도 처리 필요. |

### 가중 평균: **8.10/10 ✅ PASS**

- D1: 8 × 0.15 = 1.20
- D2: 8 × 0.15 = 1.20
- D3: 9 × 0.25 = 2.25
- D4: 7 × 0.20 = 1.40
- D5: 9 × 0.15 = 1.35
- D6: 7 × 0.10 = 0.70
- **합계: 8.10/10**

---

## 이슈 목록

### 🟠 Issue 1 — [D4] Sprint 3 시작 선행 조건 미명시

**위치:** L374–380 Sprint 의존성 표, L407, L441

**Winston:** "Sprint 3(Layer 4) 의존성 표에 '복잡·높음'만 있다. 그런데 L407과 L441 두 곳에서 'Tier별 Reflection LLM 비용 한도 = PRD 확정 전까지 Sprint 3 블로커'라고 직접 명시돼 있다. 이 조건이 의존성 표에 없으면 Sprint Planning에서 팀이 이를 놓치고 Sprint 3를 시작할 수 있다 — 그리고 구현 중반에 막힌다. 블로커가 Brief에 기술됐다면 Sprint 의존성 표에도 보여야 한다."

**Fix 필요:** Sprint 의존성 표 Sprint 3 행 의존성 칸을 "복잡·높음 **+ PRD Tier 비용 한도 확정 선행 필요**"로 수정.

---

### 🟡 Issue 2 — [D2] observations 테이블과 Out of Scope 간 관계 불명확

**위치:** L406 (In Scope), L421 (Out of Scope)

**Winston:** "Out of Scope에 '`agent_memories` 대체 신규 테이블 생성 = 금지'가 있고, In Scope에 '신규 `observations` 테이블 추가'가 있다. observations가 대체가 아닌 보완(raw 소스 데이터 계층)이라는 것을 현재 기술로는 PRD 작성자가 구분하기 어렵다. Layer 4 3단계 흐름(실행 → observations 기록 → 크론 처리 → agent_memories[reflection] 생성)이 없으면 누군가는 observations를 'Option A의 잔재'로 오해한다."

**Fix 필요:** L406 아래 한 줄: "observations 역할: 실행 raw 로그 INPUT 계층 → 크론 처리 → `agent_memories`[reflection] OUTPUT. 대체 아님. 3단계: 실행완료→observations→agent_memories[reflection]."

---

## Cross-talk 요약

- **Bob(SM)**: Issue 1 Sprint 3 블로커 조건 — Sprint Planning 영향. 별도 pre-Sprint 3 Gate(PRD 비용 한도 확정) 설정 권고.
- **Sally**: Layer 4 observations 역할 명확화(Issue 2) — CEO 앱에서 observations 데이터 직접 노출 여부 UX 결정에 영향.
- **공통 주의**: `memoryTypeEnum` ALTER TYPE은 PostgreSQL 트랜잭션 밖에서 실행해야 함(`BEGIN`/`COMMIT` 내 불가) — 마이그레이션 스크립트 특이 처리 필요. Brief 레벨 이슈는 아니나 PRD/Architecture에서 반드시 명시 권장.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **8.10/10 ✅ PASS** |
| **코드 검증** | 8/8 참조 정확. 할루시네이션 없음. |
| **Priority Fix 🟠** | Issue 1: Sprint 3 의존성 표에 Tier 비용 한도 선행 조건 추가 |
| **Quick Fix 🟡** | Issue 2: observations 3단계 데이터 흐름 한 줄 추가 |

Option B 채택, E8 경계, Zero Regression 경계선 모두 정확하게 구현됨. 2개 이슈 수정 후 GATE 통과 권장.
