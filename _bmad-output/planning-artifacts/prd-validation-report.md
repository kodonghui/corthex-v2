---
validationTarget: '_bmad-output/planning-artifacts/prd.md'
validationDate: '2026-03-22'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md (PRD — v3 OpenClaw, 2648 lines, 12 steps complete)
  - _bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md (Product Brief — v3, 6 steps complete)
  - _bmad-output/planning-artifacts/technical-research-2026-03-20.md (Technical Research — 6 domains, 2100+ lines)
  - _bmad-output/planning-artifacts/architecture.md (v2 Architecture baseline)
  - _bmad-output/planning-artifacts/v1-feature-spec.md (v1 Feature Parity constraint)
  - _bmad-output/planning-artifacts/v3-corthex-v2-audit.md (Code-verified v2 audit)
  - project-context.yaml (Monorepo structure + stats)
  - context-snapshots/planning-v3/stage-0-step-05-scope-snapshot.md (Stage 0 decisions)
  - context-snapshots/planning-v3/stage-1-step-06-scope-snapshot.md (Stage 1 synthesis)
  - _bmad-output/party-logs/confirmed-decisions-stage1.md (12 confirmed decisions from v9.2 reverify)
validationStepsCompleted: [step-v-01-discovery, step-v-02-format-detection, step-v-03-density-validation, step-v-04-brief-coverage, step-v-05-measurability, step-v-06-traceability, step-v-07-implementation-leakage, step-v-08-domain-compliance, step-v-09-project-type, step-v-10-smart-validation, step-v-11-holistic-quality, step-v-12-completeness]
validationStatus: COMPLETE
holisticQualityRating: '4/5 - Good'
overallStatus: PASS
---

# PRD Validation Report

**PRD Being Validated:** `_bmad-output/planning-artifacts/prd.md`
**Validation Date:** 2026-03-22
**Validation Mode:** Mode A — FRESH WRITE (post-reverify PRD)
**Validator Team:** analyst (Writer), john, winston, quinn

## Input Documents

| # | Document | Role | Lines | Status |
|---|----------|------|-------|--------|
| 1 | prd.md | v3 OpenClaw PRD (12 steps, reverified) | 2648 | Loaded |
| 2 | product-brief-corthex-v3-2026-03-20.md | PRIMARY — v3 Brief, 4 layers + Go/No-Go | ~300 | Loaded |
| 3 | technical-research-2026-03-20.md | RESEARCH — 6 domains, avg 8.91/10 | 2100+ | Loaded |
| 4 | architecture.md | BASELINE — v2 architecture | — | Loaded |
| 5 | v1-feature-spec.md | CONSTRAINT — v1 feature parity | ~300 | Loaded |
| 6 | v3-corthex-v2-audit.md | AUTHORITY — code-verified v2 numbers | — | Loaded |
| 7 | project-context.yaml | STRUCTURE — monorepo layout, stats | — | Loaded |
| 8 | stage-0-step-05-scope-snapshot.md | CONTEXT — Stage 0 decisions, sprint order | — | Available |
| 9 | stage-1-step-06-scope-snapshot.md | CONTEXT — Stage 1 synthesis, Go/No-Go matrix | — | Available |
| 10 | confirmed-decisions-stage1.md | DECISIONS — 12 confirmed decisions (v9.2 reverify) | 59 | Loaded |

## Key Facts for Validation

- PRD: 116+ FR, 76 NFR, 14 Go/No-Go gates, 12 confirmed decisions
- Gemini BANNED → Voyage AI `voyage-3` 1024d
- n8n Docker `--memory=2g` (not 4g)
- N8N-SEC 8-layer (not 6-layer)
- Option B: observations separate table, reflections in agent_memories
- 30-day TTL processed observations (not 90-day)
- 3 sanitization chains: PER-1 (personality), MEM-6 (memory), TOOLSANITIZE
- Go/No-Go: 8 → 11 gates (#9 observation poisoning, #10 Voyage migration, #11 cost ceiling)

## Validation Findings

### Step V-01: Document Discovery & Confirmation

- PRD path: `_bmad-output/planning-artifacts/prd.md` (2648 lines)
- 10 input documents loaded (9 from frontmatter + 1 additional: confirmed-decisions-stage1.md)
- Validation report initialized: `_bmad-output/planning-artifacts/prd-validation-report.md`
- Status: COMPLETE

### Step V-02: Format Detection & Structure Analysis

**PRD Structure (11 Level 2 headers):**

| # | Section | Line |
|---|---------|------|
| 1 | Project Discovery | 110 |
| 2 | Executive Summary | 273 |
| 3 | Success Criteria | 471 |
| 4 | Product Scope | 668 |
| 5 | User Journeys | 1070 |
| 6 | Domain-Specific Requirements | 1352 |
| 7 | Innovation & Novel Patterns | 1538 |
| 8 | Technical Architecture Context | 1784 |
| 9 | Project Scoping & Phased Development | 2085 |
| 10 | Functional Requirements | 2285 |
| 11 | Non-Functional Requirements | 2499 |

**BMAD Core Sections Present:**
- Executive Summary: Present (line 273)
- Success Criteria: Present (line 471)
- Product Scope: Present (line 668)
- User Journeys: Present (line 1070)
- Functional Requirements: Present (line 2285)
- Non-Functional Requirements: Present (line 2499)

**Format Classification:** BMAD Standard
**Core Sections Present:** 6/6
**Additional Sections:** 5 (Project Discovery, Domain-Specific, Innovation, Technical Architecture, Project Scoping)

**Frontmatter Metadata:**
- projectType: saas_b2b
- domain: ai-agent-orchestration
- complexity: high (33/40)
- projectContext: brownfield (v3 feature addition)
- workflowStatus: complete
- completedDate: 2026-03-21

Status: COMPLETE — Proceeding to Density Validation

### Step V-03: Information Density Validation

**Anti-Pattern Violations:**

**Conversational Filler:** 0 occurrences
- Scanned for: "The system will allow users to", "It is important to note that", "In order to", "For the purpose of", "With regard to"
- No matches found

**Wordy Phrases:** 0 occurrences
- Scanned for: "Due to the fact that", "In the event of", "At this point in time", "In a manner that"
- No matches found

**Redundant Phrases:** 0 occurrences
- Scanned for: "Future plans", "Past history", "Absolutely essential", "Completely finish"
- No matches found

**Total Violations:** 0

**Severity Assessment:** PASS

**Recommendation:** PRD demonstrates excellent information density with zero violations. Dense, direct writing style throughout — consistent with BMAD standards. Korean + English bilingual sections are concise and fact-dense.

Status: COMPLETE — Proceeding to Brief Coverage Validation

### Step V-04: Product Brief Coverage Validation

**Product Brief:** `product-brief-corthex-v3-2026-03-20.md` (6 steps, COMPLETE, 2026-03-20)

#### Coverage Map

**Vision Statement:** Fully Covered
- Brief: "AI 에이전트들이 개성을 갖고, 성장하며, 실제로 일하는 모습을 볼 수 있는" 엔터프라이즈 AI 조직 운영 플랫폼
- PRD: Executive Summary (L273-306) — "AI 조직이 살아 숨 쉰다 — 보이고, 생각하고, 성장한다." + 4 layers + v2 foundation

**Problem Statement:** Fully Covered
- Brief: 3 problems (블랙박스/획일성/정체) + 2 additional (자체 워크플로우/UXUI 색상)
- PRD: Project Discovery (L117-161) + Executive Summary (L295-298) — all 5 problems with business impact table

**Target Users:** Fully Covered
- Brief: Admin 이수진 (Primary #1) + CEO 김도현 (Primary #2) + Secondary (직원/에이전트)
- PRD: (L330-357) personas table + Sprint-aligned journeys (A-D) + detailed onboarding flow with enforcement mechanisms

**Key Features (4 Layers + Layer 0):** Fully Covered
- Brief: Layer 0 (UXUI), Layer 1 (PixiJS), Layer 2 (n8n), Layer 3 (Big Five), Layer 4 (Memory)
- PRD: Features 5-1~5-4 (L740-867+) + Layer 0 in Product Scope (L668+) — significantly expanded with detailed architecture, security models, and error paths

**Success Metrics:** Fully Covered
- Brief: §Success Metrics — User Success 4 KPIs, Layer KPIs (5 layers), Business Objectives 4 goals
- PRD: §Success Criteria (L471-667) — 10 v2 baseline criteria + 8 v3 Sprint-aligned criteria + 14 P0 priorities + Business milestones + Failure triggers (16 scenarios)

**Goals/Objectives:** Fully Covered
- Brief: §비즈니스 목표 (4 goals with timeline)
- PRD: Business Success section (L503-527) — v2 baseline milestones + v3 Sprint milestones

**Differentiators:** Fully Covered
- Brief: 5 differentiators (엔터프라이즈 통합, 에이전트 살아있다, Zero Regression, 성장, UXUI)
- PRD: "What Makes This Special" (L308-328) — 6 differentiators (adds 오케스트레이션 = Soul)

**Technical Constraints:** Fully Covered
- Brief: §Technical Constraints (9 constraints including PixiJS 200KB, n8n 2g, Voyage AI, WS limits)
- PRD: Product Scope + Technical Architecture Context (L1784+) — all 9 constraints present + expanded

**Sprint Order & Dependencies:** Fully Covered
- Brief: §Sprint 구현 순서 (Pre-Sprint → S1 → S2 → S3 → S4, ~14주)
- PRD: Sprint 의존성 (L163-181) + Project Scoping (L2085+) — matching order with added gating details

**Go/No-Go Gates:** Fully Covered (PRD EXPANDS)
- Brief: 11 gates (#1-#11)
- PRD: 14 gates (#1-#14) — added #12 v1 Feature Parity, #13 Usability, #14 Capability Evaluation

**Out of Scope:** Fully Covered
- Brief: §Out of Scope (9 items including Option B, Zero Regression, Redis, OAuth)
- PRD: Product Scope scope boundaries + GATE decisions table

**Risks:** Fully Covered (PRD EXPANDS)
- Brief: R1-R10
- PRD: R1-R15 (adds R10 Obs Poisoning, R11 Voyage Migration, R12 Reflection Cron Concurrency, R13 CLI Max Pricing, R14 Solo Dev, R15 WS Flood)

**Onboarding Flow:** Fully Covered
- Brief: §온보딩 플로우 (Admin→회사설정→조직→에이전트→n8n→CEO초대)
- PRD: (L194-215) — same flow + enforcement mechanisms (Wizard + ProtectedRoute)

**Marketing Automation Preset:** Fully Covered
- Brief: §Layer 2 — 6-step pipeline (주제→리서치→콘텐츠→승인→게시→추적)
- PRD: Feature 5-2 (L777-852) — full pipeline with AI engine selection

**AI Tool Engine Admin Settings:** Fully Covered
- Brief: §Layer 2 — Admin 회사 설정 → AI 도구 엔진 섹션
- PRD: Feature 5-2 (L829-843) + FR + Success Criteria

**Observation TTL 30일:** Fully Covered
- Brief: §Technical Constraints — "30일 purge"
- PRD: (L156) — "Reflection 처리 후 30일 이상 raw observation 자동 purge"

**Voyage AI (Gemini 금지):** Fully Covered
- Brief: §Technical Constraints — "Voyage AI voyage-3 (1024d), Gemini 금지"
- PRD: (L157, L720) — Voyage AI 1024d throughout, Gemini systematically replaced

**비용 기록 Immutability:** Architecture-Deferred (John D2)
- Brief (L498): "cost-aggregation 데이터 append-only (수정/삭제 불가), frozen dataclass 패턴 Architecture에서 설계"
- PRD: Cost NFRs deleted per GATE, but this constraint is infrastructure-level (Architecture에서 설계 명시)
- Coverage: N/A for PRD — Architecture responsibility

#### Gaps Found

**Gap 1 — ECC 2.7: call_agent 핸드오프 응답 표준화** | Severity: Moderate
- Brief (L425): "위임 체인 응답 포맷 `{ status, summary, next_actions, artifacts }` — Tracker UI 일관성 + 메모리 관찰 품질 향상. E8 경계 준수 (engine 외부 레이어에서 구현)"
- PRD: NOT FOUND. No FR for standardized handoff response format.
- Impact: Tracker UI consistency and memory observation quality depend on structured handoff responses.
- **Cross-cutting risk** (Winston): Engine→UI(Tracker)→Memory(observations) 3개 계층에 걸치는 인터페이스 계약. Architecture 단계 우선 확인 대상으로 에스컬레이션 권고.
- **Late discovery risk** (John): Sprint 3에서 발견 시 수정 비용 급증. 현 단계 FR 추가가 최저 비용 해결책.

**Gap 2 — ECC 2.2: Tier별 Admin-editable 모델 배정** | Severity: Moderate
- Brief (L427): "Admin이 Tier별 모델 배정 설정 가능. 예산 초과 시 에이전트 실행 자동 차단"
- PRD: Has cost-limit auto-pause for Reflection cron (ECC 2.2 partial), but NO FR for Admin-configured Tier→Model mapping.
- Impact: Existing FR35 (모델 배정) extends naturally, but Tier-level cost-aware defaults missing.
- **Risk linkage** (John): Brief R3 (H/H) "Reflection LLM 비용 폭발" 완화 전략이 Tier별 모델 제어 없이 불완전. tier_configs 테이블 기반 실현 가능성 Architecture 검증 필요.
- **Recommended FR** (cross-talk consensus): "Admin이 Tier별 LLM 모델을 설정할 수 있다 (tier_configs). 비용 인지 기본값: Tier 3-4→Haiku, Tier 1-2→Sonnet." Sprint 3 scope.

**Gap 3 — MCP Server Health Check** | Severity: Informational
- Brief (L497): "Stitch 2, Playwright MCP 무응답 시 자동 알림 크론"
- PRD: NOT FOUND. No NFR for MCP server health monitoring.
- Impact: Dev tooling reliability — can be deferred to Architecture NFRs.

**Gap 4 — Brief CEO "Costs / Reports" vs PRD GATE Removal** | Severity: Informational (Brief Outdated)
- Brief §CEO (L279): "Costs / Reports: 에이전트 비용·성과 추적"
- PRD (L259-263): Costs REMOVED per GATE decision. PRD explicitly notes "Brief §2 CEO 기능 'Costs / Reports'는 본 GATE 결정에 의해 수정 필요."
- Impact: Brief needs update — PRD correctly reflects GATE decision. Not a PRD gap.

**Gap 5 — Big Five Scale 0.0~1.0 vs 0-100** | Severity: Informational (Brief Outdated)
- Brief (L136, L404): "0.0~1.0"
- PRD (L146, L206, L861): "0-100 정수 스케일 (Stage 1 Decision 4.3.1)"
- Impact: Intentional PRD refinement per Stage 1 confirmed decision. Brief needs update.

**Gap 6 — CLI 토큰 유출 감지 자동 비활성화 메커니즘** | Severity: Moderate (3-critic convergence: Quinn M1 + Winston + John)
- Brief R5 (L510): "CLI 토큰 유출 감지 시 자동 비활성화 메커니즘 (ECC 2.1 secret rotation)" — explicitly In Scope
- PRD Go/No-Go #11 (L466): References "CLI 토큰 유출 감지 시 자동 비활성화" as gate criteria, but **no FR defines the mechanism**.
- PRD has **prevention only**: FR41 (masking), FR43 (encryption), FR44 (Soul exclusion). **Detection + auto-deactivation = 0 FRs**.
- Impact: CLI 토큰 = root access agent pattern. Defense-in-depth via existing prevention FRs, but detection layer missing.
- **Recommended FR** (Winston draft): credential-scrubber detects `sk-ant-cli-*` / OAuth Bearer in agent output → session kill + DB `encrypted_token→null, status='leaked'` + Admin security alert + recovery flow.

**Gap 7 — n8n 서비스 계정 API 키 인증 패턴** | Severity: Informational (Quinn L2)
- Brief (L411): "서비스 계정 API 키 인증, 사용자 JWT 아님" — n8n→CORTHEX integration pattern
- PRD: No FR explicitly defines service account API key vs user JWT distinction for n8n integration.
- Impact: Architecture-deferred (Brief says "Architecture에서 상세 설계"). Informational.

**Gap 8 — /office 키보드 에이전트 선택** | Severity: Informational (Winston)
- Brief (L434): "키보드 에이전트 선택" + (L514): "키보드 에이전트 선택" — 2회 명시
- PRD: FR-OC10 등 /office 접근성 FRs에서 aria-live 텍스트 대안은 있으나, 키보드로 개별 에이전트 선택하는 FR 미정의.
- Impact: Accessibility baseline — FR-OC10 확장 또는 신규 FR 추가 권고.

#### Coverage Summary

**Overall Coverage:** 93% — Excellent
**Critical Gaps:** 0
**Moderate Gaps:** 3
1. ECC 2.7 — call_agent handoff response format (cross-cutting interface contract)
2. ECC 2.2 — Tier-based dynamic model routing (R3 cost risk linkage)
3. CLI 토큰 유출 자동 비활성화 메커니즘 (security-critical, Go/No-Go #11 gate but no FR)
**Informational Gaps:** 5
4. MCP server health check (Architecture-deferred)
5. Brief CEO "Costs/Reports" outdated (PRD GATE correct)
6. Brief Big Five 0.0~1.0 outdated (Stage 1 Decision refinement)
7. n8n service account API key pattern (Architecture-deferred)
8. /office 키보드 에이전트 선택 (accessibility FR expansion needed)

**Party Review Scores (R1→R2 Verified):**
| Critic | R1 | R2 (Verified) |
|--------|-----|---------------|
| Quinn (Critic-B) | 7.80 | 8.50 |
| John (Critic-C) | 8.05 | 8.05 |
| Winston (Critic-A) | 8.30 | 8.55 |
| **Average** | **8.05** | **8.37/10 PASS** |

**Recommendation:** PRD provides excellent coverage of Product Brief content. Three moderate gaps require FR additions before Architecture stage: (1) call_agent handoff response `{ status, summary, next_actions, artifacts }` format — Sprint 3 late discovery risk, (2) Tier-based cost-aware model routing — R3 비용 폭발 완화에 필수, (3) CLI 토큰 유출 감지 메커니즘 — Go/No-Go #11 gate criteria without implementing FR. Five informational items are either Architecture-deferred or Brief-side outdated references.

Status: COMPLETE — R2 Verified 8.37/10 PASS

### Step V-05: Measurability Validation

#### Functional Requirements

**Total FRs Analyzed:** 123 active (FR1-FR72 + FR-OC1-11 + FR-N8N1-6 + FR-MKT1-7 + FR-PERS1-9 + FR-MEM1-14 + FR-TOOLSANITIZE1-3 + FR-UX1-3; excludes ~~FR37~~, ~~FR39~~)

**Format Violations:** 0 critical

FRs use two patterns: (1) "[Actor]가 ... 할 수 있다" (~41 FRs), (2) "[Subject]가 ... 된다/한다" system behavior (~82 FRs). Pattern (2) does not follow strict "[Actor] can [capability]" format but is a deliberate Korean PRD convention for system-level behaviors. All 123 FRs have a clear subject and testable action — no ambiguous or untestable FRs found.

**Subjective Adjectives Found:** 1

| FR | Line | Term | Context | Severity |
|----|------|------|---------|----------|
| FR17 | 2314 | "적절한" (appropriate) | "에이전트가 범위 밖 요청을 거절하되 **적절한** 에이전트를 안내한다" | LOW — testable via routing accuracy (NFR-O5: 10 scenarios, 80%+ accuracy) but "적절한" itself is subjective without inline definition |

Note: "직관적" (L495, L742) and "쉽게" (L496) appear in Success Criteria narrative, NOT in FR definitions — excluded from FR violation count.

**Vague Quantifiers Found:** 0 actionable

| FR | Line | Term | Mitigation |
|----|------|------|------------|
| FR5 | 2297 | "여러" (multiple) | Immediately quantified: "회사별 상한 설정 가능, 기본 10개" |
| FR10 | 2302 | "여러" (multiple) | Context-clear: concurrent users, testable via load test |
| FR-MKT2 | 2449 | "일부" (some) | Conditional scenario: "일부 플랫폼 게시 실패 시" — describes partial failure handling, not a quantity requirement |

All instances mitigated by adjacent quantification or context. No standalone vague quantifiers.

**Implementation Leakage:** 17 FRs (11 Heavy, 6 Moderate)

This is the primary measurability concern. FRs should specify WHAT, not HOW. 17 of 123 FRs (~14%) contain implementation-level detail that belongs in Architecture.

**Heavy Implementation Leakage (file paths, SQL, framework-specific code):**

| # | FR | Line | Leaked Detail |
|---|-----|------|--------------|
| 1 | FR-OC1 | 2423 | `packages/office/`, PixiJS 8, `@pixi/react`, `React.lazy` + `dynamic import`, Vite bundle analysis |
| 2 | FR-OC2 | 2424 | WebSocket `/ws/office` channel path, JWT auth method, connection limits (50/500) |
| 3 | FR-OC7 | 2429 | PostgreSQL `LISTEN/NOTIFY`, Neon serverless caveat, 500ms polling fallback SQL (`SELECT * FROM activity_logs WHERE...`), `Hono WebSocket Helper upgrade()` |
| 4 | FR-N8N4 | 2440 | Full N8N-SEC 8-layer spec: port 5678, `N8N_DISABLE_UI`, `proxy()`, tag-based isolation SQL, HMAC webhook, Docker memory/CPU, `N8N_ENCRYPTION_KEY` AES-256-GCM, rate limit config. **Most heavily overloaded FR in entire PRD (~250 words)** |
| 5 | FR-PERS2 | 2459 | Migration filename `0061_add_personality_traits.ts`, Zod schema verbatim, DB CHECK constraint SQL (`(personality_traits->>'extraversion')::integer BETWEEN 0 AND 100`), prompt injection defense method |
| 6 | FR-PERS3 | 2460 | File paths `packages/server/src/services/soul-enricher.ts`, `engine/agent-loop.ts`, 5 variable names (`personality_openness`, etc.), PER-2 reference |
| 7 | FR-MEM2 | 2471 | Table/column names (`observations.embedding`), `VECTOR(1024)`, Voyage AI model name |
| 8 | FR-MEM3 | 2472 | File name `memory-reflection.ts`, `pg_advisory_xact_lock(hashtext(companyId))`, cron frequency, threshold values (≥20, ≥0.7) |
| 9 | FR-MEM5 | 2474 | Same as FR-MEM2: Voyage AI model, `VECTOR(1024)` |
| 10 | FR-MEM6 | 2475 | `soul-enricher.ts`, `engine/agent-loop.ts`, cosine threshold ≥0.75, top-3, variable name `{relevant_memories}` |
| 11 | FR-MEM8 | 2477 | Table names, `company_id WHERE` clause pattern |

**Moderate Implementation Leakage (component names, table references):**

| # | FR | Line | Leaked Detail |
|---|-----|------|--------------|
| 12 | FR35 | 2347 | `tier_configs` table name |
| 13 | FR40 | 2357 | `tool-permission-guard` component name |
| 14 | FR41 | 2358 | `credential-scrubber` + `output-redactor` component names |
| 15 | FR-MEM1 | 2470 | `observations` table, column names (company_id, agent_id, session_id, content, outcome, tool_used) |
| 16 | FR-MEM4 | 2473 | `agent_memories` table, `memoryType='reflection'`, Haiku API |
| 17 | FR-MEM7 | 2476 | `pgvector`, `{relevant_memories}` variable |

**Root Cause:** Stage 1 confirmed decisions (#3 N8N-SEC 8-layer, #8 observation poisoning, #9 advisory lock, etc.) were embedded directly into FRs rather than being cross-referenced. This is a deliberate PRD design choice to ensure no decision is lost between validation stages, but it overloads FRs with Architecture-level detail. **12 of 17 leakage instances are concentrated in v3 FRs** (FR-OC, FR-N8N, FR-PERS, FR-MEM) — confirming Stage 1 insertion as the systematic pattern (John D1).

**Note:** FR-MEM2 and FR-MEM5 contain near-identical leakage (both: Voyage AI model name + `VECTOR(1024)`). Listed separately because they target different tables (`observations` vs `agent_memories`), but the duplication itself signals Architecture-level concern — a single embedding strategy ADR would cover both (John D2).

**FR Violations Total:** 18 (1 subjective adjective + 17 implementation leakage)

#### Non-Functional Requirements

**Total NFRs Analyzed:** 76 active (12 categories: Performance 17, Security 10, Scalability 9, Availability 3, Accessibility 7, Data Integrity 8, External Deps 3, Operations 11, Cost 3, Logging 3, Browser 3, Code Quality 1; excludes ~~NFR-S7~~, ~~NFR-D7~~)

**Missing Metrics:** 0

All 76 NFRs have quantifiable targets. Examples: NFR-P1 "FCP ≤ 1.5초, LCP ≤ 2.5초", NFR-S4 "100% 마스킹", NFR-SC1 "최소 10개 동시 messages.create()", NFR-COST3 "Haiku ≤ $0.10/일". No NFR uses vague terms like "fast" or "good performance" without a metric.

**Security "100%" Measurability Note (Quinn analysis):** NFR-S4/S5/S6 claim "100%" but are measurable because they target **bounded pattern sets**: S4 = 3 known token patterns (`sk-ant-cli-*`, `sk-ant-api-*`, OAuth Bearer), S5 = 10 API key patterns, S6 = finite tool allowlist (~68 tools). These are provably enumerable, so "100%" is a valid target.

**However:** NFR-S10 and FR-TOOLSANITIZE3 specify "10종 adversarial payload에 대해 100% 차단율" — the "10종" makes it technically measurable, but **insufficient for production security** against untrusted input. Observations (agent raw logs) and tool responses (external system output) face unbounded attack surface: OWASP LLM01 alone has 10+ subcategories (direct/indirect injection, role override, system prompt extraction, base64/Unicode bypass, etc.). **Recommendation:** "10종" → "최소 25종 (OWASP LLM Top 10 카테고리별 2-3종)" 상향, with adversarial payload catalog defined at Architecture stage.

**Incomplete Template:** 4

The Performance category (NFR-P1~P17) uses 5-column format: ID | 요구사항 | 목표 | **측정** | 우선순위 | Phase — with explicit measurement method (e.g., "Lighthouse", "Chrome DevTools", "타이머").

The remaining 11 categories (59 NFRs) use 4-column format missing the **측정 (measurement method)** column. Most have self-evident methods (e.g., "AES-256" → verify algorithm, "100% 차단" → adversarial test suite), but 4 NFRs have genuinely unclear measurement methods:

| NFR | Line | Issue |
|-----|------|-------|
| NFR-A1 | 2566 | "WCAG 2.1 AA (최소)" — no tool specified (Lighthouse? axe-core? Manual audit?) |
| NFR-A2 | 2567 | "4.5:1 이상 (텍스트), 3:1 이상 (UI)" — no tool specified |
| NFR-O4 | 2602 | "평가자 2명 5점 척도. 평균 ≥ 기존" — subjective evaluation, inter-rater reliability undefined |
| NFR-CQ1 | 2637 | "CLAUDE.md 컨벤션 준수" — no verification method (CI lint? Code review? tsc?) |

**Missing Context:** 3

| NFR | Line | Issue |
|-----|------|-------|
| NFR-P9 | 2515 | "WebSocket 재연결 ≤ 3초" — no context for why 3s threshold or who it affects |
| NFR-LOG2 | 2624 | "로그 보관 최소 30일" — no context for regulatory/debugging rationale |
| NFR-B3 | 2633 | "Firefox/Edge — 보고되면 수정" — no SLA or response time for reported issues |

**Adversarial Test Sufficiency:** 2

| NFR/FR | Line | Issue |
|--------|------|-------|
| NFR-S10 | 2538 | "10종 adversarial payload 100% 차단" — measurable but insufficient for untrusted-input security (OWASP LLM01 alone has 10+ subcategories) |
| FR-TOOLSANITIZE3 | 2489 | Same "10종" threshold — tool responses are external system output with unbounded attack surface |

**NFR Violations Total:** 9 (4 incomplete template + 3 missing context + 2 insufficient adversarial test scope)

#### Overall Assessment

**Total Requirements:** 199 (123 FRs + 76 NFRs)
**Total Violations:** 27 (18 FR + 9 NFR)

**Severity:** Warning (nuanced)

Raw count (27) exceeds Critical threshold (>10), but 17 of 27 violations are implementation leakage — a deliberate PRD design choice to embed Stage 1 confirmed decisions in FRs. If counting only **measurability** issues (subjective terms, missing metrics, unclear methods, insufficient test scope):

- Genuine measurability violations: 10 (1 subjective adjective + 4 incomplete NFR template + 3 missing NFR context + 2 insufficient adversarial test scope)
- Implementation leakage (structural): 17 (Architecture-level detail in FRs)

**Adjusted Severity:** Warning (5-10 genuine measurability violations) + Structural Note (implementation leakage)

**Recommendation (prioritized):**

**Immediate Fixes (PRD-level, pre-Architecture):**
1. **FR17 "적절한"**: Add inline definition — "비서 Soul scope 기반 매칭 에이전트" or cross-reference NFR-O5 routing accuracy metric directly.
2. **NFR-A1/A2**: Specify measurement tool (e.g., "Lighthouse + axe-core automated scan + manual keyboard test").
3. **NFR-CQ1**: Specify verification method — "tsc --noEmit CI gate + ESLint config".
4. **NFR-S10 + FR-TOOLSANITIZE3**: Upgrade "10종" → "최소 25종 (OWASP LLM Top 10 카테고리별 2-3종)" for adversarial payload testing. 10종 is measurable but insufficient for untrusted-input security (Quinn M1).

**Architecture-Deferred (resolve at Architecture stage):**
5. **Implementation Leakage (17 FRs)**: Extract implementation detail into ADRs or `> Architecture Note:` blocks, preserving confirmed decision cross-references. **Critical: cross-reference format must maintain traceability to Stage 1 decisions** — extracting detail must not lose the link to confirmed-decisions-stage1.md (Winston D6). Example refactoring pattern for FR-N8N4 (~250 words → ~40 words): *"n8n Docker 컨테이너가 Oracle VPS 내부 포트에서 독립 실행된다. 보안: Architecture §N8N-SEC 8-layer 참조. 리소스: Brief mandate 준수 (확정 결정 #2, #3)."* (Winston D4). **Architecture checkpoint**: Verify all 17 FR implementation details match Architecture decisions — dual-management risk if PRD and Architecture diverge (John D6).
6. **NFR Template Inconsistency**: Add "측정 방법" column to non-Performance NFR tables, or add unified "Measurement Methods" appendix. Keep as structural recommendation — do not inflate Missing Metrics count (Winston Q2).
7. **NFR-O4**: Define inter-rater reliability threshold or scoring rubric at Test Plan stage (John JC3: conditionally accepted).

**Party Review Scores (R1→R2 Verified):**
| Critic | R1 | R2 (Verified) |
|--------|-----|---------------|
| Winston (Critic-A) | 8.45 | 8.90 |
| John (Critic-C) | 8.25 | 8.25 |
| Quinn (Critic-B) | 8.30 | 9.00 |
| **Average** | **8.33** | **8.72/10 PASS** |

Status: COMPLETE — R2 Verified 8.72/10 PASS

### Step V-06: Traceability Validation

#### Chain Validation

**Chain 1: Executive Summary → Success Criteria:** INTACT

Executive Summary vision "AI 조직이 살아 숨 쉰다 — 보이고, 생각하고, 성장한다" defines 6 differentiators. All 6 trace to specific success criteria:

| Differentiator | ES Reference | Success Criterion | SC Reference |
|---------------|-------------|-------------------|-------------|
| 투명성 (OpenClaw) | L312 | "CEO가 AI 팀 활동을 본다" (로드 ≤3초, 동기화 ≤2초) | L500 |
| 개성 (Big Five) | L315 | "Big Five 성격으로 에이전트가 달라진다" (A/B 블라인드) | L494 |
| 성장 (Memory) | L318 | "에이전트가 같은 실수를 안 한다" (≤3/10회) | L499 |
| 자동화 (n8n) | L321 | "n8n으로 워크플로우를 쉽게 만든다" (≤10분, 코드 0줄) | L496 |
| 설계 (NEXUS) | L324 | "CEO가 AI 조직을 설계할 수 있다" (≤10분) | L479 |
| 오케스트레이션 (Soul) | L327 | "Soul 편집으로 워크플로우가 바뀐다" (8/10회+) | L481 |

Vision→Success alignment: 6/6. No orphan differentiators, no unsupported success dimensions.

**Chain 2: Success Criteria → User Journeys:** INTACT

18 success criteria (10 v2 baseline + 8 v3 Sprint-aligned) all trace to user journeys:

| # | Success Criterion | Supporting Journey(s) |
|---|------------------|----------------------|
| SC-v2-1 | CEO가 AI 조직을 설계 | J4 (Admin NEXUS Phase 3) |
| SC-v2-2 | 자연어로 복잡한 작업 완료 | J1 (CEO Phase 2), J3 (투자자 Phase 2) |
| SC-v2-3 | Soul 편집으로 워크플로우 변경 | J1 (CEO Phase 2), J4 (Admin Phase 2) |
| SC-v2-4 | 비서 없이 직접 사용 | J5 (Human Phase 2) |
| SC-v2-5 | 음성 브리핑 수신 | J1 (Phase 4), J3 (Phase 4) |
| SC-v2-6 | 관련 문서를 찾는다 | J1 (Phase 4 의미 검색) |
| SC-v2-7 | 엔진 교체 후 품질 유지 | J1 (Phase 1 투명한 변화) |
| SC-v2-8 | 핸드오프 과정이 투명 | J1 (Phase 2 사이드바 추적) |
| SC-v2-9 | 에러 시 명확한 피드백 | J1 (Phase 2 에러 시나리오) |
| SC-v2-10 | 초기 설정이 쉽다 | J7 (CEO 온보딩), J4 (Admin Phase 2) |
| SC-v3-1 | Big Five 성격으로 달라진다 | J1 (Sprint 1), J4 (Sprint 1) |
| SC-v3-2 | Big Five 슬라이더 직관적 | J4 (Sprint 1 슬라이더 설정) |
| SC-v3-3 | n8n 워크플로우 쉽게 만든다 | J8 (Admin MKT Sprint 2), J4 (Sprint 2) |
| SC-v3-4 | 마케팅 콘텐츠 자동 생성 | J8 (Admin MKT Sprint 2) |
| SC-v3-5 | AI 도구 엔진 Admin 선택 | J8 (Admin MKT 도구 설정) |
| SC-v3-6 | 에이전트가 같은 실수 안 한다 | J10 (Admin Memory Sprint 3), J1 (Sprint 3) |
| SC-v3-7 | CEO가 AI 팀 활동을 본다 | J9 (CEO /office Sprint 4) |
| SC-v3-8 | CEO 앱 네비게이션 간결 | J1 (UXUI Layer 0 병행) |

Unsupported success criteria: 0. All 18 SC have at least one supporting journey.

**Chain 3: User Journeys → Functional Requirements:** 1 GAP

PRD provides an excellent Journey Requirements Summary table (L1304-1335) mapping 35 journey-derived requirements to their source journeys. Cross-validation against FR section:

**Journeys with complete FR coverage:**
- J1 CEO (Phase 1-4, Sprint 1/3/4): FR1-10, FR12/14/46/47, FR32/36, FR51/53, FR-PERS1-5, FR-MEM6/9, FR-OC1-11 ✓
- J2 팀장 (Phase 2-3, Sprint 2): FR13/15/19, FR-N8N2 ✓
- J3 투자자 (Phase 2/4, Sprint 3-4): FR5/16/55, FR-MEM6, FR-OC ✓
- J4 Admin (Phase 2-3, Sprint 1-3): FR26-33/59-61, FR-PERS1-9, FR-N8N1/6, FR-MKT1-7, FR-MEM3/9/11/13/14, FR-TOOLSANITIZE1-3 ✓
- J5 Human (Phase 2): FR13/15/17/19 ✓
- J6 Admin Dev (Phase 4): FR57/58 ✓
- J7 CEO onboarding (Phase 2): FR59-61 ✓
- J8 Admin MKT (Sprint 2): FR-N8N1-6, FR-MKT1-7 ✓
- J10 Admin Memory (Sprint 3): FR-MEM1-14 ✓
  - *Note: FR-TOOLSANITIZE1-3 relocated to J4 Sprint 2 per PRD Journey Summary L1330 which places Tool Sanitization under Admin Sprint 2 (n8n Docker security context, Go/No-Go #11). Report L482 previously listed them under J10 Sprint 3 in error.*

**Journey with GAP:**

**J9 CEO /office (Sprint 4)** — Journey 9 (L1253-1260) describes NEXUS 실시간 노드 상태 색상:
- 파란색(idle), 초록색(working/active), 빨간색(error), 주황색(degraded)
- Journey Summary (L1314) explicitly lists: "NEXUS 실시간 노드 색상 (4색)"
- **No FR covers NEXUS real-time node coloring.** FR30-32 cover NEXUS editing/viewing but NOT real-time status display. FR-OC1-11 cover `/office` PixiJS only.
- The cross-point table (L1349) acknowledges shared data source (activity_logs → both /ws/office and /ws/agent-status), but NEXUS rendering is left implicit.
- **Impact:** Low-Medium. Existing /ws/agent-status WebSocket infrastructure may already support this, but without an explicit FR the feature risks being omitted from Architecture/Epic scoping.

**Chain 4: Scope → FR Alignment:** INTACT

| Scope Phase | Key Deliverables | FR Coverage |
|------------|-----------------|-------------|
| MVP-A (Phase 1) | agent-loop.ts, Hooks, call-agent | FR1-10, FR38-45, FR23 ✓ |
| MVP-B (Phase 2) | Secretary, Soul, Org, Onboarding | FR11-33, FR46-49, FR59-68 ✓ |
| Growth-A (Phase 3) | NEXUS, Tiers, Page merge | FR30-31, FR34-36, FR-UX1-3 ✓ |
| Growth-B (Phase 4) | Library, SketchVibe, Phase 5+ | FR50-58, FR69-72 ✓ |
| Phase 5 Sprint 1 | Big Five | FR-PERS1-9 ✓ |
| Phase 5 Sprint 2 | n8n, Marketing, ToolSanitize | FR-N8N1-6, FR-MKT1-7, FR-TOOLSANITIZE1-3 ✓ |
| Phase 5 Sprint 3 | Memory, Reflection | FR-MEM1-14 ✓ |
| Phase 5 Sprint 4 | OpenClaw /office | FR-OC1-11 ✓ |

All scope items have supporting FRs. No scope deliverable is missing FR coverage.

#### Orphan Elements

**Orphan Functional Requirements:** 0

All 123 FRs trace to user journeys or business objectives:
- 82 FRs trace directly to journey narratives (Journey Requirements Summary L1304-1335)
- 29 FRs are cross-cutting infrastructure/security (FR8-9, FR38, FR40-45, FR48-49, FR-N8N3-4, FR-TOOLSANITIZE1-3, etc.) — trace to business objectives (security, compliance, operational stability) rather than individual user journeys. This is standard for cross-cutting concerns.
- 12 remaining FRs (FR-MEM7/8/10/12, FR-MKT5-7, FR-OC8-10, FR-UX2-3) are supporting/error-handling requirements that enable the primary journey FRs.

**Unsupported Success Criteria:** 0

All 18 success criteria (10 v2 + 8 v3) have supporting user journeys.

**User Journeys Without FRs:** 1

| Journey | Requirement | Missing FR |
|---------|------------|-----------|
| J9 (L1254-1260, L1314) | NEXUS 실시간 노드 상태 색상 (4색: idle/active/error/degraded) | No FR. FR30-32 cover editing/viewing only |

#### Traceability Matrix (Category-Level)

| FR Category | Count | Journey Source | Scope Source | SC Link |
|------------|-------|---------------|-------------|---------|
| Agent Execution (FR1-10) | 10 | J1 Phase 1-2, J3 Phase 2 | MVP-A | SC-v2-2, v2-7 |
| Secretary (FR11-20) | 10 | J1-2 Phase 2, J5 | MVP-B | SC-v2-2, v2-4 |
| Soul (FR21-25) | 5 | J1 Phase 2, J4 Phase 2 | MVP-B | SC-v2-3 |
| Organization (FR26-33) | 8 | J4 Phase 2-3 | MVP-B, Growth-A | SC-v2-1, v2-10 |
| Tier (FR34-38) | 4 | J1 Phase 3, J2 Phase 3 | Growth-A | SC-v2-1 |
| Security (FR40-45) | 6 | Cross-cutting | MVP-A | Business objective |
| Monitoring (FR46-49) | 4 | J1 Phase 2 | MVP-B | SC-v2-8, v2-9 |
| Library (FR50-56) | 7 | J1 Phase 4, J3 Phase 4 | Growth-B | SC-v2-5, v2-6 |
| Dev Collab (FR57-58) | 2 | J6 Phase 4 | Growth-B | Business objective |
| Onboarding (FR59-61) | 3 | J7 Phase 2, J4 Phase 2 | MVP-B | SC-v2-10 |
| v1 Compat (FR62-68) | 7 | J1 Phase 1-2 | MVP-A/B | SC-v2-7 |
| Phase 5+ (FR69-72) | 4 | Future | Phase 5+ | — |
| OpenClaw (FR-OC1-11) | 11 | J9 Sprint 4 | Sprint 4 | SC-v3-7 |
| n8n (FR-N8N1-6) | 6 | J4/J8 Sprint 2 | Sprint 2 | SC-v3-3 |
| Marketing (FR-MKT1-7) | 7 | J8 Sprint 2 | Sprint 2 | SC-v3-4, v3-5 |
| Personality (FR-PERS1-9) | 9 | J4 Sprint 1 | Sprint 1 | SC-v3-1, v3-2 |
| Memory (FR-MEM1-14) | 14 | J10 Sprint 3 | Sprint 3 | SC-v3-6 |
| ToolSanitize (FR-TS1-3) | 3 | J4 Sprint 2 | Sprint 2 | Business objective |
| UX (FR-UX1-3) | 3 | J1 병행 | 병행 | SC-v3-8 |
| **Total** | **123** | **10 Journeys** | **8 Scopes** | **18 SC** |

#### Overall Assessment

**Total Traceability Issues:** 1

**Broken Chains:** 0 (all 4 chains intact or near-intact)
**Orphan FRs:** 0
**Unsupported SC:** 0
**Journey→FR Gaps:** 1 (NEXUS real-time node colors)

**Severity:** Pass (near-perfect traceability with 1 minor gap)

**Recommendation:**

1. **NEXUS 실시간 노드 색상 FR 추가 권장 (FR-OC12 Draft)**:

   Journey 9 (L1254-1260) describes 4-color NEXUS node status as a Sprint 4 feature, and Journey Requirements Summary (L1314) explicitly lists "NEXUS 실시간 노드 색상 (4색)". No existing FR covers this — FR30-32 cover NEXUS editing/viewing (Phase 3 static) only, FR-OC1-11 cover /office PixiJS only.

   **Proposed FR-OC12 (Sprint 4 scope):** "CEO가 NEXUS 조직도에서 에이전트 노드의 실시간 상태를 색상으로 확인한다. 기존 `/ws/agent-status` WebSocket 채널(Architecture §WebSocket Layer)을 구독하여 React Flow 노드 `style.borderColor`를 업데이트한다. 상태→색상 매핑: idle(파란 #3B82F6), active(초록 #22C55E — working+speaking+tool_calling 통합), error(빨간 #EF4444), degraded(주황 #F59E0B). 연결 끊김 시 모든 노드 회색(#9CA3AF) + 재연결 배너 표시."

   **Sprint scope clarification:** FR-OC12 = Sprint 4. FR32 NEXUS read-only view = Phase 3 (static only). Phase 3 NEXUS does NOT include real-time status — it renders the organizational chart with static node rendering. Sprint 4 adds the real-time layer on top.

   **Scope creep risk:** FR-OC12 bridges two rendering systems (React Flow NEXUS + PixiJS /office) via shared `/ws/agent-status` data source. Architecture cross-point table (PRD L1349) already acknowledges this shared data path. However, without an explicit FR the NEXUS real-time feature risks being conflated with /office scope or omitted from Epic scoping entirely. FR-OC12 must be clearly scoped to NEXUS React Flow node coloring only — PixiJS /office rendering remains FR-OC1-11's domain.

   **PRD Extended State notation:** PRD L1314 lists "degraded" as a 6th state beyond Brief's original 5 (idle/working/speaking/tool_calling/error). This PRD-originated extension is documented in Journey 9 and should be reflected in FR-OC12's state mapping. The 4-color scheme maps 6 states → 4 colors by grouping working+speaking+tool_calling → active(green).

2. **NFR→SC Category-Level Traceability (Informational)**:

   The 4 primary chains (ES→SC, SC→UJ, UJ→FR, Scope→FR) are all validated above. An additional informational mapping — NFR categories to Success Criteria — shows that NFRs are also well-grounded in business objectives:

   | NFR Category | Success Criteria Link |
   |-------------|----------------------|
   | Performance (NFR-P1~P7) | SC-v2-2 (3초 내 응답), SC-v2-7 (v1 성능 유지) |
   | Security (NFR-S1~S10) | SC-v2-8 (보안 사고 0건), Business objective |
   | Scalability (NFR-SC1~SC6) | SC-v2-9 (30 에이전트/company), SC-v3-7 |
   | Memory (NFR-MEM1~MEM5) | SC-v3-6 (같은 실수 안 한다) |
   | Cost (NFR-COST1~COST3) | SC-v2-9 ($17/월), SC-v3-6 |
   | Observability (NFR-O1~O5) | SC-v2-8, SC-v2-9, Business objective |

   This is informational only — NFR→SC traceability is not a standard BMAD validation chain, but confirms NFRs are not orphaned from business objectives.

3. **PRD Strength**: Journey Requirements Summary table (L1304-1335) + Journey Cross-Points table (L1337-1351) provide excellent built-in traceability documentation. The 10-journey structure systematically covers all user types (Admin, CEO, Human, 팀장, 투자자) across all phases/sprints. The FR-TOOLSANITIZE placement correction (J10→J4 Sprint 2) aligns with PRD's own Journey Summary (L1330) which documents ToolSanitize under Admin Sprint 2 n8n security context.

---

### Step V-07: Implementation Leakage Validation

**Validator:** Validation Architect (autonomous)
**Input:** PRD L2285-2648 (123 active FRs + 76 active NFRs)
**Criterion:** FRs/NFRs specify WHAT, not HOW. Implementation details belong in Architecture.

#### Scanning Methodology

Scanned all 123 FRs (L2285-2498) and 76 NFRs (L2499-2648) for:
- File paths / source code references
- Database table names, column names, SQL queries
- Framework / library names (PixiJS, Hono, Zod, Drizzle, etc.)
- Infrastructure / cloud platforms (Docker, Oracle VPS, Cloudflare)
- Specific method calls (soulEnricher.enrich(), messages.create())
- Architecture cross-references (PER-1, MEM-6, Option B, etc.)

Each term evaluated for **capability-relevance** (WHAT the system does) vs **implementation leakage** (HOW to build it).

#### FR Leakage by Category

**File Paths / Source Code References: 6 FRs**

| FR | Line | Leakage |
|----|------|---------|
| FR-OC1 | L2423 | `packages/office/` 패키지 경로 |
| FR-OC7 | L2429 | `engine/agent-loop.ts`, `office-channel.ts` |
| FR-PERS2 | L2459 | `0061_add_personality_traits.ts` 마이그레이션 파일 |
| FR-PERS3 | L2460 | `packages/server/src/services/soul-enricher.ts`, `engine/agent-loop.ts`, `soulEnricher.enrich()` |
| FR-MEM3 | L2472 | `memory-reflection.ts` |
| FR-MEM6 | L2475 | `soul-enricher.ts`, `engine/agent-loop.ts` |

**Database / SQL Implementation: 10 FRs**

| FR | Line | Leakage |
|----|------|---------|
| FR35 | L2347 | `tier_configs 테이블 조회` |
| FR-OC7 | L2429 | `activity_logs` 테이블, `LISTEN/NOTIFY`, raw SQL (`SELECT * FROM activity_logs WHERE...`) |
| FR-PERS2 | L2459 | `agents.personality_traits JSONB`, DB CHECK SQL (`(personality_traits->>'extraversion')::integer BETWEEN 0 AND 100`) |
| FR-MEM1 | L2470 | `observations` 테이블명 + 6개 컬럼명 (company_id, agent_id, session_id, content, outcome, tool_used) + `MEM-6 4-layer` 아키텍처 참조 |
| FR-MEM2 | L2471 | `embedding VECTOR(1024)` 컬럼 정의 |
| FR-MEM3 | L2472 | `reflected=false` 컬럼 값, `pg_advisory_xact_lock(hashtext(companyId))` |
| FR-MEM4 | L2473 | `agent_memories` 테이블, `memoryType='reflection'` |
| FR-MEM5 | L2474 | Voyage AI (voyage-3, 1024d) 모델 명시 |
| FR-MEM8 | L2477 | `company_id WHERE 조건` SQL 패턴 |
| FR-MEM13 | L2482 | `reflected=true observations` 컬럼 값 |

**Framework / Library Names: 8 FRs**

| FR | Line | Leakage |
|----|------|---------|
| FR-OC1 | L2423 | PixiJS 8, @pixi/react, `React.lazy`, `dynamic import`, Vite |
| FR-OC7 | L2429 | Hono WebSocket Helper `upgrade()` |
| FR-N8N1 | L2437 | Hono reverse proxy |
| FR-N8N4 | L2440 | Hono `proxy()`, Docker 설정, `NODE_OPTIONS=--max-old-space-size=1536` |
| FR-N8N6 | L2442 | Hono proxy |
| FR-PERS2 | L2459 | Zod `z.object({...})` 스키마 코드 |
| FR-MEM2/5 | L2471/2474 | Voyage AI Embedding (voyage-3, 1024d) |
| FR-MEM7 | L2476 | `pgvector` 라이브러리명 + `{relevant_memories}` 템플릿 변수명 |

**Infrastructure / Cloud Platforms: 2 FRs**

| FR | Line | Leakage |
|----|------|---------|
| FR-N8N4 | L2440 | Oracle VPS, 포트 5678, Docker memory 2G, `N8N_ENCRYPTION_KEY` AES-256-GCM |
| FR-OC2 | L2424 | `/ws/office` 채널 경로, JWT 인증 방식, `shared/types.ts:484-501` |

**Hook / Component Names: 2 FRs**

| FR | Line | Leakage |
|----|------|---------|
| FR40 | L2357 | `tool-permission-guard` 훅 이름 — 보안 traceability 가치 있으므로 괄호 보조 표기 유지 권장: "비허용 도구 호출이 차단된다 (tool-permission-guard)" |
| FR41 | L2358 | `credential-scrubber + output-redactor` 훅 이름 — 동일하게 괄호 보조 표기 유지 권장 |

**Implementation Approach Constraints: 1 FR**

| FR | Line | Leakage |
|----|------|---------|
| FR-PERS5 | L2462 | "코드 분기(if/switch) 없이 프롬프트 주입만으로 구현된다" — HOW 제약. WHAT 환원: "성격 변경이 코드 배포 없이 즉시 반영된다" (FR-PERS4와 의미 중복, 병합 또는 Architecture Note 이동 가능) |

**Unique FRs with Implementation Leakage: 21**

FR35, FR40, FR41, FR-OC1, FR-OC2, FR-OC7, FR-N8N1, FR-N8N4, FR-N8N6, FR-PERS2, FR-PERS3, FR-PERS5, FR-MEM1, FR-MEM2, FR-MEM3, FR-MEM4, FR-MEM5, FR-MEM6, FR-MEM7, FR-MEM8, FR-MEM13

**Distribution:** v3 FRs = 18/21 (86%), v2 FRs = 3/21 (14%). Concentrated in Sprint 1-4 FRs where Stage 1 confirmed decisions were embedded.

**Top 3 most severe FRs:**
1. **FR-N8N4** (L2440): ~15 implementation terms in a single FR — Oracle VPS, port, Hono proxy(), tenantMiddleware, tag query params, Docker configs, env vars, encryption algo
2. **FR-PERS2** (L2459): Migration file path + Zod schema code + raw SQL CHECK constraint
3. **FR-OC7** (L2429): 2 file paths + PostgreSQL LISTEN/NOTIFY + raw SQL query + Hono framework method

#### NFR Leakage by Category

**Genuine NFR Leakage (HOW, not WHAT): 7 NFRs**

| NFR | Line | Leakage |
|-----|------|---------|
| NFR-S4 | L2532 | `output-redactor` 훅 이름 (마스킹 메커니즘이면 충분) |
| NFR-S5 | L2533 | `credential-scrubber` 훅 이름 |
| NFR-S6 | L2534 | `tool-permission-guard` 훅 이름 |
| NFR-S8 | L2536 | 4-layer 구현 이름 (Key Boundary → API Zod → extraVars strip → Template regex) |
| NFR-S9 | L2537 | 8-layer 전체 구현 상세 (Hono, Docker, AES-256-GCM, tags, HMAC 등) |
| NFR-SC7 | L2550 | `pgvector HNSW 인덱스`, `VECTOR(1024)` DB 구현 상세 |
| NFR-D8 | L2585 | `reflected=true`, `observations`, `agent_memories(reflection)` 테이블/컬럼명 |

**Acceptable in NFR Context (measurement tools, infrastructure constraints): 22 NFRs**

NFRs legitimately reference technology names when defining measurement methods (Lighthouse, Vite 빌드), deployment targets (Docker, PostgreSQL), cost constraints (Oracle Free Tier, Voyage AI), or SDK compatibility (messages.create(), 0.2.x). These describe measurable constraints on specific technologies already chosen, which is standard NFR practice. Not counted as violations.

**Boundary criterion:** A technology reference in an NFR is "acceptable" if removing it would make the NFR unmeasurable (e.g., "Lighthouse" in NFR-P1 = measurement tool). It is "leakage" if a generic term preserves testability (e.g., NFR-S4 "output-redactor" → "마스킹 메커니즘" loses no testability).

#### Capability-Relevant Terms (NOT violations)

The following terms appear in FRs/NFRs but are **capability-relevant** — they describe WHAT the system does for the user, not HOW to build it:

- **SSE** (FR6): Describes user-facing streaming delivery method
- **WebSocket** (FR-OC2, NFR-P9): Describes real-time communication capability
- **CLI** (FR28, FR38, FR57): Describes user-facing interface
- **API** (FR-N8N1, NFR-EXT3): Describes integration capability
- **MCP** (FR57): Describes protocol-level capability
- **n8n** (FR-N8N1-6): Product name, not implementation detail
- **PixiJS** in FR-OC9/10: Library named to clarify what is being made responsive/accessible (context: the library IS the feature)

#### Root Cause Analysis

**Pattern:** 18/21 leaking FRs are v3 additions (Sprint 1-4). Root cause: Stage 1 Tech Research produced 12 confirmed decisions (confirmed-decisions-stage1.md) with specific implementation constraints (Voyage AI 1024d, n8n Docker 2G, 8-layer security, pg_advisory_xact_lock, etc.). These decisions were embedded directly into FRs to ensure Architecture/Epic phases don't deviate.

**Severity of leakage by FR group:**
| Group | FRs | Leakage Density | Worst Offender |
|-------|-----|----------------|---------------|
| OpenClaw (FR-OC) | 3/11 | Medium | FR-OC7 (SQL+file paths+framework) |
| n8n (FR-N8N) | 3/6 | High | FR-N8N4 (~15 terms) |
| Personality (FR-PERS) | 3/9 | High | FR-PERS2 (SQL+Zod+file) |
| Memory (FR-MEM) | 9/14 | Very High (64%) | FR-MEM3 (pg function+file) |
| v2 Core | 3/82 | Very Low | FR40/41 (hook names only) |

#### Summary

**Total Implementation Leakage Violations:**
- FR violations: **21** (21/123 = 17.1% of active FRs)
- NFR violations: **7** (7/76 = 9.2% of active NFRs)
- **Total: 28 violations**

**Severity:** Warning (Adjusted)

Mechanical threshold (>5) = Critical, but adjusted to Warning following V-05 precedent because:

1. **Intentional design:** Leakage is deliberate — Stage 1 confirmed decisions embedded in FRs to constrain downstream Architecture. Not accidental.
2. **WHAT remains testable:** All 21 FRs still have a clear testable WHAT statement even with HOW mixed in. No FR is purely implementation — every one describes a user-facing capability.
3. **Concentrated:** 86% of violations in v3 Sprint 1-4 FRs. v2 core FRs (82 FRs) have only 3 violations (3.7%).
4. **Consistent with V-05:** 18 of 21 overlap with V-05 structural leakage findings. Newly caught in V-07: FR-N8N1, FR-N8N6, FR-MEM13. Reinstated from V-05 (missed in initial V-07 draft): FR-MEM1, FR-MEM7. FR-PERS5 added per critic review (implementation approach constraint).

**NFR "Acceptable" Boundary Criterion:** NFRs referencing technology names are classified as "acceptable" when the reference serves measurement context (tool/method used to verify the NFR) or constrains a specific chosen technology (deployment target, cost source, SDK version). If the technology name could be replaced with a generic term without losing testability, it is leakage; if removal would make the NFR unmeasurable, it is acceptable.

**Recommendation:**

1. **Split FRs into WHAT + Architecture Constraints:** For the 21 leaking FRs, extract implementation details into a companion "Architecture Constraints" section (or Architecture document appendix). The FR retains the capability statement; the constraint retains the confirmed decision. Example:
   - **FR-PERS2 (current):** "성격 설정이 `agents.personality_traits JSONB` 컬럼에 저장된다 (마이그레이션 #61...Zod 스키마...SQL CHECK...)"
   - **FR-PERS2 (split):** "성격 설정이 에이전트별로 저장되고, API에서 5개 축 각각 0-100 정수로 검증된다."
   - **Architecture Constraint PER-2:** "agents.personality_traits JSONB, migration #61, Zod z.object() server-side, DB CHECK constraint."

2. **Split Priority Tiers:**

   | Priority | Group | FRs | Action | Reason |
   |----------|-------|-----|--------|--------|
   | P1 Immediate | n8n | FR-N8N1/4/6 | WHAT 추출, 8-layer→Architecture §N8N-SEC 이동 | FR-N8N4 ~15 terms, Sprint 2 테스트 경계 모호 |
   | P2 Architecture | Memory | FR-MEM1/2/3/4/5/6/7/8/13 (9건) | 테이블/컬럼/SQL→Architecture §Memory-Schema | 64% 그룹 밀도, 가장 많은 violations |
   | P3 Architecture | Personality | FR-PERS2/3/5 | file paths+Zod+SQL→Architecture §PER | FR-PERS5는 FR-PERS4와 병합 가능 |
   | P4 Architecture | OpenClaw | FR-OC1/2/7 | PixiJS/Hono/SQL→Architecture §OpenClaw | FR-OC7이 가장 복합적 |
   | P5 Simple Fix | v2 Core | FR35/40/41 | 괄호 보조 표기로 전환 (hook name 유지) | 보안 traceability 가치 보존 |
   | Natural | NFR 7건 | NFR-S4~S9, SC7, D8 | Architecture 작성 시 자연 흡수 | NFR은 Architecture와 함께 정리 |

3. **v2 Core FRs (FR40/41):** 보안 컴포넌트 이름은 Architecture traceability 가치가 있으므로 제거하지 않고 괄호 보조 표기로 유지. "비허용 도구 호출이 차단된다 (tool-permission-guard)" 형식.

4. **Confirmed Decision → FR Impact Matrix:** FR split 시 Stage 1 confirmed decisions의 Architecture 이전이 누락되지 않도록 cross-reference 유지 필수:

   | Confirmed Decision | Affected FRs | Architecture Section |
   |-------------------|-------------|---------------------|
   | #1 Voyage AI 1024d | FR-MEM2, FR-MEM5 | §Embedding-Migration |
   | #2 n8n Docker 2G | FR-N8N4 | §N8N-SEC (SEC-5) |
   | #3 8-layer security | FR-N8N4 | §N8N-SEC (SEC-1~8) |
   | #5 Observation TTL 30d | FR-MEM13 | §Memory-Retention |
   | #8 4-layer poisoning | FR-MEM1, FR-MEM12 | §Observation-Defense |
   | #9 Advisory lock | FR-MEM3 | §Memory-Reflection |
   | #10 WebSocket limits | FR-OC2 | §WebSocket-Layer |

   FR은 "확정 결정 #N 참조" cross-reference만 유지하고, 구현 상세는 Architecture 문서로 이전.

5. **NFR-S8/S9 보안 layer 이름:** Security layer 구현 상세 (4-layer names, 8-layer details) → Architecture §Security-Layers 이동. NFR은 "N-layer 100% pass" 형식으로 요약.

**Note:** NFR-S9 (L2537) deserves special mention — it embeds the entire 8-layer security architecture in a single NFR row. This should be split into "8-layer security 100% pass" (NFR) + layer definitions (Architecture document).

---

### Step V-08: Domain Compliance Validation

**Validator:** Validation Architect (autonomous — Grade C, Writer solo)
**Input:** PRD frontmatter `classification.domain` (L42-46), domain-complexity.csv

**Domain Classification:**
- Primary: `ai-agent-orchestration`
- Secondary: `workflow-automation`
- Tertiary: `agent-intelligence`
- Differentiator: `dynamic-org-management`

**Complexity:** Low (general/standard)

The PRD domain (AI Agent Orchestration / SaaS B2B) does not match any high-complexity regulated domains in domain-complexity.csv (Healthcare, Fintech, GovTech, EdTech, Aerospace, Automotive, LegalTech, InsureTech, Energy, Process Control, Building Automation).

Note: PRD `classification.complexity: high` (33/40) refers to **project** complexity (architecture change, real-time systems, multi-layer integration), not **domain regulatory** complexity. CORTHEX is a general-purpose AI orchestration platform without industry-specific regulatory requirements (no FDA, HIPAA, PCI-DSS, SOC2, FedRAMP, etc.).

**Assessment:** N/A — No special domain compliance requirements.

**Severity:** Pass

**Domain Compliance Validation Skipped** — proceeding to next validation check.

---

### Step V-09: Project-Type Compliance Validation

**Validator:** Validation Architect (autonomous — Grade C, Writer solo)
**Input:** PRD frontmatter `classification.projectType` (L37), project-types.csv
**Project Type:** `saas_b2b` (composite: web_app 40% + saas_b2b 35% + developer_tool 25%)

#### Required Sections (saas_b2b)

**1. tenant_model:** Present, Adequate ✅

§멀티테넌트 모델 (L1802-1826): v2 base isolation table (6 items: row-level, data, schema, agent, CLI token, session) + v3 Sprint-level extensions table (8 items: n8n workflow/webhook/editor, Big Five, Memory, Reflection, /ws/office, external API keys). Comprehensive multi-tenant documentation with isolation mechanisms per Sprint.

**2. rbac_matrix:** Present, Adequate ✅

§권한 매트릭스 (RBAC) (L1828-1850): v2 base RBAC matrix (3 roles × 7 features) + v3 extended RBAC matrix (3 roles × 8 new features) + decision rationale for each v3 permission choice. All 5 user types (Admin, CEO, 팀장, Human, 투자자) covered through User Journeys.

**3. subscription_tiers:** Present, Adequate (as applicable) ✅

§구독 및 과금 (L1852-1872): Single-tier model — CLI Max 월정액 ($220/인). No multi-tier subscription pricing because CORTHEX is self-hosted with CLI Max providing the underlying AI compute. GATE decision (2026-03-20) explicitly removed cost tracking/dashboard. v3 additional cost elements documented (n8n Docker, Reflection LLM, external APIs, Voyage AI). Phase 5+ billing review candidates listed. Adequate for the business model.

**4. integration_list:** Present, Adequate ✅

External Dependencies NFR section (L2587-2593, NFR-EXT1~EXT3), Integration Points table (L1887+), and extensive integration documentation throughout:
- Claude Agent SDK (messages.create)
- n8n Docker (REST API, Hono reverse proxy)
- Voyage AI Embedding (voyage-3, 1024d)
- NotebookLM MCP (audio briefing)
- Telegram Bot API
- pgvector (vector search)
- PixiJS 8 (OpenClaw visualization)

**5. compliance_reqs:** Present, Partially ⚠️

Security compliance is thoroughly documented: NFR-S1~S10 (10 security requirements), 4-layer personality sanitization (PER-1), 8-layer n8n security (N8N-SEC-1~8), 4-layer observation poisoning defense (MEM-6), Data Privacy section (L2040+). However, no formal compliance framework matrix (SOC2, GDPR, PCI-DSS) — acceptable for a self-hosted B2B product where each company manages their own deployment. Not a managed multi-tenant SaaS with shared infrastructure.

#### Excluded Sections (saas_b2b)

**1. cli_interface:** Absent ✅

No dedicated CLI interface documentation section. CLI is mentioned as an integration point (Claude CLI OAuth tokens for Human authentication, MCP servers for developer collaboration) but is not the primary user interface. CLI aspects fall under developer_tool (25%) composition.

**2. mobile_first:** Absent ✅

No mobile-first design documentation. Desktop-first approach with mobile fallback (FR-OC9: PixiJS → list view on mobile, NFR-A7: responsive design for /office). Appropriate for B2B SaaS targeting admin/manager users.

#### Composite Type Cross-Check (web_app 40% + developer_tool 25%)

| web_app Required | Status | PRD Location |
|-----------------|--------|-------------|
| browser_matrix | ✅ Present | NFR-B1~B3 (L2629-2633) |
| responsive_design | ✅ Present | NFR-A7 (L2572), FR-OC9 (L2431) |
| performance_targets | ✅ Present | NFR-P1~P17 (L2503-2523) — 17 targets |
| accessibility_level | ✅ Present | NFR-A1~A7 (L2564-2572) — WCAG 2.1 AA |
| seo_strategy | N/A | Private B2B app, not public-facing |

| developer_tool Required | Status | PRD Location |
|------------------------|--------|-------------|
| api_surface | ✅ Partial | FR57-58 (SketchVibe MCP), SDK integration (L1887+) |
| code_examples | N/A | 25% composition — full developer docs in Architecture |

#### Compliance Summary

**Required Sections:** 5/5 present (1 partial — compliance_reqs)
**Excluded Sections Present:** 0 (correct)
**Composite Cross-Check:** 6/7 present (1 N/A — SEO)
**Compliance Score:** 100% (all applicable sections present)

**Severity:** Pass

**Recommendation:** compliance_reqs is adequate for the current self-hosted model. If CORTHEX evolves to a managed multi-tenant SaaS (Phase 5+), a formal compliance framework matrix (SOC2 Type II, GDPR Article 28 processor obligations) should be added.

**Project-Type Compliance Validation Complete** — proceeding to next validation check.

---

### Step V-10: SMART Requirements Validation

**Validator:** Validation Architect (party mode — Grade B)
**Input:** PRD L2285-2498 (123 active FRs across 19 categories)
**Criterion:** Each FR scored on SMART (Specific, Measurable, Attainable, Relevant, Traceable) 1-5 scale. Flag if any dimension < 3.

#### Scoring Methodology

Cross-referenced with prior validation findings:
- V-05 Measurability: 10 genuine violations → affects M scores
- V-06 Traceability: 1 gap (NEXUS colors) → affects T scores
- V-07 Implementation Leakage: 21 FRs → affects S scores (over-specific in HOW)

#### Category-Level Scoring Table

| Category | FRs | S | M | A | R | T | Avg | Flagged |
|----------|-----|---|---|---|---|---|-----|---------|
| Agent Execution (FR1-10) | 10 | 5.0 | 4.8 | 5.0 | 5.0 | 5.0 | 4.96 | 0 |
| Secretary (FR11-20) | 10 | 4.8 | 4.6 | 5.0 | 5.0 | 5.0 | 4.88 | 0 |
| Soul (FR21-25) | 5 | 4.6 | 4.4 | 5.0 | 5.0 | 5.0 | 4.80 | 0 |
| Organization (FR26-33) | 8 | 5.0 | 4.8 | 5.0 | 5.0 | 5.0 | 4.96 | 0 |
| Tier (FR34-38) | 4 | 4.3 | 4.5 | 5.0 | 5.0 | 5.0 | 4.76 | 0 |
| Security (FR40-45) | 6 | 4.3 | 4.5 | 5.0 | 5.0 | 5.0 | 4.76 | 0 |
| Monitoring (FR46-49) | 4 | 5.0 | 4.8 | 5.0 | 5.0 | 5.0 | 4.96 | 0 |
| Library (FR50-56) | 7 | 4.4 | 4.3 | 4.6 | 5.0 | 5.0 | 4.66 | 0 |
| Dev Collab (FR57-58) | 2 | 4.0 | 4.5 | 4.5 | 5.0 | 5.0 | 4.60 | 0 |
| Onboarding (FR59-61) | 3 | 5.0 | 5.0 | 5.0 | 5.0 | 5.0 | 5.00 | 0 |
| v1 Compat (FR62-68) | 7 | 4.4 | 3.7 | 4.9 | 5.0 | 5.0 | 4.60 | **1** |
| Phase 5+ (FR69-72) | 4 | 4.0 | 3.8 | 4.0 | 4.5 | 4.0 | 4.06 | 0 |
| OpenClaw (FR-OC1-11) | 11 | 3.5 | 3.8 | 3.7 | 5.0 | 5.0 | 4.20 | **1** |
| n8n (FR-N8N1-6) | 6 | 3.3 | 4.2 | 4.3 | 5.0 | 5.0 | 4.36 | **1** |
| Marketing (FR-MKT1-7) | 7 | 4.0 | 3.6 | 3.9 | 5.0 | 5.0 | 4.30 | **1** |
| Personality (FR-PERS1-9) | 9 | 3.7 | 3.7 | 4.8 | 5.0 | 5.0 | 4.44 | **1** |
| Memory (FR-MEM1-14) | 14 | 3.4 | 3.9 | 4.4 | 5.0 | 5.0 | 4.34 | 0 |
| ToolSanitize (FR-TS1-3) | 3 | 4.0 | 3.3 | 3.3 | 5.0 | 5.0 | 4.12 | **1** |
| UX (FR-UX1-3) | 3 | 4.7 | 4.7 | 5.0 | 5.0 | 5.0 | 4.88 | 0 |

#### Flagged FRs (Score < 3 in Any Dimension)

**6 FRs flagged out of 123 (4.9%)**

| FR | S | M | A | R | T | Avg | Flag Reason |
|----|---|---|---|---|---|-----|-------------|
| FR64 | 4 | **2** | 5 | 5 | 5 | 4.2 | M: "학습한 내용을 자동 저장하고 이후 활용" — "활용"이 모호. 측정 기준 없음 |
| FR-N8N4 | **2** | 4 | 4 | 5 | 5 | 4.0 | S: ~15 구현 용어로 WHAT이 HOW에 매몰 (V-07 worst offender). "n8n이 독립 실행 + 8-layer 보안" = WHAT이나 Oracle VPS/포트/Hono proxy()/tenantMiddleware/HMAC/Docker 설정/NODE_OPTIONS/AES-256-GCM 등으로 불명확 |
| FR-OC7 | 3 | 4 | **2** | 5 | 5 | 3.8 | A: PostgreSQL LISTEN/NOTIFY Neon serverless 지원 미확인. PRD 자체 "검증 필수" 명시 |
| FR-MKT7 | 4 | **2** | 4 | 5 | 5 | 4.0 | M: "fallback 엔진으로 자동 전환" — 어떤 엔진? 전환 조건? 지정 안 됨 |
| FR-PERS5 | 3 | **2** | 5 | 4 | 5 | 3.8 | M: "코드 분기 없이 프롬프트 주입만으로 구현" — 기능 테스트 불가. 코드 리뷰만 가능 |
| FR-TOOLSANITIZE3 | 4 | 3 | **2** | 5 | 5 | 3.8 | A: "10종 adversarial payload 100% 차단" — 비한정 공격 표면에서 10종은 불충분 (V-05 발견) |

**Phase 5+ Individual R/T Scores (유일하게 R/T < 5.0인 카테고리):**

| FR | R | T | Reason |
|----|---|---|--------|
| FR69 | 4 | 4 | Phase 5+ 예약, 사용자 여정 미확정 |
| FR70 | 5 | 4 | 테마 전환 — UX 여정 연결은 명확하나 Phase 5+ 스프린트 미배정 |
| FR71 | 5 | 4 | 감사 로그 — Admin 여정 연결 명확하나 Phase 5+ 미배정 |
| FR72 | 4 | 4 | 키보드 접근성 — 일반적 UX 요구, 특정 여정 약결합 |

#### Improvement Suggestions

**FR64** (Measurable 2): "에이전트가 이전 세션에서 학습한 내용을 다음 세션에서 관련 질문에 활용한다" → 측정 기준 구체화: FR64의 "학습 활용" = FR-MEM6 (Sprint 3 memory injection)의 동작으로 구체화. "동일 주제 재질문 시 이전 학습 내용이 응답에 포함된다 (10개 시나리오 중 8개 이상)." Phase 유지 보장 — FR64를 FR-MEM6 cross-reference로 업데이트 권고. [Immediate — PRD FR64 measurability 보강]

**FR-OC7** (Attainable 2): Neon serverless LISTEN/NOTIFY 지원 여부가 Sprint 4 전 검증 필요 (PRD L2429 자체 명시). 폴백(500ms 폴링)이 문서화되어 있으므로 폴백 포함 시 Attainable 4로 상향 가능. **권고:** WHAT 환원 — "에이전트 상태 변화를 ≤ 2초 내 감지하고 가상 오피스 UI에 반영한다 (구현 방식 Architecture 위임)." 2-tier 분리는 불필요 — 단일 FR에 폴백 경로 포함이 적절. [Architecture 위임 — Sprint 4 Go/No-Go에서 구현 방식 확정]

**FR-N8N4** (Specific 2): V-07 worst offender — ~15 구현 용어가 WHAT을 매몰시킴. **권고:** WHAT 환원 — "n8n 워크플로우 엔진이 독립 프로세스로 실행되며 8-layer 보안을 적용한다." Oracle VPS/포트/Hono proxy()/tenantMiddleware/HMAC/Docker 설정/NODE_OPTIONS/AES-256-GCM 등 구현 상세는 Architecture Spec으로 이동. [P2 PRD Fix — V-07 split recommendation과 연계]

**FR-MKT7** (Measurable 2): "fallback 엔진"이 무엇인지 미지정. **권고:** "외부 AI API(이미지: DALL-E/Midjourney, 영상: Runway/Pika) 장애 시 회사 설정의 2순위 엔진으로 자동 전환되고 Admin에게 전환 알림이 전송된다. 2순위 미설정 시 해당 콘텐츠 타입을 건너뛰고 나머지를 완성한다." [P2 PRD Fix — 도메인 결정 필요]

**FR-PERS5** (Measurable 2): "코드 분기 없이"는 구현 제약이며 기능 테스트로 검증 불가 (V-07에서 Implementation Approach Constraint로 분류). **권고:** FR-PERS4와 병합, "코드 분기 없이" 제약은 Architecture Note로 이동. 측정 기준: "성격 슬라이더 변경 후 코드 배포 없이 다음 세션에서 에이전트 톤이 변화한다 (A/B 블라인드 8/10+)." [Immediate — PRD FR-PERS5 measurability 보강 + Architecture Note 분리]

**FR-TOOLSANITIZE3** (Attainable 2): V-05에서 "10종 adversarial payload"가 비한정 공격 표면에서 불충분하다고 지적. **권고:** V-05 합의안 적용 — OWASP LLM Top 10 카테고리 기반 2-stage 로드맵: Stage 1 (Sprint 2) = 10 카테고리 × 1종 = 10종 기준선, Stage 2 (Sprint 3 Go/No-Go #11) = 10 카테고리 × 2+종 = 20+종 확장 검증. 카테고리별 커버리지 95%+ 확인. 단순 수량 기준("최소 25종")이 아닌 OWASP 카테고리 기반 커버리지로 측정 — 공격 표면의 체계적 포괄이 가능. [Architecture 위임 — Go/No-Go #11에서 차단율 기준 확정]

#### Scoring Summary

**All scores ≥ 3:** 117/123 = **95.1%** (6 FRs flagged with score < 3)
**All scores ≥ 4:** 91/123 = **74.0%** (32 FRs with at least one dimension = 3)
**Overall Average Score:** **4.59/5.0**

**Severity:** Pass (4.9% flagged < 10% threshold)

**Key observations:**
1. Phase FRs (73건, FR1-72 + FR-UX1-3) 평균 4.78/5.0 — 우수. v2 architecture 검증 완료 + Phase 유지 FR 성숙도 덕분. FR-UX1-3은 접근성/반응형 등 Phase-level 횡단 요구사항.
2. Sprint FRs (50건, FR-OC/N8N/MKT/PERS/MEM/TS) 평균 4.31/5.0 — 양호하나 Specific 3.5 (implementation leakage), Attainable 3.9 (신기술 불확실성) 상대적 약점.
3. Relevant 5.0 + Traceable 5.0 — Phase 5+ (FR69-72, 4건) 제외 시 전 FR 비즈니스 목표/사용자 여정 연결 완벽 (V-06 확인). Phase 5+ FRs는 R=4.0-5.0, T=4.0 (Phase 미배정으로 인한 약결합).
4. 6건 flagged FRs 중 3건(FR64, FR-PERS5, FR-MKT7)은 Measurability 문제 (V-05 발견과 일치), 2건(FR-OC7, FR-TOOLSANITIZE3)은 Attainability 문제, 1건(FR-N8N4)은 Specificity 문제 (V-07 worst offender).

**Borderline Watch List (any SMART dimension = 3, not flagged — requires attention):**

| FR | S | M | A | R | T | Avg | Watch Reason |
|----|---|---|---|---|---|-----|-------------|
| FR-MEM1 | 3 | 4 | 5 | 5 | 5 | 4.4 | S: observations 테이블 + 6 컬럼명 명시 (V-07 leakage) |
| FR-MEM7 | 3 | 4 | 4 | 5 | 5 | 4.2 | S: pgvector 라이브러리명 명시 (V-07 leakage) |
| FR-MEM13 | 3 | 4 | 4 | 5 | 5 | 4.2 | S: 구현 용어 포함 (V-07 leakage) |
| FR-N8N1 | 3 | 4 | 4 | 5 | 5 | 4.2 | S: Docker/포트 설정 용어 (V-07 leakage) |
| FR-N8N6 | 3 | 4 | 5 | 5 | 5 | 4.4 | S: Hono proxy + JWT + CSRF Origin 검증 구현 상세 (V-07 leakage) |

**Category Lowest FR (per category, non-flagged):**

| Category | Lowest FR | Avg | Limiting Dimension |
|----------|-----------|-----|-------------------|
| v1 Compat | FR65 | 4.0 | M=3 (v1 parity "동일 수준" 모호) |
| Phase 5+ | FR69 | 3.8 | R=4, T=4 (Phase 미배정) |
| OpenClaw | FR-OC4 | 3.8 | S=3, A=3 (PixiJS 구현 상세) |
| n8n | FR-N8N1 | 4.2 | S=3 (Docker 설정 용어) |
| Marketing | FR-MKT5 | 4.0 | M=3 (콘텐츠 "품질" 기준 미정의) |
| Personality | FR-PERS3 | 4.0 | S=3 (Big Five 구현 상세) |
| Memory | FR-MEM1 | 4.0 | S=3 (테이블/컬럼명 명시) |
| ToolSanitize | FR-TS1 | 4.0 | M=3 (sanitize "완전성" 측정 미정) |

**NFR SMART Cross-Reference:** NFR의 SMART 품질은 별도 평가하지 않음 — V-05 Measurability (76 NFRs, 9 violations: 4 incomplete template + 3 missing context + 2 adversarial insufficiency) + V-09 Project-Type Compliance에서 NFR 품질을 충분히 커버. FR-focused SMART 평가와 NFR measurability 평가를 병합하면 이중 계산 리스크.

**Improvement Priority Tiers:**

| Tier | FRs | Action | Owner |
|------|-----|--------|-------|
| P1 Immediate (PRD 수정) | FR64, FR-PERS5 | Measurability 보강 — 현재 PRD에서 바로 수정 가능 | PRD Author |
| P2 PRD Fix (다음 iteration) | FR-MKT7, FR-N8N4 | Measurability/Specificity 보강 — 도메인 결정 필요 | PRD Author + Domain Expert |
| P3 Architecture 위임 | FR-OC7, FR-TOOLSANITIZE3 | Attainability — Architecture 단계에서 구현 방식 확정 후 FR 업데이트 | Architect |

**Recommendation:**
1. 6건 flagged FRs의 개선 제안을 Priority Tier 순으로 적용 — P1 즉시, P2 다음 iteration, P3 Architecture 단계
2. Sprint FRs의 Specific 점수 향상을 위해 V-07 split recommendation (WHAT + Architecture Constraints 분리) 적용 권고
3. FR64 측정 기준 = FR-MEM6 동작으로 구체화 (기능 중복 해소, Phase 유지 보장)
4. Borderline watch list 5건은 flagged는 아니나 Architecture 단계에서 S 점수 개선 기대 (V-07 leakage 분리 시 자동 개선)

---

### Step V-11: Holistic Quality Assessment

**Validator:** Validation Architect (party mode — Grade B)
**Input:** Complete PRD (2648 lines), validation report V-01 through V-10
**Criterion:** Assess PRD as cohesive, compelling document — Document Flow, Dual Audience, BMAD Principles, Overall Quality Rating

#### 1. Document Flow & Coherence

**Assessment:** Good (4/5)

**Strengths:**
- **v2→v3 evolution 명확**: v2 보존 블록(`<!-- v2 -->`, "> v2 Phase 의존성 (보존 참고)") + v3 추가 블록이 시각적으로 구분됨. Brownfield 업데이트의 모범 사례
- **Sprint 의존성 다이어그램** (L165-181): ASCII 의존성 그래프가 4-Sprint + Pre-Sprint + Layer 0 병행을 한눈에 전달. 텍스트 기반 PRD에 최적화된 시각화
- **GATE 결정 추적 투명성**: costs/workflows 제거 근거, CLI Max 과금 모델 변경, 7개 기능 감사표(L247-263)가 PRD 내에서 결정 이력 자체 문서화
- **여정 → FR → NFR 연결 무결**: Journey Requirements Summary (L1306-1336)가 50행 테이블로 전 여정→FR 매핑을 압축. V-06에서 1건(NEXUS 색상) 외 완벽 확인
- **교차점 분석** (L1337-1351): 14개 여정 간 교차점이 공유 데이터/권한/에러 경로 충돌을 사전 식별. Architecture 입력으로 직접 활용 가능

**Areas for Improvement:**
- **Frontmatter 과부하** (L1-103): 103행 YAML — 분류/v3Layers/topRisks/terminology 전부 포함. LLM 파싱에는 유리하나, Human이 "PRD 본문이 어디서 시작되는지" 찾기 어려움. `---` 이후 L105에서야 본문 시작
- **v2 보존 블록 산재**: `<!-- v2 -->` 주석 블록이 여러 섹션에 분산 (L200-201, L265-271, L183-185). v3 독립 문서라면 별도 appendix로 분리가 깔끔하나, brownfield 업데이트 맥락에서는 현행 인라인 보존이 실용적
- **용어집 위치**: Terminology가 frontmatter 내부(L77-102)에 있어 본문 읽기 중 참조하기 어려움. 별도 `## Glossary` 섹션이나 문서 말미 배치 권고
- **섹션 전환 마커 부재**: 주요 섹션(Discovery→Executive Summary→Journeys→Domain→Innovation→Technical→FR→NFR) 간 명시적 전환 문구 없음. 2648행 문서에서 현재 위치 파악이 어려울 수 있음

#### 2. Dual Audience Effectiveness

**For Humans:**
- **Executive-friendly (4/5):** Executive Summary (L273+)에서 v2 규모(485 API, 86 테이블, 10,154 테스트), v3 4-Layer 비전, Sprint 로드맵을 빠르게 파악 가능. 단, 기술 용어 밀도가 높아 비기술 경영진에게는 과부하. 사장님(CORTHEX 사용자)은 기술 배경이 있으므로 적절
- **Developer clarity (5/5):** FR 번호 체계(FR1-72 + FR-PREFIX), Phase/Sprint 태그, 코드 영향도 추정(L234-243), Sprint별 주요 파일 목록이 개발 계획 수립에 직접 활용 가능. Zero Regression 정의(L231)가 기존/신규 경계를 명확히
- **Designer clarity (4/5):** 사용자 여정(L203-224)이 Sprint별 UX 흐름을 상세히 기술하며 접근성 요구사항까지 포함. 단, 와이어프레임/목업 참조 없음(Stitch 2가 별도 파이프라인이므로 PRD 범위 밖)
- **Stakeholder decision-making (5/5):** GATE 결정 기록(L247-263), Go/No-Go 게이트 14개(Brief 11 + Stage 1 추가 3), Risk Registry, Sprint 의존성이 결정 근거를 명확히 문서화. 과금 모델 변경(L1852-1879)도 후보 4개와 근거를 제시

**For LLMs:**
- **Machine-readable structure (5/5):** YAML frontmatter(L1-103)가 classification, v3Layers, sprintOrder, topRisks를 구조화. 테이블 87개(FR/NFR/RBAC/복잡도 등)가 LLM 파싱에 최적. 삭제된 FR/NFR도 ~~취소선~~으로 명시적 마킹
- **UX readiness (4/5):** 사용자 여정 4개 + 접근성 노트 + RBAC 매트릭스로 UX 디자인 가능. 단, 와이어프레임 레벨의 레이아웃 힌트는 없음 (Stitch 2 DESIGN.md가 별도 존재)
- **Architecture readiness (5/5):** Technical Architecture Context (L1784+), 복잡도 8축 매트릭스(L152-161), 멀티테넌트 확장 테이블(L1815-1826), Sprint 의존성 그래프가 Architecture 문서 생성에 충분한 컨텍스트 제공
- **Epic/Story readiness (5/5):** FR 123건 × Phase/Sprint 태그 + NFR 76건 × 우선순위 + Sprint 의존성 → Epic 분할과 Story 생성에 직접 활용 가능. Journey Requirements Summary 테이블이 Story acceptance criteria의 원천

**Dual Audience Score:** 4.5/5

#### 3. BMAD PRD Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| Information Density | Met | 2648행에 123 FR + 76 NFR + 87 테이블. 필러 문장 거의 없음. 주석 블록도 의도적(v2 보존) |
| Measurability | Partial | V-05: 10/123 FR + 9/76 NFR 측정 기준 미흡 (4 incomplete template + 3 missing context + 2 adversarial insufficiency). V-10: 6건 flagged (4.9%). "100% 차단" 등 비한정 기준 잔존 |
| Traceability | Met | V-06: ES→SC→UJ→FR 4-layer 추적 완벽. 1건 gap (NEXUS 실시간 색상) — informational, non-blocking |
| Domain Awareness | Met | V-08: ai-agent-orchestration 도메인 정확 식별. 규제 요구 없음(low complexity). n8n/PixiJS 외부 의존성 리스크 명시 |
| Zero Anti-Patterns | Partial | V-07: 21 FRs implementation leakage (18/21 = 85.7% ≈ 86% Stage 1 confirmed decisions — V-07 Decision→FR Impact Matrix 7개 결정이 18 FR에 영향). 의도적이나 WHAT/HOW 분리 미흡. 보안 구현 상세 노출(4-layer/8-layer chain 이름) = info disclosure 리스크 — V-07 Rec #5 Architecture 이동으로 동시 해소. Anti-pattern: 용어집 내 파일 경로(L97-102) |
| Dual Audience | Met | YAML frontmatter(LLM) + 한국어 narrative(Human). 기술/비기술 수준 적절한 균형 |
| Markdown Format | Met | heading hierarchy 일관, 테이블 정렬, 코드 블록 적절 사용. 취소선 삭제 항목 명시 |

**Principles Met:** 5/7 (2 Partial: Measurability, Zero Anti-Patterns)

#### 4. Overall Quality Rating

**Rating:** 4/5 - Good

**Scale:**
- 5/5 - Excellent: Exemplary, ready for production use
- **4/5 - Good: Strong with minor improvements needed** ← CORTHEX v3 PRD
- 3/5 - Adequate: Acceptable but needs refinement
- 2/5 - Needs Work: Significant gaps or issues
- 1/5 - Problematic: Major flaws, needs substantial revision

**Rating Justification:**
- v2 기반(485 API, 10,154 테스트 검증)이 안정적 토대 → Phase FRs avg 4.78/5.0
- **Overall SMART avg 4.59/5.0** (91.8%) — 123 FRs × 5 dimensions, 6건 flagged (4.9%)
- v3 Sprint FRs의 implementation leakage (21건)와 measurability issues (6건 flagged)가 "Good"과 "Excellent" 사이의 간극
- Stage 1 confirmed decisions 12건이 PRD에 충실히 반영됨 (Voyage AI, n8n 2G, 8-layer security 등)
- 4-Sprint + Pre-Sprint + Layer 0 병행 구조가 복잡도를 관리 가능한 단위로 분할
- Go/No-Go 14개 게이트(Brief §4 원본 11 + Stage 1 확정 결정 3개 추가, PRD L453)가 리스크 관리 체계를 문서화
- **Validation self-correction 궤적**: V-04 R1 FAIL(7.80)→R2 PASS(8.50), V-05 R1 FAIL(7.53)→R2 PASS(8.42) — 초기 발견→수정→검증 사이클이 문서 품질을 점진적으로 개선. 이 패턴은 PRD 자체의 수정 수용력(amendability)을 증명

**V-01~V-10 Validation Closure:**
- V-01 Structure: PASS — 2648행 heading hierarchy 정상
- V-02 Brief Alignment: PASS — Brief 4-Layer 충실 반영
- V-03 Scope Alignment: PASS — v2 유지 + v3 추가 경계 명확
- V-04 Consistency: PASS (R2 8.50) — 용어/수치/Phase 태그 일관
- V-05 Measurability: PASS (R2 8.42, Warning) — 10 FR + 9 NFR violations, nuanced severity
- V-06 Traceability: PASS (R2 8.80) — ES→SC→UJ→FR 4-layer 완결, 1건 informational gap
- V-07 Implementation Leakage: PASS (R2 8.75, Warning Adjusted) — 21 FR + 7 NFR, 86% Stage 1 intentional
- V-08 Domain Compliance: PASS — ai-agent-orchestration low complexity, skip
- V-09 Project-Type Compliance: PASS — saas_b2b 100% compliance, Phase 5+ SOC2/GDPR 확장 권고
- V-10 SMART: PASS (R2 8.75) — 6/123 flagged (4.9%), avg 4.59/5.0

**4/5 → 5/5 Path (proceed/fix tradeoff):**
- Top 3 완료 시 **4.5/5 도달 기대** (Measurability Partial→Met, Zero Anti-Patterns Partial→Met → 7/7 BMAD Principles). 5/5 Excellent은 추가로 frontmatter 구조 개선 + 섹션 전환 마커 등 문서 polish 필요
- **Proceed 권고**: 4/5 Good에서 Architecture 진행 적절. 이유: (1) leakage FRs는 Architecture 입력으로 "constraints 명시"가 되므로 Architecture agent에게 오히려 도움 (HOW가 이미 Stage 1에서 검증됨), (2) Top 3 #1(WHAT/HOW 분리)은 Architecture 단계에서 자연스럽게 실행 가능, (3) P1 Immediate 수정(FR64, FR-PERS5)만 Architecture 전 PRD에서 완료하면 충분
- **Architecture handoff 리스크 양면**: FR 내 implementation detail이 Architecture agent에게 "constraints 참고자료"(긍정)인 동시에 "PRD-Architecture 경계 혼란"(부정) 유발 가능. **완화**: Architecture 단계 시작 시 "V-07 Confirmed Constraints Appendix" 생성하여 21건을 PRD FR에서 분리 → Architecture 입력으로 명시적 전달. **주의**: FR 내 구현 상세는 Stage 1 confirmed decision 참조이지 Architecture 결정이 아님 — Architecture agent가 이를 "이미 확정된 제약"으로 오해하지 않도록 출처(Stage 1 Decision #N) 표기 필수

#### 5. Top 3 Improvements

1. **WHAT/HOW 분리 (V-07 Split Recommendation)**
   21 FRs의 implementation detail을 Architecture Constraints appendix로 분리. PRD FR은 "무엇을(WHAT)" 명시하고, "어떻게(HOW)"는 Architecture 문서로 위임. 이로써 V-10 Sprint FRs Specific 점수 3.5→4.0+ 상향 기대, borderline watch list 5건도 자동 해소. 가장 높은 ROI — 단일 작업으로 21건 개선.

2. **6건 Flagged FR Measurability 보강 (V-10 Priority Tiers)**
   P1 Immediate (FR64, FR-PERS5) → PRD 내 즉시 수정 가능. P2 PRD Fix (FR-MKT7, FR-N8N4) → 도메인 결정 후 수정. P3 Architecture (FR-OC7, FR-TOOLSANITIZE3) → Architecture 단계에서 구현 방식 확정 후 FR 업데이트. 이 3-tier 접근이 "모든 FR을 지금 고치자"보다 실현 가능.

3. **용어집(Terminology) 구조 개선**
   Frontmatter 내 terminology (L77-102)를 본문 말미 `## Glossary` 섹션으로 분리. 특히 v3 용어(L96-102)에 포함된 파일 경로(`soul-renderer.ts`, `memory-reflection.ts`)와 구현 상세(`VECTOR(1024)`, `memoryType='reflection'`)를 Architecture Reference로 이동. PRD 용어집은 "개념 정의"에 집중 — 구현 상세는 Architecture 문서로.

#### Summary

**This PRD is:** v2 검증 완료된 기반 위에 v3 4-Layer 확장을 체계적으로 추가한 강건한 제품 요구사항 문서. Sprint 의존성, Go/No-Go 게이트, GATE 결정 추적이 복잡한 brownfield 프로젝트의 리스크를 관리 가능한 수준으로 분할한다.

**To make it great:** Top 3 개선 중 #1 WHAT/HOW 분리가 가장 높은 ROI — Architecture 단계에서 자연스럽게 실행 가능하며, 21건 implementation leakage + 5건 borderline watch list를 동시 해소한다.

**Cross-step Interaction Analysis (Top 3 파급 효과):**
- #1 WHAT/HOW 분리 실행 시: V-07 leakage 21건→0건 (Architecture 이동), V-10 Sprint S avg 3.5→4.0+ 상향, V-10 borderline watch list 5건 해소, V-11 Zero Anti-Patterns Partial→Met. V-06 traceability 무변동 (FR→Journey 매핑 불변, 내용만 간결화)
- #2 Measurability 보강 시: V-05 FR violations 10→4건 (P1 즉시 2건 + P2 2건 + P3 2건 = 6건 해소, 잔여 4건은 경미한 주관성), V-10 flagged 6→0건 (P1+P2+P3 전부), V-11 Measurability Partial→Met 방향
- #3 Glossary 분리 시: V-11 Flow 4/5→4.5/5 (frontmatter 간결화), Zero Anti-Patterns 추가 개선. V-05/V-06/V-07 무영향

---

### Step V-12: Completeness Validation

**Validator:** Validation Architect (party mode — Grade B)
**Input:** Complete PRD (2648 lines) + frontmatter (L1-103)
**Criterion:** Final gate — template variables, content completeness, section-specific completeness, frontmatter completeness

#### 1. Template Completeness

**Template Variables Found:** 0 (unresolved)

PRD 내 `{variable}` 패턴 전수 스캔 결과, 모든 occurrences는 **legitimate technical content**:
- Soul template variables: `{agent_list}`, `{subordinate_list}`, `{tool_list}`, `{owner_name}`, `{department_name}`, `{specialty}`, `{relevant_memories}` — FR23 (Soul 변수 치환) 문서화
- Mustache template: `{{personality_openness}}/100 — {{openness_desc}}` — Big Five Soul 주입 형식 (Stage 1 Decision 4.3.1)
- Code patterns: `{companyId}` (n8n tag 필터), `{sessionId}` (임시 파일 경로) — 멀티테넌트 격리 패턴 문서화

**Unresolved placeholders ([TBD], [TODO], [FIXME], [placeholder]):** 0건

**Architecture deferred items (HTML 주석):** 1건
- L141: `<!-- 정확한 라우트 경로는 Architecture에서 확정: /admin/n8n/* vs /api/workspace/n8n/* -->` — 합법적 PRD→Architecture handoff. 완결성 위반 아님.

#### 2. Content Completeness by Section

| Section | Line | Status | Notes |
|---------|------|--------|-------|
| Project Discovery | L110 | Complete | 분류, detection signals, Sprint 의존성, 요구사항 유형 분리, 코드 영향도 |
| Executive Summary | L273 | Complete | v2 규모 (코드 감사 검증), v3 비전, 차별화 요소 |
| Success Criteria | L471 | Complete | 14 Go/No-Go 게이트, measurable metrics, Sprint별 매핑 |
| Product Scope | L668 | Complete | In-scope (v2 유지 + v3 4-Layer), Out-of-scope (Phase 5+), GATE 결정 |
| User Journeys | L1070 | Complete | 10개 여정 (v2 6 + v3 4), Sprint별 요구사항 Summary 테이블, 여정 간 교차점 14건 |
| Domain-Specific Requirements | L1352 | Complete | 보안/AI/데이터/MKT/UX — 5개 도메인, 정량 목표는 NFR 참조 |
| Innovation & Novel Patterns | L1538 | Complete | v2 leverage (5개) + v3 leverage (4개), 외부 서비스 활용 추정 |
| Technical Architecture Context | L1784 | Complete | Project-Type Overview, 멀티테넌트 확장, RBAC v2+v3, 과금 모델 |
| Project Scoping & Phased Development | L2085 | Complete | Sprint 로드맵, Risk Registry (14건), 완화 전략 |
| Functional Requirements | L2285 | Complete | 123 active FRs, 19 categories, Phase/Sprint 태그. ~~삭제~~ 표기 명시 |
| Non-Functional Requirements | L2499 | Complete | 76 active NFRs, 12 categories, 우선순위 4단계. ~~삭제~~ 표기 명시 |

**Sections Complete:** 11/11 (100%)

#### 3. Section-Specific Completeness

**Success Criteria Measurability:** Mostly — 14 Go/No-Go 게이트 중 12건(85.7%) measurable (V-05에서 2건 Go/No-Go 관련 FR measurability 미흡 지적). 10 FR + 9 NFR 측정 기준 미흡은 Success Criteria 외 개별 요구사항 수준 (V-10 Priority Tiers P1/P2/P3로 개선 경로 확보)

**User Journeys Coverage:** Yes — 전 사용자 유형 커버:
- CEO 김도현 (Phase 1-4 + Sprint 1/3/4 + 병행)
- 팀장 박과장 (Phase 2-3 + Sprint 2)
- 투자자 이사장 (Phase 2/4 + Sprint 3/4)
- Admin 이수진 (Phase 2-3 + Sprint 1/2/3)
- Human 직원 이과장 (Phase 2)
- Admin (개발) 스케치바이브 (Phase 4)
- CEO (온보딩) (Phase 2 + v3 추가)

**FRs Cover MVP Scope:** Yes — v2 Phase 1-4 전체 + v3 Sprint 1-4 + Phase 5+ 예약

**삭제 항목 완전 목록 (GATE 결정 2026-03-20, CLI Max 월정액):**
- ~~FR37~~: 비용 기록 — CLI Max 월정액, 비용 기록 불필요
- ~~FR39~~: 비용 현황 페이지 — CLI Max 월정액
- ~~NFR-S7~~: cost-tracker 정확도 (L2535) — costs 페이지 전면 제거
- ~~NFR-D7~~: 비용 기록 보관 (L2584) — 비용 추적 불필요
전 4건 동일 GATE 결정 근거. PRD 내 ~~취소선~~ 표기로 명시적 추적

**NFRs Have Specific Criteria:** Mostly (88.2%) — 76건 중 67건 specific criteria 보유. 9건 V-05 violations (4 incomplete template + 3 missing context + 2 adversarial insufficiency)

#### 4. Frontmatter Completeness

| Field | Status | Value/Notes |
|-------|--------|-------------|
| stepsCompleted | Present ✅ | 12개 step (step-01-init ~ step-12-complete) |
| workflowStatus | Present ✅ | "complete" |
| completedDate | Present ✅ | "2026-03-21" |
| classification.projectType | Present ✅ | "saas_b2b" |
| classification.domain | Present ✅ | primary: ai-agent-orchestration, secondary: workflow-automation, tertiary: agent-intelligence |
| classification.complexity | Present ✅ | "high" (33/40) |
| classification.complexityBreakdown | Present ✅ | 8축 정량 평가 |
| inputDocuments | Present ✅ | 8개 문서 (v3 primary 4 + v2 baseline 4) |
| terminology | Present ✅ | v2 14개 + v3 9개 용어 |
| v3Layers | Present ✅ | Layer 0-4 + sprintOrder |
| topRisks | Present ✅ | R1/R6/R7/R8 |

**Frontmatter Completeness:** 11/11 fields (100%)

#### 5. 🔴 NOT STARTED Items (Project Status, Not Completeness Gap)

| Item | Line | Status | Impact |
|------|------|--------|--------|
| Neon Pro 업그레이드 | L168 | 🔴 NOT STARTED | Pre-Sprint 블로커. PRD에서 정확히 문서화됨 — 완결성 문제 아닌 프로젝트 상태 |
| Voyage AI 마이그레이션 | L169 | 🔴 NOT STARTED | Pre-Sprint. 768d→1024d re-embed + HNSW rebuild |

이 항목들은 "PRD에 빈 곳이 있다"가 아니라 "아직 실행하지 않은 Pre-Sprint 작업"을 정확히 문서화한 것. 완결성 위반 아님.

#### 6. Internal Cross-Reference Spot-Check

| 참조 유형 | 샘플 | 유효 |
|----------|------|------|
| "확정 결정 #5" (L1282) | → Observation TTL 30일 (confirmed-decisions-stage1.md #5) | ✅ |
| "Go/No-Go #9" (L1781) | → Observation Poisoning Defense (PRD L453 게이트 테이블 #9) | ✅ |
| "NFR-P13 참조" (L2520) | → NFR Performance 테이블 내 존재 확인 | ✅ |
| "N8N-SEC-3" (L1457) | → Domain-Specific Requirements 보안 테이블 | ✅ |
| "FR-OC2 기능 기준" (L2551) | → FR-OC2 OpenClaw FRs 내 존재 | ✅ |

5건 spot-check 전부 유효. 구조적 참조 무결성 확인.

#### Completeness Summary

**Overall Structural Completeness:** 100% (11/11 sections complete, 0 template variables, 11/11 frontmatter fields)

> **"100% Complete" = 구조적 완결성.** 모든 필수 섹션 존재, 빈 템플릿 변수 0건, frontmatter 전 필드 populated. **내용 품질** 완결성은 V-01~V-11에서 별도 평가 — V-11 Overall Rating **4/5 Good**, V-10 SMART avg **4.59/5.0**.

**Critical Gaps:** 0
**Minor Gaps:** 1 — Architecture deferred item (L141 n8n 라우트 경로). PRD→Architecture handoff로 합법적.

**삭제 항목:** 4건 (FR37, FR39, NFR-S7, NFR-D7) — 전부 CLI Max GATE 결정, ~~취소선~~ 추적

**V-01~V-11 Findings Status:**
- PRD 반영 완료: V-01~V-04 구조/일관성/정합 — 0건 잔여
- Architecture 위임: V-07 leakage 21건 WHAT/HOW 분리 (Top 3 #1), V-10 P3 2건 (FR-OC7, FR-TOOLSANITIZE3)
- PRD 수정 권고: V-10 P1 2건 즉시 (FR64, FR-PERS5), P2 2건 다음 iteration (FR-MKT7, FR-N8N4)
- Informational: V-06 NEXUS 색상 1건, V-08 domain skip, V-09 Phase 5+ SOC2/GDPR 확장 권고

**Severity:** Pass

**Recommendation:**
1. PRD는 **구조적으로 100% 완결**. Architecture 단계 진입 준비 완료 (V-11 proceed 권고 참조).
2. P1 Immediate 수정 2건 (FR64, FR-PERS5)은 Architecture 병행 가능 — Architecture 시작을 지연할 필요 없음.
3. Content quality: V-11 4/5 Good, V-10 SMART avg 4.59/5.0. Top 3 완료 시 4.5/5 도달 기대.

**⚠️ PRD 수정 시 재검증 note:** Top 3 #1 WHAT/HOW 분리 실행 시 FR 변경 + Architecture Constraints appendix 신규 → V-12 completeness 재검증 권고 (섹션 수/FR 수 변동 가능).

---

### Step V-13: Validation Report — Executive Summary & Final Verdict

**Validator:** Validation Architect (Grade C — Writer solo, finalization)
**Date:** 2026-03-22
**Validation Mode:** Mode A — FRESH WRITE (post-reverify PRD, Stage 3)

---

## ✓ PRD Validation Complete

**Overall Status:** PASS
**Holistic Quality Rating:** 4/5 — Good
**SMART Average:** 4.59/5.0 (123 FRs × 5 dimensions)

---

### Quick Results Table

| Step | Validation Area | Result | Severity | Key Metric |
|------|----------------|--------|----------|------------|
| V-01 | Document Discovery | PASS | — | 2648 lines, 10 input docs, 12 confirmed decisions |
| V-02 | Format & Structure | PASS | — | BMAD Standard, 11 sections, 6/6 core sections |
| V-03 | Information Density | PASS | — | 0 anti-pattern violations |
| V-04 | Brief Coverage | PASS (R2 8.37) | — | 93% coverage, 3 moderate gaps, 5 informational |
| V-05 | Measurability | PASS (R2 8.72) | Warning | 10 FR + 9 NFR violations (17 structural leakage) |
| V-06 | Traceability | PASS (R2 8.80) | — | 4 chains intact, 1 minor gap (NEXUS colors) |
| V-07 | Implementation Leakage | PASS (R2 8.75) | Warning (Adj.) | 21 FR + 7 NFR leakage (86% Stage 1 intentional) |
| V-08 | Domain Compliance | PASS | — | N/A — ai-agent-orchestration, no regulatory reqs |
| V-09 | Project-Type Compliance | PASS | — | saas_b2b 100% compliance score |
| V-10 | SMART Requirements | PASS (R2 8.75) | — | 6/123 flagged (4.9%), avg 4.59/5.0 |
| V-11 | Holistic Quality | PASS (R2 8.75) | — | 4/5 Good, Dual Audience 4.5/5, BMAD 5/7 |
| V-12 | Completeness | PASS (R2 8.80) | — | 100% structural, 0 template vars, 11/11 frontmatter |

**All 12 steps PASS.** 2 Warning (Adjusted) — both intentional design choices, not defects.

---

### Party Mode Critic Scores (Stage 3)

| Step | John (Critic-C) | Quinn (Critic-B) | Winston (Critic-A) | Average |
|------|-----------------|-------------------|---------------------|---------|
| V-04 Brief Coverage | 8.05 | 8.50 | 8.55 | 8.37 |
| V-05 Measurability | 8.25 | 9.00 | 8.90 | 8.72 |
| V-06 Traceability | — | — | — | 8.80 |
| V-07 Impl. Leakage | — | — | — | 8.75 |
| V-10 SMART | 8.25 | 9.10 | 8.90 | 8.75 |
| V-11 Holistic | 8.10 | 9.25 | 8.90 | 8.75 |
| V-12 Completeness | 8.25 | 9.25 | 8.90 | 8.80 |

**Critic Stage 3 Averages:**
- John (Critic-C): 8.22/10, all PASS
- Quinn (Critic-B): 9.04/10, all PASS (min 8.50)
- Winston (Critic-A): ~8.83/10, all PASS

**Grand Average (7 party-mode steps):** 8.73/10

---

### Critical Issues

**Count: 0**

No critical issues found. All validation steps pass with no blocking findings.

---

### Warnings (Adjusted)

**Count: 2** (both intentional design choices)

1. **V-05/V-07 Implementation Leakage (21 FRs, 7 NFRs)**
   - 86% of FR leakage = Stage 1 confirmed decisions deliberately embedded in FRs
   - All 21 FRs retain testable WHAT statements despite HOW mixing
   - V-07 provides priority-tiered extraction plan (P1~P5)

2. **V-05 Measurability (10 genuine FR + 9 NFR violations)**
   - Adjusted severity: 10 genuine measurability issues (not 27 raw)
   - V-10 SMART scores: 6 FRs flagged (4.9% < 10% threshold)
   - V-10 provides 3-tier improvement plan (P1 Immediate, P2 PRD Fix, P3 Architecture)

---

### Strengths

1. **v2 Foundation Maturity:** Phase FRs (73건) avg 4.78/5.0 SMART — 485 API, 86 tables, 10,154 tests 검증 기반
2. **Traceability Excellence:** ES→SC→UJ→FR 4-chain near-perfect. Journey Requirements Summary (L1304-1335) + Cross-Points (L1337-1351) = built-in traceability docs
3. **Zero Information Density Violations:** 2648 lines, 0 filler phrases, 0 wordy constructions. Dense, direct Korean+English bilingual writing
4. **Go/No-Go Gate System:** 14 gates (Brief 11 + Stage 1 추가 3) with explicit pass/fail criteria. GATE decision tracking (L247-263) provides audit trail
5. **Stage 1 Decision Integration:** 12 confirmed decisions (Voyage AI, n8n 2G, 8-layer security, etc.) fully reflected in PRD — no decision lost
6. **Self-Correction Trajectory:** V-04 R1(7.80)→R2(8.50), V-05 R1(7.53)→R2(8.42) — iterative improvement demonstrates PRD amendability

---

### Holistic Quality: 4/5 — Good

**BMAD Principles Compliance: 5/7 Met (2 Partial)**

| Principle | Status |
|-----------|--------|
| Information Density | Met |
| Measurability | Partial |
| Traceability | Met |
| Domain Awareness | Met |
| Zero Anti-Patterns | Partial |
| Dual Audience | Met |
| Markdown Format | Met |

---

### Top 3 Improvements (from V-11)

1. **WHAT/HOW 분리 (V-07 Split Recommendation)** — Highest ROI
   21 FRs의 implementation detail → Architecture Constraints appendix. 단일 작업으로 21건 leakage + 5건 borderline watch list 동시 해소. Sprint S avg 3.5→4.0+ 상향.

2. **6건 Flagged FR Measurability 보강 (V-10 Priority Tiers)**
   P1 Immediate: FR64, FR-PERS5 (PRD 내 즉시 수정)
   P2 PRD Fix: FR-MKT7, FR-N8N4 (도메인 결정 후)
   P3 Architecture: FR-OC7, FR-TOOLSANITIZE3 (구현 방식 확정 후)

3. **용어집(Terminology) 구조 개선**
   Frontmatter terminology (L77-102) → 본문 `## Glossary` 분리. 파일 경로/구현 상세 → Architecture Reference 이동.

---

### PRD-Level Action Items Summary

| Priority | Item | FRs/NFRs | Owner | When |
|----------|------|----------|-------|------|
| P1 Immediate | Measurability 보강 | FR64, FR-PERS5 | PRD Author | Architecture 병행 가능 |
| P2 PRD Fix | Measurability + Specificity | FR-MKT7, FR-N8N4 | PRD Author + Domain Expert | 다음 iteration |
| P3 Architecture | WHAT/HOW 분리 (21 FRs) | FR-OC/N8N/PERS/MEM 등 | Architect | Architecture 단계 |
| P3 Architecture | Attainability 확인 | FR-OC7, FR-TOOLSANITIZE3 | Architect | Architecture 단계 |
| P4 Informational | NEXUS 실시간 색상 FR 추가 | FR-OC12 (proposed) | PRD Author | Sprint 4 scoping |
| P4 Informational | Glossary 구조 개선 | — | PRD Author | Polish pass |
| P5 Phase 5+ | SOC2/GDPR compliance matrix | — | Architect | If managed SaaS |

**Moderate Brief Coverage Gaps (V-04, PRD FR 추가 권고):**
1. ECC 2.7 — call_agent handoff response format (cross-cutting interface contract)
2. ECC 2.2 — Tier-based dynamic model routing (R3 cost risk linkage)
3. CLI 토큰 유출 자동 비활성화 메커니즘 (security-critical, Go/No-Go #11)

---

### Recommendation

**PRD is in good shape. Proceed to Architecture stage.**

- **4/5 Good** quality — strong foundation with minor improvements needed
- All 12 validation steps PASS, 0 critical issues
- P1 Immediate 수정 2건 (FR64, FR-PERS5) = Architecture 병행 가능, 지연 불필요
- Top 3 #1 (WHAT/HOW 분리) = Architecture 단계에서 자연스럽게 실행 → 4.5/5 도달 기대
- 3건 moderate Brief gaps (V-04) = Architecture 시작 전 PRD FR 추가 권고

**4/5 → 5/5 Path:** Top 3 전부 완료 + frontmatter 구조 개선 + 섹션 전환 마커 추가

---

**Validation Report Saved:** `_bmad-output/planning-artifacts/prd-validation-report.md`
**Status:** COMPLETE — Stage 3 PRD Validate 종료
