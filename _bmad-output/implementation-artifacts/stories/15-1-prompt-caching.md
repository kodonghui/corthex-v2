# Story 15.1: Prompt Caching (Claude API cache_control)
Status: backlog
Story Points: 5
Priority: P0
blockedBy: none

## Story
As a platform operator,
I want system prompts cached on Anthropic's servers via `cache_control: { type:'ephemeral' }`,
so that Soul + tool definition tokens are billed at 0.1× rate and TTFT is reduced by ≥ 85% on repeat calls.

## Context

**아키텍처 결정 D17** (`epic-15-architecture-addendum.md` 참조):
- Prompt Cache 전략: `ContentBlock[]` + `cache_control: { type:'ephemeral' }`
- `agent-loop.ts`의 `systemPrompt`를 `string` → `ContentBlock[]`으로 변경
- **PoC 선행 필수**: Claude Agent SDK `query()`가 `ContentBlock[]` systemPrompt를 지원하는지 검증
  - 성공 조건: 두 번째 호출 `usage.cache_read_input_tokens > 0`
  - 실패 시: `anthropic.messages.create()` 직접 호출로 전환 (동일 `cache_control` 효과)

**D17 PoC 결정 트리**:
```
Story 15.1 시작 전 SDK PoC:
  query({ systemPrompt: [{ type:'text', text:soul, cache_control:{ type:'ephemeral' } }] })
  ├── 성공 (두 번째 호출 cache_read_input_tokens > 0)
  │   └── agent-loop.ts systemPrompt string → ContentBlock[] 변경
  └── 실패 (타입 오류 또는 cache_read_input_tokens = 0)
      └── anthropic.messages.create() 직접 호출로 전환
```

**비용 구조** (Anthropic 공식):
- 캐시 쓰기: `cacheCreationInputTokens × $3.75/MTok` (기본 요금의 1.25×)
- 캐시 읽기: `cacheReadInputTokens × $0.30/MTok` (기본 요금의 0.1×)
- Soul + 도구 정의 약 3,000토큰 → 캐시 히트 시 약 0.09센트/호출 절감
- TTL: `ephemeral` 기본 5분 — 배포 30일 후 히트율 확인 후 1시간 전환 수동 결정

**스코프 제한**:
- 에이전트별 on/off 없음 — 전 에이전트 일괄 적용 (응답 내용에 영향 없음)
- Soul 편집 후 최대 5분 내 자연 만료 (즉시 무효화 없음 — 수용 범위)
- Admin UI 노출 없음 — 서버 로그만 기록 (Cost Dashboard는 Phase 5+)

**Hook 파이프라인 무변경** (`architecture.md` D4):
- `credential-scrubber` = **PostToolUse** (도구 출력 마스킹) — Story 15.1 수정 범위 외
- Stop Hook(`cost-tracker`): `usage.inputTokens`, `usage.outputTokens` + 이번에 `cacheReadInputTokens`, `cacheCreationInputTokens` 추가

## Acceptance Criteria

1. **Given** Story 15.1 구현 시작 전, **When** SDK PoC를 실행하면 (`query()`에 `ContentBlock[]` systemPrompt 전달), **Then** 두 번째 호출 응답의 `usage.cache_read_input_tokens > 0`이 확인되거나, SDK 미지원이 확인되어 `messages.create()` 직접 호출 경로가 선택된다

2. **Given** SDK PoC 성공 경로, **When** `agent-loop.ts`가 Soul을 API에 전달하면, **Then** `systemPrompt`는 `[{ type:'text', text: renderedSoul, cache_control: { type:'ephemeral' } }]` 형식의 `ContentBlock[]`으로 전달된다

3. **Given** SDK PoC 실패 경로, **When** `agent-loop.ts`가 API를 호출하면, **Then** `anthropic.messages.create()` 직접 호출로 동일 `cache_control` 효과를 달성하며, 에이전트 응답 내용은 기존과 동일하다

4. **Given** 동일 에이전트에 대해 첫 번째 API 호출이 완료된 후, **When** 5분 내 두 번째 호출을 하면, **Then** 응답 `usage`에 `cache_read_input_tokens > 0`이 포함된다 (Anthropic 서버 캐시 히트 확인)

5. **Given** `engine/types.ts`의 Stop Hook `usage` 타입, **When** 검토하면, **Then** `cacheReadInputTokens?: number`와 `cacheCreationInputTokens?: number` 필드가 추가되어 있다

6. **Given** `engine/hooks/cost-tracker.ts`, **When** 캐시 세션이 완료되면, **Then** `log.info({ event:'prompt_cache_usage', agentId, companyId, cacheReadInputTokens, cacheCreationInputTokens, cacheReadCostUsd, cacheCreationCostUsd })`가 기록된다 (비용 계산: read × $0.30/MTok, creation × $3.75/MTok)

7. **Given** 3개 캐싱 레이어 전부 비활성 상태, **When** 에이전트가 응답을 생성하면, **Then** 기존 동작과 동일하게 정상 응답이 반환된다 (NFR-CACHE-R3)

8. **Given** 모든 변경 완료 후, **When** `npx tsc --noEmit -p packages/server/tsconfig.json`을 실행하면, **Then** 타입 오류 0건이다

## Tasks / Subtasks

- [ ] Task 1: SDK PoC 실행 (AC: #1)
  - [ ] `engine/agent-loop.ts`의 실제 `query()` 호출부 파악 (파일 위치 + 라인 확인)
  - [ ] 테스트 스크립트(`scripts/poc-prompt-cache.ts`) 작성: 동일 에이전트 2회 연속 query(), 두 번째 응답 `usage.cache_read_input_tokens` 출력
  - [ ] PoC 실행 결과에 따라 경로 A(ContentBlock[]) 또는 경로 B(messages.create()) 선택 결정 — 선택 결과를 Dev Notes에 기록

- [ ] Task 2: engine/types.ts 업데이트 (AC: #5)
  - [ ] Stop Hook `E2Usage` (또는 동등 타입) 인터페이스에 `cacheReadInputTokens?: number`, `cacheCreationInputTokens?: number` 추가
  - [ ] Anthropic SDK 응답 타입과 필드명 일치 여부 확인

- [ ] Task 3A: agent-loop.ts 수정 — 경로 A (ContentBlock[]) (AC: #2, #4)
  - [ ] `systemPrompt` 변수 타입 `string` → `ContentBlock[]` 변경
  - [ ] soul-renderer 반환값 래핑: `[{ type:'text', text: renderedSoul, cache_control: { type:'ephemeral' } }]`
  - [ ] `query()` 호출 시 변경된 `systemPrompt` 전달
  - [ ] *경로 B 선택 시 이 Task는 건너뜀*

- [ ] Task 3B: agent-loop.ts 수정 — 경로 B (messages.create()) (AC: #3, #4)
  - [ ] **⚠️ 경로 B 선택 시 Hook 파이프라인 단절 위험**: SDK `query()` 미사용 시 PreToolUse/PostToolUse/Stop Hook 자동 발화 없음 → `tool-permission-guard`, `credential-scrubber`, `cost-tracker` 전부 미발화. 경로 B 선택 전 팀 리드와 스코프 재협의 필수. **PoC에서 경로 A 성공이 최우선 목표.**
  - [ ] 경로 B 진행 시 Hook 재구현 필요 — 변환 필요 필드:
    - `usage: { inputTokens, outputTokens, cacheReadInputTokens?, cacheCreationInputTokens? }` → Stop Hook 입력
    - `stopReason: MessageStopReason` → E2 Stop Hook 입력 형식
    - `toolUse: ContentBlock[]` → PreToolUse/PostToolUse Hook 입력 형식
    - 현재 `agent-loop.ts`의 `query()` 응답 처리 코드 전체 파악 후 변환 래퍼 설계
  - [ ] `system` 파라미터: `[{ type:'text', text: renderedSoul, cache_control: { type:'ephemeral' } }]`
  - [ ] *경로 A 선택 시 이 Task는 건너뜀*

- [ ] Task 4: cost-tracker Hook 업데이트 (AC: #6)
  - [ ] `engine/hooks/cost-tracker.ts`에서 `usage.cacheReadInputTokens`, `usage.cacheCreationInputTokens` 수신
  - [ ] 비용 계산 로직 추가: `read × 0.30 / 1_000_000`, `creation × 3.75 / 1_000_000`
  - [ ] `log.info({ event:'prompt_cache_usage', agentId, companyId, cacheReadInputTokens, cacheCreationInputTokens, cacheReadCostUsd, cacheCreationCostUsd })` 기록

- [ ] Task 5: 검증 (AC: #7, #8)
  - [ ] `npx tsc --noEmit -p packages/server/tsconfig.json` — 오류 0건 확인
  - [ ] bun:test: 동일 에이전트 2회 호출 시 `cache_read_input_tokens > 0` 검증
  - [ ] bun:test: `cost-tracker` 캐시 비용 계산 정확도 (read × $0.30/MTok, creation × $3.75/MTok)
  - [ ] 기존 agent-loop 테스트 전부 통과 확인

## Dev Notes

- **현재 agent-loop.ts 위치**: `packages/server/src/engine/agent-loop.ts` (git ls-files로 케이스 확인)
- **soul-renderer 참조**: `engine/soul-renderer.ts` — `renderSoul(agent, ctx)` → `string` 반환. Task 3A에서 반환값을 `ContentBlock[]`으로 래핑
- **SDK 버전 고정**: `package.json`의 `@anthropic-ai/claude-agent-sdk` exact pin 버전 확인 (CLAUDE.md: `^` 사용 금지)
- **경로 A vs B 선택 기록**: Task 1 완료 후 이 Dev Notes 하단에 "선택 경로: A" 또는 "선택 경로: B"를 반드시 기록
- **ContentBlock[] 지원 여부**: Anthropic SDK 공식 문서 기준 `system` 파라미터가 `string | ContentBlock[]`이면 경로 A 가능
- **5분 TTL 한계**: Soul 편집 후 최대 5분 동안 캐시된 구버전 Soul로 응답 가능 — 의도적 허용 (FR-CACHE-1.7)
- **에이전트 수와 무관**: 에이전트 1명이든 50명이든 동일 적용
- **blocked_by**: 없음. 15.2와 병렬 개발 가능. 15.3은 15.1 완료 후 시작 권장
