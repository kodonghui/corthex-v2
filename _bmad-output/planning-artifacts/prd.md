---
# v3 "OpenClaw" PRD Workflow — initialized 2026-03-20
# Previous: v2 PRD (11 steps complete, 2026-03-10)
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
workflowStatus: complete
completedDate: 2026-03-21
inputDocuments:
  # v3 PRIMARY sources
  - path: _bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md
    role: "PRIMARY — v3 Brief. 4 layers + sprint order + Go/No-Go 8개 + target users + success metrics"
  - path: _bmad-output/planning-artifacts/technical-research-2026-03-20.md
    role: "RESEARCH — Stage 1 Technical Research. 6 domains, 2100 lines, avg 8.91/10"
  - path: context-snapshots/planning-v3/stage-0-step-05-scope-snapshot.md
    role: "CONTEXT — Stage 0 decisions, sprint order, blocker conditions"
  - path: context-snapshots/planning-v3/stage-1-step-06-scope-snapshot.md
    role: "CONTEXT — Stage 1 synthesis, Go/No-Go matrix, risk registry"
  # v2 BASELINE sources (update, don't replace)
  - path: _bmad-output/planning-artifacts/prd.md
    role: "BASELINE — v2 PRD (this file). Update with v3 additions."
  - path: _bmad-output/planning-artifacts/architecture.md
    role: "BASELINE — v2 architecture (Hono+Bun, React+Vite, Neon PostgreSQL, pgvector)"
  - path: _bmad-output/planning-artifacts/v1-feature-spec.md
    role: "CONSTRAINT — v1 feature parity: if it worked in v1, it must work in v2/v3"
  # Structure
  - path: project-context.yaml
    role: "STRUCTURE — monorepo layout, codebase stats (485 API, 71 pages, 86 tables, 10,154 tests)"
  - path: _bmad-output/planning-artifacts/v3-corthex-v2-audit.md
    role: "AUTHORITY — code-verified v2 accurate numbers"
workflowType: 'prd'
workflowVersion: 'v3-update'
documentCounts:
  briefCount: 1
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 6
classification:
  projectType: saas_b2b
  typeComposition:
    web_app: 40%
    saas_b2b: 35%
    developer_tool: 25%
  domain:
    primary: ai-agent-orchestration
    secondary: workflow-automation
    tertiary: agent-intelligence
    differentiator: dynamic-org-management
  complexity: high
  complexityScore: 33/40
  complexityBreakdown:
    architecture_change: 3
    external_dependency: 5
    db_schema_change: 3
    realtime_impact: 4
    auth_security: 4
    regression_scope: 5
    ux_change: 5
    team_capability: 4
  projectContext: brownfield
  changeType: v3-feature-addition
  v3Layers:
    layer0: "UXUI 완전 리셋 (전 Sprint 병행)"
    layer1: "OpenClaw 가상 사무실 (PixiJS 8, Sprint 4)"
    layer2: "n8n 워크플로우 연동 (Docker, Sprint 2)"
    layer3: "Big Five 성격 시스템 (Sprint 1)"
    layer4: "에이전트 메모리 3단계 (Sprint 3)"
  sprintOrder: "Pre-Sprint(Phase 0) → Sprint 1(Layer 3) → Sprint 2(Layer 2) → Sprint 3(Layer 4) → Sprint 4(Layer 1)"
  topRisks:
    - "R1: PixiJS 8 bundle 200KB gzipped 한도 (tree-shaking 필수)"
    - "R6: n8n Docker ARM64 리소스 경합 (4G/2CPU 제한)"
    - "R7: personality_traits JSONB prompt injection 위험"
    - "R8: AI sprite 재현 불가능성"
  scope: "v2 전체 유지 + v3 Layer 0~4 추가"
# v2 legacy metadata (preserved)
v2PartyModeRounds: 3
v2Decisions: 10
v2StepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
terminology:
  # v2 terms (preserved)
  허브(Hub): "메인 채팅 UI (구: 사령관실)"
  트래커(Tracker): "핸드오프 실시간 추적 UI (구: 사이드바 위임 추적)"
  라이브러리(Library): "벡터 검색 + 음성 브리핑 (구: 정보국)"
  티어(Tier): "에이전트 N단계 등급 (정수). 모델/비용/권한 결정 (구: 계급)"
  핸드오프(Handoff): "에이전트 간 작업 전달 (구: 위임)"
  Soul: "에이전트 시스템 프롬프트 (성격+능력+오케스트레이션 규칙)"
  call_agent: "MCP 도구 기반 에이전트 간 핸드오프 메커니즘"
  CLI토큰: "Human의 Claude CLI Max 구독 인증 토큰"
  NEXUS: "AI 조직 관리 UI (노드 기반 시각적 편집)"
  스케치바이브: "Claude Code 개발 협업 캔버스 (관리자 전용)"
  비서: "Human 전용 에이전트. 자연어 명령 라우팅"
  비서실장: "루트 라우팅 에이전트. 사용자 의도 → 적절한 에이전트 배정"
  Hook: "SDK 이벤트 콜백. PreToolUse/PostToolUse/Stop"
  ARGOS: "크론잡 스케줄러"
  얇은래퍼: "SDK-비즈니스 로직 최소 추상화 (agent-loop.ts)"
  query: "Claude Agent SDK 핵심 함수. 에이전트 실행 세션 생성"
  # v3 new terms
  OpenClaw: "PixiJS 8 기반 가상 사무실 시각화. 에이전트 상태를 픽셀아트 캐릭터로 실시간 표시. CEO /office 라우트"
  BigFive성격: "OCEAN 모델 5축 (외향성/성실성/개방성/친화성/신경성). 각 0-100 정수 슬라이더 (Stage 1 Decision 4.3.1). soul-renderer.ts extraVars로 Soul에 주입. 4-layer sanitization: Key Boundary→API Zod→extraVars strip→Template regex"
  에이전트메모리: "3단계 아키텍처: 관찰(observations) → 반성(memory-reflection.ts 크론) → 계획(agent_memories[reflection] pgvector 검색). Option B 기존 확장 방식"
  n8n: "오픈소스 워크플로우 자동화 도구. Docker 2.12.3 ARM64 VPS 배포. 포트 5678 내부망 전용, Hono 리버스 프록시 /admin/n8n/*"
  observations: "에이전트 실행 raw 로그 테이블 (신규). agent_memories의 INPUT 계층. 대체가 아닌 추가"
  memory-reflection.ts: "Reflection 크론 전용 파일 (신규). memory-extractor.ts와 분리 — race condition 방지, E8 경계 준수"
  Subframe: "메인 디자인 도구. Phase 0 아키타입 테마 선택 → Sprint별 UXUI 구현"
---

# Product Requirements Document - corthex-v2

**Author:** CORTHEX Team
**Date:** 2026-03-10

## Project Discovery

### Project Classification

<!-- v2 분류 (보존): developer_tool 40% / web_app 30% / saas_b2b 30%, complexity 29/40 -->
<!-- v3 업데이트: 2026-03-20, GATE Option B 선택 (사장님 결정) -->

- **Project Type:** SaaS B2B Platform (가중치: web_app 40% / saas_b2b 35% / developer_tool 25%)
- **Domain:** AI Agent Orchestration (1차) + Workflow Automation (2차, n8n) + Agent Intelligence (3차, Big Five + Memory)
- **Differentiator:** Dynamic Org Management (시장 유일 — Soul = 오케스트레이션 로직) + Agent Personality & Memory (에이전트가 개성을 갖고 성장)
- **Complexity:** High (33/40점 — 8축 정량 평가, v2 29/40에서 상승)
- **Project Context:** Brownfield (v3 Feature Addition — v2 검증된 기반 위 4가지 핵심 능력 + Layer 0 UXUI 리셋 추가, 삭제 없음)

### Detection Signals

**SaaS B2B 분류 근거 (v2 유지):**
- Multi-tenant: companyId 기반 데이터 격리. tier_configs 테이블 (회사별)
- Permission model: 비서 소유권(owner_user_id), 도구 권한 Hook화
- Integrations: Claude Agent SDK + NotebookLM MCP + pgvector

**AI Agent Orchestration 도메인 근거 (v2 유지):**
- call_agent MCP 도구 패턴: 에이전트를 다른 에이전트의 "도구"로 호출 (N단계 핸드오프)
- Soul 기반 오케스트레이션: 프롬프트가 곧 라우팅 규칙 (코드 수정 0)
- N단계 티어 시스템: 정수 기반 tier + 회사별 tier_configs
- 비서 선택제: Human별 비서 유무 선택
- 경쟁 차별점: CrewAI(정적 코드) / LangGraph(그래프 노드) / CORTHEX(동적 Soul)

**v3 신규 도메인 근거:**

**Workflow Automation (2차):**
- n8n Docker 2.12.3 (ARM64 네이티브): 드래그앤드롭 워크플로우 자동화
- Hono 리버스 프록시 `/admin/n8n/*` → 포트 5678 (내부망 전용) <!-- 정확한 라우트 경로는 Architecture에서 확정: /admin/n8n/* vs /api/workspace/n8n/* -->
- 기존 ARGOS 크론잡 유지 — n8n은 신규 자동화 전용
- 범위: Telegram/Discord/Slack/웹훅/크론 자동화

**Agent Intelligence (3차):**
- Big Five 성격 (OCEAN): personality_traits JSONB (0-100 정수 스케일, Stage 1 Decision 4.3.1 확정), soul-renderer.ts extraVars 확장
- 3단계 메모리: observations(raw) → memory-reflection.ts(크론) → agent_memories[reflection](pgvector)
- Option B 채택 — 기존 agent_memories 확장, 대체 아님 (Zero Regression)

**High Complexity 근거 (v3: 33/40, v2: 29/40):**

| 축 | v2 | v3 | v3 근거 |
|---|------|------|--------|
| 아키텍처 변경 범위 | 5/5 | 3/5 | v2: 파괴적(엔진 교체). v3: 순수 추가(신규 테이블+서비스). Additive only |
| 외부 의존성 리스크 | 4/5 | 5/5 | PixiJS 8.17.1 + @pixi/react 8.0.5 + n8n Docker 2.12.3 + Tiled 1.11 + AI 스프라이트 생성기 — 5개 신규. n8n Docker OOM kill 리스크(R6 Critical: 860MB idle/4GB peak, VPS 24GB에서 PG+Bun+CI와 경합) |
| DB 스키마 변경 | 3/5 | 3/5 | observations 테이블 신규, memoryTypeEnum 확장, personality_traits JSONB. v2와 유사 규모 |
| 실시간 시스템 영향 | 4/5 | 4/5 | /ws/office WebSocket 채널 추가 (16→17, `shared/types.ts:484-501` 기준 현재 16채널), PixiJS 60fps 실시간 렌더링 |
| 인증/보안 변경 | 3/5 | **4/5** | **3개 신규 공격 표면**: n8n 6-layer 보안(Docker network→Hono proxy→API key→webhook HMAC→tag isolation→rate limiting) + personality 4-layer sanitization(Key Boundary→API Zod→extraVars strip→Template regex) + /ws/office JWT+token bucket(10 msg/s per userId) |
| 회귀 테스트 범위 | 5/5 | 5/5 | Zero Regression 절대 규칙 — 485 API + 10,154 테스트 전체 통과 필수 |
| UX 변경 범위 | 3/5 | **5/5** | **UXUI 완전 리셋(428 color-mix) + OpenClaw /office 신규 + n8n 관리 페이지 + Big Five 슬라이더 UI — 대규모. 71개 페이지 Sprint별 점진적 전환(빅뱅 아님, Brief §4 "Sprint별 해당 기능 페이지 UXUI 병행")** |
| 팀 역량 요구 | 2/5 | **4/5** | **PixiJS 8 게임 시각화 + Tiled 타일맵 + 스프라이트 애니메이션 = 완전 신규 도메인(학습 곡선 Sprint 4 일정 영향)**, Docker 운영, AI 에셋 파이프라인, 4-layer sanitization — Solo dev + AI 체제에서 높은 부담 |

### Sprint 의존성 (v3)

```
Pre-Sprint (Phase 0):
  - 디자인 토큰 확정 (Subframe 아키타입)
  - Neon Pro 업그레이드 (🔴 NOT STARTED — 전 Sprint 블로커, Stage 1 Step 6 §6.4)
  - 사이드바 IA 선행 결정 (n8n 관리 + /office read-only + /office 배치)
  ↓ [선행 조건: Sprint 1 착수 전 완료 필수]
Sprint 1 (Layer 3: Big Five 성격, 독립·낮음)
Sprint 2 (Layer 2: n8n 워크플로우, 독립·중간)
  ↓ [게이팅: Sprint 2 종료까지 Layer 0 ≥60% 미달 시 레드라인]
Sprint 3 (Layer 4: 에이전트 메모리, 복잡·높음)
Sprint 4 (Layer 1: OpenClaw PixiJS, 에셋 선행 필요)
  ↓ [블로커: Go/No-Go #8 에셋 품질 승인]
  ↓ [하드 한도: PixiJS 번들 < 200KB gzipped (Brief §4, Go/No-Go #5, Stage 1 Step 2/4/5/6 일관)]

Layer 0 (UXUI 리셋): 전 Sprint 병행 (인터리브, Sprint별 점진적 전환)
```

> v2 Phase 의존성 (보존 참고):
> Phase 1(엔진, 2주) → Phase 2(오케스트레이션, 3주) → Phase 3(티어, 2주), Phase 4(라이브러리) 병렬
> 크리티컬 패스: Phase 1→2→3 = 7주, 총 9주 — **v2 완료됨**

### 요구사항 유형 분리

**v3 (전부 Product Requirement — 엔진 교체 완료):**

| Sprint | 레이어 | 유형 | 설명 |
|--------|--------|------|------|
| Pre-Sprint | Layer 0 | Product | 디자인 토큰 확정 (Subframe 아키타입) |
| Sprint 1 | Layer 3 | Product | Big Five 성격 (0-100 정수 슬라이더), extraVars 확장 |
| Sprint 2 | Layer 2 | Product | n8n Docker 연동, 관리 페이지 |
| Sprint 3 | Layer 4 | Product | 3단계 메모리 (관찰→반성→계획) |
| Sprint 4 | Layer 1 | Product | OpenClaw PixiJS 가상 사무실 |
| 병행 | Layer 0 | Product | UXUI 완전 리셋 (428 color-mix, dead button) |

> v2 요구사항 유형 (보존 참고):
> Phase 1=Engineering, Phase 2~4=Product — **v2 완료됨**

### 핵심 사용자 여정 (v3 Sprint별)

**Sprint 1 — 여정 A (Big Five 성격 설정):**
Admin → 에이전트 편집 → 역할 프리셋 선택("전략 분석가", "고객 서비스" 등) 또는 Big Five 슬라이더 5개 직접 조정 (성실성 95, 외향성 30 — 0-100 정수 스케일, Stage 1 Decision 4.3.1) → 각 슬라이더 위치별 행동 예시 툴팁 확인("성실성 90+: 체크리스트 자동 생성, 꼼꼼한 검증") → 저장 → 에이전트 응답 톤 변화 체감
- *접근성*: 슬라이더 키보드 조작(Arrow keys), 현재 값 aria-valuenow, 특성 설명 aria-label

**Sprint 2 — 여정 B (n8n 워크플로우):**
Admin → n8n 관리 페이지 → 드래그앤드롭으로 "매일 9시 영업 보고서 → Slack" 워크플로우 생성 → 활성화 → 자동 실행 확인

**Sprint 3 — 여정 C (에이전트 성장):**
CEO → Chat에서 보고서 태스크 지시 → 에이전트 첫 실행 (수정 3회 필요) → **중간 피드백**: Dashboard에서 "이번 주 반성(Reflection) 3건 생성", "유사 태스크 성공률 65%→80%" 지표 확인 → 1개월 후 동일 태스크 (수정 0회) → "이 에이전트가 성장했다"
- *중간 체감 설계*: Reflection 생성 알림(Notifications), 성공률 추이 차트(Performance 페이지), 에이전트별 학습 이력 요약

**Sprint 4 — 여정 D (OpenClaw 가상 사무실):**
CEO → /office 접속 → 픽셀 캐릭터들이 책상에서 타이핑/도구 사용/말풍선 → 한눈에 AI 조직 운영 상태 파악 → WOW 모먼트
- *접근성*: aria-live 텍스트 대안 패널("마케팅 에이전트: 현재 보고서 작성 중", "CIO: idle") — 스크린리더/키보드 전용 사용자 지원
- *반응형*: 모바일/태블릿 — 간소화 리스트 뷰(캐릭터 비활성, 상태 텍스트만 표시), 데스크톱만 PixiJS 풀 캔버스. 모바일 배터리/성능 고려
- *Admin /office*: read-only 관찰 뷰 (태스크 지시 불가, Stage 0 Step 3 결정)

### 코드 영향도 요약 (v3)

- 삭제: 0줄 (Zero Regression — 기존 코드 삭제 없음)
- 신규: ~3,000줄 추정 (4가지 핵심 능력 + Layer 0)
- 수정: ~1,500줄 (Layer 0 UXUI 71개 페이지 색상 리팩터 + soul-renderer.ts + memoryTypeEnum + 사이드바 IA)
- **순 변화: 약 4,500줄 (신규 3,000 + 수정 1,500)**

**Sprint별 코드 규모 추정:**

| Sprint | 레이어 | 신규 (줄) | 수정 (줄) | 주요 파일 |
|--------|--------|----------|----------|----------|
| Pre-Sprint | Layer 0 시작 | ~200 | ~300 | themes.css, tailwind config, ESLint 룰 |
| Sprint 1 | Layer 3 (Big Five) | ~400 | ~100 | personality_traits migration, 슬라이더 UI, soul-renderer.ts extraVars |
| Sprint 2 | Layer 2 (n8n) | ~600 | ~100 | Docker 설정, Hono 프록시 라우트, n8n 관리 페이지, n8n 결과 뷰 |
| Sprint 3 | Layer 4 (Memory) | ~800 | ~200 | observations 테이블, memory-reflection.ts, Reflection 크론, Performance 성장 지표 |
| Sprint 4 | Layer 1 (PixiJS) | ~1,000 | ~100 | @pixi/react 컴포넌트, /ws/office 채널, Tiled 타일맵, 접근성 텍스트 패널 |
| 병행 | Layer 0 (UXUI) | — | ~700 | 71개 페이지 색상 토큰 전환 (Sprint별 점진적) |

> Sprint 4(PixiJS)가 가장 무거움 — PixiJS 학습 곡선 + 에셋 파이프라인 + 스프라이트 애니메이션. Sprint 3(Memory)이 두 번째 — 3단계 파이프라인 + 크론 + pgvector.

### v3 Feature Audit — GATE 결정 (2026-03-20)

v2 71개 페이지 전수 조사 후 사장님 최종 결정:

| # | 기능 | 결정 | 근거 |
|---|------|------|------|
| 1 | Admin workflows 페이지 | 🔴 제거 | n8n 관리 페이지(API-only, Hono reverse proxy)로 교체 |
| 2 | CEO workflows 페이지 | 🔴 제거 | n8n 결과 뷰(읽기 전용)로 교체 |
| 3 | agent-marketplace | 🟡 유지 | Zero Regression |
| 4 | template-market | 🟡 유지 | Zero Regression |
| 5 | agent-reports | 🟡 유지 | Zero Regression |
| 6 | trading | 🟢 유지 | Zero Regression |
| 7 | costs (Admin+CEO 전부) | 🔴 **전면 제거** | CLI Max 월정액 — 비용 추적 의미 없음. API 전환 계획 없음 |

**추가 제거 대상**: 비용 대시보드, 비용 관리 페이지, budget 페이지, Reflection 비용 한도 개념 — 전부 월정액 모델과 무관.

<!-- v2 사용자 여정 + 코드 영향도 (Phase 1~4) — v2 완료됨. 상세: v2 PRD 원본 참고.
  Phase 1: 변화 없음 (기존 동작 보존)
  Phase 2: 비서 있는 CEO 여정 + 비서 없는 직원 여정
  Phase 3: Admin NEXUS 조직 설계 여정
  Phase 4: 음성 브리핑 여정
  코드 영향: 삭제 ~1,200줄 → 신규 ~195줄 (순 ~1,000줄 삭제) — v2 완료됨
-->

## Executive Summary

### v2 현재 규모 (코드 기반 검증 — 2026-03-20 감사)

> 아래 수치는 `_bmad-output/planning-artifacts/v3-corthex-v2-audit.md` 에서 소스 코드 직접 계산. 추정치 사용 금지.

| 항목 | 확정 수치 | 파일 위치 |
|------|----------|---------|
| API 엔드포인트 | **485개** (Admin 25파일 + Workspace 41파일 + Auth 2파일) | `packages/server/src/routes/` |
| 프론트엔드 페이지 | **71개** (Admin 27 + CEO앱 42 + Login 2) | `packages/admin/src/`, `packages/app/src/` |
| DB 테이블 | **86개** + Enum **29개** | `packages/server/src/db/schema.ts` |
| Built-in 도구 | **68개** (Common 15 + Domain 15 + E5 3 + E7 4 + 핸들러 66) | `packages/server/src/tool-handlers/builtins/` |
| WebSocket 채널 | **16개** (chat-stream, agent-status, notifications, messenger, conversation, activity-log, strategy-notes, night-job, nexus, debate, cost, command, delegation, tool, strategy, argos) | `shared/types.ts:484-501` |
| 백그라운드 워커 | **6개** (Job Queue, Argos Engine, Cron Execution, Trigger Worker, SNS Schedule Checker, Semantic Cache Cleanup) | `packages/server/src/index.ts` |
| 마이그레이션 | **60개** | `packages/server/src/db/migrations/` |
| 테스트 파일 | **393개** (.test.ts) | `packages/server/src/__tests__/` |
| 테스트 케이스 | **10,154개** (test() 호출) | `packages/server/src/__tests__/` |

---

<!-- v2 비전 (보존): "조직도를 그리면 AI 팀이 움직인다." — v3에서 재정의됨 (GATE 결정 2026-03-20, Option C) -->

CORTHEX는 AI 에이전트 조직을 설계·운영·성장시키는 SaaS B2B 플랫폼이다. **비전: "AI 조직이 살아 숨 쉰다 — 보이고, 생각하고, 성장한다."**

v2는 485개 API, 68개 built-in 도구, 16개 WebSocket 채널, 10,154개 테스트로 검증된 엔터프라이즈 기반을 구축했다. v3 "OpenClaw"는 이 기반 위에 4가지 레이어를 추가하여 AI 조직에 **투명성**(OpenClaw 가상 사무실), **개성**(Big Five 성격), **기억**(3단계 메모리), **자동화**(n8n 워크플로우)를 부여한다.

**왜 지금인가:** 2026년 3월, Claude·Google·OpenAI가 동시에 에이전트 SDK를 공식 출시했다. 에이전트 실행 엔진이 commodity화된 지금이 application 레이어 혁신을 잡을 적기다. CLI Max 월정액으로 에이전트를 무제한 실행할 수 있으며, 경쟁자(CrewAI, LangGraph)는 전부 개발자 전용이다. "비개발자가 AI 조직을 설계하고, 그 조직이 눈에 보이고, 경험에서 배운다"는 시장이 아직 비어있다.

**핵심 전략 3원칙:**
1. **위임**: SDK가 해결한 문제(도구 루프, 세션, Hook)는 SDK에 맡긴다
2. **집중**: CORTHEX 고유 가치(call_agent 핸드오프, Soul 오케스트레이션, NEXUS, OpenClaw, Big Five, Memory)에만 코드를 쓴다
3. **격리**: SDK 접점을 `agent-loop.ts` 1개 파일(363줄 — SDK 직접 접촉은 `messages.create()` 호출부 약 50줄, 나머지는 Hook·캐시·위임 로직)로 한정한다. SDK 버전은 0.2.x로 고정하고, 메이저 업데이트는 이 파일에서 격리 대응한다. 벤더 교체 시 1파일만 수정

**안전망:** v2 기반(Phase 1~4) 완료 후 v3 레이어 추가. 각 레이어는 독립 Sprint으로 실패해도 기존 기능 무영향.

### What Makes This Special

<!-- v2 원본 (3개): Soul 오케스트레이션, call_agent N단계, NEXUS 시각 설계 — v3에서 6개로 확장 (GATE Option C, 2026-03-20) -->

**1. 투명성 — OpenClaw 가상 사무실 (블랙박스 해결)**
CEO가 `/office`를 열면 픽셀아트 캐릭터들이 실시간으로 일하는 모습이 보인다. idle→working→speaking→tool_calling→error — 텍스트 로그를 읽을 수 없는 비개발자도 AI 조직의 상태를 한눈에 파악한다. AI Town이 시뮬레이션인 반면, OpenClaw는 실제 `agent-loop.ts` 실행 로그를 픽셀 동작으로 변환한다 — 같은 엔진, 다른 창문.

**2. 개성 — Big Five 성격 시스템 (획일성 해결)**
에이전트마다 OCEAN 5축(0-100 정수) 성격을 부여한다. 성실성 95인 에이전트는 꼼꼼한 체크리스트 방식으로, 외향성 80인 에이전트는 열정적 톤으로 응답한다. 같은 LLM, 다른 개성 — 코드 분기 없이 Soul extraVars 주입만으로 구현. 4-layer sanitization(Key Boundary→API Zod→extraVars strip→Template regex)으로 prompt injection 차단.

**3. 성장 — 3단계 메모리 (정체 해결)**
관찰(observations) → 반성(memory-reflection.ts 크론) → 계획(pgvector 시맨틱 검색). 어제 실수한 에이전트가 오늘은 같은 실수를 반복하지 않는다. v2 `agent_memories` 테이블을 확장(Option B)하여 기존 데이터 단절 없이 학습 능력을 추가한다.

**4. 자동화 — n8n 워크플로우 연동 (반복 업무 해결)**
n8n Docker 컨테이너로 드래그앤드롭 자동화. 코드 없이 "매일 9시 영업 보고서 → Slack 전송" 워크플로우 완성. 기존 버그 투성이 워크플로우 자체 구현 코드를 n8n으로 완전 대체. 기존 ARGOS 크론잡은 그대로 유지.

**5. 설계 — NEXUS 시각적 조직 설계 (비개발자 대상)**
CEO가 드래그&드롭으로 부서 생성, 에이전트 배치, 티어 설정, 핸드오프 관계를 시각적으로 설계한다. 저장 즉시 반영, 배포 불필요. "비개발자 + 시각적 오케스트레이션" 시장의 유일한 플레이어.

**6. 오케스트레이션 — Soul 편집 = 행동 변화 (시장 유일)**
에이전트의 Soul(시스템 프롬프트)이 곧 라우팅 규칙이다. Soul을 편집하면 워크플로우가 즉시 바뀐다. 코드 수정 0줄, 배포 0회. call_agent MCP 도구로 비서→팀장→전문가 N단계 핸드오프 구현 — SDK 1단계 한계를 도구 레벨에서 돌파.

### 대상 사용자

<!-- v2 페르소나 (CEO 김대표, 팀장 박과장, 투자자 이사장, Admin) — v3에서 재정의 (Brief §2 Target Users) -->

> ⚠️ **온보딩 순서**: Admin이 항상 첫 번째 사용자. CEO 앱은 Admin 설정 완료 후 접근 가능 (v2 교훈).

| 구분 | 페르소나 | 앱 | 온보딩 순서 | v3 핵심 가치 |
|------|---------|-----|------------|-------------|
| **Primary #1** | **이수진** (32세, AI 시스템 운영 담당) | Admin | **1번째** | Big Five 슬라이더, n8n 관리, 메모리 설정, NEXUS 조직 설계 |
| **Primary #2** | **김도현** (38세, SaaS 스타트업 대표, 비개발자) | CEO 앱 | **2번째** | `/office` 가상 사무실, 에이전트 성장 체감, Hub, Chat |
| Secondary | 일반 직원 | CEO 앱 일부 | — | v2 기능 유지 (Messenger, Agora) |

**Admin 이수진의 v3 문제:**
- "에이전트가 다 똑같이 말한다" → Big Five 성격 슬라이더
- "워크플로우를 만들려면 코드를 짜야 한다" → n8n 드래그앤드롭
- "에이전트가 어제 실수를 오늘도 반복" → 메모리 Reflection 설정

**CEO 김도현의 v3 문제:**
- "AI 팀이 지금 뭘 하는지 모르겠다" → OpenClaw `/office` 실시간 시각화
- "에이전트가 발전이 없다" → 3단계 메모리로 성장 체감
- "워크플로우 요청이 개발팀 경유" → n8n 결과 뷰로 자동화 확인

**v2 페르소나 유지 (변경 없음):**
| 사용자 | CORTHEX 해결 | 감정적 페이오프 |
|--------|-------------|----------------|
| CEO 김대표 (1인 사업가) | NEXUS 조직도 + 자연어 지휘 + 음성 브리핑 | *'혼자가 아니다. 내 팀이 있다.'* |
| 팀장 박과장 (중소기업 관리자) | 비서 유무 선택 + N단계 티어 + 권한 관리 | *'AI를 팀 인프라로 만들었다.'* |
| 투자자 이사장 (개인 투자자) | CIO 산하 4명 병렬 분석 + 종합 보고서 | *'4명의 애널리스트를 고용한 효과.'* |

### 기대 효과

**v2 기술 지표 (Phase 1~4, 완료):**

| 지표 | 목표 |
|------|------|
| 오케스트레이션 코드 | 기존 5개 파일(약 1,200줄) → 신규 7개 파일(약 195줄)로 대체 |
| 새 워크플로우 추가 시 코드 수정 | 0줄 (Soul 편집만으로 해결) |
| SDK 업데이트 시 수정 범위 | `agent-loop.ts` 1개 파일 (363줄) |
| N단계 티어 비용 절감 | 목표: 기존 3티어 대비 60%+ 추가 절감 |

**v3 기술 지표 (Sprint 1~4):**

| 지표 | Sprint | 목표 |
|------|--------|------|
| Big Five 성격 반영률 | Sprint 1 | 성격 설정 에이전트 vs 미설정 에이전트 응답 톤 차이 A/B 테스트 통과 |
| n8n 워크플로우 생성 시간 | Sprint 2 | "Slack 알림" 워크플로우 10분 이내 (코드 0줄) |
| Reflection 크론 성공률 | Sprint 3 | 에이전트당 일 1회 Reflection 실행 성공 90%+ |
| 에이전트 반복 오류 감소 | Sprint 3 | 동일 태스크 10회 중 이전 실수 반복 3회 이하 (30%-) |
| OpenClaw 상태 동기화 지연 | Sprint 4 | agent-loop 실행 → 픽셀 상태 반영 ≤ 2초 |
| PixiJS 번들 크기 | Sprint 4 | ≤ 200KB gzipped (Brief §4, Go/No-Go #5) |

**사용자 경험 지표 (v2+v3 통합):**

| 지표 | 목표 |
|------|------|
| NEXUS 첫 조직 설계 완료 시간 | 5분 이내 |
| 비서 라우팅 정확도 | 첫 시도 80%+ (Soul 튜닝 후 95%+) |
| 의미 검색 히트율 | 키워드 대비 관련 문서 30%+ 추가 발견 |
| 음성 브리핑 생성 성공률 | 90%+ |
| Big Five 슬라이더 첫 설정 시간 | 에이전트 1명당 ≤ 2분 (프리셋 선택 시 ≤ 30초) |
| `/office` 첫 WOW 모먼트 | 페이지 로드 ≤ 3초, 에이전트 활동 즉시 가시 |
| Admin 온보딩 완료 | ≤ 15분 (회사설정→조직→에이전트→CEO초대) |

### 핵심 리스크

<!-- v2 리스크 (Phase 1~4): call_agent 토큰 전파, 서비스 삭제 회귀, 메타데이터 주입 — v2 완료, 해결됨 -->

**v3 리스크 레지스트리** (Stage 1 Research Synthesis §6.3 기준, severity 내림차순):

| ID | 리스크 | 심각도 | Sprint | 완화 전략 | 잔여 |
|----|--------|--------|--------|----------|------|
| R6 | n8n Docker 리소스 경합 (4GB RAM, VPS 15.5GB 여유) | 🔴 Critical | 2 | Docker compose: `memory: 4G`, `cpus: '2'`, OOM restart. VPS RAM 17%만 사용 | Low |
| R7 | personality_traits JSONB prompt injection | 🟠 High | 1 | 4-layer sanitization: Key Boundary → API Zod(0-100) → extraVars newline strip → Template regex (Stage 1 Step 2, L306과 동일 순서) | Very Low |
| R1 | PixiJS 8 학습 곡선 (팀 경험 없음) | 🟠 High | 4 | @pixi/react 추상화, OfficeStateStore 디커플링, Stage 1 패턴 문서화 | Medium |
| R3 | pgvector HNSW 인덱스 호환성 | 🟡 Medium | 3 | Neon native pgvector, Epic 10 검증된 인프라, migration `IF NOT EXISTS` | Low |
| R4 | UXUI 428 color-mix 재발 | 🟡 Medium | 병행 | ESLint 차단 규칙, 디자인 토큰 중앙화, Subframe MCP 토큰 준수 | Low |
| R8 | AI 스프라이트 재현 불가능성 | 🟡 Medium | 4 | Scenario.gg seed 파라미터, Sprint 0 전량 생성, git 버전 관리 | Medium |
| R9 | soul-renderer.ts `\|\| ''` silent failure | 🟢 Low | 1 | Key-aware fallback: PERSONALITY_KEYS Set 감지 → warning log + default 주입 | Very Low |

**v3 추가 리스크** (critics 피드백 + GATE 결정):
| 리스크 | 심각도 | 완화 |
|--------|--------|------|
| CLI Max 월정액 모델 변경 (Anthropic 과금 정책 변동) | 🟡 Medium | 비용 모델이 v3 전제 — 변경 시 costs 기능 재도입 검토 필요 |
| Solo dev + PixiJS 신규 도메인 (팀 역량 4/5) | 🟠 High | Sprint 4를 마지막에 배치, 실패해도 기존 기능 무영향 |

### Phase 로드맵

*상세 Phase별 기능셋, 리스크 완화, 오픈소스 전략은 → Product Scope 섹션 참조.*

**v2 Phase 로드맵 (완료):**
일정: 낙관 7주 / 목표 9주 / 비관 12주. 크리티컬 패스: Phase 1(2주) → Phase 2(3주) → Phase 3(2주) = 7주

**v3 Sprint 로드맵 (신규):**

```
Pre-Sprint (Phase 0, 1~2일)
  → Neon Pro 업그레이드 (🔴 전 Sprint 블로커)
  → 사이드바 IA 선행 결정
  → 테마 결정 (Sprint 1 착수 선행 조건)
  ↓
Sprint 1 (Layer 3: Big Five 성격, 독립·낮음)
  → personality_traits JSONB, 슬라이더 UI, soul-renderer extraVars
  ↓
Sprint 2 (Layer 2: n8n 워크플로우, 독립·중간)
  → n8n Docker, Hono 프록시, 관리 페이지, 결과 뷰
  ↓ [게이팅: Layer 0 UXUI ≥60% 미달 시 레드라인]
Sprint 3 (Layer 4: 에이전트 메모리, 복잡·높음)
  → observations 테이블, memory-reflection.ts 크론, pgvector 검색
  ↓
Sprint 4 (Layer 1: OpenClaw PixiJS, 에셋 선행)
  ↓ [블로커: Go/No-Go #8 에셋 품질 승인]
  ↓ [하드 한도: PixiJS 번들 < 200KB gzipped]
  → PixiJS 8 + @pixi/react, /ws/office, 5상태 시각화

Layer 0 (UXUI 리셋): 전 Sprint 병행 (점진적 전환)
```

**Go/No-Go 게이트 8개** (Brief §4):
| # | 게이트 | Sprint | 검증 방법 |
|---|--------|--------|----------|
| 1 | **Zero Regression** (485 API + 10,154 테스트) | **전체** | `bun test` — 매 Sprint 완료 시 전체 통과 필수 |
| 2 | renderSoul() extraVars 주입 검증 | 1 | 빈 문자열 = FAIL (soul-renderer.ts L45 `\|\| ''` 대응) |
| 3 | **n8n 보안 3중 검증** | 2 | (1) port 5678 외부 차단, (2) tag filter 교차 접근 차단, (3) webhook HMAC 변조 거부 |
| 4 | **Memory Zero Regression** + 신규 파이프라인 | 3 | 기존 memory-extractor 테스트 전부 통과 + observation→reflection E2E |
| 5 | PixiJS 번들 < 200KB (204,800 bytes) | 4 | CI gzip 측정 (`if [ "$GZIPPED" -gt 204800 ]`) |
| 6 | Subframe 디자인 토큰 추출 완료 | 1 | tokens.css 생성 확인 |
| 7 | Reflection 크론 실행 성공 + 비용 검증 | 3 | agent_memories에 reflection 레코드 존재 + Haiku 비용 ≤ $0.10/일 (Stage 1: ~$0.06/day) |
| 8 | 에셋 품질 승인 (PM) | 4 | Scenario.gg 스프라이트 5종 사장님 승인 |

## Success Criteria

### User Success

#### v2 베이스라인 (검증 완료)

| 성공 기준 | 측정 지표 | 목표 | 딜라이트 모먼트 |
|----------|----------|------|----------------|
| CEO가 AI 조직을 설계할 수 있다 | NEXUS에서 '부서 2개 + 에이전트 5명 + 티어 3단계' 설계 완료 시간 (첫 사용, 튜토리얼 없이) | ≤ 10분 | *'내가 만든 조직이 움직인다'* |
| 자연어로 복잡한 작업이 완료된다 | 비서 라우팅 정확도: 의도한 에이전트에 2홉 이내 도달 | 첫 시도 80%+, Soul 튜닝 후 95%+ | *'한 마디에 보고서가 나왔다'* |
| Soul 편집으로 워크플로우가 바뀐다 | Soul에 명시적 규칙 추가 후 다음 10회 요청 중 해당 행동 수행 횟수 | 8/10회+ (80%+) | *'코드 없이 바꿨다'* |
| 비서 없이 직접 사용 가능 | 에이전트 선택 → 결과까지 클릭 수 + 적합 에이전트 식별 시간 | ≤ 3클릭, ≤ 10초 | *'바로 시킨다'* |
| 음성 브리핑 수신 | E2E: NotebookLM 생성 + 텔레그램 전송 | 생성 ≤ 3분, 전송 ≤ 30초, 총 ≤ 4분. 성공률 90%+ | *'지하철에서 듣는다'* |
| 관련 문서를 빠짐없이 찾는다 | 10개 쿼리 테스트셋으로 키워드 vs 의미 검색 A/B | 의미 검색이 키워드 대비 관련 문서 3건 중 1건+ 추가 발견 | *'반도체 문서가 나온다'* |
| 엔진 교체 후 응답 품질 유지 | 동일 10개 프롬프트 기존/신규 엔진 A/B 블라인드 평가 | 신규 ≥ 기존 (품질 동등 이상) | — |
| 핸드오프 과정이 투명하다 | 허브 사이드바 실시간 핸드오프 추적 | 모든 핸드오프 단계 + 현재 에이전트 + 경과 시간 표시 | *'누가 뭘 하는지 보인다'* |
| 에러 시 명확한 피드백 | 에이전트 실패 시 사용자 메시지 | '○○가 응답 못 함 → △△가 나머지로 종합' 형식. 블랙박스 에러 0건 | — |
| 초기 설정이 쉽다 | Admin 첫 회사 설정 완료 시간 (부서+에이전트+Human+CLI 토큰) | ≤ 15분 (기본 Soul 템플릿 제공) | — |

#### v3 신규 (Sprint 정렬)

| 성공 기준 | 측정 지표 | 목표 | Sprint | 딜라이트 모먼트 |
|----------|----------|------|--------|----------------|
| Big Five 성격으로 에이전트가 달라진다 | 성격 설정 vs 미설정 에이전트 응답 톤 A/B | 블라인드 평가 구분 성공 | 1 | *'성격을 바꿨더니 말투가 바뀌었다'* |
| Big Five 슬라이더가 직관적이다 | 에이전트 1명 성격 설정 시간 | ≤ 2분 (프리셋 ≤ 30초) | 1 | *'슬라이더 5개로 성격이 만들어진다'* |
| n8n으로 워크플로우를 쉽게 만든다 | "Slack 알림" 워크플로우 완성 시간 | ≤ 10분, 코드 0줄 | 2 | *'드래그만 했는데 자동화가 됐다'* |
| 마케팅 콘텐츠 자동 생성 | 주제 입력 → 카드뉴스+숏폼 생성 완료 시간 | ≤ 15분 (사람 승인 제외) | 2 | *'주제 하나로 인스타+틱톡+유튜브가 동시에'* |
| AI 도구 엔진을 Admin이 선택한다 | 이미지/영상 엔진 설정 → 다음 n8n 실행 반영 | 설정 변경 후 즉시 반영 100% | 2 | *'엔진을 바꿨더니 퀄리티가 달라졌다'* |
| 에이전트가 같은 실수를 안 한다 | 동일 태스크 10회 중 이전 실수 반복 횟수 | ≤ 3회 (30%-) | 3 | *'어제 실수를 오늘은 안 한다'* |
| CEO가 AI 팀 활동을 본다 | `/office` 페이지 로드 + 에이전트 활동 즉시 가시 | 로드 ≤ 3초, 상태 동기화 ≤ 2초 | 4 | *'내 AI 팀이 일하는 게 보인다'* |
| CEO 앱 네비게이션이 간결하다 | 사이드바 메뉴 항목 수 (페이지 합치기 반영) | 기존 대비 6개+ 감소 | 병행 | *'메뉴가 깔끔해졌다'* |

### Business Success

#### v2 베이스라인 마일스톤 (검증 완료)

| 기간 | 성공 지표 | 구체적 목표 |
|------|----------|-----------|
| MVP-A 직후 (2주) | 기존 기능이 SDK 위에서 동작 | Epic 1~20 회귀 PASS + 응답 품질 A/B 동등 |
| MVP-B 직후 (5주) | Soul 기반 오케스트레이션 실현 | 비서/비서없음 양쪽 동작 + 5개 서비스 삭제 완료 |
| 1개월 후 | 개발 속도 개선 | 새 에이전트 추가 시 코드 0줄 수정 (3건으로 검증) |
| 1개월 후 | 유지보수 단일 파일 | SDK 관련 수정이 agent-loop.ts 1파일에서만 발생 |
| 6개월 후 | 확장성 | 에이전트 50명+ 조직에서 성능 저하 없음 |

<!-- 삭제: "3개월 후 비용 최적화" — CLI Max 월정액, 비용 추적 불필요 (GATE 2026-03-20) -->
<!-- 삭제: "3개월 후 사용자 만족" — v3 Sprint 마일스톤으로 이동 -->

#### v3 Sprint 마일스톤

| 시점 | 성공 지표 | 구체적 목표 |
|------|----------|-----------|
| Pre-Sprint 완료 | 인프라 준비 | Neon Pro 업그레이드 + 디자인 토큰 확정 + 사이드바 IA 확정 |
| Sprint 1 완료 | Big Five 성격이 동작 | A/B 블라인드 통과 + renderSoul extraVars 검증 + 프리셋 템플릿 3개+ |
| Sprint 2 완료 | n8n 자동화 + 마케팅 동작 | 마케팅 프리셋 E2E 성공 + n8n 보안 3중 통과 + AI 도구 엔진 Admin 설정 반영 |
| Sprint 3 완료 | 에이전트 메모리 동작 | Reflection 크론 성공 90%+ + 반복 오류 30%- + Haiku 비용 ≤ $0.10/일 |
| Sprint 4 완료 | OpenClaw 가상 사무실 동작 | PixiJS < 200KB gzipped + 상태 동기화 ≤ 2초 + `/office` WOW |
| 전체 완료 | 사용자 만족 | CEO 김도현 + Admin 이수진 직접 피드백: '이전보다 낫다' |

**실패 기준 (트리거 → 대응):**

#### v2 실패 트리거 (유지)

| 실패 조건 | 판단 시점 | 대응 전략 |
|----------|----------|----------|
| Phase 1 DoD 2/4 이하 | 2주차 끝 중간 점검 | 하이브리드 전략 (agent-loop 유지 + 기존 서비스 병행) |
| Phase 1 > 4주 | 4주차 | 하이브리드 확정. Soul 전환은 Phase 2에서 점진적 |
| 비서 라우팅 < 50% | Phase 2 2주차 | 1) Soul에 명시적 라우팅 규칙 → 2) 에이전트 태그 차별화 → 3) 룰 기반 프리라우팅 (~20줄) |
| call_agent 3단계 실패 | Phase 1 1주차 | 1) env 명시 전달 → 2) 환경변수 클리닝 → 3) 2단계 핸드오프로 축소 |
| Soul 품질 < 기존 | Phase 2 3주차 | 1) 구조화된 Soul 템플릿 (3-Phase 절차 명시) → 2) 특정 에이전트 하이브리드 |

<!-- 삭제: "비용 절감 미달" — CLI Max 월정액, 비용 추적 불필요 (GATE 2026-03-20) -->

#### v3 실패 트리거 (신규)

| 실패 조건 | 판단 시점 | 대응 전략 |
|----------|----------|----------|
| Sprint N > 예상의 2배 소요 | 해당 Sprint 중간 | Sprint 독립 실패 격리 — 해당 Sprint 기능을 "실험적" 태그, 다음 Sprint 영향 차단 |
| Big Five A/B 차이 감지 불가 | Sprint 1 완료 | 프롬프트 강화: OCEAN 기술 문구 3단계 확대 → 여전히 불가 시 기본 프리셋만 제공 |
| n8n Docker OOM 3회+ | Sprint 2 중 | Docker 메모리 한도 조정 (4G→6G). 불가 시 VPS 스케일 검토 |
| PixiJS 번들 > 200KB, 1주간 해결 불가 | Sprint 4 중 | tree-shaking 재시도 → 불가 시 Canvas 2D 대안 전환 |
| 마케팅 워크플로우 실패율 > 30% | Sprint 2 완료 후 | AI 엔진 fallback 순서 재정의 + 프리셋 단순화 |
| 마케팅 외부 API 장애 (이미지/영상/나레이션) | Sprint 2 중 | 각 외부 API에 n8n Error Workflow 패턴 적용: timeout 30초 + retry 2회 + fallback 엔진 자동 전환 (예: Kling 장애 → Sora 2) |
| Sprint 2 스코프 과부하 (n8n 기본 + 마케팅) | Sprint 2 1주차 | 마케팅 파이프라인을 Sprint 2.5로 분리 가능 — Sprint 2는 n8n 기본 연동만, 마케팅 프리셋은 Sprint 3 전에 독립 미니 스프린트로 |

### Technical Success

#### v2 기술 기준 (검증 완료)

| 기준 | 목표 | 측정 |
|------|------|------|
| 코드 축소 | 5파일(약 1,200줄) → 7파일(약 195줄) | `wc -l` |
| SDK 격리 | SDK import가 agent-loop.ts에서만 | `grep -r "claude-agent-sdk"` |
| call_agent 3단계 핸드오프 | 비서→CIO→전문가 E2E ≤ 60초 (각 단계 ≤ 15초) | 통합 테스트 타이머 |
| Hook: tool-permission-guard | 비허용 도구 호출 100% 차단 | 차단 테스트 10건 PASS |
| Hook: credential-scrubber | API 키 패턴 100% 필터 | 10개 패턴 주입 → 전부 마스킹 |
| Hook: delegation-tracker | WebSocket 이벤트 지연 ≤ 100ms | 타임스탬프 측정 |
| Hook: output-redactor | 민감 패턴 100% 마스킹 | 패턴 주입 테스트 |
| DB 마이그레이션 | enum→integer 전후 데이터 100% 보존 + 롤백 무손실 | 카운트 비교 |
| 실시간 핸드오프 추적 | Hook 기반 WebSocket이 기존 허브 UI와 호환 | 사이드바 핸드오프 표시 |
| API 응답 시간 | 기존 P95 ±10% 이내 (베이스라인 Phase 1 전 측정) | 서버 메트릭 |
| CLI 토큰 전파 | 핸드오프 체인 전체에서 최초 명령자 토큰 사용 | 핸드오프 체인 audit 로그 검증 |
| 메모리 | messages.create() 세션당 ≤ 50MB (Oracle VPS 24GB 기준) | 프로파일링 |
| 동시 세션 | 최소 10개 동시 messages.create() 처리 | 부하 테스트 |
| SDK 호환 | 0.2.72 ~ 0.2.x 패치 자동 호환 | 버전 테스트 |
| graceful degradation | SDK 프로세스 비정상 종료 시 에러 메시지 + 자동 재시도 1회 | crash 시뮬레이션 |

<!-- 삭제: "Hook: cost-tracker" — CLI Max 월정액, 비용 추적 불필요 (GATE 2026-03-20) -->

#### v3 기술 기준 (Go/No-Go 통합 + Sprint 정렬)

| 기준 | 목표 | Sprint | Go/No-Go # |
|------|------|--------|-----------|
| **Zero Regression** | 485 API + 10,154 테스트 전체 PASS | **전체** | #1 |
| renderSoul extraVars 검증 | 빈 문자열 = FAIL, personality_* 5개 개별 extraVars 주입 100% | 1 | #2 |
| 디자인 토큰 추출 | tokens.css 생성 + Subframe 디자인 시스템 준수 | 1 | #6 |
| n8n 보안 3중 검증 | (1) port 5678 외부 차단, (2) tag filter 교차 접근 차단, (3) webhook HMAC 변조 거부 | 2 | #3 |
| 마케팅 워크플로우 E2E | 주제 입력→AI 리서치→카드뉴스+숏폼 생성→사람 승인→멀티 플랫폼 게시 전체 체인 성공 | 2 | 신규 |
| AI 도구 엔진 설정 API | `GET /api/company/:id/marketing-settings` → n8n Switch 노드 반영 확인 | 2 | 신규 |
| Memory Zero Regression + E2E | 기존 memory-extractor 테스트 전부 통과 + observation→reflection E2E | 3 | #4 |
| Reflection 크론 + 비용 검증 | 크론 실행 성공 + Haiku 비용 ≤ $0.10/일 (Stage 1 추정: ~$0.06/day) | 3 | #7 |
| PixiJS 번들 크기 | < 200KB gzipped (204,800 bytes) CI 게이트: `if [ "$GZIPPED" -gt 204800 ]` | 4 | #5 |
| 에셋 품질 승인 | Scenario.gg 스프라이트 5종 사장님 승인 | 4 | #8 |
| 페이지 통합 회귀 | 합쳐진 페이지(6건)에서 기존 기능 100% 동작, 라우트 redirect 정상 | 병행 | 신규 |
| 접근성 (a11y) | Big Five 슬라이더: aria-valuenow + 키보드 조작 (←→ 키). `/office`: aria-live 텍스트 대안 패널. 모바일: PixiJS desktop-only, 리스트 뷰 간소화 | 1, 4, 병행 | 신규 |

### 지표 우선순위

**🔴 P0 (매 Sprint 추적, 실패 시 중단):** 10개
1. Zero Regression — 485 API + 10,154 테스트 (Go/No-Go #1, 전체)
2. Epic 1~20 회귀 PASS (베이스라인)
3. 응답 품질 A/B 동등 (베이스라인)
4. Hook 4개 정량 기준 통과 (베이스라인, cost-tracker 제외)
5. 비서 라우팅 정확도 80%+ (베이스라인)
6. SDK import 격리 — agent-loop.ts 1파일 (베이스라인)
7. renderSoul extraVars 주입 검증 (Go/No-Go #2, Sprint 1)
8. n8n 보안 3중 검증 (Go/No-Go #3, Sprint 2)
9. Memory Zero Regression + E2E (Go/No-Go #4, Sprint 3)
10. PixiJS 번들 < 200KB gzipped (Go/No-Go #5, Sprint 4)

**🟡 P1 (해당 Sprint부터 추적):** Big Five A/B 통과, n8n 트리거 성공 95%+, 마케팅 워크플로우 E2E, AI 도구 엔진 설정, Reflection 크론 성공 90%+, `/office` WOW (로드 ≤ 3초), 에셋 품질 승인, 디자인 토큰 추출, 페이지 통합 회귀, Admin 온보딩 ≤ 15분, API P95, 메모리 ≤ 50MB, 동시 세션 10개+, DB 무결성

**🟢 P2 (장기 데이터 수집):** 반복 오류 30%- (6개월), 마케팅 콘텐츠 성과 추적, 에이전트 50명+ 확장성

### Measurable Outcomes

**MVP-A (Phase 1) 완료 시 반드시 달성:**
1. ✅ agent-loop.ts messages.create() → 허브 에이전트 응답 수신
2. ✅ Hook 4개 전부 정량 기준 통과 (cost-tracker 제외)
3. ✅ call_agent 3단계 핸드오프 E2E ≤ 60초
4. ✅ Epic 1~20 회귀 PASS + 응답 품질 A/B 동등

**v3 Sprint별 완료 기준:**
1. ✅ Sprint 1: Big Five A/B 블라인드 통과 + renderSoul extraVars 검증 + 디자인 토큰 추출
2. ✅ Sprint 2: 마케팅 프리셋 E2E + n8n 보안 3중 + AI 도구 엔진 Admin 설정 반영
3. ✅ Sprint 3: Reflection 크론 90%+ + 반복 오류 30%- + Haiku ≤ $0.10/일
4. ✅ Sprint 4: PixiJS < 200KB + `/office` 상태 동기화 ≤ 2초 + 에셋 품질 승인

**전체 "성공" 선언 기준 (v2+v3 통합):**

v2:
- 기존 5개 서비스 코드에서 완전 삭제됨
- NEXUS에서 조직 생성 → call_agent로 동작 (E2E)
- '삼성전자 투자' → '반도체 시장 전망' 반환
- 음성 브리핑 → 텔레그램 전송
- 스케치바이브 CLI MCP → Claude Code에서 캔버스 읽기/쓰기 동작

v3:
- Big Five 슬라이더 설정 → 응답 톤 변화 A/B 확인
- n8n 마케팅 프리셋: 주제 입력 → 카드뉴스+숏폼 생성 → 멀티 플랫폼 게시
- Reflection 크론 → 에이전트 메모리 활용 → 반복 오류 감소 체감
- `/office` 접속 → 에이전트 실시간 활동 시각화
- Admin AI 도구 엔진 설정 변경 → 다음 n8n 실행에서 반영
- CEO 앱 사이드바: 합쳐진 메뉴 구조로 간결화 (14→6개 그룹, FR-UX1)

## Product Scope

### MVP-A: 엔진 검증 (Phase 1, 2주)

**가치 증명:** '기존 기능이 SDK 위에서 동작한다'

**신규 파일:**
- `engine/agent-loop.ts` — messages.create() 래퍼 + CLI 토큰 주입
- `engine/hooks/tool-permission-guard.ts` — 도구 권한 차단
- `engine/hooks/credential-scrubber.ts` — 크레덴셜 필터
- `engine/hooks/delegation-tracker.ts` — 핸드오프 WebSocket
- `engine/hooks/output-redactor.ts` — 출력 검열
- `tool-handlers/builtins/call-agent.ts` — 에이전트 간 핸드오프

**수정 파일:**
- `routes/agent-*.ts` — import 경로 변경
- `services/llm-router.ts` — 모델 배정 간소화

**안 건드림:** 기존 5개 서비스 (안전망 유지), DB 스키마, UI 코드 전체

**테스트:** 단위(7파일) + 통합(3단계 핸드오프) + 회귀(Epic 1~20)

### MVP-B: 비전 검증 (Phase 2, 3주)

**가치 증명:** 'Soul = 오케스트레이션이 동작한다'

**포함:**
- 비서/매니저 Soul 기본 템플릿
- 허브 UX 2종 (비서 있음/없음)
- DB: agents에 `is_secretary`, `owner_user_id` 추가
- 관리자 콘솔 비서 할당 UI
- 기존 5개 서비스 삭제 (검증 후)

**테스트:** 기능(비서 양쪽) + 삭제 검증(전 기능 회귀)

### Growth-A: 시각화 (Phase 3, 2주)

**가치 증명:** '비개발자가 조직도로 AI를 설계한다'

**포함:**
- `tier_configs` 테이블 + 마이그레이션 (enum→integer)
- NEXUS 조직도 UI (드래그&드롭)
- 티어 관리 UI (N단계 생성/편집)

**테스트:** 성능(50+ 노드) + 마이그레이션(데이터 무결성)

### Growth-B: 지능화 + 개발 협업 (Phase 4, 2주, Phase 2~3과 병렬 가능)

**가치 증명:** '문서를 이해하고 음성으로 브리핑한다' + 'Claude Code로 캔버스와 코드를 동시 조작한다'

**포함:**
- pgvector 확장 + embedding 컬럼
- Gemini Embedding API 연동
- knowledge-injector.ts 수정 (Jaccard → cosine)
- NotebookLM MCP 연동
- **스케치바이브 CLI MCP 서버** (`sketchvibe-mcp.ts`, 약 80줄) — Claude Code CLI ↔ 브라우저 캔버스 양방향 연동 복원
  - `@modelcontextprotocol/sdk` 기반 TypeScript Stdio MCP 서버
  - 4개 도구: `read_canvas`, `update_canvas`, `request_approval`, `list_sketches`
  - 기존 Hono API(sketches.ts) 위에 얇은 래퍼 — 신규 코드 약 130줄
  - 서버: `POST /workspace/sketches/approve` 엔드포인트 추가 (약 20줄)
  - Claude Code 등록: `claude mcp add sketchvibe -- bun run sketchvibe-mcp.ts`
  - v1의 핵심 가치 복원: Admin이 Claude Code에서 코드 분석 → 캔버스에 아키텍처 시각화 → 캔버스 수정 → 코드 반영 (양방향)

**테스트:** A/B(10개 쿼리) + E2E(음성→텔레그램) + MCP 연결(CLI→캔버스 읽기/쓰기/승인)

### Phase 5: v3 OpenClaw — 4대 기능 (신규, 2026-03-20 확정)

> 사장님 결정: 패치로 수습 불가 → 기존 테마 전부 폐기 → 새 기능 4개 추가 + 완전 리디자인
> 규칙: 기존 엔진(agent-loop.ts) 변경 없음. 기존 485개 API 유지. 기존 86개 테이블 유지. 새것만 추가.

---

#### Feature 5-1: OpenClaw 가상 사무실 (PixiJS 8)

**목적:** 에이전트 실행 상태를 픽셀아트 캐릭터로 실시간 시각화. CEO가 "누가 지금 무엇을 하는지" 직관적으로 확인.

**기술 스택:**
- `PixiJS 8` + `@pixi/react` — 픽셀아트 렌더링 (WebGL 기반, Canvas 폴백)
- Tiled JSON 타일맵 — 사무실 배경 레이아웃
- 스프라이트 애니메이션 — 에이전트별 상태 애니메이션

**에이전트 상태 매핑:**
| 엔진 상태 | 시각화 애니메이션 | 표시 |
|----------|----------------|------|
| idle | 캐릭터 배회 (random walk) | — |
| working | 타이핑 애니메이션 | 작업 내용 말풍선 |
| speaking | 말풍선 표시 | 메시지 첫 50자 |
| tool_calling | 도구 아이콘 + 스파크 효과 | 도구명 표시 |
| error | 빨간 느낌표 + 캐릭터 정지 | 에러 코드 |

**아키텍처:**
- `engine/agent-loop.ts` 수정 없음 — 실행 로그 읽기 전용
- 신규 WebSocket 채널: `/ws/office` (기존 16채널 → 17채널, shared/types.ts:484-501 기준)
- 서버: `packages/server/src/ws/office-channel.ts` — 실행 로그 tail → 상태 이벤트 변환
- 프론트: `packages/app/src/pages/office/` — CEO앱 `/office` 라우트 신규 추가
- 패키지: `packages/office/` — 독립 패키지 (실패해도 기존 기능 무영향)

**데이터 소스:** 기존 `activity_logs` 테이블 tail. 신규 테이블 없음.

---

#### Feature 5-2: n8n 워크플로우 연동 + 마케팅 자동화

**목적:** 기존 워크플로우 페이지(버그 다수, suggestions 500 에러) → n8n으로 완전 대체 + 마케팅 콘텐츠 자동 생성 프리셋 제공.

**n8n 역할:**
- 드래그앤드롭 자동화 빌더 (코드 불필요)
- Telegram/Discord/Slack 연동 처리
- 크론잡/트리거/웹훅 전부 n8n이 처리 (기존 ARGOS와 역할 분리)
- CORTHEX 코드에 워크플로우 로직 직접 구현 금지

**배포:** n8n Docker 컨테이너 → Oracle VPS 동일 서버 (포트 5678)

**통합 방식 (Stage 1 확정 — CORTHEX↔n8n API-only, iframe 없음):**
- CORTHEX→n8n 통합은 REST API-only (iframe 임베드 없음, Stage 1 R2 해소)
- `N8N_DISABLE_UI=false` — n8n 에디터 UI 활성 (Admin 전용 접근, 워크플로우 커스터마이즈용)
- Hono `proxy()` 헬퍼 → localhost:5678 reverse proxy: CORTHEX 관리 UI용 `/admin/n8n/*` + n8n 에디터용 `/admin/n8n-editor/*` (Admin 권한 검증)
- Admin 관리 페이지 = 자체 React UI (n8n REST API 호출: `GET /api/v1/workflows`, 실행 이력, 워크플로우 활성/비활성)
- tag 기반 멀티테넌트 격리: `?tags=company:{companyId}`
- 포트 5678 외부 차단 유지 — n8n 에디터 접근은 반드시 Hono proxy + Admin 인증 경유

**n8n 워크플로우 정책 (GATE 2026-03-20):**
- 온보딩 시 "마케팅 자동화 템플릿 설치할까요?" 제안
- 프리셋 = 출발점, 사용자가 n8n 비주얼 에디터에서 자유 수정 가능
- 잠그지 않음 — n8n의 존재 이유가 비개발자 커스터마이즈

**마케팅 자동화 프리셋 워크플로우 (GATE 2026-03-20):**

```
1. 주제 입력 (구글 시트 or 에이전트 채팅)
   ↓
2. AI 리서치 (트렌드 + 경쟁사 크롤링)
   ↓
3. AI가 콘텐츠 2종 동시 생성:
   ├── A. 카드뉴스 (5장 캐러셀 + 캡션)
   │    → 이미지 엔진: 회사 설정에 따라 선택
   │
   └── B. 릴스/숏폼 (15~60초)
        → 영상 엔진: 회사 설정에 따라 선택
        → 나레이션: ElevenLabs (선택)
        → 자막 자동 삽입
   ↓
4. 사람 승인 (Slack/Telegram 미리보기)
   ↓
5. 멀티 플랫폼 동시 게시
   ├── 인스타 캐러셀 + 릴스
   ├── 틱톡 숏폼
   ├── 유튜브 Shorts
   └── 링크드인/X
   ↓
6. 성과 추적 → 다음 콘텐츠 방향 피드백
```

**AI 모델 아키텍처 (GATE 2026-03-20):**

> 대화/실행 모델 = **Claude 고정** (agent-loop.ts → messages.create() → Claude API, CLI OAuth Max)
> 에이전트별: Sonnet 4.6 / Opus 4.6 / Haiku 4.5 (Admin에서 설정, v2에 이미 있음) — 변경 없음.

도구 모델 = **회사별 Admin 설정** (신규):
- Admin → 회사 설정 → "AI 도구 엔진" 섹션
- 이미지 엔진: Nano Banana 2 (Google, ~$0.08/장) | Flux 2 (~$0.03/장) | Ideogram V3 ($0.03~0.09/장, 텍스트 삽입 최강)
- 영상 엔진: Kling 3.0 (~$0.03/초, 가성비+오디오) | Veo 3.1 (~$0.20/초, 최고 품질) | Sora 2 (~$0.10/초) | Runway Gen-4.5
- 나레이션: ElevenLabs | 없음
- 자막: 자동 | 수동 | 없음

구현: n8n 워크플로우 시작 시 CORTHEX API 호출 → `GET /api/company/:id/marketing-settings` → Switch 노드로 해당 엔진 API 호출. Admin에서 설정 바꾸면 다음 실행부터 즉시 반영.

비용: 도구 모델(이미지/영상) 비용은 회사별 외부 API 키로 결제 — CORTHEX가 추적할 필요 없음 (n8n 실행 로그에서 확인 가능).

**Admin 변경:**
- `packages/admin/src/pages/workflows/` — n8n 관리 페이지로 교체
- `packages/admin/src/pages/settings/` — "AI 도구 엔진" 설정 섹션 추가 (이미지/영상/나레이션/자막)
- 기존 워크플로우 자체 구현 코드 삭제 (서버 + 프론트)

**CEO앱 변경:**
- `packages/app/src/pages/workflows/` — n8n 워크플로우 실행 결과 확인 (읽기 전용)

---

#### Feature 5-3: 에이전트 성격 시스템 (Big Five)

**목적:** 각 에이전트에 고유 성격 부여 → LLM이 성격에 맞게 응답. 코드 분기 없이 프롬프트 주입 방식.

**DB 변경:**
- `agents` 테이블에 `personality_traits JSONB` 컬럼 추가
- 기본값: `{"extraversion":50,"conscientiousness":50,"openness":50,"agreeableness":50,"neuroticism":50}` (0-100 정수 스케일, Stage 1 Decision 4.3.1)
- 마이그레이션 파일: `packages/server/src/db/migrations/0061_add_personality_traits.ts`

**성격 5축 (OCEAN 모델):**
| 축 | 0 (최저) | 100 (최고) | Soul 주입 예시 |
|----|----------|-----------|--------------|
| 외향성 (extraversion) | 내향적, 조용함 | 외향적, 활발함 | "당신은 매우 활발하고 대화를 주도합니다" |
| 성실성 (conscientiousness) | 즉흥적, 유연함 | 꼼꼼함, 완벽주의 | "당신은 항상 세부사항을 확인합니다" |
| 개방성 (openness) | 보수적, 전통적 | 창의적, 실험적 | "당신은 새로운 아이디어를 환영합니다" |
| 친화성 (agreeableness) | 직설적, 논쟁적 | 공감적, 협조적 | "당신은 상대방의 입장을 먼저 이해합니다" |
| 신경성 (neuroticism) | 안정적, 침착함 | 민감함, 감정적 | "당신은 실수에 매우 예민하게 반응합니다" |

**Soul 주입 위치:** `soul-enricher.ts`(Phase 5 Soul 전처리 단일 진입점)가 `agents.personality_traits` JSONB에서 5개 개별 extraVars를 생성 → `engine/soul-renderer.ts`의 renderSoul() extraVars 파라미터(L16)로 전달:
- `personality_openness`, `personality_conscientiousness`, `personality_extraversion`, `personality_agreeableness`, `personality_neuroticism`
- Soul 템플릿 참조 형식: `{{personality_openness}}/100 — {{openness_desc}}` (Stage 1 Decision 4.3.1)
- `agent-loop.ts`에는 `soulEnricher.enrich()` 호출 1행만 삽입 (E8 경계 최소 침습)
- Tech Research의 `personality-injector.ts` 역할을 `soul-enricher.ts`가 통합 담당 (성격 + 메모리 = 단일 진입점)

**프론트:** Admin 에이전트 생성/편집 페이지 (`packages/admin/src/pages/agents/`) — 성격 슬라이더 5개 UI 추가

**참고 구현:** AgentOffice의 Big Five (코드 분기 없이 프롬프트 주입 방식)

---

#### Feature 5-4: 에이전트 메모리 아키텍처

**목적:** 에이전트가 과거 경험을 기억하고, 주기적으로 반성하며, 태스크 시작 시 관련 기억을 활용.

**3단계 파이프라인:**

1. **관찰 (Observation)** — 모든 실행 → `observations` 테이블 저장
2. **반성 (Reflection)** — 크론으로 주기적 실행 → 관찰 요약 → `reflections` 테이블 저장
3. **계획 (Planning)** — 태스크 시작 시 관련 반성 pgvector 검색 → Soul에 주입

**신규 DB 테이블:**

```sql
-- observations: 모든 실행 로그를 구조화
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  content TEXT NOT NULL,           -- 에이전트가 수행한 작업 내용
  outcome VARCHAR(20) NOT NULL,    -- 'success' | 'failure' | 'partial'
  tool_used VARCHAR(100),          -- 사용한 도구명 (nullable)
  embedding VECTOR(768),           -- Gemini Embedding for semantic search
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON observations USING hnsw (embedding vector_cosine_ops);

-- reflections: 크론으로 생성된 고수준 인사이트
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,           -- "나는 주식 분석 요청에 KIS API를 먼저 사용할 때 성공률이 높다"
  source_count INTEGER NOT NULL,   -- 이 반성을 생성한 관찰 수
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON reflections USING hnsw (embedding vector_cosine_ops);
```

**마이그레이션:**
- `0062_add_observations_table.ts`
- `0063_add_reflections_table.ts`

**반성 크론:**
- 실행 주기: 에이전트별 최근 20개 관찰이 쌓이면 자동 실행 (백그라운드 워커 #7로 추가)
- 로직: `observations` 20개 → Gemini 요약 → `reflections` 1개 생성
- 파일: `packages/server/src/services/memory-reflection.ts`

**계획 단계 (Planning):**
- `engine/agent-loop.ts`에서 Soul 주입 직전 실행
- `reflections` 테이블에서 현재 태스크 임베딩과 cosine ≥ 0.75 상위 3개 검색
- `{relevant_memories}` 변수로 Soul에 주입

**참고:** a16z AI Town (메모리 아키텍처), CrewAI (4단계 메모리 시스템)

---

### Phase 5 기술 스택 추가

| 영역 | 추가 기술 | 파일/패키지 |
|------|---------|-----------|
| 시각화 | PixiJS 8 + @pixi/react | `packages/office/` |
| 워크플로우 | n8n (Docker, 포트 5678) | 외부 서비스 |
| 실시간 채널 | /ws/office (기존 16채널 → 17채널, shared/types.ts:484-501 기준) | `packages/server/src/ws/office-channel.ts` |
| DB 신규 테이블 | observations + reflections | 마이그레이션 #62, #63 |
| DB 컬럼 추가 | agents.personality_traits JSONB | 마이그레이션 #61 |
| 백그라운드 워커 | memory-reflection (기존 6 → 7개) | `packages/server/src/services/memory-reflection.ts` |
| 벡터 검색 | pgvector cosine (기존 확장 재사용) | observations + reflections 테이블 |
| Soul 전처리 미들레이어 | **soul-enricher.ts** — agent-loop.ts 호출 전 Soul 전처리 | `packages/server/src/services/soul-enricher.ts` |

---

### Phase 5 절대 규칙

1. `engine/agent-loop.ts` **최소 수정만 허용** — `soul-enricher.ts`를 호출하는 1행 훅 삽입만 허용. 비즈니스 로직(성격 주입, 메모리 검색) 직접 추가 금지. 시각화·성격·메모리 처리는 모두 `soul-enricher.ts`에서 담당한다.
   - **구현 패턴**: `agent-loop.ts`의 Soul 변수 치환 직전에 `const enrichedSoul = await soulEnricher.enrich(soul, agentId, taskText, companyId)` 1행 삽입 → `soul-enricher.ts`가 `personality_*` 5개 개별 extraVars 및 `{relevant_memories}` 치환 담당.
2. 기존 485개 API 라우트 유지 — 신규 라우트만 추가
3. 기존 86개 DB 테이블 유지 — 컬럼 추가/신규 테이블만
4. n8n = 외부 서비스 — CORTHEX 코드에 워크플로우 로직 직접 구현 금지
5. `packages/office/` = 독립 패키지 — 실패해도 기존 기능 무영향
6. Big Five 성격 = 프롬프트 주입 전용 — 코드 분기(if/switch) 금지
7. `soul-enricher.ts` = Phase 5 Soul 전처리 단일 진입점 — personality_* 5개 개별 extraVars 주입 + relevant_memories 검색 모두 이 파일에서 처리 (Tech Research의 personality-injector.ts 역할 통합)

---

### Vision (Phase 6+, 미래)

| 비전 | 우선순위 | 시기 |
|------|---------|------|
| 에이전트 성과 대시보드 | 높음 | Phase 6 |
| Soul 버전 관리 (이력 추적 + 복원) | 높음 | Phase 6 |
| 멀티 LLM 동적 라우팅 (Gemini ADK 추가) | 높음 | Phase 6 |
| 자동 티어 최적화 (사용 패턴 → 추천) | 중간 | Phase 7 |
| 에이전트 마켓플레이스 (Soul 공유) | 낮음 | Phase 7+ |
| 크로스 테넌트 협업 | 낮음 | Phase 8+ |

### Out of Scope (Phase 1~4 전체)

| 제외 항목 | 이유 | 가능 시기 |
|----------|------|----------|
| 멀티 LLM (Gemini ADK 통합) | Claude SDK만. 기존 Gemini 호출은 유지 | Phase 5 |
| 에이전트 메모리 시스템 개편 | autoLearn 유지. 세션 연속성은 나중에 | Phase 5+ |
| 관리자 콘솔 전면 재설계 | 비서/티어 UI만 추가 | UXUI 재설계 |
| 모바일 네이티브 앱 | 웹 반응형만 | 별도 프로젝트 |
| 허브 UI 전면 재설계 | 비서 분기만 추가 | UXUI 재설계 |
| KIS 증권 API 코드 수정 | 투자 코드 불가침 | — |
| 텔레그램 봇 로직 수정 | 음성 전송 연동만 | — |
| 워크플로우 빌더 자체 구현 | Phase 5에서 n8n Docker로 대체. 자체 구현 불필요 | — |
| 퍼포먼스 적극 최적화 | P95 동등만 목표 | Phase 5+ |
| 다국어 (i18n) | 한국어 단일 | 별도 |

**코드 경계 (Phase 1~4):**
- ✅ 건드림: `engine/`, `tool-handlers/`, `services/` (llm-router + 삭제), `routes/`, `db/`, `app/src/` (허브), `admin/src/` (관리자), `mcp/` (스케치바이브 MCP 신규)
- ❌ 안 건드림: `shared/` (타입 추가만), `ui/`, `services/trading/`, `services/telegram/` (전송만), `services/selenium/`

**코드 경계 (Phase 5 추가):**
- ✅ 신규 패키지: `packages/office/` (OpenClaw — 독립 패키지)
- ✅ 추가: `packages/server/src/ws/office-channel.ts`, `packages/server/src/services/memory-reflection.ts`
- ✅ 컬럼 추가: `agents.personality_traits JSONB`, 신규 테이블: `observations`, `reflections`
- ❌ 여전히 건드리지 않음: `engine/agent-loop.ts` (읽기만), 기존 485개 API 라우트

### UXUI 완전 리디자인 (Phase 5 병행)

**기존 테마 전부 폐기:**
- Sovereign Sage (slate-950 + cyan-400 dark mode) — **폐기**
- Natural Organic (cream #faf8f5 + olive #283618 light mode) — **폐기**
- `_corthex_full_redesign/` 산출물 — 참고 금지, 새로 시작

**리디자인 방식:** `/kdh-uxui-redesign-full-auto-pipeline` Phase 0부터 완전 재실행

**메뉴 구조 확정 (2026-03-20):**

Admin 사이드바:
- 기존 유지: 대시보드, 회사관리, 직원관리, 사용자관리, 부서관리, AI에이전트(+성격슬라이더), 도구관리, CLI/API키, 보고라인, 소울템플릿, 시스템모니터링, NEXUS조직도, SketchVibe, 조직템플릿, 템플릿마켓, 에이전트마켓, 공개API키, 회사설정
- 제거: 비용관리 (CLI Max 월정액, GATE 결정 2026-03-20)
- 교체: 워크플로우 → **n8n 관리 페이지** (Hono reverse proxy API, 자체 React UI)
- 추가: 회사설정 내 **"AI 도구 엔진"** 섹션 (이미지/영상/나레이션/자막 엔진 선택)

CEO앱 사이드바:
- 기존 유지: 기존 페이지 중 합치기 대상 제외한 나머지
- 제거: SketchVibe (Admin으로 이동 완료), costs (GATE 결정)
- 신규: `/office` (OpenClaw 가상 사무실)
- 교체: 워크플로우 → n8n 연동 결과 확인

**CEO앱 페이지 합치기 (GATE 2026-03-20, v3 병행 작업):**

| 합치기 | Before | After | 작업량 |
|--------|--------|-------|--------|
| hub + command-center | 2페이지 | hub 1개 (command-center 라우트 redirect) | 소 |
| classified + reports + files | 3페이지 | "문서함" 1개 + 내부 탭 3개 (기밀/보고서/파일) | 중 |
| argos + cron-base | 2페이지 | argos 1개 + 설정 탭 | 소 |
| home + dashboard | 2페이지 | home 1개 (통합 대시보드) | 중 |
| activity-log + ops-log | 2페이지 | "활동 로그" 1개 + 필터 (실시간/히스토리) | 중 |
| agents + departments + org | 3페이지 | nexus 통합 or 2개로 축소 — UX 설계 단계 결정 | 대 |

합계: 14페이지 → 6개 그룹으로 통합 (FR-UX1 확정)

## User Journeys

*v2 여정(Phase 1-4)은 검증된 기반 기능이며 그대로 유지. v3 여정(Sprint 1-4)은 4가지 핵심 능력 추가를 반영.*

### Journey 1: CEO 김도현 — "내 AI 팀이 살아 숨 쉰다."

**페르소나:** 김도현, 38세, SaaS 스타트업 대표. 비개발자, 비즈니스 집중. AI 조직에 태스크를 지시하고 결과를 감독. 매일 Hub, Chat, Dashboard 사용.

**핵심 문제 (Before v3):** "내 AI 팀이 지금 뭘 하는지 모르겠다. 텍스트 로그는 너무 기술적이다." / "에이전트가 어제 했던 실수를 오늘도 한다."

**Phase 1 (엔진 교체) — 투명한 변화:**
CEO는 아무 변화를 느끼지 못한다. 허브에 "삼성전자 분석해줘"라고 입력하면 기존과 동일하게 비서실장이 받아 CIO에게 핸드오프하고 보고서가 온다. 내부적으로 agent-runner.ts 대신 agent-loop.ts가 돌지만, processing 이벤트를 즉시 전송하여 SDK 서브프로세스 spawn 지연(~2초)을 체감 지연 없이 흡수한다.

*에러 시나리오:* SDK messages.create() 호출 실패 시 자동 재시도 1회. 재시도도 실패하면 "에이전트 실행에 실패했습니다. 잠시 후 다시 시도해주세요." 메시지 표시.

**Phase 2 (오케스트레이션) — 핸드오프가 보인다:**
허브 사이드바에 실시간 핸드오프 추적이 표시된다:
- 🤖 비서실장 분석 중... (0.5초) → 📨 CIO에게 핸드오프 → 📨 종목분석가 + 기술분석가 병렬 핸드오프 → 🔧 작업 중... → 📊 CIO 종합 → ✍️ 비서실장 정리 → ✅ 완료

CEO가 느끼는 변화: "아 비서실장이 CIO한테 넘기고, CIO가 두 명한테 동시에 시켰구나." 핸드오프 체인이 시각적으로 흘러가는 걸 처음으로 봄.

Soul 편집: Admin이 CIO Soul에 "뉴스 반드시 참고" 한 줄 추가 → 다음 분석에서 CIO가 뉴스 검색 도구 자동 사용. CEO: "프롬프트만 바꿨다고?"

*에러 시나리오:* 6명 팀장 동시 지시 중 CMO 타임아웃 → "마케팅부 CMO가 응답하지 못했습니다. 나머지 5개 부서 결과로 종합합니다." 블랙박스 에러 없이 어떤 에이전트가 실패했는지 명확히 표시.

**Phase 3 (티어 유연화) — 모델 최적화:**
NEXUS에서 조직도를 확인. 뉴스분석가를 Tier 4(Haiku)로 변경 → 해당 에이전트가 가벼운 태스크에 최적화된 모델로 전환. "역할에 맞게 모델을 골라줄 수 있구나."

**Phase 4 (라이브러리 강화) — 감정적 클라이맥스:**
"오늘 시황 브리핑 만들어줘" → CIO가 의미 검색으로 관련 문서 자동 발견 → NotebookLM 음성 브리핑 생성(2분) → 텔레그램 전송 → 퇴근길 지하철에서 이어폰으로 청취. *'진짜 비서가 있는 느낌이다.'*

**Sprint 1 (Big Five) — 개성이 생겼다:**
Admin 이수진이 CIO의 성실성(conscientiousness)을 85/100으로 설정. 김도현이 Hub에서 "분기 실적 분석해줘"라고 지시하면, CIO가 이전과 달리 체크리스트를 자동 생성하고 빠짐없이 항목을 검증한다. "같은 CIO인데 톤이 달라졌네? 훨씬 꼼꼼해졌다."

반면 마케팅부 CMO는 외향성(extraversion) 90/100, 개방성(openness) 80/100 → 열정적이고 창의적인 톤으로 마케팅 전략을 제안. "부서마다 성격이 다르니까 진짜 조직 같다."

**Sprint 3 (메모리) — 성장이 보인다:**
한 달 전 김도현이 "삼성전자 분석해줘"라고 했을 때 CIO가 재무제표만 봤다. 김도현이 "뉴스도 같이 봐"라고 수정 피드백. → 오늘 "LG전자 분석해줘" → CIO가 재무제표 + 뉴스를 자동으로 함께 분석. *'이 에이전트가 내 피드백을 기억하고 성장했다.'*

Reflection 알림: 매주 월요일 "이번 주 에이전트 성장 리포트" 도착 → CIO 반복 오류율 40%→15% 감소 확인. CEO: "수치로 보이니까 신뢰가 간다."

**Sprint 4 (/office) — 살아 숨 쉬는 팀:**
`/office` 페이지를 처음 열었을 때 — PixiJS 픽셀 캐릭터 에이전트들이 각자 책상에서 실시간으로 타이핑하고, 한 에이전트가 도구를 집어드는 스파크 효과. NEXUS 조직도에서 CIO 노드가 초록색(working)으로 빛남 → "삼성전자 분석해줘" 입력 직후 CIO 캐릭터가 타이핑 시작 + 말풍선 "삼성전자 재무제표 분석 중..." → 핸드오프 시 종목분석가 캐릭터도 움직이기 시작. *'내 AI 팀이 실제로 일하고 있다는 걸 처음으로 봤다.'*

*에러 시나리오:* 에이전트 에러 시 빨간 느낌표 + 캐릭터 정지. NEXUS 노드도 빨간색(error)으로 전환. 김도현이 즉시 인지 → Admin에게 연락. 블랙박스 없음.

### Journey 2: 팀장 박과장 — "AI를 팀 인프라로 만들었다."

**페르소나:** 중소기업 마케팅팀 팀장. 팀원 8명이 각자 ChatGPT를 쓰는데 표준화가 안 됨.

**Phase 2 — 비서 선택제:**
Admin이 박과장은 비서 없음(직접 선택 선호), 신입 팀원A는 비서 있음("마케팅 어시스턴트", Soul: 마케팅 관련만 처리), 경력 팀원B는 비서 없음으로 설정. 같은 마케팅부 에이전트를 다른 경로로 사용 — 박과장은 SEO분석가를 직접 선택하고, 팀원A는 비서에게 자연어로 말하면 자동 라우팅.

**Phase 3 — Tier 최적화:**
NEXUS에서 팀 에이전트 구조 확인. 콘텐츠작성가(128회/월)를 Tier 4로 변경 → 가벼운 작업에 최적화된 모델 배정. 에이전트별 사용량을 팀 단위로 시각적으로 관리.

**Sprint 2 (n8n) — 워크플로우 자동화 결과 확인:**
Admin이 n8n에서 "매주 금요일 마케팅 주간 리포트 → Slack" 워크플로우를 설정. 박과장은 CEO 앱에서 워크플로우 실행 결과만 확인 — 실행 성공/실패 이력, 최근 실행 시간, 다음 예정 실행. "나는 결과만 보면 되니까 편하다."

### Journey 3: 투자자 이사장 — "4명의 애널리스트를 고용한 효과."

**페르소나:** 개인 투자자. 포트폴리오 10종목. 매일 뉴스·재무·기술·매크로를 동시에 분석해야 하는데 혼자서 불가능.

**Phase 2 — call_agent 병렬 핸드오프의 진가:**
"포트폴리오 리밸런싱 분석해줘" → 비서실장→CIO→전문가 4명(종목·기술·뉴스·매크로)에게 동시 call_agent → 4명이 각각 KIS API, 차트, 뉴스, 금리 데이터를 병렬 수집(~6초) → CIO가 종합 시 의견 충돌 발견("종목분석가: 매수 vs 기술분석가: 보류") → Soul 검증 지침에 따라 양쪽 의견 병기 → 비서실장이 이사장 눈높이로 정리 → 총 ~20초.

**Phase 4 — 아침 음성 브리핑:**
ARGOS 크론잡(매일 오전 7시) → CIO에게 자동 명령 → 4명 병렬 분석 → NotebookLM 음성 5분 브리핑 → 텔레그램 전송 → 출근길 7:15 이어폰으로 청취.

**Sprint 3 (메모리) — 분석이 날카로워졌다:**
매일 반복되는 포트폴리오 분석에서 CIO가 이사장의 선호 종목 비중(삼성전자 30%, 현대차 15%)을 기억. "포트폴리오 리밸런싱 분석해줘" → 별도 지시 없이 선호 비중 기준으로 자동 분석. "내 스타일을 알아서 파악했네."

**Sprint 4 (/office) — 4명이 동시에 움직인다:**
`/office`에서 "포트폴리오 분석해줘" 입력 → 비서실장 → CIO → 4명(종목·기술·뉴스·매크로) 전문가 캐릭터가 동시에 타이핑 시작. 6초 후 차례로 완료 애니메이션. *'4명의 애널리스트가 실제로 일하는 모습을 눈으로 본다.'*

### Journey 4: Admin 이수진 — "AI 조직에 생명을 불어넣다."

**페르소나:** 이수진, 32세, AI 시스템 운영 담당자. SaaS 운영 경험 있으나 코딩 불필요. 회사의 AI 조직 전체를 설계·운영. 초기 집중 설정 + 주 1~2회 유지보수.

**핵심 문제 (Before v3):** "에이전트를 만들었는데 다 똑같이 말한다." / "워크플로우를 만들려면 코드를 짜야 한다." / "에이전트가 어제 실수한 걸 오늘도 반복한다."

**Phase 2 — 초기 설정 (~10분):**
회사 정보 입력(1분) → Human 직원 등록 + CLI 토큰 검증 + 비서 유무 설정(3분) → 부서 생성 + 에이전트 배치 + Tier 설정(3분) → 도구 할당(2분) → 기본 Soul 템플릿 자동 적용. 추가 Soul 편집 불필요.

**Phase 3 — NEXUS 조직도:**
노드 기반 시각적 조직도. [+ 부서] → "마케팅부" → CMO 생성(Tier 2) → 비서실장에서 드래그&드롭으로 연결 → 하위에 콘텐츠작성가, SEO분석가 추가(Tier 4) → [저장] → 즉시 반영. 김도현이 허브에서 "마케팅 전략 수립해줘" → 비서실장이 CMO를 인식 → call_agent 자동 핸드오프. 배포 0, 코드 수정 0.

**Sprint 1 (Big Five) — 개성 설계:**
에이전트 편집 화면에서 Big Five 슬라이더 5개가 나타남. CIO: 성실성 85/100, 개방성 40/100 (꼼꼼하고 보수적). CMO: 외향성 90/100, 개방성 80/100 (활발하고 창의적). 슬라이더를 움직일 때마다 우측 미리보기에서 예상 응답 톤이 실시간 변경.

역할별 프리셋 템플릿: [분석가형] 클릭 → 성실성 80, 개방성 30, 신경성 20 자동 설정. "프리셋으로 시작해서 미세조정하니까 빠르다."

이수진의 AHA moment: 성실성 85로 설정한 CIO가 이전과 달리 체크리스트를 자동 작성하며 꼼꼼하게 분석. *'이게 진짜 개성이네.'*

*접근성:* 슬라이더에 `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100` 적용. 키보드 좌우 화살표로 조작 가능 (1단위), Shift+화살표로 10단위 이동.

**Sprint 2 (n8n) — 워크플로우 자동화:**
Admin → 워크플로우 관리 페이지. n8n REST API 기반 자체 React UI에서 워크플로우 목록 확인 — 활성/비활성 토글, 실행 이력, 최근 실행 결과. "마케팅 주간 리포트 → Slack" 워크플로우 활성화 → 즉시 동작.

n8n 비주얼 에디터 접근: Admin 전용 링크로 n8n 에디터 열기 → 드래그앤드롭으로 노드 수정 가능. "프리셋을 출발점으로 쓰고, 내 필요에 맞게 수정했다."

**Sprint 3 (메모리) — 성장 관리:**
에이전트별 메모리 설정 화면. Reflection 크론 주기 (매일 새벽 3시 기본), Tier별 메모리 한도 설정. Observation → Reflection → Planning 3단계 파이프라인 모니터링.

이수진이 CIO의 메모리 탭에서 "지난 주 Reflection 5건 생성, Planning 2건 적용" 확인. 반복 오류 감소 그래프가 우하향. "에이전트가 실제로 배우고 있다는 걸 데이터로 본다."

### Journey 5: Human 직원 이과장 — "바로 시킨다."

**Phase 2 — 비서 없는 허브:**
에이전트 목록에서 종목분석가 선택(1클릭, 2초) → "현대차 재무 분석해줘" 입력(2클릭 = 선택 + 전송) → 종목분석가 직접 실행(비서 경유 없음) → 3초 후 결과. 총 2클릭, ~5초.

*에러 시나리오:* CTO를 선택해서 "삼성전자 분석해줘" → CTO Soul: "투자 분석은 내 업무가 아닙니다. CIO를 선택해주세요." 범위 밖 요청을 거절하되 누구에게 가야 하는지 안내.

### Journey 6: Admin (개발) — 스케치바이브 CLI 협업

**Phase 4 — Claude Code ↔ 캔버스:**
터미널에서 Claude Code 실행 → "현재 engine/ 구조를 캔버스에 그려줘" → Claude Code가 Read/Grep으로 코드 분석 → MCP update_canvas()로 아키텍처 다이어그램 실시간 표시 → 브라우저에서 확인 → "여기에 llm-router 연결 추가해줘" → Claude Code가 캔버스 수정 + request_approval() → 브라우저에서 [적용] 클릭 → Claude Code: "이 구조를 README에도 반영할까요?"

코드를 이해하는 AI가 캔버스와 코드를 동시 조작하는 양방향 개발 협업.

### Journey 7: CEO 첫 사용자 — 셀프서비스 온보딩

**Phase 2 — 5분 온보딩:**
회원가입 → CLI 토큰 입력 + [검증] → ✅ 유효 → "기본 AI 조직을 만들어드릴까요?" → [예] → 비서실장 + 투자분석부(CIO+전문가3명) + 기술부(CTO+개발자) 자동 생성 → 기본 Soul 템플릿 적용 + Big Five 기본값(전원 50/100, 중립 선택 — 연구 추천 최적값은 역할별 프리셋으로 제공) 자동 설정 → 허브에서 "안녕하세요!" → 비서실장 응답. 총 ~5분.

**v3 추가 단계:** "마케팅 자동화 템플릿을 설치할까요?" → [예] → n8n 마케팅 프리셋 워크플로우 자동 설치 + AI 도구 엔진 기본값 설정(이미지: Flux 2, 영상: Kling 3.0). 온보딩 완료 시 Hub + /office + 워크플로우 결과 3개 페이지로 바로 시작 가능.

*15분 초과 시:* 온보딩 진행률 표시 + "나중에 계속하기" 저장 기능 → 다음 로그인 시 이어서 완료.

### Journey 8: Admin 이수진 — "마케팅이 자동으로 돌아간다." (Sprint 2 딥 다이브)

**페르소나:** Journey 4와 동일 (이수진, 32세). Sprint 2에서 n8n + 마케팅 자동화 집중.

**Opening Scene — 수동 마케팅의 한계:**
매주 인스타 카드뉴스 + 틱톡 숏폼을 수동으로 제작. 주제 선정(30분) → 이미지 생성(1시간) → 영상 편집(2시간) → 각 플랫폼 업로드(30분) = 총 4시간/주. "이걸 자동화할 수 없을까?"

**Rising Action — 마케팅 프리셋 워크플로우 설정:**
Admin → 워크플로우 관리 → "마케팅 자동화 프리셋" 탭 → [설치] 클릭 → 6단계 파이프라인이 n8n에 자동 생성:

1. 주제 입력 (구글 시트 or 에이전트 채팅)
2. AI 리서치 (트렌드 + 경쟁사 크롤링)
3. AI 콘텐츠 2종 동시 생성: 카드뉴스 5장 캐러셀 + 릴스/숏폼 15~60초
4. 사람 승인 (Slack/Telegram 미리보기)
5. 멀티 플랫폼 동시 게시 (인스타 + 틱톡 + 유튜브 Shorts + 링크드인/X)
6. 성과 추적 → 다음 콘텐츠 방향 피드백

**Climax — AI 도구 엔진 설정:**
Admin → 회사 설정 → "AI 도구 엔진" 섹션:
- 이미지 엔진: Ideogram V3 선택 (텍스트 삽입 최강, $0.03~0.09/장)
- 영상 엔진: Kling 3.0 선택 (가성비+오디오, ~$0.03/초)
- 나레이션: ElevenLabs 활성화
- 자막: 자동

[저장] → 다음 워크플로우 실행부터 즉시 반영. "엔진만 바꾸면 되니까 나중에 더 좋은 게 나오면 클릭 한 번이면 전환된다."

**Resolution — 4시간 → 15분:**
주제 입력(5분) → AI가 자동 생성(대기 10분) → Slack 미리보기 확인 + 승인 → 4개 플랫폼 동시 게시. 이수진: *'주 4시간이 15분으로 줄었다. 나는 전략에 집중하고 실행은 AI가 한다.'*

*에러 시나리오:* 이미지 엔진 API 타임아웃(30초) → n8n Error Workflow 자동 트리거 → 재시도 2회 → 실패 시 fallback 엔진(Flux 2) 자동 전환 + Slack 알림 "이미지 엔진 Ideogram V3 장애, Flux 2로 대체 생성 완료". 이수진은 결과만 확인.

### Journey 9: CEO 김도현 — "내 사무실이 살아 움직인다." (Sprint 4 딥 다이브)

**페르소나:** Journey 1과 동일 (김도현, 38세). Sprint 4에서 /office + NEXUS 실시간 상태 집중.

**Opening Scene — 텍스트 로그의 한계:**
김도현이 6개 부서에 동시에 태스크를 지시. Hub에서 각 에이전트의 진행 상태를 텍스트로 확인하지만, 전체 조직이 어떻게 움직이는지 한눈에 파악 불가. "누가 일하고 누가 놀고 있는지 모르겠다."

**Rising Action — /office 첫 진입:**
CEO 앱 사이드바에서 `/office` 클릭. PixiJS 픽셀아트 사무실이 로드(< 200KB gzipped). 에이전트들이 각자 자리에 배치 — 부서별 영역으로 구분. 현재 idle인 에이전트는 랜덤 배회, working인 에이전트는 타이핑 애니메이션.

김도현이 Hub에서 "분기 실적 종합 분석해줘" 입력 → /office 화면에서 실시간 변화:
- 비서실장 캐릭터: 말풍선 "분석 요청 수신" → 타이핑 시작
- CIO에게 핸드오프 → CIO 캐릭터: 도구 아이콘 + 스파크 효과
- 종목분석가 + 기술분석가 동시 움직임 시작 (병렬 핸드오프 시각화)
- 완료 시 비서실장: ✅ 말풍선 "분석 완료"

**Climax — NEXUS 실시간 상태:**
NEXUS 조직도 페이지에서 각 에이전트 노드에 상태 색상이 실시간 표시:
- 파란색(idle): 대기 중 — Brief 5상태 중 `idle`
- 초록색(working): 작업 중 — Brief 5상태 중 `working` + `speaking` + `tool_calling` 통합 (NEXUS 노드 수준에서는 "활성" 상태로 표시, /office에서 세부 애니메이션 구분)
- 빨간색(error): 오류 발생 — Brief 5상태 중 `error`
- 주황색(degraded): heartbeat fallback, 에이전트 응답 지연 — PRD 추가 상태 (Brief 5상태 외 운영 모니터링용, 사장님 결정 2026-03-20)

김도현이 조직도를 보면서 "마케팅부 CMO가 주황색이네?" → 클릭 → 상세 상태 "응답 지연 15초, heartbeat fallback 작동 중" 확인 → Admin에게 연락. *'조직도만 봐도 전체 상태가 한눈에 보인다.'*

*접근성:* /office는 desktop-only (PixiJS 렌더링). 모바일에서는 에이전트 상태를 리스트 뷰로 대체 표시 (이름 + 상태 텍스트 + 색상 뱃지). NEXUS 노드 상태에 `aria-live="polite"` 적용 — 상태 변경 시 스크린리더가 읽음.

**Resolution:**
김도현의 새로운 일상: 아침 출근 → /office 열기 → 전체 에이전트 상태 한눈에 확인 → NEXUS에서 주황색/빨간색 노드 0개 확인 → Hub에서 태스크 지시. *'텍스트 로그 시절로 돌아갈 수 없다. 이제 내 AI 팀이 보인다.'*

### Journey 10: Admin 이수진 — "에이전트가 성장하는 걸 데이터로 본다." (Sprint 3 딥 다이브)

**페르소나:** Journey 4와 동일 (이수진, 32세). Sprint 3에서 에이전트 메모리 집중.

**Opening Scene — 반복 실수의 답답함:**
CIO가 매번 같은 실수를 반복. "삼성전자 분석해줘" → 재무제표만 분석 → 김도현 피드백 "뉴스도 봐" → 다음에 또 재무제표만. "어제 말한 걸 오늘도 못 알아듣는다."

**Rising Action — 메모리 아키텍처 설정:**
Admin → 에이전트 상세 → 메모리 탭:
- Observation: 태스크 실행마다 자동 기록 (ON/OFF 토글, 기본 ON)
- Reflection: 크론 주기 설정 (매일 새벽 3시 기본) → 하루 동안의 Observation을 종합해 패턴·교훈 추출
- Planning: Reflection 기반 다음 태스크 전략 생성 (자동, 수동 트리거 가능)

Tier별 메모리 한도: Tier 1-2(Sonnet/Opus)은 Reflection 무제한, Tier 3-4(Haiku)은 주 1회로 제한 (Haiku ≤ $0.10/day 비용 게이트).

**Climax — 성장 확인:**
2주 후 이수진이 CIO 메모리 탭 열기:
- Observation: 47건 누적
- Reflection: 14건 생성 (매일 1건)
- Planning: 5건 적용

Reflection 내용 확인: "사용자가 투자 분석 시 뉴스를 함께 원하는 패턴 발견 (7/10 태스크에서 피드백). → Planning: 투자 분석 요청 시 자동으로 뉴스 검색 도구 포함."

김도현이 "LG전자 분석해줘" → CIO가 재무 + 뉴스 자동 병합 분석. *'가르치지 않아도 스스로 배웠다.'*

이수진의 AHA moment: 반복 오류율 그래프가 40% → 15%로 우하향. *'에이전트가 실제로 성장하고 있다는 걸 데이터로 증명할 수 있다.'*

**Resolution:**
이수진의 유지보수 루틴: 주 1회 메모리 대시보드 확인 → 비정상 Reflection 삭제 (잘못된 패턴 학습 방지) → Tier별 메모리 한도 조정. "처음에 설정해두면 에이전트가 알아서 성장한다. 나는 방향만 잡아주면 된다."

*에러 시나리오:* 메모리 기반 Planning이 잘못된 패턴을 학습 (e.g., 특정 도구를 과도하게 사용) → 이수진이 해당 Reflection 삭제 + Planning 재생성 트리거. Zero Regression: 기존 `agent_memories` 데이터 단절 0건 보장.

### Journey Requirements Summary

| 여정 | Phase/Sprint | 도출된 기능 요구사항 |
|------|-------------|-------------------|
| CEO 김도현 | Phase 1 | processing 이벤트 즉시 전송 (체감 지연 최소화), graceful degradation + 재시도 |
| CEO 김도현 | Phase 2 | 비서 있는 허브, 실시간 핸드오프 추적 사이드바, 에러 메시지 (실패 에이전트 명시 + 나머지 종합) |
| CEO 김도현 | Phase 3 | NEXUS 조직도 읽기 뷰, Tier 변경 UI |
| CEO 김도현 | Phase 4 | 음성 브리핑 생성 + 텔레그램 전송 |
| CEO 김도현 | Sprint 1 | Big Five 성격 변화 체감 (에이전트 톤 변화), 부서별 개성 차이 인지 |
| CEO 김도현 | Sprint 3 | 에이전트 성장 체감 (메모리 기반 피드백 학습), Reflection 주간 리포트 알림 |
| CEO 김도현 | Sprint 4 | /office PixiJS 실시간 시각화 (Brief 5상태: idle/working/speaking/tool_calling/error + PRD 추가: degraded), NEXUS 실시간 노드 색상 (4색: idle파란/active초록/error빨간/degraded주황), 모바일 리스트 뷰 fallback |
| 팀장 박과장 | Phase 2 | 비서 없는 허브, 에이전트 접근 권한 관리 |
| 팀장 박과장 | Phase 3 | 에이전트 사용량 대시보드, Tier 변경 |
| 팀장 박과장 | Sprint 2 | n8n 워크플로우 실행 결과 읽기 전용 뷰 |
| 투자자 이사장 | Phase 2 | call_agent 병렬 핸드오프 (4명 동시), CIO Soul 검증 (의견 충돌 → 병기) |
| 투자자 이사장 | Phase 4 | ARGOS 크론잡 → 자동 분석 → 음성 → 텔레그램 |
| 투자자 이사장 | Sprint 3 | 메모리 기반 선호 종목 비중 자동 기억, CIO 분석 정확도 향상 |
| 투자자 이사장 | Sprint 4 | /office에서 4명 전문가 병렬 분석 실시간 시각화 |
| Admin 이수진 | Phase 2 | 초기 설정 플로우 ≤ 15분, 기본 Soul 템플릿, CLI 토큰 검증 UI |
| Admin 이수진 | Phase 3 | NEXUS 드래그&드롭 편집, 부서/에이전트/비서 CRUD, 티어 설정 |
| Admin 이수진 | Sprint 1 | Big Five 슬라이더 5개 (0-100), 역할별 프리셋 템플릿, 실시간 톤 미리보기, 접근성(aria-valuenow, 키보드) |
| Admin 이수진 | Sprint 2 | n8n 관리 React UI (워크플로우 CRUD, 실행 이력), n8n 에디터 접근 |
| Admin 이수진 | Sprint 2 | 마케팅 프리셋 6단계 파이프라인, AI 도구 엔진 설정 (이미지/영상/나레이션/자막) |
| Admin 이수진 | Sprint 3 | 메모리 3단계 모니터링 (Observation/Reflection/Planning), Tier별 한도, 반복 오류율 그래프 |
| Human 직원 | Phase 2 | 비서 없는 허브 (에이전트 직접 선택), 범위 밖 요청 거절 + 안내 |
| Admin (개발) | Phase 4 | 스케치바이브 MCP (read/update/approve/list), CLI 연결 |
| CEO (온보딩) | Phase 2 | 기본 조직 자동 생성 원클릭, 셀프서비스 온보딩 ~5분 |
| CEO (온보딩) | v3 추가 | n8n 마케팅 프리셋 자동 설치 제안, AI 도구 엔진 기본값, 15분 초과 시 이어서 완료 |

### 여정 간 교차점

| 교차점 | 영향 | 기능 요구사항 |
|--------|------|-------------|
| CEO 김도현 ↔ Admin 이수진 | Soul + Big Five 편집 권한 | Admin만 Soul 편집 + Big Five 설정 가능. CEO는 결과 체감만 |
| CEO 김도현 ↔ 투자자 이사장 | 동일 인물 가능 | 비서 Soul 기본 템플릿에 전 부서 라우팅 지침 포함 |
| 팀장 박과장 ↔ Human 직원 이과장 | 같은 에이전트, 다른 경로 | 비서 경유 vs 직접 선택 양쪽 지원. CLI 토큰 사용 귀속 분리 |
| 텔레그램 ↔ 허브 | 같은 비서, 다른 반환 채널 | 텔레그램 경유 명령도 agent-loop.ts 통과. 회귀 테스트 포함 |
| Admin NEXUS ↔ Admin 스케치바이브 | 같은 사람, 독립 맥락 | NEXUS(조직 관리) ≠ 스케치바이브(개발 협업). 탭 간 독립 |
| Admin 이수진 Sprint 1 ↔ CEO 김도현 Sprint 1 | Big Five 설정 → 체감 | Admin이 슬라이더 설정 → CEO가 에이전트 톤 변화 체감. 설정-효과 인과 관계 |
| Admin 이수진 Sprint 3 ↔ CEO 김도현 Sprint 3 | 메모리 설정 → 성장 체감 | Admin이 Reflection 크론 관리 → CEO가 에이전트 성장 체감. 운영-가치 연결 |
| Journey 8 마케팅 ↔ Journey 7 온보딩 | 프리셋 설치 시점 | 온보딩에서 제안 → Admin이 커스터마이즈. 같은 프리셋, 다른 시점 |
| Journey 9 /office ↔ NEXUS 실시간 상태 | 공통 상태 + 별도 렌더링 | 공통 데이터(activity_logs 기반 에이전트 상태)를 /ws/agent-status(기존)와 /ws/office(신규) 양쪽에 브로드캐스트. /ws/office는 추가로 PixiJS 전용 렌더링 페이로드(위치·애니메이션 상태) 포함. NEXUS는 React Flow 노드 색상으로 렌더링 |
| n8n 에러 ↔ Admin 알림 | 외부 API 장애 처리 | n8n Error Workflow → timeout 30s + retry 2x + fallback 엔진 → Slack 알림. Admin은 결과만 확인 |

## Domain-Specific Requirements

*도메인 요구사항은 "무엇을 지켜야 하는가"(규제·도메인 근거)를 정의한다. "얼마나 잘"(정량 목표)은 NFR 섹션 참조.*

### 보안 (SEC) → 정량 목표: NFR-S1~S6, S8~S9 (S7 삭제)

| ID | 요구사항 | 상세 | Phase |
|----|---------|------|-------|
| SEC-1 | CLI 토큰 DB 암호화 | AES-256, 복호화 키 환경변수 분리 | 유지 (확인) |
| SEC-2 | 토큰 메모리 노출 최소화 | messages.create() 호출 후 토큰 변수 즉시 null 처리 | 1 |
| SEC-3 | 프로세스 환경변수 격리 | Docker 프로세스 네임스페이스 분리 | 유지 |
| SEC-4 | output-redactor 패턴 | `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer 토큰 전부 마스킹 | 1 |
| SEC-5 | 감사 로그 토큰 필터 | credential-scrubber가 audit_logs 기록 전에 필터 적용 | 1 |
| SEC-6 | Soul에서 토큰 접근 불가 | 에이전트 Soul/시스템 프롬프트에 CLI 토큰 절대 주입 안 함 | 2 |
| SEC-7 | 토큰 로테이션 | 토큰 만료/갱신 시 세션 중인 에이전트 graceful 종료 | Phase 5+ |

### CLI 토큰 핸드오프 정책

| 시나리오 | 사용 토큰 | 근거 |
|----------|---------|------|
| CEO → 비서실장 | CEO 토큰 | 직접 명령 |
| 비서실장 → CIO (call_agent) | CEO 토큰 유지 | 핸드오프 체인 내 전파 |
| CIO → 전문가 (call_agent) | CEO 토큰 유지 | 핸드오프 체인 내 전파 |
| ARGOS 크론잡 → CIO | 크론잡 등록한 Human의 토큰 | executorUserId 바인딩 |
| 텔레그램 → 비서실장 | 텔레그램 연동된 사용자 토큰 | 채널 무관, 사용자 기준 |

### SDK 의존성 (SDK)

| ID | 요구사항 | 상세 |
|----|---------|------|
| SDK-1 | 사용 API 8개로 고정 | messages.create(), tool(), createSdkMcpServer(), hooks, env, maxTurns, permissionMode, allowedTools |
| SDK-2 | unstable API 사용 금지 | `unstable_*` 접두사 API는 Phase 1~4에서 절대 사용 안 함 |
| SDK-3 | SDK 업데이트 프로토콜 | 0.2.x 패치: 자동. 0.3.x: agent-loop.ts 수동 대응 + 테스트 |
| SDK-4 | SDK 제거 대비 | agent-loop.ts 인터페이스를 SDK 독립적으로 설계 |

### DB 제약 (DB)

| ID | 요구사항 | Phase |
|----|---------|-------|
| DB-1 | tier_level 상한 10 (CHECK 제약) | 3 |
| DB-2 | 비서 = 반드시 소유자 있음 (CHECK: is_secretary=true → owner_user_id NOT NULL) | 2 |
| DB-3 | 기존 문서 벡터화 배치 마이그레이션 (embedding NULL → 채우기) | 4 |
| DB-4 | 마이그레이션 무중단 (온라인, 서비스 중단 0) | 3 |
| DB-5 | 마이그레이션 롤백 스크립트 준비 (integer → enum 복원) | 3 |

### 오케스트레이션 (ORC)

| ID | 요구사항 | Phase |
|----|---------|-------|
| ORC-1 | 핸드오프 깊이 최대 5단계 (회사별 configurable) | 1 |
| ORC-2 | 병렬 핸드오프 최대 10개 (configurable) | 1 |
| ORC-3 | 에이전트 메타데이터 Soul 자동 주입 (DB → Soul 템플릿 변수 치환) | 1 |
| ORC-4 | tier → model 자동 매핑 (tier_configs 조회) | 1+3 |
| ORC-5 | Soul 템플릿 3종 기본 제공 (비서/매니저/전문가) | 2 |
| ORC-6 | 매니저 Soul에 교차 검증 + 충돌 처리 + 에러 처리 지침 필수 | 2 |
| ORC-7 | call_agent는 모든 에이전트에 기본 포함 (제거 불가) | 1 |

### Soul 템플릿 (SOUL)

| ID | 요구사항 |
|----|---------|
| SOUL-1 | 비서 Soul 자동 주입 변수: `{agent_list}`, `{owner_name}` |
| SOUL-2 | 매니저 Soul 자동 주입 변수: `{subordinate_list}`, `{department_name}` |
| SOUL-3 | 전문가 Soul 자동 주입 변수: `{tool_list}`, `{specialty}` |
| SOUL-4 | 모든 Soul에 금지 섹션 포함 (토큰 노출 방지, 범위 밖 행동 금지) |
| SOUL-5 | 매니저 Soul에 교차 검증(수치 대조) + 충돌 시 병기 + 에러 시 나머지 종합 지침 |
| SOUL-6 | agent-loop.ts에서 Soul 템플릿 변수를 DB 데이터로 치환 후 messages.create()에 전달 |

### 운영 (OPS) → 정량 목표: NFR-O1~O10, NFR-SC1~SC9

| ID | 요구사항 | 상세 |
|----|---------|------|
| OPS-1 | 동시 messages.create() 세션 제한 | 기본 10개. 초과 시 429 반환 |
| OPS-2 | 세션 타임아웃 | messages.create() 최대 120초. 초과 시 강제 종료 + 에러 반환 |
| OPS-3 | 메모리 모니터링 | 서버 메모리 80%+ 경고, 90%+ 신규 세션 거부 |
| OPS-4 | 서브프로세스 좀비 방지 | SDK 종료 후 cleanup 확인. 좀비 크론잡 정리 |
| OPS-5 | pgvector ARM64 호환 | Phase 4 시작 전 Docker 내 빌드 검증 |
| OPS-6 | 배포 무중단 | Docker graceful shutdown → 신규 컨테이너 시작 |

### NotebookLM (NLM)

| ID | 요구사항 | 상세 |
|----|---------|------|
| NLM-1 | 폴백 | MCP 실패 시 텍스트 브리핑으로 대체 (음성 없이 텍스트 텔레그램 전송) |
| NLM-2 | Google OAuth 크레덴셜 | 회사별 1개 Google 계정. 관리자 콘솔에서 OAuth 인증 플로우 |
| NLM-3 | 비동기 생성 | 음성 생성 비동기. CEO에게 '생성 요청됨' 즉시 알림 → 완료 시 텔레그램 전송 |
| NLM-4 | Phase 4 도구 범위 | `audio_briefing` + `notebook`만. mindmap/slides/flashcards/infographic는 Phase 5+ |

### 벡터 검색 (VEC)

| ID | 요구사항 | 상세 |
|----|---------|------|
| VEC-1 | 문서 chunk 분할 | 2,048 토큰 이상 시 자동 분할 (Gemini Embedding 제한) |
| VEC-2 | 벡터 생성 실패 시 문서 저장 진행 | embedding = NULL 허용 |
| VEC-3 | 기존 문서 배치 벡터화 | 마이그레이션 스크립트로 knowledge_docs 전체 벡터화 |
| VEC-4 | 유사도 임계값 + 반환 상한 | 기본: cosine ≥ 0.7, 상위 5건. 회사별 configurable |

### v3 신규 도메인 요구사항

#### n8n 보안 (N8N-SEC) — Sprint 2

| ID | 요구사항 | 상세 |
|----|---------|------|
| N8N-SEC-1 | 포트 5678 외부 차단 | Oracle Security List에서 localhost만 허용. 외부 curl → connection refused |
| N8N-SEC-2 | n8n 에디터 Admin 전용 | `N8N_DISABLE_UI=false` + Hono proxy `/admin/n8n-editor/*` → Admin JWT 검증. CEO JWT → 403 |
| N8N-SEC-3 | tag 기반 멀티테넌트 격리 | `?tags=company:{companyId}` 필수. 교차 조회 불가 (companyA → companyB 워크플로우 접근 차단) |
| N8N-SEC-4 | webhook HMAC 검증 | n8n webhook 엔드포인트에 HMAC 서명 검증 필수 |
| N8N-SEC-5 | Docker 리소스 상한 | `memory: 4G`, `cpus: '2'`. OOM 시 자동 재시작 (restart: unless-stopped) |
| N8N-SEC-6 | CORTHEX DB 직접 접근 금지 | n8n → CORTHEX PostgreSQL 직접 연결 불가. CORTHEX REST API 경유만 허용 |

#### Big Five 성격 (PER) — Sprint 1

| ID | 요구사항 | 상세 |
|----|---------|------|
| PER-1 | 4-layer sanitization | Layer 0: Key Boundary — soul-renderer.ts spread 순서 역전 (extraVars BEFORE built-in) + 6개 built-in 키 충돌 거부. Layer A: API Zod `z.number().int().min(0).max(100)`. Layer B: extraVars newline/delimiter strip + 200자 상한. Layer C: Template regex. (Stage 1 Research §2.3 R7) |
| PER-2 | personality extraVars 5개 개별 | `personality_openness`, `personality_conscientiousness`, `personality_extraversion`, `personality_agreeableness`, `personality_neuroticism` — soul-enricher.ts가 생성 (Tech Research personality-injector.ts 역할 통합) |
| PER-3 | 기본값 중립 50 | 새 에이전트 생성 시 5개 특성 모두 50. 역할별 프리셋은 별도 템플릿으로 제공 |
| PER-4 | Soul 주입 실패 fallback | renderSoul() extraVars 누락 시 fallback 문자열 주입 + worker log 경고. 에이전트 실행은 중단하지 않음 |
| PER-5 | 접근성 | 슬라이더 `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`. 키보드 좌우(1단위), Shift+화살표(10단위) |
| PER-6 | 슬라이더 행동 예시 툴팁 | 각 슬라이더 hover/focus 시 현재 값에 대한 에이전트 행동 예시 표시. Feature 5-3 성격 축 테이블 참조 (예: Openness 80 → "새로운 접근법을 적극 제안") |

#### 에이전트 메모리 (MEM) — Sprint 3

| ID | 요구사항 | 상세 |
|----|---------|------|
| MEM-1 | Zero Regression | 기존 `agent_memories` 테이블 데이터 단절 0건. 신규 observations/reflections 신규 테이블 + agent_memories 확장 (Option B 채택, L146/L943 참조) |
| MEM-2 | Tier별 Reflection 한도 | Tier 1-2(Sonnet/Opus): 무제한. Tier 3-4(Haiku): 주 1회. Haiku ≤ $0.10/day 비용 게이트 |
| MEM-3 | Reflection 크론 격리 | Reflection 크론 실패가 에이전트 실행에 영향 없음. 독립 워커 프로세스 |
| MEM-4 | 메모리 삭제 권한 | Admin만 Reflection/Planning 삭제 가능. CEO는 읽기만 |
| MEM-5 | Planning 적용 감사 로그 | Planning이 에이전트 행동에 적용될 때 `activity_logs`에 기록 (추적 가능성) |

#### PixiJS 가상 사무실 (PIX) — Sprint 4

| ID | 요구사항 | 상세 |
|----|---------|------|
| PIX-1 | 번들 크기 | PixiJS 8 + @pixi/react < 200KB gzipped (Go/No-Go #5, 204,800 bytes) |
| PIX-2 | WebGL → Canvas 폴백 | WebGL 미지원 브라우저에서 Canvas 2D 자동 전환 |
| PIX-3 | desktop-only | /office 페이지는 desktop 전용. 모바일에서 리스트 뷰 대체 (이름 + 상태 텍스트 + 색상 뱃지) |
| PIX-4 | 접근성 | NEXUS 노드 `aria-live="polite"` (상태 변경 시 스크린리더 알림). /office PixiJS 캔버스에는 aria-live 불필요 (시각적 보조 도구). 단, 모바일 리스트 뷰(PIX-3)에는 `aria-live="polite"` 적용 — 상태 변경 시 스크린리더가 에이전트 상태 업데이트 알림 |
| PIX-5 | 실패 격리 | `packages/office/` 독립 패키지. /office 렌더링 실패해도 기존 기능(Hub, Chat, NEXUS) 무영향 |
| PIX-6 | 데이터 소스 | activity_logs 테이블 tail (읽기 전용). 신규 테이블 없음. /ws/office 채널로 상태 이벤트 브로드캐스트 |

#### 마케팅 자동화 / 외부 API (MKT) — Sprint 2

| ID | 요구사항 | 상세 |
|----|---------|------|
| MKT-1 | 외부 API 키 관리 | 이미지/영상 엔진 API 키는 회사별 `company.settings` JSONB에 AES-256 암호화 저장. ⚠️ JSONB read-modify-write race 주의 (Deferred Item) — `jsonb_set` atomic update 또는 `SELECT FOR UPDATE` 적용 필수. 별도 `company_api_keys` 테이블 분리 검토 |
| MKT-2 | API 장애 fallback | n8n Error Workflow: timeout 30s → retry 2x → fallback 엔진 자동 전환 + Slack/Telegram 알림 |
| MKT-3 | 비용 귀속 | 외부 API(이미지/영상) 비용은 회사 외부 API 키로 결제. CORTHEX가 추적하지 않음 (n8n 실행 로그 확인) |
| MKT-4 | 콘텐츠 저작권 | AI 생성 콘텐츠 저작권 고지 필요 여부는 회사별 설정 (기본: OFF). 카드뉴스/숏폼에 "AI Generated" 워터마크 옵션 |
| MKT-5 | 플랫폼 API 변경 대응 | Instagram/TikTok/YouTube API 변경 시 n8n 노드 업데이트로 대응. CORTHEX 코드 수정 불필요 |

#### NEXUS 실시간 상태 (NRT) — Sprint 4

| ID | 요구사항 | 상세 |
|----|---------|------|
| NRT-1 | 상태 모델 | Brief 5상태(idle/working/speaking/tool_calling/error) + PRD 추가(degraded). NEXUS 노드는 4색 매핑 (idle→파란, active→초록, error→빨간, degraded→주황) |
| NRT-2 | heartbeat | 에이전트 상태 heartbeat 5초 간격. 15초 미응답 시 degraded 전환. 30초 미응답 시 error 전환 (Application layer 에이전트 상태 전환 — NFR-P15 WS keep-alive와 별개) |
| NRT-3 | WebSocket 브로드캐스트 | /ws/agent-status(기존): 상태 변경 이벤트. /ws/office(신규): 상태 + PixiJS 렌더링 페이로드 |
| NRT-4 | 상태 지연 | 실제 상태와 UI 표시 간 지연 ≤ 2초 (WebSocket 경유, polling 아님) |

### 도메인 요구사항 요약

| 카테고리 | 개수 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | 유지 |
|---------|------|---------|---------|---------|---------|----------|----------|----------|----------|------|
| 보안 (SEC) | 7 | 3 | 1 | — | — | — | — | — | — | 3 |
| SDK | 4 | 4 | — | — | — | — | — | — | — | — |
| DB | 5 | — | 1 | 3 | 1 | — | — | — | — | — |
| 오케스트레이션 (ORC) | 7 | 4 | 2 | 1 | — | — | — | — | — | — |
| Soul (SOUL) | 6 | 1 | 5 | — | — | — | — | — | — | — |
| 운영 (OPS) | 6 | 2 | — | — | 1 | — | — | — | — | 3 |
| NotebookLM (NLM) | 4 | — | — | — | 4 | — | — | — | — | — |
| 벡터 (VEC) | 4 | — | — | — | 4 | — | — | — | — | — |
| **v3 n8n 보안 (N8N-SEC)** | **6** | — | — | — | — | — | **6** | — | — | — |
| **v3 성격 (PER)** | **6** | — | — | — | — | **6** | — | — | — | — |
| **v3 메모리 (MEM)** | **5** | — | — | — | — | — | — | **5** | — | — |
| **v3 PixiJS (PIX)** | **6** | — | — | — | — | — | — | — | **6** | — |
| **v3 마케팅 (MKT)** | **5** | — | — | — | — | — | **5** | — | — | — |
| **v3 NEXUS 상태 (NRT)** | **4** | — | — | — | — | — | — | — | **4** | — |
| **총** | **75** | **14** | **9** | **4** | **10** | **6** | **11** | **5** | **10** | **6** |

## Innovation & Novel Patterns

### 감지된 혁신 영역

CORTHEX의 혁신은 개별 기능이 아니라 **혁신의 조합**에 있다. v2의 4대 혁신(Soul 오케스트레이션 + call_agent + 비개발자 조직 설계 + CLI Max 과금)이 **"조직도를 그리면 AI 팀이 움직인다"**를 실현했다면, v3의 4대 혁신(OpenClaw + Big Five + Memory + n8n)은 **"AI 팀이 개성을 갖고, 성장하며, 살아있는 모습을 보여주고, 스스로 자동화를 실행한다"**를 실현한다.

**Brief 3대 문제 → v3 혁신 매핑:**
- **블랙박스 문제** (에이전트가 뭘 하는지 모름) → **OpenClaw** 가상 사무실로 실시간 시각화 (혁신 5)
- **획일적 행동** (모든 에이전트가 동일하게 반응) → **Big Five** 성격 시스템으로 에이전트별 행동 분화 (혁신 6)
- **학습 단절** (매번 처음부터 시작) → **에이전트 메모리** 3단계로 경험 축적·성장 (혁신 7)
- **자동화 부재** (비개발자가 자동화 못 함) → **n8n** 드래그앤드롭 워크플로우 (혁신 8)

**v2 → v3 혁신 계층:**

| 계층 | v2 혁신 (기반 — 유지) | v3 혁신 (확장 — 신규) |
|------|---------------------|---------------------|
| 실행 | Soul 오케스트레이션 + call_agent N단계 | Big Five 성격 → Soul extraVars 주입 (혁신 1 강화) |
| 조직 설계 | NEXUS 비개발자 조직 설계 | OpenClaw 가상 사무실 (조직이 살아있는 것을 '보여줌') |
| 과금 | CLI Max 월정액 | — (유지) |
| 자동화 | — (ARGOS 크론 한정) | n8n 워크플로우 자동화 확장 (Brief §4 Layer 2) |
| 학습 | memory-extractor 1단계 (키워드 추출·벡터 저장) | 에이전트 메모리 3단계 (관찰→반성→계획) |

---

### v2 기반 혁신 (유지)

**혁신 1: Soul = 오케스트레이션 (시장 유일)**

에이전트의 시스템 프롬프트(Soul)가 곧 라우팅 규칙이라는 접근. 2026년 3월 기준 시장에서 유일하다.

| 비교 | CORTHEX | CrewAI | LangGraph | AutoGen |
|------|---------|--------|-----------|---------|
| 워크플로우 변경 | Soul 텍스트 편집 (코드 0줄) | Python 코드 30~50줄 | 그래프 재정의 20~40줄 | Agent 클래스 수정 30줄+ |
| 배포 필요 | 불필요 (즉시 반영) | 필요 | 필요 | 필요 |
| 변경 주체 | 비개발자 (Admin) | 개발자만 | 개발자만 | 개발자만 |

**뒤집는 가정:** "오케스트레이션은 코드로 정의해야 한다" → "시스템 프롬프트가 곧 라우팅이다"

**핵심 리스크:** LLM 지시 준수율에 100% 의존. PoC 80%, Soul 튜닝 후 95% 목표. 폴백: 1) 명시적 규칙 → 2) 에이전트 태그 → 3) 룰 기반 프리라우팅 (~20줄)

**v3 강화:** Big Five 성격 시스템이 Soul에 `personality_*` extraVars를 주입하여 동일 Soul 템플릿에서도 에이전트별 행동 분화. 예: 성실성 90 에이전트는 체크리스트 자동 생성 + 리뷰 요청, 성실성 20 에이전트는 요약 위주 빠른 응답. Soul = 오케스트레이션 + **개성**.

**혁신 2: call_agent 도구 패턴 (N단계 핸드오프)**

SDK 서브에이전트의 1단계 한계를 도구 레벨에서 우회하는 독창적 해법.

| SDK | 공식 서브에이전트 깊이 | call_agent 유사 패턴 |
|-----|---------------------|-------------------|
| Claude Agent SDK | 1단계 (PoC Test 7 확인) | CORTHEX call_agent MCP 도구 |
| OpenAI Agents SDK | 1단계 (handoff) | 비공식적으로 가능하나 토큰 전파 미보장 |
| Google ADK | 1단계 (sub_agents) | 미지원 |
| CrewAI | 2단계 (hierarchical) | 커스텀 태스크 체인 |

**혁신 3: 비개발자 AI 조직 설계 (시장 공백)**

| 제품 | 타겟 | 비개발자 사용 | 다중 에이전트 깊이 |
|------|------|-------------|-----------------|
| CORTHEX | CEO, 1인 사업가 | ✅ NEXUS 드래그&드롭 | N단계 (기본 5, configurable) |
| CrewAI Studio | 개발자 | ❌ Python 필수 | 2단계 |
| LangGraph Studio | 개발자 | ❌ 코드 필수 | 그래프 정의만큼 |
| Dify.ai | 기획자~개발자 | △ 워크플로우 개념 필요 | 1~2단계 |
| Coze | 일반 사용자 | △ 봇 빌더 | 단일 에이전트 |

**혁신 4: CLI Max 월정액 과금 모델**

경쟁자 API 콜당 과금(에이전트 10명 = 월 $500+) vs CORTHEX CLI Max 월정액($220, 2026-03 기준). 핸드오프 체인 전체에서 최초 명령자의 CLI 토큰이 전파되어 비용 귀속 투명.

---

### v3 신규 혁신

**혁신 5: OpenClaw 가상 사무실 — "AI 팀이 일하는 모습을 본다" (Sprint 4)**

AI 에이전트의 실시간 상태를 PixiJS 8 픽셀 캐릭터로 시각화. CEO가 `/office`를 열면 에이전트들이 각자 책상에서 타이핑하고, 도구를 사용하고, 대화하는 모습이 보인다. 텍스트 로그가 아닌 **시각적 투명성**.

**뒤집는 가정:** "에이전트 상태는 로그로 확인한다" → "에이전트가 일하는 모습을 직접 본다"

| 비교 | CORTHEX v3 OpenClaw | AI Town (Stanford) | AgentVerse | Crew Studio |
|------|--------------------|--------------------|-----------|-------------|
| 목적 | **실제 비즈니스 에이전트** 상태 시각화 | 연구용 시뮬레이션 | 연구 데모 | 개발자 디버그 |
| 데이터 소스 | `activity_logs` 실시간 tail (PostgreSQL LISTEN/NOTIFY + 폴링 하이브리드, 실제 실행 로그) | 자체 시뮬레이션 루프 | 자체 시뮬레이션 | 실행 로그 텍스트 |
| 엔진 연결 | `agent-loop.ts` 읽기 전용 (엔진 변경 0) | 독립 엔진 | 독립 엔진 | — |
| 비즈니스 통합 | 485 API + 86 테이블 위 시각화 | 없음 | 없음 | 일부 |
| 실시간 | WebSocket `/ws/office` ≤ 2초 지연 (NRT-4) | 1~5초 | 비실시간 | 비실시간 |

**핵심 리스크:** PixiJS 8 번들 < 200KB gzipped (Go/No-Go #5). tree-shaking으로 `Sprite`, `AnimatedSprite`, `Container`, `TilingSprite`, `Assets`, `Ticker` 6개 클래스만 등록 시 달성 가능 (Stage 1 Research 검증). WebGL 2 데스크탑 지원률 97%+ (caniuse.com 2026-03 기준). WebGL → Canvas 2D 자동 폴백 (PIX-2).

**검증:** Sprint 4 시작 전 에셋 품질 PM 승인 (Go/No-Go #8). `/office` 첫 접속 시 에이전트 working 상태 목격률 90%+ 목표 (테스트 태스크 예약 실행으로 보장).

**혁신 6: Big Five 성격 시스템 — "같은 LLM, 다른 개성" (Sprint 1)**

OCEAN 모델 5축(외향성·성실성·개방성·친화성·신경성)을 0-100 정수 슬라이더로 제어. Admin이 슬라이더를 조정하면 에이전트의 응답 톤·스타일·행동이 즉시 변화한다. 코드 변경 없이, 배포 없이, Soul 편집 없이 — **슬라이더 하나로 에이전트 개성이 바뀐다.**

**뒤집는 가정:** "에이전트 행동 변경은 프롬프트 엔지니어링이다" → "슬라이더로 성격을 설정한다"

| 비교 | CORTHEX v3 Big Five | CrewAI | AutoGen | Character.AI |
|------|--------------------|---------|---------|----|
| 성격 제어 방식 | 5축 슬라이더 (0-100 정수) | — (없음) | — (없음) | 자연어 설명 |
| 정량적 제어 | ✅ 숫자 기반 재현 가능 | ❌ | ❌ | ❌ (비정량) |
| 비개발자 사용 | ✅ Admin 슬라이더 UI | ❌ | ❌ | ✅ |
| 비즈니스 조직 통합 | ✅ 부서·역할별 프리셋 | ❌ | ❌ | ❌ |
| 보안 | 4-layer sanitization (PER-1) | — | — | 서비스 의존 |

**구현 패턴:** `soul-enricher.ts`가 DB에서 personality_traits JSONB → 5개 개별 extraVars (`personality_openness`, `personality_conscientiousness`, `personality_extraversion`, `personality_agreeableness`, `personality_neuroticism`) 생성 → `soul-renderer.ts` renderSoul()에서 Soul 템플릿에 주입.

**핵심 리스크:** 4-layer sanitization 미흡 시 prompt injection (R7). Layer 0(Key Boundary) → Layer A(API Zod 0-100) → Layer B(extraVars strip) → Layer C(Template regex) 순서로 방어 (Stage 1 Research §2.3 R7 검증).

**검증:** Soul 규칙 추가 → 행동 변화 A/B 10회. 성실성 80 vs 20에서 체크리스트 생성 여부 차이 확인. Go/No-Go #2: extraVars 키 존재 + 빈 문자열 미허용.

**혁신 7: 에이전트 메모리 3단계 — "AI가 경험에서 배운다" (Sprint 3)**

관찰(Observation) → 반성(Reflection) → 계획(Planning). 에이전트가 매 태스크에서 raw 관찰을 기록하고, 크론이 이를 반성하여 패턴을 추출하고, 다음 태스크에서 과거 경험을 계획에 활용한다. 6개월 후 에이전트가 처음보다 훨씬 적은 시행착오로 동일 태스크를 완료한다.

**뒤집는 가정:** "LLM은 stateless다" → "에이전트가 축적된 경험으로 성장한다"

| 비교 | CORTHEX v3 Memory | AutoGen/AG2 Memory | CrewAI Memory | LangGraph Checkpointer |
|------|-------------------|-------------------|-------------|----------------------|
| 아키텍처 | 3단계 (관찰→반성→계획) | Teachability + Mem0 통합 (벡터+KV+그래프 하이브리드) | 4-type (short/long/entity/contextual) | 상태 체크포인트 (비메모리) |
| 세션 간 지속 | ✅ PostgreSQL + pgvector | ✅ Mem0 long-term 또는 Teachability 벡터DB | ✅ SQLite3 long-term + ChromaDB RAG | ❌ (체크포인트만) |
| 반성(Reflection) | ✅ 크론 LLM 요약 → 패턴 추출 | ❌ (저장·검색만, 능동적 반성 없음) | ❌ (저장·검색만) | ❌ |
| 성장 측정 | ✅ 재수정 횟수 감소 추적 | ❌ | ❌ | ❌ |
| 비즈니스 조직 통합 | ✅ Tier별 Reflection 한도 + 비용 제어 (MEM-2) | ❌ (범용 프레임워크) | ❌ (범용 프레임워크) | ❌ |
| Zero Regression | ✅ Option B — 기존 agent_memories 확장 | — | — | — |

**구현 패턴 (Option B 확정 — Stage 0 GATE):**
- 신규 `observations` 테이블 (raw INPUT 계층) + 기존 `agent_memories` 테이블 확장 (`memoryTypeEnum`에 `'reflection'`, `'observation'` 추가)
- `memory-reflection.ts` 신규 분리 (memory-extractor.ts와 독립 — race condition 방지, E8 경계 준수)
- 3단계 흐름: 실행 완료 → observations(raw) → memory-reflection.ts 크론 → agent_memories[reflection] (pgvector 임베딩)
- Neon zero-downtime migration 패턴 적용

**핵심 리스크:** Reflection 크론 LLM 비용 가변. Tier 3-4(Haiku): 주 1회, ≤ $0.10/day 게이트 (MEM-2). Sprint 3 블로커: PRD Tier별 비용 한도 확정 선행 필수.

**검증:** Go/No-Go #4: 기존 agent_memories 데이터 단절 0건. 동일 태스크 재수정 횟수 6개월 추적.

**혁신 8: n8n 워크플로우 자동화 — "코드 없이 비즈니스 자동화" (Sprint 2, Brief §4 Layer 2)**

기존 자체 워크플로우 엔진(v2에서 500 에러 반복, 유지보수 비용 누적)을 n8n Docker로 대체. Admin이 드래그앤드롭으로 복잡한 비즈니스 자동화를 구축한다. CORTHEX 코드 수정 없이 플랫폼 API 변경에 대응 (n8n 노드 업데이트만으로 충분).

**뒤집는 가정:** "에이전트 자동화는 코드로 짜야 한다" → "드래그앤드롭 워크플로우 빌더로 비개발자가 자동화를 만든다"

| 비교 | CORTHEX v3 + n8n | Zapier | Make | 자체 구현 |
|------|-----------------|--------|------|---------|
| 호스팅 | Self-hosted Docker (데이터 자사 VPS) | 클라우드 (데이터 외부) | 클라우드 (데이터 외부) | 자사 서버 |
| 비용 | Docker 리소스만 (추가 SaaS 비용 없음) | $20~$100+/월 | $9~$29+/월 | 개발 인력비 |
| 에이전트 통합 | ✅ CORTHEX REST API → 에이전트 직접 트리거 | ❌ | ❌ | 커스텀 |
| 보안 | 포트 5678 내부망 + Hono proxy + tag 격리 + per-company HMAC | 클라우드 의존 | 클라우드 의존 | 자체 |
| AI 도구 연동 | n8n 노드 (Flux, DALL·E, Runway, Kling 등) | 제한적 | 제한적 | 직접 구현 |

**구현 패턴:** `n8nio/n8n:2.12.3` ARM64 native Docker. `N8N_DISABLE_UI=false` + Hono reverse proxy `/admin/n8n-editor/*` (Admin JWT 전용). 워크플로우는 `?tags=company:{companyId}` 태그로 멀티테넌트 격리 (N8N-SEC-3). 기존 ARGOS 크론잡 유지 — n8n은 **신규 자동화 전용**.

**핵심 리스크:** n8n Docker ARM64 리소스 경합 (R6). 4G/2CPU 제한 (N8N-SEC-5). OOM 시 restart: unless-stopped + healthcheck 자동 복구.

**검증:** Go/No-Go #3: 포트 5678 외부 차단 + Hono 프록시 인증 통과. Admin당 월 활성 워크플로우 수 추적.

---

### 사용자 체감 혁신 vs 기술 혁신

**사용자가 느끼는 혁신 (CEO 김도현 관점):**
1. "그림 그렸더니 진짜 움직인다" — NEXUS + Soul + call_agent 조합의 표면 (v2)
2. "코드 안 바꿨는데 행동이 달라졌다" — Soul 편집의 즉시 반영 (v2)
3. "출퇴근길에 듣는다" — 음성 브리핑의 접근성 (v2)
4. **"사무실이 살아있다"** — `/office`에서 픽셀 캐릭터가 실시간 활동 (v3 OpenClaw)
5. **"이 에이전트는 성격이 있다"** — 같은 질문에 전략 담당과 고객 대응 담당이 다르게 답한다 (v3 Big Five)
6. **"이 에이전트가 성장했다"** — 한 달 전보다 보고서 품질이 눈에 띄게 좋아졌다 (v3 Memory)
7. **"개발자 없이 자동화를 만들었다"** — 드래그앤드롭으로 마케팅 파이프라인 6단계 완성 (v3 n8n)

**기술 혁신 (개발팀 관점):**
1. Soul = 오케스트레이션 — 시스템 프롬프트가 라우팅 규칙 (v2)
2. call_agent N단계 — 도구 핸들러에서 messages.create() 재귀 spawn (v2)
3. SDK 1파일 격리 — agent-loop.ts에서 벤더 종속 최소화 (v2)
4. CLI 토큰 핸드오프 체인 — 핸드오프 전체에 명령자 토큰 전파 (v2)
5. **soul-enricher.ts extraVars 확장** — 4-layer sanitization으로 안전한 personality 주입 (v3)
6. **Option B 메모리 확장** — 기존 테이블 활용 + observations 신규 + memory-reflection.ts 분리 (v3)
7. **Hono reverse proxy + tag 격리** — n8n 멀티테넌트를 CORTHEX 인증으로 투명하게 래핑 (v3)
8. **PixiJS 8 tree-shaking** — 6개 클래스만 extend()로 200KB 미만 달성 (v3)

### 시장 타이밍: 왜 지금인가

2026년 3월, Claude·OpenAI·Google이 동시에 에이전트 SDK를 공식 출시했다. 이는 **인프라 레이어가 commodity화**된 시점이다. AWS가 나왔을 때 SaaS가 폭발한 것처럼, 에이전트 SDK가 commodity화된 지금이 **application 레이어 혁신**을 잡을 적기다.

v3의 타이밍은 더 정확하다: **에이전트가 "일을 시키는 도구"에서 "조직의 구성원"으로 진화하는 변곡점**이다. 성격(Big Five)·메모리(3단계)·시각적 존재감(OpenClaw)이 합쳐지면 에이전트는 더 이상 API 콜이 아니라 **팀원**이 된다. 2026년 하반기에 경쟁자가 이 조합을 따라하려면 485 API + 86 테이블의 엔터프라이즈 기반을 먼저 구축해야 한다 — 최소 6개월 선점 우위. (근거: v2 개발 6개월(2025-09~2026-03) + v3 4 Sprint(~4개월) = 경쟁자가 처음부터 시작 시 10개월, CORTHEX v2 기반 위 v3 4개월 = 6개월 차이.)

### 검증 접근법

**v2 혁신 검증 (Phase 1~4 — 완료):**

| 혁신 | 검증 방법 | 시점 | 성공 기준 |
|------|---------|------|---------|
| Soul 오케스트레이션 | Soul 규칙 추가 → 행동 변화 A/B 10회 | Phase 2 | 8/10회+ 반영 (80%+) |
| call_agent N단계 | 3단계 핸드오프 통합 테스트 | Phase 1 1주차 | E2E ≤ 60초 |
| call_agent 깊이 vs 성능 | 1~5단계 핸드오프 latency 벤치마크 | Phase 1 | 5단계 ≤ 90초, 메모리 ≤ 50MB |
| 비개발자 조직 설계 | CEO 김도현 첫 사용 테스트 (튜토리얼 없이) | Phase 3 | ≤ 10분 완료 |
| CLI 토큰 전파 | 3단계 핸드오프 후 비용 로그 검증 | Phase 1 | 전 단계 동일 토큰 |
| CLI Max 비용 우위 | 월간 사용 비용 vs API 과금 비교 | Phase 2 후 1개월 | 경쟁자 대비 60%+ 절감 |

**v3 혁신 검증 (Sprint 1~4):**

| 혁신 | 검증 방법 | Sprint | 성공 기준 | Go/No-Go |
|------|---------|--------|---------|----------|
| Big Five 성격 | 성실성 80 vs 20 행동 차이 A/B 10회 | Sprint 1 | 8/10회+ 차이 확인 | #2: extraVars 키 존재 + 빈 문자열 미허용 |
| n8n 워크플로우 | Admin 이수진 마케팅 파이프라인 6단계 E2E | Sprint 2 | 트리거 → 에이전트 실행 → 결과 90%+ 성공 | #3: 포트 5678 외부 차단 + 프록시 인증 |
| 에이전트 메모리 | 동일 태스크 3회 반복 → 품질 향상 측정 | Sprint 3 | 3회차가 1회차보다 재수정 ≤ 50% | #4: agent_memories 단절 0건 |
| OpenClaw /office | CEO 김도현 첫 접속 시 에이전트 working 상태 목격 | Sprint 4 | 90%+ 목격률 (테스트 태스크 예약) | #5: 번들 < 200KB gzipped |

**v3 품질 게이트 (전 Sprint 공통):**

| 게이트 | 검증 방법 | Sprint | 성공 기준 | Go/No-Go |
|--------|---------|--------|---------|----------|
| v2 회귀 방지 | 485 API smoke-test + 10,154 기존 테스트 전통과 | 전 Sprint | 200 OK 100% + 테스트 0 fail | #1: 기존 테스트 전통과 |
| UXUI Layer 0 | ESLint 하드코딩 색상 + Playwright dead button | 전 Sprint | 각 0건 | #6: ESLint 0 + Playwright 0 |
| Reflection 비용 | Tier별 Reflection 크론 LLM 비용 모니터링 | Sprint 3+ | Haiku ≤ $0.10/day (MEM-2) | #7: Tier별 비용 한도 초과 시 크론 일시 중지 |
| 에셋 품질 | AI 생성 스프라이트 PM 최종 승인 | Sprint 4 시작 전 | PM 승인 완료 | #8: 에셋 미승인 시 Sprint 4 미착수 |

### 혁신 리스크 완화

**v2 혁신 리스크 (유지):**

| 혁신 리스크 | 폴백 전략 |
|-----------|---------|
| Soul 라우팅 정확도 부족 (<50%) | 1) 명시적 규칙 → 2) 에이전트 태그 → 3) 룰 기반 프리라우팅 (~20줄) |
| call_agent 3단계 핸드오프 실패 | 1) env 전달 → 2) 환경변수 클리닝 → 3) 2단계로 축소 |
| call_agent 5단계 latency 초과 | ORC-1 핸드오프 깊이 상한 조정 (기본 5 → 3으로 축소) |
| NEXUS UX 비개발자에게 복잡 | 기본 조직 자동 생성 원클릭 + 간단 튜토리얼 |
| CLI Max 정책 변경 | API 과금 대비용 agent-loop.ts에 API 키 모드 추가 (~10줄) |

**v3 혁신 리스크 (신규):**

| 혁신 리스크 | 폴백 전략 | Sprint | Go/No-Go |
|-----------|---------|--------|----------|
| PixiJS 8 번들 200KB 초과 (R1) | tree-shaking 6개 클래스만. 실패 시 Canvas 2D 최소 구현 (번들 0KB 추가) | Sprint 4 | #5 |
| n8n Docker ARM64 리소스 경합 (R6) | 4G/2CPU 제한 + OOM restart. 극단 시 n8n 제거 + ARGOS 크론 유지 | Sprint 2 | #3 |
| personality_traits prompt injection (R7) | 4-layer sanitization (PER-1). 0-100 정수만 통과, 문자열 완전 차단 | Sprint 1 | #2 |
| AI 스프라이트 재현 불가능성 (R8) | seed/deterministic 생성 도구 사용. 실패 시 오픈소스 LPC Sprite Sheet | Sprint 4 | #8 |
| Reflection 크론 LLM 비용 폭주 | Tier별 한도 (MEM-2): Haiku ≤ $0.10/day. 초과 시 크론 일시 중지. DB: advisory lock으로 동시 실행 방지, API: rate limit 준수 (messages.create() 분당 상한) | Sprint 3 | #7 |
| n8n 에디터 보안 공격 표면 | HMAC per-company + CSRF Origin + Hono proxy rate limit 100 req/min | Sprint 2 | #3 |
| 기존 agent_memories 데이터 단절 | Option B 기존 확장 (대체 아님). Neon zero-downtime migration | Sprint 3 | #4 |

## Technical Architecture Context

### Project-Type Overview

CORTHEX는 3가지 타입의 복합 제품이다. v3에서 SaaS B2B 비중이 증가한다 (워크플로우 자동화 + 멀티테넌트 확장):

**v2 → v3 타입 비중 변화:**

| 타입 | v2 | v3 | 변화 이유 |
|------|-----|-----|----------|
| web_app | 40% | 40% | OpenClaw /office (PixiJS 8 SPA) 추가로 유지 |
| saas_b2b | 30% | 35% | n8n 워크플로우 연동, 에이전트 메모리 Tier별 관리, Big Five 성격 시스템 Admin 관리 |
| developer_tool | 30% | 25% | 상대적 비중 감소 (기존 SDK 엔진·Hook·MCP 안정화 완료) |

- **web_app (40%)**: React 19 SPA, 실시간 WebSocket (v2 16채널 + v3 /ws/office = 17채널), 허브/관리자 콘솔/NEXUS + OpenClaw `/office` 4개 프론트엔드.
- **saas_b2b (35%)**: 회사별 멀티테넌트, N단계 티어, Admin/Human 역할 관리, n8n tag 기반 워크플로우 격리, Big Five 성격 Admin 편집, 에이전트 메모리 Tier별 Reflection 한도. 팀 단위 AI 인프라.
- **developer_tool (25%)**: Claude Agent SDK 기반 에이전트 엔진 (messages.create()), MCP 서버(스케치바이브, NotebookLM), Hook 5개 보안 체계. 개발자가 확장하는 플랫폼.

### 멀티테넌트 모델 (SaaS B2B)

**v2 기본 격리 (유지):**

| 항목 | 설계 |
|------|------|
| 격리 수준 | Row-level (company_id FK). 별도 DB 아님 |
| 데이터 격리 | 모든 쿼리에 company_id WHERE 조건 (Drizzle ORM `getDB(ctx.companyId)` 패턴으로 자동 주입 — v2 Epic 1에서 확정) |
| 스키마 격리 | 공유 스키마. 회사별 커스텀 없음 |
| 에이전트 격리 | 회사별 독립 에이전트·부서·도구 |
| CLI 토큰 격리 | 회사별 Human이 각자 토큰 등록. 교차 사용 불가 |
| 세션 격리 | messages.create() 프로세스 단위. env 독립 주입 + 임시 파일 경로 `/tmp/{sessionId}/` 분리로 프로세스 간 충돌 방지 |

**v3 멀티테넌트 확장 (Sprint별):**

| 항목 | 격리 방식 | Sprint | 근거 |
|------|---------|--------|------|
| n8n 워크플로우 | `?tags=company:{companyId}` 태그 기반 격리. companyA → companyB 워크플로우 접근 차단 (N8N-SEC-3) | Sprint 2 | n8n API 태그 필터 기본 제공 |
| n8n webhook | HMAC 서명 검증 + company:{companyId} 태그 매칭 (N8N-SEC-4) | Sprint 2 | 외부 webhook 위조 방지 |
| n8n 에디터 UI | Admin JWT 검증. `Hono proxy /admin/n8n-editor/*` → Admin role만 접근. CEO JWT → 403 (N8N-SEC-2) | Sprint 2 | Admin 전용 관리 도구 |
| Big Five 성격 | agents 테이블 personality_traits JSONB. company_id FK → 교차 회사 에이전트 접근 불가 | Sprint 1 | 기존 row-level 격리 활용 |
| 에이전트 메모리 | observations 테이블 + agent_memories 확장. agent_id FK → company_id 간접 격리 (agent 소속 회사 기준) | Sprint 3 | MEM-1 Zero Regression |
| Reflection 크론 | company_id 단위 독립 실행. memory-reflection.ts 격리 워커 (MEM-3) | Sprint 3 | 교차 회사 Reflection 오염 방지 |
| /ws/office | WebSocket 채널 `/ws/office`에서 company_id별 브로드캐스트 분리. 타 회사 에이전트 상태 미노출 | Sprint 4 | 기존 WS 격리 패턴 재활용 |
| 외부 API 키 | company.settings JSONB 내 AES-256 암호화. 회사별 독립 키 (MKT-1). ⚠️ JSONB read-modify-write race 주의 — `jsonb_set` atomic update 또는 별도 `company_api_keys` 테이블 분리 검토 (Deferred Item) | Sprint 2 | 교차 회사 API 키 유출 방지 |

### 권한 매트릭스 (RBAC)

**v2 기본 RBAC (유지):**

| 역할 | 허브 | 관리자 콘솔 | NEXUS | Soul 편집 | 에이전트 CRUD | Human CRUD | 비서 할당 |
|------|---------|-----------|-------|----------|------------|-----------|---------|
| Admin | ✅ | ✅ | ✅ 편집 | ✅ | ✅ | ✅ | ✅ |
| CEO/Human (비서 있음) | ✅ 비서 경유 | ❌ | ✅ 읽기 | ❌ | ❌ | ❌ | ❌ |
| Human (비서 없음) | ✅ 직접 선택 | ❌ | ✅ 읽기 | ❌ | ❌ | ❌ | ❌ |

**v3 RBAC 확장:**

| 역할 | Big Five 슬라이더 | n8n 에디터 | n8n 결과 읽기 | /office 뷰 | 메모리 읽기 | 메모리 삭제 | Reflection 설정 | 외부 API 키 |
|------|-----------------|-----------|-------------|-----------|-----------|-----------|---------------|-----------|
| Admin | ✅ 편집 | ✅ (Hono proxy `/admin/n8n-editor/*`) | ✅ | ✅ (관찰 전용) | ✅ | ✅ (MEM-4) | ✅ (Tier별 한도, 크론 주기) | ✅ (AES-256 저장) |
| CEO/Human (비서 있음) | ❌ | ❌ (403) | ✅ (n8n 결과 뷰) | ✅ (메인 사용) | ✅ (읽기만, MEM-4) | ❌ | ❌ | ❌ |
| Human (비서 없음) | ❌ | ❌ | ✅ | ✅ | ✅ (읽기만) | ❌ | ❌ | ❌ |

**v3 RBAC 결정 근거:**
- **Big Five 슬라이더**: Admin 전용. 에이전트 성격은 조직 설계의 일부이므로 CEO/Human이 임의 변경하면 일관성 파괴
- **n8n 에디터**: Admin 전용 (N8N-SEC-2). 워크플로우 오류가 전사 자동화에 영향. CEO는 결과만 읽기
- **메모리 삭제**: Admin만 가능 (MEM-4). Reflection/Planning 삭제는 에이전트 성장 데이터 소실이므로 신중하게
- **/office**: 전 역할 접근 가능. 읽기 전용 시각화이므로 보안 리스크 없음

### 구독 및 과금 (Subscription)

**v2 과금 모델 (유지):**

| 항목 | 설계 |
|------|------|
| 과금 모델 | CLI Max 월정액 기반 ($220/인, 2026-03 기준). CORTHEX 자체 추가 과금 없음 (v2 Phase 1~4, v3 Sprint 1~4) |
| 토큰 비용 | Human 개인 CLI Max 구독으로 충당 |
| 비용 추적 | ~~CLI 토큰 비용 추적 삭제~~ — CLI Max 월정액이므로 토큰 비용 추적 불필요 (GATE 결정 2026-03-20). 서버 운영 비용(n8n Docker, Reflection LLM, Embedding)은 NFR 내 인프라 모니터링으로 관리. 기존 costs.ts/cost-aggregation.ts → v3에서 제거 대상 (마이그레이션: Epic/Story에서 확정) |
| 비용 최적화 | N단계 티어로 저비용 모델 자동 배정 (Tier 4 = Haiku). 별도 비용 대시보드 없음 |

**v3 추가 비용 요소:**

| 항목 | 비용 주체 | 상한 | Sprint |
|------|---------|------|--------|
| n8n Docker 인프라 | 서버 운영 (VPS 동일 서버) | memory: 4G, cpus: 2 (N8N-SEC-5) | Sprint 2 |
| Reflection 크론 LLM | CLI Max 월정액 내 | Tier 3-4: 주 1회, Haiku ≤ $0.10/day (MEM-2) | Sprint 3 |
| 외부 API (이미지/영상) | 회사 자체 API 키 결제 | CORTHEX 미추적 (MKT-3) | Sprint 2 |
| Gemini Embedding (Memory) | 서버 운영 | 기존 Epic 10 Embedding 예산 공유 (월 $5 이하 NFR) | Sprint 3 |

**Phase 5+ 과금 검토 후보 (v2 유지 + v3 추가):**

| 모델 | 설명 | v3 고려사항 |
|------|------|------------|
| 회사 월정액 (에이전트 수 기반) | 에이전트 10명 이하 무료 → 초과 시 과금 | Big Five + Memory가 에이전트 가치를 높이므로 per-agent 과금 정당화 가능 |
| Human 좌석 단위 | Human 5명 이하 무료 → 초과 시 과금 | v3 /office 뷰는 전 역할 접근 가능 → 좌석 과금 시 /office 제한 정책 필요 |
| n8n 워크플로우 실행 횟수 | 월 1,000회 무료 → 초과 과금 | n8n Docker 리소스가 서버에 직접 영향이므로 사용량 과금 합리적 |
| 하이브리드 | 에이전트 수 + 실행 시간 복합 | 가장 공정하나 구현 복잡도 높음 |

### 통합 목록 (Integrations)

**v2 기존 통합 (유지):**

| 통합 | 프로토콜 | 방향 | Phase | 상태 |
|------|---------|------|-------|------|
| Claude Agent SDK | npm 패키지 (messages.create()) | 서버→SDK CLI | 1 | ✅ v2 완료 |
| 텔레그램 봇 | HTTP API | 양방향 (메시지 수신/전송) | 유지 | ✅ v2 완료 |
| KIS 증권 API | REST | 서버→KIS (읽기 전용) | 유지 | ✅ v2 완료 |
| NotebookLM | MCP (29개 도구) | 서버→Google | 4 | ✅ v2 완료 |
| 스케치바이브 CLI | MCP Stdio | Claude Code→서버 | 4 | ✅ v2 완료 |
| Gemini Embedding | REST API (text-embedding-004) | 서버→Google | 4 | ✅ v2 완료 (Epic 10) |
| ARGOS 크론잡 | 내부 스케줄러 | 서버 내부 | 유지 | ✅ v2 완료 |
| PostgreSQL + pgvector | Drizzle ORM + `@pgvector/drizzle` | 서버→Neon DB | 유지 | ✅ v2 완료 |
| WebSocket | Bun WS (16 채널) | 서버↔브라우저 (실시간) | 유지+확장 | ✅ v2 완료, v3에서 17채널로 확장 |

**v3 신규 통합 (Sprint별):**

| 통합 | 프로토콜 | 방향 | Sprint | 보안 격리 | 상세 |
|------|---------|------|--------|---------|------|
| n8n Docker | REST API + Editor UI (Hono reverse proxy `/admin/n8n/*`, `/admin/n8n-editor/*`) | 서버↔n8n Docker (포트 5678 localhost) | Sprint 2 | 포트 외부 차단(N8N-SEC-1), Admin JWT(N8N-SEC-2), tag 격리(N8N-SEC-3), per-company HMAC(N8N-SEC-4), Docker 4G/2CPU(N8N-SEC-5), proxy rate limit(100 req/min/Admin) | `n8nio/n8n:2.12.3` ARM64 native. DB 직접 접근 금지(N8N-SEC-6). restart: unless-stopped + healthcheck |
| n8n 에디터 UI | HTTP (Hono proxy `/admin/n8n-editor/*`) | 서버→n8n Docker → Admin 브라우저 | Sprint 2 | Admin JWT only, `N8N_DISABLE_UI=false` | Admin이 워크플로우 직접 편집. CEO → 403 |
| OpenClaw /office | WebSocket `/ws/office` (17번째 채널, per-company 연결 상한 20, 초과 시 idle 연결 graceful eviction) | 서버→브라우저 (실시간) | Sprint 4 | company_id별 브로드캐스트 분리 | PixiJS 8 렌더링 페이로드: 에이전트 위치·상태·애니메이션. activity_logs tail 읽기 전용(PIX-6) |
| Memory Reflection 크론 | Gemini Embedding API (text-embedding-004) | memory-reflection.ts → Google → pgvector | Sprint 3 | company_id 단위 격리(MEM-3) | observations/reflections 벡터화. 기존 Epic 10 Embedding 인프라 재활용 |
| soul-enricher.ts | 내부 모듈 (engine/ 인접) | DB → Soul 템플릿 extraVars 주입 | Sprint 1 | 4-layer sanitization(PER-1) | Big Five 5개 개별 extraVars + 메모리 컨텍스트 주입. personality-injector.ts 역할 통합 |
| 외부 AI 도구 엔진 | n8n 노드 (이미지: Flux/DALL·E, 영상: Runway/Kling, 나레이션/자막) | n8n → 외부 SaaS API | Sprint 2 | 회사별 API 키 AES-256 (MKT-1) | CORTHEX 코드 수정 불필요. n8n 노드 업데이트로 플랫폼 API 변경 대응(MKT-5) |
| SNS 게시 | n8n 노드 (Instagram/TikTok/YouTube API) | n8n → 플랫폼 API | Sprint 2 | 회사별 OAuth 토큰 | 마케팅 6단계 파이프라인 최종 단계. 콘텐츠 저작권 워터마크 옵션(MKT-4) |

### 브라우저 & 반응형 (Web App)

**브라우저:** Chrome/Safari/Firefox/Edge 최신 2버전. IE 미지원. 정량 테스트 기준 → NFR-B1~B3 참조.

**반응형 지원 매트릭스:**

| 기능 | Desktop (≥1280px) | Tablet (≥768px) | Mobile (≥375px) |
|------|-------------------|-----------------|-----------------|
| 허브 | ✅ 전체 | ✅ 전체 | ✅ 메시지만 |
| 관리자 콘솔 | ✅ 전체 | △ 읽기 위주 | ❌ |
| NEXUS 편집 | ✅ | ❌ | ❌ |
| NEXUS 읽기 | ✅ | ✅ | ❌ |
| /office (OpenClaw) | ✅ (PixiJS 캔버스) | △ (리스트 뷰 대체 — 에이전트 이름+상태+색상 뱃지, 정렬 가능) | ❌ (리스트 뷰 대체, PIX-3) |
| n8n 에디터 | ✅ (Admin 전용) | △ 읽기 위주 | ❌ |
| Big Five 슬라이더 | ✅ (Admin 전용) | ✅ (Admin 전용) | △ (터치 조작 가능하나 정밀도 한계) |

NEXUS 편집은 데스크톱 전용 (드래그&드롭 터치 조작 한계). /office PixiJS 캔버스는 데스크톱 전용 — 모바일에서 에이전트 리스트 뷰(이름+상태+색상 뱃지)로 대체 (PIX-3).

### 성능 & 접근성 목표

정량 성능 목표 → NFR Performance (NFR-P1~P17) 참조.
접근성 기준 → NFR Accessibility (NFR-A1~A7) 참조.

**베이스라인:** Phase 1 시작 전 v1 프론트엔드 FCP/LCP/번들 크기 + 백엔드 API P95 측정 필수.

### API Surface (Developer Tool)

| API | 설명 | 사용자 |
|-----|------|--------|
| `POST /api/agents/:id/chat` | 에이전트 대화 (SSE 스트리밍) | 허브 프론트엔드 |
| `GET /api/agents` | 에이전트 목록 | 허브, 관리자 콘솔 |
| `CRUD /api/admin/*` | 부서·에이전트·Human·도구 관리 | 관리자 콘솔 |
| `GET /api/nexus/org-tree` | 조직도 트리 구조 | NEXUS |
| `PUT /api/nexus/org-tree` | 조직도 저장 | NEXUS |
| `WS /ws/delegation` | 핸드오프 추적 실시간 | 허브 사이드바 |
| 스케치바이브 MCP (Stdio) | read/update/approve/list | Claude Code CLI |

*참고: 실제 라우트 경로는 아키텍처 문서에서 v1 코드 기반으로 확정. 위는 논리적 구조.*

### 마이그레이션 가이드 (Migration)

Phase별 기존 → 신규 전환 순서:

**Phase 1 (엔진 교체):**
1. `agent-runner.ts` → `agent-loop.ts` (라우트 import 변경)
2. `delegation-tracker.ts` (서비스) → Hook: `delegation-tracker.ts`

**Phase 2 (오케스트레이션):**
3. `chief-of-staff.ts` → 비서 Soul 템플릿
4. `manager-delegate.ts` → 매니저 Soul + call_agent
5. `cio-orchestrator.ts` → CIO Soul + call_agent
6. 위 3~5 검증 후 → 기존 5개 서비스 삭제

**Phase 3 (티어 유연화):**
7. tier enum (3단계) → `tier_configs` 테이블 (N단계, 온라인 마이그레이션)

### 컴플라이언스 요구사항 (Compliance)

*v3에서 n8n 외부 API 연동, 에이전트 메모리, Big Five 개인화가 추가됨에 따라 데이터 보호·감사·보안 요구사항을 명시한다.*

**데이터 격리 (Data Isolation):**

| 영역 | 격리 수준 | 구현 위치 | 검증 방법 |
|------|---------|---------|---------|
| DB 전체 | Row-level `company_id` FK | 모든 Drizzle 쿼리 (`getDB(ctx.companyId)`) | 단위 테스트: companyA 세션으로 companyB 데이터 접근 시 빈 결과 반환 |
| n8n 워크플로우 | tag `company:{companyId}` 필수 | Hono proxy 미들웨어에서 자동 주입 | 통합 테스트: companyA 프록시 요청 → companyB 태그 워크플로우 조회 불가 |
| 에이전트 메모리 | agent_id → company_id 간접 격리 | observations/reflections 테이블 FK 체인 | 통합 테스트: Reflection 크론이 타 회사 observations 처리 불가 |
| CLI 토큰 | Human별 독립 등록, AES-256 DB 암호화 | `packages/server/src/lib/crypto.ts` | 보안 테스트: DB raw 접근 시 토큰 평문 노출 불가 |
| WebSocket | company_id별 채널 브로드캐스트 분리 | ws-manager 핸들러 | E2E 테스트: companyA WS 메시지가 companyB 클라이언트에 도달 불가 |

**AES-256 마스터 키 관리:**
- 저장 위치: 서버 환경변수 (`ENCRYPTION_KEY`). Neon DB·소스코드·Docker 이미지에 미포함
- 키 유출 시 영향: 전 회사 CLI 토큰 + 외부 API 키 복호화 가능 → **단일 장애점**
- 완화: VPS `.env` 파일 권한 `600` + 배포 시 GitHub Secrets 경유. Phase 5+에서 HashiCorp Vault 또는 클라우드 KMS 전환 검토
- 키 로테이션: Phase 5+ 계획 (현재 수동 교체 + 전체 재암호화 스크립트)

**프롬프트 주입 방어 (Prompt Injection Defense):**

Big Five 성격 시스템은 사용자 입력(0-100 정수)이 에이전트 Soul(시스템 프롬프트)에 직접 주입되므로 4-layer sanitization 필수 (PER-1):

| Layer | 이름 | 위치 | 동작 |
|-------|------|------|------|
| Layer 0 | Key Boundary | `soul-renderer.ts` | extraVars spread 순서 역전 (extraVars BEFORE built-in). 6개 built-in 키(`agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`) 충돌 시 **필터링**(built-in 값 우선 적용) + 에러 로그 |
| Layer A | API Zod | Admin API route handler | `z.number().int().min(0).max(100)` — 문자열, float, 범위 밖 정수 전부 400 reject |
| Layer B | extraVars strip | `soul-enricher.ts` | newline(`\n`), delimiter(`{{`, `}}`), 제어문자 strip + 200자 상한. 무해한 정수만 통과 |
| Layer C | Template regex | `soul-renderer.ts` renderSoul() | `{{변수명}}` 패턴만 치환. 미등록 변수 → 빈 문자열 fallback + worker log 경고 |

**감사 로그 (Audit Logging):**

| 이벤트 | 기록 위치 | 보존 기간 | v2/v3 |
|--------|---------|---------|-------|
| 에이전트 실행 (messages.create) | `task_executions` 테이블 | 무제한 | v2 |
| 핸드오프 체인 | `activity_logs` 테이블 | 무제한 | v2 |
| Soul 편집 | `activity_logs` + diff 저장 | 무제한 | v2 |
| Big Five 값 변경 | `activity_logs` (who, when, old→new) | 무제한 | v3 Sprint 1 |
| n8n 워크플로우 실행 | n8n 자체 execution log + CORTHEX `activity_logs` (트리거·결과 요약) | 30일 (n8n) / 무제한 (CORTHEX) | v3 Sprint 2 |
| 메모리 삭제 (Admin) | `activity_logs` (MEM-4, MEM-5) | 무제한 | v3 Sprint 3 |
| Reflection 적용 | `activity_logs` (Planning → 에이전트 행동 적용 추적) | 무제한 | v3 Sprint 3 |
| /office 상태 변경 | `activity_logs` tail (PIX-6, 읽기 전용) | 무제한 | v3 Sprint 4 |

**보안 토큰 관리 (Token Security):**

| 토큰 유형 | 저장 방식 | 전파 방식 | 만료 정책 |
|---------|---------|---------|---------|
| CLI Max 토큰 | DB AES-256 암호화 (SEC-1) | SessionContext.cliToken (핸드오프 체인 전체 전파) | 사용자 수동 로테이션 (SEC-7 Phase 5+) |
| Admin JWT | httpOnly cookie / Bearer header | 요청별 검증 | 24시간 만료 + refresh token |
| n8n Admin 프록시 JWT | Hono middleware 검증 | `/admin/n8n-editor/*` 경로 한정 | Admin JWT와 동일 수명 |
| 외부 API 키 (이미지/영상) | company.settings JSONB AES-256 (MKT-1). ⚠️ JSONB race — `jsonb_set` atomic 또는 별도 테이블 (Deferred) | n8n 워크플로우 실행 시 복호화 → n8n env 주입 | 회사별 수동 관리 |
| n8n webhook HMAC | 마스터 secret(환경변수) + per-company 파생 키(`HMAC(master, companyId)`) | webhook 요청 헤더 서명 검증 (N8N-SEC-4). companyA secret으로 companyB webhook 위조 불가 | 서버 재시작 시 유지. 마스터 키 로테이션 시 전 파생 키 자동 갱신 |

**GDPR 유사 데이터 보호 (향후 검토):**

| 요구사항 | 현재 상태 | Phase 5+ 계획 |
|---------|---------|-------------|
| 데이터 삭제 요청 (Right to Erasure) | 미구현 — 수동 DB 삭제 가능 | 회사 단위 전체 삭제 API (`DELETE /api/admin/company/:id/purge`) |
| 데이터 이동 요청 (Data Portability) | 미구현 | 회사 데이터 JSON export API |
| 동의 관리 (Consent) | 회원가입 약관 동의만 | AI 생성물 활용 동의, 메모리 수집 동의 |
| 데이터 최소 수집 | observations 테이블: 필요 최소 raw 데이터만 | Reflection 크론 후 raw observations 자동 삭제 옵션 |
| 접근 로그 열람 | `activity_logs` 테이블 Admin 조회 | Human 본인 활동 로그 조회 API |

### 구현 고려사항

**빌드 및 배포:**
- Turborepo 모노레포: `packages/admin`, `packages/app`, `packages/ui`, `packages/shared`, `packages/server`
- v3 신규 패키지: `packages/office` (PixiJS 8 + @pixi/react, 독립 빌드 — PIX-5 실패 격리)
- Docker 기반 배포 (Oracle VPS ARM64)
- v3 추가 Docker: `n8nio/n8n:2.12.3` ARM64 native (별도 컨테이너, docker-compose 관리)
- GitHub Actions self-hosted runner
- Cloudflare CDN 캐시 퍼지

**SDK 의존성 관리:**
- `@anthropic-ai/claude-agent-sdk@0.2.x` — agent-loop.ts에서만 import
- `@modelcontextprotocol/sdk` — 스케치바이브 MCP 서버
- Zod v4 — MCP 도구 스키마 정의

**v3 신규 의존성:**
- `pixi.js@8.17.1` — OpenClaw 가상 사무실 렌더링 (packages/office)
- `@pixi/react@8.0.5` — PixiJS React 바인딩 (React 19 전용)
- `@pixi/tilemap@5.0.2` — 타일맵 렌더링
- n8n Docker `2.12.3` — 워크플로우 엔진 (서버 의존성 아님, `docker-compose.yml` 루트에 배치. restart: unless-stopped + healthcheck 포함)

**Sprint 2 과부하 대응:**
- Sprint 2에 n8n(N8N-SEC 6건) + 마케팅(MKT 5건) + soul-enricher 통합 = 15건+ 집중
- 대응 전략: **인프라 트랙**(n8n Docker, 보안, proxy) vs **워크플로우 트랙**(n8n 노드, 마케팅 파이프라인) 분리 → Sprint 2.5 분리 가능 (Step 04 carry-forward)

**Reflection 크론 동시 실행 부하:**
- 다수 회사 동시 Reflection 시 DB(pgvector INSERT) + LLM(Gemini Embedding) 집중 부하
- 아키텍처에서 스케줄링 전략 확정 필요: 크론 오프셋(회사별 시간 분산) 또는 큐잉(BullMQ/pg-boss)

## Project Scoping & Phased Development

### MVP 전략 & 철학

**MVP 접근법:** 2단계 검증 MVP (MVP-A → MVP-B)

| 단계 | 검증 대상 | 접근 | 실패 시 |
|------|---------|------|---------|
| **MVP-A** (Phase 1) | "SDK가 기존 엔진을 대체할 수 있는가?" | Engineering MVP — 기존 기능 동등성 증명 | 하이브리드 전략으로 전환 |
| **MVP-B** (Phase 2) | "Soul = 오케스트레이션이 동작하는가?" | Problem-Solving MVP — 핵심 가치 증명 | Soul 부분 적용 + 코드 오케스트레이션 병행 |

**왜 2단계인가:** Phase 1(엔진 교체)이 실패하면 Phase 2(Soul 오케스트레이션)는 불가능하다. fail-fast를 위해 기술 리스크를 먼저 제거한다.

**리소스 요구사항:**
- Phase 1~4: 1인 개발자 (Claude Code AI 페어 프로그래밍)
- 도메인 전문가: CEO 김도현 (사용자 검증)
- 총 예상 일정: 목표 9주 (낙관 7주 / 비관 12주)

**v3 Sprint 전략 (v2 Phase 1~4 완료 후):**

v2 Phase 1~4가 완료된 인프라(485 API, 86 테이블, 10,154 테스트) 위에 4개 Sprint로 v3 기능을 점진적으로 추가한다. 각 Sprint는 독립적인 Go/No-Go 게이트를 갖는다.

| Sprint | 핵심 기능 | Go/No-Go | 블로커 조건 | 의존성 |
|--------|---------|----------|-----------|--------|
| Sprint 1 | Big Five 성격 시스템 (Layer 3) | #2: extraVars 키 존재 + 빈 문자열 미허용 | 4-layer sanitization 미통과 | v2 완료 (soul-renderer.ts, soul-enricher.ts) |
| Sprint 2 | n8n 워크플로우 자동화 (Layer 2) + 마케팅 도구 엔진 | #3: 포트 5678 외부 차단 + 프록시 인증 | n8n Docker ARM64 OOM 반복 | Sprint 1 (MKT 도구 엔진만 — n8n 인프라 FR-N8N1~5는 병렬 가능) |
| Sprint 3 | 에이전트 메모리 3단계 (Layer 4) | #4: agent_memories 단절 0건, #7: Reflection 비용 한도 | 기존 메모리 데이터 손실 | Sprint 1 (soul-enricher.ts 메모리 주입 경로) |
| Sprint 4 | OpenClaw 가상 사무실 (Layer 1) + UXUI Layer 0 | #5: 번들 < 200KB, #8: 에셋 PM 승인 | PixiJS 번들 초과, WebGL 미지원 | Sprint 1~3 (activity_logs 데이터 필요) |

**Sprint 순서 근거 (Brief §4):**
- Sprint 1 우선: Big Five는 soul-enricher.ts 확장이므로 가장 작은 변경 범위. Sprint 2~3의 soul-enricher.ts 주입 경로를 선제 확보
- Sprint 2 다음: n8n Docker는 독립 컨테이너이므로 병렬 개발 가능. 마케팅 도구 엔진이 비즈니스 가치 높음
- Sprint 3 후: 메모리는 observations 테이블 + Reflection 크론이라 DB 마이그레이션 필요. Sprint 1 soul-enricher.ts 주입 경로 활용
- Sprint 4 마지막: OpenClaw는 순수 프론트엔드(PixiJS). Sprint 1~3 activity_logs 데이터가 있어야 시각화 의미 있음

**v3 실패 시 전략:**
- Sprint별 독립 롤백 가능 — 각 Sprint 실패 시 해당 Layer만 비활성화, 나머지 v2+v3 정상 동작
- Sprint 2 과부하 시: 인프라 트랙(n8n Docker, 보안) vs 워크플로우 트랙(n8n 노드, 마케팅) 분리 → Sprint 2.5 분할 가능

※ Pre-Sprint (디자인 토큰 확정) 및 Layer 0 UXUI 리셋은 전 Sprint 병행 — Go/No-Go #6 참조 (Brief §4)

### MVP 기능셋 (Phase 1~2)

**지원 여정:**

| 여정 | Phase 1 | Phase 2 | 비고 |
|------|---------|---------|------|
| CEO 김대표 (허브) | ✅ 기존과 동일 | ✅ 비서 경유 + 핸드오프 추적 | 핵심 |
| 투자자 이사장 (병렬 분석) | ✅ 기존과 동일 | ✅ call_agent 병렬 | 핵심 |
| Admin (설정) | — | ✅ 비서 할당 + Soul 편집 | Phase 2 |
| Human 직원 (직접 선택) | — | ✅ 비서 없는 허브 | Phase 2 |
| CEO (온보딩) | — | ✅ 기본 조직 자동 생성 | Phase 2 |
| ~~팀장 박과장 (비용 관리)~~ | — | — | ~~삭제: CLI Max 월정액, 비용 관리 불필요 (GATE 2026-03-20)~~ |
| Admin (NEXUS) | — | — | Phase 3 |
| Admin (스케치바이브) | — | — | Phase 4 |

**v3 여정 지원 (Sprint 1~4):**

| 여정 | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | 비고 |
|------|---------|---------|---------|---------|------|
| Journey 1: CEO 김도현 (Big Five 체감) | ✅ 성격 차이 체감 | — | ✅ 메모리 성장 확인 | ✅ /office 실시간 | 핵심 |
| Journey 4: Admin 이수진 (Big Five 설정) | ✅ 슬라이더 조정 | ✅ n8n 에디터 | ✅ 메모리 관리 | — | 핵심 |
| Journey 7: CEO 온보딩 (Big Five 기본값) | ✅ 기본 50 프리셋 | — | — | — | Sprint 1 |
| Journey 8: Admin 마케팅 워크플로우 | — | ✅ 6단계 파이프라인 | — | — | Sprint 2 딥 다이브 |
| Journey 9: CEO /office NEXUS 실시간 | — | — | — | ✅ 4색 상태 | Sprint 4 딥 다이브 |
| Journey 10: Admin 메모리 모니터링 | — | — | ✅ 3단계 확인 | — | Sprint 3 딥 다이브 |

**Must-Have (없으면 제품 실패):**
1. agent-loop.ts messages.create() 동작 (Phase 1)
2. Hook 5개 보안 체계 (Phase 1)
3. call_agent 3단계 핸드오프 (Phase 1)
4. Epic 1~20 회귀 통과 (Phase 1)
5. 비서/비서없음 허브 양쪽 동작 (Phase 2)
6. Soul 편집 → 행동 변화 반영 (Phase 2)

**Nice-to-Have (나중에 추가 가능):**
- NEXUS 드래그&드롭 (Phase 3 — 관리자 콘솔 CRUD로 대체 가능)
- N단계 티어 (Phase 3 — 기존 3단계로 운영 가능)
- 의미 검색 (Phase 4 — 키워드 검색으로 대체 가능)
- 음성 브리핑 (Phase 4 — 텍스트 브리핑으로 대체 가능)
- 스케치바이브 MCP (Phase 4 — 기존 브라우저 AI 커맨드로 대체 가능)

### 리스크 완화 전략

**기술 리스크:**

| 리스크 | 확률 | 영향 | 완화 |
|--------|------|------|------|
| call_agent 3단계 토큰 전파 실패 | 중 | 🔴 극히높음 | Phase 1 1주차 우선 테스트. 실패 시 2단계로 축소 |
| Soul 라우팅 정확도 부족 (<50%) | 중 | 🔴 높음 | 3단계 폴백 (규칙→태그→프리라우팅). Phase 2 2주차 판단 |
| SDK 0.3.x 호환성 깨짐 | 낮 | 🟠 중간 | agent-loop.ts 1파일 격리. 0.2.x 고정 |
| pgvector ARM64 빌드 실패 | 낮 | 🟡 낮음 | Phase 4 시작 전 Docker 검증. 실패 시 키워드 검색 유지 |

**시장 리스크:**

| 리스크 | 완화 |
|--------|------|
| "비개발자 AI 조직 설계" 수요 미확인 | MVP-B 후 CEO 김대표 직접 사용 피드백으로 검증 |
| 경쟁자가 유사 제품 출시 | 6개월 선점 + Soul 오케스트레이션 독자 패턴으로 차별화 유지 |
| CLI Max 정책 변경 | agent-loop.ts에 API 키 모드 추가 대비 (~10줄) |

**리소스 리스크:**

| 리스크 | 완화 |
|--------|------|
| 1인 개발로 9주 초과 | Phase 4를 Phase 2~3과 병렬 실행 → 7주로 단축 가능 |
| Phase 1 실패로 전체 지연 | 하이브리드 전략: 기존 서비스 유지하며 점진적 전환 |

**v3 추가 리스크 (Sprint 관점 — 고유 항목만. 혁신별 기술 리스크 상세·폴백은 §Innovation 혁신 리스크 완화 참조):**

| 리스크 | 확률 | 영향 | Sprint | 완화 |
|--------|------|------|--------|------|
| Sprint 2 과부하 (15건+ 동시) | 높 | 🟠 중간 | 2 | 인프라/워크플로우 트랙 분리 → Sprint 2.5 분할 가능. **분할 트리거**: Sprint 2 중간 리뷰 시점에 인프라 트랙(n8n Docker+보안) 미완료 시 워크플로우 트랙을 Sprint 2.5로 이월 |
| Sprint 1 지연 → 전체 v3 블록 | 중 | 🔴 높음 | 1 | Sprint 2 n8n Docker는 soul-enricher.ts 비의존(독립 컨테이너) → Sprint 1 Big Five 미완료 시에도 n8n 인프라 트랙 병렬 착수 가능. soul-enricher.ts 주입 경로만 Sprint 1 필수 |

### 오픈소스 활용 전략

**원칙:** CORTHEX 고유 가치(call_agent, Soul, 스케치바이브)만 직접 구현. 나머지는 검증된 오픈소스 활용.

**Phase 1 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [@zapier/secret-scrubber](https://www.npmjs.com/package/@zapier/secret-scrubber) | credential-scrubber + output-redactor Hook 핵심 로직 | 패턴 매칭 직접 구현 |
| [hono-rate-limiter](https://github.com/rhinobase/hono-rate-limiter) | OPS-1 동시 세션 제한 (429 반환) | Rate limiting 직접 구현 |
| [Hono WebSocket Helper](https://hono.dev/docs/helpers/websocket) (`createBunWebSocket`) | 핸드오프 추적 실시간 WS | 별도 ws 패키지 |
| [Hono RPC](https://hono.dev/docs/guides/rpc) + [hono-rpc-query](https://github.com/kedom1337/hono-rpc-query) | 프론트↔백엔드 API 타입 자동 전파 | 수동 타입 정의 |
| [drizzle-zod](https://orm.drizzle.team/docs/zod) (Drizzle 내장) | DB 스키마 → Zod 검증 → TypeScript 타입 자동 생성 | 3중 스키마 정의 |
| [llm-cost-tracker](https://www.npmjs.com/package/llm-cost-tracker) | cost-tracker Hook 가격 계산 **(v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20)** | 모델별 가격표 직접 관리 |
| [croner](https://github.com/Hexagon/croner) | ARGOS 크론잡 스케줄러 (Bun 네이티브, 0 의존성) | 기존 스케줄러 |
| [inngest/bun](https://github.com/inngest/bun-docker) Docker | ARM64 네이티브 이미지 | 기존 Docker 이미지 |

**Phase 2 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [assistant-ui](https://github.com/assistant-ui/assistant-ui) 또는 [AI Elements](https://github.com/vercel/ai-elements) | 허브 채팅 UI (SSE 스트리밍, 마크다운, 자동 스크롤, 접근성) | 채팅 UI 직접 구현 |
| [TanStack Query + WebSocket 패턴](https://tkdodo.eu/blog/using-web-sockets-with-react-query) | 실시간 핸드오프 이벤트 → 캐시 자동 업데이트 | 수동 캐시 관리 |

**Phase 3 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [React Flow](https://reactflow.dev) + [ELK.js](https://reactflow.dev/examples/layout/elkjs) | NEXUS 조직도 (드래그&드롭, 계층 레이아웃, 접기/펼치기) | Cytoscape 커스텀 구현 |

**Phase 4 적용:**

| 패키지 | 용도 | 대체 대상 |
|--------|------|---------|
| [notebooklm-mcp](https://github.com/m4yk3ldev/notebooklm-mcp) (Python, 32도구) | NotebookLM MCP 서버 (Stdio spawn) | TypeScript 직접 구현 (~80줄) |
| [pgvector-node](https://github.com/pgvector/pgvector-node) + Drizzle `cosineDistance()` | 벡터 유사도 검색 | cosine 계산 직접 구현 |
| [@google/genai](https://ai.google.dev/gemini-api/docs/embeddings) (`gemini-embedding-001`) | Gemini Embedding API (768/1536/3072차원) | REST 직접 호출 |

**v3 Sprint 1~4 적용:**

| 패키지 | 용도 | Sprint | 대체 대상 |
|--------|------|--------|---------|
| — (신규 코드 없음) | Big Five: soul-enricher.ts 확장 + Zod 검증 | Sprint 1 | 직접 구현 (CORTHEX 고유) |
| Phase 4 @google/genai 재활용 | Memory: observations/reflections 벡터화 (Gemini Embedding, Epic 10 인프라 재활용) | Sprint 3 | 신규 Embedding 인프라 구축 불필요 |
| [pg-boss](https://github.com/timgit/pg-boss) (조건부) | Reflection 크론 큐잉 — 다수 회사 동시 Reflection 시 부하 분산. PostgreSQL 네이티브 (Redis 불필요). 아키텍처에서 스케줄링 전략 확정 후 채택 여부 결정 | Sprint 3 | 크론 오프셋(회사별 시간 분산) 또는 직접 큐 구현 |
| [n8nio/n8n:2.12.3](https://hub.docker.com/r/n8nio/n8n) ARM64 | 워크플로우 엔진 Docker 컨테이너 | Sprint 2 | 자체 워크플로우 코드 (v2 삭제 대상) |
| [pixi.js@8.17.1](https://www.npmjs.com/package/pixi.js) | OpenClaw 가상 사무실 렌더링 | Sprint 4 | Canvas 직접 구현 |
| [@pixi/react@8.0.5](https://www.npmjs.com/package/@pixi/react) | PixiJS React 바인딩 (React 19) | Sprint 4 | useRef + imperative API |
| [@pixi/tilemap@5.0.2](https://www.npmjs.com/package/@pixi/tilemap) 또는 [pixi-tiledmap v2](https://www.npmjs.com/package/pixi-tiledmap) | 사무실 타일맵 렌더링. @pixi/tilemap=low-level renderer(경량), pixi-tiledmap=Tiled JSON parser(편의). Sprint 4 착수 시 에셋 파이프라인에 따라 확정 | Sprint 4 | 수동 타일 배치 |

**Phase 5+ 검토:**

| 패키지 | 용도 |
|--------|------|
| [Langfuse](https://github.com/langfuse/langfuse) (오픈소스, 셀프호스트) | 에이전트 성과 대시보드 기반 — LLM 트레이싱, 도구 호출 로깅, 비용 모니터 |

**직접 구현 유지 (CORTHEX 고유 가치):**
- `engine/agent-loop.ts` — SDK messages.create() 래퍼 + CLI 토큰 주입 + Soul 변수 치환
- `tool-handlers/builtins/call-agent.ts` — N단계 핸드오프 패턴
- `engine/hooks/tool-permission-guard.ts` — 에이전트별 도구 허용 로직 (DB 조회)
- `engine/hooks/delegation-tracker.ts` — WebSocket 이벤트 발행 로직
- Soul 템플릿 3종 (비서/매니저/전문가) — CORTHEX 고유 오케스트레이션
- 스케치바이브 CLI MCP 서버 — CORTHEX 고유 캔버스 연동
- `soul-enricher.ts` — Big Five extraVars + 메모리 컨텍스트 주입 (v3 Sprint 1+3)
- `memory-reflection.ts` — 관찰→반성 크론 워커 (v3 Sprint 3)
- `office-channel.ts` — /ws/office WebSocket 채널 + activity_logs tail (v3 Sprint 4)
- Hono proxy n8n 미들웨어 — JWT + tag 격리 + HMAC 검증 (v3 Sprint 2)

**총 효과:**
- 직접 작성 코드: ~1,000줄+ 추가 절감 (채팅 UI + NEXUS가 가장 큼)
- 개발 시간: ~1~2주 추가 절약 (v2), v3 Sprint 2 n8n Docker 활용으로 워크플로우 엔진 직접 구현 비용 제거
- 핵심 가치 코드 비율: 직접 코드의 80%+가 CORTHEX 고유 로직

## Functional Requirements

*이 섹션은 제품의 **기능 계약서**이다. 여기에 없는 기능은 최종 제품에 존재하지 않는다. UX 디자이너·아키텍트·Epic 분할 — 전부 이 목록만 참조한다.*

### 에이전트 실행 (Agent Execution)

에이전트가 자연어 명령을 받아 도구를 사용하고, 다른 에이전트에게 핸드오프하며, 결과를 실시간 스트리밍한다.

- FR1: [Phase 1] 사용자가 허브에서 에이전트에게 자연어로 명령을 보낼 수 있다
- FR2: [Phase 1] 에이전트가 허용된 도구를 사용하여 작업을 수행할 수 있다 (v1 도구 전체 호환 포함)
- FR3: [Phase 1] 에이전트가 call_agent 도구로 다른 에이전트에게 작업을 핸드오프할 수 있다
- FR4: [Phase 1] 핸드오프가 N단계 깊이로 이루어질 수 있다 (회사별 상한 설정 가능, 기본 5단계)
- FR5: [Phase 1] 에이전트가 여러 하위 에이전트에게 병렬로 핸드오프할 수 있다 (회사별 상한 설정 가능, 기본 10개)
- FR6: [Phase 1] 에이전트 응답이 SSE 스트리밍으로 사용자에게 실시간 전달된다
- FR7: [Phase 1] SDK messages.create() 실패 시 자동 재시도 1회 후 사용자에게 에러 메시지를 표시한다
- FR8: [Phase 1] 모든 에이전트가 call_agent 도구를 기본으로 보유한다 (Admin이 제거 불가)
- FR9: [Phase 1] 에이전트가 핸드오프 체인 내 순환을 감지하면 핸드오프를 거부한다
- FR10: [Phase 1] 여러 사용자가 동일 에이전트에게 동시에 명령하면 각각 독립 세션으로 처리한다

### 비서 & 오케스트레이션 (Secretary & Orchestration)

비서실장이 사용자 의도를 분석하여 적절한 에이전트로 라우팅하고, 비서 유무에 따라 다른 UX를 제공한다.

- FR11: [Phase 2] Admin이 Human 직원에게 비서 에이전트를 할당하거나 해제할 수 있다
- FR12: [Phase 2] 비서가 있는 사용자가 자연어로 명령하면 비서가 해당 에이전트에게 라우팅한다
- FR13: [Phase 2] 비서가 없는 사용자가 에이전트 목록에서 직접 선택하여 명령할 수 있다
- FR14: [Phase 2] 비서가 있는 사용자의 허브는 채팅 입력 중심으로 표시된다 (에이전트 목록 숨김)
- FR15: [Phase 2] 비서가 없는 사용자의 허브는 에이전트 목록 선택 후 채팅으로 표시된다
- FR16: [Phase 2] 매니저 에이전트가 하위 에이전트 결과를 교차 검증하고, 의견 충돌 시 양쪽을 병기한다
- FR17: [Phase 2] 에이전트가 범위 밖 요청을 거절하되 적절한 에이전트를 안내한다
- FR18: [Phase 2] 비서가 있는 사용자는 비서 Soul에 정의된 범위 내에서만 에이전트에 접근한다
- FR19: [Phase 2] 비서가 없는 사용자는 자기 회사의 모든 에이전트를 선택할 수 있다
- FR20: [Phase 2] Admin이 에이전트를 추가하면 코드 변경 없이 즉시 사용 가능하다

### Soul 관리 (Soul Management)

Admin이 Soul을 편집하면 에이전트 행동이 즉시 변한다. 코드 수정 0줄, 배포 0회.

- FR21: [Phase 2] Admin이 에이전트의 Soul을 편집할 수 있다
- FR22: [Phase 2] Soul 편집이 다음 요청부터 반영되어 에이전트 행동이 변한다 (배포 불필요)
- FR23: [Phase 1] Soul 템플릿 변수({agent_list}, {subordinate_list}, {tool_list} 등)가 DB 데이터로 자동 치환된다
- FR24: [Phase 2] 기본 Soul 템플릿 3종(비서/매니저/전문가)이 새 에이전트 생성 시 자동 적용된다
- FR25: [Phase 2] 모든 Soul에 금지 섹션(토큰 노출 방지, 범위 밖 행동 금지)이 자동 포함된다

### 조직 관리 (Organization Management)

Admin이 부서·에이전트·Human을 관리하고, NEXUS에서 조직도를 시각적으로 편집한다.

- FR26: [Phase 2] Admin이 부서를 생성/수정/삭제할 수 있다
- FR27: [Phase 2] Admin이 AI 에이전트를 생성/수정/삭제하고 부서에 배치할 수 있다
- FR28: [Phase 2] Admin이 Human 직원을 등록/수정/삭제하고 CLI 토큰을 관리할 수 있다
- FR29: [Phase 2] Admin이 에이전트에게 사용 가능한 도구를 할당/해제할 수 있다
- FR30: [Phase 3] Admin이 NEXUS에서 조직도를 시각적으로 편집할 수 있다 (드래그&드롭으로 부서·에이전트 배치)
- FR31: [Phase 3] NEXUS에서 저장한 조직 구조가 즉시 반영된다 (배포 불필요)
- FR32: [Phase 2] CEO/Human이 NEXUS 조직도를 읽기 전용으로 확인할 수 있다
- FR33: [Phase 2] Admin이 비서실장(루트 에이전트)을 삭제하려 하면 시스템이 거부한다

### 티어 관리 (Tier Management)

N단계 티어로 모델 등급을 세분화한다. CLI Max 월정액이므로 별도 비용 추적/대시보드 불필요 (GATE 결정 2026-03-20).

- FR34: [Phase 3] Admin이 N단계 티어를 생성/수정/삭제할 수 있다 (상한 10단계)
- FR35: [Phase 3] 각 티어에 LLM 모델이 자동 매핑된다 (tier_configs 테이블 조회)
- FR36: [Phase 3] Admin이 에이전트의 티어를 변경할 수 있다
- ~~FR37: 삭제 — CLI Max 월정액, 비용 기록 불필요~~
- FR38: [Phase 1] 핸드오프 체인 전체에서 최초 명령자의 CLI 토큰이 전파된다
- ~~FR39: 삭제 — CLI Max 월정액, 비용 현황 페이지 불필요~~

### 보안 & 감사 (Security & Audit)

에이전트 출력에서 민감 정보를 마스킹하고, 모든 도구 호출을 감사 로그에 기록한다.

- FR40: [Phase 1] 에이전트가 비허용 도구를 호출하면 차단된다 (tool-permission-guard)
- FR41: [Phase 1] 에이전트 출력에서 API 키·토큰 패턴이 자동 마스킹된다 (credential-scrubber + output-redactor)
- FR42: [Phase 1] 모든 도구 호출이 감사 로그에 기록된다 (토큰 필터 적용 후)
- FR43: [Phase 1] CLI 토큰이 암호화 저장된다
- FR44: [Phase 2] Soul/시스템 프롬프트에 CLI 토큰이 절대 주입되지 않는다
- FR45: [Phase 1] 회사 간 데이터가 격리된다 (멀티테넌트 row-level 격리)

### 실시간 모니터링 (Real-time Monitoring)

허브 트래커에서 핸드오프 체인이 실시간으로 흘러가고, 에러 시 명확한 피드백을 제공한다.

- FR46: [Phase 2] 허브 트래커에서 핸드오프 체인이 실시간으로 표시된다 (어떤 에이전트가 작업 중인지)
- FR47: [Phase 2] 에이전트 실패 시 "○○가 응답 못 함 → 나머지로 종합" 형식으로 사용자에게 표시된다 (블랙박스 에러 0건)
- FR48: [Phase 1] 서버 메모리 과부하 시 사용자에게 경고하고 신규 세션을 제한한다
- FR49: [Phase 2] 진행 중인 작업이 서버 재시작으로 중단되면 사용자에게 안내한다

### 라이브러리 — 지식 검색 & 브리핑 (Library — Knowledge & Briefing)

의미 기반 벡터 검색으로 관련 문서를 발견하고, 음성 브리핑을 생성하여 텔레그램으로 전송한다.

- FR50: [Phase 4] 에이전트가 의미 기반 벡터 검색으로 관련 문서를 찾을 수 있다
- FR51: [Phase 4] 사용자가 음성 브리핑을 요청하면 NotebookLM이 오디오를 비동기 생성한다
- FR52: [Phase 4] 음성 브리핑 생성 요청 시 사용자에게 '생성 중' 알림을 즉시 보낸다
- FR53: [Phase 4] 생성된 음성 브리핑이 텔레그램으로 자동 전송된다
- FR54: [Phase 4] 음성 생성 실패 시 텍스트 브리핑으로 대체 전송된다
- FR55: [Phase 유지] ARGOS 크론잡이 예약된 시간에 자동으로 분석 + 브리핑을 실행한다
- FR56: [Phase 유지] 사용자가 텔레그램에서 에이전트에게 명령할 수 있다

### 개발 협업 (Development Collaboration)

Claude Code CLI에서 스케치바이브 MCP 도구로 캔버스를 읽고 쓰고 승인한다.

- FR57: [Phase 4] Claude Code CLI에서 스케치바이브 MCP 도구로 캔버스를 읽기/쓰기/승인할 수 있다
- FR58: [Phase 4] 브라우저에서 승인 요청에 대해 [적용]/[거부]를 선택할 수 있다

### 온보딩 (Onboarding)

새 사용자가 CLI 토큰 검증 → 기본 조직 자동 생성 → 즉시 사용 가능.

- FR59: [Phase 2] 새 사용자가 CLI 토큰을 입력하면 유효성이 자동 검증된다
- FR60: [Phase 2] 첫 사용자가 "기본 AI 조직 만들기"를 원클릭으로 실행할 수 있다 (비서실장 + 기본 부서 자동 생성)
- FR61: [Phase 2] Admin이 회사 초기 설정(회사 정보 + Human + 부서 + 에이전트 + 도구)을 완료할 수 있다

### v1 호환 & 사용자 경험 (v1 Compat & UX)

v1에서 동작하던 기능을 유지하고, 기본적인 사용자 편의 기능을 제공한다.

- FR62: [Phase 유지] 사용자가 이전 대화 기록을 조회할 수 있다
- FR63: [Phase 유지] 에이전트가 동일 세션 내 이전 대화 맥락을 유지한다
- FR64: [Phase 유지] 에이전트가 작업 중 학습한 내용을 자동 저장하고 이후 활용한다 (autoLearn)
- FR65: [Phase 유지] 사용자가 파일(이미지/문서)을 첨부하여 에이전트에게 전달할 수 있다
- FR66: [Phase 2] 사용자가 진행 중인 에이전트 작업을 취소할 수 있다
- FR67: [Phase 2] 사용자가 에이전트 응답을 복사할 수 있다
- FR68: [Phase 2] 에이전트 응답이 마크다운(표/코드/리스트)으로 렌더링된다

### Phase 5+ 예약

- FR69: [Phase 5+] 사용자가 과거 대화를 키워드로 검색할 수 있다
- FR70: [Phase 5+] 사용자가 테마(다크/라이트)를 전환할 수 있다
- FR71: [Phase 5+] Admin이 감사 로그를 조회할 수 있다
- FR72: [Phase 5+] 사용자가 키보드만으로 허브의 핵심 기능을 사용할 수 있다

### v3 OpenClaw — 기능 요구사항 (Sprint 1~4)

#### OpenClaw 가상 사무실 (FR-OC)

- FR-OC1: [Sprint 4] CEO앱 `/office` 페이지에 픽셀아트 사무실 캔버스가 렌더링된다 (`packages/office/` 패키지 — 독립 패키지). PixiJS 8 + @pixi/react는 `React.lazy` + `dynamic import`로 `/office` 라우트 진입 시에만 로드 (CEO앱 메인 번들 ≤ 200KB 유지 — Brief §4 Go/No-Go #5, Vite 번들 분석으로 검증 필수)
- FR-OC2: [Sprint 4] 에이전트 실행 상태 변화(idle/working/speaking/tool_calling/error)가 WebSocket `/ws/office` 채널로 실시간 브로드캐스트된다. 인증: 기존 16개 WS 채널과 동일한 JWT 토큰 방식. 연결 제한: 회사별 최대 20개 동시 연결 (초과 시 idle 연결 graceful eviction — 가장 오래된 idle 연결 자동 해제 + 새 연결 허용)
- FR-OC3: [Sprint 4] idle 상태 에이전트는 픽셀아트 캐릭터가 랜덤 워크 애니메이션으로 배회한다
- FR-OC4: [Sprint 4] working 상태 에이전트는 타이핑 애니메이션과 함께 작업 내용 말풍선이 표시된다 (최대 50자)
- FR-OC5: [Sprint 4] tool_calling 상태 에이전트는 도구 아이콘과 스파크 이펙트가 표시된다
- FR-OC6: [Sprint 4] error 상태 에이전트는 빨간 느낌표와 정지 애니메이션으로 표시된다
- FR-OC7: [Sprint 4] 서버가 `activity_logs` 테이블 변화를 감지하여 상태 이벤트를 생성한다 (`engine/agent-loop.ts` 수정 없음). **구현 방식**: PostgreSQL `LISTEN/NOTIFY` (`agent_status_changed` 이벤트) — Neon serverless 지원 여부를 Sprint 4 착수 전 검증 필수. 미지원 시 폴백: 500ms 폴링 (`SELECT * FROM activity_logs WHERE created_at > $lastCheck ORDER BY created_at LIMIT 50`). `office-channel.ts`는 Hono WebSocket Helper `upgrade()` 패턴 사용
- FR-OC8: [Sprint 4] OpenClaw 패키지 장애가 기존 허브/에이전트 실행에 영향을 주지 않는다 (독립 패키지 격리)
- FR-OC9: [Sprint 4] 모바일/태블릿에서 `/office`가 간소화 리스트 뷰로 표시된다 (PixiJS 캔버스 비활성, 에이전트 상태 텍스트만 표시)
- FR-OC10: [Sprint 4] 스크린리더 사용자를 위해 aria-live 텍스트 대안 패널이 제공된다 ("마케팅 에이전트: 현재 보고서 작성 중" 형식)
- FR-OC11: [Sprint 4] Admin 앱에서 `/office`를 읽기 전용으로 확인할 수 있다 (태스크 지시 불가, 관찰 전용)

#### n8n 워크플로우 연동 (FR-N8N)

- FR-N8N1: [Sprint 2] Admin이 Admin 앱에서 n8n 워크플로우 목록을 Hono reverse proxy API로 확인할 수 있다 (Stage 1 확정: API-only, iframe 없음)
- FR-N8N2: [Sprint 2] CEO앱에서 n8n 워크플로우 실행 결과를 읽기 전용으로 확인할 수 있다
- FR-N8N3: [Sprint 2] 기존 워크플로우 자체 구현 코드(서버 라우트 + 프론트 페이지)가 삭제된다
- FR-N8N4: [Sprint 2] n8n Docker 컨테이너가 Oracle VPS 내부 포트 5678에서 독립 실행된다. **보안 필수**: (1) VPS 방화벽(Oracle Security List)에서 포트 5678 외부 차단 — localhost만 허용. (2) `N8N_DISABLE_UI=false` — n8n 에디터 UI 활성 (Admin 전용 접근, Hono proxy 경유). CORTHEX↔n8n 통합은 REST API-only (iframe 없음, Stage 1 R2 해소). (3) Hono `proxy()` reverse proxy: `/admin/n8n/*`(관리 API) + `/admin/n8n-editor/*`(에디터 UI) — `tenantMiddleware` JWT + Admin 권한 검증 — tag 기반 멀티테넌트 격리 (`?tags=company:{companyId}`). (4) n8n이 CORTHEX PostgreSQL DB에 직접 접근 금지 — CORTHEX API 경유만 허용. (5) n8n Docker 메모리 상한: `memory: 4G`, `cpus: '2'` (R6 완화 기준)
- FR-N8N5: [Sprint 2] n8n 장애 시 CEO앱에 "워크플로우 서비스 일시 중단" 메시지가 표시된다 (전체 앱 중단 없음)
- FR-N8N6: [Sprint 2] Admin이 Hono proxy 경유로 n8n 비주얼 에디터에 접근하여 워크플로우를 편집할 수 있다 (JWT + Admin 권한 + CSRF Origin 검증, FR-N8N4 인프라 기반)

#### 마케팅 자동화 (FR-MKT)

마케팅 콘텐츠 자동 생성 파이프라인. n8n 프리셋 워크플로우 + Admin AI 도구 엔진 설정으로 코드 없이 멀티 플랫폼 게시.

- FR-MKT1: [Sprint 2] Admin이 회사 설정에서 AI 도구 엔진을 카테고리별(이미지 3종+, 영상 4종+, 나레이션 2종, 자막 3종)로 선택할 수 있다
- FR-MKT2: [Sprint 2] n8n 마케팅 프리셋 워크플로우가 주제 입력 → AI 리서치 → 카드뉴스(5장 캐러셀+캡션) + 숏폼(15~60초) 동시 생성 → 사람 승인 → 멀티 플랫폼(인스타/틱톡/유튜브 Shorts/링크드인/X) 동시 게시를 자동 실행한다. 일부 플랫폼 게시 실패 시 성공 플랫폼은 유지하고 실패 플랫폼만 Admin에게 알린다
- FR-MKT3: [Sprint 2] 콘텐츠 생성 후 CEO앱 웹 UI 또는 Slack/Telegram 미리보기에서 사람이 승인/거부할 수 있다
- FR-MKT4: [Sprint 2] AI 도구 엔진 설정 변경이 다음 워크플로우 실행부터 즉시 반영된다
- FR-MKT5: [Sprint 2] 온보딩 시 "마케팅 자동화 템플릿 설치할까요?" 제안이 표시된다
- FR-MKT6: [Sprint 2] Admin이 회사 설정에서 AI 생성 콘텐츠에 저작권 워터마크 삽입 여부를 ON/OFF할 수 있다
- FR-MKT7: [Sprint 2] 외부 AI API(이미지/영상/나레이션) 장애 시 fallback 엔진으로 자동 전환되고 Admin에게 전환 알림이 전송된다

#### 에이전트 성격 시스템 (FR-PERS)

- FR-PERS1: [Sprint 1] Admin이 에이전트 생성/편집 페이지에서 Big Five 성격 5개 슬라이더(0-100 정수, Decision 4.3.1)를 조정할 수 있다
- FR-PERS2: [Sprint 1] 성격 설정이 `agents.personality_traits JSONB` 컬럼에 저장된다 (마이그레이션 #61 `0061_add_personality_traits.ts`). **검증 필수**: 서버에서 Zod `z.object({ extraversion: z.number().int().min(0).max(100), conscientiousness: z.number().int().min(0).max(100), openness: z.number().int().min(0).max(100), agreeableness: z.number().int().min(0).max(100), neuroticism: z.number().int().min(0).max(100) })` 스키마 검증. DB CHECK 제약: 5개 축 모두 값이 `[0, 100]` 범위인지 확인 (`(personality_traits->>'extraversion')::integer BETWEEN 0 AND 100` 형태로 5개). Prompt injection 방지: 문자열 타입 값 일괄 거부
- FR-PERS3: [Sprint 1] `packages/server/src/services/soul-enricher.ts`가 `agent-loop.ts` 호출 전 Soul에서 5개 개별 extraVars(`personality_openness`, `personality_conscientiousness`, `personality_extraversion`, `personality_agreeableness`, `personality_neuroticism`)를 DB 정수값→행동 텍스트로 치환한다 (`engine/agent-loop.ts`에는 `soulEnricher.enrich()` 호출 1행만 삽입, PER-2 참조)
- FR-PERS4: [Sprint 1] 성격 변경이 다음 세션부터 즉시 반영된다 (배포 불필요)
- FR-PERS5: [Sprint 1] 코드 분기(if/switch) 없이 프롬프트 주입만으로 구현된다
- FR-PERS6: [Sprint 1] Admin이 역할 프리셋(예: "전략 분석가", "고객 서비스", "창의적 기획자" 등)을 선택하면 5개 슬라이더에 사전 정의 값이 자동 채워진다
- FR-PERS7: [Sprint 1] 기본 프리셋이 최소 3종 제공된다
- FR-PERS8: [Sprint 1] 각 슬라이더 위치별 행동 예시 툴팁이 표시된다 (예: "성실성 90+: 체크리스트 자동 생성, 꼼꼼한 검증")

#### 에이전트 메모리 아키텍처 (FR-MEM)

- FR-MEM1: [Sprint 3] 에이전트 실행 완료 시 결과가 `observations` 테이블에 자동 저장된다 (company_id, agent_id, session_id, content, outcome, tool_used)
- FR-MEM2: [Sprint 3] `observations` 테이블의 content 필드가 Gemini Embedding으로 자동 벡터화되어 `embedding VECTOR(768)` 컬럼에 저장된다
- FR-MEM3: [Sprint 3] 백그라운드 워커(memory-reflection.ts)가 에이전트별 미처리 관찰 20개 누적 시 자동 실행된다
- FR-MEM4: [Sprint 3] 반성 워커가 최근 관찰 20개를 Gemini API로 요약하여 `reflections` 테이블에 고수준 인사이트를 저장한다
- FR-MEM5: [Sprint 3] `reflections` 테이블의 content 필드가 Gemini Embedding으로 자동 벡터화된다
- FR-MEM6: [Sprint 3] 태스크 시작 시 `soul-enricher.ts`가 현재 태스크 임베딩과 cosine ≥ 0.75인 `reflections` 상위 3개를 검색하여 `{relevant_memories}` 변수로 Soul에 주입한다 (`engine/agent-loop.ts` 직접 수정 없음 — soul-enricher.ts를 통한 위임)
- FR-MEM7: [Sprint 3] 메모리 검색 실패(pgvector 장애) 시 `{relevant_memories}`를 빈 문자열로 폴백하여 에이전트 실행은 정상 진행된다
- FR-MEM8: [Sprint 3] company_id 격리: observations와 reflections 테이블의 모든 쿼리에 company_id WHERE 조건이 적용된다
- FR-MEM9: [Sprint 3] CEO가 에이전트별 Reflection 이력과 성장 지표(관찰 수, 반성 수, 유사 태스크 성공률 추이 — 성공 기준: observations.outcome='success')를 확인할 수 있다
- FR-MEM10: [Sprint 3] 새 Reflection 생성 시 CEO에게 알림이 전송된다 (기존 Notifications WebSocket 채널 활용)
- FR-MEM11: [Sprint 3] Admin이 에이전트별 observations/reflections 데이터를 조회하고 관리할 수 있다

#### CEO앱 페이지 통합 (FR-UX)

GATE 결정(2026-03-20)에 따라 CEO앱 14개 페이지를 6개 그룹으로 통합. 기존 기능 100% 유지 + 라우트 호환.

- FR-UX1: [병행] CEO앱 14개 페이지가 6개 그룹으로 통합된다 (hub+command-center, classified+reports+files→문서함, argos+cron-base, home+dashboard, activity-log+ops-log, agents+departments+org — GATE 테이블 기준)
- FR-UX2: [병행] 합쳐진 페이지의 기존 라우트가 새 라우트로 redirect된다 (기존 북마크/링크 호환)
- FR-UX3: [병행] 합쳐진 페이지에서 기존 기능이 100% 동작한다 (탭/필터로 분리된 하위 기능 포함)

## Non-Functional Requirements

*NFR은 시스템이 "얼마나 잘" 동작해야 하는지를 정의한다. 해당되는 카테고리만 포함.*

### 성능 (Performance)

| ID | 요구사항 | 목표 | 측정 | 우선순위 | Phase |
|----|---------|------|------|---------|-------|
| NFR-P1 | 허브 초기 로드 | FCP ≤ 1.5초, LCP ≤ 2.5초 | Lighthouse | P1 | 1 |
| NFR-P2 | 관리자 콘솔 초기 로드 | FCP ≤ 2초 | Lighthouse | P1 | 2 |
| NFR-P3 | NEXUS 50+ 노드 렌더 | 60fps 유지 | Chrome DevTools | P1 | 3 |
| NFR-P4 | 번들 크기 | 허브 ≤ 200KB gzip (Brief §4, Go/No-Go #5), 관리자 ≤ 500KB gzip | Vite 빌드 | P1 | 1 |
| NFR-P5 | API 응답 시간 | 기존 P95 ±10% | Phase 1 전 주요 API 5개(`/agents/:id/chat`, `/agents`, `/admin/departments`, `/admin/agents`, `/ws/delegation`) 100회 P95 측정 베이스라인 | 🔴 P0 | 1 |
| NFR-P6 | call_agent 3단계 핸드오프 | E2E ≤ 60초 (각 단계 ≤ 15초) | 통합 테스트 타이머 | 🔴 P0 | 1 |
| NFR-P7 | call_agent 5단계 핸드오프 | E2E ≤ 90초, 메모리 ≤ 50MB | 벤치마크 | P2 | 1 |
| NFR-P8 | 세션 타임아웃 | messages.create() 최대 120초. 초과 시 강제 종료 + 에러 | 타이머 | 🔴 P0 | 1 |
| NFR-P9 | WebSocket 재연결 | 끊김 후 ≤ 3초 자동 재연결 | 네트워크 테스트 | P1 | 1 |
| NFR-P10 | 트래커 이벤트 지연 | ≤ 100ms | 타임스탬프 측정 | P1 | 2 |
| NFR-P11 | 음성 브리핑 E2E | 생성 ≤ 3분, 전송 ≤ 30초, 총 ≤ 4분. 성공률 90%+ | E2E 테스트 | P2 | 4 |
| NFR-P12 | 한국 TTFB | ≤ 500ms (Cloudflare CDN 경유) | WebPageTest | P1 | 1 |
| NFR-P13 | `/office` 페이지 로드 | FCP ≤ 3초, PixiJS 번들 ≤ 200KB gzipped (Go/No-Go #5) | Lighthouse + Vite 빌드 | 🔴 P0 | Sprint 4 |
| NFR-P14 | /ws/office 상태 동기화 | agent-loop 실행 → 픽셀 상태 반영 ≤ 2초 | 타임스탬프 측정 | P1 | Sprint 4 |
| NFR-P15 | /ws/office heartbeat | 적응형 간격: idle 30초 / active 5초. 3회 미수신 시 재연결 (WS transport keep-alive — NRT-2 에이전트 상태 전환과 별개. WS 끊김 시 NRT-2도 error 전환) | 네트워크 테스트 | P1 | Sprint 4 |
| NFR-P16 | Reflection 크론 실행 | 에이전트당 20 observations 요약 ≤ 30초 | 타이머 | P1 | Sprint 3 |
| NFR-P17 | MKT 워크플로우 E2E | 이미지 생성 ≤ 2분, 영상 생성 ≤ 10분, 게시 ≤ 30초 (NFR-EXT3 타임아웃 제외) | E2E 타이머 | P1 | Sprint 2 |

### 보안 (Security)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-S1 | CLI 토큰 암호화 | AES-256, 복호화 키 환경변수 분리 | 🔴 P0 | 유지 |
| NFR-S2 | 토큰 메모리 노출 | messages.create() 호출 후 토큰 변수 즉시 null 처리 | 🔴 P0 | 1 |
| NFR-S3 | 프로세스 격리 | Docker 네임스페이스 분리 + SDK 임시파일 `/tmp/{sessionId}/` | 🔴 P0 | 유지 |
| NFR-S4 | output-redactor | `sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer 100% 마스킹 | 🔴 P0 | 1 |
| NFR-S5 | credential-scrubber | API 키 패턴 100% 필터 (10개 패턴 테스트) | 🔴 P0 | 1 |
| NFR-S6 | tool-permission-guard | 비허용 도구 100% 차단 (10건 테스트) | 🔴 P0 | 1 |
| ~~NFR-S7~~ | ~~cost-tracker 정확도~~ | ~~삭제 — CLI Max 월정액, cost-tracker v3 제거 대상 (GATE 2026-03-20)~~ | — | — |
| NFR-S8 | personality_traits sanitization | 4-layer 100% 통과 (Key Boundary → API Zod → extraVars strip → Template regex) | 🔴 P0 | Sprint 1 |
| NFR-S9 | n8n 보안 계층 | N8N-SEC-1~6 100% 통과: 포트 차단(SEC-1) → Admin JWT proxy(SEC-2) → tag 격리(SEC-3) → webhook HMAC(SEC-4) → Docker 리소스 상한(SEC-5) → DB 직접 접근 차단(SEC-6) + proxy rate limiting(100 req/min/Admin, §Integration) | 🔴 P0 | Sprint 2 |

### 확장성 (Scalability)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-SC1 | 동시 세션 | 최소 10개 동시 messages.create(). 초과 시 429 | 🔴 P0 | 1 |
| NFR-SC2 | 세션 메모리 | messages.create() 세션당 ≤ 50MB | 🔴 P0 | 1 |
| NFR-SC3 | 메모리 모니터링 | 80%+ 경고, 90%+ 신규 세션 거부 | P1 | 1 |
| NFR-SC4 | 에이전트 수 | 50명+ 조직에서 성능 저하 없음 | P1 | 3 |
| NFR-SC5 | SDK 호환 | 0.2.72 ~ 0.2.x 패치 자동 호환 | P1 | 1 |
| NFR-SC6 | graceful degradation | SDK 비정상 종료 시 에러 + 자동 재시도 1회 | 🔴 P0 | 1 |
| NFR-SC7 | 총 메모리 | pgvector HNSW 인덱스 포함 ≤ 3GB (PostgreSQL 할당 메모리 4GB 기준, VPS 총 24GB) | P2 | 4 |
| NFR-SC8 | /ws/office 동시 연결 부하 테스트 | 회사별 20 동시 연결 부하 테스트 통과 + idle graceful eviction (FR-OC2 기능 기준, NFR은 성능 검증) | P1 | Sprint 4 |
| NFR-SC9 | n8n Docker 리소스 | ≤ 4GB RAM, ≤ 2 CPU. VPS 전체 메모리 ≤ 80% (PG+Bun+n8n+CI) | 🔴 P0 | Sprint 2 |

### 가용성 (Availability)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-AV1 | 서비스 가동률 | 99% (월 ~7시간 다운타임 허용, 계획 배포 제외) | P1 | 1 |
| NFR-AV2 | 복구 시간 | 비계획 다운타임 30분 이내 복구 (Docker restart) | P1 | 1 |
| NFR-AV3 | DB 백업 | PostgreSQL 일일 자동 백업, 최소 7일 보관 | P1 | 1 |

### 접근성 (Accessibility)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-A1 | WCAG | 2.1 AA (최소) | P1 | 1~4 |
| NFR-A2 | 색상 대비 | 4.5:1 이상 (텍스트), 3:1 이상 (UI) | P1 | 1 |
| NFR-A3 | 트래커 접근성 | aria-live="polite" 텍스트 업데이트 | P1 | 2 |
| NFR-A4 | 키보드 기본 | Tab 이동 + Enter 전송 (assistant-ui/React Flow 내장 활용) | P2 | 2 |
| NFR-A5 | Big Five 슬라이더 접근성 | aria-valuenow + Arrow keys 키보드 조작 + 특성 설명 aria-label | P1 | Sprint 1 |
| NFR-A6 | /office 스크린리더 | aria-live="polite" 텍스트 대안 패널 ("마케팅 에이전트: 보고서 작성 중") — FR-OC10 품질 기준 | P1 | Sprint 4 |
| NFR-A7 | /office 반응형 | 모바일/태블릿 리스트 뷰 전환 (PixiJS 캔버스 desktop-only) — FR-OC9 품질 기준 | P1 | Sprint 4 |

### 데이터 무결성 & 보존 (Data Integrity & Retention)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-D1 | DB 마이그레이션 | enum→integer 전후 데이터 100% 보존 + 롤백 무손실 | P1 | 3 |
| NFR-D2 | 마이그레이션 무중단 | 온라인, 서비스 중단 0 | P1 | 3 |
| NFR-D3 | 벡터 생성 실패 | embedding = NULL 허용, 문서 저장은 진행 | P2 | 4 |
| NFR-D4 | 의미 검색 품질 | 키워드 대비 관련 문서 3건 중 1건+ 추가 발견 (10개 쿼리 A/B) | P2 | 4 |
| NFR-D5 | 대화 기록 보관 | 무제한 (사용자 수동 삭제 가능) | P1 | 유지 |
| NFR-D6 | 회사 삭제 | 해당 회사 모든 데이터 완전 삭제 | P1 | 2 |
| ~~NFR-D7~~ | ~~비용 기록 보관~~ | ~~삭제 — CLI Max 월정액, 비용 추적 불필요 (GATE 2026-03-20)~~ | — | — |
| NFR-D8 | observations/reflections 보존 | observations 90일, reflections 무기한 보관. 90일 초과 observations 자동 아카이브 (삭제 아님) | P1 | Sprint 3 |

### 외부 의존성 (External Dependencies)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-EXT1 | Claude CLI 장애 | '서비스 일시 중단' 메시지를 허브에 표시 | 🔴 P0 | 1 |
| NFR-EXT2 | 부분 장애 격리 | 개별 외부 API 장애가 전체 시스템을 중단시키지 않음 | 🔴 P0 | 1 |
| NFR-EXT3 | API 타임아웃 | 외부 API 호출 기본 30초 (MKT 영상 생성은 최대 5분 허용). 초과 시 에러 반환 | P1 | 1 |

### 운영 (Operations)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-O1 | 배포 무중단 | Docker graceful shutdown → 신규 컨테이너 시작 | P1 | 유지 |
| NFR-O2 | 좀비 방지 | SDK 종료 후 cleanup. 좀비 크론잡 정리 | P1 | 1 |
| NFR-O3 | pgvector ARM64 | Phase 4 시작 전 Docker 내 빌드 검증 | P2 | 4 |
| NFR-O4 | 응답 품질 유지 | 10개 프롬프트(Phase 1 전 정의) A/B 블라인드. 평가자 2명 5점 척도. 평균 ≥ 기존 | 🔴 P0 | 1 |
| NFR-O5 | 비서 라우팅 정확도 | 10개 시나리오(Phase 2 전 정의). 8/10+ = 80%+ | P1 | 2 |
| NFR-O6 | Soul 반영률 | 3개 규칙 시나리오 × 10회 요청. 24/30+ = 80%+ | P1 | 2 |
| NFR-O7 | Admin 초기 설정 | ≤ 15분 (기본 Soul 템플릿 제공) | P1 | 2 |
| NFR-O8 | CEO NEXUS 첫 설계 | ≤ 10분 (튜토리얼 없이) | P1 | 3 |
| NFR-O9 | n8n Docker health | /healthz 30초 간격, 3회 연속 실패 시 자동 재시작 | P1 | Sprint 2 |
| NFR-O10 | Reflection 크론 안정성 | advisory lock(동시 실행 방지) + Gemini API rate limit 준수 | P1 | Sprint 3 |

### 비용 (Cost)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-COST1 | 인프라 운영비 | CLI Max 외 월 $10 이하 (Oracle Free Tier + Cloudflare) | P1 | 1~4 |
| NFR-COST2 | Gemini Embedding | 월 $5 이하 (문서 1,000건 기준) | P2 | 4 |
| NFR-COST3 | Reflection 크론 비용 | Haiku API ≤ $0.10/일 per company (Go/No-Go #7, Stage 1 추정: ~$0.06/day) | 🔴 P0 | Sprint 3 |

### 로깅 (Logging)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-LOG1 | 구조화 로그 | JSON 형식 (timestamp, level, sessionId, agentId, companyId) | P1 | 1 |
| NFR-LOG2 | 로그 보관 | 최소 30일 | P1 | 1 |
| NFR-LOG3 | 에러 알림 | 에러 발생 시 텔레그램 또는 관리자 콘솔 알림 | P2 | 2 |

### 브라우저 호환 (Browser Compatibility)

| ID | 요구사항 | 테스트 우선순위 |
|----|---------|-------------|
| NFR-B1 | Chrome 최신 2버전 | 🔴 P0 — 릴리스 게이트 |
| NFR-B2 | Safari 최신 2버전 | P1 — WebSocket/SSE 호환 확인 |
| NFR-B3 | Firefox/Edge 최신 2버전 | P2 — 보고되면 수정 |

### 코드 품질 (Architecture Constraint)

- NFR-CQ1: CLAUDE.md에 정의된 코딩 컨벤션(strict TypeScript, kebab-case 파일명, API 응답 형식) 및 배포 프로토콜(tsc --noEmit 필수)을 준수한다

### NFR 우선순위 요약

| 우선순위 | 개수 | 설명 |
|---------|------|------|
| 🔴 P0 | 21개 | Phase 1 릴리스 블로커 + v3 Sprint 핵심 게이트. 미달성 시 배포 불가 |
| P1 | 42개 | Phase 2~3 + v3 Sprint 품질 목표. 미달성 시 품질 저하 |
| P2 | 10개 | Phase 4 + 데이터 수집. 점진적 개선 |
| CQ | 1개 | 코드 품질 제약 (NFR-CQ1) |
| ~~삭제~~ | 2개 | NFR-S7(cost-tracker), NFR-D7(비용 보관) — CLI Max 월정액 |
| **총 활성** | **74개** | 12개 카테고리 (v2 58 + v3 16) |
