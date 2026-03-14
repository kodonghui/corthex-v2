---
reviewer: critic-a
sections: step-05 (Domain Requirements) + step-06 (Innovation & Novel Patterns)
date: 2026-03-14
status: review-complete
---

# CRITIC-A Review: PRD Step-05 + Step-06
> Sections reviewed: lines 422–610 of prd.md
> Cross-reference: Product Brief (tools-integration/product-brief.md)

---

## Overall Scores

| Section | Score | Verdict |
|---------|-------|---------|
| Step-05: Compliance & Regulatory | 8/10 | Solid — PIPA scope reasonable, platform constraints accurate |
| Step-05: Technical Constraints | 8/10 | Good — Puppeteer cap formula correct but 30% allocation factor unjustified |
| Step-05: Integration Requirements | 9/10 | Auth flow table complete, R2 public URL requirement correctly specified |
| Step-05: Risk Mitigations (R1–R5) | 7/10 | R1–R5 accurate but missing R6 for Phase 1 critical Jina dependency |
| Step-06: Innovation Patterns | 7/10 | Strong framing but MCP initialize handshake omitted — implementation error |
| Step-06: Market Context | 9/10 | Competitive table specific and accurate |
| Step-06: Validation + Innovation Risks | 8/10 | Gates tied to step-03 metrics ✓, missing context overflow risk |

**Overall Step-05+06 score: 8/10 — REQUIRES FIXES (2 issues before approval)**

---

## Issue 1 (MEDIUM — Step-06 Innovation 2)
### MCP `initialize` handshake missing from SPAWN→DISCOVER pattern

**Location:** prd.md lines 541–552, Manual MCP Integration Pattern

**PRD says:**
```
1. SPAWN: child_process.spawn(command, args, { env: resolvedCredentials })
2. DISCOVER: JSON-RPC tools/list → MCP 도구 스키마 수집
```

**MCP specification requires (before `tools/list`):**
```
initialize request  → { protocolVersion, capabilities, clientInfo }
initialize response ← { protocolVersion, capabilities, serverInfo }
initialized notification → {} (client confirms)
tools/list request → (can now be sent)
```

**Problem:** The MCP protocol spec requires a 3-message `initialize` handshake before any `tools/list` call. Compliant MCP servers (Notion MCP, Playwright MCP, GitHub MCP) will reject a `tools/list` request sent without prior `initialize` — this is a protocol-level error, not a server-specific behavior.

This gap exists in **both** the Product Brief (line 155) and the PRD — the PRD faithfully reproduced the Brief's omission. However, since the PRD is the implementation contract that devs will build from, this needs to be corrected here even if the Brief has the same gap.

**Impact:** If devs implement exactly what the 6-step pattern describes, Notion MCP integration will fail at DISCOVER with a JSON-RPC error (method not supported without initialization). The implementation will need to debug this protocol requirement, which could delay Phase 1.

**Required Fix:**
Update the SPAWN→DISCOVER pattern:
```
1. SPAWN:     child_process.spawn(command, args, { env: resolvedCredentials })
1.5 INIT:     JSON-RPC initialize { protocolVersion, capabilities } →
              await initialized confirmation
              (required by MCP spec before tools/list)
2. DISCOVER:  JSON-RPC tools/list → MCP 도구 스키마 수집
```
Or inline: "DISCOVER: JSON-RPC `initialize` 핸드셰이크 완료 후 `tools/list` → MCP 도구 스키마 수집"

---

## Issue 2 (MEDIUM — Step-05 Risk Mitigations)
### Missing R6: Jina Reader Phase 1 critical dependency — no SLA, no fallback

**Location:** prd.md lines 492–513, Risk Mitigations section

**Current state:**
- R1: credential theft
- R2: Puppeteer OOM
- R3: MCP zombie process
- R4: Platform API policy change
- R5: CLI-Anything TypeScript validation

**Problem:** `read_web_page` (Jina Reader) is a **Phase 1 critical tool** used in:
- Persona value delivery Gate: "Hub 명령 → `read_web_page` × N → `save_report` → `send_email`"
- Journey 2 (CEO 김대표) core pipeline
- Journey 4 (`call_agent` chain's research step)

Yet the PRD acknowledges at line 464: "Jina SLA 미공개 → fallback 없음, 에이전트가 사용자에게 안내" — and does not have a formal risk entry for this. Since `read_web_page` is in the Persona value delivery Go/No-Go Gate, a Jina Reader outage during Phase 1 evaluation directly fails the gate. This is more critical than R4 (API policy change) or R5 (Phase 3 concern).

**Required Fix:**
Add R6:

**R6: Jina Reader 서비스 장애 (MEDIUM — Phase 1 임계 리스크)**
- 위협: `r.jina.ai` 서비스 장애 또는 무단 트래픽 차단 → `read_web_page` 100% 실패. Phase 1 Gate 5(Persona value delivery)가 Jina 가용성에 직접 의존
- 완화: Phase 1 허용 fallback: `read_web_page`가 Jina 실패 시 직접 HTTP GET + `cheerio` HTML 파싱으로 자동 전환 (API 키 불필요, 동일 URL 대상). 성공률 낮음 (JS 렌더링 불가) — 에이전트에게 "간소화 버전" 경고 포함 응답. Jina 복구 후 재시도 제안
- 탐지: `read_web_page` p95 latency >15초 또는 연속 3회 실패 → Jina 장애 알림

---

## Issue 3 (LOW — Step-06 Innovation Risks)
### `call_agent` full context passthrough — context overflow risk not listed

**Location:** prd.md lines 597–610, Innovation Risk Mitigation section

**PRD Innovation 1 claims (line 531):**
> "call_agent 핸드오프에서 전체 대화 컨텍스트 하위 에이전트로 전달" — listed as key differentiator vs n8n

**Problem:** The PRD positions full context passthrough as a competitive advantage but doesn't list the corresponding risk: in deep `call_agent` chains (director → copywriter → publisher → reporter = 4 levels), the accumulated conversation context can approach or exceed Claude's context window limit. This is a known LLM orchestration challenge that will manifest when Journey 4's marketing campaign chain runs with rich content.

**Impact:** LOW for Phase 1 (most Phase 1 chains are 1–2 levels). Becomes MEDIUM by Phase 2 when multi-agent publishing chains are standard. Worth surfacing now while architecture decisions are being made.

**Required Fix:** Add to Innovation 1 Risk Mitigations:

**Innovation 1 위험 — call_agent 깊은 체인의 컨텍스트 오버플로:**
- 위험: director → copywriter → publisher → reporter 4단계 체인에서 누적 대화 컨텍스트가 Claude 컨텍스트 윈도우에 근접 → 상위 체인 컨텍스트 잘림
- 완화: call_agent 핸드오프 시 전체 컨텍스트 대신 "요약 컨텍스트" 전달 옵션 제공 (Architecture phase 설계). Phase 1은 2단계 체인 이하로 제한 → 안전. Phase 2 다단계 체인 설계 시 Architecture phase에서 컨텍스트 압축 전략 결정

---

## Issue 4 (LOW — Step-05 Technical Constraints)
### Puppeteer concurrency cap: 30% RAM allocation factor unjustified

**Location:** prd.md line 459

**PRD formula:**
```
Math.floor(24GB × 0.3 / 200MB) ≈ 36개 → 실질 한도 ≤10개
```

**Problem:** Two sub-issues:
1. The 30% RAM allocation factor (24GB × 0.3 = 7.2GB for Puppeteer) is not explained. Why 30%? The Brief (line 113) references "20 concurrent session max per E-constraint" for the whole engine, but doesn't give a Puppeteer-specific percentage.
2. The jump from 36 theoretical → ≤10 practical (72% reduction) is explained only as "다른 서비스 감안" — no breakdown of what those services consume. Architecture team cannot validate this recommendation without knowing the RAM split.

**Not a blocker** (Architecture phase is required to confirm this), but the current wording creates false precision — the formula gives 36, then halves it to 10 without showing the math for other services.

**Suggested Fix:** Add brief: "(DB ~2GB + API 서버 ~1GB + MCP 프로세스 ~500MB × N + 버퍼 → Puppeteer 가용 실질 RAM ≈ 2GB → ≤10개 인스턴스. Architecture phase에서 정확한 프로파일링 필수)"

---

## Section-by-Section Feedback

### John (PM) — Domain + Innovation Value

**Compliance & Regulatory (8/10):**
PIPA scope is correctly framed: crawled data → company_id isolation, pdf_email recipient consent = Human responsibility. The "시스템 경계 외부" framing for email recipient consent is legally defensible — CORTHEX is the data processor, not the data controller for outbound distribution. Phase 2 OCR masking recommendation is appropriately deferred.

One improvement: The copyright section (line 441) says "에이전트 Soul에 인용 출처 명시 가이드라인 포함 권고" — this is correctly marked as a recommendation (권고), not a hard requirement. But it doesn't specify *where* this guidance is documented (Soul template? Admin onboarding guide?). Should add: "기본 Soul 템플릿에 저작권 가이드라인 포함" to make it actionable.

**Platform API constraints (9/10):**
- Tistory rate limit: "1초 간격 권고 + exponential backoff" — correct (rate limit undocumented, backoff is best practice)
- X 3,000 tweets/month + $200/월: matches Brief ✓
- Instagram 25 calls/hour + carousel R2 public URL dependency ✓
- YouTube 10,000 units/day, videos.insert=1,600, ~6 uploads/day math correct (10,000÷1,600=6.25≈6) ✓

One nuance missed: YouTube compound quota consumption — thumbnail upload adds extra units on top of videos.insert. Total per upload is closer to 1,650–1,700 units when thumbnails.set is included (~5.8 uploads/day). This is borderline LOW, noting for architect awareness.

**Innovation competitive table (9/10):**
The n8n/Make.com/Zapier comparison is specific and accurate — "에이전트가 자연어 명령에서 도구 순서 스스로 결정" vs "사람이 GUI에서 노드 연결" captures the genuine architectural difference. The "도구 추가" row slightly overstates: MCP tools need explicit `agent_mcp_access` assignment, they don't automatically reach "모든 에이전트." Acceptable simplification for the comparison table.

### Sally (UX) — User Impact

**Integration Requirements auth table (9/10):**
Admin difficulty ratings (낮음/중간/높음) are accurate from user experience:
- Instagram "높음" is correct — Facebook Business Manager + Instagram Business Account + Graph API token = 3 separate external systems
- YouTube "높음" is correct — Google Cloud Console + OAuth consent screen approval can take days
- No UX issue here, these ratings will set correct expectations.

**R2 public URL security trade-off (8/10):**
Line 490: "에이전트가 업로드하는 파일은 공개 마케팅 미디어만으로 제한 권고" — this is the right guidance but it's a recommendation, not enforcement. A dev might implement `upload_media` to accept any file, including internal documents. Should add: "upload_media 입력 검증: file MIME type 화이트리스트 (image/jpeg, image/png, image/gif, video/mp4만 허용)" as a constraint, not just a recommendation.

### Mary (BA) — Business Justification

**Innovation 3 Compounding Value (7/10):**
The combinatorics claim "7개 Phase 1 도구 = 7! / (7-2)! = 42가지 2-도구 체인" is mathematically correct (7×6=42 ordered pairs) but is a vanity metric — most combinations are nonsensical (e.g., `list_reports` → `publish_tistory` without any content generation step). The real moat argument should focus on the **persona pipeline combinations** demonstrated in the journeys, not the combinatorial count.

The compounding value is real, but the math formula creates a "wow factor" that business analysts will question. Replace with: "7개 도구 × 핵심 파이프라인 패턴 3가지(research→report, content→publish, ARGOS→schedule) = Phase 1만으로 CEO·마케터·리서처 3개 페르소나의 주요 업무 자동화 가능"

---

## Cross-Check Results

| Check Item | Result |
|-----------|--------|
| PIPA scope (crawled data + pdf_email distribution) | ✓ Reasonable — company_id isolation + Human responsibility framing |
| Tistory/X/Instagram/YouTube API constraints vs research | ✓ All match Product Brief |
| YouTube quota math (10,000 units / 1,600 = ~6/day) | ✓ Correct |
| Puppeteer 24GB RAM formula (theoretical) | ✓ Correct (30% × 24GB / 200MB = 36) |
| Puppeteer ≤10 practical cap | ⚠ Justification gap (30% factor unexplained) |
| R2 public URL for Instagram/YouTube | ✓ Correctly specified |
| R1–R5 completeness | ⚠ Missing R6 for Jina Phase 1 critical dependency |
| MCP 6-step pattern namespacing | ✓ "notion__create_page" double-underscore correct |
| MCP initialize handshake | ✗ MISSING — `initialize` before `tools/list` required by spec |
| cache_control + MCP claim | ✓ Accurate — messages.create() only, query() path cannot |
| Innovation validation gates → step-03 metrics | ✓ All 3 innovations tied to existing metrics |
| R2 public URL security recommendation | ⚠ Recommendation only — should be enforcement constraint |

---

## Summary of Required Fixes

| # | Priority | Section | Fix |
|---|----------|---------|-----|
| 1 | MEDIUM | Step-06 Innovation 2, line 545 | Add INIT step (initialize handshake) between SPAWN and DISCOVER |
| 2 | MEDIUM | Step-05 Risk Mitigations | Add R6: Jina Reader Phase 1 critical dependency with fallback |
| 3 | LOW | Step-06 Innovation Risk | Add call_agent context overflow risk |
| 4 | LOW | Step-05 Technical Constraints, line 459 | Add RAM breakdown justifying 30% → ≤10 cap |
