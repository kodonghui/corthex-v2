---
step: prd-step07-08
reviewer: critic-b
date: 2026-03-14
sections: SaaS B2B Requirements (lines 631–762) + Project Scoping (lines 764–904)
---

# CRITIC-B Review: PRD Step-07 (SaaS B2B) + Step-08 (Scoping)

## Section Scores

| Section | Score | Verdict |
|---------|-------|---------|
| Multi-Tenant Architecture (Tenant Model) | 9/10 | ✅ Solid |
| RBAC Matrix | 7/10 | ⚠️ "by default" vs hard rule |
| Subscription & Pricing (BYOK) | 9/10 | ✅ Accurate |
| Integration Registry | 6/10 | ⚠️ Notion/Playwright Phase label wrong |
| Compliance Summary | 9/10 | ✅ Accurate |
| Technical Architecture Considerations | 9/10 | ✅ E8 boundary ref correct |
| MVP Strategy & Phase 1 Feature Set | 9/10 | ✅ Strong |
| Phase 1 Out-of-Scope table | 9/10 | ✅ Reasons accurate |
| Phase 2-3 Roadmap | 9/10 | ✅ Dependencies correct |
| Phase 4 | 4/10 | ❌ "병행 가능" claim factually wrong |
| Risk Mitigation tables | 9/10 | ✅ R6 Jina correctly included |

---

## Winston (Architect) — Architecture Consistency

**Finding 1 — CRITICAL: Phase 4 "Phase 1과 병행 가능" contradicts its own dependency column**

PRD line 868 header: "**Phase 4 — Platform (Phase 1과 병행 가능)**"
PRD line 870: "*(Phase 1과 독립 실행 가능)*"

But Phase 4 items (lines 874–876) have these listed dependencies:
| Item | Dependency in Table |
|------|-------------------|
| Naver Blog MCP, KakaoTalk MCP | **"Phase 1 MCP 인프라"** — needs Phase 1 complete |
| Redis 캐싱 레이어 (D21) | **"Phase 1 안정 후"** — needs Phase 1 complete |
| Google Workspace MCP | **"Phase 2 MCP 에코시스템 확장 후"** — needs Phase 2 complete |

All three Phase 4 items depend on either Phase 1 or Phase 2 being finished. None can start in parallel with Phase 1.

Product Brief confirms sequential ordering: line 633 — "Naver Blog / Kakao MCP | Phase 4+ — market validation needed before commitment"; line 634 — "Redis cache | Phase 4 — D21 deferred; current in-memory + DB cache sufficient for Phase 1–3 load."

"Phase 1–3 load" language explicitly says Redis is not needed until Phase 1–3 are complete — it cannot be parallel to Phase 1.

**The "Phase 1과 병행 가능" header is factually wrong and will mislead sprint planning.** A PM reading this will schedule Naver MCP work during Phase 1, violating its own dependency.

Fix: Change line 868 to: "**Phase 4 — Platform (Phase 3 완료 후 순차, 일부 Phase 3와 병행 가능)**"
Change line 870 to: "*(목표: 한국 플랫폼 확장 + 성능 인프라 고도화 — Phase 1 MCP 인프라 및 Phase 2 에코시스템 완료 후 착수)*"

---

## Amelia (Dev) — Implementation Complexity

**Finding 2 — HIGH: Notion/Playwright MCP labeled "Phase 1 PoC" in Integration Registry conflicts with Phase 2 delivery**

PRD Integration Registry table (lines 732–733):
```
| Notion MCP     | Phase 1 PoC | ...
| Playwright MCP | Phase 1 PoC | ...
```

Product Brief line 617: "Notion MCP, Playwright MCP, GitHub MCP | **Phase 2** — MCP infrastructure ships Phase 1; specific MCP server templates validated in Phase 2"

The Integration Registry is under the header "MCP 서버 통합 우선순위 (Admin UI에서 동적 추가)" — a user-facing delivery list. "Phase 1 PoC" in this context implies deliverable to users in Phase 1. But the Brief and Product Scope are explicit: user-facing Notion/Playwright MCP templates are Phase 2.

Practical risk: A dev reading the Integration Registry would sprint-plan Notion/Playwright MCP as Phase 1 deliverables, conflicting with the Product Scope section which lists only MCP infrastructure (not specific server templates) in Phase 1.

Fix: Change Integration Registry Phase column:
- Notion MCP: "Phase 2 (Phase 1에서 엔지니어링 PoC — 사용자 미배포)"
- Playwright MCP: "Phase 2 (Phase 1에서 엔지니어링 PoC — 사용자 미배포)"

---

## Quinn (QA) — Edge Cases & Coverage

**Finding 3 — MODERATE: Workers "MCP 없음" presented as hard rule vs Brief's "by default"**

PRD RBAC Matrix line 680:
> "Workers (실무자) | Admin이 allowed_tools에 허용한 도구만 | **MCP 없음 — Tier 2+ 전용 고급 기능**"

Product Brief line 185:
> "Agent-tier access control: Workers — **no MCP access by default**"

Brief uses "by default" — Admin override possible. PRD presents it as a categorical hard rule.

These are meaningfully different for engine implementation:
- **Hard rule (PRD):** engine-level block regardless of `agent_mcp_access` table entries
- **By default (Brief):** `agent_mcp_access` table can have Workers entries if Admin explicitly grants

The Architecture phase needs a definitive answer on this contract.

Fix: Add clarification: "MCP 없음 (기본값 — Architecture phase에서 hard block vs. configurable default 결정 필요). 현재 권고: Workers에 MCP 접근 부여 불가 (engine-level enforcement, `agent_mcp_access`에서 Workers 에이전트 진입 차단)."

---

## Bob (SM) — Scope Realism

**Finding 4 — VERIFIED: publish_x Phase 2 downgrade rationale accurate** ✅
Line 777 matches Brief line 615 exactly.

**Finding 5 — VERIFIED: Phase 1 Out-of-Scope (7 items) all have accurate reasons** ✅
All match Brief lines 611–615, 613, 644.

**Finding 6 — VERIFIED: Resource risk minimal scope fallback is concrete** ✅
Line 901 defines a viable minimum: Journey 2 + Journey 6 deliverable with 3 admin routes + 3 tools.

---

## Summary: Issues Requiring Fixes

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Lines 868+870 | Phase 4 "Phase 1과 병행 가능" — contradicted by own dependency column + Brief. All Phase 4 items need Phase 1+ or Phase 2+ complete |
| 2 | HIGH | Lines 732–733 | Notion/Playwright MCP "Phase 1 PoC" in user-facing delivery table — Brief says Phase 2 user delivery |
| 3 | MODERATE | Line 680 | Workers "MCP 없음" as hard rule vs Brief's "by default" — affects engine implementation contract |

**Total: 3 issues (1 critical, 1 high, 1 moderate)**

---

## Verified Items (no fixes needed)

| Item | Verdict |
|------|---------|
| 5 신규 테이블 company_id 격리 | ✅ All correct |
| getDB(ctx.companyId) 전용 접근 | ✅ E8 consistent |
| BYOK Phase 1 $0 비용 | ✅ Jina free + Puppeteer local |
| Phase 2 Firecrawl/Replicate 과금 미결 | ✅ Correctly deferred |
| Integration Registry Phase 1 (4 services) | ✅ All accurate |
| Integration Registry Phase 2 (5 services) | ✅ All accurate |
| Phase 4 dependency column (correct content) | ✅ Items are correctly described; only the header is wrong |
| Compliance 4-point summary | ✅ All match Domain Requirements |
| E8 경계 준수 (agent-loop.ts) | ✅ Line 758 correct |
| Phase 2–3 roadmap dependencies | ✅ All prerequisite conditions accurate |
| Risk tables (R6 Jina = Phase 1 HIGH) | ✅ Correctly prioritized |

---

## Context

Project type: `saas_b2b` (40%) + `developer_tool` (30%) + `web_app` (30%)
Brownfield Feature Expansion — CORTHEX v2 Epic 1–15 위에 18개 신규 도구 추가.
Platform: ARM64 24GB VPS, PostgreSQL + Drizzle ORM, Hono+Bun, React+Vite.

### Step 07 Key Claims to Verify

1. **Tenant Model** — 5개 신규 테이블 (`credentials`, `mcp_server_configs`, `agent_mcp_access`, `reports`, `content_calendar`) 각각 company_id 격리 방식 명시됨. `getDB(ctx.companyId)` 패턴 + 직접 `db` import 금지 참조.
2. **RBAC Matrix** — 3계층 (Company 수준 / 에이전트 수준 / MCP 접근 수준) + Tier별 MCP 접근 (Workers: MCP 없음 / Specialists: 부서 MCP / Managers: 전체 + call_agent)
3. **Subscription** — Phase 1 BYOK $0 추가 비용. Phase 2+ Firecrawl $99/월, Replicate 실행당 과금 → 미결 결정으로 처리.
4. **Integration List** — Phase 1: 4개 (Tistory, Jina, R2, Puppeteer) / Phase 2: 5개 추가 / MCP 4개. 기존 Domain Requirements와 중복 없이 보완.
5. **Compliance** — 4가지 포인트 요약 (PIPA, ToS, credential 보안, 저작권). 전체 상세는 Domain Requirements 섹션 참조.

### Step 08 Key Claims to Verify

1. **MVP Philosophy** — "Platform MVP" (단일 기능 검증 아님). publish_x Phase 2 하향 근거($200/월 비용 게이트) 명시됨.
2. **Journey 커버리지** — Phase 1: Journey 1, 2, 3, 6. Phase 2: Journey 4, 5 (이전 step-04 결정과 정합성)
3. **Out-of-Scope 목록** — 7개 항목 명시적 제외 + 이유 컬럼 포함.
4. **Phase 2/3/4 경계** — Phase 2 전제 조건 컬럼 명시. Phase 4가 Phase 1과 병행 가능하다는 주장 (기존 frontmatter `parallelizable: "phase4 alongside phase3"`와 일치 확인 필요).
5. **Risk Mitigation** — 기술 4개 / 시장 3개 / 자원 3개 시나리오. Phase 1 최소 안전 경계 ("3개 Admin UI + 3개 도구") 명시됨.

---

## Review Request

Please perform an adversarial review of steps 07+08 content and provide:
1. **Critical issues** (factual errors, contradictions with established decisions)
2. **High issues** (missing required content, Phase labeling errors)
3. **Moderate issues** (insufficient specificity, logic gaps)
4. **Low/Recommendations** (clarity improvements)

**Minimum pass score: 7.0/10**

**Special focus:**
- Phase 4 병행 가능 주장이 frontmatter `parallelizable: "phase4 alongside phase3"` (Phase 3와 병행)와 모순 없는지
- RBAC matrix에서 Workers가 "MCP 없음"이라는 결정의 소스 명시 여부 (product-brief 근거 확인)
- subscription_tiers에서 "미결 결정"으로 처리한 항목이 PRD 범위 내 해결 가능한 것들인지 확인
- Phase 1 최소 안전 경계 ("Admin UI 3개 + 도구 3개")가 Journey 2 + Journey 6만 지원한다는 주장의 논리적 정확성
