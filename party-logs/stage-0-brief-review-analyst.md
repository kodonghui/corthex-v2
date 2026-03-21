# Stage 0 Brief Review — Analyst (Mary)

> Document: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
> Date: 2026-03-21
> Reviewer: Mary (Analyst / Writer)
> Context read: product-brief, v3-openclaw-planning-brief, v3-corthex-v2-audit, v1-feature-spec, project-context.yaml, ECC analysis plan (Part 2)

---

## Section-by-Section Analysis

### 1. Executive Summary (Lines 77-91) — Score: 7/10

**Strengths:**
- Accurately cites v2 audit numbers (485 API, 86 tables, 71 pages, 10,154 tests) — verified against `v3-corthex-v2-audit.md`
- Clear 4-layer structure with CEO-friendly descriptions
- Correctly identifies the 4 core problems

**Issues:**
- **[CRITICAL — STALE REF] Line 88**: "디자인 도구: **Subframe**(메인)" — Subframe was **deprecated** as of 2026-03-19. Current tool is **Google Stitch 2**. MEMORY.md confirms: "Stitch 2 = 2026-03-19 대규모 업데이트 / Subframe(폐기)"
- **[MINOR] Line 90**: "정량 지표는 Step 4에서 정의" — this is a leftover pipeline note that should be removed in the final assembled Brief since Step 4 IS now complete (lines 317-367)

### 2. Core Vision (Lines 94-188) — Score: 8/10

**Strengths:**
- Problem Statement is clear and business-focused (not technical)
- Problem Impact table links problems to business consequences
- Competitive analysis (OpenAI Assistants, AutoGen, CrewAI, AI Town, n8n) is specific
- Layer implementation order is well-justified (difficulty low→high, dependency-aware)
- Layer 4 memory architecture: Option B (extend existing) is well-reasoned with Zero Regression justification
- Layer 1 OpenClaw: correctly states "기존 agent-loop.ts 실행 로그 읽기만 — 엔진 변경 없음"

**Issues:**
- **[CRITICAL — STALE REF] Line 187**: "도구: Subframe(메인 디자인)" — same stale Subframe reference
- **[IMPORTANT — MISSING] No embedding provider specified**: Line 163 mentions "pgvector 시맨틱 검색" for memory planning stage, but does NOT specify the embedding model. Key constraint (project-context.yaml line 65): "Embedding: Voyage AI (Anthropic recommended) — NOT Gemini". The Brief MUST explicitly state Voyage AI as the embedding provider, since the previous implementation (Epic 10) used Gemini embedding which is now banned.
- **[MINOR] Line 125**: "485개 API, 68개 built-in 도구, 14개 WebSocket 채널, 6개 백그라운드 워커" — good, matches audit exactly

### 3. Target Users (Lines 191-314) — Score: 9/10

**Strengths:**
- Excellent lesson-learned from v2: "Admin이 항상 첫 번째 사용자" (line 193)
- Onboarding flow is specific with code references (`getOnboardingStatus`, `ProtectedRoute`)
- Personas are concrete (이수진 32세, 김도현 38세)
- AHA moments are well-defined for both user types
- User journeys are step-by-step
- 1인 창업자 edge case addressed (line 212)

**Issues:**
- **[IMPORTANT — MATH ERROR] Line 224 + Line 313**: Admin says "+1 예정" and total says "73개 예상". But Admin actually gets **+2 new pages**: (1) n8n management page (line 404) and (2) /office read-only view (line 238). CEO gets +1 (/office). Total should be: Admin 27 + 2 = 29, CEO 42 + 1 = 43, Login 2 = **74 total**, not 73.
- **[MINOR] Line 262**: CEO app "42개 페이지 v2 기준, v3 +1 예정" — +1 is correct for CEO (only /office)

### 4. Success Metrics (Lines 317-367) — Score: 8/10

**Strengths:**
- Clear separation: User Success / Layer KPIs / Business Objectives
- Each metric has measurement method and target direction
- PixiJS bundle hard limit (< 200KB gzipped) is specific
- Zero Regression metrics are well-defined (ARGOS 0% disruption, agent_memories 0% data loss)
- Reflection cost is flagged as PRD blocker (line 349) — good risk awareness

**Issues:**
- **[CRITICAL — STALE REF] Line 355**: "Phase 0 디자인 게이팅: Subframe 기준 대비 구현 일치율 ≥ 95%" — Subframe → Stitch 2
- **[IMPORTANT — ECC GAP] Missing Capability Eval metric**: ECC analysis 2.4 proposes "에이전트가 이전에 못 했던 것을 이제 할 수 있는지" evaluation — this would be a powerful Success Metric for Layer 4 memory effectiveness, beyond just "재수정 횟수 감소"
- **[MINOR]** Line 345: `soul-renderer.ts {{personality_traits}} 주입 성공률: 100%` — good that it specifies fallback behavior (빈 문자열 주입 = FAIL)

### 5. MVP Scope — Sprint Order (Lines 370-398) — Score: 7.5/10

**Strengths:**
- Single release decision is clear (no phased rollout)
- Sprint dependencies are explicit (Phase 0 → Sprint 1 → ... → Sprint 4)
- Pre-Sprint/Layer 0 interleave strategy is sensible
- Sprint 3 blocker (Tier cost limits from PRD) is flagged
- Sprint 4 blocker (asset quality from Stage 1 Research) is flagged

**Issues:**
- **[CRITICAL — STALE REF] Line 378**: "(Subframe 아키타입 선택)" — Stale
- **[CRITICAL — STALE REF] Line 388**: "Subframe 기반 디자인 시스템" — Stale
- **[CRITICAL — STALE REF] Line 391**: "Subframe 기준 대비 구현 일치율 ≥ 95%" — Stale
- **[IMPORTANT — MISSING] No sprint duration estimates**: Even at a Brief level, relative complexity or approximate weeks per sprint would help downstream planning. Current table has content + dependencies but no time dimension.
- **[IMPORTANT — MISSING] Layer 0 intermediate gating**: Line 379 mentions "Sprint 2 종료까지 ≥ 60% 미달 시 레드라인 검토" — good, but what does "60%" measure? UXUI completion percentage? Color token migration percentage? Needs definition.

### 6. Core Features In Scope (Lines 385-424) — Score: 8.5/10

**Strengths:**
- Each layer's scope is concrete with specific technical details
- Layer 4 memory: Option B adoption is clearly justified with 3-stage flow diagram (line 412)
- Layer 1 OpenClaw: asset strategy (LPC + AI generation) with research gate
- Layer 2 n8n: security model is specific (Hono reverse proxy, JWT reuse, internal port only)
- n8n scope boundary is clear: "신규 자동화 전용, 기존 ARGOS 유지"
- Zero-downtime migration strategy mentioned (line 413)

**Issues:**
- **[IMPORTANT — ECC GAP] Missing observations table fields**: ECC 2.3 recommends `confidence` (0.3~0.9) and `domain` fields for the observations table. The Brief mentions "observations 테이블 추가 (raw 실행 로그)" but doesn't specify schema beyond "raw". These fields would significantly improve Reflection quality.

### 7. Out of Scope (Lines 425-437) — Score: 9/10

**Strengths:**
- Clear and justified exclusions
- Each "Out" has a reason
- Important security exclusion: "n8n 포트 5678 외부 노출 — 보안 절대 금지"

**Issues:**
- **[MINOR]** Line 435: "PixiJS 에셋 외부 구매 → AI 직접 생성으로 대체" — the In Scope (line 421) also mentions "LPC Sprite Sheet(오픈소스)" which is technically external. The out-of-scope should say "유료 에셋 구매" not just "외부 구매".

### 8. MVP Success Criteria / Go/No-Go (Lines 439-450) — Score: 8/10

**Strengths:**
- 8 specific go/no-go gates
- Zero Regression is gate #1 (correct priority)
- Big Five injection validation includes edge case (빈 문자열 = FAIL)
- Memory Zero Regression is separate gate (#4)
- Asset quality has explicit pre-condition (Stage 1 Research)

**Issues:**
- **[IMPORTANT — MISSING] No security gate for agent prompt injection**: Given ECC 2.1 finding that "에이전트 84%가 tool response 경유 프롬프트 주입에 취약", and CORTHEX agents run with user CLI tokens, there should be a Go/No-Go gate for tool response sanitization verification.

### 9. Future Vision (Lines 452-458) — Score: 8/10

**Strengths:**
- Reasonable v4+ items that set expectations
- Redis deferred is consistent with earlier mentions

**Issues:**
- None significant

### 10. MISSING SECTION: Dedicated Risks Analysis — Score: N/A (ABSENT)

The Brief has risk comments in HTML comments (lines 59-65) and scattered risk flags (Sprint 3 blocker, Sprint 4 asset gate), but **NO dedicated Risks section** in the body. A product brief should have an explicit risks table with:
- Risk description
- Probability (H/M/L)
- Impact (H/M/L)
- Mitigation strategy

Key risks that should be documented:
1. PixiJS 8 learning curve (new dependency, no team experience)
2. n8n Docker resource consumption on VPS
3. Reflection LLM cost explosion (agent count × observation volume × frequency)
4. Asset creation timeline (AI-generated pixel art quality uncertainty)
5. **Tool response prompt injection** (ECC 2.1 — critical for agent platform)
6. Theme decision delay cascading to all sprints

---

## ECC Gaps Check (Part 2 ideas → Brief coverage)

| ECC Idea | Brief Coverage | Gap? |
|----------|---------------|------|
| 2.1 Agent Security Framework | Only n8n port security mentioned | **YES — CRITICAL**: Tool response prompt injection defense missing. CORTHEX agents run with user CLI tokens = "root access agent" pattern. Brief should add security layer to scope or at minimum flag as risk. |
| 2.2 Cost-Aware LLM Pipeline | Partially covered (Tier limits, Reflection cost) | **MINOR**: Immutable cost tracking pattern not mentioned |
| 2.3 Continuous Learning | Memory 3-stage is in Brief | **YES — IMPORTANT**: observations table should include `confidence` (0.3~0.9) and `domain` fields per ECC instinct pattern |
| 2.4 AI Regression Testing | Not in Brief | **MINOR**: "Capability Eval" metric would strengthen Layer 4 success criteria |
| 2.5 Blueprint (Context Brief) | Not in Brief | No — this is pipeline-level, not product-level |
| 2.6 Search-First | Not in Brief | No — this is Stage 1 Technical Research |
| 2.7 Agent Harness (tool response standardization) | Not in Brief | **MINOR**: Could be mentioned as Layer 4 enhancement |
| 2.8 Chief-of-Staff pattern | Not directly | No — already exists in v2 비서 agent |

---

## Stale References Summary

| Line | Current Text | Should Be |
|------|------------|-----------|
| 88 | "디자인 도구: **Subframe**(메인)" | "디자인 도구: **Stitch 2**(메인)" |
| 187 | "Subframe(메인 디자인)" | "Stitch 2(메인 디자인)" |
| 355 | "Subframe 기준 대비 구현 일치율" | "Stitch 2 기준 대비 구현 일치율" |
| 378 | "(Subframe 아키타입 선택)" | "(Stitch 2 아키타입 선택)" |
| 388 | "Subframe 기반 디자인 시스템" | "Stitch 2 기반 디자인 시스템" |
| 391 | "Subframe 기준 대비" | "Stitch 2 기준 대비" |
| 125 | "14개 WebSocket 채널" | "16개 WebSocket 채널" |
| 173 | "기존 14채널에 /ws/office 채널 1개 추가" | "기존 16채널에 /ws/office 채널 1개 추가" |
| 420 | "기존 14 → 15" | "기존 16 → 17" |

### WebSocket Channel Count Correction (CODE-VERIFIED)
The v2 audit (`v3-corthex-v2-audit.md`) listed 14 channels, but the actual code (`packages/shared/src/types.ts:484-500`) defines **16 channels**:
1. chat-stream, 2. agent-status, 3. notifications, 4. messenger, 5. conversation, 6. activity-log, 7. strategy-notes, 8. night-job, 9. nexus, 10. command, 11. delegation, 12. tool, 13. cost, 14. debate, **15. strategy**, **16. argos**

The audit missed `strategy` and `argos`. The Brief inherited this error.

### "OpenClaw" Codename — CEO DECISION: DROPPED (2026-03-21)
**사장님 결정**: "OpenClaw" 코드네임 전면 폐기. 실제 OpenClaw 오픈소스(228K stars)와 무관하며 혼동 유발.
- v3 전체 명칭: "CORTHEX v3" (코드네임 없음)
- PixiJS 가상 사무실 기능: "Virtual Office" 또는 "가상 사무실"
- Brief 내 **15곳**에 "OpenClaw" 참조 → 전부 수정 필요:
  - Lines 36, 79: 문서 제목/첫 문장 — `v3 "OpenClaw"` → `v3`
  - Lines 83, 167, 332, 383, 417: `OpenClaw 가상 사무실` → `Virtual Office (가상 사무실)`
  - Line 171: `OpenClaw는 실제...` → `Virtual Office는 실제...`
  - Line 187: `OpenClaw 픽셀 감성` → `Virtual Office 픽셀 감성`
  - Line 372: `v3 "OpenClaw" 단일 릴리즈` → `v3 단일 릴리즈`
  - Line 393: `v3 아이덴티티(OpenClaw 감성)` → `v3 아이덴티티(Virtual Office 감성)`
  - Line 455: `OpenClaw 멀티플레이어` → `Virtual Office 멀티플레이어`
  - Lines 7, 16: 파일 경로 참조 — 파일명 자체는 변경 불가(기존 문서), 하지만 본문 언급은 수정

---

## Issue Summary

### CRITICAL (Must fix before PRD)
1. **15x "OpenClaw" → drop codename**: CEO 결정 — "OpenClaw" 코드네임 전면 폐기. v3 = "CORTHEX v3", PixiJS 기능 = "Virtual Office". 15곳 수정 필요.
2. **6x Subframe → Stitch 2 stale references** (lines 88, 187, 355, 378, 388, 391)
3. **WebSocket channel count wrong**: Brief says 14, actual code has **16** (missed `strategy` + `argos`). Lines 125, 173, 420 all wrong.
4. **Missing Risks section** — scattered risk flags exist but no dedicated section
5. **Missing agent security risk from ECC** — tool response prompt injection unaddressed
6. **Embedding provider unspecified** — must be Voyage AI per key constraint, not left ambiguous

### IMPORTANT (Should fix)
6. **Page count error** — Admin +2 (not +1), total 74 (not 73)
7. **ECC observations schema gap** — confidence + domain fields for observations table
8. **No sprint duration estimates** — no time dimension in sprint order table
9. **Layer 0 "60%" gating metric undefined** — what does 60% measure?
10. **Missing Go/No-Go gate for agent security** — prompt injection verification
11. **"OpenClaw" naming confusion** — shares name with 228K-star open-source project. Brief should clarify it's a codename.

### MINOR (Nice to fix)
12. Line 90: leftover Step 4 pipeline reference
13. Line 435: "외부 구매" → "유료 에셋 구매" for clarity
14. ECC Capability Eval metric could strengthen Layer 4 success criteria
15. v2 failure lesson (실사용 못 하고 폐기) not explicitly acknowledged beyond UXUI

---

## Overall Assessment

The Brief is **solid and well-structured**. The 4-layer architecture is clearly defined, Zero Regression philosophy is consistent throughout, and the sprint order is dependency-aware. Target Users section is particularly strong with concrete personas and onboarding flows.

The biggest gap is the **6 stale Subframe references** — this is a factual error that would cascade into downstream documents (PRD, Architecture). The missing Risks section and unaddressed agent security (from ECC analysis) are the other critical items.

**Estimated score range: 7.5-8.0/10** — passes Grade A threshold after fixing the 4 critical issues.
