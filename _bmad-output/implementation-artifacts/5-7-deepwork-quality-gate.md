# Story 5.7: 자율 딥워크 + 품질 게이트

Status: done

## Story

As a 에이전트,
I want 1번 답하는 게 아니라 다단계 자율 작업 후 보고하는 것을,
so that v1의 심층 분석 품질이 유지된다.

## Acceptance Criteria

1. Soul에 자율 딥워크 패턴 주입: 계획→수집→분석→초안→최종 (AC: #1)
2. 품질 게이트: 비서실장이 편집장 역할 — 5항목 QA (v1 spec #19) (AC: #2)
3. 결론/근거/리스크/형식/논리 점검 → 미달 시 재작업 지시 (AC: #3)
4. 재작업 = call_agent로 동일 에이전트 재호출 (message에 피드백 포함) (AC: #4)

## Current State Analysis — CRITICAL

### 비서 Soul 템플릿: ALREADY HAS QA 5항목 ✅ (BUT 딥워크 패턴 미포함)
- `packages/server/src/lib/soul-templates.ts` (SECRETARY_SOUL_TEMPLATE)
- 4단계 품질 검수: 결론/근거/리스크/형식/논리 5항목 이미 작성 (line 120-128)
- "미달 항목이 있으면 해당 에이전트에게 call_agent로 재작업을 요청하세요" (line 128)
- **부족한 점**: 재작업 시 구체적 피드백 포맷이 없음, 재작업 횟수 제한 없음

### 매니저 Soul 템플릿: 딥워크 일부 있으나 불완전
- `packages/server/src/lib/soul-templates.ts` (MANAGER_SOUL_TEMPLATE)
- 3단계 있음: 독자 분석 → 전문가 위임 → 결과 종합
- **부족한 점**: v1 5단계 딥워크 패턴(계획→수집→분석→초안→최종) 미반영

### agent-loop.ts: runAgent + collectAgentResponse 존재 ✅
- `packages/server/src/engine/agent-loop.ts`
- `runAgent()`: SSE 스트리밍 실행 (line 14)
- `collectAgentResponse()`: fire-and-collect 동기 실행 (line 95) — 재작업에 활용
- SDK `query()` 래퍼, maxTurns=10으로 다단계 자율 작업 이미 지원

### call_agent: 파일 미존재 — SDK 내장 도구로 동작
- `packages/server/src/engine/` 디렉토리에 call-agent.ts 없음
- call_agent는 Claude SDK의 `permissionMode: 'bypassPermissions'`로 자동 노출되는 내장 도구
- Soul에서 "call_agent 도구를 사용하여 위임하세요" 지시 → SDK가 자동 처리

### 품질 게이트 Hook: 미구현 ❌
- Hook 파이프라인: `packages/server/src/engine/hooks/` (5개 Hook 존재)
- 품질 게이트는 Hook이 아닌 **Soul 기반 자율 판단**으로 구현 (비서 Soul 4단계)
- 재작업 트리거는 비서 Soul이 call_agent로 동일 에이전트를 재호출하는 방식

## Tasks / Subtasks

- [x] Task 1: 비서 Soul 템플릿에 딥워크 + 품질 게이트 강화 (AC: #1, #2, #3, #4)
  - [x] 1.1 SECRETARY_SOUL_TEMPLATE에 "딥워크 위임 지시" 섹션 추가
    - 비서가 에이전트에게 위임할 때 딥워크 5단계 수행을 지시하는 문구
    - "계획 수립 → 데이터 수집(도구 사용) → 분석 → 초안 작성 → 최종 보고서 생성"
  - [x] 1.2 품질 검수(4단계) 강화: 재작업 피드백 포맷 명시
    - 재작업 요청 시 `[재작업 요청] 미달 항목: X, 구체적 개선사항: Y` 포맷
    - 최대 재작업 2회 제한 (3회째는 현재 결과 + 미달 사항 CEO에게 보고)
  - [x] 1.3 품질 점수 기준 명시: 5항목 중 4항목 이상 충족 = PASS

- [x] Task 2: 매니저 Soul 템플릿에 딥워크 5단계 패턴 적용 (AC: #1)
  - [x] 2.1 MANAGER_SOUL_TEMPLATE의 "1단계: 독자 분석" → "1단계: 계획 수립 + 데이터 수집"
  - [x] 2.2 5단계 구조로 확장: 계획→수집→분석→초안→최종
  - [x] 2.3 각 단계에서 도구 사용을 명시적으로 지시

- [x] Task 3: 딥워크 Soul 스니펫 (재사용 가능한 Soul 패턴) (AC: #1)
  - [x] 3.1 `DEEPWORK_SOUL_SNIPPET` 상수 작성 (~500자)
    - 5단계 딥워크 패턴을 독립 스니펫으로 추출
    - 어떤 에이전트 Soul에든 삽입 가능한 범용 형태
  - [x] 3.2 `QUALITY_GATE_SNIPPET` 상수 작성 (~400자)
    - 5항목 QA 체크리스트 (결론/근거/리스크/형식/논리)
    - PASS/FAIL 판정 기준 + 재작업 요청 포맷
  - [x] 3.3 soul-templates.ts에서 export

- [x] Task 4: 테스트 (AC: #1, #2, #3, #4)
  - [x] 4.1 SECRETARY_SOUL_TEMPLATE에 딥워크 키워드 포함 검증
  - [x] 4.2 SECRETARY_SOUL_TEMPLATE에 재작업 피드백 포맷 포함 검증
  - [x] 4.3 MANAGER_SOUL_TEMPLATE에 5단계 딥워크 포함 검증
  - [x] 4.4 DEEPWORK_SOUL_SNIPPET 존재 및 5단계 키워드 검증
  - [x] 4.5 QUALITY_GATE_SNIPPET 존재 및 5항목 검증
  - [x] 4.6 soul-renderer.ts로 렌더링 시 딥워크/품질게이트 텍스트 유지 검증

## Dev Notes

### 핵심 설계: Soul 기반 자율 판단

이 스토리의 구현은 **코드 로직이 아닌 Soul 텍스트** 수정이 핵심이다.

v1에서는 `quality_rules.yaml` + 하드코딩 체크 로직이었으나, v2에서는:
- **딥워크 = Soul에 5단계 패턴을 명시** → 에이전트가 자율적으로 계획→수집→분석→초안→최종 수행
- **품질 게이트 = 비서 Soul에 편집장 역할 명시** → 비서가 결과를 검수하고 미달 시 call_agent로 재작업 요청
- SDK의 maxTurns=10이 다단계 자율 작업을 기술적으로 지원 (agent-loop.ts line 48)

### 구현 방법: soul-templates.ts 수정

```typescript
// 1. 딥워크 스니펫 (재사용 가능)
export const DEEPWORK_SOUL_SNIPPET = `## 자율 딥워크 프로토콜

모든 분석 작업은 반드시 아래 5단계를 순서대로 수행하세요.
1단계를 건너뛰고 바로 답하는 것은 금지합니다.

### 1단계: 계획 수립
- 작업 목표를 명확히 정의하세요.
- 필요한 데이터와 도구를 사전에 파악하세요.
- 분석 방법론을 결정하세요.

### 2단계: 데이터 수집
- 관련 도구를 사용하여 실시간 데이터를 수집하세요.
- 최소 2개 이상의 도구를 사용하여 다각도로 데이터를 확보하세요.
- 수집 결과를 정리하세요.

### 3단계: 분석
- 수집한 데이터를 체계적으로 분석하세요.
- 패턴, 추세, 이상치를 식별하세요.
- 복수의 관점에서 해석하세요.

### 4단계: 초안 작성
- 분석 결과를 보고서 형식으로 정리하세요.
- 결론, 근거, 리스크를 구분하여 작성하세요.

### 5단계: 최종 보고서
- 초안을 재검토하고 완성도를 높이세요.
- 결론이 근거와 일치하는지 확인하세요.
- CEO가 별도 배경지식 없이 이해할 수 있는지 점검하세요.
`

// 2. 품질 게이트 스니펫 (비서용)
export const QUALITY_GATE_SNIPPET = `## 품질 게이트 (편집장 역할)

에이전트의 결과물을 CEO에게 전달하기 전, 반드시 아래 5항목을 검수하세요.

### 검수 체크리스트
1. **결론**: 핵심 결론이 명확하고 구체적인가? (추상적 결론 불가)
2. **근거**: 데이터와 출처가 충분한가? 도구 사용 없이 추측만 하지 않았는가?
3. **리스크**: 잠재적 위험 요소와 한계점을 명시했는가?
4. **형식**: 보고서 형식(결론/분석/리스크/추천)을 지켰는가?
5. **논리**: 결론과 근거 사이에 논리적 비약이 없는가?

### 판정 기준
- **PASS**: 5항목 중 4항목 이상 충족 → CEO에게 최종 보고
- **FAIL**: 3항목 이하 충족 → 재작업 요청

### 재작업 요청 방법
call_agent로 동일 에이전트를 재호출하되, 메시지에 아래 포맷을 사용하세요:
"[재작업 요청] 미달 항목: (항목명). 개선사항: (구체적 지시). 이전 결과를 기반으로 보완하세요."

### 재작업 제한
- 최대 2회 재작업 허용. 3번째 시도에도 미달이면 현재 결과 + 미달 사항을 CEO에게 솔직하게 보고하세요.
`
```

### SECRETARY_SOUL_TEMPLATE 수정 방향

기존 4단계 구조를 유지하되:
- **2단계 에이전트 위임**: 위임 메시지에 "딥워크 5단계를 수행하여 답변하세요" 지시 추가
- **4단계 품질 검수**: 기존 5항목 유지 + PASS/FAIL 판정 + 재작업 피드백 포맷 + 2회 제한 추가

변경 최소화: 기존 Soul 구조를 깨지 않고, 딥워크 위임 지시와 품질 게이트 강화만 삽입.

### MANAGER_SOUL_TEMPLATE 수정 방향

기존 3단계 → 5단계 확장:
- 1단계: 계획 수립 (기존 "독자 분석"에 계획 단계 추가)
- 2단계: 데이터 수집 (도구 사용 강화)
- 3단계: 분석 (기존 "독자 분석" 내용 이동)
- 4단계: 전문가 위임 + 종합 (기존 2~3단계 통합)
- 5단계: 최종 보고서 (4섹션 보고서 형식 유지)

### Architecture Compliance

| 패턴 | 적용 |
|------|------|
| E4 Soul 변수 | soul-renderer.ts 기존 6개 변수 유지 (신규 변수 불필요) |
| E8 import 제한 | soul-templates.ts는 lib/ 내 순수 상수 — engine/ import 없음 |
| E5 SSE 이벤트 | 변경 없음 (6개 이벤트 유지) |
| D6 단일 진입점 | 변경 없음 (재작업도 Soul이 call_agent로 agent-loop.ts 경유) |
| 파일명 | kebab-case (기존 soul-templates.ts 유지) |

### 기존 파일 목록 (수정 대상)

| 파일 | 변경 내용 |
|------|----------|
| `packages/server/src/lib/soul-templates.ts` | SECRETARY/MANAGER Soul 수정 + DEEPWORK/QUALITY_GATE 스니펫 추가 |
| `packages/server/src/__tests__/unit/soul-templates.test.ts` | 딥워크/품질게이트 키워드 검증 테스트 추가 |

### Anti-Patterns (하지 말 것)

- ❌ quality_rules.yaml 파일 생성 (v2에서는 Soul 기반, yaml 파일 불필요)
- ❌ 품질 게이트 Hook 추가 (engine/hooks/에 새 Hook 생성 금지 — Soul 자율 판단)
- ❌ agent-loop.ts 수정 (maxTurns, 재시도 로직 등 추가 금지 — 현행 유지)
- ❌ hub.ts 수정 (딥워크/품질게이트는 Soul 레이어, 라우팅 레이어 무관)
- ❌ 새로운 SSE 이벤트 타입 추가 (E5 — 6개만)
- ❌ engine/ 내부 파일 직접 import (E8 — agent-loop.ts + types.ts만)
- ❌ Soul 텍스트에 {{새로운_변수}} 추가 (E4 — 기존 6개 변수만)
- ❌ Soul 텍스트 2,500자 초과 (토큰 효율성 — 비서 ~2,000자, 매니저 ~1,500자 유지)

### Project Structure Notes

- soul-templates.ts: `packages/server/src/lib/soul-templates.ts` — Soul 상수 정의 (engine/ 외부)
- soul-renderer.ts: `packages/server/src/engine/soul-renderer.ts` — {{변수}} 치환 (6개 변수)
- agent-loop.ts: `packages/server/src/engine/agent-loop.ts` — SDK query() 래퍼 (maxTurns=10)
- 테스트: `packages/server/src/__tests__/unit/soul-templates.test.ts` — 기존 테스트 파일 확장

### Previous Story Intelligence (5.6 — @멘션 + 프리셋)

- presets.ts → getDB 마이그레이션 완료 (E3 패턴 준수)
- hub.ts에 프리셋 단축어 감지 로직 추가됨 (~10줄)
- scoped-query.ts에 7개 preset 메서드 추가
- tsc --noEmit PASS, 27개 신규 테스트 PASS
- **핵심 교훈**: 기존 구현이 있으면 검증 + 확장만 (재구현 금지)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.7]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#2.4 자율 딥워크]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#19. 품질 관리 (Quality Gate)]
- [Source: packages/server/src/lib/soul-templates.ts#SECRETARY_SOUL_TEMPLATE line 119-128]
- [Source: packages/server/src/lib/soul-templates.ts#MANAGER_SOUL_TEMPLATE]
- [Source: packages/server/src/engine/agent-loop.ts#runAgent + collectAgentResponse]
- [Source: packages/server/src/engine/types.ts#RunAgentOptions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- SECRETARY_SOUL_TEMPLATE 강화: 2단계에 딥워크 5단계 위임 지시 추가, 4단계에 PASS/FAIL 판정(4/5 이상), 재작업 피드백 포맷(`[재작업 요청]`), 최대 2회 재작업 제한, 3회째 솔직 보고 추가
- MANAGER_SOUL_TEMPLATE 확장: 기존 3단계 → 5단계 딥워크(계획→수집→분석→초안→최종), "5번째 분석가" 패턴 유지, 부하에게도 딥워크 수행 지시
- DEEPWORK_SOUL_SNIPPET: 범용 5단계 딥워크 프로토콜 (~600자), {{variable}} 미사용 (순수 텍스트)
- QUALITY_GATE_SNIPPET: 5항목 QA + PASS/FAIL + 재작업 포맷 + 2회 제한 (~700자)
- BUILTIN_SOUL_TEMPLATES description 업데이트: 딥워크/품질게이트 반영
- 50개 테스트 전부 PASS (기존 27개 soul-renderer 테스트도 PASS)
- tsc --noEmit PASS — 타입 에러 없음
- 기존 코드 회귀 없음: hub.ts, agent-loop.ts, soul-renderer.ts 미수정

### File List

- `packages/server/src/lib/soul-templates.ts` — DEEPWORK_SOUL_SNIPPET, QUALITY_GATE_SNIPPET 추가 + MANAGER/SECRETARY Soul 딥워크+품질게이트 강화
- `packages/server/src/__tests__/unit/soul-templates.test.ts` — 50개 테스트 (딥워크 5단계, 품질 게이트 5항목, PASS/FAIL, 재작업 포맷, 스니펫 검증)
