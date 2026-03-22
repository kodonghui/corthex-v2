---
# v3 "OpenClaw" Architecture Workflow — initialized 2026-03-21
# Previous: v2 Architecture (7 steps complete, 32 party rounds, 2026-03-11)
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
workflowStatus: complete
completedAt: '2026-03-22'
workflowVersion: 'v3-update'
v2StepsCompleted: [1, 2, 3, 4, 5, 6, 7]
v2PartyModeRounds: 32
v2Date: '2026-03-11'
inputDocuments:
  # v3 PRIMARY sources
  - path: _bmad-output/planning-artifacts/prd.md
    role: "PRIMARY — v3 OpenClaw PRD (12 steps, Stage 2 avg 9.03/10). 123 FR (v2:70+v3:53) + 76 NFR + 9 Journeys (PRD frontmatter says 116 FR — body line-by-line count = 123)"
  - path: _bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md
    role: "PRIMARY — v3 Brief. 4 layers + sprint order + Go/No-Go 8개 + target users + success metrics"
  - path: _bmad-output/planning-artifacts/technical-research-2026-03-20.md
    role: "RESEARCH — Stage 1 Technical Research. 6 domains, 2100 lines, avg 8.91/10"
  - path: _bmad-output/planning-artifacts/prd-validation-fixes.md
    role: "FIXES — 11 actionable fixes (4 CRITICAL applied). FR-TOOLSANITIZE, Go/No-Go #9, reflections table, Haiku API"
  - path: .claude/logs/2026-03-21/ecc-analysis-plan.md
    role: "ECC — Part 2: v3 architecture ideas (call_agent response, cost-aware routing, confidence scoring, tool sanitize)"
  # v2 BASELINE sources (update, don't replace)
  - path: _bmad-output/planning-artifacts/architecture.md
    role: "BASELINE — v2 architecture (this file). D1~D21, E1~E10, 7 steps complete"
  - path: _bmad-output/planning-artifacts/v1-feature-spec.md
    role: "CONSTRAINT — v1 feature parity: if it worked in v1, it must work in v2/v3"
  # Context snapshots (Stage 0-2)
  - path: context-snapshots/planning-v3/stage-0-step-05-scope-snapshot.md
    role: "CONTEXT — Stage 0 decisions, sprint order, blocker conditions"
  - path: context-snapshots/planning-v3/stage-1-step-06-scope-snapshot.md
    role: "CONTEXT — Stage 1 synthesis, Go/No-Go matrix, risk registry"
  - path: context-snapshots/planning-v3/stage-2-step-11-12-scope-snapshot.md
    role: "CONTEXT — Stage 2 final, PRD complete (123 FR, 76 NFR, 9 Journeys — corrected from PRD frontmatter 116/74)"
  # Structure
  - path: project-context.yaml
    role: "STRUCTURE — monorepo layout, codebase stats (485 API, 71 pages, 86 tables, 10,154 tests)"
  - path: _bmad-output/planning-artifacts/v3-corthex-v2-audit.md
    role: "AUTHORITY — code-verified v2 accurate numbers"
workflowType: 'architecture'
project_name: 'corthex-v2'
user_name: 'ubuntu'
date: '2026-03-21'
v3EccIdeas:
  - "ECC-1: call_agent response standardization: { status, summary, next_actions, artifacts }"
  - "ECC-2: Cost-aware model routing: Tier-based model selection (admin configurable)"
  - "ECC-3: Memory confidence scoring: Reflection cron confidence (0.3-0.9, decay, reinforcement)"
  - "ECC-4: FR-TOOLSANITIZE: Tool response prompt injection defense at agent-loop.ts"
  - "ECC-5: Go/No-Go #9: Capability evaluation testing methodology"
---

# Architecture Decision Document

_CORTHEX v2/v3 "OpenClaw" — AI Agent Orchestration Platform (Dynamic Organization Management + Agent Intelligence + Virtual Office + Workflow Automation)_

## Project Context Analysis

### Requirements Overview

**Functional Requirements (123개, 20 Capability Areas — v2:70 + v3:53):**

<!-- v2 areas (70 FRs, Phase 1~4 — 전부 구현 완료. Tier&Cost 6→4 감소 반영) -->

| Area | FR 수 | Phase | 아키텍처 영향 |
|------|-------|-------|-------------|
| Agent Execution | 10 | 1 ✅ | SDK messages.create() 래퍼, call_agent MCP, N단계 핸드오프, 병렬 실행, 순환 감지 |
| Secretary & Orchestration | 10 | 2 ✅ | Soul 기반 라우팅, 비서 유무 분기 허브 UX 2종, 에이전트 메타데이터 자동 주입 |
| Soul Management | 5 | 1~2 ✅ | 템플릿 변수 치환 엔진, DB→Soul 동적 바인딩, 금지 섹션 자동 삽입 |
| Organization Management | 8 | 2~3 ✅ | CRUD API + NEXUS React Flow UI, 비서실장 삭제 방지 |
| Tier & Cost | 4 | 1+3 ✅ | tier_configs 테이블, enum→integer 마이그레이션 (~~cost-tracker~~ CLI Max 월정액, GATE 2026-03-20 제거) |
| Security & Audit | 6 | 1~2 ✅ | Hook 5개 (permission/credential/delegation/redactor/cost-tracker). 사용자 대면 비용 UI 제거 (FR37/FR39, GATE 2026-03-20), cost-tracker Hook 자체는 유지 (SSE `done.costUsd` + 모니터링) |
| Real-time Monitoring | 4 | 1~2 ✅ | WebSocket 핸드오프 추적, 에러 투명성, 메모리 모니터링 |
| Library (Knowledge & Briefing) | 7 | 4+유지 ✅ | pgvector 의미검색, NotebookLM MCP, 텔레그램 전송 |
| Dev Collaboration | 2 | 4 ✅ | 스케치바이브 Stdio MCP 서버 |
| Onboarding | 3 | 2 ✅ | CLI 토큰 검증, 기본 조직 자동 생성 |
| v1 Compat & UX | 7 | 유지+2 ✅ | 대화 기록, autoLearn, 파일 첨부, 마크다운 렌더링 |
| Phase 5+ Reserved | 4 | 5+ | 검색, 테마, 감사 로그 조회, 키보드 접근성 |

<!-- v3 areas (53 FRs, Sprint 1~4+병행 — 신규. TOOLSANITIZE=3, FR-UX=3 포함) -->

| Area | FR 수 | Sprint | 아키텍처 영향 |
|------|-------|--------|-------------|
| **OpenClaw 가상 사무실 (FR-OC)** | 11 | Sprint 4 | PixiJS 8 + @pixi/react 독립 패키지(`packages/office/`), `/ws/office` WebSocket 채널 신규(16→17채널), `ws/channels.ts 'office' case` activity_logs tail→상태 이벤트, LISTEN/NOTIFY or 500ms 폴링, 50conn/company 500/server, React.lazy 번들 분리 ≤200KB |
| **n8n 워크플로우 (FR-N8N)** | 6 | Sprint 2 | n8n Docker 2.12.3 ARM64 (포트 5678 내부망), Hono `proxy()` reverse proxy `/admin/n8n/*` + `/admin/n8n-editor/*`, N8N-SEC 8-layer 보안, tag 기반 멀티테넌트 `?tags=company:{companyId}`, Docker `--memory=2g` `--cpus=2` `NODE_OPTIONS=--max-old-space-size=1536`, `host-gateway` (Linux Docker: 172.17.0.1) |
| **마케팅 자동화 (FR-MKT)** | 7 | Sprint 2 | n8n 프리셋 워크플로우 6단계 파이프라인, Admin AI 도구 엔진 설정 API (`/api/company/:id/marketing-settings`), 이미지/영상/나레이션/자막 외부 API Switch 노드, fallback 엔진 자동 전환 |
| **에이전트 성격 (FR-PERS)** | 9 | Sprint 1 | `agents.personality_traits JSONB` 컬럼 추가, DB CHECK 제약 0-100 정수, `soul-enricher.ts` 단일 진입점 — personality_* 5개 extraVars 주입, PER-1 4-layer sanitization (Key Boundary→API Zod→extraVars strip→Template regex), renderSoul callers(9곳)에서 enrich() 호출 후 extraVars 확장 (E8 경계 — agent-loop.ts 직접 삽입 아님, callers가 pre-rendered soul 전달) |
| **에이전트 메모리 (FR-MEM)** | 14 | Sprint 3 | `observations` 신규 테이블 (Option B), `agent_memories` 확장 (memoryType='reflection' + embedding VECTOR(1024)), `memory-reflection.ts` 크론 워커 #7, Voyage AI voyage-3 1024d 벡터화, `pg_try_advisory_xact_lock(hashtext(companyId))` 동시 실행 방지 (non-blocking), MEM-6 4-layer observation poisoning 방어, 30일 TTL processed observations, `soul-enricher.ts`에 `{relevant_memories}` cosine ≥0.75 상위 3개 주입 |
| **도구 응답 보안 (FR-TOOLSANITIZE)** | 3 | Sprint 2~3 | FR-TOOLSANITIZE1 감지 + FR-TOOLSANITIZE2 차단+감사 + FR-TOOLSANITIZE3 100% adversarial 검증. agent-loop.ts **PreToolResult 지점** (toolResults.push 직전) `engine/tool-sanitizer.ts` 삽입 — Hook이 아닌 인라인 함수 (ECC-4, D27). L265(call_agent)+L277(일반 MCP) 2경로 모두 sanitize. PER-1/MEM-6와 별개 — 도구 응답 경유 공격 표면 |
| **CEO앱 페이지 통합 (FR-UX)** | 3 | 병행 | GATE 결정(2026-03-20). CEO앱 14페이지→6그룹 통합 (FR-UX1 통합 + FR-UX2 라우트 redirect + FR-UX3 기존 기능 100%). 기존 라우트 호환, 탭/필터로 하위 기능 분리 |
| **Go/No-Go 게이트** | 14개 | 전 Sprint | v2 8개 → v3 14개: +#9 obs poisoning, +#10 Voyage migration, +#11 tool sanitization, +#12 v1 parity, +#13 usability, +#14 capability eval |

**Non-Functional Requirements (76개, 12 Categories):**

<!-- v2 58개 (보존) + v3 18개 (신규) = 76개 활성. 삭제 2개: NFR-S7, NFR-D7 -->

| Category | 개수 | P0 | 아키텍처 영향 |
|---------|------|-----|-------------|
| Performance | 17 | 4 | call_agent E2E ≤60초, API P95 ±10%, NEXUS 60fps, **+/office FCP ≤3초, PixiJS ≤200KB gzip, /ws/office ≤2초 동기화, Reflection ≤30초, MKT E2E** |
| Security | 9 | 9 | 전부 P0. CLI 토큰 AES-256, Hook 보안 체계, **+PER-1 personality 4-layer, +N8N-SEC 8-layer, +MEM-6 observation 4-layer — 3개 독립 sanitization 체인** (NFR-S7 삭제: cost-tracker 정확도 — CLI Max 월정액) |
| Scalability | 9 | 5 | 동시 20세션, 200MB/세션, 24GB 서버, **+/ws/office 50conn/company 500/server, +n8n Docker ≤2G RAM ≤2CPU** |
| Availability | 3 | 0 | 99%, 30분 복구, 일일 DB 백업 |
| Accessibility | 7 | 0 | WCAG 2.1 AA, 색상 대비, aria-live, **+Big Five 슬라이더 aria-valuenow, +/office 스크린리더, +/office 반응형** |
| Data Integrity | 7 | 0 | 마이그레이션 무중단, 벡터 NULL 허용, 대화 무제한 보관, **+observations 30일 TTL, agent_memories(reflection) 무기한** (NFR-D7 삭제: 비용 기록 보관 — CLI Max 월정액) |
| External Dependencies | 3 | 2 | Claude CLI 장애 격리, 부분 장애 비전파 |
| Operations | 11 | 1 | 응답 품질 A/B, 비서 라우팅 80%+, Soul 반영 80%+, **+n8n /healthz 30초, +Reflection advisory lock, +CEO 일상 ≤5분** |
| Cost | 3 | 1 | 인프라 월 $10 이하, Embedding 월 $5 이하, **+Reflection 크론 Haiku ≤$0.10/일 (P0)** |
| Logging | 3 | 0 | JSON 구조화, 30일 보관, 에러 알림 |
| Browser | 3 | 1 | Chrome P0, Safari P1, Firefox/Edge P2 |
| Code Quality | 1 | 0 | CLAUDE.md 컨벤션 준수 |

**Scale & Complexity:**

- Primary domain: Full-stack SaaS B2B (web_app 40% / saas_b2b 35% / developer_tool 25%)
- Complexity level: **High** (33/40 — v2 29/40에서 상승. 외부 의존성 5/5, 회귀 범위 5/5, UX 변경 5/5)
- Project context: Brownfield (v3 Feature Addition — v2 검증 인프라 위 4 Layer + UXUI 리셋)
- Estimated architectural components: v2 ~15개 + v3 ~20개 = **~35개** (engine 7 + hooks 5 + MCP 2 + DB 마이그레이션 + soul-enricher + memory-reflection + ws/channels 'office' case + n8n Docker + proxy routes + observations table + personality migration + 3 sanitization chains)
- Sprint structure: Pre-Sprint → Sprint 1(Big Five) → Sprint 2(n8n) → Sprint 3(Memory) → Sprint 4(OpenClaw) + Layer 0 UXUI 병행

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
| **CI/CD + n8n + PG 동시** | runner ~1 + n8n ~1 + PG HNSW scan | **위험 (4코어 포화)** | ~16GB | ⚠️ 배포 중 n8n 지연 가능 |
| **HNSW rebuild (Pre-Sprint)** | PG 단독 | 중간 (단발성) | PG 4GB 중 ~2GB 사용 | ⚠️ 3인덱스 순차 rebuild 필수 |

**결론:** 동시 세션 상한 **20**이 현실적. CLI rate limit에 의해 추가 하향 가능 (Phase 1 부하 테스트로 확정).

**v3 추가 용량 리스크:**
- **HNSW rebuild 메모리 압박**: VECTOR(1024) × 3인덱스(knowledge_docs, observations, agent_memories[reflection]) rebuild 시 PG 4GB 할당 내 ~2GB 소비. 동시 rebuild 금지 — 순차 실행 필수 + work_mem 일시 증가 고려
- **CI/CD + n8n CPU 경합**: GitHub Actions runner + n8n 워크플로우 + PG 동시 실행 시 4코어 포화. n8n 워크플로우 실행을 배포 시간대 회피하거나 `--cpus=1`로 일시 제한 검토
- **Voyage AI Pre-Sprint 일정 리스크**: R11 Critical + NOT STARTED. Voyage API 장애/rate limit 시 Sprint 1 착수 지연. 마이그레이션 bulk rate limit (RPM 제한) 고려 — 대량 re-embed 시 batch 간격 설정 필수
- **n8n proxy path traversal**: `/admin/n8n/*` reverse proxy에서 path normalization 미적용 시 traversal 공격 가능. Hono proxy에서 path prefix strict match + double-dot 차단 필수 (Step 4 보안 결정)

### v3 Infrastructure Additions

| 항목 | 스펙 | 아키텍처 영향 |
|------|------|-------------|
| n8n Docker | `n8nio/n8n:2.12.3` ARM64, `--memory=2g`, `--cpus=2`, `NODE_OPTIONS=--max-old-space-size=1536` | 포트 5678 내부망 전용, Hono reverse proxy 경유, 기존 서버와 CPU/RAM 경합 |
| Voyage AI | `voyage-3` 1024d (Gemini 금지) | `vector(768)` → `vector(1024)` 마이그레이션, HNSW 재구축, Pre-Sprint 블로커 |
| observations 테이블 | 신규 1개 + agent_memories 확장 | VECTOR(1024) HNSW 인덱스 2개 추가, pgvector 메모리 영향 측정 필수 |
| /ws/office 채널 | 17번째 WebSocket 채널 | 50conn/company, 500/server, 10msg/s rate limit (token bucket) |
| packages/office/ | 독립 패키지 (PixiJS 8) | 기존 기능 격리 — 실패해도 무영향 |
| memory-reflection 워커 | 7번째 백그라운드 워커 | Haiku API 호출, advisory lock, 30일 TTL 크론 |
| `services/soul-enricher.ts` | Soul 전처리 단일 진입점 | agent-loop.ts에 1행 삽입 (E8 최소 침습), personality + memory 통합 |

**v3 메모리 예산 (24GB 기준):**

| 프로세스 | 할당 | 비고 |
|---------|------|------|
| PostgreSQL | ~4GB | pgvector HNSW 인덱스 포함 (NFR-SC7) |
| Bun 서버 | ~2GB | 20 동시 세션 × 50~200MB |
| n8n Docker | ≤2GB | Brief mandate `--memory=2g` |
| GitHub Actions runner | ~1GB | 배포 시 |
| OS + Docker | ~2GB | |
| **합계** | ~11GB | 24GB 중 ~13GB 여유 — Sprint 4 PixiJS 빌드/테스트 버퍼 |

### Technical Constraints & Dependencies

| 제약 | 영향 |
|------|------|
| Oracle VPS ARM64, **24GB RAM, 4코어** | CPU가 병목. 동시 세션 상한 20 |
| CI/CD runner 동일 서버 | 배포 중 가용 CPU 감소 → 배포 시간대 세션 제한 고려 |
| Claude Agent SDK 0.2.72 (0.x) | Breaking change 가능. agent-loop.ts 1파일 격리 필수 |
| Zod v4 (v3→v4) | MCP 도구 스키마 정의. 기존 drizzle-zod와 호환 확인 |
| Bun runtime | Node.js와 SDK 호환성 PoC 통과 확인 완료 |
| CLI Max $220 × 2개 | Human별 토큰 1:1 매핑. 토큰 풀 패턴은 Phase 5+ 검토 |
| 기존 코드베이스 | Epic 1~21 전체 기능 회귀 검증 필수 (10,154 테스트) |
| Turborepo 모노레포 | packages/admin, app, ui, shared, server + **office** (v3 신규) |

**v3 추가 제약:**

| 제약 | 영향 |
|------|------|
| n8n Docker ARM64 `--memory=2g` | Brief mandate. n8n docs 권장 4GB이나 VPS 제약으로 2G 강제. OOM kill 리스크 상시 모니터링 |
| `host.docker.internal` Linux 미작동 | `172.17.0.1` 또는 `host-gateway` 사용 (확정 결정 #12) |
| Gemini API 전면 금지 | 임베딩 포함 Voyage AI `voyage-3` (1024d) 사용. `@google/genai` 제거 필수 |
| PixiJS 8 번들 ≤ 200KB gzipped | Go/No-Go #5. `React.lazy` + dynamic import 필수. CEO앱 메인 번들 미포함 |
| Neon serverless LISTEN/NOTIFY | Sprint 4 /ws/office 실시간 이벤트 — Neon 지원 여부 검증 필수. 미지원 시 500ms 폴링 폴백 |
| 3개 독립 sanitization 체인 | PER-1(personality), MEM-6(observation), TOOLSANITIZE(tool response) — 각각 별도 공격 표면 |
| pg_advisory_xact_lock | Reflection 크론 동시 실행 방지 — Neon serverless에서 advisory lock 동작 확인 필수 |
| Layer 0 UXUI 완전 리셋 | 기존 테마 전부 폐기 → Stitch 2 기반 새 테마. ~67개 페이지 Sprint별 점진적 전환 |
| 14 Go/No-Go 게이트 | v2 8개 → v3 14개. Sprint별 게이트 통과 필수 — 미통과 시 해당 Layer 무효 |
| Voyage AI rate limit | observations + reflections 벡터화 볼륨 + knowledge docs 볼륨 합산 월 $5 이하 |

### Cross-Cutting Concerns Identified

1. **CLI 토큰 전파 (Token Propagation)**: 최초 명령자 토큰이 핸드오프 체인 전체에 전파. 에이전트 실행, 보안 Hook, 비용 추적 3개 레이어를 관통.

2. **멀티테넌시 (company_id)**: 모든 DB 쿼리, 에이전트 세션, 조직 관리, 비용 추적에 company_id 격리 적용.

3. **실시간 이벤트 버스**: Hook에서 WebSocket으로 핸드오프 이벤트 발행 → 허브 트래커에서 소비. EventEmitter(인프로세스) — 단일 서버에 충분. 인터페이스 추상화하여 Phase 5+ Redis 교체 대비.

4. **SDK 격리 경계**: agent-loop.ts 1파일만 SDK에 의존. 나머지 전체 코드베이스는 SDK-agnostic 인터페이스만 사용.

5. **Soul 템플릿 변수 치환**: DB 데이터(agent_list, subordinate_list, tool_list)를 query() 호출 전 Soul에 동적 주입. 에이전트 CRUD와 실행 엔진 양쪽에 영향.

6. **에러 투명성**: 모든 핸드오프 실패를 사용자에게 명시적으로 표시. "블랙박스 에러 0건" 요구사항.

**v3 추가 Cross-Cutting Concerns:**

7. **`services/soul-enricher.ts` 단일 진입점 (Sprint 1+3)**: agent-loop.ts 호출 전 Soul 전처리. Big Five personality extraVars 5개 + relevant_memories pgvector 검색 결과를 Soul에 주입. 성격(Sprint 1)과 메모리(Sprint 3) 모두 이 파일에서 처리. agent-loop.ts에는 `soulEnricher.enrich()` 1행만 삽입 — E8 경계 최소 침습. (engine/ 외부 services/ 배치 — engine/은 이미 `../db/`, `../lib/` import 패턴 사용 중이므로 E8 위반 아님)

8. **3개 독립 Sanitization 체인**: 각각 별도 공격 표면을 방어하는 독립 체인:
   - **PER-1** (Sprint 1): personality_traits JSONB → Key Boundary(5개 키만 허용) → API Zod(z.number().int().min(0).max(100)) → extraVars newline strip → Template regex
   - **MEM-6** (Sprint 3): observation content → 10KB 크기 제한 → 제어문자 strip → `<observation>` 프롬프트 하드닝 → 콘텐츠 분류(악의적 패턴 탐지 시 flagged=true)
   - **TOOLSANITIZE** (Sprint 2~3): tool response → agent-loop.ts PostToolUse 경로에서 prompt injection 방어 (ECC-4)

9. **Voyage AI 임베딩 전파 (Pre-Sprint ~ Sprint 3)**: Gemini 768d → Voyage AI 1024d 마이그레이션. 영향 범위: knowledge_docs(기존), observations(Sprint 3 신규), agent_memories[reflection](Sprint 3 신규). HNSW 인덱스 3개 재구축. 벡터 차원 일관성 필수 — 혼합 차원은 cosine 검색 불가.

10. **n8n 보안 격리 (Sprint 2)**: 8-layer 보안 체계가 Hono 미들웨어, Docker 네트워크, 암호화를 관통. tag 기반 멀티테넌트 격리(`?tags=company:{companyId}`)가 CORTHEX 멀티테넌시와 일관성 필요. n8n이 CORTHEX PostgreSQL DB에 직접 접근 금지 — CORTHEX API 경유만 허용.

11. **실시간 상태 파이프라인 (Sprint 4)**: activity_logs 테이블 변화 → ws/channels.ts 'office' case → /ws/office → PixiJS 렌더링. engine/agent-loop.ts 수정 없이 기존 activity_logs를 읽기 전용으로 tail. 신규 테이블 없음. 데이터 소스와 시각화 완전 분리.

12. **비용 인지 모델 라우팅 (ECC-2)**: Tier별 모델 선택 + Reflection 크론 Haiku 비용 한도($0.10/일) → cost-aware routing. Admin configurable. agent-loop.ts + memory-reflection.ts 양쪽에 영향.

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Monorepo Web Application** — Existing v2 codebase (21 Epics, 98 stories, 10,154 tests). v3 extends v2 in-place; no starter template needed. The v2 codebase IS our starter.

### Existing Stack (v2 Baseline — "Our Starter")

v2 tech stack established through Epics 1-21. All versions verified via `node_modules/.bun/` + web search (2026-03-22).

**Runtime & Build:**

| Package | Installed | Latest | Pin Strategy | Notes |
|---------|-----------|--------|-------------|-------|
| Bun | 1.3.10 | 1.3.10 | exact (`packageManager: bun@1.3.10`) | ✅ Current. Runtime + package manager + test runner |
| TypeScript | 5.9.3 | 5.9.x | caret (`^5.7`) | ✅ Current |
| Vite | 6.4.1 | 6.4.x | caret | ✅ Current. SPA build for app/admin/landing |
| Turborepo | 2.8.12 | 2.8.x | caret (`^2`) | ✅ Current. Monorepo orchestration |

**Backend:**

| Package | Installed | AS-IS Pin | TO-BE Pin | Latest | Notes |
|---------|-----------|-----------|-----------|--------|-------|
| Hono | 4.12.3 | `^4` (caret) | exact | 4.12.8 | ⚠️ 5 patches behind. Pre-Sprint: update + pin exact |
| Drizzle ORM | 0.39.3 | `^0.39` (caret) | exact | 0.45.1 | ⚠️ 6 minors behind (0.x!). Pre-Sprint: pin exact first, evaluate upgrade |
| Drizzle Kit | 0.30.6 | `^0.30` (caret) | exact | 0.30.x | Migration tool — update with ORM |
| postgres | 3.4.8 | `^3.4` (caret) | exact | 3.4.x | ✅ Neon serverless driver |
| Zod | 3.25.76 (server) | `^3.24` (caret) | caret ✅ | 3.25.x | ✅ SemVer stable (major ≥ 3). 주의: 3.23.8도 transitive로 존재 |
| @anthropic-ai/sdk | 0.78.0 | `^0.78.0` (caret!) | exact (CRITICAL) | 0.80.0 | ⚠️ **CLAUDE.md 위반**: "SDK pin version (no ^)". Pre-Sprint 즉시 교정 |
| @anthropic-ai/claude-agent-sdk | 0.2.72 | `0.2.72` (exact ✅) | exact | 0.2.x | ✅ 유일한 정확 pin. engine/agent-loop.ts 핵심 의존 |
| ~~@google/generative-ai~~ | 0.24.1 | `^0.24.1` | **삭제** | — | 🔴 **Gemini 금지 (확정 결정 #1)**. Pre-Sprint 즉시 제거 + voyageai 교체 |

**Frontend:**

| Package | Installed | AS-IS Pin | TO-BE Pin | Latest | Notes |
|---------|-----------|-----------|-----------|--------|-------|
| React | 19.2.4 | `^19` (caret) | caret ✅ | 19.2.x | ✅ SemVer stable (major ≥ 1) |
| React DOM | 19.2.4 | `^19` (caret) | caret ✅ | 19.2.x | ✅ |
| react-router-dom | 7.13.1 | `^7` (caret) | caret ✅ | 7.x | ✅ SPA routing |
| Tailwind CSS | 4.2.1 | `^4` (caret) | caret ✅ | 4.2.x | ✅ v4 (CSS-first config) |
| Zustand | 5.0.11 | `^5.0.11` (caret) | caret ✅ | 5.0.x | ✅ SemVer stable. Client state |
| @tanstack/react-query | 5.90.21 | `^5.90.21` (caret) | caret ✅ | 5.x | ✅ SemVer stable. Server state |

### v3 New Package Additions (Version Verified 2026-03-22)

| Package | Version | Purpose | Sprint | Pin Strategy |
|---------|---------|---------|--------|-------------|
| `pixi.js` | 8.17.1 | OpenClaw 가상 사무실 2D 렌더링 | 4 | exact — tree-shaking 6클래스, ≤200KB gzip (Go/No-Go #5) |
| `@pixi/react` | 8.0.5 | React 19 + PixiJS 8 declarative bindings | 4 | exact — React 19 전용 설계 확인 (pixijs.com/blog/pixi-react-v8-live). React.lazy 코드 스플릿, `packages/office/` 독립 패키지 |
| `voyageai` | 0.2.1 | Voyage AI `voyage-3` 1024d 임베딩 SDK | Pre-Sprint | exact — Gemini 금지 (확정 결정 #1). 0.x = manual update only |
| `n8n` (Docker) | 2.12.3 (PRD pin) | n8n 워크플로우 엔진 (사이드카 컨테이너) | 2 | Docker tag pin `n8nio/n8n:2.12.3` — npm 패키지 아님, Docker image |

**v3 패키지 아키텍처 영향:**
- `pixi.js` + `@pixi/react`: `packages/office/` 독립 workspace 패키지로 격리. React.lazy → 메인 번들에 영향 0. PixiJS tree-shaking으로 Application, Container, Sprite, AnimatedSprite, Text, Graphics 6클래스만 포함. ⚠️ **ARM64 CI 제약**: VPS = Oracle ARM64 headless → WebGL 컨텍스트 없음. PixiJS 렌더링 E2E 테스트는 Playwright + `--headless` chromium (GPU 소프트웨어 에뮬레이션) 또는 번들 크기 테스트만 CI, 시각적 테스트는 수동/별도 환경
- `voyageai`: `packages/server/src/lib/voyage-client.ts` 단일 래퍼. 기존 `@google/genai` 코드 경로 1:1 교체. vector(768) → vector(1024) 마이그레이션 + HNSW 재구축 필수
- `n8n` Docker: npm 의존성 아님. `docker-compose.n8n.yml` 별도 파일로 관리. Hono reverse proxy가 `/admin/n8n/*` 경로 중개

### Architectural Decisions Provided by Existing Stack

v2 stack이 v3에 제공하는 사전 결정 — v3에서 재결정 불필요:

| 영역 | v2 확정 | v3 영향 |
|------|--------|---------|
| **Language & Runtime** | TypeScript strict + Bun | 모든 v3 코드 동일 런타임. n8n은 Docker 격리 (Node.js 자체 런타임) |
| **Monorepo 구조** | Turborepo + Bun workspaces (7패키지) | `packages/office/` 1개 추가 → 8패키지. turbo.json pipeline 1행 추가 |
| **API Framework** | Hono (Web Standards) | n8n reverse proxy = Hono `proxy()` 미들웨어 추가. 기존 라우팅 구조 그대로 |
| **ORM & Migrations** | Drizzle ORM + drizzle-kit | observations 테이블 + agent_memories 컬럼 추가 = Drizzle migration. 기존 패턴 그대로 |
| **Styling** | Tailwind CSS v4 + CVA + clsx | v3 UI (Big Five 슬라이더, /office, 페이지 통합) 모두 동일 스타일링 |
| **State Management** | Zustand (client) + React Query (server) | /office WebSocket 상태 = Zustand store 추가. 기존 패턴 그대로 |
| **Testing** | bun:test (10,154 cases) | v3 테스트도 bun:test. Playwright E2E 기존 infra 활용 |
| **CSS Architecture** | Dark-only + design tokens | Layer 0 UXUI 리셋은 기존 토큰 체계 위에서 작업 |
| **Build & Deploy** | Vite SPA build → GitHub Actions → Cloudflare | 변경 없음. `packages/office/` 는 app에서 React.lazy import |
| **Auth & Security** | CLI 토큰 AES-256 + 5 Hook 체인 | +PER-1/MEM-6/TOOLSANITIZE 3개 sanitization 체인 추가. Hook 구조는 그대로 |

### Version Management Strategy

**AS-IS 문제점 (v2 현재):**
- 서버 package.json에 대부분 caret(`^`) 사용 — `bun install` 시 의도치 않은 자동 업그레이드 가능
- CLAUDE.md "SDK pin version (no ^)" 규칙을 `@anthropic-ai/sdk`가 위반 중 (`^0.78.0`)
- `@google/generative-ai: ^0.24.1` 잔존 — Gemini 금지 확정 결정 #1 위반
- 유일한 정확 pin: `@anthropic-ai/claude-agent-sdk: 0.2.72` ✅

**TO-BE 규칙 (v3 Pre-Sprint 교정):**

1. **exact pin (no `^`)**: `@anthropic-ai/sdk`, `@anthropic-ai/claude-agent-sdk`, `voyageai`, `drizzle-orm`, `drizzle-kit`, `hono`, `pixi.js`, `@pixi/react`, `postgres` — 0.x 또는 서버 핵심 패키지
2. **caret (`^`) 허용**: React, React DOM, Vite, Tailwind, Turborepo, react-router-dom, Zod, Zustand, @tanstack/react-query — SemVer 안정 (major ≥ 1)
3. **Docker tag pin**: `n8nio/n8n:2.12.3` — `:latest` 사용 금지
4. **Pre-Sprint pin 교정**: 서버 package.json 전체 `^` → exact version으로 교정 + `bun install --frozen-lockfile` 검증
5. **Pre-Sprint 업데이트**: Hono 4.12.3 → 4.12.8 (patch), SDK 0.78.0 → 0.80.0 (E2E 후 결정)
6. **Drizzle 0.39.3 → 0.45.1 평가**: changelog 리뷰. Breaking change 있으면 현행 유지 + exact pin
7. **lockfile**: `bun.lockb` 커밋 필수. CI에서 `bun install --frozen-lockfile` 강제
8. **`@google/generative-ai` 삭제**: Pre-Sprint 즉시 제거 (확정 결정 #1)

### Starter Template Evaluation Conclusion

**"No starter template needed"** — v2 codebase (21 Epics, 485 API endpoints, 86 DB tables, 10,154 tests)가 v3의 starter. 기존 아키텍처 결정 100% 유지하면서 4개 v3 패키지(`pixi.js`, `@pixi/react`, `voyageai`, n8n Docker)만 추가. 가장 큰 구조 변경은 `packages/office/` workspace 추가 (monorepo 확장).

**Pre-Sprint 필수 작업 (7건):**
1. **Pin 교정**: 서버 package.json `^` → exact version 전환 (CLAUDE.md 규칙 준수)
2. **`@google/generative-ai` 삭제** + `voyageai` 0.2.1 설치 (확정 결정 #1)
3. **Voyage AI re-embed** + vector(768)→vector(1024) 마이그레이션 + HNSW 재구축 (Go/No-Go #10)
4. **Hono 4.12.3 → 4.12.8** 패치 업데이트 (non-breaking)
5. **@anthropic-ai/sdk 0.78.0 → 0.80.0** 평가 (E2E 검증 후 결정)
6. **Drizzle ORM 0.39.3 → 0.45.1** changelog 리뷰 (breaking 있으면 현행 유지)
7. **`bun install --frozen-lockfile`** 검증 — pin 교정 후 lockfile 정합성 확인

---

## v3 Core Architectural Decisions (D22-D34)

v2 D1-D21 전부 유지. 아래는 v3 신규 결정 — 6개 carry-forward 항목 + 7개 추가.

### Decision Priority Analysis (v3)

**Critical Decisions (Sprint 차단):**

| # | 결정 | 선택 | Sprint | 근거 |
|---|------|------|--------|------|
| D22 | observations 테이블 스키마 | `observations(id, company_id FK, agent_id FK, session_id, task_execution_id, content TEXT, domain VARCHAR(50), outcome VARCHAR(20), tool_used, importance INTEGER, confidence REAL, embedding VECTOR(1024), reflected BOOLEAN, reflected_at, flagged, observed_at, created_at, updated_at)` + partial index(unreflected+importance) + HNSW(embedding) | 3 | Option B 확정. PRD FR-MEM1 전체 컬럼 반영 (session_id, outcome, tool_used). 필드명 확정 결정 #7. importance=Park et al. sum>150 트리거. `flagged`는 아키텍처 추가 (MEM-6 layer 4) |
| D23 | soul-enricher 통합 패턴 | `services/soul-enricher.ts` — `enrich(agentId, companyId): Promise<ExtraVars>`. 9개 caller(hub.ts, commands.ts 등)의 기존 `renderSoul(soul, agentId, companyId, extraVars?)` 호출에 extraVars 확장. Sprint 1: personality만, Sprint 3: +memory | 1 | E8 최소 침습. agent-loop.ts에 renderSoul 호출 없음 (pre-rendered soul 수신). callers의 기존 renderSoul 4-param 시그니처에 extraVars 추가 |
| D24 | /ws/office 프로토콜 | `ws/channels.ts` switch/case에 'office' case 추가 + `shared/types.ts` WsChannel union 확장. 메시지: `{type: 'agent_state', agentId, state: 'idle'\|'working'\|'delegating'\|'error', task?, progress?}`. heartbeat 적응형 (idle 30초 / active 5초). 50conn/company, 500/server | 4 | activity_logs tail → 상태 이벤트 변환. 기존 `ws/channels.ts` switch/case + WsChannel union 패턴 복제. JWT 인증 기존 ws-auth 미들웨어 재활용 |
| D25 | n8n reverse proxy | Hono `proxy()` → `http://127.0.0.1:5678` (Docker ports 매핑 127.0.0.1:5678:5678). 경로: `/admin/n8n-editor/*` (UI), `/admin/n8n/*` (API). Admin JWT 미들웨어 필수. path normalization: double-dot 차단 + prefix strict match. ⚠️ 확정 결정 #12(172.17.0.1)는 **컨테이너→호스트** 방향 — Hono(호스트)→n8n(컨테이너)는 Docker ports 매핑된 127.0.0.1 사용 | 2 | N8N-SEC 8-layer 중 SEC-2(Admin 전용) + SEC-3(tag 격리). Hono proxy()는 request/response 스트리밍 지원. `?tags=company:{companyId}` 자동 주입으로 멀티테넌트 격리 |
| D26 | 실시간 상태: **polling** (LISTEN/NOTIFY 불가) | `ws/channels.ts 'office' case`에서 500ms `setInterval` → activity_logs 최신 행 조회. LISTEN/NOTIFY는 Neon serverless에서 **사용 불가** (session loss on compute suspension, direct connection 필수, HTTP transport 미지원) | 4 | Neon 제약 확인 (neon.com/docs/introduction/compute-lifecycle). 500ms 폴링 = 에이전트 50개 기준 초당 2쿼리 — PG 부하 무시 가능. 향후 Neon persistent connection 지원 시 LISTEN/NOTIFY 전환 가능 |
| D27 | tool-sanitizer (PreToolResult) | `engine/agent-loop.ts` — **toolResults.push 직전** 삽입 (PostToolUse 아님). 패턴 탐지: regex 10종 (`ignore previous`, `system:`, `<\|im_start\|>`, base64 encoded 등). 감지 시 `[BLOCKED: suspected injection]` 교체 + activity_logs 감사 기록. ⚠️ PostToolUse hooks(L282)는 side-effect COPY만 처리 → LLM에 도달하는 toolResults 원본 수정 불가 | 2 | ECC-4. toolResults.push(L277) **이전**에 sanitize 필수 — `const sanitized = toolSanitizer(ctx, block.name, mcpOutput)` → `toolResults.push({content: sanitized})`. PostToolUse의 scrubber/redactor는 별도로 side-effect(로깅/WS) 담당 |

**Important Decisions (아키텍처 형성):**

| # | 결정 | 선택 | Sprint | 근거 |
|---|------|------|--------|------|
| D28 | Reflection 크론 스케줄링 | `croner` 일 1회 `0 3 * * *` (PRD FR-MEM3) + 회사별 **60분 분산** (`company_id hash % 60`). 트리거: `reflected=false AND confidence ≥ 0.7` ≥ 20건 (미달 시 스킵). Tier 한도: Tier 1-2 무제한, Tier 3-4 주 1회 cap (MEM-2). `pg_advisory_xact_lock` (확정 결정 #9). 비용: Haiku ≤$0.10/일 | 3 | pg-boss 불필요 — croner 10.x 이미 설치+검증됨. 60분 분산으로 PG 부하 분산. advisory lock으로 중복 방지. Tier별 cap으로 비용 제어 |
| D29 | JSONB race condition | `company.settings` UPDATE 시 **`jsonb_set()` + `WHERE` 조건부** (read-modify-write 아닌 atomic partial update). 동시 수정 빈도 낮음 (Admin 1명 전용) → 별도 테이블 과설계 | 전체 | PRD carry-forward. `UPDATE companies SET settings = jsonb_set(settings, '{key}', '"value"') WHERE id = $1` — 단일 SQL, 트랜잭션 불필요. 동시 수정 시 마지막 기록 승리 (Admin 단일 사용자이므로 허용) |
| D30 | packages/office/ 구조 | Turborepo workspace `packages/office/`. 진입점: `src/OfficeCanvas.tsx` (React.lazy import from app). 내부: `src/sprites/`, `src/hooks/`, `src/store.ts` (Zustand). `pixi.js` + `@pixi/react` 이 패키지에만 의존 | 4 | 번들 격리: office/ 패키지의 PixiJS 의존성이 app/ 메인 번들에 영향 0. React.lazy → 코드 스플릿 자동. turbo.json에 `office#build` 1행 추가. Go/No-Go #5 (≤200KB) 측정 포인트 = 이 패키지 빌드 출력 |
| D31 | Voyage AI 클라이언트 | `services/voyage-embedding.ts` — 기존 `services/embedding-service.ts` credential vault 패턴 계승. `getEmbedding(companyId, text): Promise<number[]>`, `getEmbeddingBatch(companyId, texts[], batchSize=32)`. `getCredentials(companyId, 'voyage_ai')` — per-company credential. Rate limit: batch 간 100ms | Pre-Sprint | `@google/genai` → `voyageai` 교체. 기존 `getCredentials(companyId, 'google_ai')` 패턴 → `'voyage_ai'` provider 추가. 시그니처 변경 `(text)` → `(companyId, text)` → 호출부 3곳 수정 |
| D32 | Sprint 2/2.5 분할 | **분할 안 함** — Sprint 2 유지 (FR-N8N 6 + FR-MKT 7 + FR-TOOLSANITIZE 3 = 16 FRs). n8n Docker 설정이 자동화 가능(compose 1파일), TOOLSANITIZE는 Hook 1파일 추가. 실제 구현 볼륨은 Sprint 1(Big Five 9 FRs + Layer 0 병행)과 유사 | 2 | PRD carry-forward. 16 FRs 중 n8n 설정(compose+proxy)은 인프라 작업, MKT는 n8n 프리셋 설정, TOOLSANITIZE는 Hook 1파일. Sprint 1(9+FR-UX 병행)과 비교해 과부하 아님. 분할 시 Sprint 간 의존성 복잡도 증가 |
| D33 | Big Five personality 검증 | DB: `agents.personality_traits JSONB` + `CHECK (personality_traits IS NULL OR (personality_traits ?& ARRAY['openness','conscientiousness','extraversion','agreeableness','neuroticism']))`. API: Zod `z.record(z.number().int().min(0).max(100))` 5키 exactly. 프리셋: 3종+ (`balanced`, `creative`, `analytical`) | 1 | 5키 × 0-100 정수. DB CHECK + API Zod 이중 검증. NULL 허용 = 성격 미설정 에이전트 (기존 v2 에이전트 호환). soul-enricher가 NULL이면 성격 extraVars 생략 — Zero Regression |

**Deferred Decisions (Post-Sprint):**

| # | 결정 | 이유 |
|---|------|------|
| D34 | CEO앱 페이지 통합 상세 라우팅 | FR-UX 병행 scope. 기존 라우트 → 새 라우트 매핑은 구현 시점에 결정. 6그룹 구조만 확정 (FR-UX1) |

### v3 Data Architecture Additions

**observations 테이블 (D22):**

```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id UUID,                                        -- FR-MEM1: 대화 세션 연결
  task_execution_id UUID,                                 -- FK deferred (task_executions 테이블 v3 신규)
  content TEXT NOT NULL CHECK (length(content) <= 10240), -- 10KB cap (MEM-6 layer 1)
  domain VARCHAR(50) NOT NULL DEFAULT 'conversation',     -- 'conversation'|'tool_use'|'error' (Brief §4)
  outcome VARCHAR(20) NOT NULL DEFAULT 'unknown',         -- FR-MEM9: 'success'|'failure'|'unknown' (성공률 추적)
  tool_used VARCHAR(100),                                 -- FR-MEM1: 관찰 생성한 도구명
  importance INTEGER NOT NULL DEFAULT 5,                  -- 1-10 (Park et al.), 반성 트리거 임계값 sum > 150
  confidence REAL NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),  -- 0.3-0.9
  embedding VECTOR(1024),                                 -- Voyage AI voyage-3 (확정 결정 #1)
  reflected BOOLEAN NOT NULL DEFAULT false,               -- 확정 결정 #7: is_processed → reflected
  reflected_at TIMESTAMPTZ,
  flagged BOOLEAN NOT NULL DEFAULT false,                 -- MEM-6 layer 4: 콘텐츠 분류 의심 (아키텍처 추가)
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),         -- 관찰 발생 시점
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reflection 크론 성능: unreflected + importance 높은 순
CREATE INDEX idx_observations_unreflected
  ON observations (company_id, agent_id, importance DESC)
  WHERE reflected = false;

-- 의미 검색: reflected observations에서 유사 관찰 찾기
CREATE INDEX idx_observations_embedding
  ON observations USING hnsw (embedding vector_cosine_ops);

-- TTL 삭제: 30일 이상 reflected observations
CREATE INDEX idx_observations_ttl
  ON observations (reflected_at)
  WHERE reflected = true;
```

**⚠️ confidence 스케일 차이 문서화:**
- `observations.confidence`: REAL 0-1 (PRD 명시, 0.3-0.9 범위)
- `agent_memories.confidence`: INTEGER 0-100 (기존 v2 패턴, schema.ts:1598)
- 두 테이블 간 비교 시 `observations.confidence * 100` 변환 필요

**agent_memories 확장 + agents 확장 (Option B — D22/D33 관련):**

```sql
-- 1. memoryTypeEnum에 'reflection' 추가 (트랜잭션 외부에서 실행 필수)
ALTER TYPE memory_type ADD VALUE IF NOT EXISTS 'reflection';

-- 2. agent_memories에 embedding 컬럼 추가 (confidence는 기존 integer(0-100) 유지)
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS embedding VECTOR(1024);

-- 3. Reflection 의미 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_agent_memories_reflection_embedding
  ON agent_memories USING hnsw (embedding vector_cosine_ops)
  WHERE memory_type = 'reflection';

-- 4. agents 테이블에 personality_traits 추가 (D33)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_traits JSONB
  CHECK (personality_traits IS NULL OR (
    personality_traits ?& ARRAY['openness','conscientiousness','extraversion','agreeableness','neuroticism']
  ));
```

### v3 Security Architecture

**3개 독립 Sanitization 체인 (구현 상세):**

```
PER-1 (Sprint 1) — personality_traits 공격 방어:
  Layer 1: Key Boundary — personality_traits JSONB에서 5개 키만 추출 (다른 키 무시)
  Layer 2: API Zod — z.number().int().min(0).max(100) 각 키 검증
  Layer 3: extraVars strip — newline, 탭, 제어문자 제거
  Layer 4: Template regex — Soul 템플릿 내 {{personality_*}} 변수만 치환 허용
  진입점: services/soul-enricher.ts → callers(hub.ts 등)의 renderSoul(soul, agentId, companyId, extraVars)

MEM-6 (Sprint 3) — observation content 공격 방어:
  Layer 1: 크기 제한 — content TEXT ≤ 10KB (DB CHECK)
  Layer 2: 제어문자 strip — \x00-\x1F 제거 (newline/tab 보존)
  Layer 3: 프롬프트 하드닝 — <observation> 래핑으로 LLM이 시스템 명령으로 해석 방지
  Layer 4: 콘텐츠 분류 — 악의적 패턴 탐지 시 flagged=true + activity_logs 기록
  진입점: observation 저장 API (routes/observations.ts)

TOOLSANITIZE (Sprint 2) — tool response injection 방어:
  Layer 1: regex 10종 패턴 매칭 (D27)
  Layer 2: 매칭 시 응답 교체 [BLOCKED: suspected injection]
  Layer 3: activity_logs 감사 기록 (agent_id, tool_name, blocked_pattern)
  Layer 4: Go/No-Go #11 검증 — 10종 adversarial payload 100% 차단율
  진입점: engine/agent-loop.ts — **PreToolResult 지점** (toolResults.push 직전)
  ⚠️ PostToolUse 아님: agent-loop.ts L277에서 toolResults.push가 PostToolUse보다
     먼저 실행됨. PostToolUse hooks는 side-effect용 COPY만 처리 → LLM이 unsanitized
     원본 수신. 따라서 push 직전에 sanitize:
     const sanitized = toolSanitizer(ctx, block.name, mcpOutput)
     toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: sanitized })
```

**n8n N8N-SEC 8-layer 구현 매핑 (D25):**

| Layer | 구현 위치 | 검증 |
|-------|----------|------|
| SEC-1 VPS 방화벽 | `iptables -A INPUT -p tcp --dport 5678 -j DROP` (외부) | netcat 외부→5678 REJECT |
| SEC-2 Admin JWT | `server/src/routes/admin/n8n-proxy.ts` Hono 미들웨어 | Admin 토큰 없이 401 |
| SEC-3 tag 격리 | proxy에서 `?tags=company:{companyId}` 자동 주입 | 타사 워크플로우 조회 불가 |
| SEC-4 webhook HMAC | n8n webhook 노드 HMAC 검증 설정 | 위조 webhook 거부 |
| SEC-5 Docker 리소스 | `--memory=2g --cpus=2` (확정 결정 #2) | `docker stats` 모니터링 |
| SEC-6 DB 직접 차단 | n8n `DB_TYPE=sqlite` (내부 SQLite). CORTHEX PG 접근 경로 없음 | n8n 컨테이너에서 PG 포트 차단 |
| SEC-7 크레덴셜 암호화 | `N8N_ENCRYPTION_KEY` 환경변수 (AES-256-GCM) | 암호화 키 없이 크레덴셜 복호화 불가 |
| SEC-8 API rate limit | Hono rate limiter 60req/min per company (PRD 100/min 대비 보수적 — n8n API 특성상 60rpm 충분. 필요 시 상향 가능) | 61번째 요청 429 |

### v3 API & Communication

**soul-enricher 통합 흐름 (D23):**

```
[허브 요청] → hub.ts (기존 renderSoul 호출 지점 — 9개 caller 중 하나)
  ↓
  const personalityVars = await soulEnricher.enrich(agentId, companyId);
  const extraVars = { ...knowledgeVars, ...personalityVars };
  ↓
  renderSoul(agent.soul, agentId, companyId, extraVars)  // 4-param 시그니처
  ↓
  runAgent({ soul: renderedSoul, ... })  // agent-loop.ts는 pre-rendered soul 수신

⚠️ agent-loop.ts에는 renderSoul 호출 없음 (grep 0건).
   renderSoul 호출자: hub.ts, commands.ts, presets.ts, public-api/v1.ts 등 9개 caller.
   soul-enricher 통합은 이 callers의 기존 renderSoul 호출에 extraVars 확장.

services/soul-enricher.ts:
  enrich(agentId, companyId):
    Sprint 1: personality_traits → {personality_openness: 75, ...} 5개 extraVars
    Sprint 3: + pgvector cosine ≥0.75 상위 3개 → {relevant_memories: "..."}
    return { ...personalityVars, ...memoryVars }
```

**Voyage AI 클라이언트 (D31):**

```typescript
// services/voyage-embedding.ts (기존 services/embedding-service.ts 패턴 계승)
import VoyageAI from 'voyageai';
import { getCredentials } from './credential-vault';  // per-company credential vault

export async function getEmbedding(companyId: string, text: string): Promise<number[]> {
  const credentials = await getCredentials(companyId, 'voyage_ai');
  const client = new VoyageAI({ apiKey: credentials.apiKey });
  const result = await client.embed({ input: [text], model: 'voyage-3' });
  return result.data[0].embedding;  // 1024d
}

export async function getEmbeddingBatch(
  companyId: string,
  texts: string[],
  batchSize = 32
): Promise<number[][]> {
  const credentials = await getCredentials(companyId, 'voyage_ai');
  const client = new VoyageAI({ apiKey: credentials.apiKey });
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const result = await client.embed({ input: batch, model: 'voyage-3' });
    results.push(...result.data.map(d => d.embedding));
    if (i + batchSize < texts.length) await new Promise(r => setTimeout(r, 100)); // rate limit
  }
  return results;
}
// ⚠️ 기존 embedding-service.ts의 getCredentials(companyId, 'google_ai') 패턴 계승.
//   'google_ai' → 'voyage_ai' provider 타입 추가 필요.
//   getEmbedding(text) → getEmbedding(companyId, text) 시그니처 변경 → 호출부 3곳 수정.
```

### v3 Frontend Architecture

**packages/office/ 구조 (D30):**

```
packages/office/
├── package.json          # pixi.js, @pixi/react 의존
├── tsconfig.json
├── vite.config.ts        # library mode 빌드
└── src/
    ├── index.ts           # React.lazy 진입점 export
    ├── OfficeCanvas.tsx    # 메인 PixiJS Stage 컴포넌트
    ├── sprites/
    │   ├── AgentSprite.tsx  # 에이전트 아바타 스프라이트
    │   ├── DeskSprite.tsx   # 책상/작업 공간
    │   └── StatusBubble.tsx # 상태 말풍선
    ├── hooks/
    │   └── useOfficeWs.ts   # /ws/office WebSocket 훅
    └── store.ts             # Zustand: 에이전트 상태 맵
```

**app에서 import:**
```typescript
// packages/app/src/pages/office.tsx
const OfficeCanvas = React.lazy(() => import('@corthex/office'));
```

### v3 Infrastructure

**memory-reflection 크론 (D28):**

```
croner 스케줄: "0 3 * * *" (매일 새벽 3시 — PRD FR-MEM3 "일 1회 크론")
  → 전체 company 목록 조회
  → company_id hash % 60 → 분 오프셋 (03:00~03:59 분산 실행)
  → pg_advisory_xact_lock(hashtext(companyId))  // 동시 실행 방지 (확정 결정 #9)
  → 에이전트별 처리:
    → SELECT * FROM observations
       WHERE reflected = false AND confidence >= 0.7
       ORDER BY importance DESC
       LIMIT 20
    → 미달 시 (< 20건) 스킵 — PRD FR-MEM3 "≥ 20 AND confidence ≥ 0.7 조건"
  → Tier 한도 체크 (PRD MEM-2):
    → Tier 1-2 (Sonnet/Opus): 무제한
    → Tier 3-4 (Haiku): 주 1회 cap → 이번 주 실행 여부 확인, 초과 시 스킵
  → Haiku API: 20개 observation → 1개 reflection 요약
  → INSERT INTO agent_memories (memory_type='reflection', embedding=...)
  → UPDATE observations SET reflected=true WHERE id IN (...)
  → 비용 체크: 일일 누적 > $0.10 → 크론 일시 중지 + Admin 알림 (NFR-COST3)
```

**n8n Docker Compose (D25):**

```yaml
# docker-compose.n8n.yml
services:
  n8n:
    image: n8nio/n8n:2.12.3
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"  # localhost only (SEC-1)
    environment:
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}  # SEC-7
      - N8N_DISABLE_UI=false
      - DB_TYPE=sqlite  # SEC-6: CORTHEX PG 접근 차단 — n8n 내부 SQLite 사용
      - NODE_OPTIONS=--max-old-space-size=1536  # 확정 결정 #2
      - GENERIC_TIMEZONE=Asia/Seoul
    deploy:
      resources:
        limits:
          memory: 2g   # 확정 결정 #2
          cpus: '2'
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    extra_hosts:
      - "host.docker.internal:host-gateway"  # 확정 결정 #12: n8n→CORTHEX API webhook 호출용
```

### Decision Impact Analysis

**Implementation Sequence (Sprint 순):**

```
Pre-Sprint: D31(Voyage client 교체 + credential vault 'voyage_ai' 추가) → D22(Drizzle schema 작성 + migration SQL 생성 — 테이블 CREATE는 Sprint 3)
Sprint 1:   D23(soul-enricher personality) → D33(Big Five validation)
Sprint 2:   D25(n8n proxy) + D27(tool-sanitizer, 독립) → D32 확정(분할 불필요)
Sprint 3:   D22(observations 테이블 생성) → D28(reflection 크론) → D23 확장(+memory)
Sprint 4:   D30(packages/office) → D24(/ws/office) → D26(polling)
병행:       D29(JSONB fix) → D34(FR-UX routing, deferred)
```

**Cross-Component Dependencies:**

| 결정 | 의존 | 이유 |
|------|------|------|
| D23 (soul-enricher) | D33 (Big Five) | extraVars에 personality 값 필요 |
| D28 (reflection 크론) | D22 (observations) | observations 테이블 존재 필수 |
| D24 (/ws/office) | D26 (polling) | 실시간 데이터 소스 결정이 채널 구현에 영향 |
| D31 (Voyage client) | D22 (observations) | embedding VECTOR(1024) 생성 필요 |

> ⚠️ D25(n8n proxy)↔D27(tool-sanitizer) 의존성 **없음**: n8n proxy는 HTTP→Admin 브라우저 경로. tool-sanitizer는 engine tool pipeline (MCP tool 경유). n8n webhook 보안은 SEC-4(HMAC) + SEC-2(Admin JWT)로 커버.

### PRD Carry-Forward Resolution

| 항목 | 결정 | 상태 |
|------|------|------|
| FIX-6 FR-OC7 LISTEN/NOTIFY vs 폴링 | **D26: polling** (Neon serverless 제약) | ✅ 해소 |
| N8N-SEC API key + rate limiting | **D25: 8-layer 매핑 완료** (SEC-7 AES-256-GCM + SEC-8 60req/min) | ✅ 해소 |
| Sprint 2 과부하 | **D32: 분할 안 함** (16 FRs, Sprint 1과 유사 볼륨) | ✅ 해소 |
| Reflection 크론 스케줄링 | **D28: croner 일 1회 03:00 + 60분 분산** (pg-boss 불필요) | ✅ 해소 |
| packages/office 독립 패키지 | **D30: Turborepo workspace** (React.lazy 번들 격리) | ✅ 해소 |
| JSONB race condition | **D29: jsonb_set() atomic** (별도 테이블 과설계) | ✅ 해소 |

---

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
  runId: string;           // E17: 전체 세션 도구 호출 그룹핑 (Epic 15)
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
| `voyageai` | **Voyage AI SDK** — `voyage-3` 1024d 임베딩 (확정 결정 #1. ~~@google/genai~~ Gemini 금지) | server/ |
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

---

## v3 "OpenClaw" — Project Context Analysis

_v3 Brownfield Update — v2 아키텍처(D1~D21, E1~E10) 위에 4 Layer + UXUI 리셋 추가. v2 삭제 없음._

### v2 Baseline (코드 검증 완료 — 2026-03-20 감사)

| 항목 | 수치 | 출처 |
|------|------|------|
| API 엔드포인트 | 485개 | `v3-corthex-v2-audit.md` |
| 프론트엔드 페이지 | 71개 | `v3-corthex-v2-audit.md` |
| DB 테이블 | 86개 | `v3-corthex-v2-audit.md` |
| DB Enum | 29개 | `project-context.yaml` |
| 빌트인 도구 | 68개 | `project-context.yaml` |
| WebSocket 채널 | 16개 (`shared/types.ts:484-501`) | PRD 코드 검증 |
| 백그라운드 워커 | 6개 | `project-context.yaml` |
| 마이그레이션 | 60개 | `project-context.yaml` |
| 테스트 | 10,154 cases / 393 files | `project-context.yaml` |
| Epic | 21개 완료 (98/98 스토리) | MEMORY.md |

### v3 Requirements Overview

**v3 Functional Requirements (53개 신규, v2 70개 활성 → 총 123개 활성, 2개 삭제: FR37/FR39 비용 UI):**

| Area | FR 수 | Sprint | 아키텍처 영향 |
|------|-------|--------|-------------|
| OpenClaw 가상 사무실 (FR-OC) | 11 | Sprint 4 | `packages/office/` 독립 패키지, PixiJS 8 React.lazy, `/ws/office` 17번째 WS 채널, `ws/channels.ts 'office' case` activity_logs tail, PostgreSQL LISTEN/NOTIFY 또는 500ms 폴링 폴백 |
| n8n 워크플로우 (FR-N8N) | 6 | Sprint 2 | `n8nio/n8n:2.12.3` Docker ARM64, Hono reverse proxy `/admin/n8n/*` + `/admin/n8n-editor/*`, 포트 5678 localhost 전용, **N8N-SEC 8-layer** 보안 (확정 결정 #3), tag 기반 멀티테넌트, `--memory=2g` (확정 결정 #2) |
| 마케팅 자동화 (FR-MKT) | 7 | Sprint 2 | n8n 프리셋 워크플로우, 외부 AI 도구 엔진 카테고리 선택, `company.settings` JSONB AES-256 API 키 저장, 워터마크 ON/OFF, fallback 엔진 |
| 에이전트 성격 (FR-PERS) | 9 | Sprint 1 | `personality_traits JSONB` agents 테이블 컬럼, `soul-enricher.ts` 5개 개별 extraVars, PER-1 4-layer sanitization, 프리셋 3종+, DB CHECK 제약, 키보드 접근성 |
| 에이전트 메모리 (FR-MEM) | 14 | Sprint 3 | `observations` 테이블 신규, `agent_memories` 확장 (memoryType='reflection' + embedding VECTOR(1024)) — **Option B 확정**, `memory-reflection.ts` 크론 워커, Voyage AI voyage-3 1024d 벡터화, cosine ≥ 0.75 검색, `{relevant_memories}` Soul 주입, 30일 TTL processed observations |
| 도구 응답 보안 (FR-TOOLSANITIZE) | 3 | Sprint 2 | `agent-loop.ts` **PreToolResult 지점**(toolResults.push 직전)에 `engine/tool-sanitizer.ts` 삽입 — Hook 아닌 인라인 함수. L265(call_agent)+L277(일반 MCP) 2경로 sanitize, 10종 adversarial payload 100% 차단, 감사 로그 |
| CEO앱 페이지 통합 (FR-UX) | 3 | 병행 | 14→6 그룹 통합, 라우트 redirect 호환, 기능 100% 유지 |

**메모리 아키텍처 확정 — Option B (확정 결정, PRD 정합):**
- `agent_memories`: v2 기존 유지 + `memoryType='reflection'` 추가 + `embedding VECTOR(1024)` 컬럼 추가. Zero Regression: 기존 memoryType 값 불변, reflection 타입만 신규 추가
- `observations`: 신규 테이블 (raw INPUT 계층, company_id FK, `reflected` boolean, 30일 TTL)
- reflections = `agent_memories` 테이블의 `memoryType='reflection'` 행 (**별도 reflections 테이블 없음**)
- 근거: PRD Option B 확정. observations만 신규 1테이블, 나머지는 agent_memories 확장. 스키마 최소 변경으로 Zero Regression 보장.

**v3 Non-Functional Requirements (18개 신규, v2 58개 활성 → 총 76개 활성, 2개 삭제: NFR-S7/NFR-D7):**

| Category | 신규 | P0 | 아키텍처 영향 |
|---------|------|-----|-------------|
| Performance (P13~P17) | 5 | P13 `/office` FCP ≤3초 + 번들 ≤200KB | PixiJS tree-shaking 6클래스, React.lazy 코드 스플릿, Reflection 크론 ≤30초/에이전트, MKT E2E 이미지≤2분/영상≤10분 |
| Security (S8~S9+S10) | 3 | S8+S9+S10 전부 P0 | personality PER-1 4-layer, **n8n N8N-SEC 8-layer** (확정 결정 #3: +AES-256-GCM 크레덴셜 암호화 +NODE_OPTIONS V8 heap cap), observation MEM-6 4-layer |
| Scalability (SC7~SC9) | 3 | SC9 P0 | SC7 pgvector HNSW 포함 총 메모리 ≤3GB (PG 4GB 기준), /ws/office 회사별 50연결/서버 500연결 (확정 결정 #10), n8n Docker **≤2G**/2CPU (확정 결정 #2) + VPS 전체 ≤80% |
| Accessibility (A5~A7) | 3 | — | Big Five aria-valuenow+키보드, /office aria-live 대안패널, /office 모바일 리스트뷰 |
| Data (D8) | 1 | — | observations **30일** TTL (확정 결정 #5), agent_memories(reflection) 무기한 |
| Cost (COST3) | 1 | — | Reflection Haiku ≤$0.10/일 |
| External (EXT3) | 1 | — | 외부 AI API 타임아웃 정책 |
| Operations (O9~O10) | 1 | — | n8n Docker 모니터링 |

### v3 Scale & Complexity Assessment

**Complexity: HIGH (33/40점, v2 29/40에서 상승)**

| 축 | v2 | v3 | v3 근거 |
|---|------|------|--------|
| 아키텍처 변경 범위 | 5/5 | 3/5 | v3: 순수 추가(신규 테이블+서비스). 기존 engine/ 구조 불변 |
| 외부 의존성 리스크 | 4/5 | 5/5 | PixiJS 8 + @pixi/react + n8n Docker + Tiled + AI 스프라이트 = 5개 신규 |
| DB 스키마 변경 | 3/5 | 3/5 | observations + reflections 신규, personality_traits JSONB, memoryTypeEnum 확장 없음 |
| 실시간 시스템 영향 | 4/5 | 4/5 | /ws/office 17번째 채널, PixiJS 60fps, 적응형 heartbeat |
| 인증/보안 변경 | 3/5 | 4/5 | **n8n 8-layer** (확정 결정 #3) + personality PER-1 4-layer + observation MEM-6 4-layer + /ws/office JWT+token bucket + FR-TOOLSANITIZE |
| 회귀 테스트 범위 | 5/5 | 5/5 | 485 API + 10,154 테스트 전체 통과 필수 (Zero Regression) |
| UX 변경 범위 | 3/5 | 5/5 | UXUI 완전 리셋 + /office 신규 + n8n 관리 + Big Five 슬라이더 + 14→6 페이지 통합 |
| 팀 역량 요구 | 2/5 | 4/5 | PixiJS 게임 시각화 + Tiled + 스프라이트 애니메이션 = 완전 신규 도메인 |

**Primary domain:** AI Agent Orchestration (1차) + Workflow Automation (2차, n8n) + Agent Intelligence (3차, Big Five + Memory)

**Type composition:** web_app 40% / saas_b2b 35% / developer_tool 25%

**Estimated v3 architectural components:** ~25개 (v2 15개 + 신규 10: observations table, agent_memories[reflection] 확장 (Option B), memory-reflection.ts, `services/soul-enricher.ts` 확장, ws/channels.ts 'office' case, packages/office/, n8n Docker + compose, Hono n8n proxy, tool-sanitizer, personality DB migration)

### v3 Infrastructure Impact

**VPS 리소스 예산 (Oracle ARM64 4코어, 24GB RAM):**

| 서비스 | RAM (idle) | RAM (peak) | CPU | v2/v3 |
|--------|-----------|-----------|-----|-------|
| Bun 서버 | ~500MB | ~2GB | 1코어 | v2 |
| PostgreSQL + pgvector | ~1GB | ~3GB | 0.5코어 | v2 |
| GitHub Actions runner | ~200MB | ~4GB (빌드 시) | 1코어 (빌드 시) | v2 |
| **n8n Docker** | **~860MB** | **≤2GB (hard cap)** | **2코어 상한** | **v3 신규 (확정 결정 #2: --memory=2g)** |
| OS + Docker overhead | ~500MB | ~1GB | 0.5코어 | v2 |
| **총계** | **~3GB** | **~12GB** | **4코어** | — |
| **여유** | **~21GB** | **~12GB** | **포화 가능** | — |

**병목 분석 (v3 업데이트):**
- **메모리: 여유** — 24GB에서 peak ~12GB = ~12GB 여유. n8n **2G hard cap** (확정 결정 #2: `--memory=2g`) — n8n docs 4GB 권장이나 Brief mandate로 2G 강제, OOM kill 리스크 상시 모니터링
- **CPU: v3 악화** — n8n Docker 2코어 상한이 추가됨. Bun+PG+CI+n8n 동시 peak 시 4코어 포화. Reflection 크론이 LLM API I/O 대기 위주이므로 CPU 부하는 미미
- **디스크: 주의** — observations **30일** 보관 (확정 결정 #5), agent_memories(reflection) 무기한. 에이전트 50개 × 일 20 observations × 30일 = 30,000행. pgvector **1024차원** (확정 결정 #1: Voyage AI) × 30,000 ≈ 120MB. 관리 가능

### v3 Sprint Dependencies & Go/No-Go Matrix

```
Pre-Sprint (Phase 0):
  - Stitch 2 디자인 토큰 확정 (Sprint 1 착수 선행 조건)
  - Neon Pro 업그레이드 (전 Sprint 블로커)
  - **Voyage AI 임베딩 마이그레이션** (Gemini 768d→Voyage 1024d, re-embed + HNSW 재구축, Go/No-Go #10)
  - 사이드바 IA 선행 결정
  ↓ [선행 조건: 전부 완료 필수]
Sprint 1 (Layer 3: Big Five 성격, 독립·낮음)
  ↓ [soul-enricher.ts 주입 경로 확보]
Sprint 2 (Layer 2: n8n + 마케팅 + FR-TOOLSANITIZE, 독립·중간)
  ↓ [Layer 0 ≥60% 미달 시 레드라인]
Sprint 3 (Layer 4: 에이전트 메모리 3단계, 복잡·높음)
  ↓ [Go/No-Go #7: Reflection 비용 한도]
Sprint 4 (Layer 1: OpenClaw PixiJS, 에셋 선행 필요)
  ↓ [Go/No-Go #8: 에셋 PM 승인]

Layer 0 (UXUI 리셋): 전 Sprint 병행 (인터리브)
```

**Go/No-Go 매트릭스 (14개 — PRD §Success Criteria + 확정 결정 #11):**

| # | Gate | Sprint | 기준 | 실패 시 |
|---|------|--------|------|--------|
| 1 | Zero Regression | 전체 | 485 API smoke-test + 10,154 테스트 전통과 | Sprint 차단 |
| 2 | Big Five 주입 | 1 | extraVars 5개 키 존재 + 빈 문자열 미허용 + PER-1 4-layer 100% | Sprint 1 롤백 |
| 3 | n8n 보안 | 2 | 포트 5678 외부 차단 + Hono proxy Admin JWT + **N8N-SEC 8-layer** 전부 통과 (확정 결정 #3) | n8n 비활성화 + ARGOS 유지 |
| 4 | Memory Zero Regression | 3 | 기존 agent_memories 데이터 단절 0건 (Option B 확장 안전성) | Sprint 3 롤백 |
| 5 | PixiJS 번들 | 4 | `/office` 번들 ≤ 200KB gzipped (tree-shaking 6클래스) | Canvas 2D 최소 구현 (0KB) |
| 6 | UXUI Layer 0 | 전체 | ESLint 하드코딩 색상 0건 + Playwright dead button 0건 | Layer 0 가속 |
| 7 | Reflection 비용 | 3 | Haiku ≤ $0.10/day per company (확정 결정 #6). 초과 시 크론 일시 중지 | Reflection 주기 확대 |
| 8 | 에셋 품질 | 4 시작 전 | AI 생성 스프라이트 PM 최종 승인 | Sprint 4 미착수 |
| 9 | Observation Poisoning | 3 | MEM-6 4-layer 100% + 10종 adversarial payload 차단 (확정 결정 #8) | 메모리 파이프라인 재검토 |
| 10 | Voyage AI Migration | Pre-Sprint | 768d→1024d 완료 + HNSW 재구축 + 검색 품질 유지 (확정 결정 #1) | Sprint 1 착수 차단 |
| 11 | Tool Sanitization | 2, 3 | FR-TOOLSANITIZE1~3 100% + 10종 adversarial payload 차단 (PRD L604) | 도구 응답 보안 재검토 |
| 12 | v1 Feature Parity | 전체 | v1-feature-spec.md 기능 전부 동작 | 해당 기능 복원 후 진행 |
| 13 | Usability Validation | 전체 | CEO 일상 태스크 ≤ 5분 (NFR-O11) | UX 재설계 |
| **14** | **Capability Evaluation** | **3** | **동일 태스크 N ≥ 3회 반복, 3회차 재수정 ≤ 1회차 50%** | **메모리 파이프라인 재검토** |

### v3 Risk Registry (R1~R9, Stage 1 Research 검증 완료)

| # | Risk | 심각도 | Sprint | 완화 | 상태 |
|---|------|--------|--------|------|------|
| R1 | PixiJS 8 번들 200KB 초과 | HIGH | 4 | tree-shaking 6클래스 extend(), 실패 시 Canvas 2D | READY (200KB 미만 검증) |
| R2 | n8n iframe vs API 복잡성 | MEDIUM | 2 | API-only 확정 (iframe 불사용) | RESOLVED |
| R3 | pgvector Neon 호환 | LOW | 3 | Epic 10에서 이미 검증 완료 | RESOLVED |
| R4 | UXUI 428 color-mix | HIGH | 병행 | 완전 리셋 (Stitch 2 디자인 기준) | READY |
| R5 | PRD 7개 known issues | MEDIUM | 전체 | v3-corthex-v2-audit.md 교차 검증 | RESOLVED |
| R6 | n8n Docker ARM64 리소스 경합 | CRITICAL | 2 | **2G**/2CPU 제한 (확정 결정 #2) + OOM restart:unless-stopped + healthcheck | READY |
| R7 | personality_traits prompt injection | HIGH | 1 | 4-layer sanitization (Key→Zod→strip→regex) | READY |
| R8 | AI 스프라이트 재현 불가능성 | MEDIUM | 4 | seed/deterministic 도구 또는 오픈소스 LPC Sprite Sheet | READY |
| R9 | soul-renderer `\|\| ''` silent failure | LOW | 1 | Go/No-Go #2 빈 문자열 검증 기준 | READY |

### v3 Cross-Cutting Concerns — 상세 설명

> 정규 목록은 상단 "Cross-Cutting Concerns Identified" 섹션 (1~12) 참조. 아래는 v3 신규 항목(7~12)의 구현 상세.

**7. `services/soul-enricher.ts` 단일 진입점** — 상단 참조.

**8. 3개 독립 Sanitization 체인** — 상단 참조. 각 체인의 Hook 파이프라인 실행 위치:
- PER-1: `services/soul-enricher.ts` (agent-loop.ts 호출 전, Soul 전처리 시점)
- MEM-6: observation 저장 시점 (agent-loop.ts Stop 이후, memory-reflection.ts 크론 전)
- TOOLSANITIZE: agent-loop.ts PostToolUse 레이어 (credential-scrubber 이후, delegation-tracker 이전)

**9. Voyage AI 임베딩 전파** — 상단 참조. 차원 일관성 검증: Pre-Sprint 마이그레이션 시 `SELECT count(*) FROM knowledge_docs WHERE array_length(embedding, 1) != 1024` = 0 확인.

**10. n8n 보안 격리** — 상단 참조. N8N-SEC 8-layer (확정 결정 #3): SEC-1 VPS 방화벽 → SEC-2 N8N_DISABLE_UI=false Admin 전용 → SEC-3 Hono proxy tag 격리 → SEC-4 webhook HMAC → SEC-5 Docker --memory=2g → SEC-6 DB 직접 접근 차단 → SEC-7 N8N_ENCRYPTION_KEY AES-256-GCM → SEC-8 API rate limit 60/min.

**11. 실시간 상태 파이프라인** — 상단 참조.

**12. Cost-aware 모델 라우팅 (ECC-2)** — 상단 참조. 추가 상세:
- Reflection 크론: 무조건 Haiku (비용 제한 $0.10/day, 확정 결정 #6)
- 대화 모델: 회사별 Admin 설정 (tier_configs 테이블 확장)
- call_agent 응답 표준화 (ECC-1): Step 4에서 구조 결정

**ECC 아키텍처 아이디어 (Step 4에서 상세 결정):**

| # | ECC Idea | 아키텍처 반영 위치 | Sprint | 우선순위 |
|---|----------|------------------|--------|---------|
| ECC-1 | call_agent 응답 표준화 | `tool-handlers/builtins/call-agent.ts` 응답 파싱 | Sprint 1 (call_agent 구조 선행) | HIGH |
| ECC-2 | Cost-aware 모델 라우팅 | `engine/model-selector.ts` Admin 설정 확장 | Sprint 1 | MEDIUM |
| ECC-3 | Memory confidence scoring | `memory-reflection.ts` confidence 필드 + decay/reinforcement | Sprint 3 | HIGH |
| ECC-4 | FR-TOOLSANITIZE | `engine/hooks/tool-sanitizer.ts` 신규 PostToolUse Hook | Sprint 2 | CRITICAL |
| ECC-5 | Capability evaluation (#14) | 테스트 프레임워크 + 표준 태스크 corpus | Sprint 3 | HIGH |

### PRD Carry-Forward (아키텍처에서 해소할 항목)

| 항목 | 출처 | 아키텍처 결정 필요 |
|------|------|-----------------|
| FIX-3 reflections 테이블 모순 | prd-validation-fixes.md | ✅ 해소: **Option B** — observations 신규 1테이블 + agent_memories 확장 (memoryType='reflection'). 별도 reflections 테이블 없음 |
| FIX-6 FR-OC7 구현 상세 | prd-validation-fixes.md | Step 4에서 LISTEN/NOTIFY vs 폴링 결정 |
| FIX-9 8 FR 구현 누설 | prd-validation-fixes.md | Step 4~6에서 흡수 |
| N8N-SEC API key + rate limiting | Stage 2 carry-forward | Step 4에서 n8n 보안 아키텍처 결정 |
| n8n 백업 전략 | Stage 2 carry-forward | Step 6 Infrastructure에서 다룸 |
| Sprint 2 과부하 (15건+) | PRD §구현 고려사항 | Step 4에서 Sprint 2/2.5 분할 결정 |
| Reflection 크론 스케줄링 | PRD §구현 고려사항 | Step 4에서 크론 오프셋 vs pg-boss 큐잉 결정 |
| packages/office 독립 패키지 | FR-OC1, FR-OC8 | Step 6 Structure에서 다룸 |
| JSONB race condition | PRD §토큰 보안 | Step 4에서 atomic update vs 별도 테이블 결정 |

---

## v3 Implementation Patterns & Consistency Rules

_v3 신규 패턴 E11~E22 — v2 E1~E10 위에 확장. v2 패턴 전부 유지, v3 4 Layer + UXUI 리셋 전용 추가._

### 핵심 3줄 요약 (v3 AI 에이전트용)

1. **Soul 전처리는 soul-enricher.ts 단일 진입점** — personality + memory 모두 여기서. renderSoul callers(9곳)에서 호출.
2. **3개 sanitization 체인은 각각 독립** — PER-1(성격), MEM-6(관찰), TOOLSANITIZE(도구응답). 서로 의존 없음, 서로 호출 금지.
3. **v3 신규 코드는 기존 경계 준수** — engine/ 공개 API 2개(E8), getDB(companyId)(E3), Hook 순서(E2) 전부 그대로.

### v3 Pattern Categories

**충돌 지점 28개 (v2 22개 + v3 6개 신규), v3 패턴 12개(E11~E22), Anti-Pattern 10개**

| 카테고리 | v3 충돌 수 | 위험도 |
|---------|-----------|--------|
| Soul Enricher 통합 | 3 | **높음** — 9개 caller(10 call sites) 전부 일관 수정 필수 |
| Sanitization 체인 격리 | 3 | **높음** — 체인 간 혼합 = 보안 구멍 |
| 메모리 파이프라인 | 4 | **높음** — observations→reflections 데이터 흐름 |
| n8n 프록시 보안 | 2 | **높음** — 8-layer 중 1개라도 누락 = 보안 사고 |
| OpenClaw 격리 | 3 | 중간 — 번들/WS/패키지 경계 |
| Voyage AI 임베딩 | 2 | 중간 — 차원 불일치 = 검색 불가 |
| UXUI 리셋 패턴 | 5 | 중간 — 디자인 토큰 일관성 |
| 기타 (FR-UX 라우트 등) | 6 | 낮음 |

### v3 Engine Patterns (E11~E22)

#### E11: Soul Enricher 통합 규칙 (D23)

```typescript
// services/soul-enricher.ts — engine/ 밖, services/ 배치
// E8 위반 아님: engine/은 이미 ../db/, ../lib/ import 패턴 사용 중

export interface EnrichResult {
  personalityVars: Record<string, string>;  // Sprint 1: {personality_openness: "75", ...} — renderSoul extraVars와 타입 일치 (string)
  memoryVars: Record<string, string>;       // Sprint 3: {relevant_memories: "..."}
}

export async function enrich(
  agentId: string,
  companyId: string
): Promise<EnrichResult> {
  // Sprint 1: personality_traits → String(v) 변환 → 5개 extraVars
  // Sprint 3: + pgvector cosine ≥0.75 상위 3개 → relevant_memories
}
```

**인터페이스 계약 (Cross-Sprint 안정성):**
- `EnrichResult`는 Sprint 1 완료 시 **동결** — Sprint 3 확장은 **additive-only** (기존 필드 타입/이름 변경 금지)
- Sprint 3에서 `memoryVars` 키 추가만 허용 (예: `relevant_memories`, `memory_confidence`)
- 필드 삭제/리네임 시 아키텍처 결정 필요

**규칙:**
- soul-enricher.ts는 `services/` 배치 (engine/ 내부 아님)
- **9개 renderSoul caller / 10 call sites** 전부 동일 패턴으로 수정 (hub.ts, commands.ts, presets.ts, public-api/v1.ts, agora-engine.ts 등):
  ```typescript
  // BEFORE (v2):
  const soul = renderSoul(agent.soul, agentId, companyId);
  // AFTER (v3):
  const enriched = await soulEnricher.enrich(agentId, companyId);
  // knowledgeVars: 기존 callers의 knowledge_context 변수 (있는 caller만)
  const knowledgeVars = existingKnowledgeContext ? { knowledge_context: existingKnowledgeContext } : {};
  const extraVars = { ...knowledgeVars, ...enriched.personalityVars, ...enriched.memoryVars };
  const soul = renderSoul(agent.soul, agentId, companyId, extraVars);
  ```
- hub.ts, call-agent.ts는 이미 extraVars 사용 중 — 기존 knowledge_context **보존** 필수 (spread 앞에 배치)
- agent-loop.ts에 soul-enricher 직접 import **금지** — callers가 pre-rendered soul 전달 (E8)
- personality_traits가 NULL인 에이전트 → enrich()가 빈 객체 `{ personalityVars: {}, memoryVars: {} }` 반환 (Zero Regression)
- enrich()에서 DB 에러 시 → 빈 결과 반환 + log.warn (세션 중단 없음)

#### E12: Personality Traits 검증 체인 (D33, PER-1)

```typescript
// 4-layer sanitization — 반드시 이 순서로 실행

// Layer 1: Key Boundary (soul-enricher.ts)
const ALLOWED_KEYS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
const filtered = Object.fromEntries(
  ALLOWED_KEYS.map(k => [k, traits[k]]).filter(([_, v]) => v !== undefined)
);

// Layer 2: API Zod (routes/admin/agents.ts)
const personalitySchema = z.object({
  openness: z.number().int().min(0).max(100),
  conscientiousness: z.number().int().min(0).max(100),
  extraversion: z.number().int().min(0).max(100),
  agreeableness: z.number().int().min(0).max(100),
  neuroticism: z.number().int().min(0).max(100),
});

// Layer 3: extraVars strip (soul-enricher.ts)
const sanitized = Object.fromEntries(
  Object.entries(filtered).map(([k, v]) => [`personality_${k}`, String(v).replace(/[\n\r\t\x00-\x1f]/g, '')])
);

// Layer 4: Template regex (soul-renderer.ts)
// {{personality_*}} 변수만 치환 허용 — 다른 패턴 무시
```

**규칙:**
- 4 layer 순서 변경 금지 — Layer 1→2→3→4 순서 보장
- personality_traits에 5개 키 외 다른 키가 있으면 **무시** (에러 아님)
- DB CHECK 제약 + API Zod 이중 검증 — 둘 다 통과해야 저장
- 프리셋 (`balanced`, `creative`, `analytical`)는 하드코딩 값 — DB seed migration으로 제공

#### E13: Observation 저장 규칙 (D22, MEM-6)

```typescript
// routes/observations.ts 또는 agent-loop.ts Stop 후처리

// MEM-6 4-layer sanitization
function sanitizeObservation(content: string): { sanitized: string; flagged: boolean } {
  // Layer 1: 크기 제한
  if (content.length > 10240) content = content.slice(0, 10240);

  // Layer 2: 제어문자 strip (\x00-\x1F, newline/tab 보존)
  content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Layer 3: 프롬프트 하드닝 — <observation> 태그 래핑
  // (reflection 크론에서 LLM에 전달 시 적용)

  // Layer 4: 콘텐츠 분류 — 악의적 패턴 탐지
  const flagged = MALICIOUS_PATTERNS.some(p => p.test(content));

  return { sanitized: content, flagged };
}
```

**규칙:**
- observation 저장 시 **반드시** sanitizeObservation() 통과
- `flagged=true`인 observation은 reflection 크론에서 **스킵** (반성 대상 제외)
- `flagged` 설정 시 activity_logs에 감사 기록 남김
- content TEXT ≤ 10KB (DB CHECK 이중 보장)
- observations.confidence: **REAL 0-1** (agent_memories.confidence: INTEGER 0-100과 다름 — 비교 시 ×100 변환)
- company_id FK + agent_id FK 필수 — NULL 허용 안 함

#### E14: Reflection 크론 실행 규칙 (D28)

```typescript
// services/memory-reflection.ts — 7번째 백그라운드 워커

// 크론 실행 순서 (변경 금지)
// 1. pg_try_advisory_xact_lock(hashtext(companyId)) — 동시 실행 방지 (non-blocking: 실패 시 스킵, 무한 대기 아님)
// 2. Tier 한도 체크 (Tier 3-4: 주 1회 cap)
// 3. SELECT unreflected observations WHERE reflected=false AND confidence >= 0.7 AND flagged = false ORDER BY importance DESC LIMIT 20
// 4. 20건 미달 시 스킵 (PRD FR-MEM3: "≥ 20 AND confidence ≥ 0.7")
// 5. Haiku API 호출 → 1개 reflection 요약 생성
// 6. INSERT agent_memories (memoryType='reflection', embedding=Voyage)
// 7. UPDATE observations SET reflected=true, reflected_at=now() WHERE id IN (...)
// 8. 일일 비용 누적 > $0.10 → 크론 일시 중지 + Admin 알림
```

**규칙:**
- `pg_try_advisory_xact_lock` (non-blocking) 사용 — 획득 실패 시 해당 company 스킵 (다음 크론에서 재시도). 무한 대기 방지. Neon serverless에서 advisory lock 세션 유지 이슈 대응
- Haiku 모델 **하드코딩** (cost-aware routing과 별개 — reflection은 무조건 Haiku)
- reflection 결과 embedding: Voyage AI `voyage-3` 1024d — `getEmbedding(companyId, reflectionText)` 사용
- observations 30일 TTL: `reflected=true AND reflected_at < now() - interval '30 days'` → DELETE 크론 (별도 스케줄)
- agent_memories(reflection)는 **무기한 보관** — TTL 없음
- 크론 스케줄: `0 3 * * *` + company hash % 60 분산 — croner 사용 (pg-boss 아님)

#### E15: Tool Sanitizer 삽입 규칙 (D27, ECC-4)

```typescript
// engine/agent-loop.ts — PreToolResult 지점 (toolResults.push 직전)

// ⚠️ 삽입 위치가 핵심: PostToolUse 아님!
// PostToolUse hooks는 side-effect COPY 처리 → LLM에 도달하는 원본 수정 불가

// agent-loop.ts toolResults.push 전체 경로 매핑 (5곳):
//   L219: tool_not_found 에러 → sanitize 불필요 (CORTHEX 생성 메시지)
//   L238: tool_error 에러 → sanitize 불필요 (CORTHEX 생성 메시지)
//   L265: call_agent 성공 → ⚠️ sanitize 필수 (외부 에이전트 응답 — 오염 가능)
//   L277: 일반 MCP tool → ⚠️ sanitize 필수 (외부 도구 응답 — injection 가능)
//   L291: tool_timeout → sanitize 불필요 (CORTHEX 생성 메시지)

// BEFORE (v2, L265):
toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: childAgentResponse });
// AFTER (v3, L265):
const sanitizedChild = toolSanitizer.check(ctx, 'call_agent', childAgentResponse);
toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: sanitizedChild.content });

// BEFORE (v2, L277):
toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: mcpOutput });
// AFTER (v3, L277):
const sanitized = toolSanitizer.check(ctx, block.name, mcpOutput);
toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: sanitized.content });

// 공통: blocked 감사 로그
if (sanitized.blocked || sanitizedChild?.blocked) {
  await logToolSanitizeEvent(ctx, block.name, sanitized.pattern);
}
```

**규칙:**
- **L265 + L277 두 경로 모두 sanitize 필수** — Go/No-Go #11 통과 조건
- L219/L238/L291은 CORTHEX 내부 생성 메시지 → sanitize 불필요 (외부 입력 아님)
- `toolSanitizer.check()`는 **engine/ 내부** 함수 (Hook이 아님 — E2 Hook 시그니처와 별개)
- 10종 regex 패턴: `ignore previous`, `system:`, `<|im_start|>`, `<|im_end|>`, `[INST]`, `<<SYS>>`, `Human:`, `Assistant:`, base64 encoded variants, unicode escape variants
- 매칭 시 `[BLOCKED: suspected prompt injection in tool response]` 으로 교체
- 감사 로그: activity_logs에 `{ event: 'tool_sanitize_blocked', agentId, toolName, pattern }` 기록
- PostToolUse hooks (credential-scrubber, delegation-tracker 등)는 **별도로** 정상 실행 — toolSanitizer와 독립

#### E16: /ws/office WebSocket 규칙 (D24, D26)

```typescript
// ws/channels.ts — 'office' case 추가

// 메시지 구조 (shared/types.ts에 타입 정의)
interface OfficeStateMessage {
  type: 'agent_state';
  agentId: string;
  state: 'idle' | 'working' | 'speaking' | 'tool_calling' | 'error' | 'degraded';
  // PRD FR-OC2: idle/working/speaking/tool_calling/error + degraded (WS 장애 시)
  // speaking: LLM 응답 스트리밍 중 (FR-OC4 말풍선)
  // tool_calling: MCP 도구 실행 중 (FR-OC5 도구 이펙트)
  task?: string;
  progress?: number;  // 0-100
}

// 데이터 소스: activity_logs 폴링 (D26 — LISTEN/NOTIFY 불가)
// 적응형 폴링: 연결된 클라이언트 있을 때만 폴링 (클라이언트 0이면 폴링 중지)
// 500ms setInterval → 마지막 activity_logs 조회 → 상태 변환 → broadcast
// 백프레셔: 이전 폴링 결과와 diff — 변경 없으면 broadcast 생략
```

**규칙:**
- WsChannel union에 `'office'` 추가 (`shared/types.ts`)
- JWT 인증: 기존 ws-auth 미들웨어 재활용 (신규 미들웨어 금지)
- 연결 제한: 50conn/company, 500/server — 초과 시 `{ error: 'CONNECTION_LIMIT_EXCEEDED' }` + close
- Rate limit: 10msg/s per userId (token bucket)
- Heartbeat: idle 시 30초, active 시 5초 (적응형)
- activity_logs 읽기 전용 — **INSERT/UPDATE 금지** (agent-loop.ts가 기록 담당)
- 폴링 쿼리: `SELECT * FROM activity_logs WHERE company_id = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 50`

#### E17: packages/office/ 격리 규칙 (D30)

```typescript
// packages/office/package.json — 독립 workspace
{
  "name": "@corthex/office",
  "dependencies": {
    "pixi.js": "8.17.1",      // exact pin
    "@pixi/react": "8.0.5"     // exact pin
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}

// app에서 import (React.lazy 필수)
const OfficeCanvas = React.lazy(() => import('@corthex/office'));
```

**규칙:**
- `pixi.js`, `@pixi/react`는 **이 패키지에만** 의존 — app/admin/ui에 설치 금지
- React.lazy 필수 — 동적 import로 메인 번들 미포함
- tree-shaking: `Application`, `Container`, `Sprite`, `AnimatedSprite`, `Text`, `Graphics` 6클래스만 extend()
- Go/No-Go #5: 빌드 출력 ≤ 200KB gzipped — CI에서 `du -sh` 검증
- WebGL 미지원 환경 (ARM64 headless CI): Playwright `--headless` chromium 소프트웨어 에뮬레이션 또는 번들 크기 테스트만
- OfficeCanvas 로드 실패 시 → fallback UI (에이전트 리스트 테이블) 표시 — 다른 페이지에 영향 0

#### E18: Voyage AI 임베딩 일관성 규칙 (D31)

```typescript
// services/voyage-embedding.ts — 단일 래퍼

// 모든 벡터 연산은 이 파일을 경유
// 직접 voyageai SDK import 금지 (embedding-service.ts 대체)
```

**규칙:**
- 모든 임베딩 생성: `getEmbedding(companyId, text)` 또는 `getEmbeddingBatch(companyId, texts[])` 경유
- `voyageai` SDK 직접 import는 **이 파일만** 허용
- 모델: `voyage-3` 하드코딩 (환경변수 아님) — 차원 1024d 보장
- 벡터 차원 불일치 방지: Pre-Sprint 마이그레이션 후 `SELECT count(*) FROM knowledge_docs WHERE array_length(embedding, 1) != 1024` = 0 검증
- batch 간 100ms 대기 (rate limit 준수)
- credential: `getCredentials(companyId, 'voyage_ai')` — per-company credential vault 패턴

#### E19: Sanitization 체인 격리 규칙

```
3개 독립 체인 — 서로 import/호출 절대 금지

PER-1 (Sprint 1):
  위치: services/soul-enricher.ts
  진입점: renderSoul caller (hub.ts 등)
  시점: agent-loop.ts 호출 전 (Soul 전처리)
  대상: personality_traits JSONB

MEM-6 (Sprint 3):
  위치: services/observation-sanitizer.ts (또는 routes 내 인라인)
  진입점: observation 저장 API
  시점: agent-loop.ts Stop 이후 (observation 기록 시)
  대상: observation content TEXT

TOOLSANITIZE (Sprint 2):
  위치: engine/tool-sanitizer.ts
  진입점: agent-loop.ts (PreToolResult)
  시점: toolResults.push 직전
  대상: MCP tool response
```

**규칙:**
- 3개 체인은 **서로 다른 공격 표면** 방어 — 혼합 금지
- PER-1과 MEM-6는 engine/ 밖 (services/) → E8 경계 준수
- TOOLSANITIZE만 engine/ 내부 (agent-loop.ts 삽입 필수)
- 새 sanitization 요구사항 발생 시 → 기존 체인에 layer 추가 (새 체인 생성은 아키텍처 결정 필요)
- 각 체인의 감사 로그 형식 통일: `{ event: '{chain}_blocked', agentId, companyId, detail }` → activity_logs

#### E20: n8n Proxy 보안 규칙 (D25, N8N-SEC)

```typescript
// routes/admin/n8n-proxy.ts

// 8-layer 전부 구현 필수 — 부분 구현 배포 금지
// Go/No-Go #3: 8-layer 전부 통과해야 Sprint 2 완료

// Hono proxy 패턴
app.all('/admin/n8n/*', adminJwtMiddleware, async (c) => {
  const path = c.req.path.replace('/admin/n8n', '');

  // SEC-3: tag 격리 — companyId 자동 주입
  const url = new URL(`http://127.0.0.1:5678${path}`);
  url.searchParams.set('tags', `company:${c.get('companyId')}`);

  // Path normalization: double-dot + URL encoded variants 차단 (case-insensitive + double encoding)
  const decodedPath = decodeURIComponent(decodeURIComponent(path));  // double decode
  if (decodedPath.includes('..') || /(%2e|%2E)/i.test(path)) {
    return c.json({ success: false, error: { code: 'N8N_PATH_TRAVERSAL', message: 'Invalid path' } }, 400);
  }

  return proxy(url.toString())(c);
});
```

**규칙:**
- Admin JWT 미들웨어 **필수** — 일반 사용자 접근 차단 (SEC-2)
- `?tags=company:{companyId}` 자동 주입 — 수동 tag 설정 금지 (SEC-3)
- path normalization: `..`, `%2e`, `%2E` 전부 차단 (path traversal 방지)
- n8n API 응답을 **그대로** 프록시 — 응답 변환/필터링 하지 않음 (n8n UI 호환)
- rate limit: 60req/min per company (SEC-8) — Hono rate limiter 미들웨어
- n8n Docker는 127.0.0.1:5678에만 바인딩 — 외부 직접 접근 불가 (SEC-1)
- n8n→CORTHEX API 콜백: `host.docker.internal:host-gateway` (확정 결정 #12)
- **OOM kill 복구**: Docker `restart: unless-stopped` → OOM kill 시 자동 재시작. healthcheck 30초 간격 → 실패 3회 시 `N8N_HEALTH_CHECK_FAILED` 에러 + Admin 알림 (activity_logs). Hono proxy가 5678 unreachable 시 502 반환 (에러 격리)

#### E21: UXUI 리셋 패턴 (Layer 0)

```
디자인 소스: _corthex_full_redesign/phase-6-generated/ (Stitch 2 생성물)
테마: Natural Organic — cream #faf8f5, olive #283618/#5a7247, sand #e5e1d3
아이콘: Lucide React (Material Symbols 아님)
폰트: Inter + JetBrains Mono
```

**규칙:**
- 색상 하드코딩 금지 — CSS 변수 또는 Tailwind config 토큰만 사용
- ESLint 규칙: `no-hardcoded-colors` (Go/No-Go #6 검증)
- 기존 페이지 수정 시 Stitch HTML의 **content area만** 참고 (sidebar/topbar 무시 — App Shell은 별도 완료)
- Dark mode 전용: Stitch HTML의 `dark:` 클래스가 기준. light mode 차이 무시
- Material Symbols → Lucide React 교체 (16개 버그 수정 완료, 재발 금지)
- 신규 페이지는 기존 layout.tsx + sidebar.tsx 패턴 따름 (App Shell 리빌드 완료)
- Sprint별 점진적 전환: 해당 Sprint FR 관련 페이지만 리셋 (전체 일괄 아님)

#### E20b: 마케팅 자동화 패턴 (FR-MKT, Sprint 2)

```typescript
// n8n 프리셋 워크플로우 설치 패턴
// routes/admin/marketing.ts

// Marketing settings: company.settings JSONB 내 marketing 키
// 저장: jsonb_set() atomic update (D29 패턴 준수)
// API: /api/company/:id/marketing-settings (Admin JWT 필수)

interface MarketingSettings {
  imageEngine: 'midjourney' | 'dalle' | 'stable_diffusion';  // 이미지 생성 엔진
  videoEngine: 'runway' | 'pika' | 'sora';                   // 영상 생성 엔진
  narrationEngine: 'elevenlabs' | 'openai_tts';              // 나레이션 엔진
  subtitleEngine: 'whisper' | 'assembly_ai';                  // 자막 엔진
  watermarkEnabled: boolean;                                   // 워터마크 ON/OFF
  fallbackEnabled: boolean;                                    // fallback 자동 전환
}

// n8n 프리셋 워크플로우 설치
async function installPresetWorkflow(companyId: string, preset: string) {
  // 1. preset JSON 로드 (서버 내 static 파일)
  // 2. n8n API /workflows POST (proxy 경유)
  // 3. tag 자동 부착: company:{companyId}
  // 4. credential 매핑: company marketing settings → n8n credential
}
```

**규칙:**
- Marketing settings는 `company.settings` JSONB의 `marketing` 키 — 별도 테이블 아님 (D29)
- API 키 저장: `company.settings` 내 AES-256 암호화 (기존 credential vault 패턴)
- n8n 프리셋 워크플로우: 서버 내 JSON 파일로 관리 (DB 아님)
- 워크플로우 설치 시 `?tags=company:{companyId}` 자동 부착 (E20 SEC-3 준수)
- fallback 엔진: 1차 엔진 API 타임아웃 → 2차 엔진 자동 전환 (Switch 노드)
- 외부 AI API 타임아웃: 이미지 ≤ 2분, 영상 ≤ 10분 (NFR-EXT3)
- Marketing 관련 에러 코드: `MKT_ENGINE_TIMEOUT`, `MKT_PRESET_INSTALL_FAILED`, `MKT_FALLBACK_EXHAUSTED`

#### E22: FR-UX 페이지 통합 규칙 (D34)

```
14 페이지 → 6 그룹 통합 (FR-UX1, PRD 명시):
  1. 허브(Hub) — 채팅 + 트래커 통합
  2. 대시보드(Dashboard) — 비용 + 모니터링 + 활동 통합
  3. 에이전트(Agents) — 에이전트 목록 + 상세 + 성격 통합
  4. 라이브러리(Library) — 지식 + 브리핑 + 노트북 통합
  5. 잡스(Jobs) — ARGOS + 트레이딩 + 워크플로우 통합
  6. 설정(Settings) — 조직 + 보안 + 테마 + 기타 통합

기존 라우트 → 새 라우트 redirect (FR-UX2)
기존 기능 100% 유지 (FR-UX3)
```

**규칙:**
- 기존 라우트에 `<Navigate to="/new-route" replace />` redirect 추가
- 이전 URL 북마크/링크가 깨지지 않도록 redirect 영구 유지
- 통합된 페이지 내에서 탭/필터로 하위 기능 분리
- 기능 삭제 금지 — 이동/통합만 허용
- 통합 상세 라우팅은 구현 시점에 결정 (D34 Deferred)

### v3 Error Code Extensions

```typescript
// lib/error-codes.ts — v3 추가

export const V3_ERROR_CODES = {
  // Personality (Sprint 1)
  PERSONALITY_INVALID_TRAIT: 'PERSONALITY_INVALID_TRAIT',
  PERSONALITY_SANITIZE_FAILED: 'PERSONALITY_SANITIZE_FAILED',

  // n8n (Sprint 2)
  N8N_PROXY_ERROR: 'N8N_PROXY_ERROR',
  N8N_PATH_TRAVERSAL: 'N8N_PATH_TRAVERSAL',
  N8N_RATE_LIMIT: 'N8N_RATE_LIMIT',
  N8N_HEALTH_CHECK_FAILED: 'N8N_HEALTH_CHECK_FAILED',

  // Tool Sanitize (Sprint 2)
  TOOL_RESPONSE_BLOCKED: 'TOOL_RESPONSE_BLOCKED',

  // Memory (Sprint 3)
  OBSERVATION_SANITIZE_BLOCKED: 'OBSERVATION_SANITIZE_BLOCKED',
  OBSERVATION_SIZE_EXCEEDED: 'OBSERVATION_SIZE_EXCEEDED',
  REFLECTION_COST_LIMIT: 'REFLECTION_COST_LIMIT',
  REFLECTION_LOCK_TIMEOUT: 'REFLECTION_LOCK_TIMEOUT',

  // Office (Sprint 4)
  OFFICE_CONNECTION_LIMIT: 'OFFICE_CONNECTION_LIMIT',
  OFFICE_RATE_LIMIT: 'OFFICE_RATE_LIMIT',

  // Marketing (Sprint 2)
  MKT_ENGINE_TIMEOUT: 'MKT_ENGINE_TIMEOUT',
  MKT_PRESET_INSTALL_FAILED: 'MKT_PRESET_INSTALL_FAILED',
  MKT_FALLBACK_EXHAUSTED: 'MKT_FALLBACK_EXHAUSTED',

  // Voyage AI (Pre-Sprint)
  EMBEDDING_DIMENSION_MISMATCH: 'EMBEDDING_DIMENSION_MISMATCH',
  EMBEDDING_API_ERROR: 'EMBEDDING_API_ERROR',
} as const;
```

### v3 Pattern Verification Strategy

| 패턴 | 검증 방법 | Sprint | Go/No-Go |
|------|----------|--------|----------|
| E11 soul-enricher 9개 caller | grep renderSoul 호출 일관성 | 1 | — |
| E12 PER-1 4-layer | adversarial payload 10종 | 1 | #2 |
| E13 MEM-6 4-layer | adversarial payload 10종 | 3 | #9 |
| E14 Reflection 크론 비용 | $0.10/day 한도 | 3 | #7 |
| E15 TOOLSANITIZE 위치 | agent-loop.ts diff 검증 | 2 | #11 |
| E16 /ws/office 연결 제한 | 51번째 연결 거부 테스트 | 4 | — |
| E17 PixiJS 번들 크기 | `du -sh` ≤ 200KB gzip | 4 | #5 |
| E18 Voyage 차원 일관성 | SQL count(embedding != 1024d) = 0 | Pre | #10 |
| E19 체인 격리 | grep cross-import = 0 | 전체 | — |
| E20 N8N-SEC 8-layer | 8개 layer 개별 테스트 | 2 | #3 |
| E21 하드코딩 색상 0건 | ESLint 규칙 | 전체 | #6 |
| E22 기존 라우트 redirect | Playwright URL 테스트 | 병행 | — |
| E20b MKT fallback 전환 | n8n 프리셋 + 타임아웃 테스트 | 2 | — |
| **Go/No-Go #1 Zero Regression** | 485 API smoke-test + 10,154 테스트 전통과 | 전체 | #1 |
| **Go/No-Go #4 Memory Zero Regression** | 기존 agent_memories 데이터 단절 0건 | 3 | #4 |
| **Go/No-Go #8 에셋 품질** | AI 스프라이트 PM 승인 | 4 시작 전 | #8 |
| **Go/No-Go #12 v1 Feature Parity** | v1-feature-spec.md 기능 전부 동작 | 전체 | #12 |
| **Go/No-Go #13 Usability** | CEO 일상 태스크 ≤ 5분 (NFR-O11) | 전체 | #13 |
| **Go/No-Go #14 Capability Eval** | 동일 태스크 N≥3회, 3회차 재수정 ≤ 1회차 50% | 3 | #14 |

### v3 Anti-Patterns (하지 말 것)

| Anti-Pattern | 왜 위험한가 | 올바른 패턴 |
|-------------|-----------|-----------|
| `import VoyageAI from 'voyageai'` 직접 사용 | 차원 불일치, credential 누락 | `getEmbedding(companyId, text)` 경유 (E18) |
| soul-enricher 없이 personality extraVars 수동 구성 | 4-layer sanitization 우회 | `soulEnricher.enrich(agentId, companyId)` (E11) |
| PER-1 Layer 순서 변경 | Key Boundary 우회 시 임의 키 주입 가능 | Layer 1→2→3→4 순서 고정 (E12) |
| observation 저장 시 sanitize 생략 | 10KB 초과 + 악의적 콘텐츠 → LLM 오염 | `sanitizeObservation()` 필수 (E13) |
| reflection 크론에서 `flagged=true` observation 포함 | 악의적 콘텐츠가 반성으로 고착화 | `WHERE flagged = false` 필터 (E14) |
| PostToolUse에서 tool sanitize 시도 | toolResults.push 이후 = LLM에 unsanitized 원본 이미 전달됨 | PreToolResult 지점에서 처리 (E15) |
| n8n proxy에서 path normalization 생략 | path traversal 공격으로 서버 파일 접근 | `..`, `%2e` 차단 필수 (E20) |
| PixiJS를 app/ package.json에 직접 설치 | 메인 번들에 PixiJS 포함 → FCP 악화 | packages/office/ 독립 패키지 + React.lazy (E17) |
| `/ws/office`에서 activity_logs INSERT | agent-loop.ts 책임 영역 침범 → 중복 기록 | 읽기 전용 폴링만 (E16) |
| 색상 #hex 하드코딩 (`bg-[#283618]`) | 테마 변경 시 수백 곳 수정 필요 | CSS 변수 + Tailwind 토큰 (E21) |

### v3 CLAUDE.md Update Items (구현 시 추가)

구현 단계에서 CLAUDE.md에 아래 내용 추가:

```markdown
## v3 Engine Patterns (Sprint 1~4)
- Soul 전처리: soulEnricher.enrich() → renderSoul extraVars (E11)
- 3 Sanitization 체인 독립: PER-1, MEM-6, TOOLSANITIZE (E19)
- Voyage AI: getEmbedding(companyId, text) 단일 래퍼 (E18)
- /ws/office: activity_logs 읽기 전용 폴링 (E16)
- packages/office/: React.lazy 필수, 메인 번들 미포함 (E17)
- 상세: _bmad-output/planning-artifacts/architecture.md → E11~E22
```

---

## v3 Project Structure & Boundaries

_v3 디렉토리 구조 — v2 기존 구조(Step 6 v2) 위에 v3 신규 파일/디렉토리만 추가. v2 삭제 없음._

### v3 New Files Directory Structure

```
corthex-v2/
├── docker-compose.n8n.yml                     # NEW Sprint 2: n8n Docker Compose (D25)
│
├── packages/
│   ├── server/
│   │   └── src/
│   │       ├── engine/
│   │       │   └── tool-sanitizer.ts          # NEW Sprint 2: PreToolResult sanitize (E15, D27)
│   │       │                                  #   L265(call_agent)+L277(일반 MCP) 2경로
│   │       │
│   │       ├── services/
│   │       │   ├── soul-enricher.ts           # NEW Sprint 1: personality+memory extraVars (E11, D23)
│   │       │   │                              #   Sprint 1: personalityVars only
│   │       │   │                              #   Sprint 3: + memoryVars (additive-only, E11 interface contract)
│   │       │   ├── observation-sanitizer.ts   # NEW Sprint 3: MEM-6 4-layer sanitize (E13)
│   │       │   ├── memory-reflection.ts       # NEW Sprint 3: 7번째 크론 워커 (E14, D28)
│   │       │   │                              #   croner "0 3 * * *" + company hash % 60
│   │       │   └── voyage-embedding.ts        # NEW Pre-Sprint: Voyage AI 단일 래퍼 (E18, D31)
│   │       │                                  #   기존 embedding-service.ts 교체
│   │       │
│   │       ├── routes/
│   │       │   ├── admin/
│   │       │   │   ├── n8n-proxy.ts           # NEW Sprint 2: Hono proxy() + 8-layer (E20, D25)
│   │       │   │   └── marketing.ts           # NEW Sprint 2: marketing settings API (E20b)
│   │       │   │                              #   프리셋 설치: n8n-proxy 내부 HTTP fetch 경유 (Docker 직접 금지)
│   │       │   └── workspace/
│   │       │       └── observations.ts        # NEW Sprint 3: observation CRUD (E13, FR-MEM1~2)
│   │       │                                  #   sanitizeObservation() 호출 후 INSERT
│   │       │
│   │       ├── ws/
│   │       │   └── channels.ts               # MODIFY Sprint 4: + 'office' case (E16, D24)
│   │       │                                  #   500ms adaptive polling, 6-state broadcast
│   │       │
│   │       ├── db/
│   │       │   └── migrations/
│   │       │       ├── 0061_voyage_vector_1024.sql         # NEW Pre-Sprint: vector(768)→vector(1024) + HNSW
│   │       │       │                                       #   ⚠️ 비가역: 롤백 시 전체 re-embed 필요
│   │       │       ├── 0062_add_personality_traits.sql     # NEW Sprint 1: agents.personality_traits JSONB
│   │       │       ├── 0063_add_observations.sql           # NEW Sprint 3: observations 테이블 (D22)
│   │       │       └── 0064_extend_agent_memories.sql      # NEW Sprint 3: memoryType='reflection' + embedding
│   │       │
│   │       └── __tests__/
│   │           ├── unit/
│   │           │   ├── soul-enricher.test.ts              # NEW Sprint 1
│   │           │   ├── observation-sanitizer.test.ts      # NEW Sprint 3
│   │           │   └── tool-sanitizer.test.ts             # NEW Sprint 2
│   │           ├── integration/
│   │           │   ├── memory-reflection.test.ts          # NEW Sprint 3
│   │           │   ├── n8n-proxy.test.ts                  # NEW Sprint 2
│   │           │   └── personality-pipeline.test.ts       # NEW Sprint 1: PER-1 4-layer E2E
│   │           ├── security/
│   │           │   ├── per-1-adversarial.test.ts          # NEW Sprint 1: Go/No-Go #2
│   │           │   ├── mem-6-adversarial.test.ts          # NEW Sprint 3: Go/No-Go #9
│   │           │   ├── toolsanitize-adversarial.test.ts   # NEW Sprint 2: Go/No-Go #11
│   │           │   └── n8n-sec-8layer.test.ts             # NEW Sprint 2: Go/No-Go #3
│   │           └── sprint4/
│   │               ├── office-bundle-size.test.ts         # NEW Sprint 4: 번들 200KB 미만 검증
│   │               └── office-ws.test.ts                  # NEW Sprint 4: /ws/office 6-state broadcast
│   │
│   ├── office/                                # NEW Sprint 4: 독립 workspace (D30, E17)
│   │   ├── package.json                       #   pixi.js 8.17.1, @pixi/react 8.0.5 (exact pin)
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts                     #   library mode 빌드
│   │   └── src/
│   │       ├── index.ts                       #   React.lazy 진입점 export
│   │       ├── OfficeCanvas.tsx               #   메인 PixiJS Stage (Application, Container)
│   │       ├── sprites/
│   │       │   ├── AgentSprite.tsx             #   에이전트 아바타 (Sprite, AnimatedSprite)
│   │       │   ├── DeskSprite.tsx              #   책상/작업 공간 (Sprite)
│   │       │   └── StatusBubble.tsx            #   상태 말풍선 (Text, Graphics)
│   │       ├── hooks/
│   │       │   └── useOfficeWs.ts             #   /ws/office WebSocket 훅 (E16)
│   │       └── store.ts                        #   Zustand: 에이전트 상태 맵
│   │
│   ├── app/                                   # CEO SPA
│   │   └── src/
│   │       └── pages/
│   │           ├── office.tsx                  # NEW Sprint 4: React.lazy(() => import('@corthex/office'))
│   │           └── ...                        # MODIFY 병행: FR-UX 페이지 통합 (E22) — 6그룹 라우팅
│   │
│   └── shared/
│       └── types.ts                           # MODIFY Sprint 4: WsChannel union + 'office'
│                                              # MODIFY Sprint 1: personality_traits 관련 타입
│
├── turbo.json                                 # MODIFY Sprint 4: + "office#build" pipeline
│
└── _n8n/                                      # NEW Sprint 2: n8n 프리셋 워크플로우 저장소
    ├── presets/
    │   ├── marketing-image.json               #   이미지 생성 프리셋
    │   ├── marketing-video.json               #   영상 생성 프리셋
    │   ├── marketing-narration.json           #   나레이션 프리셋
    │   └── marketing-subtitle.json            #   자막 프리셋
    └── README.md
```

### v3 File Change Summary (Sprint별)

| Sprint | NEW 파일 | MODIFY 파일 | 삭제 | 테스트 |
|--------|---------|------------|------|--------|
| Pre-Sprint | 2 (voyage-embedding.ts, migration) | 3 (package.json pin교정, embedding-service.ts→교체, schema.ts) | 1 (@google/genai) | 0 |
| Sprint 1 | 3 (soul-enricher, migration, presets seed) | 9 (renderSoul callers × 9) | 0 | 3 (unit + integration + PER-1 adversarial) |
| Sprint 2 | 8 (tool-sanitizer, n8n-proxy, marketing, compose, presets ×4) | 1 (agent-loop.ts L265+L277) | 0 | 4 (unit + integration + TOOLSANITIZE + N8N-SEC) |
| Sprint 3 | 5 (observations.ts, observation-sanitizer, memory-reflection, migrations ×2) | 2 (soul-enricher +memoryVars, schema.ts) | 0 | 3 (unit + integration + MEM-6 adversarial) |
| Sprint 4 | 11 (packages/office/ 10파일, office.tsx) | 3 (turbo.json, shared/types.ts, channels.ts) | 0 | 2 (번들 크기 + ws) |
| 병행 Layer 0 | 0 | ~67 (UXUI 리셋 페이지 점진적 전환) | 0 | Playwright dead button |
| **총계** | **~29** | **~85** | **1** | **~12** |

> **Layer 0 순서 규칙**: agents.tsx는 Sprint 1(성격 UI), Sprint 3(메모리 탭), Layer 0(UXUI 리셋)에서 3회 수정됨. Layer 0 UXUI 리셋은 각 Sprint 해당 페이지 구현 완료 후 순차 적용. 병렬 작업 시 merge conflict 방지.

### v3 Architectural Boundaries (v2 기존 + v3 확장)

```
외부 클라이언트 (브라우저)
    │
    ├─ HTTP ──→ Hono Routes ──→ Middleware (auth → tenant → rbac)
    │              │
    │              ├─ /api/admin/*          → getDB() → Response
    │              ├─ /api/workspace/*      → getDB() → Response
    │              ├─ /api/workspace/hub    → engine/agent-loop → SSE Stream
    │              │                           ↓
    │              │                     tool-sanitizer.check() → toolResults (E15)
    │              │                     soul-enricher.enrich() ← callers (E11)
    │              │
    │              ├─ /admin/n8n/*          → n8n-proxy.ts → Docker 127.0.0.1:5678 (E20)
    │              ├─ /admin/n8n-editor/*   → n8n-proxy.ts → Docker 127.0.0.1:5678
    │              └─ /api/company/:id/marketing-settings → marketing.ts (E20b)
    │
    ├─ WebSocket ──→ 17채널 멀티플렉싱 (16 v2 + 1 v3 'office')
    │                  └─ 'office' → 500ms polling → activity_logs → broadcast (E16)
    │
    └─ n8n Docker (사이드카)
         ├─ 127.0.0.1:5678 (내부망 전용)
         ├─ SQLite 내부 DB (CORTHEX PG 접근 금지)
         └─ host.docker.internal:host-gateway → CORTHEX API 콜백
```

### v3 의존성 규칙 확장

| 레이어 | 의존 가능 | 의존 금지 |
|--------|----------|----------|
| routes/admin/n8n-proxy.ts | middleware/, Docker proxy | engine/, services/ |
| routes/admin/marketing.ts | middleware/, db/ (jsonb_set), n8n-proxy 내부 fetch | engine/, n8n Docker 직접 |
| routes/workspace/observations.ts | middleware/, db/, services/observation-sanitizer.ts | engine/ |
| services/soul-enricher.ts | db/, services/voyage-embedding.ts | engine/ (E8), routes/ |
| services/observation-sanitizer.ts | (순수 함수, 의존 없음) | engine/, routes/, db/ |
| services/memory-reflection.ts | db/, services/voyage-embedding.ts, croner | engine/, routes/ |
| services/voyage-embedding.ts | voyageai SDK, services/credential-vault.ts | engine/, routes/ |
| engine/tool-sanitizer.ts | engine/types.ts, lib/activity-logger.ts | routes/, services/ |
| packages/office/* | pixi.js, @pixi/react, zustand, shared/types.ts | server/*, admin/* |

### v3 Requirements → Structure Mapping

**Sprint 1 — Big Five 성격 (FR-PERS 9 FRs):**

| FR | 파일 위치 |
|----|----------|
| FR-PERS1~2 슬라이더 UI + DB 저장 (Zod+CHECK) | routes/admin/agents.ts (기존 확장) + 0062 migration + app/src/pages/agents.tsx |
| FR-PERS3 Soul extraVars 주입 | services/soul-enricher.ts (E11, PER-1 E12 4-layer) |
| FR-PERS4~5 즉시반영 + 코드분기없음 | (아키텍처 내재 — 프롬프트 주입 방식, 추가 파일 불필요) |
| FR-PERS6~7 역할 프리셋 + 기본 3종 | routes/admin/agents.ts + DB seed |
| FR-PERS8~9 툴팁 + 접근성 (aria) | app/src/pages/agents.tsx (기존 확장) |

**Sprint 2 — n8n + 마케팅 + TOOLSANITIZE (FR-N8N 6 + FR-MKT 7 + FR-TOOLSANITIZE 3 = 16 FRs):**

| FR | 파일 위치 |
|----|----------|
| FR-N8N1~2 Admin API 목록 + CEO 읽기전용 | routes/admin/n8n-proxy.ts (E20) + app/src/pages/ |
| FR-N8N3 기존 워크플로우 코드 삭제 | routes/ + pages/ (기존 파일 제거) |
| FR-N8N4 Docker + N8N-SEC 8-layer | docker-compose.n8n.yml + iptables (D25) |
| FR-N8N5~6 장애 메시지 + 에디터 접근 | app/src/ + routes/admin/n8n-proxy.ts |
| FR-MKT1~4 설정 API | routes/admin/marketing.ts (E20b) |
| FR-MKT5~7 프리셋 설치 | _n8n/presets/*.json + marketing.ts |
| FR-TOOLSANITIZE1~3 | engine/tool-sanitizer.ts (E15) |

**Sprint 3 — 에이전트 메모리 (FR-MEM 14 FRs):**

| FR | 파일 위치 |
|----|----------|
| FR-MEM1~2 Observation 저장 | routes/workspace/observations.ts (신규) + observation-sanitizer.ts (E13) |
| FR-MEM3~5 Reflection 크론 | services/memory-reflection.ts (E14) |
| FR-MEM6~8 메모리 검색 | services/soul-enricher.ts + voyage-embedding.ts (E18) |
| FR-MEM9~11 모니터링 UI | app/src/pages/agents.tsx (memory 탭) |
| FR-MEM12~14 보안+평가 | observation-sanitizer.ts (MEM-6) + security tests |

**Sprint 4 — OpenClaw (FR-OC 11 FRs):**

| FR | 파일 위치 |
|----|----------|
| FR-OC1~3 PixiJS 캔버스 | packages/office/src/OfficeCanvas.tsx |
| FR-OC4~5 상태 시각화 | packages/office/src/sprites/*.tsx |
| FR-OC6~7 실시간 상태 | ws/channels.ts 'office' case (E16) |
| FR-OC8~9 번들 격리 | packages/office/package.json (E17) |
| FR-OC10~11 접근성 | packages/office/ aria-live + 모바일 리스트뷰 |

**병행 — FR-UX 페이지 통합 (3 FRs):**

| FR | 파일 위치 |
|----|----------|
| FR-UX1 6그룹 통합 | app/src/pages/ (6그룹: Hub/Dashboard/Agents/Library/Jobs/Settings) |
| FR-UX2 라우트 redirect | app/src/router.tsx (`<Navigate replace />`) |
| FR-UX3 기능 100% | 기존 페이지 → 통합 페이지 탭/필터 이동 |

### v3 Cross-Cutting Concerns → Structure Mapping

| 관심사 | v3 관련 파일 |
|--------|-------------|
| Soul 전처리 (E11) | services/soul-enricher.ts → 9 renderSoul callers |
| PER-1 Sanitization (E12) | services/soul-enricher.ts (Layer 1,3) + routes/admin/agents.ts (Layer 2) + engine/soul-renderer.ts (Layer 4) |
| MEM-6 Sanitization (E13) | services/observation-sanitizer.ts → routes/workspace/observations.ts |
| TOOLSANITIZE (E15) | engine/tool-sanitizer.ts → engine/agent-loop.ts (L265, L277) |
| Voyage AI 전파 (E18) | services/voyage-embedding.ts → soul-enricher.ts + memory-reflection.ts + routes/knowledge.ts |
| n8n 보안 격리 (E20) | routes/admin/n8n-proxy.ts + docker-compose.n8n.yml + iptables |
| Reflection 크론 (E14) | services/memory-reflection.ts → voyage-embedding.ts + observations + agent_memories + Claude Haiku API |
| /ws/office 파이프라인 (E16) | ws/channels.ts → packages/office/hooks/useOfficeWs.ts → store.ts → OfficeCanvas.tsx |

### v3 Integration Points

**내부 통신:**

| 소스 | 대상 | 방식 | Sprint |
|------|------|------|--------|
| renderSoul callers | soul-enricher.ts | 함수 호출 | 1 |
| agent-loop.ts | tool-sanitizer.ts | 함수 호출 (PreToolResult) | 2 |
| Hono proxy | n8n Docker | HTTP reverse proxy (127.0.0.1:5678) | 2 |
| marketing.ts | n8n-proxy.ts | 내부 HTTP fetch (localhost, Docker 직접 금지) | 2 |
| hub.ts (route) | observations.ts | agent-loop 응답 후처리 → observation 생성 (E8 경계 준수) | 3 |
| memory-reflection.ts | voyage-embedding.ts | 함수 호출 | 3 |
| ws/channels.ts | activity_logs | SQL polling (500ms) | 4 |
| packages/office | /ws/office | WebSocket | 4 |

**외부 통합:**

| 서비스 | 연동 파일 | 프로토콜 | 인증 |
|--------|----------|---------|------|
| Voyage AI API | services/voyage-embedding.ts | HTTPS REST | per-company API key |
| n8n 외부 AI (이미지/영상) | n8n Docker 내부 | HTTPS REST | n8n credential 암호화 |
| Claude API (Haiku) | services/memory-reflection.ts | HTTPS REST | CLI 토큰 |

### v3 데이터 흐름

```
[Sprint 1] Big Five 성격:
  Admin UI → POST /api/admin/agents/:id/personality → Zod 검증 → DB UPDATE
  → enrich() → personalityVars → renderSoul → agent-loop.ts

[Sprint 2] n8n 워크플로우:
  Admin UI → /admin/n8n-editor/* → Hono proxy → n8n Docker
  n8n webhook → host.docker.internal → CORTHEX API

[Sprint 2] TOOLSANITIZE:
  MCP tool response → tool-sanitizer.check() → sanitized content → toolResults.push → LLM

[Sprint 3] 메모리 파이프라인:
  agent-loop.ts Stop → hub.ts 후처리 → sanitizeObservation() → INSERT observations (E8 경계: engine/ 외부에서 처리)
  → 크론 03:00 → SELECT unreflected (confidence≥0.7, flagged=false, importance DESC)
  → Haiku API → reflection 요약 → Voyage embed → INSERT agent_memories(reflection)
  → enrich() → memoryVars → renderSoul → agent-loop.ts

[Sprint 4] OpenClaw 실시간:
  agent-loop.ts → INSERT activity_logs → 500ms polling → ws 'office' broadcast
  → useOfficeWs.ts → Zustand store → OfficeCanvas.tsx → PixiJS render
```

---

## v3 Architecture Validation Results

_v3 Steps 1-6 + v2 Steps 1-7 교차 검증. R1 14건 수정 반영 후 최종 검증._

### v3 Coherence Validation ✅

**Decision Compatibility (D22~D34 + D1~D21):**

| 검증 항목 | 결과 | 근거 |
|----------|------|------|
| D22(observations) + D1(Claude SDK) | ✅ 호환 | observations는 engine/ 외부에서 생성 (E8 경계 준수). agent-loop 수정 불필요 |
| D23(Big Five) + D4(Soul 변수) | ✅ 호환 | soul-enricher.ts가 기존 renderSoul extraVars 확장. 기존 변수 불변 |
| D24(PixiJS) + D2(Hono) | ✅ 호환 | packages/office/ 독립 워크스페이스. 서버 코드 무관 |
| D25(n8n Docker) + D5(PostgreSQL) | ✅ 호환 | n8n SQLite 내부 DB 사용. CORTHEX PG 접근 금지 (SEC-6) |
| D27(PreToolResult) + D1(SDK Hooks) | ✅ 호환 | PreToolResult는 SDK Hook이 아닌 인라인 함수. E8 경계 내부 |
| D28(Haiku reflection) + D17(Prompt Cache) | ✅ 호환 | reflection은 별도 API 호출. 기존 캐싱 경로와 분리 |
| D31(Voyage AI) + D19(Semantic Cache) | ✅ 호환 | Voyage 1024d로 통일. vector(768)→vector(1024) 마이그레이션 포함 |
| D30(PixiJS 독립) + D7(Turborepo) | ✅ 호환 | turbo.json pipeline에 "office#build" 추가. 기존 빌드 불변 |
| D34(페이지 통합) + D6(Vite SPA) | ✅ 호환 | 라우터 리디렉트로 구현. 빌드 변경 없음 |

**충돌: 0건.** v3 결정은 전부 v2 위에 순수 추가. v2 기존 결정 수정 없음.

**Pattern Consistency (E11~E22 + E1~E10):**

| 검증 항목 | 결과 |
|----------|------|
| E11(soul-enricher) ↔ E4(soul-renderer) | ✅ enricher가 extraVars 생성, renderer가 치환. 분리 명확 |
| E15(tool-sanitizer) ↔ E6(Hook 체계) | ✅ tool-sanitizer는 Hook이 아닌 인라인 함수. Hook 체계와 독립 |
| E16(ws/office) ↔ E5(SSE 이벤트) | ✅ office는 WebSocket 별도 채널. SSE 스트림과 무관 |
| E18(Voyage) ↔ E10(embedding) | ✅ Voyage가 기존 embedding-service.ts 완전 교체 (1:1 치환) |
| E21(CSS 변수) ↔ 기존 Tailwind | ✅ CSS 변수 + Tailwind 토큰 조합. 기존 유틸리티 클래스 호환 |
| Naming patterns (v2 확립) | ✅ v3 전부 기존 규칙 준수: snake_case DB, kebab-case 파일, PascalCase 컴포넌트 |

**Structure Alignment:**
- v3 디렉토리 트리가 v2 기존 구조 위에 추가만 함. 삭제/이동 없음 (embedding-service.ts→voyage-embedding.ts 교체 1건 제외)
- 9-row 의존성 매트릭스가 E8 engine 경계 완전 준수
- 53 FR → 파일 매핑 전부 트리 내 존재 확인 (R2에서 observations.ts 누락 해소)

### v3 Requirements Coverage ✅

**Functional Requirements (53개 v3 신규):**

| Area | FR 수 | 아키텍처 커버 | 누락 |
|------|-------|------------|------|
| FR-PERS (성격) | 9 | 9/9 ✅ | — |
| FR-N8N (n8n) | 6 | 6/6 ✅ | — |
| FR-MKT (마케팅) | 7 | 7/7 ✅ | — |
| FR-TOOLSANITIZE | 3 | 3/3 ✅ | — |
| FR-MEM (메모리) | 14 | 14/14 ✅ | — |
| FR-OC (OpenClaw) | 11 | 11/11 ✅ | — |
| FR-UX (페이지 통합) | 3 | 3/3 ✅ | — |
| **총계** | **53** | **53/53** | **0** |

**FR 검증 상세:**
- FR-PERS1~9: D23 + E11 + E12 + migration 0062 + UI 슬라이더 — PRD 매핑 R2 수정 완료
- FR-N8N1~6: D25 + E20 + N8N-SEC 8-layer + docker-compose — PRD 매핑 R2 수정 완료
- FR-MKT1~7: E20b + _n8n/presets/ + marketing.ts + n8n-proxy 내부 fetch (R1 gap 해소)
- FR-TOOLSANITIZE1~3: D27 + E15 + 5-path mapping (L265+L277 sanitize, L219/L238/L291 skip)
- FR-MEM1~14: D22 + D28 + E13 + E14 + observations.ts + memory-reflection.ts + Voyage 1024d
- FR-OC1~11: D24 + D30 + E16 + E17 + packages/office/ + /ws/office
- FR-UX1~3: D34 + E22 + router.tsx redirect

**Non-Functional Requirements (20개 v3 신규):**

| Category | NFR | 아키텍처 지원 |
|---------|-----|-------------|
| Performance | NFR-P13 /office FCP≤3초 + 번들≤200KB | E17 React.lazy + 독립 패키지 + tree-shaking 6클래스 |
| Performance | NFR-P14 /ws/office 상태 동기화 ≤2초 | E16 adaptive polling 500ms + WebSocket broadcast |
| Performance | NFR-P15 WS heartbeat 5초 | E16 adaptive polling 500ms + heartbeat |
| Performance | NFR-P16 Reflection ≤30초/에이전트 | E14 크론 03:00 + company hash stagger + Haiku API |
| Performance | NFR-P17 MKT E2E (이미지≤2분, 영상≤10분, 게시≤30초) | E20b 타임아웃 정책 + fallback |
| Security | NFR-S8 PER-1 4-layer | E12 Layer 1→2→3→4 순서 고정 |
| Security | NFR-S9 N8N-SEC 8-layer | E20 + confirmed-decisions #3 |
| Security | NFR-S10 MEM-6 4-layer | E13 sanitizeObservation() 필수 |
| Scalability | NFR-SC7 PG 메모리 ≤3GB | Voyage 1024d × 30K observations ≈ 120MB. 관리 가능 |
| Scalability | NFR-SC8 /ws/office 50/500 | E16 + confirmed-decisions #10 |
| Scalability | NFR-SC9 n8n Docker ≤2G | confirmed-decisions #2 + OOM recovery (E20) |
| Accessibility | NFR-A5 슬라이더 aria | FR-PERS9 + E12 Layer 4 |
| Accessibility | NFR-A6 /office aria-live | FR-OC10 + packages/office/ |
| Accessibility | NFR-A7 /office 모바일 | FR-OC11 + 리스트뷰 폴백 |
| Data | NFR-D8 observation 30일 TTL | confirmed-decisions #5 + E14 |
| Cost | NFR-COST3 Haiku ≤$0.10/일 | E14 반성 크론 일일 한도 + 자동 일시 중지 |
| External | NFR-EXT3 외부 AI 타임아웃 | E20b fallback + 타임아웃 정책 |
| Operations | NFR-O9~O10 n8n 모니터링 | E20 Docker healthcheck + restart + Admin 알림 |
| Operations | NFR-O11 CEO 일상 태스크 ≤5분 | E22 페이지 통합 + UX 최적화 |
| Operations | NFR-O12 Go/No-Go gates 자동 검증 | smoke-test.sh + 14 gate 테스트 |

**v2 기존 NFR (58개):** 변경 없음. v3 추가 사항이 기존 NFR에 영향 없음 확인.

**Go/No-Go Gates (14개):**

| # | Gate | 아키텍처 지원 | 검증 방법 |
|---|------|-------------|----------|
| 1 | Zero Regression | 485 API + 10,154 테스트 | smoke-test.sh |
| 2 | PER-1 adversarial + renderSoul() extraVars 주입 검증 | E12 4-layer | per-1-adversarial.test.ts + personality-pipeline.test.ts |
| 3 | N8N-SEC 8-layer | E20 | n8n-sec-8layer.test.ts |
| 4 | Memory Zero Regression | agent_memories 기존 데이터 | 마이그레이션 검증 |
| 5 | PixiJS 번들 ≤200KB | E17 React.lazy | office-bundle-size.test.ts |
| 6 | 하드코딩 색상 0건 + Playwright dead button 0건 | E21 ESLint + Playwright | ESLint 규칙 + Playwright dead button scan |
| 7 | Reflection 비용 한도 | E14 자동 일시 중지 | memory-reflection.test.ts |
| 8 | AI 스프라이트 PM 승인 | Sprint 4 선행 | PM 승인 게이트 |
| 9 | Observation poisoning | E13 MEM-6 4-layer | mem-6-adversarial.test.ts |
| 10 | Voyage 마이그레이션 | E18 + 0061 migration | 0061 SQL 검증 쿼리 + re-embed 완료 확인 |
| 11 | TOOLSANITIZE 100% 차단 | E15 5-path | toolsanitize-adversarial.test.ts |
| 12 | v1 Feature Parity | v1-feature-spec.md | E2E 테스트 |
| 13 | Usability CEO ≤5분 | NFR-O11 (CEO 일상 태스크 ≤5분) | 사용성 테스트 |
| 14 | Capability Eval | 3회차 재수정 ≤ 1회차의 50% | 반복 평가 (동일 태스크 N≥3회) |

**14/14 gates 전부 아키텍처 지원 확인.**

### v3 Implementation Readiness ✅

**Decision Completeness:**
- D22~D34: 13개 결정 전부 선택 + 근거 + 코드 예시 ✅
- confirmed-decisions-stage1.md: 12개 항목 전부 반영 ✅

**Pattern Completeness:**
- E11~E22 + E20b: 13개 패턴 전부 코드 예시 + Anti-Pattern 10개 ✅
- 3 독립 sanitization 체인 (PER-1, MEM-6, TOOLSANITIZE): 각각 layer 명세 + 검증 규칙 ✅
- Interface contract (E11 Sprint 1 freeze + additive-only): Cross-Sprint 안정성 보장 ✅
- 5-path tool sanitize mapping: L219/L238/L265/L277/L291 전부 근거 ✅

**Structure Completeness:**
- 디렉토리 트리: 29 NEW + ~85 MODIFY + ~12 테스트 파일 전부 명시 ✅
- 9-row 의존성 매트릭스: 모든 v3 모듈 커버 ✅
- 8 cross-cutting concerns → 파일 매핑 완료 ✅
- 8 internal + 3 external integration points ✅

### v3 Gap Analysis

**Critical Gaps: 0건** — 구현 차단 요소 없음.

**Important Gaps (3건, 비차단):**

| # | Gap | 영향 | 해소 시점 |
|---|-----|------|----------|
| G1 | E22 6그룹 구성 PRD 원문 차이 | D34 deferred 결정으로 구현 시 GATE에서 최종 확정 | Sprint 착수 시 |
| G2 | E15 L265/L277 라벨 치환 (Step 5 잔존) | 구현 코드에 영향 없음 (PreToolResult 결정 자체는 정확) | Story 작성 시 정정 |
| G3 | E20 rate limit PRD 내부 모순 (L1779=100 vs NFR-S9=60) | Architecture는 NFR-S9=60 채택 (보수적). PRD 수정 필요 | PRD 정정 시 |

**Nice-to-Have (3건):**

| # | 항목 | 비고 |
|---|------|------|
| N1 | n8n Docker healthcheck 주기 명시 | 기본 30초, 구현 시 조정 가능 |
| N2 | Sprint 2 E2E 통합 테스트 추가 | n8n-proxy → Docker → webhook → CORTHEX API 왕복 |
| N3 | Pre-Sprint Voyage 마이그레이션 롤백 절차 상세화 | 비가역 경고는 추가됨, 상세 절차는 story에서 |

### v3 Process Statistics

| 항목 | v2 | v3 | 총계 |
|------|-----|-----|------|
| Steps | 7/7 | 7/7 (Step 8 = 완료 마커) | — |
| Decisions | D1~D21 (21) | D22~D34 (13) | 34 |
| Patterns | E1~E10 (10) | E11~E22 + E20b (13) | 23 |
| Anti-Patterns | 8 | 10 | 18 |
| FRs covered | 72 (2삭제=70 active) | 53 | 123 (2삭제) |
| NFRs covered | 58 (2삭제=56 active) | 20 | 78 (2삭제) |
| Go/No-Go gates | — | 14 | 14 |
| Party Mode reviews | 2 rounds (R1→R2) | 2 rounds (R1→R2) | — |
| R1 issues fixed | — | Steps 5+6: 15+14 = 29 (Steps 2-4 별도) | 29+ |
| Critic avg (R2) | — | Step 5: 8.74, Step 6: 8.93 | 8.84 |

### v3 Architecture Completeness Checklist

**✅ v3 Step 2 — Context Analysis**
- [x] v2 baseline 감사 (485 API, 86 테이블, 10,154 테스트)
- [x] 53 v3 FR + 20 v3 NFR 분석
- [x] VPS 리소스 예산 (24GB RAM, n8n 2G cap)
- [x] Sprint 의존성 + Go/No-Go 14 gates

**✅ v3 Step 3 — Starter Template**
- [x] Brownfield + v2 기존 스택 유지
- [x] Sprint별 신규 의존성 (PixiJS, n8n, Voyage AI, croner)
- [x] 코드 처분: 삭제 1건 (@google/genai), 교체 1건 (embedding→voyage)

**✅ v3 Step 4 — Decisions**
- [x] D22~D34 (Critical 8 + Important 3 + Deferred 2)
- [x] confirmed-decisions-stage1.md 12항목 전부 반영

**✅ v3 Step 5 — Patterns**
- [x] E11~E22 + E20b (13개 패턴)
- [x] Anti-Pattern 10개
- [x] 3 독립 sanitization 체인 + 5-path tool mapping
- [x] 검증 테이블 (Go/No-Go 14/14)

**✅ v3 Step 6 — Structure**
- [x] 완전한 디렉토리 트리 (29 NEW, ~85 MODIFY)
- [x] 9-row 의존성 매트릭스
- [x] 53 FR → 파일 매핑
- [x] 8 cross-cutting concerns + 11 integration points (8 internal + 3 external)
- [x] Layer 0 merge conflict sequencing rule

**✅ v3 Step 7 — Validation**
- [x] D22~D34 + D1~D21 호환성 전수 검증 (0 충돌)
- [x] 53 FR + 20 NFR + 14 Go/No-Go 커버리지 100%
- [x] 0 critical gaps, 3 important (비차단), 3 nice-to-have

### v3 Readiness Assessment

**Overall: READY FOR IMPLEMENTATION**

**Confidence: HIGH** — v2 검증된 아키텍처 위에 순수 추가. 기존 engine/E8 경계 불변. 4 Critic R2 평균 8.84/10.

**Key Strengths:**
1. **Zero Regression 설계** — v2 기존 485 API, 86 테이블, 10,154 테스트 전부 불변
2. **3 독립 sanitization 체인** — PER-1, MEM-6, TOOLSANITIZE 각각 독립 검증 가능
3. **E8 engine 경계 최소 침범** — engine/ 내부 수정은 E15(tool-sanitizer.ts NEW + agent-loop.ts MODIFY) 1건만. 나머지 전부 engine/ 외부
4. **Sprint 격리** — 각 Sprint가 독립적으로 Go/No-Go gate 통과 가능
5. **14 Go/No-Go gates** — 구현 품질 관문 명시적

**Areas for Future Enhancement:**
- Redis 전환 (D21 deferred) — Phase 4+
- Cross-provider LLM (D15 deferred) — Phase 5+
- n8n HA 클러스터 — 현재 단일 Docker, 트래픽 증가 시 검토

### v3 Implementation Handoff

**AI Agent Guidelines:**
- v2 아키텍처 결정 (D1~D21, E1~E10) 전부 유지. 수정 금지
- v3 결정 (D22~D34, E11~E22) 순서대로 구현
- engine/ 내부 수정은 E15 1건만 (tool-sanitizer.ts NEW + agent-loop.ts L265/L277 MODIFY)
- E16 ws/channels.ts는 engine/ 외부 (ws/ 디렉토리)
- 나머지 전부 engine/ 외부 (services/, routes/, packages/, ws/)

**Sprint 구현 순서:**
1. **Pre-Sprint**: Voyage AI 마이그레이션 (0061) + 의존성 pin 교정
2. **Sprint 1**: Big Five 성격 (soul-enricher + PER-1 + migration 0062 + UI)
3. **Sprint 2**: n8n Docker + proxy + marketing + TOOLSANITIZE
4. **Sprint 3**: Agent Memory (observations + reflection cron + Voyage embed)
5. **Sprint 4**: OpenClaw PixiJS (packages/office/ + ws/office + office.tsx)
6. **Layer 0 병행**: UXUI 리셋 (각 Sprint 완료 후 순차 적용)

**첫 구현 시작점:** `Pre-Sprint → 0061_voyage_vector_1024.sql` + `services/voyage-embedding.ts`

---

## Step 8: Architecture Completion (2026-03-22)

**Status:** ✅ COMPLETE — v3 "OpenClaw" Architecture Workflow Finished

### Completion Summary

| Step | Title | Grade | Critic Rounds | Avg Score |
|------|-------|-------|---------------|-----------|
| 1 | v2 Baseline Audit | — | (v2 retained) | — |
| 2 | v3 Context Analysis | B | Stage 2 | 9.03/10 |
| 3 | Starter Template | B | Stage 2 | 9.03/10 |
| 4 | Decisions (D22-D34) | A | Stage 2 | 9.03/10 |
| 5 | Patterns (E11-E22) | A | R1→R2 | 8.80/10 |
| 6 | Structure | A | R1→R2 | 8.93/10 |
| 7 | Validation | A | R1→R2 | 8.84/10 |
| 8 | Complete | C (solo) | — | — |

### Architecture Deliverables

- **34 Decisions** — D1~D21 (v2) + D22~D34 (v3), 0 conflicts
- **22 Patterns** — E1~E10 (v2) + E11~E22 + E20b (v3)
- **10 Anti-Patterns** — 명시적 금지 사항
- **53 v3 FRs + 20 v3 NFRs** — 100% architectural coverage
- **14 Go/No-Go Gates** — Sprint progression quality gates
- **29 NEW files + ~85 MODIFY** — complete directory tree with FR mapping
- **3 Important Gaps** (non-blocking) + **3 Nice-to-Have** — documented for future

### Workflow Metadata

```yaml
workflow: create-architecture (v3-update)
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
completedAt: 2026-03-22
v2Base: 7 steps, 32 party rounds (2026-03-11)
v3Addition: Steps 2-8, 4 critics × 3 Grade-A steps
totalDecisions: 34 (D1-D34)
totalPatterns: 22 (E1-E22 + E20b)
```
