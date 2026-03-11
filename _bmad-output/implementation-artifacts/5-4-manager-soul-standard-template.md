# Story 5.4: 매니저 Soul 표준 템플릿

Status: done

## Story

As a 매니저 에이전트,
I want 부하 전문가들에게 작업을 배분하고 결과를 종합하는 Soul을,
so that v1의 팀장 역할(독자 분석 + 위임 + 종합)이 동작한다.

## Acceptance Criteria

1. 매니저 Soul 표준 템플릿 작성 (~1,500자 마크다운)
2. `{{subordinate_list}}` 변수로 부하 에이전트 자동 주입
3. `{{tool_list}}` 변수로 사용 가능 도구 주입
4. 작업 분해 → 배분 → 종합 지시 패턴
5. CEO 아이디어 #007: "처장 = 5번째 분석가" → 매니저도 독자 분석 후 종합
6. 부서별 표준 보고서 형식 (CEO 아이디어 #011) — 4섹션 형식: 결론/분석/리스크/추천
7. `soul_templates` 테이블에 builtin 매니저 템플릿으로 시드
8. 기존 `soul-renderer.ts`의 `{{변수}}` 치환과 호환

## Tasks / Subtasks

- [x] Task 1: 매니저 Soul 표준 템플릿 마크다운 작성 (AC: #1, #2, #3, #4, #5, #6)
  - [x] 1.1 role identity 섹션 (매니저 역할 정의)
  - [x] 1.2 {{subordinate_list}} / {{tool_list}} 변수 삽입
  - [x] 1.3 5번째 분석가 패턴 지시 (독자 분석 + 도구 사용)
  - [x] 1.4 위임 패턴: call_agent 도구로 부하에게 작업 배분 지시
  - [x] 1.5 종합 패턴: 4섹션 보고서 형식 (결론/분석/리스크/추천)
- [x] Task 2: 상수/시드 파일에 템플릿 저장 (AC: #7)
  - [x] 2.1 `packages/server/src/lib/soul-templates.ts` 상수 파일 생성
  - [x] 2.2 MANAGER_SOUL_TEMPLATE 상수 export
  - [x] 2.3 BUILTIN_SOUL_TEMPLATES 시드 데이터 배열 추가
- [x] Task 3: tsc + 기존 테스트 통과 확인 (AC: #8)
  - [x] 3.1 `npx tsc --noEmit` — 0 errors from new files (presets.ts errors are pre-existing from 5.6)
  - [x] 3.2 `bun test` — 15/15 soul-templates tests pass

## Dev Notes

### v1 Manager Delegation Pattern (반드시 참고)

v1에서 매니저(팀장)의 핵심 동작 (`services/manager-delegate.ts`, `services/manager-synthesis.ts`):

**1. 독자 분석 (CEO #007: Manager = 5th Analyst)**
```typescript
// v1: manager-delegate.ts:102-104
"당신은 {manager.name}입니다. 전문가들과 별개로 독자적 분석을 수행하세요.
반드시 도구(API)를 사용하여 실시간 데이터를 직접 조회하고 분석하세요.
전문가 결과는 무시하세요 — 당신만의 독립적 관점을 제시하세요."
```
- `maxToolIterations: 5` (도구 사용 가능)
- 전문가와 **동시 병렬 실행** (`Promise.allSettled`)

**2. 전문가 배분**
- 같은 부서, tier='specialist', isActive=true인 에이전트에게 위임
- 각 전문가에게 원본 명령 + 매니저 분석 요약(2000자 제한) 전달
- "독립적 관점으로 분석하세요" 지시

**3. 종합 보고서 (CEO #011: 부서별 표준 보고서)**
```
v1의 4섹션 보고서 형식 (manager-synthesis.ts:47-71):
### 결론 — 핵심 결론을 명확하고 간결하게
### 분석 — 상세 분석, 전문가 관점 통합, 공통점과 차이점
### 리스크 — 잠재적 위험 요소, 한계점, 불확실성
### 추천 — 다음 단계 행동을 구체적으로
```
- 종합 시 도구 사용 없음 (`maxToolIterations: 0`) — 결과 취합만
- 전문가 없으면 매니저 혼자 처리 (솔로 모드)

**4. v1→v2 핵심 전환**
- v1: `manager-delegate.ts` 하드코딩 로직 → v2: **Soul 템플릿 + call_agent MCP 도구**
- v1의 `Promise.allSettled()` 병렬 위임 → v2: Soul에 "call_agent로 부하에게 위임하라" 지시
- v1의 종합 프롬프트 → v2: Soul에 4섹션 보고서 형식 내장

### Soul 템플릿 구현 방향

**핵심 원칙:**
- Soul = 에이전트의 "성격 + 작업 방법론". agent-loop.ts가 `systemPrompt`로 주입
- `soul-renderer.ts`가 `{{변수명}}` 치환 수행 (E4 패턴)
- 매니저 Soul은 call_agent 도구를 통해 부하에게 위임하는 방법을 알려줌
- ~1,500자로 작성 (너무 길면 토큰 낭비, 너무 짧으면 행동 미지시)

**템플릿 변수 (soul-renderer.ts에서 이미 지원):**
| 변수 | 치환 데이터 | 예시 |
|------|-----------|------|
| `{{subordinate_list}}` | `scopedDb.agentsByReportTo(agentId)` → `이름(역할)` 목록 | `투자전문가(specialist), 리서치전문가(specialist)` |
| `{{tool_list}}` | `scopedDb.agentToolsWithDefs(agentId)` → `이름: 설명` 목록 | `kr_stock: 한국 주식 조회, web_search: 웹 검색` |
| `{{department_name}}` | 소속 부서 이름 | `투자분석부` |
| `{{owner_name}}` | 상위 인간 직원 이름 | `홍길동` |
| `{{specialty}}` | agent.role 값 | `투자분석팀장` |

**call_agent 도구 (이미 구현됨 — Story 2.6):**
- `packages/server/src/tool-handlers/builtins/call-agent.ts`
- 입력: `{ agentName: string, message: string }`
- SessionContext spread 복사 + depth+1 + visitedAgents 추가
- Phase 1: 순차 실행 (E7)

### 저장 위치 결정

**상수 파일: `packages/server/src/engine/soul-templates.ts`**
- engine 내부 파일 (E8: engine/ 공개 API는 agent-loop.ts + types.ts만)
- 하지만 시드 스크립트에서 import 필요 → `engine/` 외부 접근 예외 허용
- 또는 `packages/server/src/lib/soul-templates.ts`에 두어 engine 외부에서도 접근 가능하게

**DB 시드: `soul_templates` 테이블**
- `isBuiltin: true`, `tier: 'manager'`, `companyId: null` (플랫폼 내장)
- 관리자가 이 템플릿을 복제해서 부서별 커스터마이징 가능 (Phase 2 후반)

### 참고할 기존 코드

| 파일 | 관련도 | 참고 내용 |
|------|--------|----------|
| `engine/soul-renderer.ts` | 필수 | 6개 변수 치환 로직, {{변수}} 패턴 |
| `engine/agent-loop.ts` | 필수 | `systemPrompt: soul`로 Soul 주입 방식 |
| `engine/types.ts` | 필수 | RunAgentOptions.soul 타입 |
| `tool-handlers/builtins/call-agent.ts` | 필수 | 핸드오프 도구 구조 (agentName, message 입력) |
| `db/schema.ts:816` | 참고 | soul_templates 테이블 스키마 |
| `db/schema.ts:144` | 참고 | agents.soul 필드 |
| `services/manager-delegate.ts` | v1 참고 | 독자 분석 + 병렬 위임 패턴 |
| `services/manager-synthesis.ts` | v1 참고 | 4섹션 보고서 형식 |

### 예상 Soul 템플릿 구조

```markdown
# {{specialty}} — {{department_name}}

## 역할
당신은 {{department_name}}의 매니저입니다. ...

## 팀 구성
### 부하 에이전트
{{subordinate_list}}

### 사용 가능 도구
{{tool_list}}

## 작업 방법론
### 1단계: 독자 분석 (5번째 분석가)
...도구를 사용하여 직접 분석...

### 2단계: 전문가 위임
...call_agent 도구로 부하에게 작업 배분...

### 3단계: 결과 종합
...4섹션 보고서 형식...

## 보고서 형식
### 결론
### 분석
### 리스크
### 추천
```

### Anti-Patterns (하지 말 것)

- Soul에 사용자 입력 직접 삽입 금지 (prompt injection — E4)
- Soul에 CLI 토큰 정보 포함 금지 (SEC-6)
- engine/ 내부 파일을 shared/ re-export 금지 (P1)
- `{{변수명}}` 이중 중괄호 외 다른 치환 문법 사용 금지
- Soul을 5,000자 이상으로 작성하지 말 것 (토큰 효율)

### Project Structure Notes

- 신규 파일: `packages/server/src/lib/soul-templates.ts` (상수 + export)
- DB 시드: 기존 시드 파일에 soul_templates INSERT 추가
- engine/ 경계: soul-templates.ts는 `lib/`에 두어 engine 외부에서도 접근 가능
- engine/ 내부 수정 없음 (soul-renderer.ts 변경 불필요 — 이미 {{변수}} 치환 지원)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#E4 Soul 템플릿 변수 규칙]
- [Source: _bmad-output/planning-artifacts/architecture.md#Code Disposition Matrix]
- [Source: packages/server/src/engine/soul-renderer.ts — 전체]
- [Source: packages/server/src/engine/agent-loop.ts:44-45 — systemPrompt 주입]
- [Source: packages/server/src/db/schema.ts:815-836 — soul_templates 테이블]
- [Source: packages/server/src/services/manager-delegate.ts — v1 독자 분석 + 위임]
- [Source: packages/server/src/services/manager-synthesis.ts — v1 4섹션 보고서]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#1.2 명령 처리 흐름]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- MANAGER_SOUL_TEMPLATE: ~1,000 chars Korean markdown with 3-step methodology (독자분석→위임→종합)
- All 5 soul-renderer variables used: {{specialty}}, {{department_name}}, {{owner_name}}, {{subordinate_list}}, {{tool_list}}
- CEO idea #007 (5th analyst): Step 1 instructs manager to do own tool-based analysis before delegation
- CEO idea #011 (dept report format): 4-section report (결론/분석/리스크/추천) from v1 manager-synthesis.ts
- call_agent delegation: Step 2 instructs using call_agent tool for subordinate dispatch
- Solo mode: Template handles no-subordinate case ("혼자 처리")
- BUILTIN_SOUL_TEMPLATES seed data array for soul_templates table (isBuiltin=true, tier=manager)
- 15 unit tests covering all ACs: variable presence, report format, delegation flow, metadata
- tsc: 0 errors from new files

### File List

- NEW: `packages/server/src/lib/soul-templates.ts` — MANAGER_SOUL_TEMPLATE constant + BUILTIN_SOUL_TEMPLATES seed data
- NEW: `packages/server/src/__tests__/unit/soul-templates.test.ts` — 15 unit tests
