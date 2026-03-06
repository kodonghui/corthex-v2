# Story 12.1: 에이전트 계층 위임 API — 위임 규칙 관리 + 다단계 위임 체인

Status: done

## Story

As a 관리자/사용자,
I want 에이전트 간 위임 관계를 정의하고, 비서가 정의된 위임 규칙에 따라 적절한 에이전트에게 자동 위임하며, 다단계 연쇄 위임(A→B→C)을 지원한다,
so that 복잡한 업무를 조직 계층에 맞게 적합한 에이전트에게 자동으로 라우팅할 수 있다.

## Acceptance Criteria

1. **Given** 관리자 콘솔 **When** 에이전트 간 위임 규칙 생성 **Then** agentDelegationRules 테이블에 sourceAgentId→targetAgentId + 위임 조건(키워드/부서) 저장
2. **Given** 위임 규칙 CRUD API **When** GET/POST/DELETE 호출 **Then** 해당 회사의 위임 규칙 조회/생성/삭제 성공
3. **Given** 비서 에이전트 채팅 **When** 사용자 메시지 수신 **Then** analyzeDelegation이 위임 규칙을 참조하여 최적 위임 대상 결정
4. **Given** 위임 실행 중 **When** 대상 에이전트가 자신도 비서(isSecretary=true) **Then** 연쇄 위임(parentDelegationId 연결) 최대 3단계까지 지원
5. **Given** 연쇄 위임 진행 중 **When** 2단계 이상 위임 **Then** delegation-chain WebSocket 이벤트 발행 (chain 배열)
6. **Given** 위임 규칙 조회 **When** GET /api/workspace/agents/delegation-rules **Then** sourceAgent→targetAgent 관계 + 조건 반환
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — agentDelegationRules 테이블 생성 (AC: #1)
  - [x] agentDelegationRules 테이블: id, companyId, sourceAgentId(FK agents), targetAgentId(FK agents), condition(jsonb — keywords[], departmentId?), priority(integer), isActive(boolean), createdAt
  - [x] 마이그레이션 0017_agent_delegation_rules.sql 생성

- [x] Task 2: 위임 규칙 CRUD API (AC: #2, #6)
  - [x] GET /workspace/agents/delegation-rules — 회사 전체 위임 규칙 조회 (에이전트 이름 조인)
  - [x] POST /workspace/agents/delegation-rules — 위임 규칙 생성 (zod 유효성 + 회사 소속 확인)
  - [x] DELETE /workspace/agents/delegation-rules/:id — 위임 규칙 삭제

- [x] Task 3: orchestrator.ts — 위임 규칙 기반 라우팅 개선 (AC: #3)
  - [x] matchDelegationRules 함수: agentDelegationRules 조회 + keywords 매칭
  - [x] 규칙 매칭 시 해당 targetAgentId로 위임 실행
  - [x] 규칙이 없으면 기존 LLM 분석 로직 유지 (fallback)

- [x] Task 4: orchestrator.ts — 연쇄 위임 (다단계 체인) 지원 (AC: #4, #5)
  - [x] executeChainDelegation: 대상 에이전트가 isSecretary이면 재귀 위임
  - [x] parentDelegationId 연결으로 체인 추적
  - [x] 최대 깊이 3단계 제한 (무한 루프 방지)
  - [x] delegation-chain WebSocket 이벤트: { type: 'delegation-chain', chain: [agentName1, agentName2, ...] }

- [x] Task 5: 빌드 검증 (AC: #7)
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Agent Record

### Completion Notes

- DB: agentDelegationRules 테이블 생성 (sourceAgentId→targetAgentId + condition jsonb + priority)
- API: GET/POST/DELETE /workspace/agents/delegation-rules CRUD 추가
- orchestrator: matchDelegationRules (키워드 매칭) + executeChainDelegation (재귀 위임 max 3) 구현
- 규칙 우선, 없으면 기존 LLM 분석 fallback 유지

### File List

**Modified Files:**
- `packages/server/src/db/schema.ts` — agentDelegationRules 테이블 추가
- `packages/server/src/routes/workspace/agents.ts` — 위임 규칙 CRUD API 3개 추가
- `packages/server/src/lib/orchestrator.ts` — matchDelegationRules + executeChainDelegation + 규칙 기반 라우팅

**New Files:**
- `packages/server/src/db/migrations/0017_agent_delegation_rules.sql` — 마이그레이션

## Dev Notes

### 기존 인프라 활용

1. **delegations 테이블** — schema.ts:232-246
   - 이미 parentDelegationId 필드 존재 (자기참조) — 연쇄 위임 추적용이나 현재 미사용
   - status: pending/processing/completed/failed
   - secretaryAgentId → targetAgentId 관계

2. **orchestrator.ts** — orchestrateSecretary (line 157-300)
   - analyzeDelegation: LLM으로 부서별 위임 대상 분석
   - executeDelegation: 순차 실행 (`for` 루프)
   - delegation-start / delegation-end WebSocket 이벤트 발행
   - onEvent 콜백으로 이벤트 전달

3. **agents 테이블** — schema.ts:92-108
   - departmentId (부서 소속), isSecretary (비서 여부)
   - 위임 대상은 현재 departmentId로 연결

4. **위임 내역 API** — chat.ts:302-333
   - GET /chat/sessions/:sessionId/delegations — 세션별 위임 조회

5. **UX 스펙 — 위임 체인 표시** (lines 795-819)
   - 1단계: `비서실장 | 금융분석팀장에게 위임 중...`
   - 3단계+: `비서실장 → 금융분석팀장 → 리서치팀원`
   - delegation-chain 이벤트 사용

### agentDelegationRules 설계

```typescript
// 위임 규칙: "금융 관련 질문은 금융분석팀장에게"
agentDelegationRules = {
  id: uuid,
  companyId: uuid,
  sourceAgentId: uuid,  // 위임하는 에이전트 (보통 비서)
  targetAgentId: uuid,  // 위임받는 에이전트
  condition: jsonb,     // { keywords: ['금융', '주식'], departmentId?: string }
  priority: integer,    // 높을수록 우선 (같은 키워드 충돌 시)
  isActive: boolean,
  createdAt: timestamp,
}
```

### 위임 규칙 매칭 로직

```typescript
// 1. 활성 규칙 조회 (sourceAgentId = 비서 에이전트)
// 2. 사용자 메시지에서 keywords 매칭 (includes 검색)
// 3. 매칭된 규칙을 priority 내림차순 정렬
// 4. 최우선 규칙의 targetAgentId로 위임
// 5. 매칭 없으면 기존 LLM 분석 로직 (fallback)
```

### 연쇄 위임 플로우

```
사용자: "해외 주식 시장 분석해줘"
1. 비서실장 → analyzeDelegation → 규칙 매칭: "금융분석팀장"
2. 금융분석팀장(isSecretary=true) → 재귀 위임 → 규칙 매칭: "리서치팀원"
3. 리서치팀원(isSecretary=false) → 직접 실행
4. 결과 역전파: 리서치팀원 → 금융분석팀장 → 비서실장 → 사용자

delegation-chain 이벤트: { chain: ['비서실장', '금융분석팀장', '리서치팀원'] }
```

### 이전 스토리 교훈 (Epic 11)

- DB enum 변경: drizzle-kit push로 ALTER TYPE 자동 처리
- eventBus 패턴: `eventBus.emit('channel', { companyId, payload })`
- WS 이벤트: onEvent 콜백 패턴 (orchestrator.ts에서 이미 사용 중)
- 재귀 깊이 제한 필수 (무한 루프 방지)

### Project Structure Notes

- `packages/server/src/db/schema.ts` — agentDelegationRules 테이블 추가
- `packages/server/src/routes/workspace/agents.ts` — 위임 규칙 CRUD API 추가
- `packages/server/src/lib/orchestrator.ts` — 규칙 기반 라우팅 + 연쇄 위임 로직

### References

- [Source: packages/server/src/db/schema.ts:92-108] — agents 테이블
- [Source: packages/server/src/db/schema.ts:232-246] — delegations 테이블
- [Source: packages/server/src/lib/orchestrator.ts:157-300] — orchestrateSecretary
- [Source: packages/server/src/routes/workspace/chat.ts:302-333] — 위임 내역 API
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:795-819] — 위임 체인 UX
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:537-593] — NEXUS 위임 엣지
