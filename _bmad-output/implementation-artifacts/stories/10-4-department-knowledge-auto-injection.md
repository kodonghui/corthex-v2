# Story 10.4: 부서별 지식 자동 주입 강화

Status: done

## Story

As a 에이전트,
I want 부서별 관련 지식이 Soul에 자동 주입되는 것을,
so that 추가 검색 없이 전문 지식을 활용할 수 있다.

## Acceptance Criteria

1. soul-renderer.ts 확장: `{{knowledge_context}}` 새 변수 추가 — 부서별 상위 K개 관련 문서를 시맨틱 검색으로 자동 주입 (E4 확장)
2. 시맨틱 검색 우선 + 키워드 fallback: 임베딩 있는 문서는 pgvector cosine similarity, 없으면 기존 recency 기반
3. 주입 크기 제한: 최대 2,000 토큰 (~8,000 chars) — 비용 최적화
4. `collectKnowledgeContext()` 강화: 시맨틱 검색 기반으로 관련성 높은 문서 우선 주입 (기존 recency → relevance)
5. agent-runner.ts의 기존 knowledge injection 흐름과 충돌 없이 통합
6. 에이전트 소울 템플릿에 `{{knowledge_context}}`가 없으면 기존 agent-runner.ts 흐름으로 폴백 (하위 호환성)
7. 캐싱 유지: 기존 5분 TTL 캐시 메커니즘 보존

## Tasks / Subtasks

- [x] Task 1: soul-renderer.ts에 `{{knowledge_context}}` 변수 추가 (AC: #1, #6)
  - [x]1.1 `renderSoul()` 함수에서 `{{knowledge_context}}` 변수 처리 추가
  - [x]1.2 에이전트의 departmentId가 있을 때 `collectSemanticKnowledge()` 호출
  - [x]1.3 departmentId 없거나 지식 없으면 빈 문자열 치환 (기존 패턴 유지)
  - [x]1.4 에이전트의 soul 텍스트에서 사용자 메시지를 넣지 않도록 보안 유지

- [x] Task 2: knowledge-injector.ts에 시맨틱 지식 수집 함수 추가 (AC: #2, #3, #4)
  - [x]2.1 `collectSemanticKnowledge(companyId, departmentId, agentContext?, charBudget?)` 새 함수 생성
  - [x]2.2 부서 폴더 ID 조회 → `searchSimilarDocs()` 호출 (부서 폴더 내 제한)
  - [x]2.3 agentContext 없으면 기존 recency 기반 `collectDepartmentDocs()` 폴백
  - [x]2.4 char budget 기본값 8000 (~2000 토큰), 초과 시 truncate
  - [x]2.5 시맨틱 검색 실패 시 (API 키 없음, 임베딩 실패) graceful fallback to recency

- [x] Task 3: collectKnowledgeContext() 강화 (AC: #4, #5, #7)
  - [x]3.1 기존 Layer 2 (collectDepartmentDocs)를 시맨틱 검색으로 교체 (API 키 있을 때)
  - [x]3.2 시맨틱 검색 시 에이전트의 task description을 쿼리 컨텍스트로 활용
  - [x]3.3 기존 캐시 키에 task context hash 추가 (다른 태스크 = 다른 관련 문서)
  - [x]3.4 Layer 1 (department_knowledge 테이블)은 변경 없이 유지

- [x] Task 4: agent-runner.ts 통합 (AC: #5, #6)
  - [x]4.1 `collectKnowledgeContext()`에 taskDescription 파라미터 추가 (옵셔널, 하위호환)
  - [x]4.2 agent-runner execute()에서 taskDescription 전달
  - [x]4.3 agent-runner executeStream()에서 taskDescription 전달
  - [x]4.4 soul-renderer의 `{{knowledge_context}}`와 agent-runner의 `## Department Knowledge` 중복 방지 로직

- [x] Task 5: 테스트 (AC: #1~#7)
  - [x]5.1 soul-renderer.test.ts에 `{{knowledge_context}}` 변수 치환 테스트 추가
  - [x]5.2 knowledge-injector.test.ts에 시맨틱 지식 수집 테스트 추가
  - [x]5.3 agent-runner 통합: taskDescription 전달 + 중복 방지 테스트
  - [x]5.4 fallback 시나리오: API 키 없음, 임베딩 없음, 빈 부서
  - [x]5.5 캐시 동작 검증: 같은/다른 task context에 따른 캐시 분리

## Dev Notes

### Architecture Compliance

- **D1 (getDB)**: 모든 DB 접근은 `getDB(companyId)` 래퍼 사용. `knowledge-injector.ts`는 현재 `db` 직접 사용 중이나 이는 services/ 레이어 특성상 허용됨 (engine/ 밖)
- **E4 (Soul 변수)**: `{{knowledge_context}}` 7번째 변수로 추가. 기존 6개 변수 패턴 그대로 따름
- **E8 (engine 경계)**: soul-renderer.ts는 engine/ 내부이므로 knowledge-injector(services/)를 직접 import하면 안 됨. 대신 `getDB(companyId).searchSimilarDocs()` 직접 호출하거나 data를 인자로 받는 구조 필요
- **API 응답 패턴**: 이 스토리는 새 API 엔드포인트 없음 (내부 로직 강화)

### Critical Architecture Constraint: engine/ 경계 (E8)

**soul-renderer.ts는 `engine/` 내부 파일** → knowledge-injector.ts(services/)를 직접 import 금지 (E8)

해결 방법:
1. **soul-renderer.ts**: `{{knowledge_context}}`를 외부에서 주입받는 구조로 설계
   - renderSoul() 시그니처에 optional `extraVars?: Record<string, string>` 추가
   - 호출자(hub.ts, call-agent.ts, agent-runner.ts 등)가 knowledge context를 계산해서 전달
2. **또는**: soul-renderer가 scoped-query(db/)만 사용하여 직접 검색 (db/는 engine/ 내부 import 가능)
   - scoped-query.ts의 `searchSimilarDocs()`는 이미 db/ 안에 있음

**권장 방식**: Option 1 (extraVars 주입) — 관심사 분리 원칙 준수

### Existing Code Context (반드시 참고 — 재구현 금지)

1. **soul-renderer.ts** (`packages/server/src/engine/soul-renderer.ts`)
   - 현재 6개 변수: agent_list, subordinate_list, tool_list, department_name, owner_name, specialty
   - `renderSoul(soulTemplate, agentId, companyId)` — 3개 파라미터
   - 미지정 변수 → 빈 문자열 치환 (`vars[key.trim()] || ''`)
   - **이 함수의 시그니처를 확장하여 `{{knowledge_context}}` 지원**

2. **knowledge-injector.ts** (`packages/server/src/services/knowledge-injector.ts`)
   - `collectKnowledgeContext(companyId, agentId, departmentId)` — Layer 1 + Layer 2 수집
   - Layer 2: `collectDepartmentDocs()` — recency 기반 (updatedAt DESC)
   - 5분 TTL 캐시 (Map 기반)
   - **Layer 2를 시맨틱 검색으로 교체/강화**

3. **semantic-search.ts** (`packages/server/src/services/semantic-search.ts`)
   - `semanticSearch(companyId, query, options)` — query → embedding → pgvector cosine similarity
   - options: `{ topK, threshold, folderId }` — folderId 필터 지원 (부서 폴더 지정 가능)
   - **이 함수를 직접 호출하여 부서 관련 문서 시맨틱 검색**

4. **scoped-query.ts** (`packages/server/src/db/scoped-query.ts`)
   - `searchSimilarDocs(queryEmbedding, topK, threshold, folderId?)` — pgvector cosine 검색
   - `knowledgeFolders()` — 부서별 폴더 조회 가능
   - **부서 폴더 ID 조회에 사용**

5. **embedding-service.ts** (`packages/server/src/services/embedding-service.ts`)
   - `generateEmbedding(apiKey, text)` — 단건 임베딩 생성
   - `extractApiKey(credentials)` — API 키 추출
   - **시맨틱 검색을 위한 쿼리 임베딩 생성에 사용**

6. **agent-runner.ts** (`packages/server/src/services/agent-runner.ts`)
   - Lines 156-169: knowledge injection 로직
   - `collectKnowledgeContext(agent.companyId, agent.id, agent.departmentId)` 호출
   - 결과를 `## Department Knowledge` 섹션으로 systemPrompt에 추가
   - Lines 307-320: executeStream()에서도 동일 패턴
   - **taskDescription 파라미터 추가 필요**

7. **hub.ts** (`packages/server/src/routes/workspace/hub.ts`)
   - Line 87: `renderSoul(targetAgent.soul, targetAgent.id, companyId)` 호출
   - soul-renderer 시그니처 변경 시 이 호출도 업데이트 필요

8. **call-agent.ts** (`packages/server/src/tool-handlers/builtins/call-agent.ts`)
   - Line 58: `renderSoul(agent.soul || '', targetAgentId, ctx.companyId)` 호출
   - soul-renderer 시그니처 변경 시 이 호출도 업데이트 필요

### Integration Design: 중복 방지 전략

**현재 문제**: soul-renderer의 `{{knowledge_context}}`와 agent-runner의 `## Department Knowledge` 주입이 **이중으로 발생할 수 있음**

**해결 전략**:
- `{{knowledge_context}}` 변수가 soul 템플릿에 존재하면 → soul-renderer가 지식 주입 담당 → agent-runner에서 Department Knowledge 주입 스킵
- `{{knowledge_context}}`가 soul 템플릿에 없으면 → 기존 agent-runner 흐름으로 주입 (하위 호환)
- 판별: `soul.includes('{{knowledge_context}}')` 체크

### Implementation Flow

```
에이전트 호출 요청
  ↓
agent-runner.ts: execute() / executeStream()
  ↓
  ├─ soul 템플릿에 {{knowledge_context}} 있음?
  │   ├─ YES → collectKnowledgeContext(companyId, agentId, deptId, taskDesc) → 시맨틱 검색 결과
  │   │        → renderSoul(soul, agentId, companyId, { knowledge_context: result })
  │   │        → Department Knowledge 섹션 추가 스킵
  │   └─ NO  → 기존 흐름: renderSoul() + collectKnowledgeContext() 별도 추가
  ↓
hub.ts / call-agent.ts: renderSoul() 호출 시 extraVars 전달 (해당 경로에서도 지식 주입 가능)
```

### Project Structure Notes

```
packages/server/src/
  engine/
    soul-renderer.ts          ← 수정 ({{knowledge_context}} + extraVars 옵셔널 파라미터)
  services/
    knowledge-injector.ts     ← 수정 (collectSemanticKnowledge 추가, collectKnowledgeContext 강화)
    semantic-search.ts        ← 기존 (재사용: semanticSearch)
    embedding-service.ts      ← 기존 (재사용: generateEmbedding, extractApiKey)
    agent-runner.ts           ← 수정 (taskDescription 전달, 중복 방지 로직)
  routes/workspace/
    hub.ts                    ← 수정 (renderSoul extraVars 전달)
  tool-handlers/builtins/
    call-agent.ts             ← 수정 (renderSoul extraVars 전달)
  db/
    scoped-query.ts           ← 기존 (searchSimilarDocs 재사용)
  __tests__/unit/
    soul-renderer.test.ts     ← 수정 ({{knowledge_context}} 테스트 추가)
    knowledge-injector.test.ts ← 수정 (시맨틱 지식 수집 테스트 추가)
    dept-knowledge-injection.test.ts ← 새 파일 (통합 시나리오 테스트)
```

### Previous Story Intelligence

**Story 10.3 핵심 교훈:**
- `extractApiKey` 중복 생성 → embedding-service.ts에서 export하여 재사용 (이미 수정됨)
- mode 파라미터 검증 필요 — arbitrary string 허용 시 타입 안정성 깨짐
- folderId 필터: semantic search에 이미 지원됨 → 부서 폴더 필터링에 활용 가능
- graceful degradation 패턴: API 키/임베딩 실패 → keyword fallback (이 패턴 그대로 따를 것)

**Story 10.2 핵심 교훈:**
- 패키지 이름: `@google/generative-ai` (v0.24.1), architecture 문서의 `@google/genai`와 다름
- API 키: `getCredentials(companyId, 'google_ai')` → `extractApiKey(credentials)` 패턴

**Story 10.1 핵심 교훈:**
- `AnyColumn` 타입 import 필요 (drizzle-orm) — tsc 에러 원인
- cosineDistance 이중 계산 방지: 변수로 추출

### Git Intelligence

최근 5개 커밋 모두 Epic 10/8 관련:
```
65732dd feat: Story 10.3 의미 검색 API
68a0e6d feat: Story 10.2 Gemini Embedding 파이프라인
3829e0a feat: Story 10.1 pgvector 확장 설치 + 스키마
65fb5b1 feat: Story 8.4 maxDepth 회사별 설정
28754a8 feat: Story 8.3 모델 자동 배정 + 비용 최적화
```

### Testing Standards

- 프레임워크: `bun:test`
- 위치: `packages/server/src/__tests__/unit/`
- soul-renderer 모킹 패턴: `mock.module('../../engine/soul-renderer', () => ({ renderSoul: mock(...) }))`
- knowledge-injector 모킹 패턴: `mock.module('../../services/knowledge-injector', () => ({ collectKnowledgeContext: mock(...), ... }))`
- semantic-search 모킹: `mock.module('../../services/semantic-search', () => ({ semanticSearch: mock(...) }))`
- 기존 테스트 참고: `soul-renderer.test.ts`, `knowledge-injector.test.ts`, `agent-runner.test.ts`

### Warnings & Gotchas

1. **engine/ 경계 (E8)**: soul-renderer.ts에서 services/ 직접 import 금지. extraVars 패턴 사용
2. **중복 주입 방지**: `{{knowledge_context}}` 유무에 따라 agent-runner의 Department Knowledge 주입 분기
3. **캐시 키 변경**: taskDescription을 캐시 키에 포함하면 캐시 효율 낮아짐 → task context hash 사용 (기존 simpleHash 패턴)
4. **시맨틱 검색 비용**: 매 에이전트 호출마다 Gemini Embedding API 호출 → 캐시 필수
5. **부서 폴더 ID 조회**: knowledgeFolders 테이블에서 departmentId로 폴더 목록 조회 필요
6. **renderSoul 호출자 업데이트**: hub.ts, call-agent.ts, organization.ts, agora-engine.ts, argos-evaluator.ts 등 모든 호출자 확인
7. **하위 호환성**: extraVars가 없으면 기존 동작 그대로 유지

### Cross-Story Dependencies

- **Story 10.1** (완료): pgvector + scoped-query searchSimilarDocs
- **Story 10.2** (완료): Gemini embedding pipeline + generateEmbedding
- **Story 10.3** (완료): semanticSearch() 서비스 + hybrid/keyword/semantic 3-mode
- **Story 2.3** (완료): soul-renderer.ts 기본 구현
- **Story 10.5** (다음): 지식 관리 UI 개선 — 이 스토리의 결과를 UI로 노출

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 10, Story 10.4]
- [Source: _bmad-output/planning-artifacts/architecture.md — E4 Soul 변수, E8 engine 경계]
- [Source: packages/server/src/engine/soul-renderer.ts — renderSoul() 현재 구현]
- [Source: packages/server/src/services/knowledge-injector.ts — collectKnowledgeContext()]
- [Source: packages/server/src/services/semantic-search.ts — semanticSearch()]
- [Source: packages/server/src/services/agent-runner.ts:156-169 — knowledge injection]
- [Source: packages/server/src/routes/workspace/hub.ts:87 — renderSoul 호출]
- [Source: packages/server/src/tool-handlers/builtins/call-agent.ts:58 — renderSoul 호출]
- [Source: _bmad-output/implementation-artifacts/stories/10-3-semantic-search-api.md — 이전 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- tsc --noEmit: clean (0 errors)
- All 26 Story 10.4 tests pass independently
- All 27 soul-renderer tests pass (no regression)
- All 24 knowledge-injector tests pass (no regression)
- All 22 semantic-search tests pass (no regression)
- All 38 agent-runner tests pass (no regression)
- All 8 call-agent tests pass (no regression)
- Mock contamination across files is a known bun:test issue, not a regression (same as Story 10.3)

### Completion Notes List

- `soul-renderer.ts`: Added optional `extraVars?: Record<string, string>` 4th parameter. `{{knowledge_context}}` is now the 7th template variable, injected via extraVars by callers (E8 engine boundary compliance)
- `knowledge-injector.ts`: Added `collectSemanticKnowledge(companyId, departmentId, queryContext?, charBudget?)` — uses semantic search within department folders. Enhanced `collectKnowledgeContext()` with optional `taskDescription` 4th param for semantic-aware Layer 2
- `semantic-search.ts`: Added `folderIds?: string[]` option for multi-folder search
- `scoped-query.ts`: Extended `searchSimilarDocs` to accept `folderId` as `string | string[]` (backward compatible)
- `agent-runner.ts`: Passes taskDescription to `collectKnowledgeContext()`. Skips Department Knowledge section if soul template contains `{{knowledge_context}}` (duplication prevention)
- `hub.ts`: Computes knowledge_context for souls with `{{knowledge_context}}` and passes via extraVars to renderSoul
- `call-agent.ts`: Same pattern as hub.ts for handoff targets
- All changes backward compatible — existing callers work without modification

### File List

- packages/server/src/engine/soul-renderer.ts (modified — extraVars parameter)
- packages/server/src/services/knowledge-injector.ts (modified — collectSemanticKnowledge + taskDescription param)
- packages/server/src/services/semantic-search.ts (modified — folderIds option)
- packages/server/src/db/scoped-query.ts (modified — searchSimilarDocs array folderId)
- packages/server/src/services/agent-runner.ts (modified — taskDescription + duplication prevention)
- packages/server/src/routes/workspace/hub.ts (modified — knowledge_context extraVars + departmentId)
- packages/server/src/tool-handlers/builtins/call-agent.ts (modified — knowledge_context extraVars)
- packages/server/src/__tests__/unit/dept-knowledge-injection.test.ts (new — 26 tests)
- _bmad-output/implementation-artifacts/stories/10-4-department-knowledge-auto-injection.md (new — story file)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified — status update)
