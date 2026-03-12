# Phase 5-1 Review — CRITIC-A (Sally / Marcus / Luna)

**Date**: 2026-03-12
**File reviewed**: `_corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md`
**Round**: 1 — Initial Review

---

## Sally (UX Designer) — "실제 유저가 이걸 3초 안에 이해할 수 있나?"

The document covers Hub, Dashboard, NEXUS, Library, Admin, Landing, and AGORA — that's a solid core. However, three P1-tier user flows are completely unrepresented: the **Soul editor page** (listed in Vision §6.1 as "Code-free programming interface"), the **ARGOS scheduler page** ("AI works while you sleep"), and the **SketchVibe AI canvas panel** (Vision §6.1: "Demo moment: 'type add backend team under CTO' → watch nodes appear"). A CEO trying to configure their AI team has no Stitch starting point for these key screens. Without Soul editor, a Stitch session for agent configuration is fundamentally incomplete.

Bigger workflow gap: Section 6 Landing Page ends with "Mobile gets scrollable layout with no interactive demos" — implying mobile is supported. But the Master Prompt (Section 0) explicitly says "NO mobile responsive breakpoints." This direct contradiction will produce unpredictable Stitch output: Section 0 will suppress breakpoints, Section 6 will request them. The user must decide which wins, and there's no guidance in the document.

**Sally's verdict**: The core app screens are well-specified for user flow. The missing P1 pages leave ~30% of the product's main selling points without Stitch prompts. The mobile contradiction is an immediate copy-paste blocker for the landing page.

---

## Marcus (Visual Designer) — "시각적 위계가 무너졌다."

**Critical violation — Section 3 NEXUS toolbar**: The "저장됨" label on the save state indicator button directly violates Phase 0 Vision document Emotional Moment #3, which explicitly states: **"Zero loading spinner. '즉시 적용됨' not '저장됨'."** The button in Section 3 reads `text-xs text-green-500 "저장됨"` — the exact wrong copy. The AgentConfigPanel footer button in the same section correctly says "즉시 적용됨" (line 618). This inconsistency within a single page prompt is a brand voice error that Stitch will faithfully reproduce.

**Critical visual anti-pattern — Section 6 Landing Page**: AGORA feature card uses `Lucide MessageSquare h-8 w-8 text-indigo-400` as the icon. Phase 0 Vision §4.3 explicitly lists "chat bubbles" as a design anti-pattern to avoid: **"Do NOT use: robots, gears, chat bubbles, magic wands. CORTHEX is not a chatbot or a toy."** MessageSquare IS a chat bubble. Stitch will generate an AGORA card that looks like a chat feature on the public marketing page — the single worst misrepresentation possible. Should be `Lucide Users`, `Lucide Vote`, or `Lucide Network` instead.

**StatusDot size inconsistency**: Section 1 Hub active session item uses `h-1.5 w-1.5` for the working StatusDot, while Section 9 Quick Reference snippets and all other occurrences specify `h-2 w-2`. This produces component size mismatches across pages when Stitch follows different sections. Minor but reproducible.

**Section 8 Theme Swap Guide — missing font imports**: Each of the 5 creative themes specifies a different font family (Space Grotesk+Inter+JetBrains Mono for T1, JetBrains Mono for T2, IBM Plex Sans for T3, Syne+Inter for T4, Instrument Sans+Inconsolata for T5) but none of the theme swap prompts include Google Fonts import URLs. Stitch cannot load fonts it doesn't know the URL for. Without this, all 5 theme variants will fall back to system fonts and lose their typographic character entirely — the most distinctive per-theme variable.

**Marcus's verdict**: Two critical spec violations that directly contradict Phase 0 foundations. The font import gap in Section 8 makes the entire theme swap system non-functional as written. StatusDot sizing should be standardized to the Quick Reference value.

---

## Luna (Brand Strategist) — "CORTHEX의 정체성과 맞지 않는다."

The Master Prompt in Section 0 correctly establishes the CORTHEX brand identity: "Military Precision × AI Intelligence... NOT a chatbot... Military precision aesthetic. No playfulness." The phrase "명령 접수됨" appears correctly throughout, and the Tracker "위임 체인" naming is consistent with the brand codenames (NEXUS, AGORA, ARGOS, Soul, Tracker, Hub, Library, Tier) — all present and correctly Korean-styled.

However, the MessageSquare icon issue (flagged by Marcus) has direct brand consequences beyond aesthetics: the entire AGORA value proposition in the marketing page would be visually coded as "another chatbot feature." The CORTHEX vision document's strongest competitive positioning is "CORTHEX is NOT a chatbot" — and the landing page would undercut this at the brand's most visible public surface.

The document does a good job conveying Korean-language command center identity throughout the app sections. The landing copy "조직도를 그리면 AI 팀이 움직인다" is prominently featured and the hero eyebrow "AI 조직 관리 플랫폼" positions correctly. The ARGOS landing card copy "100개의 눈, 절대 잠들지 않는" correctly uses the brand mythology.

One brand consistency note: the "무료 체험 →" in the sticky nav shortens to "무료 체험 시작 →" in the hero CTA. Inconsistent CTA labeling on the same page weakens recall. Pick one and use it everywhere on the landing page.

**Luna's verdict**: The core brand voice is strong and consistent across 90% of the document. The MessageSquare icon is the one element that would make a first-time visitor think CORTHEX is a messaging tool. The Soul editor / ARGOS page absence means the brand's "always-on AI organization" story (ARGOS) and "code-free programming" story (Soul) have no Stitch-ready visual.

---

## Consolidated Issue List

| # | Severity | Location | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | 🔴 CRITICAL | Sec 3 NEXUS Toolbar | `"저장됨"` copy — direct violation of Vision Emotional Moment #3 | Change to `"즉시 적용됨"` |
| 2 | 🔴 CRITICAL | Sec 6 Landing AGORA card | `Lucide MessageSquare` icon = chat bubble anti-pattern per Vision §4.3 | Replace with `Lucide Users` or `Lucide Network` |
| 3 | 🟠 MAJOR | Sec 0 vs Sec 6 | Mobile breakpoints: master prompt says NO, landing page says "Mobile gets scrollable layout" — direct contradiction | Add note: "Landing page only: add `sm:` breakpoints for mobile scroll. All app pages: no breakpoints." |
| 4 | 🟠 MAJOR | Document scope | Missing P1 pages: Soul editor, ARGOS scheduler, SketchVibe canvas panel | Add Section 10/11/12 for these 3 P1 screens |
| 5 | 🟠 MAJOR | Sec 8 all themes | Theme font families specified but no Google Fonts import URLs — Stitch cannot load unknown fonts | Add font link for each theme (e.g., `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap`) |
| 6 | 🟡 MINOR | Sec 1 Hub, Sec 9 | StatusDot size: `h-1.5 w-1.5` in active session vs `h-2 w-2` everywhere else | Standardize to `h-2 w-2` per Quick Reference |
| 7 | 🟡 MINOR | Sec 6 Landing Nav + Hero | CTA label: "무료 체험 →" (nav) vs "무료 체험 시작 →" (hero) inconsistent | Pick one label throughout landing page |

---

## Scores

| Dimension | Score | Reason |
|-----------|-------|--------|
| Completeness (page coverage) | 7/10 | Soul editor, ARGOS page, SketchVibe missing |
| Specificity (no vague values) | 8.5/10 | Highly specific — color hex, exact px, all states covered. Deduct for font import gap |
| Copy-paste readiness | 7.5/10 | Mobile contradiction is immediate blocker for Sec 6 |
| Design accuracy vs Phase 0–4 | 7/10 | 저장됨 violation + MessageSquare anti-pattern are direct Phase 0 violations |
| Overall | **7.5 / 10** | Strong foundation, 2 critical fixes required before use |

---

## Cross-talk sent to CRITIC-B

Sending for cross-check on: Issue #2 (MessageSquare — is Users or Network the better replacement?), Issue #4 (which missing P1 page is highest priority to add first?), and Issue #5 (should font URLs be in master prompt or theme sections?).

---

---

## Cross-talk Round 1 — CRITIC-B Response (Summary)

**Q1 — AGORA icon**: CRITIC-B recommends `Lucide Scale` (scales of justice/deliberation). Rationale:
- `Lucide Network` already used in same doc for TrackerPanel `위임 체인` header → icon vocabulary collision
- `Lucide Users` = HR/Slack connotation
- `Lucide Scale` = weighing competing opinions, zero chatbot connotation, 판단/법정 metaphor, no reuse conflict
- **Updated recommendation: `Lucide Scale text-indigo-400`**

**Q2 — Missing P1 priority**: CRITIC-B confirms Soul editor first. Additional technical reason: Soul editor needs a CodeMirror placeholder note (same pattern as NEXUS's ReactFlow note in Section 3). Without it, the generator will produce a plain `<textarea>` that's painful to replace. CodeMirror placeholder coloring spec: `bg-zinc-950, text-emerald-400 strings, text-violet-400 keywords, text-zinc-300 default`.

**Q3 — Font URLs**: Option (a) confirmed. Theme swap is a second paste — font URLs in Section 0 would require re-pasting a modified master for every theme trial.

**New Issue from CRITIC-B (Section 5 — Issue #8)**:
Filter `<select>` elements in Section 5 Admin have `pr-8` (space for dropdown arrow) but no `appearance-none`. Browser-native dropdown arrow will render over the styled dark element. Fix: add `appearance-none` + explicit `ChevronDown` wrapper div.

**CRITIC-B confirmed all 7 of CRITIC-A's issues.** No issues withdrawn.

---

## Final Consolidated Issue List (13 total)

| # | Severity | Location | Issue | Fix |
|---|----------|----------|-------|-----|
| 1 | 🔴 CRITICAL | Sec 3 NEXUS Toolbar | `"저장됨"` — Vision Emotional Moment #3 violation | Change to `"즉시 적용됨"` |
| 2 | 🔴 CRITICAL | Sec 6 Landing AGORA card | `Lucide MessageSquare` = chat bubble anti-pattern | Replace with `Lucide Scale text-indigo-400` |
| 3 | 🟠 MAJOR | Sec 0 vs Sec 6 | Mobile breakpoints direct contradiction | Add clarification: "Landing page only: add `sm:` breakpoints. All app pages: NO breakpoints." |
| 4 | 🟠 MAJOR | Document scope | Missing P1 pages: Soul editor (priority 1), ARGOS scheduler, SketchVibe | Add Section 10 (Soul editor) with CodeMirror placeholder note |
| 5 | 🟠 MAJOR | Sec 8 all themes | No Google Fonts URLs — font families unloadable by Stitch | Add font import URL to each theme block in Section 8 |
| 6 | 🟡 MINOR | Sec 1 Hub, Sec 9 | StatusDot `h-1.5 w-1.5` vs `h-2 w-2` inconsistency | Standardize to `h-2 w-2` |
| 7 | 🟡 MINOR | Sec 6 Nav + Hero | CTA label: "무료 체험 →" vs "무료 체험 시작 →" inconsistent | Standardize to one label |
| 8 | 🟡 MINOR | Sec 5 Admin filters | `<select pr-8>` without `appearance-none` → native arrow visual artifact | Add `appearance-none` + `ChevronDown` wrapper |
| 9–13 | (from CRITIC-B log) | Various | See `phase5-step1-critic-b.md` for CRITIC-B's 5 additional findings | — |

---

## Updated Score

| Dimension | Round 1 | After Cross-talk |
|-----------|---------|-----------------|
| Completeness | 7/10 | 7/10 |
| Specificity | 8.5/10 | 8/10 (font gap + select issue) |
| Copy-paste readiness | 7.5/10 | 7.5/10 |
| Design accuracy vs Phase 0–4 | 7/10 | 7/10 |
| **Overall** | **7.5/10** | **7.5/10** |

*CRITIC-A sign-off: Cross-talk complete. Sending [Feedback] to writer.*

---

## Round 2 — Fix Verification

**Re-read from file**: `_corthex_full_redesign/phase-5-prompts/stitch-prompt-web.md` (post-fixes)

| # | Issue | Verified? | Evidence |
|---|-------|-----------|----------|
| 1 | `저장됨` → `즉시 적용됨` (NEXUS toolbar) | ✅ | Line 550: `Lucide CheckCircle h-3.5 w-3.5 + "즉시 적용됨"` |
| 2 | `MessageSquare` → `Lucide Scale` | ✅ | Line 1117: `Lucide Scale h-8 w-8 text-indigo-400 (deliberation/justice metaphor — NOT a chat bubble)` |
| 3 | Mobile contradiction resolved | ✅ | Line 115–116: Exception note added for landing page `sm:` breakpoints |
| 4 | Section 10 Soul Editor added | ✅ | Line 1599: `## SECTION 10: SOUL EDITOR (P1 — Code-Free Programming Interface)` with full CodeMirror 6 placeholder spec |
| 5 | Theme font URLs | ✅ | All 5 themes have Google Fonts URLs (T1 Space Grotesk, T2 JetBrains Mono, T3 IBM Plex, T4 Syne, T5 Instrument Sans + Inconsolata) |
| 6 | StatusDot `h-2 w-2` | ✅ | Line 212, 253: `h-2 w-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none` |
| 7 | CTA label standardized | ✅ | All landing CTAs use `"무료 체험 시작 →"` |
| 8 | Admin select `appearance-none` | ✅ | Lines 811–812: `appearance-none w-full` + `ChevronDown` overlay pattern |
| B-1 | `motion-reduce` on all animations | ✅ | Lines 117–122: Master Prompt rule + all instances updated |
| B-2 | TrackerPanel transition spec | ✅ | Lines 281–282: `transition-[width] duration-[250ms] ease-in-out motion-reduce:transition-none` |
| B-3 | ARIA landmarks | ✅ | Lines 124–133: Full ARIA requirements section in Master Prompt |
| B-4 | `border-zinc-800` on zinc-900 | ✅ | 4 additional violations fixed; remaining `border-zinc-800` instances confirmed on `bg-zinc-950` (acceptable) |

**Note**: Fix log documents T4=Outfit, T5=DM Sans but actual file correctly uses T4=Syne, T5=Instrument Sans per Phase 4 creative themes. File is correct; fix log summary is inaccurate. Non-blocking.

## Round 2 Score

| Dimension | Round 1 | Round 2 |
|-----------|---------|---------|
| Completeness | 7/10 | 9/10 (Soul editor added; ARGOS/SketchVibe deferred) |
| Specificity | 8/10 | 9.5/10 (CodeMirror spec, appearance-none, ARIA all added) |
| Copy-paste readiness | 7.5/10 | 9.5/10 (mobile resolved, fonts complete, motion-reduce throughout) |
| Design accuracy vs Phase 0–4 | 7/10 | 9.5/10 (즉시 적용됨, Scale icon, border violations all fixed) |
| **Overall** | **7.5/10** | **9.4/10 ✅ PASS** |

**PASS** — above 7/10 threshold. Document is production-ready for Stitch sessions.

*CRITIC-A sign-off: Round 2 verification complete.*
