# Critic-Dev Review — Step 7: Defining Experience Deep Dive (UX Design Specification)

**Reviewer:** Amelia (Dev Critic)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 1009-1373
**Date:** 2026-03-23
**Focus:** Implementation feasibility, component architecture, CSS/framework patterns, performance
**Target Grade:** B (avg >= 7.0)

---

## Dimension Scores

| Dimension | Score | Weight | Rationale |
|-----------|-------|--------|-----------|
| D1 Specificity | 9/10 | 15% | SC-1~5 all have quantitative targets + measurement methods (routing 80%, FCP ≤1.5s, TTI ≤3s, 온보딩 ≤15분). EM-1~4 have step-by-step flows with timing annotations ([0.5초], [1초], etc.). Competitive table with 4 specific competitors + differentiation points. Mental model tables have 4 confusion points each with concrete UX solutions. Only gap: SC-3 "드래그 지연 0ms" is technically incorrect (60fps = ≥16.7ms/frame). |
| D2 Completeness | 8/10 | 15% | All 5 required subsections present: One Interaction, Mental Model, Success Criteria (5), Novel/Established, Experience Mechanics (4). 8 established + 6 novel + 3 innovative combinations — thorough classification. EM-1~4 all have Initiation/Interaction/Feedback/Completion/Error Path. **Missing:** (1) No EM for Chat session management (conversation history, context window, thread branching). (2) Rate limiting UX (architecture specifies 10 msg/s — what does CEO see when hitting it?). (3) Notification delivery flow (EM covers creation but not the Notifications page UX). |
| D3 Accuracy | 8/10 | **25%** | **Verified accurate against PRD/architecture:** SC-1 routing 80% (PRD:386 ✅), SC-4 reflected=false 20건 (PRD:376 ✅), SC-5 온보딩 ≤15분 (PRD:391 ✅), EM-1 15초 타임아웃 (PRD:570 ✅), EM-3 Voyage AI (architecture:89 ✅), WS reconnect 3s×5 (Step 3 consistent ✅). **Issues:** (1) SC-3 "드래그 지연 0ms (60fps)" — physically impossible. 60fps = 16.7ms per frame. Should be "≤16ms (1 frame)" or "시각적 즉시 반응 (60fps 유지)". (2) EM-2 L1277 "모나코 에디터" — zero Monaco in architecture.md or any package.json. Monaco Editor is ~5-10MB. This is an unplanned dependency carry-forward from Step 6 soul-editor.tsx, not a Step 7 error but perpetuates it. (3) SC-2 FCP/TTI tension with architecture "/ws/office ≤2초 동기화" — see D4. |
| D4 Implementability | 7/10 | **20%** | EM-1 processing flow maps closely to actual `engine/agent-loop.ts` execution (Secretary → handoff → parallel → combine). SC-1~5 measurement methods reference real codebase structures (`activity_logs`, `agent_memories`, `costs` table). EM-4 wizard timeboxing (6 steps, ≤15min total) is concrete. **Gaps:** (1) **FCP/TTI tension**: Architecture says `/ws/office ≤2초 동기화`. SC-2 says FCP(shell) ≤1.5s + TTI(characters+WS) ≤3s. If WS initial sync takes up to 2s AND shell paint takes 1.5s, sequence total = 3.5s > 3s TTI. Either WS sync and shell paint must overlap (parallel load), or WS sync target must be <1.5s. This is ambiguous and could mislead implementation — specify: "FCP 1.5s 이후 WS 연결 시작, ≤1.5s 내 동기화 완료 → TTI ≤3s". (2) **SC-3 "0ms"**: Not implementable. (3) **EM-1 [0.5초] Secretary routing**: Depends on LLM TTFT — Haiku ~300ms (achievable), Sonnet ~1s (not achievable). Spec should note dependency on Secretary model tier. (4) **Monaco Editor**: Unplanned ~5-10MB dependency. For Soul editing (Admin app only), acceptable but architecture decision needed. |
| D5 Consistency | 9/10 | 15% | SC-1~5 are quantitative versions of Step 3 CSM-1~5 — excellent traceability. FCP/TTI split consistent with Step 2 revision. Mental model tables consistent with Step 2 target users (CEO 김도현, Admin 이수진). EM-2 Ctrl+Z 10회 consistent with Step 3 EP-2. WS reconnect 3s×5 consistent across all steps. "Controlled Nature" metaphor ("AI 조직 = 소규모 회사") consistent with Step 4 emotional design. IC-1~3 consistent with Step 3 EI-1~5 interaction patterns. |
| D6 Risk | 7/10 | 10% | All 4 EMs have Error Paths (3 each = 12 total error scenarios). Good diversity: routing failure, timeout, WS disconnect, destructive actions, undo, syntax error, cron failure, security violation, cost overrun, wizard timeout, token failure. **Missing:** (1) Concurrent editing (two Admins editing same agent — Quinn-2 flagged in Step 3). (2) PixiJS WebGL failure fallback in EM-1 /office section (DC-1 has list view fallback, not referenced here). (3) Rate limiting UX (10 msg/s architecture constraint). (4) /office with 0 agents scenario (before any agents are created). |

---

## Weighted Average

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 8 | 0.15 | 1.20 |
| D3 | 8 | 0.25 | 2.00 |
| D4 | 7 | 0.20 | 1.40 |
| D5 | 9 | 0.15 | 1.35 |
| D6 | 7 | 0.10 | 0.70 |
| **Total** | | | **8.00/10 PASS — Grade B achieved (also meets Grade A threshold)** |

---

## Issue List (Priority Order)

### Must Fix

1. **[D3/D4 Accuracy/Implementability] SC-3 "드래그 지연 0ms (60fps)"** — Physically impossible. 60fps = 16.7ms minimum frame interval. `requestAnimationFrame` callback fires once per frame, so the minimum perceivable latency is 16.7ms. Fix: "프레임 누락 없음 (60fps 유지, ≤16.7ms/frame)" or simply "시각적 지연 없음 (60fps)". The "(60fps)" already implies the performance target.

2. **[D4 Implementability] SC-2 FCP/TTI timing overlap ambiguity** — Architecture: `/ws/office ≤2초 동기화`. SC-2: `FCP(shell) ≤1.5s + TTI(characters+WS) ≤3s`. If sequential: 1.5s(shell) + 2s(WS) = 3.5s > 3s TTI. **Must clarify**: does shell paint and WS connection happen in parallel? Recommend: "React shell 렌더링과 WebSocket 연결은 병렬 실행. Shell paint (FCP ≤1.5s) 동안 WS handshake 시작 → 캐릭터 데이터 수신 → 렌더 (TTI ≤3s)". This makes the timing feasible and implementation-clear.

### Should Fix

3. **[D4 Implementability] EM-1 [0.5초] Secretary routing — model dependency** — 0.5초 for Secretary routing completion (L1234) depends on the Secretary agent's LLM model. Haiku (~300ms TTFT) makes this achievable; Sonnet (~1s TTFT) does not. Since architecture specifies tier-based model assignment, add note: "(Secretary = Haiku tier 기준. Sonnet+ tier는 ~1.5초)". This prevents false performance expectations.

4. **[D3 Accuracy — carry-forward] EM-2 "모나코 에디터" = unplanned dependency** — L1277: "모나코 에디터에 Soul 템플릿 로드". Monaco Editor (`@monaco-editor/react`) is zero matches in `architecture.md` and any `package.json`. Bundle size ~5-10MB gzipped. Step 6 L865 introduced `soul-editor.tsx ← Monaco-lite` without architecture backing. Two options: (a) Use simple `<textarea>` with syntax highlighting (CodeMirror 6 at ~100KB is lighter), or (b) Add Monaco as architecture decision like Radix. For Admin-only feature, acceptable either way but should be explicitly noted as "v3 신규 의존성".

5. **[D2/D6 Completeness/Risk] Rate limiting UX missing** — Architecture specifies 10 msg/s rate limit. CEO hitting this limit gets... what? 429 error? Debounce? Queue? This is a real UX scenario for enthusiastic users. Add to EM-1 Error Path or as SC-1 sub-criterion.

### Nice to Have

6. **[D6 Risk] EM-1 /office WebGL fallback** — EM-1 describes /office visual flow (L1240-1245) but doesn't reference the list view fallback for WebGL-unsupported browsers (DC-1). Add one-liner: "WebGL 미지원 시 DC-1 리스트 뷰 fallback → 텍스트 기반 상태 표시".

7. **[D6 Risk] Concurrent editing** — Quinn-2 flagged in Step 3: two Admins editing same agent's Big Five simultaneously. EM-2 doesn't address this. "last-write-wins" or "optimistic locking" decision needed for Soul/Big Five save.

8. **[D2 Completeness] Chat session management EM** — How does conversation history work? Thread-based? Single stream? Context window management? This is core to the "One Interaction" but has no EM definition. Acceptable deferral to wireframe step but should note "Step 8에서 상세화".

---

## Cross-talk Notes

- **SC-1 routing 80%**: All critics should verify against PRD:386 — "첫 시도 80%+, Soul 튜닝 후 95%+". Step 7 matches exactly.
- **SC-4 reflected=false 20건**: PRD:376 + PRD:597 both confirm. This is an architecture-level threshold, not a UX decision.
- **SC-5 ≤15분**: PRD:391 confirms. Step 7's 6-step wizard with per-step time budgets (1+3+3+3+3+2=15min) is a good breakdown.
- **EM-1 flow vs agent-loop.ts**: The processing flow (Secretary→handoff→parallel→combine) matches the actual `engine/agent-loop.ts` execution pattern. The timing annotations ([0.5초] routing, [1-2초] handoff, [3-20초] execution) are plausible for Haiku-tier agents. Winston should verify against architecture's NFR-P6 "각 단계 ≤15초" and NFR-P8 "120초 전체 타임아웃".
- **Monaco Editor**: Architecture doesn't mention it. **Quinn-2 confirmed**: Monaco web screen reader support is incomplete (aria-label gaps, autocomplete a11y issues). However, Soul editing requires `{{variable}}` autocomplete → Monaco is reasonable choice. **Recommendation**: Monaco + `accessibilitySupport: 'on'` default + keyboard shortcut guide button. Pre-Sprint: Monaco vs CodeMirror 6 screen reader test. Fallback to CodeMirror 6 if a11y issues recur in Sprint.
- **"0ms" slider**: **Quinn-2 confirmed**: "0ms" is NOT a WCAG requirement — WCAG 2.5.1 requires single-pointer alternative (Radix Arrow keys ✅). 60fps is the correct implementable metric. "0ms" is a meaningless perf claim.
- **Rate limiting UX**: **Quinn-2 recommendation** (WCAG 4.1.3): rate limit alert = `aria-live="assertive"` + `role="alert"` (NOT toast). Inline error below Chat input: "요청 제한 초과 — N초 후 재시도 가능" + `aria-invalid="true"` + countdown. This pattern resolves both rate limit UX gap AND a11y requirement. Sally should add to EM-1 Error Path.
- **IC-1~3 patterns**: These innovative combinations are well-constructed but are descriptive, not prescriptive. Dev needs to know: does IC-1 (Chat × /office) require split-screen layout? Or just "open in separate tab"? Step 8 wireframes should clarify layout.
- **John confirmed**: 15초 timeout = PRD NFR-P6 requirement, NOT implemented in agent-loop.ts. Sprint 1 implementation needed.
- **Winston aligned**: (1) fps 30/60 = defer to Sprint 4 benchmark, remove false architecture constraint. (2) IC-3 Reflection→/office = 6-hop indirect path confirmed, add "(Soul enrichment 간접 효과)" note. (3) D26 polling confirmed, "폴링 기반 최대 500ms" explicit wording better.
- **EM-1 timing [0.5초]**: Aspirational target (Haiku tier ~300ms TTFT). Not SLA. Sonnet tier ~1s would fail this target. Should note model dependency.

---

## Verdict

**8.00/10 — PASS (Grade B achieved, Grade A borderline)**

Strong defining experience document. The "One Interaction" framing is compelling and actionable. Mental models (CEO = "real company", Admin = "HR+IT") are concrete with confusion-point tables. SC-1~5 are excellent — all quantitative, all traceable to PRD NFRs, all with measurement methods. EM-1~4 have complete Initiation→Error Path flows. Novel/Established classification is thorough.

The FCP/TTI timing ambiguity (sequential vs parallel with WS sync) is the most critical implementability gap. "0ms" slider claim and Monaco dependency are carry-forward issues. Rate limiting UX is a real-world gap. All fixable in one pass.

---

## Re-Score After Fixes (Round 2)

**sally's 12 fixes applied.** Re-read updated file (lines 1009-1435). Verification:

### Fix Verification

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | SC-3 "0ms" → 60fps | ✅ Fixed | L1139: "프레임 누락 없음 (60fps 유지)". Correct implementable metric. |
| 2 | SC-2 FCP/TTI parallel | ✅ Fixed | L1129: "Shell 렌더링(FCP)과 WebSocket 연결(TTI)은 **병렬 실행**한다." + timing math (1.5+2=3.5s if sequential). Clear, explicit. |
| 3 | Secretary Haiku tier | ✅ Fixed | L1241: "(Secretary = Haiku tier 기준 ~300ms. Sonnet tier 사용 시 ~1s로 증가 가능)". Model dependency noted. |
| 4 | Monaco → CodeMirror 6 | ✅ Fixed | L1292-1293: Generic "코드 에디터" + "(에디터 선택: CodeMirror 6 (~100KB) 권장. Monaco (~5-10MB)는 번들 크기 과대 — v3 신규 의존성이므로 Architecture Decision 필요)". Both options, architecture gate. Excellent. |
| 5 | Rate limit UX | ✅ Fixed | L1263: Added to EM-1 Error Path. Send 버튼 비활성 + cooldown. |
| 6 | EM a11y DC-N refs | ✅ Fixed | L1265, L1308, L1353, L1400, L1433: All 5 EMs have `[접근성: ...]` referencing specific Step 2 DCs. |
| 7 | Secretary 3-step fallback | ✅ Fixed | L1256-1260: Soul rules → 부서 tags → pre-routing table. Misroute detection + CEO feedback + Admin alert (3+ same pattern). Thorough. |
| 8 | SC-4 confidence ≥0.7 | ✅ Fixed | L1152: "reflected=false AND confidence ≥ 0.7 (PRD FR-MEM3, Architecture D28)". Exact source citation. |
| 9 | EM-5 n8n workflow | ✅ Fixed | L1405-1434: NEW EM added. Preset install, customize, execution feedback, 3 error paths (OOM, external API, timeout+fallback). Complete. |
| 10 | EM-4 WOW fallback | ✅ Fixed | L1389-1393: Auto-demo task trigger when 0 active agents on CEO first visit. Smart fallback preventing empty /office. |
| 11 | Big Five expectation | ✅ Fixed | L1146: Extreme values more noticeable, A/B preview comparison, mid-range caveat. |
| 12 | Novel re-education | ✅ Fixed | L1202: `?` icon per page + Settings re-tutorial + Hub help links. |

### Additional Improvements (beyond requested fixes)

- **SC-2 fps**: L1127 "Sprint 4 성능 테스트에서 최종 확정" — addresses Winston's recurring fps concern (3 steps without D-number). No longer a false architecture constraint.
- **SC-4 "v3 UX 신규 제안"**: L1154 — honest labeling of new metric not in PRD. Good transparency.
- **EM-4 onboarding time derivation**: L1402 — "PRD Journey 4 ~10min + v3 additions = ≤15min". Traceable.
- **EM-2 Ctrl+Z**: L1305 "(EP-2 안전망 — v3 UX 신규 제안)" — honest v3 origin label.

### Remaining Minor Notes (non-blocking)

1. **Rate limit "10 msg/s"** (L1263): This references WS channel rate (`/ws/office`). CEO Chat is REST API = 60 req/min. The UX pattern (cooldown + disabled button) is correct regardless, but the number source may confuse implementers. Should say "REST API 60 req/min" for Chat context.
2. **EM-1 aria-live "assertive"** (L1265): Quinn-2 converged on `"polite"` for Chat context (Chat already has aria-live region, additional assertive may be excessive). Minor.
3. **IC-3 indirect effect** (L1337): "도구 사용 빈도 증가" still lacks "(Soul enrichment를 통한 간접 효과)" annotation per Winston/Dev consensus. PixiJS reads activity_logs state field, not Reflection directly — 6-hop indirect path. Minor for UX doc.
4. **EM-3 Voyage API failure**: Error path (L1350) doesn't distinguish internal vs external (Voyage API) failure per Quinn-2/Dev consensus. Non-blocking — general "크론 실패" handling covers both functionally.

### Updated Dimension Scores

| Dimension | R1 | R2 | Weight | Change Rationale |
|-----------|-----|-----|--------|-----------------|
| D1 Specificity | 9 | **9** | 15% | Was already strong. SC-4 confidence citation adds precision. |
| D2 Completeness | 8 | **9** | 15% | EM-5 n8n flow added (+1 EM, 5 total). Re-education path. WOW fallback. Big Five expectation management. A11y DC refs in all EMs. Significant improvement. |
| D3 Accuracy | 8 | **9** | 25% | SC-3 "0ms" fixed. SC-4 confidence ≥0.7 with PRD/arch citation. Secretary tier noted. fps deferred to Sprint 4 (removes false constraint). Rate limit "10 msg/s" vs REST 60 req/min is minor inaccuracy. |
| D4 Implementability | 7 | **9** | 20% | FCP/TTI parallel execution explicitly specified — removes the most critical ambiguity. CodeMirror 6 recommendation with architecture gate. Rate limit UX concrete (cooldown + disabled button). EM-5 n8n flow is directly implementable. WOW fallback auto-demo is implementable. Secretary 3-step fallback maps to architecture. |
| D5 Consistency | 9 | **9** | 15% | SC-4 now cites PRD FR-MEM3 + Architecture D28. fps "Sprint 4 확정" removes inconsistency with architecture. EM-4 onboarding time traces to PRD Journey 4. |
| D6 Risk | 7 | **8** | 10% | Secretary 3-step fallback (L1256-1260). WOW fallback for empty /office (L1389-1393). Rate limit error path. EM-5 covers n8n OOM + external API + timeout. Voyage API failure still generic in EM-3 but functionally covered. |

### Weighted Average (Round 2)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 | 9 | 0.15 | 1.35 |
| D2 | 9 | 0.15 | 1.35 |
| D3 | 9 | 0.25 | 2.25 |
| D4 | 9 | 0.20 | 1.80 |
| D5 | 9 | 0.15 | 1.35 |
| D6 | 8 | 0.10 | 0.80 |
| **Total** | | | **8.90/10 PASS — Grade A** |

**Score comparison across all steps reviewed:**
| Step | R1 | R2 | Grade |
|------|-----|-----|-------|
| Step 2 (Discovery) | 7.95 | 8.70 | A |
| Step 3 (Core Experience) | 7.60 | 8.80 | A |
| Step 6 (Design System) | 7.15 | 8.25 | A |
| Step 7 (Deep Dive) | 8.00 | **8.90** | **A** |

**Final verdict: 8.90/10 — PASS. Highest R2 score across all steps reviewed. All 12 fixes verified. 5 EMs (up from 4), all with a11y DC references. The FCP/TTI parallel execution clarification (L1129), CodeMirror 6 recommendation (L1293), Secretary 3-step fallback (L1256-1260), and WOW auto-demo fallback (L1389-1393) are standout additions. Four minor items remain (rate limit source, aria-live polite, IC-3 indirect annotation, Voyage error distinction) — all non-blocking.**
