# [Critic-A Review] Phase 0 Step 1 — CORTHEX Technical Spec

> Reviewed: `_corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md` (lines 1–817)
> Cross-checked: `v1-feature-spec.md`, `prd.md`, `packages/app/src/App.tsx`, `packages/admin/src/App.tsx`, `packages/server/src/routes/**`
> Reviewer roles: Sally (UX), Marcus (Visual), Luna (Brand)

---

## Agent Discussion (in character)

**Sally:** "OK so I'm a CEO who just started using CORTHEX for the first time. I open the Hub page — what do I see? The spec tells me there are components called `chat-area` and `session-panel` (lowercase, Section 2.4). Are those component names? File names? I genuinely can't tell. More importantly: where is the *navigation sidebar*? Which of the 29 pages appear in the nav? In what order? What groups them? A designer cannot design a navigation system from 'here is a list of 29 pages.' That's the single biggest blocker for me."

**Marcus:** "The spec documents *what* pages exist but not *how to visually prioritize* them. Hub, Dashboard, NEXUS, AGORA — these are the crown jewels of this product, but the spec gives them the same treatment as the Settings page. There's zero visual hierarchy signal here. And the Tracker — the real-time handoff chain visualization — is CORTHEX's most visceral UI moment, but it only gets one sentence buried in Section 8.3. I need to know: is it a sidebar panel? An overlay? A collapsible drawer? That affects the entire Hub layout."

**Luna:** "CORTHEX's brand DNA is 'military precision meets AI intelligence' — section names like '사령관실' and 'ARGOS' and 'AGORA' establish this. But the spec doesn't explain how those Korean/codename terms should surface in the UI. Is '사령관실' replaced by 'Hub' everywhere in v2? PRD says yes — 허브(Hub), 라이브러리(Library), 티어(Tier) — but the spec never instructs designers on which terminology wins. A designer is going to have to guess whether to write 'Hub' or '허브' or '사령관실' on the button. That's a brand identity crisis waiting to happen."

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | CRITICAL | Sally | **Navigation sidebar structure is completely absent.** The spec lists 29 app pages and 21 admin pages, but provides no information about which pages appear in the sidebar, their display order, grouping (e.g., "Workspace / Operations / Intelligence"), or what icons they use. A designer cannot create the information architecture without this. | Add Section 9: Navigation Structure — list sidebar items, groups, order, and icon names for both app and admin. |
| 2 | HIGH | Sally | **`/admin/audit-logs` route exists in the codebase but is not documented.** `packages/server/src/routes/admin/audit-logs.ts` is a real implemented route with `GET /api/admin/audit-logs` (companyId/action/targetType filters, paginated), but it appears nowhere in Section 3 (Admin Pages) or Section 4 (API Endpoint Map). A designer who is unaware of this page will not design a screen for it. | Add Section 3.22: `/admin/audit-logs` — Audit log browser (action/targetType/date range filter, paginated table). |
| 3 | HIGH | Marcus | **Tracker UI (핸드오프 트래커) has no dedicated screen specification.** PRD defines Tracker as "핸드오프 실시간 추적 UI" — a core v2 concept. Section 2.4 only says "Real-time handoff chain tracking." A designer must know: is Tracker a sidebar panel alongside the chat? A bottom timeline bar? A collapsible drawer? Does it show as a tree or linear chain? Section 8.3 has a text flow diagram but no structural guidance. | Add a subsection under 2.4 (Hub): "Tracker Panel" — describe placement (sidebar/drawer/overlay), data shape (from→to→depth chain), and visual pattern (timeline/tree). |
| 4 | HIGH | Luna | **Display terminology (Korean vs English) never resolved.** PRD Section defines 허브(Hub), 라이브러리(Library), 티어(Tier) as the canonical v2 terms. But the spec uses both interchangeably: Section 2.4 title says "Hub (사령관실 / Command Hub)" — three names for one screen. Designers will not know what to write in UI labels, breadcrumbs, or page titles. | Add Section 8.6: UI Terminology Map — canonical display name for each screen (e.g., screen title = "Hub", sidebar label = "Hub", Korean subtitle optional in parentheses). |
| 5 | HIGH | Sally | **Non-responsive design constraint is not documented.** Memory explicitly states: "앱: Stitch 앱용 별도 (반응형 X)" — the app SPA is desktop-only, not responsive, designed specifically for Stitch. This is a critical design constraint that affects every layout decision. If a designer assumes mobile-first or responsive, they will produce unusable designs. | Add to Section 8 Design Constraints: "The app SPA (packages/app) is designed for desktop-only (min-width 1280px). Responsive/mobile layouts are out of scope. The admin SPA follows the same constraint." |
| 6 | MEDIUM | Marcus | **Component name casing is inconsistent in Section 2.4.** Hub page lists "chat-area, session-panel, tool-call-card, markdown-renderer" in kebab-case (file names), while other pages use PascalCase (e.g., Section 2.11: "ConversationsView, ConversationChat"). Designers and implementors need to know actual component names: `ChatArea`, `SessionPanel`, `ToolCallCard`, `MarkdownRenderer`. | Normalize all Key Components to PascalCase throughout Section 2. |
| 7 | MEDIUM | Sally | **Empty state, loading state, and error state patterns are undocumented.** Section 8.3 covers happy-path data flows. But a designer needs to know: what does the Hub show while `accepted` event has not arrived yet? What does the agent list look like if a company has 0 agents? What does the Knowledge page show for empty folder? These states are as important as the happy path. | Add Section 8.7: UI States Catalogue — for each major feature area, list the expected empty/loading/error state and any specific copy or visual cues. |
| 8 | MEDIUM | Luna | **Onboarding redesign scope is not constrained.** Memory states "랜딩 페이지 O, 온보딩 X (나중에)" — the onboarding page redesign is deferred. Yet Section 2.2 `/onboarding` and Section 3.21 `/admin/onboarding` are listed without any "out of scope for this redesign" marker. A designer reading the spec will assume both onboarding flows need to be designed. | Mark Sections 2.2 and 3.21 with "⚠️ DEFERRED — Not in scope for this redesign phase." |

---

## v1-feature-spec Coverage Check

**Features verified as documented in spec:**
- @mention routing → Section 2.4 + Section 8.1 ✅
- Slash commands (8 types) → Section 2.5 + Section 8.1 ✅
- Secretary auto-routing → Section 2.4 + 8.1 ✅
- Preset shortcuts → Section 2.4, Section 8.1 ✅
- Real-time handoff tracking (SSE/WebSocket) → Section 2.4, 6.1, 7.1 ✅
- 3-tier agent system → Section 2.27, 5.1 ✅
- Soul system → Section 3.11, 5.4, 6.1 ✅
- 125+ tools → Section 3.8, 5.3 ✅
- AGORA debate (2/3 rounds) → Section 2.21, 4.9 ✅
- Trading → Section 2.14, 4.12 ✅
- SketchVibe canvas → Section 2.13 ✅
- SNS multi-platform → Section 2.10 ✅
- Knowledge RAG → Section 2.23 ✅
- ARGOS cron → Section 2.19 ✅
- Batch job queue → Section 2.9 ✅

**Gaps found:**
1. **v1 "자율 딥워크" step visualization** — v1-feature-spec Section 2.4 describes agents doing multi-step autonomous work: 계획수립 → 데이터수집 → 분석 → 초안 → 최종보고서. There is no mention in the spec of how this multi-step progress should be visualized in the Hub or Jobs page. The spec shows SSE events (`accepted/processing/handoff/message/done`) but doesn't explain how to surface the *internal step progression* of a single agent's deep work.
2. **v1 "위임 체인 실시간 추적"** — v1-feature-spec says "비서실장 → CMO → 콘텐츠 전문가 실시간 추적". Section 2.4 says "Tracker" but no separate section exists for the Tracker component design. (Tied to Issue #3 above.)

---

## Cross-talk with Critic-B (Verified Additions)

After cross-checking Critic-B's findings against the actual codebase, the following issues are confirmed and added to this review:

| # | Severity | Source | Issue | Verification |
|---|----------|--------|-------|--------------|
| 9 | CRITICAL | Critic-B (confirmed by Critic-A) | **AGORA SSE endpoint is fabricated — wrong interaction model.** Spec Section 2.21 says "SSE real-time speech streaming" via `GET /api/workspace/debates/:id/stream`. This endpoint does NOT exist. `debates.ts` has 5 routes: POST / (create), POST /:id/start (async, JSON response), GET / (list), GET /:id (detail), GET /:id/timeline (replay, returns JSON array). AGORA is fully async/poll-based, not SSE. A designer building streaming speech animations will be wrong. | Confirmed: `packages/server/src/routes/workspace/debates.ts` — no stream handler |
| 10 | HIGH | Critic-B (confirmed by Critic-A) | **4 DB tables missing from Section 5:** `admin_sessions`, `invitations`, `employee_departments`, `notification_preferences`. All exist in `schema.ts`. Invitations drives employee invite UI. employee_departments drives dept assignment. notification_preferences drives Settings notifications tab. | Confirmed: `schema.ts` lines 95, 104, 120, 190 |
| 11 | MEDIUM | Critic-B (confirmed by Critic-A) | **RBAC terminology mismatch.** Spec Section 1.2 says roles are "super_admin / company_admin / ceo / employee" but DB enums are `user_role: ['admin','user']` and `admin_role: ['superadmin','admin']`. The spec terms are application-layer labels, not DB values. UI copy for role badges, access control labels must use application terms (CEO, Employee), not DB values. | Confirmed: `schema.ts` lines 6-7 |

**Critic-B cross-talk round 2 — additional alignment:**

- **Tracker placement confirmed as layout constraint, not design preference.** Critic-B's reasoning: a persistent w-80 right sidebar vs. flyout changes Hub's entire column math (2-column vs. 3-column layout). Chat-area width, input box sizing, agent picker panel all depend on this. Technical spec must resolve it. Agreed recommendation: **Tracker = persistent right sidebar in Hub, always visible during active session, collapses to icon when no active handoffs.** This is derived from the SSE/WebSocket data model — a live-updating component fights a modal/flyout pattern.

- **AGORA SSE confirmed aspirational/incorrect (not deferred).** `/:id/timeline` is designed for replay (returns pre-built event array), not live streaming. No planned `/stream` route found. Spec must say: "AGORA is polling-based — trigger via POST /:id/start → poll GET /:id for status → fetch GET /:id/timeline for speech replay."

- **Issue #1 (nav sidebar) confirmed by Critic-B.** They note "UXUI utility: 7.5/10 was too generous — designer actionability: 4/10 is more honest."

- **Issue #2 (/admin/audit-logs) confirmed by Critic-B** — they had missed it independently.

Combined count: 17 unique issues total (11 from Critic-A, 9 from Critic-B, 3 overlapping = 17 net unique). Spec is fundamentally sound architecturally but missing critical designer-facing structural information.

**Disagreements with Critic-B**: None on substance. Full alignment.

---

## Summary

The spec is **architecturally complete** — all 8 required sections exist and the codebase accuracy is high (routes, DB schema, SSE events all verified against real files). The critical failures are in **designer usability**: a designer can understand *what exists* but cannot begin layout work without the navigation structure (Issue #1), Tracker placement (Issue #3), responsive constraint (Issue #5), and terminology resolution (Issue #4). The missing `/admin/audit-logs` page (Issue #2) is a factual gap that will result in an undesigned screen.

**Total issues: 11 (1 CRITICAL fabrication, 6 HIGH, 3 MEDIUM, 1 LOW)**

**Overall spec quality score (pre-fix): 5.5/10**
- Architectural completeness: 7/10 (AGORA interaction model wrong, 4 DB tables missing)
- Codebase accuracy: 6/10 (fabricated SSE endpoint, RBAC naming mismatch)
- Designer actionability: 4/10 (no nav structure, no Tracker spec, no responsive constraint)

---

## Post-Fix Verification

### Issues Resolved ✅
| Issue # | Status | Notes |
|---------|--------|-------|
| A1 — Navigation sidebar | ✅ FIXED | Section 9 added. App sidebar: 4 groups (ungrouped/업무/운영/시스템), 27 items, exact icons. Admin sidebar: 18 items + footer. Width `w-60` (240px) confirmed. |
| A2 — /admin/audit-logs | ✅ FIXED | Section 3.22 added with full endpoint params. Added to Section 4.14 endpoint table. New DB section includes `audit_logs` table with column detail. |
| A3 — Tracker Panel | ✅ FIXED | Section 2.4.1 added. Placement: ~280px collapsible right panel. Data shape documented. Visual: vertical linear timeline with pulse + checkmark. Deep Work steps + cost badge. |
| A4 — UI Terminology Map | ✅ FIXED | Section 8.7 added. 15 screens with Page Title, Sidebar Label, Korean Subtitle. PRD canonical terms enforced. |
| A5 — Desktop-Only constraint | ✅ FIXED | Section 8.6 added. min-width 1280px, no mobile/responsive. |
| A6 — Component PascalCase | ✅ FIXED | Section 2.4 now lists `ChatArea`, `SessionPanel`, `ToolCallCard`, `MarkdownRenderer`. |
| A7 — UI States Catalogue | ✅ FIXED | Section 8.8 added. 8 feature areas × 3 states (empty/loading/error) with specific Korean copy. |
| A8 — Onboarding deferred | ✅ FIXED | Sections 2.2 and 3.21 marked ⚠️ DEFERRED with memory note. |
| A10 — 4 missing DB tables | ✅ FIXED | `admin_sessions` added to Section 5.1. `invitations`, `employee_departments`, `notification_preferences`, `audit_logs` added to new Section 5.6 with UI Impact column. |
| A11 — RBAC terminology | ✅ FIXED | Section 1.2 now has RBAC Role Mapping table: UX label → DB enum. "Never use `ceo` or `employee` in code-level role checks." |

### Issues NOT Fully Fixed ⚠️
| Issue # | Status | Remaining Problem |
|---------|--------|-------------------|
| A9 — AGORA SSE fabrication | ⚠️ PARTIAL | Section 4.9 and Section 7.1 correctly say "AGORA does NOT use SSE — polling only." But **Section 2.21** still says "SSE real-time speech streaming" and "SSE for speech streaming" (lines 233, 238). **Section 8.1** non-negotiable features table still says "✅ debates table + SSE." These 2 remaining SSE references in Sections 2.21 and 8.1 must be corrected. |
| A11 — RBAC in Section 8.3 | ⚠️ PARTIAL | The RBAC mapping table in Section 1.2 is excellent. However **Section 8.3** still says "Role check: super_admin > company_admin > ceo > employee" — using the wrong application-layer labels inconsistently. Should read "Role check: superadmin > admin (company) > user" to match DB enums, or cross-reference Section 1.2. |

### Verdict (Round 1)
**8 of my original issues fully fixed. 2 partial fixes remain (both AGORA SSE in Sections 2.21+8.1, RBAC in Section 8.3).**

**Post-fix score: 8.5/10**

---

## Post-Fix Verification — Round 2

### Newly fixed ✅
| Item | Status | Notes |
|------|--------|-------|
| Section 2.21 AGORA | ✅ FIXED | "Async polling-based (NOT streaming)" explicit. Full polling flow: POST / → POST /:id/start → poll GET /:id every 2s → GET /:id/timeline. Client-side typewriter animation noted correctly. |
| Section 2.4.1 Tracker Panel | ✅ FIXED | w-80 (320px) confirmed. **3-column layout constraint** explicitly stated: `[SessionPanel] [ChatArea flex-1] [TrackerPanel w-80]`. Visibility logic: collapses to icon-strip (w-12) when no handoffs, auto-expands on first handoff event. Step states: active/completed/failed. |

### Still not fixed ⚠️
| Item | Status | Remaining Problem |
|------|--------|-------------------|
| Section 8.1 line 811 | ⚠️ NOT FIXED | "AGORA group debate (2/3 rounds) \| ✅ debates table + **SSE**" — SSE still in the Non-Negotiable Features table. Minor but inconsistent with Sections 2.21, 4.9, 7.1. Change to "debates table + polling". |
| Section 8.3 line 854 | ⚠️ NOT FIXED | "Role check: super_admin > company_admin > ceo > employee" — inconsistent with the RBAC mapping table added in Section 1.2. Should read "superadmin > admin (company) > user — see Section 1.2 for UX label mapping." |

### Final Verdict
**9 of my 10 issues fully fixed. 2 minor inconsistencies remain (both are 1-line fixes in Sections 8.1 and 8.3).**

**Final score: 9/10** *(pending round 3 verification)*

---

## Post-Fix Verification — Round 3 (Final)

### All remaining issues resolved ✅
| Item | Status | Verification |
|------|--------|--------------|
| Section 8.3 Role check | ✅ FIXED | Now reads: `admin_role:'superadmin' > admin_role:'admin' (company) > user_role:'user' — see Section 1.2`. Correct DB enum labels. |
| Section 8.1 AGORA row | ✅ FIXED (was already fixed in round 2) | "debates table + async polling (POST /:id/start → poll GET /:id → render /:id/timeline)" — SSE fully removed. My round 2 verification was checking a stale file state. |

### FINAL VERDICT
**All 10 Critic-A issues fully resolved. Zero remaining issues.**

**FINAL SCORE: 10/10**
- Architectural completeness: 10/10
- Codebase accuracy: 10/10
- Designer actionability: 10/10
