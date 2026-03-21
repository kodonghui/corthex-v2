# Stage 0 Brief Review — Sally (UX Designer)

> Document: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
> Date: 2026-03-21
> Reviewer: Sally (UX Designer / Critic)
> Context read: product-brief, v3-openclaw-planning-brief, v3-corthex-v2-audit, v1-feature-spec, project-context.yaml, ECC analysis plan (Part 2), analyst review, updated analyst findings (WS count + naming)

---

## UX-Focused Section Analysis

### 1. Naming & Identity — CRITICAL UPDATE

**[CRITICAL — CEO DECISION] "OpenClaw" codename dropped (2026-03-21)**
- v3 전체 명칭: **"CORTHEX v3"** (코드네임 없음)
- PixiJS 가상 사무실 기능명: **"Virtual Office"** 또는 **"가상 사무실"**
- 이유: 실제 OpenClaw 오픈소스 프로젝트(228K stars)와 무관하며 혼동 유발
- Brief 내 **15곳** "OpenClaw" 참조 전부 수정 필요: 문서 제목(L36), Executive Summary(L79, L83), Layer 1 설명(L167, L171), Key Differentiators(L187), Sprint Order(L372, L383), Future Vision(L455) 등

**UX Impact**: The codename was deeply woven into the product's identity narrative ("OpenClaw 가상 사무실", "OpenClaw 감성"). Removing it requires rethinking how the Virtual Office feature is positioned — it loses its brand distinctiveness. "Virtual Office" is generic. The Brief should either find a new distinctive name or reframe the narrative around the feature's unique value (real-time agent visualization) rather than a brand name.

### 2. Target Users & Personas (Lines 191-314) — UX Score: 7.5/10

**Strengths:**
- Personas are concrete with names, ages, and roles (이수진 32세, 김도현 38세)
- Clear pain points aligned with v3 features ("다 똑같이 말한다", "텍스트 로그는 너무 기술적이다")
- Admin-first onboarding lesson from v2 is excellent UX thinking (line 193)
- 1인 창업자 edge case addressed (line 212)
- User journeys are step-by-step with clear progression

**UX Issues:**
- **[CRITICAL — MISSING] No "context of use" for personas**: Neither persona specifies device context (desktop only? tablet? mobile?), working environment (office desk? on-the-go?), or multitasking patterns. CEO 김도현 checking `/office` on a phone during commute is fundamentally different from desktop at office. This shapes responsive design decisions for ALL sprints.
- **[IMPORTANT — BROKEN FEEDBACK LOOP] Admin AHA moment (line 241)**: The AHA is "성실성 슬라이더를 1.0으로 설정한 에이전트가 체크리스트를 자동으로 작성하는 것을 확인하는 순간." But Admin sets the slider in the Admin app, then must switch to CEO app → initiate a conversation → observe the behavioral difference. This is an **indirect, multi-step AHA** that Admin may never experience in their own app. Compare to CEO AHA (line 279) which is immediate and visceral ("/office를 처음 열었을 때"). Admin needs a preview/demo mechanism within Admin app itself — e.g., a "Test personality" button that shows a sample response with the configured personality.
- **[IMPORTANT — MATH ERROR] Line 313**: "73개 예상" — Admin gets +2 new pages (n8n management + /office read-only per line 238), not +1. Total should be **74**, not 73. Agree with analyst.
- **[MINOR] Missing persona friction mapping**: What are Admin's frustrations *during* the onboarding wizard? What if Step 3 (에이전트 설정) is too complex with Big Five sliders? What if CEO gets impatient waiting for Admin setup?

### 3. AHA Moments — UX Score: 7/10

**Strengths:**
- CEO `/office` AHA (line 279) is genuinely compelling — "내 AI 팀이 실제로 일하고 있다는 걸 처음으로 '봤다'"
- Long-term memory AHA (line 281) addresses growth over time — good retention signal
- Layer-specific emotional triggers are well-defined

**UX Issues:**
- **[IMPORTANT — SCALE PROBLEM]** The `/office` WOW moment assumes a manageable number of visible agents. What happens with 20+ agents? 50? 100? **No cognitive load management is described**: no filtering, search, zoom, focus/detail view, or agent grouping by department. The UX falls apart at scale without these. Even AI Town (cited reference) had < 25 agents.
- **[IMPORTANT — MISSING]** No "first empty state" AHA planning. Before agents are created, what does `/office` show? Before any workflows exist, what does n8n management show? Before any reflections are generated (takes 24h for first cron), what does the memory section show? Empty states ARE the first impression — they need emotional design.
- **[MINOR]** The onboarding flow (line 202) has "[권장] 테스트 태스크 예약 실행 — CEO /office WOW 모먼트 보장" — this is smart, but it's "[권장]" not "[필수]". If Admin skips this, CEO's first `/office` visit shows idle agents = anti-WOW. Consider making this a stronger recommendation with UI nudge.

### 4. Onboarding Flow (Lines 195-213) — UX Score: 8/10

**Strengths:**
- Admin-first → CEO-second order is correct and well-justified
- Wizard-style progressive unlock (Notion/Linear pattern) is proven UX
- `ProtectedRoute` CEO-side check with redirect is technically sound
- Solo founder edge case (Admin=CEO) explicitly handled

**UX Issues:**
- **[IMPORTANT — MISSING CEO BLOCKED STATE]** Line 210: "completed === false이면 Setup Required 화면으로 리다이렉트." But what does this screen show? What emotional tone? What CTA? CEO's first impression could be "access denied" frustration. This screen needs design attention: explain what Admin needs to do, show a progress indicator of Admin setup, or let CEO self-invite Admin.
- **[MINOR]** n8n and test-task are "선택" in onboarding but critical for AHA moments. The wizard should visually distinguish "required for basic use" vs "recommended for best experience" steps.

### 5. Accessibility — UX Score: 2/10 (AUTO-FAIL RISK)

**THE BRIEF HAS ZERO ACCESSIBILITY MENTIONS.**

This is the most significant UX gap in the entire document:

- **PixiJS 8 canvas** (`/office`): HTML5 Canvas is inherently inaccessible to screen readers. The headline WOW feature produces zero accessible content. No ARIA alternatives, no text fallback, no keyboard navigation for pixel characters described.
- **n8n drag-and-drop**: Workflow builder requires mouse drag — no keyboard-only workflow creation path mentioned.
- **Big Five sliders**: Range inputs need ARIA labels, keyboard increment, descriptive labels (not just "외향성 0.3"). Non-developer Admins need semantic labels ("조용한" ↔ "활발한"), not numeric scales.
- **NEXUS drag-and-drop org chart**: Same drag-and-drop accessibility gap.
- **Color contrast**: "하드코딩 색상 428곳 → themes.css 토큰 전환" is great for consistency but the Brief never mentions WCAG contrast ratios for the new theme.

Even if full WCAG compliance is deferred to v4, the Brief must **acknowledge** accessibility as a risk and define minimum keyboard-navigation requirements. An enterprise AI platform cannot ship with zero a11y consideration. **John (PM) agrees this should be at minimum in the Risks section** (see Cross-talk below).

### 6. Sprint Order from UX Perspective — Score: 7/10

**Strengths:**
- Phase 0 (theme) before Sprint 1 is correct — design system first
- Layer 0 UXUI interleave throughout sprints is smart
- Sprint 3 (memory) before Sprint 4 (PixiJS) ensures `/office` can show growth-over-time AHA

**UX Issues:**
- **[IMPORTANT — DELAYED WOW]** Sprint 4 (PixiJS Virtual Office) is last. This means the most impactful, most emotional UX feature ships last. From a UX strategy perspective, consider: can a minimal Virtual Office prototype (even with placeholder sprites) be shown earlier to validate the concept?
- **[IMPORTANT — MISSING] Layer 0 "60%" gating metric (line 379)**: "Sprint 2 종료까지 ≥ 60% 미달 시 레드라인 검토" — 60% of WHAT? Cross-talk with John yielded a proposed definition: **percentage of user-facing pages that pass Stitch 2 design spec match (≥95% fidelity) + zero hardcoded colors + zero dead buttons.** At Sprint 2 end, 60% of 74 pages should be fully migrated.
- **[MINOR]** Big Five (Sprint 1) ships the least visually impactful UX first (sliders on existing page). Consider whether Sprint 1 deliverables include a visible personality difference in agent responses to make the UX impact immediate.

### 7. Stale References — Score: N/A (Factual Errors)

**6x Subframe → Stitch 2 stale references confirmed** (agree with analyst):
- Line 88: "디자인 도구: **Subframe**(메인)"
- Line 187: "Subframe(메인 디자인)"
- Line 355: "Subframe 기준 대비 구현 일치율"
- Line 378: "(Subframe 아키타입 선택)"
- Line 388: "Subframe 기반 디자인 시스템"
- Line 391: "Subframe 기준 대비"

From UX perspective, Stitch 2 has fundamentally different capabilities (React export, DESIGN.md, infinite canvas) than Subframe — the design tool choice affects UX workflow significantly.

**WebSocket channel count error**: Brief says "14채널" (lines 125, 173, 420) but verified code has **16 channels** (analyst code verification: `packages/shared/src/types.ts:484-500`). Should be 16→17 with `/ws/office` addition.

### 8. Missing Usability Gate (Cross-talk with John)

**[CRITICAL — MISSING from Go/No-Go gates]** The Brief has 8 Go/No-Go gates (#1-#8, lines 439-450) but ALL are technical correctness checks (API smoke test, bundle size, security, zero regression). **No gate validates actual usability.**

v2 lesson: 21 Epics, 10,154 tests, 485 APIs — and it was scrapped because nobody actually used it. Technical completeness ≠ usability. John (PM) and I agree on a proposed **Go/No-Go #9: Real User Task Flow Validation**:
- Admin: Can a non-technical person complete full onboarding wizard without external help?
- CEO: Can someone complete "open Virtual Office → identify agent → Chat → give task → see it in Virtual Office" in under 5 minutes?
- Not Playwright E2E (button-clicking automation) but scenario-based task completion validation.

### 9. Visual Coherence — /office Pixel Art + Theme

**[IMPORTANT — DEFERRED DECISION]** The Brief says pixel art + app theme coherence will be decided "Phase 0 테마 결정 후 확정" (line 187/393). This is insufficient. Phase 0 might select a sleek minimalist theme that clashes with pixel art. The Brief should mandate a **Visual Coherence Principle**: "Phase 0 theme selection criteria MUST include pixel art compatibility as a scoring dimension."

### 10. ECC Analysis Gaps (Part 2 → Brief)

From UX perspective, the following ECC findings have UX implications:

- **[IMPORTANT] ECC 2.1 Agent Security**: Tool response prompt injection defense is not just a security concern — it's a UX trust concern. If an agent shows corrupted/injected content in Chat or Virtual Office, users lose trust in the entire platform. Brief should flag this as both security AND UX risk.
- **[MINOR] ECC 2.3 Confidence scoring for observations**: Adding `confidence` (0.3~0.9) to the observations table would enable a UX feature: showing users "how confident" the agent is in its learned patterns. This builds trust through transparency.
- **[MINOR] ECC 2.4 Capability Eval**: "에이전트가 이전에 못 했던 것을 이제 할 수 있는지" — this could power a user-facing "Agent Growth Timeline" visualization in Reports, directly supporting the memory AHA moment.

---

## Scoring (Critic Rubric — UX Designer Weights)

> Weights: D1(15%) D2(20%) D3(15%) D4(15%) D5(15%) D6(20%)

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 6/10 | Personas specific (names, ages, roles), tech specs precise (<200KB). But: 15x "OpenClaw" stale codename, UX interactions vague ("iframe or API" undecided), Big Five slider labels absent, empty states undefined, no device context for personas. |
| D2 완전성 | 6/10 | Missing: accessibility (zero mention), error/empty states for v3 features, cognitive load for Virtual Office at scale, device/responsive strategy, Admin AHA feedback loop, usability gate in Go/No-Go, visual coherence principle. |
| D3 정확성 | 6/10 | 6x stale Subframe refs, 15x stale OpenClaw refs, page count error (73→74), WebSocket count error (14→16). Factual accuracy significantly degraded by these cumulative errors. |
| D4 실행가능성 | 7/10 | Good direction for UX design phase. Sprint order clear. But n8n iframe vs API is blocking UX decision. Big Five slider needs interaction spec. Virtual Office naming needs resolution for design. |
| D5 일관성 | 7/10 | Consistent with v2 audit and planning brief in substance. But WebSocket count inconsistency and OpenClaw codename now conflict with CEO decision. |
| D6 리스크 인식 | 5/10 | Major UX risks missed: canvas accessibility, Virtual Office cognitive load at scale, n8n UX inconsistency, Big Five learnability, visual coherence, usability validation (v2 lesson!). Only asset quality and bundle size flagged. |

### 가중 평균: 6.1/10 ❌ FAIL (v9.2 Grade A threshold: 8.0)

Calculation: (0.15×6) + (0.20×6) + (0.15×6) + (0.15×7) + (0.15×7) + (0.20×5) = 0.90 + 1.20 + 0.90 + 1.05 + 1.05 + 1.00 = **6.1/10**

---

## Issue Summary

### CRITICAL (Must fix before PRD) — 5 issues
1. **15x "OpenClaw" codename references — CEO decision to drop** — Title, Executive Summary, Layer descriptions, Sprint Order, Future Vision. All must change to "CORTHEX v3" / "Virtual Office" / "가상 사무실".
2. **Zero accessibility consideration** — 459 lines, zero mention of a11y. PixiJS canvas = screen reader blind spot. Enterprise platform requires at minimum risk acknowledgment + keyboard navigation baseline.
3. **6x Subframe → Stitch 2 stale references** — Lines 88, 187, 355, 378, 388, 391. Design tool change affects UX workflow.
4. **Missing cognitive load plan for Virtual Office at scale** — No filtering, search, zoom, or agent grouping. UX breaks at 20+ agents.
5. **Missing usability validation Go/No-Go gate** — 8 technical gates but zero usability check. v2 was scrapped despite 10,154 tests. Need "Real User Task Flow" gate #9.

### IMPORTANT (Should fix) — 10 issues
6. **Admin AHA feedback loop is broken** — Must leave Admin app to observe Big Five effect. Fix (John + Sally consensus): "Personality Preview" test conversation panel on agent edit page — Admin sends sample prompt, sees personality-affected response immediately.
7. **n8n iframe vs API decision unresolved** — Fundamental UX decision cascades to Sprint 2 design.
8. **Empty states for v3 features undefined** — Virtual Office, n8n management, memory section first impressions.
9. **CEO "Setup Required" blocked state undesigned** — First CEO impression if Admin hasn't completed setup.
10. **Page count error** — 73 → 74 (Admin +2 not +1).
11. **WebSocket channel count error** — Brief says 14, actual code has 16. Virtual Office adds to 17, not 15.
12. **Big Five slider learnability** — Needs descriptive labels and presets as primary interaction.
13. **No device/responsive strategy** — Missing context of use for both personas.
14. **Layer 0 "60%" gating metric undefined** — Proposed: % of 74 pages passing Stitch 2 design spec match.
15. **Visual coherence principle missing** — Pixel art + Phase 0 theme compatibility not mandated.

### MINOR (Nice to fix) — 5 issues
16. Sprint 4 delays most impactful UX (Virtual Office WOW) to last position
17. Test task is "[권장]" not "[필수]" — risks anti-WOW on CEO first visit
18. Missing WCAG contrast ratio requirements for new theme
19. Missing Voyage AI embedding provider specification (per project constraint)
20. Leftover "정량 지표는 Step 4에서 정의" on line 90

---

## Cross-talk

### Round 1: Sally → John (Accessibility + Admin AHA)
**Sent**: Top UX concern — zero accessibility in entire Brief. PixiJS canvas inherently inaccessible. Admin AHA feedback loop broken.
**Questions asked**:
1. Should accessibility be flagged as risk even if deferred?
2. Does absence concern you from product/market perspective?
3. Do you agree Admin AHA feedback loop is too indirect?

### Round 1: John → Sally (Usability Gate)
**Received**: John's top concern — **v2 was never used and scrapped; Brief has no "usability gate" to prevent v3 repeating this.** All 8 Go/No-Go gates are technical (smoke test, bundle size, security) with zero usability validation.
**Questions from John**:
1. Should there be a Go/No-Go gate for end-to-end user journey validation?
2. Is deferring Virtual Office pixel art + theme coherence to Phase 0 sufficient?
3. What should the "60%" Layer 0 gating metric measure?

### Round 2: Sally → John (Answers)
1. **Go/No-Go #9**: Yes. Admin: complete onboarding without help. CEO: Virtual Office → Chat → task → observe in < 5 minutes. v2 lesson = technical correctness ≠ usability.
2. **Visual Coherence**: Deferring NOT sufficient. Brief must mandate: "Phase 0 theme selection MUST include pixel art compatibility as scoring dimension."
3. **Layer 0 "60%"**: Percentage of 74 user-facing pages passing Stitch 2 spec match (≥95% fidelity) + zero hardcoded colors + zero dead buttons by Sprint 2 end.

### Round 2: John → Sally (Answers)
1. **Accessibility as risk**: YES absolutely. Enterprise platform with zero a11y = product risk AND compliance risk. Even if WCAG 2.1 AA deferred to v4, Brief MUST flag a11y in Risks, include keyboard nav as minimum v3 requirement. Canvas-based Virtual Office can have an accessible companion panel as alternative.
2. **Market perspective**: YES concerning. Enterprise buyers increasingly require accessibility statements. Lack of a11y consideration = competitive weakness.
3. **Admin AHA broken**: AGREE. PM recommendation: **"Personality Preview" feature** — a small test conversation panel on the agent edit page where Admin sends a sample prompt and sees how personality affects the response. Immediate, in-context AHA. (Adopted into Issue #6.)
4. **n8n note**: n8n already has built-in keyboard alternatives for its drag-and-drop — Brief should mention this.

### Cross-talk Consensus Summary
| Topic | Sally + John Agreement |
|-------|----------------------|
| Accessibility | Must be in Risks section at minimum. Keyboard nav = v3 scope. Canvas Virtual Office needs accessible companion panel. |
| Usability Gate | Go/No-Go #9: Real User Task Flow Validation. v2 failure = strongest argument. |
| Admin AHA | Broken feedback loop confirmed. Fix: "Personality Preview" test panel in Admin agent edit. |
| Visual Coherence | Phase 0 theme must score pixel art compatibility. Not deferrable. |
| Layer 0 "60%" | = % of 74 pages passing Stitch 2 design spec + zero hardcoded colors + zero dead buttons. |
| n8n a11y | n8n has built-in keyboard support — Brief should note this as a11y advantage. |

---

## Recommendation

**Cycle 1 Score: 6.1/10 — FAIL (below 8.0 Grade A threshold)**

---

## Cycle 2 Re-verification (Post-Fixes)

> Re-read: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (full document)
> Fixes log: `party-logs/stage-0-brief-review-fixes.md`

### Fix Verification — My CRITICAL Issues

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| C1 | 15x OpenClaw → CORTHEX v3 / Virtual Office | ✅ FIXED | Title L36, Executive Summary L79/83, Layer 1 L168, Differentiators L189, Sprint L385 — all correct. Zero "OpenClaw" remaining. |
| C2 | Zero accessibility | ✅ FIXED | Layer 0 L397: keyboard nav + ARIA baseline. Layer 1 L429: Canvas ARIA live region + keyboard agent selection. R9 risk L504. Future Vision L471: WCAG AA. Comprehensive for Brief level. |
| C3 | 6x Subframe → Stitch 2 | ✅ FIXED | L88, L189, L357, L380, L391, L394 — all "Stitch 2". Zero "Subframe" remaining. |
| C4 | Virtual Office cognitive load at scale | ✅ FIXED | L173: department rooms, zoom/pan, status filters, search, minimap. R10 risk L505. Sufficient for Brief level — Architecture will detail. |
| C5 | Missing usability Go/No-Go gate | ✅ FIXED | Go/No-Go #11 L462: Admin onboarding without help + CEO 5-min workflow test. Explicitly cites v2 lesson. R7 risk L502. Exactly what John and I proposed. |

### Fix Verification — My IMPORTANT Issues

| # | Issue | Status | Verification |
|---|-------|--------|-------------|
| I6 | Admin AHA preview | DEFERRED | → UX Design stage. **Acceptable** — interaction design detail, not Brief scope. |
| I7 | n8n iframe vs API | ✅ RESOLVED | L406: "API-only 모드". L408-411: webhook → `/api/v1/tasks` POST + service account API key + callback URL. The ambiguity is gone — clearly API-only integration, not iframe. |
| I8 | Empty states | DEFERRED | → UX Design stage. **Acceptable** — screen-level design detail. |
| I9 | CEO blocked state | DEFERRED | → UX Design stage. **Acceptable**. |
| I10 | Page count 73→74 | ✅ FIXED | L226: "+2 예정: n8n 관리 + /office read-only". L315: "74개 예상". |
| I11 | WebSocket 14→16 | ✅ FIXED | L125: "16개". L175: "기존 16채널". L428: "기존 16 → 17". |
| I12 | Big Five slider labels | DEFERRED | → UX Design stage. **Acceptable** — interaction design detail. |
| I13 | Device/responsive | DEFERRED | → UX Design stage. **Acceptable** — design decision. |
| I14 | Layer 0 "60%" metric | ✅ FIXED | L381: "74페이지 중 ≥ 60% Stitch 2 스펙 매칭(≥95% fidelity) + 하드코딩 색상 0 + dead button 0". Exactly the definition from Sally-John cross-talk. |
| I15 | Visual coherence principle | ✅ FIXED | L189: "Phase 0 테마 선택 시 Virtual Office 픽셀 아트와의 시각적 호환성을 평가 기준에 반드시 포함." L391: same principle in Layer 0 scope. |

### Fix Verification — My MINOR Issues

| # | Issue | Status |
|---|-------|--------|
| M16 | Sprint 4 delayed WOW | Not applicable — structural decision, rationale sound |
| M17 | Test task "[권장]" | Unchanged — minor, acceptable |
| M18 | WCAG in Future Vision | ✅ FIXED — L471 |
| M19 | Voyage AI embedding | ✅ FIXED — L157 + L485 Technical Constraints |
| M20 | Step 4 leftover L90 | ✅ FIXED — removed |

### Additional Improvements (Not in my original review)

- **NEW Technical Constraints section** (L475-488) — All VPS limits now visible in document body, not hidden in HTML comments. Excellent.
- **NEW Risks section** (L492-505) — 10 risks with H/M/L probability/impact/mitigation. R7 (v2 failure repeat) is particularly well-written.
- **Layer 0 split into L0-A/B/C** — Resolves circular dependency (Winston-Bob finding). Smart architectural decision.
- **Sprint duration estimates** — ~14 weeks total. Rough but useful for planning.
- **3 new Go/No-Go gates** — #9 agent security, #10 v1 feature parity, #11 usability. Comprehensive.
- **Observations schema enriched** — confidence (0.3~0.9), domain, 30-day retention (L156).
- **n8n Docker resource limits** — `--memory=2g --restart unless-stopped` (L406).

### Remaining Concerns (Minor — not blocking)

1. **Admin AHA still indirect** — Deferred to UX Design stage is acceptable, but I want to flag: this MUST be addressed in UX Design, not forgotten. The "personality preview" test panel is critical for Admin engagement.
2. **Persona "context of use" still missing** — No device context (desktop/mobile/tablet) for either persona. Deferred is acceptable for Brief, but UX Design must address this in Sprint 1.
3. **Test task still "[권장]"** — If skipped, CEO first visit = idle agents = anti-WOW. UX Design should recommend UI nudge.

### Cycle 2 Scoring

| 차원 | Cycle 1 | Cycle 2 | 변화 근거 |
|------|---------|---------|----------|
| D1 구체성 | 6/10 | 8/10 | All 21 stale refs fixed. Technical Constraints table with specific values. Sprint durations. Observations schema (confidence + domain). n8n integration pattern concrete (webhook + API key + callback). |
| D2 완전성 | 6/10 | 8/10 | Accessibility baseline added (Layer 0 + Layer 1 + R9). Cognitive load strategy (rooms, filters, zoom, minimap). Usability gate #11. 10-risk Risks section. VPS constraints visible. UX-design-level details appropriately deferred. |
| D3 정확성 | 6/10 | 9/10 | All 21 stale references eliminated. Page count 74 correct. WebSocket 16→17 correct. No remaining factual errors found on re-read. |
| D4 실행가능성 | 7/10 | 8/10 | n8n integration pattern clear (API-only, not iframe — ambiguity resolved). Layer 0 split into 3 actionable phases (L0-A/B/C). Sprint durations enable planning. Go/No-Go gates have specific pass criteria. |
| D5 일관성 | 7/10 | 9/10 | All naming consistent (CORTHEX v3, Virtual Office, Stitch 2). Numbers match audit (485 API, 86 tables, 16 WS, 74 pages). Visual coherence principle bridges pixel art + theme. Layer 0 split aligns with sprint dependencies. |
| D6 리스크 인식 | 5/10 | 8/10 | 10 risks with H/M/L probability/impact/mitigation. Canvas a11y (R9), cognitive load (R10), v2 failure repeat (R7), agent security (R5), theme delay cascade (R1), Reflection cost explosion (R3). Major UX risks now explicitly acknowledged. |

### Cycle 2 가중 평균

Weights: D1(15%) D2(20%) D3(15%) D4(15%) D5(15%) D6(20%)

(0.15×8) + (0.20×8) + (0.15×9) + (0.15×8) + (0.15×9) + (0.20×8)
= 1.20 + 1.60 + 1.35 + 1.20 + 1.35 + 1.60
= **8.3/10 ✅ PASS (v9.2 Grade A)**

### Verdict

The Brief has been significantly improved. All 5 CRITICAL issues are fully resolved. 6 of 10 IMPORTANT issues are fixed in the document; the remaining 4 are appropriately deferred to UX Design stage (Admin AHA preview, empty states, CEO blocked state, device strategy, Big Five labels). The new Risks section, Technical Constraints table, and 3 additional Go/No-Go gates address the most significant gaps from Cycle 1.

From a UX perspective, the Brief now:
- **Acknowledges accessibility** with concrete baseline (keyboard nav + ARIA) and Canvas alternative
- **Plans for scale** with Virtual Office cognitive load strategy (rooms, filters, zoom, minimap)
- **Prevents v2 repeat** with usability validation Go/No-Go #11
- **Ensures visual coherence** between pixel art and app theme
- **Defines measurable UX gates** (Layer 0 60% metric, Stitch 2 95% fidelity)

**Recommendation: PASS — proceed to PRD stage.** UX Design stage must address the 4 deferred items (Admin AHA preview, empty states, CEO blocked state, device strategy).

---

## Cycle 2 DA (Devil's Advocate) Fix Verification

> 4 code-verified fixes from Winston's DA review. Re-read from file.

### DA-1 [CRITICAL]: pgvector dimension 768 (not 1536) — Gemini embedding
**Status: ✅ VERIFIED**
- L157: "현재 `knowledge_docs.embedding`은 `vector(768)` Gemini 임베딩 (schema.ts:1556)" — correct dimension from actual code
- L486 Technical Constraints: "기존 `vector(768)` Gemini → `vector(1024)` Voyage AI 마이그레이션 + re-embed 필수"
- **UX Impact**: Re-embed job means existing knowledge search results may temporarily degrade during migration. Sprint 3 should plan for a "migration in progress" user notification.

### DA-2 [CRITICAL]: `agent_memories` has NO vector column
**Status: ✅ VERIFIED**
- L158: "현재 `agent_memories` 테이블에는 벡터 컬럼이 **없음** (schema.ts:1589-1608, text 필드만 존재). `vector(1024)` 컬럼 신규 추가 + 기존 memories backfill job 필요. Sprint 3 스코프에 포함 (단순 enum 확장이 아닌 스키마 변경)."
- **UX Impact**: This is a scope increase for Sprint 3 (~4 weeks). Schema migration + backfill + re-embed = significant work. If Sprint 3 extends, Layer 0 UXUI interleave timeline is affected. The Brief correctly flags this as scope clarification.

### DA-3 [IMPORTANT]: v1 parity Go/No-Go #10 Gemini conflict
**Status: ✅ VERIFIED**
- L462: "의도적 제외 목록: Gemini 모델 지원 (key constraint로 금지), GPT 모델 지원 (CEO 결정으로 제거, commit e294213) — 이 항목들은 v1 패리티 검증에서 명시적 예외 처리."
- **UX Impact**: None — clear exclusion list prevents false-positive parity failures.

### DA-4 [IMPORTANT]: 11 workflow endpoints become dead after n8n
**Status: ✅ VERIFIED**
- L440 Out of Scope: "워크플로우 API 예외: `workflows.ts` 11개 엔드포인트는 n8n 대체 후에도 200 OK 유지하되, 응답에 `{ deprecated: true, migrateTo: "n8n" }` 플래그 추가. 기능적으로 dead endpoint가 되지만 Zero Regression smoke test는 통과. 완전 제거는 v4 범위."
- **UX Impact**: CEO app workflow pages will still load but show deprecated content. UX Design stage should define a migration notice UI (e.g., "This feature has moved to n8n. Contact your Admin." with a CTA). Not a Brief-level concern — correctly deferred.

### DA Fix Impact on Score

The DA fixes improve **D3 Accuracy** (correct pgvector dimension from actual code) and **D6 Risk Awareness** (Sprint 3 scope complexity now honestly acknowledged). These reinforce the existing 8.3/10 score without changing it — the improvements were already partially captured in Cycle 2's generous D3: 9/10.

**No score change needed. Final score: 8.3/10 ✅ PASS.**

---

## FINAL VERDICT

| Cycle | Score | Status |
|-------|-------|--------|
| Cycle 1 | 6.1/10 | ❌ FAIL |
| Cycle 2 | 8.3/10 | ✅ PASS |
| Cycle 2 DA | 8.3/10 (confirmed) | ✅ PASS |

**Total issues found**: 20 (Cycle 1) + 8 ECC gaps (4 HIGH + 4 MEDIUM)
**Total fixes verified**: 42 (25 Cycle 1 + 4 DA + 13 ECC)
**Cross-talk**: 2 rounds with John (PM) — 6 consensus points

**Cycle 2 score (8.3/10) RETRACTED** — team lead correctly identified that scoring PASS while 4 self-identified HIGH ECC gaps remained was inconsistent.

---

## Cycle 3: ECC Full Reflection Verification (FINAL)

> Re-read: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (full document, post-ECC fixes)
> 13 ECC fixes applied per analyst log

### ECC HIGH Gap Verification (my 4 critical gaps)

| # | ECC Gap | Status | Location | UX Verification |
|---|---------|--------|----------|-----------------|
| 1 | **2.4 Capability Eval** | ✅ FIXED | L354 Success Metrics Layer 4 | "동일 유형 태스크 3회 반복 시 3회차 재수정률 ≤ 50%" — specific, measurable, directly powers CEO's growth AHA moment (L282-283). |
| 2 | **2.7 Handoff standardization** | ✅ FIXED | L425 Layer 4 scope | `{ status, summary, next_actions, artifacts }` format — enables consistent Tracker UI for delegation chains. E8 boundary respected. |
| 3 | **2.2 Tier model auto-routing** | ✅ FIXED | L427 Layer 4 scope + L463 Go/No-Go #7 | "Haiku/Sonnet 자동 선택 — Admin이 Tier별 모델 배정 설정 가능. 예산 초과 시 자동 차단." — clear Admin UX: configurable routing + automatic guard. |
| 4 | **2.1 Governance logging** | ✅ FIXED | L426 Layer 4 scope | "민감 작업(도구 실행, 외부 API 호출, 비용 임계치 초과) 수행 시 감사 로그" — specific trigger categories. CEO trust/transparency narrative strengthened. |

### ECC MEDIUM Gap Verification (my 4 secondary gaps)

| # | ECC Gap | Status | Location | UX Verification |
|---|---------|--------|----------|-----------------|
| 5 | **2.8 Message triage** | ✅ FIXED | L478 Future Vision | 4-stage classification (skip/info_only/meeting_info/action_required) — correctly deferred to v4+ (Hub/notification UX enhancement). |
| 6 | **2.3 Reflection confidence priority** | ✅ FIXED | L163 Layer 4 Reflection | "confidence ≥ 0.7 관찰을 우선 통합하여 노이즈 필터링" — specific threshold, directly improves memory quality → user trust in agent growth. |
| 7 | **2.2 Immutable cost tracking** | ✅ FIXED | L498 Technical Constraints | "cost-aggregation 데이터 append-only (수정/삭제 불가)" — data integrity for Admin cost pages. |
| 8 | **2.1 CLI token auto-deactivation** | ✅ FIXED | L510 R5 mitigation | "CLI 토큰 유출 감지 시 자동 비활성화 메커니즘" — security posture strengthened. |

### Additional ECC Items Verified

| # | Item | Status | Location |
|---|------|--------|----------|
| 9 | Executive Summary vision update | ✅ | L90: "안전한 에이전트 실행 환경 + 비용 인지 모델 라우팅" |
| 10 | MCP health check | ✅ | L497 Technical Constraints |
| 11 | Cross-project global insight | ✅ | L477 Future Vision |
| 12 | Per-agent user preferences | ✅ | L479 Future Vision |
| 13 | Not Applied items | ✅ CORRECT | 2.5 Blueprint (methodology), 2.6 Search-First (exists), 2.7 ReAct (E8 violation), Error recovery (Architecture) |

### Cycle 3 Scoring

| 차원 | Cycle 1 | Cycle 2 | Cycle 3 | 변화 근거 |
|------|---------|---------|---------|----------|
| D1 구체성 | 6/10 | 8/10 | 8/10 | ECC items have specific formats (`{status, summary, next_actions, artifacts}`), thresholds (confidence ≥ 0.7), cost ranges ($0.10~$0.50). Capability Eval target (≤50% rework). Maintained. |
| D2 완전성 | 6/10 | 8/10 | 9/10 | ↑ All 8 ECC ideas now reflected at appropriate level (4 in body, 4 in Future Vision/Constraints). Combined with existing a11y, cognitive load, usability gate — all UX dimensions covered. |
| D3 정확성 | 6/10 | 9/10 | 9/10 | No new factual errors introduced by ECC additions. All code references accurate. Maintained. |
| D4 실행가능성 | 7/10 | 8/10 | 8/10 | Handoff format standardized. Governance logging scoped to observations table. Cost routing configurable by Admin. All implementable. Maintained. |
| D5 일관성 | 7/10 | 9/10 | 9/10 | ECC items placed consistently within layer structure: governance → L4 (observations), cost routing → L4 (Tier system), handoff → L4 (memory). |
| D6 리스크 인식 | 5/10 | 8/10 | 9/10 | ↑ CLI token auto-deactivation in R5. MCP health check in constraints. Budget auto-block in Go/No-Go #7. Cost immutability in constraints. All ECC security concerns now addressed. |

### Cycle 3 가중 평균

Weights: D1(15%) D2(20%) D3(15%) D4(15%) D5(15%) D6(20%)

(0.15×8) + (0.20×9) + (0.15×9) + (0.15×8) + (0.15×9) + (0.20×9)
= 1.20 + 1.80 + 1.35 + 1.20 + 1.35 + 1.80
= **8.7/10 ✅ PASS (v9.2 Grade A)**

---

## FINAL VERDICT (Cycle 3 — Post-ECC)

| Cycle | Score | Status | Reason |
|-------|-------|--------|--------|
| Cycle 1 | 6.1/10 | ❌ FAIL | 5 CRITICAL + 10 IMPORTANT UX gaps |
| Cycle 2 | 8.3/10 | ⚠️ RETRACTED | Scored PASS while 4 HIGH ECC gaps remained — inconsistent |
| Cycle 3 | **8.7/10** | **✅ PASS** | All original issues + all ECC gaps resolved |

**Total issues found across all cycles**: 20 (original) + 8 (ECC) = 28
**Total fixes verified**: 42 (25 Cycle 1 + 4 DA + 13 ECC)
**Cross-talk**: 2 rounds with John (PM) — 6 consensus points
**ECC coverage**: 8/8 ideas reflected (4 in Brief body, 4 in Future Vision/Constraints, 4 correctly excluded as not-Brief-scope)

**Final recommendation: PASS (8.7/10) — proceed to PRD stage.**

Remaining items for UX Design stage (deferred, non-blocking):
1. Admin AHA "Personality Preview" test panel
2. Empty states for Virtual Office, n8n, memory sections
3. CEO "Setup Required" blocked state screen design
4. Device/responsive strategy for both personas
5. Big Five slider descriptive labels + presets as primary interaction
6. Deprecated workflow pages migration notice UI
