# CRITIC-A Review: Product Brief Step 03 — Target Users
> Reviewer: Critic-A (John/Sally/Mary)
> File reviewed: `_bmad-output/planning-artifacts/tools-integration/product-brief.md` lines 242–391
> Date: 2026-03-14
> Reference: `_bmad-output/planning-artifacts/prd.md` personas

---

## Score: 7.5/10

---

## John (PM) — "WHY should the user care? Where's the evidence?"

**Positive:** The persona construction is strong on specificity — 김지은's pain ("2–3시간 every Friday that her agents theoretically completed in 30 minutes") is quantified, tool-specific, and believable. The Aha! Moment quotes ("지난주에 3시간 걸렸던 게 오늘은 0분이었다") are the kind of user insight that actually drives product decisions. Emotional payoffs are attached to specific features, not generic AI benefits.

**Issue 1 (HIGH — PRD Persona Gap): CEO 김대표 (1인 사업가) is not explicitly mapped.**
The PRD identifies CEO 김대표 as the #1 primary persona — "혼자 투자분석·마케팅·시스템관리를 해야 함. 코드 못해서 AI 조율 불가." This persona's core characteristic is that they ARE the admin, the Hub user, and the report consumer all at once — a solo operator who uses CORTHEX to replace an entire staff. In the brief, this role is split between 김지은 (admin setup) and 최민준 (research consumer), but neither is explicitly framed as "1인 사업가." The brief should either: (a) add a brief mapping note connecting 김지은 to CEO 김대표 from PRD, or (b) confirm that 김지은 IS the CEO persona equivalent. Without this, the PRD and brief have misaligned primary personas for an implementer reading both.

**Issue 2 (HIGH — Missing PRD Persona): 팀장 박과장 (team manager) is absent.**
PRD explicitly lists 팀장 박과장 as a distinct persona: "팀원 10명에게 AI 제공하고 싶지만 비용 통제·표준화 안 됨." For Tool Integration, this persona has specific needs — they want to standardize which tools are available to team members' agents without each person configuring their own credentials. The brief has admin personas but no "manager who governs tool access for a team" persona. This is a real user type whose absence means no PRD story will be created for the "per-department tool access control" requirement.

---

## Sally (UX) — "A real user would never do it this way."

**Positive:** The Admin setup journey (김지은, lines 345–357) is exactly the right format — sequential steps, time estimates, specific UI path, and a 19-minute total claim. This is what UX validation testing can be designed against. The 박현우 (technical admin) persona correctly identifies that his Aha! Moment is about configuration not requiring code deployment — "코드 한 줄 안 썼는데 에이전트한테 구글 워크스페이스가 붙었다" — which is a precise and testable UX claim.

**Issue 3 (MEDIUM — Unrealistic Time Estimate): Journey 1 MCP setup "4 min" (line 354) is not plausible for non-developer 김지은.**
The journey shows: "Admin → MCP Servers → Add Notion MCP → Test → Assign to reporter agent: 4 min." But 김지은 is explicitly a non-developer ("law or business degree, non-developer"). Setting up Notion MCP requires: finding the Notion integration page, creating a new internal integration, copying the integration token, then figuring out which Notion pages to grant access to. For a non-developer doing this for the first time, 15–20 minutes is realistic, not 4. Either correct the estimate or add a caveat: "4 min if Notion token is already available." A user testing this against a "19-minute onboarding" claim and taking 40 minutes will feel the product failed them.

**Issue 4 (MEDIUM — Missing Persona): External PDF report recipient is not covered.**
`save_report(distribute_to: ['pdf_email'])` is a defined feature — it emails a PDF to a stakeholder list. But there is no persona for the person RECEIVING that email. They never log into CORTHEX, they have no UI touchpoints, but they ARE a user of the system's output. For a B2B context (board member, investor, client), being the recipient of a well-formatted PDF from an AI agent is a meaningful trust signal. Even two sentences: "이사회 보고용 수신자 — receives branded A4 PDF, does not interact with CORTHEX, judges quality by PDF formatting and content accuracy" would complete the persona coverage. This person's needs drive the corporate CSS preset choice in md_to_pdf.

---

## Mary (BA) — "The business case doesn't hold."

**Positive:** Journey 2 (최민준 research pipeline, lines 361–387) is the brief's strongest business case moment. "Time from '경쟁사 분석해줘' to shareable PDF in stakeholder inbox: 4 minutes (was 2 hours manual)" — that's a 97% time reduction on a real, recurring task. This is the kind of ROI statement that justifies a purchase decision. The specific tool chain (read_web_page → web_crawl → save_report → md_to_pdf → send_email → Notion MCP) is traceable back to the actual tool inventory.

**Issue 5 (HIGH — Technical Inaccuracy in Journey): `read_web_page` URL parameter in Journey 2 (line 369) is wrong.**
```
→ read_web_page(url: "https://r.jina.ai/https://samsung.com/ai") × 3 sites
```
The `read_web_page` tool is defined as: "Jina Reader: `fetch('https://r.jina.ai/{url}')` → clean markdown." The tool INTERNALLY prepends the Jina Reader URL — the agent should call `read_web_page(url: "https://samsung.com/ai")`, not pass the full `r.jina.ai/...` URL. As written, an implementer reading this journey would build a tool that expects the raw target URL, but see this example and think the tool takes the pre-constructed Jina URL. It's a small but concrete mistake that creates an API contract ambiguity. Fix: `read_web_page(url: "https://samsung.com/ai")`.

**Issue 6 (LOW — Sparse Touchpoints): 이수진 (Marketing Team Lead) secondary persona has minimal tool-specific detail.**
이수진's touchpoints are listed as: Hub command, Reports page read-only view, content_calendar status tracking. But there's no example of what she actually sees in the Reports page or what she does when a publish fails. For a secondary persona this is borderline acceptable, but consider adding: what does the content_calendar output look like? Does she get a notification when publishing completes? A concrete "she sees a Slack notification from the reporter agent saying '블로그 5개, 인스타 3개 발행 완료'" would complete her journey.

---

## PRD Alignment Check

| PRD Persona | Brief Equivalent | Coverage | Gap |
|-------------|-----------------|----------|-----|
| CEO 김대표 (1인 사업가) | 김지은 (partial) | ⚠️ | Not explicitly mapped; 김지은 is Admin, CEO is Human-role user |
| 팀장 박과장 (team manager) | None | ❌ | Tool access governance for team not covered |
| Admin (시스템 관리자) | 박현우 (technical admin) | ✅ | Improved: split into 2 admin sub-types |
| 투자자 이사장 | 최민준 | ✅ | Correctly captured |
| External PDF recipient | None | ⚠️ | Minor gap — no persona for pdf_email recipients |

---

## Priority Issues for Writer

1. **[HIGH]** Add brief persona mapping note connecting brief personas to PRD personas (CEO 김대표 → 김지은 or new persona, 팀장 박과장 → new persona or note it's descoped)
2. **[HIGH]** Fix `read_web_page` URL in Journey 2 line 369: parameter should be the target URL, not the Jina-prefixed URL
3. **[MEDIUM]** Fix Journey 1 MCP setup time: "4 min" → "4 min (if Notion token ready) / ~20 min (first-time setup)"
4. **[MEDIUM]** Add 2-sentence "external report recipient" as a tertiary user note
5. **[LOW]** Add one concrete output touchpoint for 이수진 (e.g., completion notification format)

---

---

## Cross-Talk Update (with Critic-B)

**A1 — read_web_page URL bug [CONFIRMED CRITICAL by both critics]:**
Both critics independently flagged line 369. Passing the full `r.jina.ai/...` URL to `read_web_page` would cause the tool to double-prefix the URL and fail. Fix is one word: remove the Jina prefix from the parameter.

**B1 — CEO 김대표 missing [CONFIRMED HIGH by both critics]:**
Both critics independently flagged this as a PRD persona gap. Agreed: either add a brief mapping note or a 5th persona.

**Q2 — 이수진 `/admin/reports` RBAC violation [NEW — added from Critic-B]:**
Line 317 shows 이수진 (Human role user) accessing `/admin/reports`. Per PRD RBAC table, `CEO/Human (비서 있음)` row explicitly marks Admin panel access as ❌. Human role users cannot access `/admin/` routes. If the reports viewer is to serve Human role users (이수진, 최민준, CEO 김대표), it must be at a non-admin route (e.g., `/reports` or `/hub/reports`) with separate Human-accessible permissions. As written, 이수진 would be blocked from the reports feature that provides her primary value. Upgraded to HIGH.

**팀장 박과장 [CONFIRMED — Critic-B noted in B1 addendum, agrees it deserves separate treatment]:**
Critic-B initially lumped 팀장 박과장 under B1, but agrees this is a distinct PRD persona with a distinct Tool Integration story: per-department tool budgets and who can assign `publish_instagram`. Separate treatment required.

**Confirmed issues (both critics agree — all HIGH or CRITICAL):**
1. `read_web_page` URL parameter wrong — API contract error
2. CEO 김대표 not mapped — PRD primary persona gap
3. 이수진 `/admin/reports` RBAC violation — Human role blocked from admin routes
4. 팀장 박과장 absent — PRD standalone persona not covered

**Score: 7.5/10 (both critics aligned)**

---

*Review finalized: 2026-03-14 | Post-cross-talk version*
