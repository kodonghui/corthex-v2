---
reviewer: critic-a
sections: step-07 (SaaS B2B Requirements) + step-08 (Project Scoping)
date: 2026-03-14
status: review-complete
---

# CRITIC-A Review: PRD Step-07 + Step-08
> Sections reviewed: lines 631–904 of prd.md
> Cross-reference: Product Brief (tools-integration/product-brief.md)

---

## Overall Scores

| Section | Score | Verdict |
|---------|-------|---------|
| Step-07: Multi-Tenant Architecture | 9/10 | Solid — company_id isolation complete, runtime credential isolation correct |
| Step-07: RBAC Matrix | 9/10 | 3-tier model accurate, engine-level enforcement specified |
| Step-07: Subscription & Pricing | 8/10 | BYOK model clear, Phase 2 undecided correctly noted |
| Step-07: External Integration Registry | 6/10 | **FAIL** — Notion/Playwright MCP Phase label contradicts all other sections |
| Step-07: Compliance Summary | 9/10 | 4-point summary matches Domain section |
| Step-07: Technical Architecture Considerations | 9/10 | Architecture phase deferrals appropriate |
| Step-08: MVP Strategy | 9/10 | Platform MVP type correct, scope decision reasoning solid |
| Step-08: Phase 1 Must-Have | 9/10 | 7 tools + infra + 5 routes accurate; fallback gap |
| Step-08: Post-MVP Roadmap | 7/10 | Phase 4 "병행 가능" contradicts dependencies |
| Step-08: Risk Mitigation | 8/10 | Good tables but Journey 6 fallback set incomplete |

**Overall Step-07+08 score: 8/10 — REQUIRES FIXES before approval**

---

## Issue 1 (HIGH — Step-07 External Integration Registry)
### Notion MCP + Playwright MCP labeled "Phase 1 PoC" — contradicts all other sections

**Location:** prd.md lines 732–733, MCP 서버 통합 우선순위 table

**PRD says (Step-07 table):**
```
| Notion MCP     | Phase 1 PoC | Internal Integration Token | 페이지 생성/검색 |
| Playwright MCP | Phase 1 PoC | 없음                       | 브라우저 자동화  |
```

**But every other section says Phase 2:**
- PRD Step-08 Post-MVP table (line 851): "MCP 서버 3종 | Notion MCP, Playwright MCP, GitHub MCP | Phase 2 | Phase 1 MCP 인프라 검증 후"
- Product Brief line 617: "Notion MCP, Playwright MCP, GitHub MCP | Phase 2 — MCP infrastructure ships Phase 1; **specific MCP server templates validated in Phase 2**"

**Problem:** "배포 Phase: Phase 1 PoC" means these are deployed in Phase 1 as a proof-of-concept. A developer reading this registry will implement Notion/Playwright MCP server templates in Phase 1, overscoping Phase 1 significantly. This directly contradicts the Phase 2 roadmap table and Product Brief.

The correct reading is: Phase 1 ships the **MCP infrastructure** (8-step engine pattern + Admin UI). Individual MCP server templates (Notion, Playwright) are validated in Phase 2 after the infrastructure is confirmed working.

**Required Fix:**
```
| Notion MCP     | Phase 2 (인프라: Phase 1) | Internal Integration Token | 페이지 생성/검색 |
| Playwright MCP | Phase 2 (인프라: Phase 1) | 없음                       | 브라우저 자동화  |
| GitHub MCP     | Phase 2                   | GitHub PAT                 | 코드 리뷰/PR    |
```
Add footnote: "*MCP 통합 엔진(8단계 패턴) + Admin UI는 Phase 1에 구축됨. 개별 MCP 서버 설정 템플릿은 Phase 2에서 파일럿사와 함께 검증*"

---

## Issue 2 (MEDIUM — Step-08 Phase 4 Roadmap)
### Phase 4 "Phase 1과 병행 가능" contradicts MCP dependency

**Location:** prd.md line 868, Phase 4 section header

**PRD says:**
> "Phase 4 — Platform (Phase 1과 병행 가능) — Phase 1과 독립 실행 가능"

**But dependency column says:**
- Naver Blog MCP, KakaoTalk MCP → 의존성: "Phase 1 MCP 인프라"
- Google Workspace MCP → 의존성: "Phase 2 MCP 에코시스템 확장 후"

**Problem:** If Naver/Kakao MCPs depend on Phase 1 MCP infra, they cannot start fully in parallel with Phase 1. "Phase 1과 병행 가능" creates a false expectation that Phase 4 work can begin immediately. Only Redis (D21 deferred) is truly Phase 1-independent.

**Required Fix:**
Change header and goal to:
> "Phase 4 — Platform — Redis 전환은 Phase 1과 병행 시작 가능. MCP 항목(Naver/Kakao/Google Workspace)은 Phase 1 MCP 인프라 완성 후 착수"

---

## Issue 3 (LOW — Step-08 Resource Risk Fallback)
### Journey 6 fallback requires `get_report` — not in minimum viable set

**Location:** prd.md line 901

**PRD says:**
> "최소 안전 범위: Admin UI 3개 + 도구 3개 (md_to_pdf + save_report + read_web_page) — Journey 2 + Journey 6 성립 가능"

**Problem:** Journey 6 (최민준 error recovery) requires `save_report` + `get_report` + `send_email`. The minimum set lists `save_report` but omits `get_report`. Without `get_report`, the partial failure recovery pattern (retrieve saved report → retry email) cannot function. Journey 6 cannot "성립" with only 3 tools.

**Required Fix (2 options):**
1. Add `get_report` to fallback: "도구 4개 (md_to_pdf + save_report + **get_report** + read_web_page)"
2. Remove Journey 6 from claim: "— Journey 2 성립 가능 (Journey 6은 get_report 추가 필요)"

---

## Section-by-Section Feedback

### John (PM) — Scoping and Completeness

**Multi-Tenant Architecture (9/10):**
5-table isolation is specific and correct — each table has a named isolation mechanism. `(company_id, key_name)` composite unique index on credentials is the right constraint (prevents same-name key across agents within one company, while also ensuring cross-company isolation). Runtime credential isolation at line 660 ("타 company credential 치환 구조적 불가") is the right architectural guarantee.

Minor: Audit log index at line 664 specifies `(company_id, timestamp DESC)`. For Phase 2 Audit Log UI, agent_id and tool_name filters will be common — Architecture phase should also plan `(company_id, agent_id, timestamp DESC)` and `(company_id, tool_name, timestamp DESC)`. Not blocking (Architecture phase handles this).

**Subscription & Pricing (8/10):**
BYOK + "미결 결정" framing is correct. $0 Phase 1 infrastructure cost supports the <30-min setup gate. Line 700: "R2 ~$0.015/GB/월 — 파일럿 3개사 기준 월 수 달러" — "수 달러" overstates actual cost (Phase 1 pilot: ~60MB total → $0.0009/month). Should say "월 $0.01 미만" for accuracy, but LOW priority.

**MVP Must-Have Tool Table (9/10):**
Gate contribution column is precise — each tool maps to a specific Go/No-Go Gate. `read_web_page` correctly shows "(R6 HIGH 리스크)". `upload_media` contribution says "publish_tistory 선행 필수 도구" — this is a dependency description, not a gate contribution. Better: "Activation Gate (Tistory 미디어 업로드 경로)".

**Phase 1 Out-of-Scope (9/10):**
7 items all have rationale. "3–4단계 call_agent 체인 PoC" deferred correctly (context overflow risk). "Firecrawl web_crawl — Jina Reader로 Phase 1 커버" is correct but creates a dependency on R6 (Jina no fallback) for the Phase 1 research pipeline. Tension noted but not a fix — the correct response is monitoring, already in R6.

### Sally (UX) — User Impact

**RBAC Matrix (9/10):**
Engine-level enforcement at lines 692-693 ensures security cannot be bypassed by UX. The 5-step Admin control flow (lines 685-689) maps exactly to Journey 1's Rising Action.

One addition: RBAC table covers agents only (Workers/Specialists/Managers). Human users appear in `/reports` (read-only, line 823) but not in the RBAC table. Should add row:
"Human (보고서 수신자) | 없음 | `/reports` read-only (company 스코프 필터)" — completes the access model.

**Admin UI 5 routes (9/10):**
Routes and purposes are correct. `/admin/mcp-servers` correctly attributed to 박현우. `/admin/agents/{id}/tools` lists both 박현우 and 김지은 — in practice only Admin-role users can toggle tools, but both personas need visibility. Acceptable.

### Mary (BA) — Business Case

**MVP "Platform MVP" Strategy (9/10):**
"한 번 구축 → Phase 2+ 적층" Platform MVP correctly frames the compounding investment value. The binary minimum useful definition (Journey 1 + Journey 2 success = Phase 1 complete) is measurable and defensible.

Validation learning objective (Tool Diversity Index Week 4 ≥6) ties Phase 1 to Phase 2 investment approval — this is the right PM gate.

**Phase 2 prerequisite for publish_x (9/10):**
"파일럿사 $200/월 수용 의사 있는 곳 확인 후 결정" — correct market gate. The cost governance decision is correctly deferred to user validation rather than assumed.

---

## Cross-Check Results

| Check Item | Result |
|-----------|--------|
| 5 new tables all have company_id isolation specified | ✓ |
| RBAC 3-tier + engine-level enforcement | ✓ Matches E8 architecture boundary |
| BYOK model + Phase 2 billing undecided | ✓ Correctly framed |
| Phase 1 7 tools in Must-Have table | ✓ Matches Product Brief |
| Notion/Playwright MCP Phase label | ✗ "Phase 1 PoC" contradicts Phase 2 everywhere |
| Phase 4 "병행 가능" vs MCP dependency | ✗ Contradictory for MCP items |
| Journey 6 fallback tool set completeness | ✗ `get_report` missing |
| Phase 2 publish_x prereq | ✓ "$200/월 수용 확인" |
| MCP infra fallback "Phase 1.5 분리" | ✓ Good contingency |
| Compliance 4 points match Domain section | ✓ |

---

## Summary of Required Fixes

| # | Priority | Section | Fix |
|---|----------|---------|-----|
| 1 | HIGH | Step-07 MCP registry (lines 732-733) | Notion/Playwright → "Phase 2 (인프라: Phase 1)" with footnote |
| 2 | MEDIUM | Step-08 Phase 4 header (line 868) | Clarify: Redis 병행 가능, MCP 항목은 Phase 1 완성 후 |
| 3 | LOW | Step-08 Fallback (line 901) | Add `get_report` or remove Journey 6 from fallback claim |
