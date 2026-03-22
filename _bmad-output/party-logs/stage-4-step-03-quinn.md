## Critic-B (Quinn) Review — Stage 4 Step 3: Starter Template Evaluation

### Review Date
2026-03-22 ([Verified] R2 FINAL)

### Content Reviewed
`_bmad-output/planning-artifacts/architecture.md` — Step 3 (L240-345): Version audit, v3 packages, inherited decisions, version management strategy.

---

### R1 Summary
6.75/10 FAIL. 3 HIGH: pin strategy mismatch (7 packages), Zod version wrong, claude-agent-sdk missing. 2 MEDIUM: 0.x caret drift, ARM64 CI. 1 LOW: n8n version inconsistency. Winston applied 8 unique fixes from 4 critics.

**R1 Correction**: H2 (Zod version wrong) was Quinn's error. Actual resolved version IS 3.25.76 — the 3.23.8 checked in R1 was a transitive copy at `.bun/zod@3.23.8/`. Both versions coexist in node_modules: direct=3.25.76, transitive=3.23.8.

---

### R2 Independent Verification

#### Fix Verification (8/8 confirmed)

1. **AS-IS/TO-BE columns** [John#2, Dev#1, Bob#2, Quinn#H1]: ✅ Backend table (L261-270) now has `AS-IS Pin` + `TO-BE Pin` columns. All 7 packages show actual caret specifiers matching package.json. Frontend table (L274-281) also has AS-IS/TO-BE. PASS.

2. **n8n Docker 2.12.3** [John#1, Dev#2, Bob#1, Quinn#L1]: ✅ `grep 2.12.2 architecture.md` = 0 matches. All 5 occurrences show 2.12.3. PASS.

3. **PixiJS 8.17.1** [John#3]: ✅ L287 shows 8.17.1, matching PRD pin. PASS.

4. **Zod version clarified** [Quinn#H2]: ✅ L267: "3.25.76 (server)" — independently verified via `node_modules/.bun/zod@3.25.76/`. Note about "3.23.8도 transitive로 존재" also verified (`node_modules/.bun/zod@3.23.8/` exists). TO-BE changed to caret (3.x = SemVer stable). PASS. (Quinn R1 H2 was incorrect — retracted.)

5. **claude-agent-sdk added** [John#4, Bob#3, Quinn#H3]: ✅ L269: `@anthropic-ai/claude-agent-sdk | 0.2.72 | 0.2.72 (exact ✅) | exact | 0.2.x`. engine/agent-loop.ts reference. "유일한 정확 pin" noted. PASS.

6. **@google/generative-ai flagged** [discovered during fix]: ✅ L270: Strikethrough `~~@google/generative-ai~~` with 🔴 "Gemini 금지 (확정 결정 #1)". Pre-Sprint 즉시 제거. Bonus discovery — good catch. PASS.

7. **Pre-Sprint pin correction + tasks** [John#5, Dev#3, Bob#M5, Quinn#M1]: ✅ Pre-Sprint expanded 4→7 tasks (L337-344). Version Management Strategy rewritten (L316-331) with AS-IS problems section + TO-BE 8-rule system. PASS.

8. **PixiJS ARM64 CI constraint** [Quinn#M2]: ✅ L293: "ARM64 CI 제약" documented with Playwright soft GPU and bundle-size-only CI alternatives. PASS.

#### Remaining Issue (1 LOW)

**L1 [D5] Zod TO-BE inconsistency**: Backend table L267 says Zod TO-BE = "caret ✅", but Version Management TO-BE Rule #1 (L324) lists `zod` in the exact pin group ("0.x 또는 서버 핵심 패키지 전부"). Table says caret, rule says exact — pick one. Since Zod 3.x is SemVer stable (major ≥1), caret is correct per Rule #2. Remove `zod` from Rule #1 list, or change table TO-BE to exact with rationale.

---

### Verification Method
- Actual package.json files inspected (`packages/server/package.json`, `packages/app/package.json`, root `package.json`)
- `node_modules/*/package.json` resolved versions verified via filesystem
- `bun --version` checked (1.3.10 ✅)
- `package.json` pin strategy (caret vs exact) compared against architecture claims
- Anthropic SDK packages enumerated from server/package.json

---

### Dimension Scores (R2)

| Dim | Score | Wt | Wtd | Evidence |
|-----|-------|-----|-----|----------|
| D1 | 9/10 | 10% | 0.90 | AS-IS/TO-BE with specific caret notations from actual package.json. 7 Pre-Sprint tasks with concrete version targets. Dual Zod resolution documented. voyage-client.ts path. PixiJS tree-shaking 6 classes. |
| D2 | 9/10 | 25% | 2.25 | claude-agent-sdk added (L269). @google/generative-ai flagged with deletion plan (L270, bonus). Pre-Sprint 4→7 tasks. 10 inherited decisions. Both Anthropic SDKs now in table with role distinction. |
| D3 | 9/10 | 15% | 1.35 | All pin strategies match reality — AS-IS column reflects actual package.json verbatim. Zod 3.25.76 independently confirmed (node_modules/.bun/zod@3.25.76/). n8n unified to 2.12.3 (5 occurrences, 0 for 2.12.2). PixiJS 8.17.1 matches PRD. |
| D4 | 9/10 | 10% | 0.90 | Pre-Sprint tasks ordered logically: pin correction → deletion → install → update → verify. Each with concrete version target and rationale. CLAUDE.md violation explicitly called out. |
| D5 | 8/10 | 15% | 1.20 | n8n version unified across all sections. Pin strategy AS-IS/TO-BE now consistent. Minor: Zod TO-BE says "caret ✅" in table but Rule #1 (L324) lists `zod` for exact — pick one. |
| D6 | 9/10 | 25% | 2.25 | ARM64 CI constraint with Playwright soft GPU alternative (L293). CLAUDE.md "no ^" violation flagged (L268/318). @google/generative-ai as active 확정 결정 #1 violation (L270/319). 0.x caret drift → Pre-Sprint fix. Drizzle 0.39→0.45 upgrade risk with "현행 유지" fallback. |

### Weighted Average: 8.85/10 ✅ PASS

---

### Issues (3 HIGH, 2 MEDIUM, 1 LOW)

**H1 [D3] Pin strategy claims vs package.json reality — 7 packages**

Architecture "Pin Strategy" column says "exact" for these packages, but actual package.json uses caret (`^`):

| Package | Architecture claims | Actual package.json | Risk |
|---------|-------------------|-------------------|------|
| `hono` | exact | `"^4"` | ^4 allows any 4.x (minor+patch) |
| `drizzle-orm` | exact | `"^0.39"` | 0.x caret = ≥0.39.0 <0.40.0 (patch only, relatively safe but NOT exact) |
| `@anthropic-ai/sdk` | exact (CRITICAL) | `"^0.78.0"` | 0.x caret = ≥0.78.0 <0.79.0 (patch only, but architecture explicitly says CRITICAL exact) |
| `postgres` | exact | `"^3.4"` | ^3.4 allows 3.x patches |
| `zod` | exact | `"^3.24"` | Should be "caret" per Rule #2 (stable ≥1.0). Table cell wrong |
| `zustand` | exact | `"^5.0.11"` | Should be "caret" per Rule #2. Table cell wrong |
| `@tanstack/react-query` | exact | `"^5.90.21"` | Should be "caret" per Rule #2. Table cell wrong |

**Root issue**: Architecture prescribes exact pinning (Rule #1, L316) for 0.x packages but doesn't acknowledge the CURRENT state uses caret. Either:
- (a) Document current caret state + add Pre-Sprint action to change to exact, OR
- (b) Change table cells to reflect reality and add risk note

**H2 [D3] Zod installed version wrong (L267)**
Architecture says "Installed: 3.25.76". Actual resolved in `node_modules/zod/package.json`: **3.23.8**. Package.json: `"^3.24"`. None of these three numbers match each other.
- **Fix**: Verify actual resolved version. Update "Installed" column to match.

**H3 [D2] `@anthropic-ai/claude-agent-sdk 0.2.72` missing from version table**
`packages/server/package.json` has TWO Anthropic packages:
```
"@anthropic-ai/claude-agent-sdk": "0.2.72"  ← exact pin, PRIMARY (engine/agent-loop.ts)
"@anthropic-ai/sdk": "^0.78.0"              ← caret pin, secondary (API helpers)
```
The Step 3 table only lists `@anthropic-ai/sdk`. The Agent SDK is the MOST CRITICAL package in the entire architecture (engine boundary, SDK isolation E4/E8/E9). It IS mentioned at L185 ("Claude Agent SDK 0.2.72 (0.x)") and L458 in the existing architecture — but omitting it from the version audit table is a completeness gap.
- **Fix**: Add row: `| @anthropic-ai/claude-agent-sdk | 0.2.72 | 0.2.x | exact (CRITICAL) | ✅ Exact pinned. Engine-only. NFR-SC5 0.2.x compat |`

**M1 [D6] 0.x caret pinning = silent patch drift risk**
`drizzle-orm: "^0.39"` and `@anthropic-ai/sdk: "^0.78.0"` use caret. While `^0.x` limits to patch updates (`<0.40.0`, `<0.79.0`), pre-1.0 packages can introduce breaking changes in any version. A `bun install` on a clean environment could resolve to a different patch than the lockfile, causing subtle failures.
- **Fix**: Add to risk section or Pre-Sprint mandatory: "0.x 패키지 exact pin 전환: `drizzle-orm`, `@anthropic-ai/sdk` — caret(^) → exact 전환 필수. `bun.lockb`로 보호되지만 CI `--frozen-lockfile` 미설정 시 드리프트 가능"

**M2 [D6] PixiJS 8 ARM64 CI testing risk**
PixiJS uses WebGL rendering. Oracle VPS = ARM64 headless. CI (GitHub Actions self-hosted on same server) would need headless GL context for PixiJS tests. No mention of this environment constraint. PixiJS tests may need `--no-webgl` fallback or Canvas2D mock.
- **Fix**: Add to v3 package architecture impact or constraints: "PixiJS 8 ARM64 CI: WebGL headless 렌더링 검증 필수. `@pixi/node` 또는 Canvas2D fallback 필요 여부 Sprint 4 착수 전 확인"

**L1 [D5] n8n Docker version: 2.12.2 (Step 3) vs 2.12.3 (Step 2)**
Step 2 infrastructure table (L160) says `n8nio/n8n:2.12.3`. Step 3 (L288) says `n8nio/n8n:2.12.2`. Which is the target version?
- **Fix**: Reconcile to one version across both sections.

---

### Security-Specific Assessment (R2)

| Area | Status | Evidence |
|------|--------|----------|
| 0.x exact pinning | ✅ Fixed | AS-IS/TO-BE separation. Pre-Sprint #1: caret→exact. CLAUDE.md violation explicitly flagged (L318) |
| Agent SDK isolation | ✅ Fixed | claude-agent-sdk 0.2.72 added (L269). "유일한 정확 pin" noted. engine/agent-loop.ts reference |
| Docker tag pinning | ✅ | `n8nio/n8n:2.12.3` — unified across all sections. No `:latest` |
| lockfile enforcement | ✅ | Rule #7: `bun.lockb` commit + `--frozen-lockfile`. Pre-Sprint #7: lockfile 정합성 확인 |
| Gemini removal | ✅ Enhanced | voyageai 0.2.1 listed + @google/generative-ai flagged with 🔴 strikethrough (L270) + Pre-Sprint #2/#8 deletion |
| Voyage 0.x pin | ✅ | exact pin prescribed (L289) |

---

### To Analyst

**[Verified] Step 3 R2 = 8.85/10 PASS.**

QA/Security 관점 검증 결과:
1. **Pin strategy AS-IS/TO-BE** — 7개 패키지 전부 실제 package.json의 caret 표기를 AS-IS 컬럼에 정확히 반영. TO-BE 목표와 분리. 독립 검증 PASS.
2. **claude-agent-sdk 0.2.72** — Backend 테이블에 추가. "유일한 정확 pin" + engine/agent-loop.ts 핵심 의존 표기. PASS.
3. **@google/generative-ai 🔴 플래그** — 확정 결정 #1 위반 잔존 패키지 명시적 표기 + Pre-Sprint 삭제 계획. 보너스 발견. PASS.
4. **Zod 3.25.76** — R1 Quinn H2 오류 정정. 실제 resolved = 3.25.76 (직접), 3.23.8 (transitive). 이중 해상도 정확히 문서화. PASS.
5. **n8n 2.12.3** — 5개 위치 전부 통일. grep 2.12.2 = 0건. PASS.
6. **ARM64 CI 제약** — PixiJS WebGL headless 제한 + Playwright soft GPU / 번들 크기 테스트 대안. PASS.
7. **Version Management TO-BE 8규칙** — CLAUDE.md 준수, Pre-Sprint 교정 순서 논리적. 잔여: Zod TO-BE 테이블(caret) vs Rule #1(exact) 불일치 — LOW.

### Verdict

**[Verified] 8.85/10 PASS.** All 8 fixes confirmed. AS-IS/TO-BE separation elegantly resolves the pin strategy gap. claude-agent-sdk added. @google/generative-ai flagged as bonus. R1 Quinn H2 (Zod version) retracted — was Quinn's error. One LOW remaining: Zod TO-BE table/rule inconsistency.
