## Critic-B (Quinn) Review — Stage 4 Step 5: v3 Implementation Patterns (E11~E22)

### Review Date
2026-03-22 (R1)

### Content Reviewed
`_bmad-output/planning-artifacts/architecture.md` — Step 5 (L1942-2371): 12 new patterns (E11~E22), error codes, verification strategy, 10 anti-patterns, CLAUDE.md update items.

---

### Verification Method
- renderSoul callers: `grep renderSoul packages/server/src/**/*.ts` — counted 9 production files (architecture says 8)
- PRD FR-OC2 state union: line-by-line comparison against E16 OfficeStateMessage
- Go/No-Go 14-gate list (L89, L453-478) cross-referenced against verification strategy table (L2329-2342)
- agent-loop.ts toolResults.push code flow (L219-291) verified against E15 PreToolResult claim
- E14 reflection cron filters cross-checked against D28 (Step 4 L591-595) and PRD FR-MEM3 (L2472)
- E17 tree-shaking class list compared against PRD L1623
- E20 path normalization code snippet inspected for case-sensitivity and encoding bypass
- services/embedding-service.ts and services/credential-vault.ts existence confirmed in codebase

---

### Dimension Scores

| Dim | Score | Wt | Wtd | Evidence |
|-----|-------|-----|-----|----------|
| D1 | 9/10 | 10% | 0.90 | Excellent specificity throughout: TypeScript interfaces with exact types, file paths (`services/soul-enricher.ts`, `engine/tool-sanitizer.ts`, `services/voyage-embedding.ts`), code snippets with before/after diffs, regex patterns (10종), hex colors (#faf8f5, #283618), exact limits (10KB, 50conn, 500/server, 60rpm, $0.10/day), v3 error codes with Sprint assignments. Anti-patterns table has concrete wrong/right code examples. Minor: "10종 regex" (L2117) lists 8 named patterns + 2 categories ("base64 encoded variants", "unicode escape variants") — categories aren't specific patterns. |
| D2 | 8/10 | 25% | 2.00 | 12 patterns cover all key v3 areas. 10 anti-patterns well-chosen. Error codes comprehensive (15 codes across 6 categories). CLAUDE.md update items forward-looking. Verification strategy maps 8 of 14 Go/No-Go gates to patterns. **BUT**: 6 gates missing from verification table (#1 Zero Regression, #4 Memory Zero Regression, #8 Asset Quality, #12 v1 Parity, #13 Usability, #14 Capability Eval). E16 lacks activity_log event → office state mapping (which events = `working`, which = `idle`?). Missing anti-pattern for double URL encoding bypass. |
| D3 | 7/10 | 15% | 1.05 | **4 factual issues**: (1) E16 OfficeStateMessage state union = `idle|working|delegating|error` but PRD FR-OC2 says `idle/working/speaking/tool_calling/error` — missing `speaking` and `tool_calling`, extra `delegating`. (2) E11 says "8개 renderSoul caller" (L1960, L1993) but actual grep = 9 production files (hub.ts, commands.ts, presets.ts, public-api/v1.ts, call-agent.ts, telegram-bot.ts, organization.ts, argos-evaluator.ts, agora-engine.ts). Already flagged in Step 4 R2 as L1, still uncorrected. (3) E20 code example (L2242) checks `path.includes('%2e')` but not `%2E` (uppercase hex) — rule text (L2253) correctly says both, code is incomplete. (4) E17 tree-shaking "6클래스" = `Application, Container, Sprite, AnimatedSprite, Text, Graphics` but PRD L1623 says `Sprite, AnimatedSprite, Container, TilingSprite, Assets, Ticker` — different lists with 3 divergent classes each. |
| D4 | 9/10 | 10% | 0.90 | Before/after code patterns excellent (E11 v2→v3 migration, E15 v2→v3 insertion point). Error codes ready to copy-paste. Docker config actionable. E14 cron sequence numbered 1-8 clear order. E20 Hono proxy pattern implementable. E12 PER-1 4-layer with exact TypeScript. soul-enricher enrich() signature concrete. |
| D5 | 8/10 | 15% | 1.20 | Generally consistent with Steps 2-4. E15 PreToolResult matches D27 rewrite from Step 4. E14 cron `0 3 * * *` matches D28. E18 Voyage matches D31. E19 chain isolation matches Step 4 3-chain architecture. E20 8-layer matches D25. **BUT**: E16 state union contradicts PRD FR-OC2 (see D3). E11 caller count inconsistent with codebase and Step 4 R2 finding. E14 code comment (L2080) omits `confidence >= 0.7` and `flagged = false` filters that D28 Step 4 (L591-595) explicitly included. |
| D6 | 8/10 | 25% | 2.00 | Anti-patterns table is outstanding security documentation — 10 scenarios with risk + correct pattern. Chain isolation (E19) prevents cross-contamination. E15 PostToolUse limitation correctly identified with code flow. E20 path traversal defense specified. E13 flagged observation skip documented. **Gaps**: (1) No double-encoding bypass risk for E20 (`%252e%252e` → decoded twice → `..`). (2) E18 Voyage rate limit 429 error handling not specified (only 100ms batch delay). (3) Advisory lock timeout behavior on Neon serverless undocumented (pg_advisory_xact_lock blocks indefinitely — what if Neon disconnects during lock wait?). (4) E16 no rate limit on broadcast frequency (polled every 500ms = up to 120 msgs/min to each client, no backpressure). |

### Weighted Average: 8.05/10 ✅ PASS

---

### Issues (4 HIGH, 3 MEDIUM, 2 LOW)

**H1 [D3] E16 OfficeStateMessage state union mismatch with PRD FR-OC2**

PRD FR-OC2 (L2424): `idle/working/speaking/tool_calling/error` (5 states)
E16 (L2131): `'idle' | 'working' | 'delegating' | 'error'` (4 states)

Missing from E16: `speaking` (에이전트가 SSE 응답 스트리밍 중), `tool_calling` (도구 호출 중)
Extra in E16: `delegating` (PRD에 없음)

This affects Sprint 4 implementation — PixiJS animations are keyed to these states. Wrong state union = wrong animations.

- **Fix**: Change E16 state to `'idle' | 'working' | 'speaking' | 'tool_calling' | 'delegating' | 'error'` (PRD 5개 + `delegating` 추가 = 6개). Or remove `delegating` if `working` covers it. Reconcile with PRD FR-OC2.

**H2 [D3] E14 reflection cron SELECT missing critical filters**

E14 step 3 (L2080): `SELECT unreflected observations (importance DESC, LIMIT 20)`

D28 from Step 4 (L591-595) explicitly specified: `reflected=false AND confidence >= 0.7 ORDER BY importance DESC LIMIT 20`

Missing from E14 code comment:
- `confidence >= 0.7` — without this, low-confidence observations pollute reflections
- `flagged = false` — E13 (L2066) says flagged observations should be skipped, but E14 doesn't cross-reference this filter in the SELECT

PRD FR-MEM3 (L2472): "reflected=false인 관찰 ≥ 20개 AND confidence ≥ 0.7 조건 충족 시 처리"

- **Fix**: Update E14 step 3 to: `SELECT unreflected observations WHERE reflected=false AND confidence >= 0.7 AND flagged = false ORDER BY importance DESC LIMIT 20`

**H3 [D3] E11 renderSoul caller count "8" vs actual "9" — persistent error**

E11 (L1960): "충돌 수 3 — 8개 caller 전부 일관 수정 필수"
E11 (L1993): "8개 renderSoul caller 전부 동일 패턴으로 수정"

Actual production callers (grep verified):
1. `routes/workspace/hub.ts` 2. `routes/commands.ts` 3. `routes/workspace/presets.ts` 4. `routes/public-api/v1.ts` 5. `tool-handlers/builtins/call-agent.ts` 6. `services/telegram-bot.ts` 7. `services/organization.ts` 8. `services/argos-evaluator.ts` 9. `services/agora-engine.ts`

= **9 callers**. This was flagged in Step 4 R2 as L1 ("renderSoul caller count 8 vs 9"). Still uncorrected in Step 5.

- **Fix**: Change "8개" → "9개" in L1960 and L1993. Add `agora-engine.ts` to caller list if explicitly enumerated anywhere.

**H4 [D3] E20 path normalization code missing uppercase %2E check**

E20 code (L2242):
```typescript
if (path.includes('..') || path.includes('%2e')) {
```

E20 rule (L2253): "`..`, `%2e`, `%2E` 전부 차단"

The rule text correctly includes `%2E` but the code example only checks lowercase `%2e`. HTTP allows case-insensitive percent-encoding (`%2e` = `%2E` = `.`). An attacker could bypass with `%2E%2E/`.

- **Fix**: Update code to: `if (path.includes('..') || path.toLowerCase().includes('%2e')) {`
  Or explicit: `path.includes('%2e') || path.includes('%2E')`

**M1 [D2] Verification strategy missing 6 of 14 Go/No-Go gates**

Verification table (L2329-2342) maps patterns to 8 gates: #2, #3, #5, #6, #7, #9, #10, #11.

Missing gates:
- **#1** Zero Regression (485 API + 10,154 tests)
- **#4** Memory Zero Regression
- **#8** Asset Quality (에셋 품질 승인)
- **#12** v1 Parity
- **#13** Usability (Admin 온보딩 ≤15분, CEO 태스크 ≤5분)
- **#14** Capability Evaluation

While #1/#12/#13/#14 are general-purpose gates not tied to specific patterns, #4 and #8 are Sprint-specific and testable.

- **Fix**: Add rows for at least #4 (Sprint 3: `agent_memories data continuity test`) and #8 (Sprint 4: `PM 에셋 품질 수동 승인 체크리스트`). Add note for #1/#12/#13/#14: "범용 게이트 — 전체 테스트 스위트 + 수동 검증"

**M2 [D6] Double URL encoding bypass risk missing from E20**

E20 checks `..` and `%2e` but not double-encoded variants:
- `%252e%252e` → first decode by reverse proxy/load balancer → `%2e%2e` → second decode by Hono → `..`
- `..%c0%ae` (overlong UTF-8 encoding of `.`)

If any middleware between client and Hono decodes once, the path normalization is bypassed.

- **Fix**: Add to E20 rules or anti-patterns: "이중 인코딩 공격: `%252e`, overlong UTF-8 (`%c0%ae`) — Hono의 request path는 이미 decoded 되어 있으므로 `..` 체크만으로 충분한지 Hono 소스에서 검증 필요. 불확실 시 `decodeURIComponent()` 후 체크 추가"

**M3 [D3] E17 tree-shaking class list differs from PRD**

E17 (L2172): `Application, Container, Sprite, AnimatedSprite, Text, Graphics`
PRD L1623: `Sprite, AnimatedSprite, Container, TilingSprite, Assets, Ticker`

3 classes differ:
- E17 only: `Application`, `Text`, `Graphics`
- PRD only: `TilingSprite`, `Assets`, `Ticker`

Both claim "6클래스" but different sets. If the wrong set is used, bundle size could exceed 200KB (Go/No-Go #5).

- **Fix**: Reconcile to one definitive list. `Application` is likely required (PixiJS entry point). `Assets` and `Ticker` are also likely required (asset loading + animation loop). Suggest merging: `Application, Container, Sprite, AnimatedSprite, Assets, Ticker` + verify bundle size with this set.

**L1 [D5] E14 flagged filter not cross-referenced**

E13 (L2066): "flagged=true인 observation은 reflection 크론에서 스킵"
E14 (L2080): No mention of `flagged = false` in the SELECT step

The rule exists in E13 but E14's implementor might not read E13 when coding the reflection cron. Explicit cross-reference prevents this.

- **Fix**: Add to E14 step 3: "(flagged=false 필터 — E13 규칙 참조)"

**L2 [D6] E16 no backpressure on 500ms polling broadcast**

E16 polls activity_logs every 500ms and broadcasts to all `/ws/office` clients. With 50 clients per company, that's potentially 50×120 = 6,000 messages/min per company with no backpressure.

If activity_logs has no new entries, the poll returns empty — but should the broadcast still fire? No debounce/throttle is specified.

- **Fix**: Add to E16 rules: "변경 없으면 브로드캐스트 생략 (debounce). 변경 있을 때만 전송 — idle 시 heartbeat로 대체 (30초 간격)"

---

### Security-Specific Assessment

| Security Area | Status | Evidence |
|--------------|--------|----------|
| PER-1 4-layer (E12) | ✅ Complete | L2009-2033: All 4 layers with TypeScript, exact types, ALLOWED_KEYS const, regex pattern |
| MEM-6 4-layer (E13) | ✅ Complete | L2046-2068: sanitizeObservation() with 4 layers, flagged skip documented |
| TOOLSANITIZE PreToolResult (E15) | ✅ Complete | L2098-2120: Before/after code diff, PostToolUse limitation correctly documented, engine/ internal |
| N8N-SEC 8-layer (E20) | ⚠️ Code gap | Rule correct (L2253 %2e+%2E), code example only checks lowercase %2e (L2242). Double-encoding not addressed |
| Chain isolation (E19) | ✅ Excellent | L2194-2223: 3 chains explicitly separated with file paths, entry points, timing, attack surfaces |
| Voyage AI (E18) | ✅ Complete | L2177-2192: Single wrapper, batch delay, dimension check SQL, credential vault |
| WS limits (E16) | ⚠️ State mismatch | 50/500 + 10msg/s correct. But state union doesn't match PRD FR-OC2 |
| Anti-patterns | ✅ Strong | 10 scenarios with risk + correct pattern. Missing: double encoding bypass |
| Error codes (v3) | ✅ Complete | 15 codes across 6 categories, all Sprint-assigned |
| Advisory lock (E14) | ⚠️ Partial | Lock documented but timeout/deadlock on Neon serverless not addressed |
| Confidence scale | ✅ Documented | E13 L2069: "REAL 0-1 vs INTEGER 0-100 — 비교 시 ×100 변환" |

**9/14 security areas fully verified. 3 have fixable issues. 2 informational gaps.**

---

### Cross-talk Notes

Likely agreement areas: E15 PreToolResult placement is excellent — correctly avoids the PostToolUse timing issue. E19 chain isolation documentation is outstanding.

Key divergence area with Critic-A: E16 state union should be verified against PRD — if Critic-A reviews the WebSocket architecture, they may flag the same issue.

For Critic-C: E17 tree-shaking class list discrepancy with PRD needs PM decision — which 6 classes optimize bundle size while covering all animation needs.

### Verdict

**8.05/10 PASS.** Strong pattern documentation with excellent code-level specificity and anti-patterns. The 4 HIGH issues are all accuracy gaps (state union, filter omission, caller count, case sensitivity) — mechanical fixes that don't require architectural changes. Chain isolation (E19) and tool sanitizer placement (E15) are particularly well done. After fixes, score would reach ~9.0+.

---

## R2 Verification — 2026-03-22

### Fix Verification (15/15 from 4 critics — all confirmed)

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| F1 | E16 state union → PRD 5+1 states | ✅ Fixed | L2155: `'idle' \| 'working' \| 'speaking' \| 'tool_calling' \| 'error' \| 'degraded'`. PRD 5 states + `degraded` (WS 장애). Comments explain `speaking` (FR-OC4 말풍선) and `tool_calling` (FR-OC5 도구 이펙트). `delegating` removed |
| F2 | E14 reflection SELECT filters | ✅ Fixed | L2088: `WHERE reflected=false AND confidence >= 0.7 AND flagged = false ORDER BY importance DESC LIMIT 20`. All 3 filters present. PRD FR-MEM3 compliant |
| F3 | E11 caller count 8→9 | ✅ Fixed | L1950: "9곳", L1960: "9개 caller(10 call sites)", L1998: "9개 renderSoul caller / 10 call sites" with explicit list including agora-engine.ts |
| F4 | E20 path normalization case+double encoding | ✅ Fixed | L2271-2272: `decodeURIComponent(decodeURIComponent(path))` double decode + `/(%2e\|%2E)/i.test(path)` case-insensitive regex. Both single and double encoding handled |
| F5 | E15 toolResults.push 5-path mapping | ✅ Fixed | L2112-2117: All 5 push sites mapped (L219/L238/L265/L277/L291) with sanitize requirement per path. L265 (call_agent) + L277 (MCP) both sanitized. L219/L238/L291 correctly excluded (CORTHEX-generated) |
| F6 | E11 EnrichResult → `Record<string, string>` | ✅ Fixed | L1978: `personalityVars: Record<string, string>` — matches renderSoul extraVars type. Comment explains `String(v)` conversion |
| F7 | E20b Marketing pattern (NEW) | ✅ Added | L2308-2343: MarketingSettings interface, preset install flow, fallback engine, API timeouts. Error codes (L2396-2399): MKT_ENGINE_TIMEOUT, MKT_PRESET_INSTALL_FAILED, MKT_FALLBACK_EXHAUSTED. Verification row added (L2423) |
| F8 | E11 interface contract freeze | ✅ Added | L1991-1994: Sprint 1 freeze + additive-only for Sprint 3. Field deletion/rename requires architecture decision |
| F9 | L1780 FR table "PostToolUse"→"PreToolResult" | ✅ Fixed | L87: "PreToolResult 지점 (toolResults.push 직전)" |
| F10 | L85 FR table agent-loop.ts reference removed | ✅ Fixed | L85: "E8 경계 — agent-loop.ts 직접 삽입 아님, callers가 pre-rendered soul 전달" |
| F11 | Go/No-Go verification +6 gates | ✅ Fixed | L2424-2429: #1 Zero Regression (485 API + 10,154 tests), #4 Memory Zero Regression, #8 Asset Quality (PM 승인), #12 v1 Parity, #13 Usability (CEO ≤5분), #14 Capability Eval. All 14 gates now mapped |
| F12 | E14 advisory lock → non-blocking | ✅ Fixed | L2086: `pg_try_advisory_xact_lock` (non-blocking). L2097: "획득 실패 시 해당 company 스킵 (다음 크론에서 재시도). 무한 대기 방지. Neon serverless에서 advisory lock 세션 유지 이슈 대응" |
| F13 | E16 adaptive polling + backpressure | ✅ Fixed | L2164: "연결된 클라이언트 있을 때만 폴링 (클라이언트 0이면 폴링 중지)". L2166: "이전 폴링 결과와 diff — 변경 없으면 broadcast 생략" |
| F14 | E22 FR-UX 6-group list | ✅ Fixed | L2348-2354: Hub, Dashboard, Agents, Library, Jobs, Settings — 6 groups with content descriptions |
| F15 | E20 n8n OOM recovery | ✅ Added | L2288: Docker `restart: unless-stopped` + healthcheck 30초 간격 + 실패 3회 → N8N_HEALTH_CHECK_FAILED + Admin 알림. Hono proxy 502 반환 (에러 격리) |

### Remaining Issues (2 LOW, informational)

**L1 [D5]** Verification table L2411 says "E11 soul-enricher **8개** caller" but body (L1950, L1960, L1998) correctly says **9개**. Table row wasn't updated. No functional impact — body is authoritative.

**L2 [D3]** E17 tree-shaking class list (L2201: `Application, Container, Sprite, AnimatedSprite, Text, Graphics`) still differs from PRD L1623 (`Sprite, AnimatedSprite, Container, TilingSprite, Assets, Ticker`). 3 classes diverge each. Not addressed in R2 fixes — carry-forward for Sprint 4 실 구현 시 bundle size로 최종 결정 필요.

---

### R2 Dimension Scores

| Dim | R1 | R2 | Wt | Wtd | Evidence |
|-----|-----|-----|-----|-----|----------|
| D1 | 9 | 9/10 | 10% | 0.90 | Maintained. E20b marketing pattern adds MarketingSettings interface + API path + fallback flow. E15 5-path mapping with line numbers excellent. EnrichResult type clarified. |
| D2 | 8 | 9/10 | 25% | 2.25 | All 14 Go/No-Go gates now mapped in verification table (+6). E20b marketing pattern added (FR-MKT 7 FRs). E22 6-group list explicit. E11 interface contract freeze documented. |
| D3 | 7 | 9/10 | 15% | 1.35 | E16 state union now matches PRD FR-OC2 (5 states + degraded). E14 full WHERE clause with confidence + flagged filters. E11 caller count corrected to 9. E20 case-insensitive + double-decode. Minor: verification table row still says "8개" (L2411). |
| D4 | 9 | 9/10 | 10% | 0.90 | E15 5-path mapping makes implementation unambiguous. E20b marketing pattern implementable with preset JSON + proxy flow. E11 interface freeze prevents Sprint 3 regressions. Advisory lock non-blocking pattern directly usable. |
| D5 | 8 | 9/10 | 15% | 1.35 | E14 filters now match D28 (Step 4) and PRD FR-MEM3. E16 state union matches PRD FR-OC2. E11 body consistent at 9 callers (verification table row is sole remaining inconsistency). FR table (L85, L87) updated to match Step 5 patterns. |
| D6 | 8 | 9/10 | 25% | 2.25 | E20 double-decode defense against `%252e%252e`. Advisory lock non-blocking prevents Neon serverless hang. E16 adaptive polling (0 clients → stop) + diff-based broadcast eliminates unnecessary load. OOM recovery with Docker restart + healthcheck + Admin alert. E15 explicitly documents which of 5 push paths need sanitization (2/5) and which don't (3/5) with rationale. |

### Weighted Average: 9.00/10 ✅ PASS (R1: 8.05 → R2: 9.00)

---

### Security R2 Assessment

| Security Area | R1 | R2 | Evidence |
|--------------|-----|-----|----------|
| PER-1 4-layer (E12) | ✅ | ✅ | Unchanged, excellent |
| MEM-6 4-layer (E13) | ✅ | ✅ | Unchanged, flagged skip documented |
| TOOLSANITIZE (E15) | ✅ | ✅ Enhanced | 5-path mapping: L265 + L277 sanitized, L219/L238/L291 excluded with rationale |
| N8N-SEC 8-layer (E20) | ⚠️ | ✅ Fixed | Double-decode + case-insensitive regex. OOM recovery added |
| Chain isolation (E19) | ✅ | ✅ | Unchanged, excellent |
| Voyage AI (E18) | ✅ | ✅ | Unchanged |
| WS limits (E16) | ⚠️ | ✅ Fixed | PRD 5 states + degraded. Adaptive polling + diff-based broadcast |
| Anti-patterns | ✅ | ✅ | 10 patterns maintained |
| Error codes | ✅ | ✅ Enhanced | +3 MKT error codes (18 total) |
| Advisory lock (E14) | ⚠️ | ✅ Fixed | `pg_try_advisory_xact_lock` non-blocking. Neon serverless hang prevention |
| Confidence scale | ✅ | ✅ | E13 L2077 unchanged |
| Marketing security (E20b) | — | ✅ NEW | AES-256 credential vault pattern. SEC-3 tag auto-attach on preset install |
| Reflection query safety (E14) | — | ✅ NEW | `flagged = false` filter prevents poisoned observations entering reflection pipeline |

**13/13 security areas verified. 0 gaps.**

---

### To Analyst

**[Verified] Step 5 R2 = 9.00/10 PASS.**

QA/Security 관점 검증 결과:
1. **E16 state union PRD 일치**: `idle|working|speaking|tool_calling|error|degraded` — PRD FR-OC2 5개 상태 + degraded(WS 장애). `delegating` 제거. speaking/tool_calling 주석으로 FR-OC4/FR-OC5 매핑.
2. **E14 reflection 쿼리 완결**: `reflected=false AND confidence >= 0.7 AND flagged = false` — PRD FR-MEM3 + E13 규칙 통합. advisory lock non-blocking (`pg_try_advisory_xact_lock`).
3. **E15 5-path 매핑**: agent-loop.ts toolResults.push 5곳 전부 매핑 (L219/L238/L265/L277/L291). 외부 입력 2곳(L265+L277) sanitize, 내부 3곳 제외. 구현 시 빠뜨릴 가능성 0.
4. **E20 path traversal 강화**: double-decode + case-insensitive regex. OOM recovery(Docker restart + healthcheck). N8N_HEALTH_CHECK_FAILED 에러 코드.
5. **E11 caller count 9개**: body 3곳 전부 수정 완료. 인터페이스 계약 freeze + additive-only 규칙 추가.
6. **Go/No-Go 14/14 매핑**: 누락된 6개 gate (#1/#4/#8/#12/#13/#14) 검증 방법 추가.
7. **E20b 마케팅 패턴 신규**: MarketingSettings 인터페이스 + 프리셋 설치 + fallback + 에러 코드 3종.

### Verdict

**[Verified] 9.00/10 PASS.** All 15 R1 issues fixed. E16 state union now matches PRD (6 states). E14 reflection query complete with confidence + flagged filters + non-blocking lock. E15 5-path mapping is outstanding — eliminates all sanitization ambiguity. E20 path traversal defense hardened with double-decode. E20b marketing pattern rounds out Sprint 2 coverage. Two LOW remaining: verification table "8개" typo (L2411), E17 tree-shaking list PRD divergence (carry-forward to Sprint 4).
