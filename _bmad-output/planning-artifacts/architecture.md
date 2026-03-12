---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
partyModeRounds: 32
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-corthex-v2-engine-refactor-2026-03-10.md
  - _bmad-output/planning-artifacts/v1-feature-spec.md
  - _poc/agent-engine-v3/POC-RESULT.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'corthex-v2'
user_name: 'ubuntu'
date: '2026-03-11'
partyModeRounds: 15
---

# Architecture Decision Document

_CORTHEX v2 — AI Agent Orchestration Platform (Dynamic Organization Management)_

## Project Context Analysis

### Requirements Overview

**Functional Requirements (72개, 12 Capability Areas):**

| Area | FR 수 | Phase | 아키텍처 영향 |
|------|-------|-------|-------------|
| Agent Execution | 10 | 1 | SDK query() 래퍼, call_agent MCP, N단계 핸드오프, 병렬 실행, 순환 감지 |
| Secretary & Orchestration | 10 | 2 | Soul 기반 라우팅, 비서 유무 분기 허브 UX 2종, 에이전트 메타데이터 자동 주입 |
| Soul Management | 5 | 1~2 | 템플릿 변수 치환 엔진, DB→Soul 동적 바인딩, 금지 섹션 자동 삽입 |
| Organization Management | 8 | 2~3 | CRUD API + NEXUS React Flow UI, 비서실장 삭제 방지 |
| Tier & Cost | 6 | 1+3 | tier_configs 테이블, enum→integer 마이그레이션, cost-tracker Hook |
| Security & Audit | 6 | 1~2 | Hook 5개 (permission/credential/delegation/cost/redactor) |
| Real-time Monitoring | 4 | 1~2 | WebSocket 핸드오프 추적, 에러 투명성, 메모리 모니터링 |
| Library (Knowledge & Briefing) | 7 | 4+유지 | pgvector 의미검색, NotebookLM MCP, 텔레그램 전송 |
| Dev Collaboration | 2 | 4 | 스케치바이브 Stdio MCP 서버 |
| Onboarding | 3 | 2 | CLI 토큰 검증, 기본 조직 자동 생성 |
| v1 Compat & UX | 7 | 유지+2 | 대화 기록, autoLearn, 파일 첨부, 마크다운 렌더링 |
| Phase 5+ Reserved | 4 | 5+ | 검색, 테마, 감사 로그 조회, 키보드 접근성 |

**Non-Functional Requirements (61개, 12 Categories):**

| Category | 개수 | P0 | 아키텍처 영향 |
|---------|------|-----|-------------|
| Performance | 12 | 3 | call_agent E2E ≤60초, API P95 ±10%, NEXUS 60fps |
| Security | 7 | 7 | 전부 P0. CLI 토큰 AES-256, Hook 5개 보안 체계 |
| Scalability | 7 | 4 | 동시 20세션, 200MB/세션, 24GB 서버, SDK graceful degradation |
| Availability | 3 | 0 | 99%, 30분 복구, 일일 DB 백업 |
| Accessibility | 4 | 0 | WCAG 2.1 AA, 색상 대비, aria-live |
| Data Integrity | 7 | 0 | 마이그레이션 무중단, 벡터 NULL 허용, 대화 무제한 보관 |
| External Dependencies | 3 | 2 | Claude CLI 장애 격리, 부분 장애 비전파 |
| Operations | 8 | 1 | 응답 품질 A/B, 비서 라우팅 80%+, Soul 반영 80%+ |
| Cost | 2 | 0 | 인프라 월 $10 이하, Embedding 월 $5 이하 |
| Logging | 3 | 0 | JSON 구조화, 30일 보관, 에러 알림 |
| Browser | 3 | 1 | Chrome P0, Safari P1, Firefox/Edge P2 |
| Code Quality | 1 | 0 | CLAUDE.md 컨벤션 준수 |

**Scale & Complexity:**

- Primary domain: Full-stack SaaS B2B (developer_tool 40% / web_app 30% / saas_b2b 30%)
- Complexity level: **High** (29/40 — 아키텍처 변경 5/5, 회귀 범위 5/5)
- Project context: Brownfield (Core Engine Replacement)
- Estimated architectural components: ~15개 (엔진 7파일 + Hook 5개 + MCP 2개 + DB 마이그레이션)

### Infrastructure Baseline

| 항목 | 스펙 |
|------|------|
| Provider | Oracle Cloud ARM Ampere A1 Flex |
| CPU | Neoverse-N1 4코어 (하이퍼스레딩 없음) |
| RAM | **24GB** |
| OS | Linux aarch64 |
| Runtime | Bun + Docker |
| CI/CD | GitHub Actions self-hosted runner (**동일 서버** — 배포 중 가용 CPU 감소) |
| CDN | Cloudflare |
| DB | PostgreSQL + pgvector (**동일 서버**) |
| CLI Max | $220/월 × 2개 = $440/월 |

**병목 분석:**
- 메모리: ~~제약 아님~~ — 24GB면 200MB/세션 × 50세션도 10GB
- **CPU가 병목**: 4코어(HT 없음). 가용 ~2.5코어(Bun 서버 + Docker/OS 제외). 동시 spawn 시 CPU 스파이크 주의
- 네트워크: Anthropic API 호출 latency가 지배적 (LLM 응답 대기)

**동시 세션 용량 분석:**

| 시나리오 | 동시 프로세스 | CPU 부하 | 메모리 | 판정 |
|---------|------------|---------|--------|------|
| 단순 대화 10개 | 10 | 낮음 (I/O 대기) | ~2GB | ✅ 여유 |
| 3단계 핸드오프 5개 | 15 | 중간 (spawn 스파이크) | ~3GB | ✅ 가능 |
| 3단계 핸드오프 10개 | 30 | 높음 (spawn 동시) | ~6GB | ⚠️ 경계 |
| 5단계 핸드오프 10개 | 50 | 위험 (4코어 포화) | ~10GB | ❌ CPU 병목 |

**결론:** 동시 세션 상한 **20**이 현실적. CLI rate limit에 의해 추가 하향 가능 (Phase 1 부하 테스트로 확정).

### Technical Constraints & Dependencies

| 제약 | 영향 |
|------|------|
| Oracle VPS ARM64, **24GB RAM, 4코어** | CPU가 병목. 동시 세션 상한 20 |
| CI/CD runner 동일 서버 | 배포 중 가용 CPU 감소 → 배포 시간대 세션 제한 고려 |
| Claude Agent SDK 0.2.72 (0.x) | Breaking change 가능. agent-loop.ts 1파일 격리 필수 |
| Zod v4 (v3→v4) | MCP 도구 스키마 정의. 기존 drizzle-zod와 호환 확인 |
| Bun runtime | Node.js와 SDK 호환성 PoC 통과 확인 완료 |
| CLI Max $220 × 2개 | Human별 토큰 1:1 매핑. 토큰 풀 패턴은 Phase 5+ 검토 |
| 기존 코드베이스 | Epic 1~20 전체 기능 회귀 검증 필수 |
| Turborepo 모노레포 | packages/admin, app, ui, shared, server |

### Cross-Cutting Concerns Identified

1. **CLI 토큰 전파 (Token Propagation)**: 최초 명령자 토큰이 핸드오프 체인 전체에 전파. 에이전트 실행, 보안 Hook, 비용 추적 3개 레이어를 관통.

2. **멀티테넌시 (company_id)**: 모든 DB 쿼리, 에이전트 세션, 조직 관리, 비용 추적에 company_id 격리 적용.

3. **실시간 이벤트 버스**: Hook에서 WebSocket으로 핸드오프 이벤트 발행 → 허브 트래커에서 소비. EventEmitter(인프로세스) — 단일 서버에 충분. 인터페이스 추상화하여 Phase 5+ Redis 교체 대비.

4. **SDK 격리 경계**: agent-loop.ts 1파일만 SDK에 의존. 나머지 전체 코드베이스는 SDK-agnostic 인터페이스만 사용.

5. **Soul 템플릿 변수 치환**: DB 데이터(agent_list, subordinate_list, tool_list)를 query() 호출 전 Soul에 동적 주입. 에이전트 CRUD와 실행 엔진 양쪽에 영향.

6. **에러 투명성**: 모든 핸드오프 실패를 사용자에게 명시적으로 표시. "블랙박스 에러 0건" 요구사항.

### Party Mode 도출 — 핵심 아키텍처 사전 결정 (6라운드)

**결정 1: SessionContext 패턴**

핸드오프 체인 전체를 관통하는 불변 컨텍스트 객체. call_agent 핸들러에서 spread 복사하여 하위에 전달.

```typescript
interface SessionContext {
  cliToken: string;        // FR38: 최초 명령자 CLI 토큰
  userId: string;          // 멀티테넌시 + 비용 귀속
  companyId: string;       // Row-level 격리
  depth: number;           // FR4: 현재 핸드오프 깊이
  sessionId: string;       // NFR-LOG1: 전체 체인 추적
  startedAt: number;       // NFR-P8: 120초 타임아웃
  maxDepth: number;        // ORC-1: 회사별 configurable (기본 5)
  visitedAgents: string[]; // FR9: 순환 감지 (브랜치별 path)
}
```

- 병렬 핸드오프 시 각 브랜치가 **독립 복사본** 보유 (visitedAgents가 분기)
- 순환 감지 = "같은 브랜치 내 재방문" (글로벌 Set이 아님)

**결정 2: 단일 진입점 원칙**

```
[허브]  [텔레그램]  [ARGOS 크론잡]  [AGORA]  [자동매매]  [스케치바이브 MCP]
   \       |           |            |          |           /
    ▼      ▼           ▼            ▼          ▼          ▼
   ┌─────────────────────────────────────────────────────────┐
   │             agent-loop.ts (단일 진입점)                    │
   │   SessionContext 생성 → Hook 파이프라인 → SDK query()      │
   └─────────────────────────────────────────────────────────┘
```

모든 에이전트 실행 경로(허브, 텔레그램, ARGOS, AGORA, 자동매매, 스케치바이브)가 반드시 agent-loop.ts를 통과. Hook 우회 불가 = 보안 일관성 보장.

**결정 3: Hook 파이프라인 실행 순서**

```
PreToolUse (도구 호출 전):
  1. tool-permission-guard → 비허용 도구 deny (이후 Hook 실행 안 함)

PostToolUse (도구 호출 후):
  1. credential-scrubber → 민감 패턴 마스킹 (보안 최우선!)
  2. output-redactor → 추가 패턴 마스킹
  3. delegation-tracker → 마스킹된 안전한 데이터로 WebSocket 이벤트 발행

Stop (세션 종료):
  1. cost-tracker → 비용 기록
```

순서 위반 시 보안 사고: delegation-tracker가 credential-scrubber보다 먼저 실행되면 마스킹 안 된 토큰이 WebSocket으로 브로드캐스트됨.

**결정 4: SSE 어댑터 레이어**

`engine/sse-adapter.ts` (~30줄) — SDK AsyncGenerator<SDKMessage> → 기존 SSE 이벤트 형식 변환.
- agent-loop.ts는 SDK에만 집중
- SSE 어댑터는 프론트 호환에만 집중
- Phase 1에서 프론트엔드 수정 0을 보장하는 핵심 레이어

**결정 5: Pre-spawn 이벤트 시퀀스**

```
사용자 메시지 전송 (0ms)
  → 서버 수신 즉시: SSE "accepted" (50ms) → 프론트: "명령 접수됨" + 로딩
  → SDK spawn (~2초)
  → SDK ready: SSE "processing" → 프론트: "비서실장 분석 중..."
  → 응답 스트리밍: SSE "message" chunks
```

agent-loop.ts가 query() 호출 전에 먼저 "accepted" 이벤트를 발행하여 SDK spawn 지연(~2초)을 체감 지연 없이 흡수.

### Phase 1 마이그레이션 체크리스트 (사전 식별)

| 항목 | 설명 |
|------|------|
| agent-runner.ts import 전수 조사 | `grep -r "agent-runner" packages/server/src/` |
| SSE 이벤트 형식 호환 매핑 | 기존 이벤트(processing/message/delegation) → 신규 SDK 메시지 |
| 호출 경로 매핑 | AGORA, 자동매매(VECTOR), 크론잡, 텔레그램 → agent-loop.ts |
| 기존 테스트 목록 | agent-runner 의존 테스트 식별 + 신규 엔진 대응 |
| 비서 없는 허브 API | 부서별 그룹핑 + lastUsedAt 정렬 (50+ 에이전트 대응) |

### PRD 수정 대기 목록 (아키텍처 완성 후 일괄 적용)

| 항목 | 현재값 | 수정값 | 근거 |
|------|-------|--------|------|
| NFR-SC1 동시 세션 | 10 | **20** | CPU 4코어 기준 (CLI rate limit으로 추가 조정 가능) |
| NFR-SC2 세션 메모리 | ≤ 50MB | **≤ 200MB** | 24GB RAM 기준 |
| NFR-SC7 총 메모리 | ≤ 3GB (4GB 기준) | **≤ 16GB (24GB 기준)** | 서버 실제 스펙 |
| NFR-P7 5단계 메모리 | ≤ 50MB | **≤ 200MB** | 24GB RAM 기준 |
| OPS-1 동시 세션 제한 | 기본 10 | **기본 20** | NFR-SC1과 일치 |
| 곳곳 "4GB" 표현 | Oracle VPS 4GB | **Oracle VPS 24GB ARM64 4코어** | 서버 실제 스펙 |

## Starter Template Evaluation

### Primary Technology Domain

**Brownfield Core Engine Replacement** — 기존 Turborepo 모노레포 위에 증분 아키텍처. 새 스타터 불필요.

### Existing Technology Stack (확립됨)

| 항목 | 선택 | 비고 |
|------|------|------|
| Monorepo | Turborepo | packages/admin, app, ui, shared, server |
| Runtime | Bun | PoC에서 SDK 호환 확인 |
| Backend | Hono | createBunWebSocket, RPC 지원 |
| Frontend | React 19 + Vite 6 | SPA 2개 (app, admin) |
| Styling | Tailwind CSS 4 | @corthex/ui CVA 기반 |
| DB | PostgreSQL + Drizzle ORM | Phase 3 pgvector 확장 |
| State | Zustand + TanStack Query | 실시간 캐시 업데이트 패턴 |
| Auth | JWT | RBAC (Admin/CEO/Human) |
| Realtime | WebSocket (Hono) | 7채널 멀티플렉싱 |
| Deploy | Docker → Oracle ARM64 + GitHub Actions self-hosted | 동일 서버 |
| CDN | Cloudflare | 캐시 퍼지 자동화 |
| Test | bun:test (서버) | — |

### New Dependencies by Phase

**Phase 1 (엔진):**

| 패키지 | 용도 | 위치 |
|--------|------|------|
| `@anthropic-ai/claude-agent-sdk@0.2.x` | 에이전트 실행 엔진 | engine/agent-loop.ts |
| `@zapier/secret-scrubber` | credential/output Hook | engine/hooks/ |
| `hono-rate-limiter` | 동시 세션 제한 (429) | server middleware |
| `drizzle-zod` (Zod v4) | DB→Zod→TS 타입 자동 생성 | shared/ |
| `llm-cost-tracker` | 비용 추적 Hook | engine/hooks/cost-tracker.ts |
| `croner` | ARGOS 크론잡 (Bun 네이티브) | services/ |

**Phase 2 (오케스트레이션):**

| 패키지 | 용도 | 위치 |
|--------|------|------|
| `assistant-ui` | 허브 채팅 UI (SSE, 마크다운, 접근성) | app/ |

**Phase 3 (시각화):**

| 패키지 | 용도 | 위치 |
|--------|------|------|
| `React Flow` + `ELK.js` | NEXUS 조직도 (드래그&드롭, 계층 레이아웃) | admin/ |

**Phase 4 (지능화):**

| 패키지 | 용도 | 위치 |
|--------|------|------|
| `pgvector-node` | 벡터 유사도 검색 | server/ |
| `@google/genai` | Gemini Embedding API | server/ |
| `notebooklm-mcp` | NotebookLM MCP (Python Stdio) | server/ |
| `@modelcontextprotocol/sdk` | 스케치바이브 MCP 서버 | server/src/mcp/ |

### Package Placement Decisions

**engine/ 위치:** `packages/server/src/engine/`
- 서버 내부. SDK 의존성이 server 패키지에 국한됨
- 별도 패키지 분리 불필요

**MCP 위치:** `packages/server/src/mcp/`
- 스케치바이브 MCP가 서버 Hono API를 호출하므로 같은 패키지
- 별도 엔트리포인트: `packages/server/src/mcp/sketchvibe-mcp.ts`

**Hono RPC:** 신규 API(Phase 2~3)에만 적용. 기존 API 불가침. 점진적 전환 전략.

### Code Disposition Matrix (삭제/교체/동결/불가침)

| 파일 | 처분 | 시점 | 대체 |
|------|------|------|------|
| `services/agent-runner.ts` | 교체 | Phase 1 | `engine/agent-loop.ts` |
| `services/delegation-tracker.ts` | 교체 | Phase 1 | `engine/hooks/delegation-tracker.ts` |
| `services/chief-of-staff.ts` | 삭제 | Phase 2 (Soul 검증 후) | 비서 Soul + call_agent |
| `services/manager-delegate.ts` | 삭제 | Phase 2 (Soul 검증 후) | 매니저 Soul + call_agent |
| `services/cio-orchestrator.ts` | 삭제 | Phase 2 (Soul 검증 후) | CIO Soul + call_agent |
| `services/llm-router.ts` | **동결** | Phase 1~4 | `engine/model-selector.ts` (신규 ~20줄) |
| `services/trading/*` | 불가침 | — | — |
| `services/telegram/*` | 불가침 | — | 음성 전송 연동만 추가 |
| `services/selenium/*` | 불가침 | — | — |

**llm-router.ts 동결 근거:**
- Phase 1~4는 Claude 전용 → 크로스 프로바이더 폴백 불필요
- SDK query()에 모델 폴백 없음 → model-selector가 tier→model 매핑만 담당
- Phase 5+ "멀티 LLM 동적 라우팅" 시 부활 또는 재설계

### Frontend Library Decisions

**허브 채팅 UI: assistant-ui**
- React 전용, Vite SPA 궁합 좋음
- AI SDK 비종속 (Vercel AI Elements와 차별점)
- SSE 스트리밍, 마크다운, 접근성 내장
- 폴백: React 19 미호환 시 직접 구현 (~300줄)
- Phase 2 시작 전 React 19 호환성 확인 필수

**NEXUS 조직도: React Flow + ELK.js**
- 네이티브 React (Cytoscape 래퍼 대비 안정적)
- ELK.js 계층 레이아웃 = 조직도에 최적
- 접근성 aria 내장, 60fps (Canvas 렌더링)

**스케치바이브: Cytoscape.js 유지**
- 자유 캔버스(마인드맵, 플로우차트) = 비구조적 → Cytoscape가 적합
- v1 호환성 유지

**번들 최적화:** NEXUS(React Flow)와 스케치바이브(Cytoscape) 모두 admin 패키지에 존재. `React.lazy()` 동적 import로 라우트별 청크 분리 → 초기 번들에 미포함.

### Dependency Verification Strategy

Phase 1 첫 스토리로 **"의존성 검증"** 실행:
1. 모든 Phase 1 패키지 설치
2. `turbo build` 성공 확인
3. `bun test` 전체 통과 확인
4. Zod v4 ↔ 기존 Zod v3 충돌 여부 확인 (`grep -r "from 'zod'" packages/`)
5. Dockerfile COPY 목록 업데이트
6. ARM64 Docker 빌드 확인
7. pino Bun 호환성 테스트 (실패 시 consola 폴백)

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (구현 차단):**

| # | 결정 | 선택 | 근거 |
|---|------|------|------|
| D1 | company_id 격리 | **getDB(companyId) 패턴** — db 직접 export 금지, 타입 레벨 강제 | 컴파일 타임 안전성. lint 규칙 없이 격리 보장 |
| D2 | CLI 토큰 만료 처리 | **진행 중 세션 완료, 새 세션만 차단** | SDK spawn 시점에만 토큰 필요. Phase 1 실제 테스트로 확인 |
| D3 | 에러 코드 체계 | **도메인 프리픽스** (AUTH_/AGENT_/SESSION_/HANDOFF_/TOOL_/ORG_) | HTTP + SSE 통합 코드 체계. 프론트 일관 에러 처리 |
| D4 | Hook 파이프라인 순서 | **보안 먼저** — PreToolUse: permission → PostToolUse: scrubber→redactor→delegation → Stop: cost | 순서 위반 = 보안 사고 (마스킹 안 된 토큰 WebSocket 노출) |
| D5 | SessionContext | **불변 객체, 9필드, 브랜치별 path** | 병렬 핸드오프 시 독립 복사. 순환 감지 = 같은 브랜치 내 재방문 |
| D6 | 단일 진입점 | **모든 실행 경로 → agent-loop.ts** | 허브/텔레그램/ARGOS/AGORA/자동매매/스케치바이브 전부 동일 경로. Hook 우회 불가 |

**Important Decisions (아키텍처 형성):**

| # | 결정 | 선택 | 근거 |
|---|------|------|------|
| D7 | 도구 권한 저장 | **agents 테이블 JSON 배열** (allowed_tools jsonb) | 단순, 조인 불필요. SQL replace로 리네임 대응 가능 |
| D8 | DB 쿼리 캐싱 | **없음** (Phase 1~4 유지) | 24GB 서버, 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%). Epic 15 Claude API 토큰 캐싱 · 도구 결과 캐싱 · Semantic 캐싱은 D8 적용 범위(DB 쿼리) 밖 별도 레이어로 추가 — D8 위반 아님 |
| D9 | 로거 | **pino 우선 + consola 폴백 + 어댑터 래핑** | JSON 구조화, child logger(sessionId 자동 주입). 교체 비용 0 |
| D10 | 테스트 전략 | **단위+모킹통합(CI 매커밋) + 실제SDK(주1회)** | SDK query() 모킹, CORTHEX 코드(call_agent/Hook/Context)는 실제 실행. 비용 $0 |
| D11 | WebSocket 이벤트 | **Phase 1 기존 형식 유지, Phase 2에서 전환** | 프론트 수정 최소화 |
| D12 | 토큰 유효성 검증 | **등록 시만** (세션 시작 시 검증 안 함) | 오버헤드 제거. SDK 에러로 런타임 감지 |
| D13 | Claude API · 도구 · Semantic 캐싱 전략 | **Epic 15 조기 구현** (Phase 1~3 전체 적용) | Prompt Cache: $27/월 즉각 절감, 에이전트 수와 무관. D8(DB 쿼리 캐싱 없음) 위반 아님 — 별개 레이어. 세부 결정 D17~D20은 `epic-15-architecture-addendum.md` 참조. Phase 4+ Redis 전환은 D21로 별도 Deferred 등록 |

**Deferred Decisions (Phase 5+):**

| # | 결정 | 이유 |
|---|------|------|
| D14 | 토큰 풀 (N개 토큰) | 현재 1:1 매핑 충분. CLI Max 2개지만 Human별 할당 |
| D15 | 크로스 프로바이더 폴백 | Phase 1~4 Claude 전용 |
| D16 | API 버저닝 | Phase 1~4 단일 버전 |
| D21 | Tool Cache Redis 전환 | 단일 서버(Phase 1~3)에서는 인메모리 Map으로 충분. 다중 서버 배포(Phase 4+) 전환 시 프로세스 간 캐시 공유 필요 → Redis 도입. `lib/tool-cache.ts`의 `cacheStore` 구현체만 교체, `withCache()` API 유지 |

### Data Architecture

**멀티테넌시 격리: getDB(companyId) 패턴**

```typescript
// db/scoped-query.ts (~30줄)
export function getDB(companyId: string) {
  if (!companyId) throw new Error('companyId required');
  return {
    agents: () => db.select().from(agents).where(eq(agents.companyId, companyId)),
    departments: () => db.select().from(departments).where(eq(departments.companyId, companyId)),
    tierConfigs: () => db.select().from(tierConfigs).where(eq(tierConfigs.companyId, companyId)),
    knowledgeDocs: () => db.select().from(knowledgeDocs).where(eq(knowledgeDocs.companyId, companyId)),
    // 테이블별 스코프
  };
}

// 직접 db 객체는 내부 전용 (마이그레이션, 시드 데이터)
// 신규 코드: getDB(ctx.companyId).agents() 형태로만 접근
// 기존 코드: 점진적 전환 (Phase 1에서는 공존)
```

**도구 권한 저장:**
- `agents.allowed_tools` → `jsonb` 컬럼 (`["kr_stock", "web_search", ...]`)
- tool-permission-guard Hook: `agent.allowedTools.includes(toolName)`
- 도구 리네임 시: `UPDATE agents SET allowed_tools = replace(...)::jsonb`

**DB 쿼리 캐싱:** 없음 (D8 유지). 에이전트 50명 = DB 행 50개, 조회 ≤ 1ms. D8 범위 내 재검토 불필요.

**Claude API · 도구 · Semantic 캐싱 (Epic 15 — D13 조기 구현):** 아래 별도 섹션 참조.

---

### Caching Architecture (Epic 15)

**3-레이어 캐싱 구조 — 런타임 실행 순서:**

```
사용자 메시지 수신 → agent-loop.ts
  ↓
[Layer 1] Semantic Cache 확인 (agent.enableSemanticCache=true만)
  → engine/semantic-cache.ts → getDB(companyId).findSemanticCache()
  → cosine similarity ≥ 0.95 AND TTL 24h 내: 즉시 반환 (LLM 미호출)
  → 미스/오류: graceful fallback → 계속
  ↓
[Layer 2] Prompt Cache 적용 LLM 호출
  → systemPrompt: [{ type:'text', text:soul, cache_control:{ type:'ephemeral' } }]
  → Anthropic 서버 캐시 히트: TTFT 85% 단축, 비용 기본 × 0.1
  → 도구 호출 발생 시 ↓
[Layer 3] Tool Cache 확인
  → lib/tool-cache.ts → withCache(toolName, ttlMs, fn)
  → 히트: 외부 API 미호출, 캐시 결과 반환
  → 미스: 외부 API 호출 → 캐시 저장
  → 오류: graceful fallback → 원본 함수 직접 실행 (NFR-CACHE-R1)
  ↓
LLM 응답 완성 → saveToSemanticCache (내부에서 CREDENTIAL_PATTERNS 마스킹 후 저장 — callee 처리, enableSemanticCache=true만)
  → 오류: 무시 + log.warn (세션 중단 없음)
```

**파일 배치 (D17~D20 — `epic-15-architecture-addendum.md` 참조):**

| 파일 | 위치 | E8 적용 | 역할 |
|------|------|---------|------|
| `engine/semantic-cache.ts` | `engine/` 내부 | ✅ E8 적용 (D19) | checkSemanticCache + saveToSemanticCache. agent-loop.ts 전용 |
| `lib/tool-cache.ts` | `lib/` (engine 밖) | ❌ E8 대상 외 (D18) | withCache() 래퍼 + LRU Map. 도구 핸들러에서 직접 import 가능 |
| `lib/tool-cache-config.ts` | `lib/` | ❌ | 도구별 TTL 등록 테이블 (7개 초기 도구) |

**멀티테넌시 격리 (D20):**
- Tool Cache 키: `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}` — companyId 누락 시 원본 함수 실행 (타입 강제)
- Semantic Cache: `getDB(companyId)` 프록시 + SQL `company_id = $1` 조건 필수
- 회사 간 캐시 교차 접근 구조적 불가

**보안 — D20 결정 (세부: `epic-15-architecture-addendum.md` D20 참조):**
- LLM `fullResponse`는 어떤 Hook도 sanitize하지 않음: `tool-permission-guard`(PreToolUse: 도구 실행 허가), `credential-scrubber`(PostToolUse: 도구 출력 민감 패턴 마스킹), Stop Hook(usage 토큰만)
- `saveToSemanticCache` 내부(callee)에서 `CREDENTIAL_PATTERNS` 정규식 직접 적용 필수 — raw LLM 응답 직접 저장 금지

**E8 경계 검증 — CI `engine-boundary-check.sh` 추가 패턴:**
```bash
grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \
  | grep -v 'engine/agent-loop.ts' \
  | grep -v 'engine/semantic-cache.ts'
# 0줄 = OK, 1줄+ = E8 VIOLATION
```

**Deferred (Phase 4+):**
- Redis 전환: 다중 서버 배포 시 `lib/tool-cache.ts` cacheStore 구현체만 교체 (withCache() API 유지)
- 1시간 TTL 자동 전환: 30일+ 히트율 데이터 축적 후 결정
- semantic_cache 에이전트별 격리: agent_id 컬럼 추가는 요건 발생 시

---

### Authentication & Security

**CLI 토큰 생명주기:**
- 등록: Admin이 CLI 토큰 입력 → [검증] → SDK 간단 query()로 유효성 확인
- 실행: agent-loop.ts에서 query(env: { ANTHROPIC_API_KEY: cliToken }) 주입
- 만료: 진행 중 세션 완료 허용, 새 세션만 차단 ("CLI 토큰이 만료되었습니다")
- 보안: query() 호출 후 토큰 변수 즉시 null (NFR-S2). Soul에 토큰 절대 주입 안 함 (SEC-6)

**에러 코드 체계:**

| 프리픽스 | 도메인 | 예시 |
|---------|--------|------|
| `AUTH_` | 인증/인가 | `AUTH_TOKEN_EXPIRED`, `AUTH_FORBIDDEN` |
| `AGENT_` | 에이전트 실행 | `AGENT_NOT_FOUND`, `AGENT_TIMEOUT`, `AGENT_SPAWN_FAILED` |
| `SESSION_` | 세션 관리 | `SESSION_LIMIT_EXCEEDED`, `SESSION_MEMORY_LIMIT` |
| `HANDOFF_` | 핸드오프 | `HANDOFF_DEPTH_EXCEEDED`, `HANDOFF_CIRCULAR`, `HANDOFF_TARGET_NOT_FOUND` |
| `TOOL_` | 도구 | `TOOL_PERMISSION_DENIED`, `TOOL_EXECUTION_FAILED` |
| `ORG_` | 조직 관리 | `ORG_SECRETARY_DELETE_DENIED`, `ORG_TIER_LIMIT_EXCEEDED` |

HTTP + SSE 양쪽에서 동일 코드 체계 사용.

### API & Communication Patterns

**API 응답 형식 (CLAUDE.md 준수):**
```typescript
// 성공
{ success: true, data: T }
// 실패
{ success: false, error: { code: string, message: string } }
```

**SSE 이벤트 시퀀스 (Pre-spawn 포함):**
```
event: accepted    ← 서버 수신 즉시 (50ms). 프론트: "명령 접수됨" + 로딩
event: processing  ← SDK spawn 완료 (~2초). 프론트: "비서실장 분석 중..."
event: handoff     ← call_agent 실행 시. 프론트: 트래커 업데이트
event: message     ← 응답 스트리밍 chunk
event: error       ← 에러 발생 시. { code, message, agentName }
event: done        ← 세션 완료. { costUsd, tokensUsed }
```

**WebSocket:** Phase 1 기존 이벤트 형식 유지. Phase 2에서 handoff 채널 Hook 기반 전환.

### Frontend Architecture

**상태 관리 패턴:**
- Zustand: 로컬 UI 상태 (사이드바 열림/닫힘, 모달)
- TanStack Query: 서버 상태 (에이전트 목록, 조직도, 비용). WebSocket 이벤트로 캐시 자동 무효화
- SSE 스트림: 채팅 메시지 (assistant-ui가 관리)

**비서 유무 분기 (Phase 2):**
- `hasSecretary: boolean` → 허브 레이아웃 분기
- 비서 있음: 채팅 입력만 (에이전트 목록 숨김)
- 비서 없음: 에이전트 선택 → 채팅. 50+ 에이전트 시 부서별 그룹핑 + lastUsedAt 정렬

**번들 최적화:** React.lazy() 동적 import. NEXUS/스케치바이브 라우트별 청크 분리.

### Infrastructure & Deployment

**배포 전략:**
- Docker graceful shutdown → 신규 컨테이너 시작 (NFR-O1)
- CI/CD runner 동일 서버 → 배포 시간대 에이전트 세션 가용 CPU 감소 주의
- Cloudflare CDN 캐시 퍼지 (GitHub Actions 자동)

**모니터링:**
- 로거: pino (우선) / consola (폴백). 어댑터 래핑으로 교체 비용 0
- child logger 패턴: SessionContext에서 sessionId/companyId/agentId 자동 주입
- 구조화 로그: `{ timestamp, level, sessionId, agentId, companyId, event, data }`
- 로그 보관: 30일 (NFR-LOG2)

**테스트 인프라:**

| 레이어 | 도구 | CI 실행 | 비용 |
|--------|------|---------|------|
| 단위 테스트 | bun:test | ✅ 매 커밋 | $0 |
| 모킹 통합 테스트 | bun:test + SDK 모킹 | ✅ 매 커밋 | $0 |
| 실제 SDK 통합 테스트 | bun:test + 실제 query() | 주 1회 스케줄 | ~$1/회 |
| A/B 품질 테스트 | 수동 10개 프롬프트 | 릴리스 전 | ~$5/회 |

모킹 전략: SDK query()만 모킹, CORTHEX 코드(call_agent/Hook/SessionContext/soul-renderer)는 전부 실제 실행.

### New Files Summary (Phase 1)

| 파일 | 줄 수 | 역할 |
|------|------|------|
| `engine/agent-loop.ts` | ~50 | SDK query() 래퍼 + SessionContext + pre-spawn 이벤트 |
| `engine/soul-renderer.ts` | ~40 | Soul 템플릿 변수 치환 (6종: agent_list, subordinate_list, tool_list, department_name, owner_name, specialty) |
| `engine/model-selector.ts` | ~20 | tier_configs → model 매핑 |
| `engine/sse-adapter.ts` | ~30 | SDK AsyncGenerator → 기존 SSE 이벤트 변환 (프론트 호환) |
| `engine/hooks/tool-permission-guard.ts` | ~20 | PreToolUse: 비허용 도구 deny |
| `engine/hooks/credential-scrubber.ts` | ~20 | PostToolUse: @zapier/secret-scrubber 기반 |
| `engine/hooks/output-redactor.ts` | ~15 | PostToolUse: 추가 패턴 마스킹 |
| `engine/hooks/delegation-tracker.ts` | ~30 | PostToolUse: call_agent 시 WebSocket 이벤트 |
| `engine/hooks/cost-tracker.ts` | ~20 | Stop: llm-cost-tracker 기반 비용 기록 |
| `tool-handlers/builtins/call-agent.ts` | ~40 | N단계 핸드오프 (SessionContext 복제 + 재귀 spawn) |
| `db/scoped-query.ts` | ~30 | getDB(companyId) 멀티테넌시 래퍼 |
| `db/logger.ts` | ~10 | pino/consola 어댑터 |
| **총** | **~325줄** | 기존 ~1,200줄 삭제 → **73% 순 삭제** |

### Decision Impact Analysis

**구현 순서 (Phase 1 내):**
1. 의존성 검증 (패키지 설치 + turbo build)
2. db/scoped-query.ts + db/logger.ts (기반)
3. engine/agent-loop.ts + engine/model-selector.ts (핵심)
4. engine/soul-renderer.ts (Soul 변수 치환)
5. engine/hooks/ × 5 (보안 체계)
6. tool-handlers/builtins/call-agent.ts (핸드오프)
7. engine/sse-adapter.ts (프론트 호환)
8. 라우트 import 변경 (agent-runner → agent-loop)
9. 통합 테스트 (3단계 핸드오프)
10. 회귀 테스트 (Epic 1~20)

**교차 의존성:**
- SessionContext는 agent-loop, call-agent, hooks, logger 전부에서 사용
- getDB는 soul-renderer, model-selector, call-agent에서 사용
- sse-adapter는 agent-loop의 출력을 변환 (agent-loop 완성 후 작성)

## Implementation Patterns & Consistency Rules

_Party Mode 4라운드, 17개 개선사항(P1~P17) 반영_

### 핵심 3줄 요약 (AI 에이전트용)

1. **모든 길은 agent-loop.ts로 통한다** — 진입점 + Hook + SSE. 우회 불가.
2. **DB는 getDB(ctx.companyId)로만** — 읽기 + 쓰기 전부. 직접 db 금지.
3. **engine/ 밖에서 engine 내부 건드리지 마** — 공개 API는 agent-loop.ts + types.ts 2개뿐.

### Pattern Categories Defined

**충돌 지점 22개, Engine 패턴 10개(E1~E10), Anti-Pattern 6개**

| 카테고리 | 충돌 수 | 위험도 |
|---------|--------|--------|
| Naming (기존 확립) | 4 | 낮음 |
| Engine 신규 패턴 | 6 | **높음** |
| Hook 패턴 | 4 | **높음** |
| SessionContext 전파 | 3 | **높음** |
| 테스트 패턴 | 3 | 중간 |
| 에러 코드 확장 | 2 | 중간 |

### Naming Patterns (기존 확립 — 변경 없음)

| 항목 | 규칙 | 예시 |
|------|------|------|
| DB 테이블 | snake_case, **복수형** | `agents`, `tier_configs`, `chat_messages` |
| DB 컬럼 | snake_case, FK는 `_id` 접미사 | `company_id`, `is_active`, `created_at` |
| DB Enum (JS) | camelCase | `userRoleEnum`, `agentStatusEnum` |
| DB Enum (SQL) | snake_case 문자열 | `'user_role'`, `'agent_status'` |
| API 엔드포인트 | `/api/{scope}/{resource}` 복수형 | `/api/admin/agents`, `/api/workspace/chat` |
| 쿼리 파라미터 | camelCase | `?departmentId=...&isActive=true` |
| 파일명 | kebab-case (예외: `App.tsx`) | `agent-loop.ts`, `cost-tracker.ts` |
| 컴포넌트 | PascalCase export | `ChatArea`, `CreateDebateModal` |
| Hook 파일 | `use-{feature}.ts` | `use-budget-alerts.ts` |
| Store 파일 | `{feature}-store.ts` | `auth-store.ts` → `useAuthStore` |
| 테스트 파일 | `{feature}.test.ts` in `__tests__/` | `auth.test.ts`, `crypto.test.ts` |
| JSON 필드 | camelCase | `{ companyId, isActive, createdAt }` |

### Type Boundary Map (P12)

```
@corthex/shared/types.ts  → TenantContext, UserRole, AgentTier, ApiResponse, ApiError
                             (프론트+서버 공용. CLI 토큰 관련 타입 절대 없음)

packages/server/src/types.ts → AppEnv (Hono Variables)
                                (서버 미들웨어 전용)

engine/types.ts             → SessionContext, PreToolHookResult, SSEEvent, RunAgentOptions
                             (server 내부 전용. shared로 re-export 금지 — P1)
```

### Engine Patterns (E1~E10)

#### E1: SessionContext 전파 규칙

```typescript
// engine/types.ts — readonly 타입 레벨 불변 (P13)
export interface SessionContext {
  readonly cliToken: string;
  readonly userId: string;
  readonly companyId: string;
  readonly depth: number;
  readonly sessionId: string;
  readonly startedAt: number;
  readonly maxDepth: number;
  readonly visitedAgents: readonly string[];
}
```

**규칙:**
- `Readonly` + `readonly string[]` → `ctx.depth = 1` 컴파일 에러
- 하위 전달 시 반드시 spread 복사: `{ ...ctx, depth: ctx.depth + 1, visitedAgents: [...ctx.visitedAgents, newId] }`
- agent-loop.ts 이외에서 SessionContext 생성 금지
- engine/types.ts는 **server 내부 전용** — shared re-export 금지 (P1)

#### E2: Hook 구현 표준

```typescript
// PreToolUse Hook
(ctx: SessionContext, toolName: string, toolInput: unknown) => PreToolHookResult

// PostToolUse Hook
(ctx: SessionContext, toolName: string, toolOutput: string) => string

// Stop Hook
(ctx: SessionContext, usage: { inputTokens: number; outputTokens: number }) => void
```

**규칙:**
- 모든 Hook의 첫 번째 파라미터는 `SessionContext`
- Hook 내부에서 다른 Hook 호출 금지
- Hook 에러 → `HOOK_PIPELINE_ERROR` 코드로 SSE error 발행 + 세션 중단 (P4)

#### E3: getDB(companyId) 사용 규칙 (P2 반영 — WRITE 포함)

```typescript
export function getDB(companyId: string) {
  if (!companyId) throw new Error('companyId required');
  return {
    // READ
    agents: () => db.select().from(agents).where(eq(agents.companyId, companyId)),
    departments: () => db.select().from(departments).where(eq(departments.companyId, companyId)),
    tierConfigs: () => db.select().from(tierConfigs).where(eq(tierConfigs.companyId, companyId)),

    // WRITE — companyId 자동 주입
    insertAgent: (data: Omit<NewAgent, 'companyId'>) =>
      db.insert(agents).values({ ...data, companyId }),
    updateAgent: (id: string, data: Partial<Agent>) =>
      db.update(agents).set(data).where(and(eq(agents.id, id), eq(agents.companyId, companyId))),
    deleteAgent: (id: string) =>
      db.delete(agents).where(and(eq(agents.id, id), eq(agents.companyId, companyId))),
    // Phase 1: engine이 사용하는 테이블만. 나머지 점진 추가.
  };
}
```

**규칙:**
- 비즈니스 로직: 반드시 `getDB(ctx.companyId)` 사용
- `db` 직접 import 허용: 마이그레이션, 시드, 시스템 쿼리만
- UPDATE/DELETE에도 companyId WHERE 자동 적용 → 타사 데이터 변경 불가

#### E4: Soul 템플릿 변수 규칙

6개 변수: `{{agent_list}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{department_name}}`, `{{owner_name}}`, `{{specialty}}`

**규칙:**
- `{{변수명}}` 이중 중괄호만 사용. soul-renderer.ts만 치환 수행.
- 치환 실패 시 빈 문자열 대체 (에러 아님)
- Soul에 사용자 입력 직접 삽입 절대 금지 (prompt injection)

#### E5: SSE 이벤트 발행 규칙

```typescript
type SSEEvent =
  | { type: 'accepted'; sessionId: string }
  | { type: 'processing'; agentName: string }
  | { type: 'handoff'; from: string; to: string; depth: number }
  | { type: 'message'; content: string }
  | { type: 'error'; code: string; message: string; agentName?: string }
  | { type: 'done'; costUsd: number; tokensUsed: number };
```

6개 이벤트 타입만 허용. 추가 시 프론트 동시 수정 필수.

#### E6: model-selector 티어 매핑

`tierConfig.modelPreference → SDK model string`. Phase 1~4 Claude 전용. 라우팅 로직 추가 금지 (llm-router.ts 동결).

#### E7: 병렬 핸드오프 제한 (P7)

**Phase 1: 순차 실행만.** 병렬 핸드오프(`Promise.all`)는 Phase 2+에서 branchId 기반 SSE 분리와 함께 구현.

```typescript
// Phase 1 ✅
for (const target of handoffTargets) {
  await runAgent(childCtx, target.soul, msg);
}

// Phase 2+ (branchId 추가 후)
await Promise.all(targets.map(t => runAgent({ ...childCtx, branchId: uuid() }, t.soul, msg)));
```

#### E8: engine/ 공개 API 경계 (P8)

**외부에서 import 허용하는 파일 2개만:**
- `engine/agent-loop.ts` — `runAgent()` 함수
- `engine/types.ts` — `SessionContext`, `SSEEvent` 등 타입

나머지(hooks/, soul-renderer, model-selector, sse-adapter)는 engine 내부 전용. **barrel export(index.ts) 만들지 않음.**

#### E9: SDK 모킹 표준 (P10)

```typescript
import { mock } from 'bun:test';

mock.module('@anthropic-ai/claude-agent-sdk', () => ({
  Agent: class {
    query = mock(() => ({
      async *[Symbol.asyncIterator]() {
        yield { type: 'text', content: 'mocked response' };
      }
    }));
  }
}));
// agent-loop.ts 함수 자체는 실제 실행 → call_agent, Hook, SessionContext 전파 전부 테스트됨
```

`@zapier/secret-scrubber`는 순수 함수 → 모킹 불필요, 실제 실행.

#### E10: engine 경계 CI 검증 (P15)

```bash
# ci/engine-boundary-check.sh
if grep -rn "from.*engine/hooks/" packages/server/src/routes/ packages/server/src/lib/; then
  echo "ERROR: Direct hook import from outside engine/"
  exit 1
fi
```

CI에서 자동 실행. engine/ 외부에서 hooks 직접 import 시 빌드 실패.

### Error Code Strategy (P3, P4, P9)

**에러 코드 서술 체계 통합:**

```typescript
// error-codes.ts — 레지스트리
export const ERROR_CODES = {
  // 기존 숫자 코드 → 서술 별명
  AUTH_001: 'AUTH_INVALID_CREDENTIALS',
  AUTH_002: 'AUTH_TOKEN_EXPIRED',
  AUTH_003: 'AUTH_FORBIDDEN',
  AGENT_001: 'AGENT_NOT_FOUND',
  RATE_001: 'RATE_LIMIT_EXCEEDED',

  // 신규 (서술 체계만)
  AGENT_SPAWN_FAILED: 'AGENT_SPAWN_FAILED',
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  SESSION_LIMIT_EXCEEDED: 'SESSION_LIMIT_EXCEEDED',
  HANDOFF_DEPTH_EXCEEDED: 'HANDOFF_DEPTH_EXCEEDED',
  HANDOFF_CIRCULAR: 'HANDOFF_CIRCULAR',
  HANDOFF_TARGET_NOT_FOUND: 'HANDOFF_TARGET_NOT_FOUND',
  TOOL_PERMISSION_DENIED: 'TOOL_PERMISSION_DENIED',
  HOOK_PIPELINE_ERROR: 'HOOK_PIPELINE_ERROR',
} as const;
```

**에러 메시지 하이브리드 (P9):**
- 기존 코드: 한국어 메시지 유지 (회귀 방지)
- 신규 engine 코드: 영어 메시지 (디버깅용)
- 프론트: `errorMessages` 맵에서 코드→한국어 변환
- 미등록 코드 fallback (P11): `"오류가 발생했습니다 (코드: {code})"`

### Pattern Verification Strategy (P14)

| 패턴 | 검증 방법 | 테스트 유형 |
|------|----------|-----------|
| E1 SessionContext 불변 | `readonly` 타입 | `tsc --noEmit` |
| E2 Hook 시그니처 | 타입 체크 + 단위 | 단위 테스트 |
| E3 getDB CRUD 격리 | companyId 격리 | 통합 (tenant-isolation.test.ts) |
| E4 Soul 변수 치환 | 결과 검증 | 단위 테스트 |
| E5 SSE 이벤트 타입 | 타입 유니언 | `tsc --noEmit` |
| E7 순차 핸드오프 | 3단계 E2E | 모킹 통합 |
| E8 engine/ 경계 | import 패턴 | CI 스크립트 (E10) |
| E9 SDK 모킹 | 모킹 통합 실행 | CI |

### Anti-Patterns (하지 말 것)

| Anti-Pattern | 왜 위험한가 | 올바른 패턴 |
|-------------|-----------|-----------|
| `db.select().from(agents)` 직접 쿼리 | companyId 누락 = 타사 데이터 노출 | `getDB(ctx.companyId).agents()` |
| `db.delete(agents).where(eq(agents.id, id))` 직접 삭제 | companyId 없이 삭제 = 타사 데이터 삭제 | `getDB(ctx.companyId).deleteAgent(id)` |
| `ctx.depth += 1` 직접 변경 | 병렬 핸드오프 시 공유 상태 오염 | `{ ...ctx, depth: ctx.depth + 1 }` |
| `import { Agent } from '@anthropic-ai/...'` engine 밖 | SDK 변경 시 전체 코드 수정 | `engine/types.ts` 인터페이스만 사용 |
| `import { credentialScrubber } from '../engine/hooks/...'` | 파이프라인 순서 깨짐 | agent-loop.ts만 Hook 호출 |
| `console.log(error)` | 비구조화, sessionId 누락 | `log.error({ event, data })` |
| Soul에 `` `${userInput}` `` 삽입 | Prompt injection | `{{변수명}}` + soul-renderer.ts |
| `engine/types.ts`를 shared re-export | 프론트에 cliToken 타입 노출 | server 내부 import만 |

### CLAUDE.md Update Items (구현 시 추가 — P16, P17)

구현 단계에서 CLAUDE.md에 아래 내용 추가:

```markdown
## Engine Patterns (Phase 1)
- 모든 길은 agent-loop.ts로 통한다 (Hook 우회 불가)
- DB는 getDB(ctx.companyId)로만 (읽기+쓰기)
- engine/ 밖에서 engine 내부 건드리지 마 (공개 API: agent-loop.ts + types.ts)
- 상세: _bmad-output/planning-artifacts/architecture.md → E1~E10
```

## Project Structure & Boundaries

_Party Mode 4라운드, 19개 개선사항(S1~S19) 반영_

### Document Navigation (S19)

1. Project Context Analysis (Step 2) — 요구사항, 인프라, 제약
2. Starter Template Evaluation (Step 3) — 기존 스택, 신규 의존성, 코드 처분
3. Core Architectural Decisions (Step 4) — D1~D21 (D17~D20 Epic 15 — `epic-15-architecture-addendum.md`)
4. Implementation Patterns (Step 5) — E1~E10, 에러 코드, Anti-Pattern
5. **Project Structure & Boundaries (Step 6)** — 디렉토리, 경계, 매핑
6. Validation (Step 7) — 완성도 체크

### Complete Project Directory Structure

```
corthex-v2/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml                    # 기존 + Phase 1: engine-boundary-check 추가
│   │   └── weekly-sdk-test.yml           # NEW Phase 1: 주1회 실제 SDK 통합 테스트
│   └── scripts/
│       └── engine-boundary-check.sh      # NEW Phase 1: E10 import 경계 검증 (S2)
│
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── index.ts                  # 기존 + Phase 1: graceful shutdown (S16)
│   │       ├── types.ts                  # 기존: AppEnv
│   │       │
│   │       ├── db/
│   │       │   ├── schema.ts             # 기존
│   │       │   ├── index.ts              # 기존
│   │       │   ├── migrations/           # 기존
│   │       │   ├── scoped-query.ts       # NEW Phase 1: getDB(companyId) (~30줄)
│   │       │   └── logger.ts             # NEW Phase 1: pino/consola 어댑터 (~10줄)
│   │       │
│   │       ├── engine/                   # NEW Phase 1: 에이전트 실행 엔진
│   │       │   ├── agent-loop.ts         # 단일 진입점 + 세션 레지스트리 (~50줄) — 공개 API
│   │       │   ├── types.ts              # SessionContext, SSEEvent — 공개 API (server 전용, S1)
│   │       │   ├── soul-renderer.ts      # 내부 전용 (~40줄)
│   │       │   ├── model-selector.ts     # 내부 전용 (~20줄)
│   │       │   ├── sse-adapter.ts        # 내부 전용 (~30줄)
│   │       │   └── hooks/                # 내부 전용
│   │       │       ├── tool-permission-guard.ts
│   │       │       ├── credential-scrubber.ts
│   │       │       ├── output-redactor.ts
│   │       │       ├── delegation-tracker.ts
│   │       │       └── cost-tracker.ts
│   │       │
│   │       ├── tool-handlers/builtins/
│   │       │   ├── call-agent.ts         # NEW Phase 1: N단계 핸드오프 (~40줄)
│   │       │   └── ...                   # 기존 125개 도구
│   │       │
│   │       ├── routes/
│   │       │   ├── admin/
│   │       │   │   ├── agents.ts         # 기존 + Phase 2: Soul CRUD
│   │       │   │   ├── tier-configs.ts   # NEW Phase 3
│   │       │   │   └── ...               # 기존
│   │       │   └── workspace/
│   │       │       ├── chat.ts           # 기존: 세션 REST CRUD (S3)
│   │       │       ├── hub.ts            # NEW Phase 1: SSE 스트리밍 진입점 (S3, S7)
│   │       │       └── ...               # 기존
│   │       │
│   │       ├── middleware/
│   │       │   ├── rate-limiter.ts       # NEW Phase 1: 세션 제한
│   │       │   └── ...                   # 기존 (auth, error, tenant, rbac)
│   │       │
│   │       ├── lib/
│   │       │   ├── error-codes.ts        # NEW Phase 1: 에러 코드 레지스트리 (~30줄)
│   │       │   └── ...                   # 기존
│   │       │
│   │       ├── services/                 # 처분 매트릭스 적용
│   │       │   ├── agent-runner.ts       # → Phase 1 교체 (engine/agent-loop.ts)
│   │       │   ├── delegation-tracker.ts # → Phase 1 교체 (engine/hooks/)
│   │       │   ├── chief-of-staff.ts     # → Phase 2 삭제
│   │       │   ├── llm-router.ts         # → 동결 (Phase 5+)
│   │       │   ├── trading/              # 불가침 (import 교체만 허용 — S12)
│   │       │   ├── telegram/             # 불가침 (import 교체만 허용 — S12)
│   │       │   └── selenium/             # 불가침
│   │       │
│   │       ├── mcp/                      # NEW Phase 4
│   │       │   └── sketchvibe-mcp.ts
│   │       │
│   │       └── __tests__/
│   │           ├── unit/
│   │           │   ├── soul-renderer.test.ts     # NEW Phase 1
│   │           │   ├── model-selector.test.ts    # NEW Phase 1
│   │           │   ├── scoped-query.test.ts      # NEW Phase 1
│   │           │   └── error-codes.test.ts       # NEW Phase 1
│   │           ├── integration/
│   │           │   ├── agent-loop.test.ts        # NEW Phase 1
│   │           │   ├── hook-pipeline.test.ts     # NEW Phase 1
│   │           │   ├── handoff-chain.test.ts     # NEW Phase 1
│   │           │   └── tenant-isolation.test.ts  # 기존 + Phase 1
│   │           ├── sdk/
│   │           │   └── real-sdk.test.ts          # NEW Phase 1 (주1회)
│   │           └── helpers/
│   │               ├── test-utils.ts             # 기존
│   │               └── sdk-mock.ts               # NEW Phase 1 (S4)
│   │
│   ├── app/                              # 허브 SPA
│   │   └── src/
│   │       ├── components/
│   │       │   ├── hub/                  # NEW Phase 2
│   │       │   └── chat/                 # 기존 + Phase 2
│   │       └── lib/
│   │           └── error-messages.ts     # NEW Phase 2 (S10: Phase 1→2 이동)
│   │
│   ├── admin/                            # 관리자 SPA
│   │   └── src/components/
│   │       ├── nexus/                    # NEW Phase 3: React Flow
│   │       └── sketchvibe/              # 기존 Cytoscape
│   │
│   ├── ui/                               # @corthex/ui
│   └── shared/                           # @corthex/shared (CLI 토큰 타입 없음)
│
├── Dockerfile                            # 기존 + Phase 1: 의존성
├── .dockerignore                         # 기존 + .github/, _bmad*, _poc/, _uxui* (S6)
└── CLAUDE.md                             # 구현 시: Engine Patterns 추가
```

### "불가침" 정의 명확화 (S12)

**불가침 = 비즈니스 로직/기능을 변경하지 않음**

| 허용 | 금지 |
|------|------|
| import 경로 변경 (agent-runner → agent-loop) | 트레이딩 로직 수정 |
| SessionContext 생성 코드 추가 | 텔레그램 메시지 포맷 변경 |
| 에러 핸들링 패턴 통합 | 기능 추가/제거 |

### runAgent() 호출자 전체 목록 (S11)

| # | 호출자 | 라우트/서비스 | Phase 1 수정 | SessionContext 소스 |
|---|--------|-------------|-------------|-------------------|
| 1 | 허브 채팅 | `routes/workspace/hub.ts` (NEW) | 신규 작성 | HTTP JWT → tenant |
| 2 | 텔레그램 봇 | `services/telegram/handler.ts` | import 교체 | 봇 설정 companyId |
| 3 | ARGOS 크론잡 | `services/argos/scheduler.ts` | import 교체 | 크론 설정 companyId |
| 4 | AGORA 토론 | `routes/workspace/agora.ts` | import 교체 | HTTP JWT → tenant |
| 5 | 자동매매 | `services/trading/executor.ts` | import 교체 | 트레이딩 설정 companyId |
| 6 | 스케치바이브 MCP | `mcp/sketchvibe-mcp.ts` | Phase 4 | MCP 컨텍스트 |

### Architectural Boundaries

```
외부 클라이언트 (브라우저)
    │
    ├─ HTTP ──→ Hono Routes ──→ Middleware (auth → tenant → rbac)
    │              │
    │              ├─ /api/admin/*     → getDB() → Response
    │              ├─ /api/workspace/* → getDB() → Response
    │              └─ /api/workspace/hub → engine/agent-loop → SSE Stream
    │
    └─ WebSocket ──→ 7채널 멀티플렉싱 ──→ 프론트 캐시 무효화
```

**의존성 규칙:**

| 레이어 | 의존 가능 | 의존 금지 |
|--------|----------|----------|
| routes/ | middleware/, lib/, engine/(공개 2개만), db/ | engine/hooks/, services/(교체 대상) |
| engine/ | db/scoped-query, db/logger, lib/websocket | routes/, middleware/, services/ |
| engine/hooks/ | engine/types, db/logger, 외부 라이브러리 | 다른 hook, engine/agent-loop |
| services/(불가침) | db/, lib/ | engine/ (독립 운영) |

### Phase 1 Change Summary (S14, S17)

| 구분 | 수 | 내역 |
|------|----|------|
| 새 파일 | ~20 | engine 7 + hooks 5 + call-agent + db 2 + error-codes + rate-limiter + hub.ts + 테스트 5 + sdk-mock + CI 2 |
| 수정 파일 | ~9 | telegram + argos + agora + trading + chat.ts + error.ts + Dockerfile + .dockerignore + deploy.yml |
| 삭제 파일 | 2 | agent-runner.ts + delegation-tracker.ts |
| **총** | **~31** | 신규 ~375줄, 삭제 ~1,200줄 = **순 -825줄 (69% 삭제)** |

### Phase 1 Regression Test Matrix (S15, S18)

| 영역 | 테스트 방법 | 자동화 | 필수 |
|------|-----------|--------|------|
| 허브 채팅 SSE | API 통합 테스트 | ✅ CI | ✅ |
| 3단계 핸드오프 | SDK 모킹 통합 | ✅ CI | ✅ |
| Hook 파이프라인 순서 | 단위 테스트 | ✅ CI | ✅ |
| getDB 테넌트 격리 | 통합 테스트 | ✅ CI | ✅ |
| Soul 변수 치환 | 단위 테스트 | ✅ CI | ✅ |
| SSE 이벤트 형식 호환 | 통합 테스트 | ✅ CI | ✅ |
| AGORA 토론 | API 테스트 | ✅ CI | ✅ |
| WebSocket 이벤트 | 통합 테스트 | ✅ CI | ✅ |
| 텔레그램 봇 | **수동** (실제 봇) | ❌ | ⚠️ 배포 후 |
| ARGOS 크론잡 | 수동 트리거 | ⚠️ 반자동 | ⚠️ 배포 후 |
| 자동매매 | **수동** (실제 API) | ❌ | ⚠️ 배포 후 |
| 기존 도구 125개 | 타입 체크 + 샘플 5개 | ⚠️ 부분 | ✅ |

**CI 자동화: 8개, 수동: 3개, 반자동: 1개**

### Requirements to Structure Mapping

**Phase 1 (엔진):**

| FR/NFR | 파일 위치 |
|--------|----------|
| FR1~10 Agent Execution | `engine/agent-loop.ts`, `engine/hooks/*`, `call-agent.ts` |
| FR38 CLI 토큰 전파 | `engine/types.ts` (SessionContext.cliToken) |
| FR4 N단계 핸드오프 | `tool-handlers/builtins/call-agent.ts` |
| FR9 순환 감지 | `engine/types.ts` (visitedAgents), `call-agent.ts` |
| SEC-1~6 보안 | `engine/hooks/*` |
| NFR-SC1 동시 20세션 | `middleware/rate-limiter.ts` |
| NFR-LOG1~3 로깅 | `db/logger.ts` |
| D1 멀티테넌시 | `db/scoped-query.ts` |
| D3 에러 코드 | `lib/error-codes.ts` |
| NFR-O1 Graceful shutdown | `engine/agent-loop.ts` (세션 레지스트리) |

### Cross-Cutting Concerns Mapping

| 관심사 | 관련 파일 |
|--------|----------|
| CLI 토큰 전파 | `engine/types.ts` → `agent-loop.ts` → `call-agent.ts` → hooks |
| 멀티테넌시 | `middleware/tenant.ts` → `db/scoped-query.ts` → 전체 라우트 |
| 실시간 이벤트 | `engine/hooks/delegation-tracker.ts` → `lib/websocket.ts` → 프론트 stores |
| 에러 투명성 | `lib/error-codes.ts` → `engine/sse-adapter.ts` → `app/lib/error-messages.ts` |
| 비용 추적 | `engine/hooks/cost-tracker.ts` → DB → admin 대시보드 |

### Weekly SDK Test CI (S8)

```yaml
# .github/workflows/weekly-sdk-test.yml
name: Weekly SDK Integration Test
on:
  schedule:
    - cron: '0 3 * * 1'  # 매주 월요일 03:00 UTC
  workflow_dispatch: {}
jobs:
  sdk-test:
    runs-on: self-hosted
    env:
      ANTHROPIC_API_KEY: ${{ secrets.CORTHEX_CLI_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - run: bun install
      - run: bun test packages/server/src/__tests__/sdk/
```

보안: self-hosted runner (같은 VPS), GitHub Secrets 마스킹, 테스트 코드에서 토큰 로그 금지.

## Architecture Validation Results

_Party Mode 3라운드, 13개 개선사항(V1~V13) 반영_

### Coherence Validation ✅

- **Decision Compatibility:** D1~D21 전부 호환 (D13 Epic 15 조기 구현, D17~D20 신규 캐싱 결정 — `epic-15-architecture-addendum.md` 참조). 충돌 없음.
- **Pattern Consistency:** E1~E10 전부 SessionContext 기반 일관. Naming 체계 통일.
- **Structure Alignment:** engine/ 위치 → SDK 의존성 server 국한. 타입 3파일 경계 명확.

### Requirements Coverage ✅

- **FR 72개:** 68/72 Phase 1~4 커버 + 4개 Phase 5+ Deferred (차단 없음 — V2)
- **NFR P0 19개:** 19/19 전부 커버 (보안 7개, 성능 3개, 확장성 4개, 외부 2개, 브라우저 1개, 운영 1개, 코드 1개)
- **Phase 5+ Deferred:** D14(토큰 풀 — SessionContext 변경 주의), D15(크로스 프로바이더), D16(API 버저닝)
- **Epic 15 조기 구현:** D13(Claude API · 도구 · Semantic 캐싱) — Important Decisions 이동, Phase 1부터 적용. D17~D20 신규 결정 + D21 Deferred(Redis 전환) — 세부: `epic-15-architecture-addendum.md`

### Implementation Readiness ✅

- **Decision Completeness:** D1~D21 전부 선택+근거+코드 예시 ✅ (D17~D20은 `epic-15-architecture-addendum.md`에 상세 기술)
- **Pattern Completeness:** E1~E10 코드 예시 + Anti-Pattern 8개 ✅
- **Structure Completeness:** 디렉토리 트리 + 호출자 6곳 + Phase 1 ~31파일 변경 ✅

### Process Statistics (V9)

| 항목 | 수치 |
|------|------|
| Steps | 7/7 완료 |
| Party Mode 라운드 | **~32** (Step 2: 6, 3: 5, 4: 4, 5: 4, 6: 4, 7: 3 + 이전 세션 6) |
| 개선사항 | **~54** (P1~P17 + S1~S19 + V1~V13 + 이전 5) |
| 결정 | D1~D21 (D13 조기 구현 + D17~D20 Epic 15 신규 — addendum 참조) |
| 패턴 | E1~E10 (10개) |
| Anti-Pattern | 8개 |

### Dependency Version Strategy (V1, V6)

- **0.x 패키지** (SDK `0.2.72`): exact pin, 수동 업데이트만
- **1.x+ 패키지**: `^` 허용 + `bun.lockb` lockfile 커밋 (V11)
- SDK 업데이트 절차: 릴리즈 노트 → PoC 8개 재실행 → 통과 시 bump

### UX Handoff Items (V5, V7)

UX Design 시작 시 입력으로 전달:

| 아키텍처 결정 | UX 영향 |
|-------------|--------|
| SSE 6개 이벤트 (E5) | accepted→processing→handoff→message→error→done UI 상태 설계 |
| 비서 유무 분기 | 허브 레이아웃 2종 (채팅만 vs 에이전트 선택+채팅) |
| 에이전트 50+ 그룹핑 | 부서별 + lastUsedAt 정렬 UI |
| 핸드오프 추적 | 실시간 from→to 트래커 표시 |
| 에러 투명성 | 핸드오프 실패 시 사용자 명시적 표시 |
| Phase 1 순차 핸드오프 | 병렬 분기 UI는 Phase 2+ |

### Architecture Completeness Checklist

**✅ Step 2 — Requirements Analysis**
- [x] 72 FR + 61 NFR 분석
- [x] 인프라 24GB RAM, 4코어 ARM64
- [x] 동시 세션 20 용량 분석
- [x] 교차 관심사 6개

**✅ Step 3 — Starter Template**
- [x] 브라운필드 + 기존 스택
- [x] Phase별 신규 의존성 15개
- [x] 코드 처분 매트릭스

**✅ Step 4 — Decisions**
- [x] D1~D21 (Critical 6 + Important 7(D13 포함) + Deferred 4(D14~D16,D21) + D17~D20 Epic 15 신규 — addendum 참조)

**✅ Step 5 — Patterns**
- [x] E1~E10 + Anti-Pattern 8개
- [x] 에러 코드 레지스트리 + 타입 경계 맵

**✅ Step 6 — Structure**
- [x] 완전한 디렉토리 트리
- [x] 호출자 6곳 + 회귀 테스트 매트릭스
- [x] Phase 1: ~31파일, 순 -825줄

**✅ Step 7 — Validation**
- [x] 전체 결정 호환성 검증
- [x] FR 72개 + NFR P0 19개 커버리지
- [x] 방어선 다중 확인 (CI + tsc + 코드리뷰)

### Readiness Assessment

**Overall: READY FOR IMPLEMENTATION**

**Confidence: HIGH** — 32라운드 파티, 54개 개선사항, PoC 8/8 검증 완료

**ROI (V13):** 코드 69% 감소 (1,200줄→375줄) + 기능 100% 유지 + 보안 강화 + 확장성 추가

### Post-Architecture Actions (V3, V10)

**즉시 실행 (아키텍처 완료의 일부):**
1. ~~CLAUDE.md Engine Patterns 추가~~ → 이 커밋에 포함
2. PRD 메모리 스펙 수정 — NFR-SC1(10→20), NFR-SC2(50→200MB), NFR-SC7(3→16GB), OPS-1(10→20), "4GB"→"24GB ARM64 4코어"

**다음 Pipeline 단계:**
1. UX Design → `/bmad-bmm-create-ux-design` (UX Handoff Items 참조)
2. Epics & Stories → `/bmad-bmm-create-epics-and-stories`
3. Phase 1 첫 스토리: 의존성 검증 (bun.lockb 추적 확인 포함 — V11)
