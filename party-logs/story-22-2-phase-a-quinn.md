# Critic-B Review — Story 22.2: Voyage AI SDK Integration

**Reviewer**: Quinn (QA + Security)
**Rubric**: Critic-B (D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%)

---

## Dimension Scores

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| D1 Specificity | 8/10 | File paths, line numbers, exact SDK versions (`voyageai@0.2.1`), dimension values (768→1024), backoff delays all concrete. "log warning" in Task 2.2 is vague — what exactly to log? |
| D2 Completeness | 5/10 | Embedding migration is thorough (5 callers all correctly identified). **But GoogleAdapter removal is critically incomplete** — see Issues #1, #2, #3 below. |
| D3 Accuracy | 4/10 | **Self-contradiction** on LLMProviderName (Task 4.4 vs "LLM Provider System Impact" section). batch-collector.test.ts line references (63, 822) drastically undercount actual refs (7 locations). **SDK import is WRONG** — spec says `import VoyageAI from 'voyageai'` but correct is `import { VoyageAIClient } from 'voyageai'` (named export, not default). Constructor also wrong: `new VoyageAIClient()` not `new VoyageAI()`. |
| D4 Implementability | 6/10 | Backoff and caller simplification snippets are clear. But SDK code snippet is wrong (will not compile), missing files mean dev will discover gaps mid-implementation. |
| D5 Consistency | 5/10 | Task 4.4 directly contradicts "LLM Provider System Impact" section. "Files Changed" table omits files that appear in Tasks (e.g., `dashboard.ts` is in Task 4.5 but absent from table). |
| D6 Risk | 5/10 | **Three runtime crash risks completely unidentified** — provider-fallback cascade, batch-collector crash, models.yaml dead entries. API key logging not specified. |

### Weighted Average: 5.15/10 ❌ FAIL

*(Recalculated after Winston cross-talk: D3 dropped 5→4, D4 dropped 7→6 due to wrong SDK import)*
*(0.10×8 + 0.25×5 + 0.15×4 + 0.10×6 + 0.15×5 + 0.25×5 = 0.8+1.25+0.6+0.6+0.75+1.25 = 5.25)*

---

## Issue List

### CRITICAL Issues (must fix)

#### Issue #1: [D2 Completeness] `batch-collector.ts` SOURCE not in scope — runtime crash

`packages/server/src/services/batch-collector.ts` lines 163-166 and 440-496 contain `flushGoogleFallback()` which calls `createProvider('google', apiKey)`.

**After GoogleAdapter removal, this line WILL CRASH:**
```typescript
// batch-collector.ts:446
const adapter = createProvider('google', apiKey) // → throws "Google/Gemini provider removed"
```

The spec mentions updating `batch-collector.test.ts` (Task 7.7) but does NOT mention updating `batch-collector.ts` source code itself. This file is absent from the "Files Changed" table.

**Fix required:**
- Add `batch-collector.ts` to Files Changed table
- Add Task: Remove `flushGoogleFallback()` method entirely
- Add Task: Remove google routing block at lines 163-166
- Verify no other provider references `'google'` at flush time

---

#### Issue #2: [D2/D6 Completeness + Risk] `models.yaml` not in scope — fallback crash chain

`packages/server/src/config/models.yaml` lines 42-57 define `gemini-2.5-pro` and `gemini-2.5-flash` with `provider: google`. Line 60 has `fallbackOrder: [anthropic, openai, google]`.

**Runtime crash scenario:**
1. Anthropic fails → fallback to OpenAI
2. OpenAI fails → fallback to google
3. `createProvider('google', ...)` → **THROWS** instead of graceful fallback
4. User gets unhandled crash instead of "all providers exhausted" error

**Fix required:** Add to scope:
- Remove google model entries from `models.yaml` (or comment out with `# REMOVED: Gemini ban`)
- Update `fallbackOrder: [anthropic, openai]`
- Add `models.yaml` to Files Changed table
- Update ALL test files that reference gemini models or 3-provider fallbackOrder:
  - `provider-fallback.test.ts` lines 253-256, 258-260 (gemini fallback tests)
  - `provider-fallback-tea.test.ts` lines 180, 199-203 (google in provider list, fallback chain)
  - `cost-recording.test.ts` lines 38-39 (gemini model mock), 48, 52 (fallbackOrder)
  - `llm-router-tea.test.ts` lines 260-271 (google credential mapping test)

---

#### Issue #3: [D3/D5 Accuracy + Consistency] LLMProviderName contradiction

**Task 4.4** states:
> "CRITICAL: Do NOT remove 'google' from `LLMProviderName` type in `shared/types.ts`"

**"LLM Provider System Impact" section** states:
> "If `LLMProviderName = 'anthropic' | 'openai' | 'google'`, change to `'anthropic' | 'openai'`. TypeScript will then flag all remaining `'google'` references for you."

These are **mutually exclusive instructions**. The dev implementing this will be confused.

**Analysis:** Task 4.4's reasoning is correct — historical DB records contain `provider = 'google'`. Removing the type breaks dashboard aggregation and TypeScript casts on historical data reads. The "Impact" section is wrong.

**Fix required:** Delete or strike-through the "LLM Provider System Impact" section entirely, or add a clear note that it was superseded by Task 4.4's CRITICAL decision.

---

#### Issue #4: [D3 Accuracy] SDK import is WRONG — will not compile (via Winston cross-talk)

The spec's "Voyage AI SDK API" section and Task 2.2 show:
```typescript
import VoyageAI from 'voyageai'
const client = new VoyageAI({ apiKey: 'xxx' })
```

**Correct import (verified against npm registry + GitHub source):**
```typescript
import { VoyageAIClient } from 'voyageai'
const client = new VoyageAIClient({ apiKey: 'xxx' })
```

`voyageai` uses **named export** `VoyageAIClient`, not a default export. `VoyageAI` is a namespace for types (e.g., `VoyageAI.EmbedRequest`). The spec's code will fail at `tsc` — cannot use default import on a named export.

**Fix required:** Update ALL references:
- Task 2.2: `new VoyageAIClient({ apiKey })`
- "Voyage AI SDK API" dev notes section
- Task 2.4 backoff wrapper (wraps `client.embed()` — client type changes)

---

#### Issue #4b: [D6 Security] `toCredentialProvider()` dead code security surface (via Winston cross-talk)

`llm-router.ts:83-85` maps `'google'` → `'google_ai'` for credential lookup. After GoogleAdapter removal, if `resolveProvider()` still returns `'google'` from models.yaml Gemini entries (which the spec doesn't clean up), a crafted request with model `gemini-2.5-pro` would:
1. `resolveProvider('gemini-2.5-pro')` → returns `'google'` (from models.yaml)
2. `toCredentialProvider('google')` → returns `'google_ai'`
3. `getCredentials(companyId, 'google_ai')` → fetches stored Google AI credentials
4. `createProvider('google', apiKey)` → throws

The credential fetch at step 3 is unnecessary and leaks that google_ai credentials exist. Minor security surface but should be short-circuited before credential access.

---

#### Issue #4c: [D2 Completeness] Missing test cases for 22.2→22.3 gap behavior (via John cross-talk)

Task 7.1 should include tests for the dimension mismatch gap period:

1. `getEmbedding` returns 1024d vector (confirms Voyage outputs correct dims)
2. `updateDocEmbedding` with 1024d vector on 768d schema throws (expected SQL error)
3. `embedDocument` returns `false` when dimension mismatch occurs (graceful degradation)
4. `getEmbedding` returns `null` when no `voyage_ai` credentials configured (most common failure)

Without these, the gap behavior is undocumented by tests and a future dev might "fix" the null returns.

---

### HIGH Issues

#### Issue #4: [D2 Completeness] `llm-router.ts` — `toCredentialProvider()` dead code

`packages/server/src/services/llm-router.ts:84` has:
```typescript
function toCredentialProvider(provider: LLMProviderName): string {
  if (provider === 'google') return 'google_ai'
  return provider
}
```

Task 4.6 addresses `resolveProvider()` but does NOT mention `toCredentialProvider()`. After google removal, the `'google'` case becomes dead code. Should be cleaned up for clarity.

---

#### Issue #5: [D6 Risk] API key logging not specified

Task 2.2 says: "On any error: log warning, return null". But doesn't specify WHAT to log.

**Risk:** Dev might accidentally log `{ apiKey, text, error }` in error context, leaking credentials to stdout/logging systems.

**Fix required:** Task 2.2 should explicitly state:
> "Log `{ companyId, model: EMBEDDING_MODEL, errorType }` — NEVER log apiKey, request text, or full error object (may contain credentials in stack trace)"

---

#### Issue #6: [D2 Completeness] `batch-collector.test.ts` scope vastly underestimated

Task 7.7 says: "batch-collector.test.ts (lines 63, 822)". Actual google references in this file:

| Lines | Content |
|-------|---------|
| 47-50 | `gemini-` model prefix → `'google'` resolver mock |
| 61-65 | Mock google call returning `provider: 'google'` |
| 67-69 | `createProvider` mock returning `name: 'google'` |
| 295-297 | Expect 3 providers `['anthropic', 'google', 'openai']` |
| 375-382 | `flushGoogleFallback` test assertions |
| 447-450 | Cost recording with `provider: 'google'` |
| 820-823 | Another google provider mock |

That's **7 locations, not 2**. The entire `flushGoogleFallback` describe block must be deleted. Provider count assertions must change from 3 to 2.

---

#### Issue #7: [D6 Risk] Dimension mismatch creates a silent failure window

The spec acknowledges 1024d vectors vs 768d schema and says "This is acceptable because... Story 22.3 immediately follows." But there's no guard to prevent partial execution. If Story 22.2 is deployed but 22.3 is delayed (e.g., blocked by a bug), ALL embedding operations silently fail (dimension mismatch → null → no embeddings stored).

**Recommendation:** Add a WARN log in `voyage-embedding.ts` at startup or first call: "WARNING: Embedding model produces 1024d vectors but schema is 768d. Run Story 22.3 migration." This makes the failure visible in logs rather than silently degrading.

---

### MINOR Issues

#### Issue #8: [D1 Specificity] "Files Changed" table incomplete

Task 4.5 mentions `services/dashboard.ts` but it's not in the Files Changed table. Task 4.6 mentions `services/llm-router.ts` which IS in the table (good). Consistency: if a file is touched in a Task, it should appear in the table.

#### Issue #9: [D2 Completeness] `config/models.ts` loader not mentioned

The config loader file (`packages/server/src/config/models.ts`) that parses `models.yaml` likely has `getModelsByProvider()`, `getFallbackOrder()`, etc. If models.yaml google entries are removed, this file's return values change implicitly. But if models.yaml is NOT removed (current spec), then tests like `llm-provider-adapters.test.ts:180` (`getModelsByProvider('google')` expects 2 results) will still pass but test a provider that can't be used. Should either remove from yaml or note this explicitly.

---

## Dev's Specific Questions — Answered

**Q1: Test coverage — any missed files?**
Yes. `batch-collector.test.ts` scope is severely underestimated (7 locations, not 2). Several test files referencing `models.yaml`-derived data (fallbackOrder, gemini models) are not listed. See Issues #2 and #6.

**Q2: Task ordering safe?**
Ordering is safe for embedding swap. But Task 4 (GoogleAdapter removal) should come AFTER Task 5 (delete embedding-service.ts) to ensure the `@google/generative-ai` package isn't removed while batch-collector.ts still imports from llm/google.ts which imports from it. Actually, the current order is fine since Task 1 removes the package and Task 4 removes GoogleAdapter — but batch-collector.ts is missed entirely. Task ordering is blocked on Issue #1.

**Q3: AC completeness — anything missing?**
Yes. Missing ACs:
- **AC-10 (suggested)**: batch-collector must not route to google provider (no `flushGoogleFallback`)
- **AC-11 (suggested)**: fallbackOrder must be `[anthropic, openai]` only (models.yaml updated)
- Or fold these into AC-6.

**Q4: GoogleAdapter removal — separate story?**
The scope IS large (25+ files) but splitting creates an awkward interim state where `@google/generative-ai` is removed but GoogleAdapter still referenced. Keep as one story **IF** all missing files (Issues #1, #2) are added. The risk is manageable with complete scope.

**Q5: Grep vs ESLint for SDK import restriction?**
Grep in CI is sufficient for now. ESLint custom rule is heavier setup. But add the grep check as a Task 8 subtask (not just implied): `grep -r "from 'voyageai'" --include='*.ts' | grep -v voyage-embedding.ts | wc -l` must equal 0.

---

## Cross-talk Notes

- **Winston (Critic-A, 7.15/10 CONDITIONAL PASS)**: Confirmed SDK import is wrong (`VoyageAIClient` not `VoyageAI`). Flagged `toCredentialProvider()` dead code security surface. Agrees on models.yaml gap and LLMProviderName contradiction. Added Issues #4, #4b.
- **John (Critic-C, 7.7/10 PASS)**: Raised dimension mismatch gap test gap and credential setup test gap. Both confirmed as valid QA gaps after code verification. Added Issue #4c.
- **Agreement across all critics**: LLMProviderName contradiction must be resolved. batch-collector.ts source is missing. models.yaml needs cleanup.

---

## Verdict (Round 1)

**5.25/10 ❌ FAIL — Rewrite required**

*(Original 5.5, adjusted to 5.25 after Winston cross-talk confirmed SDK import error)*

---

## Round 2 — Post-Fix Verification

### Fixes Verified

| Issue | Status | Verification |
|-------|--------|--------------|
| #1 batch-collector.ts | ✅ FIXED | Task 4.7 added. Files Changed updated. Test 7.7 expanded (12+ line refs). |
| #2 models.yaml | ✅ FIXED | Task 4.8 added. Gemini entries + fallbackOrder cleaned. Crash chain prevented. |
| #3 LLMProviderName contradiction | ✅ FIXED | Impact section rewritten to match Task 4.4. No contradiction. |
| #4 SDK import (Winston) | ✅ FIXED | `VoyageAIClient` named import throughout (Task 2.2, SDK API section, arch ref). |
| #4b toCredentialProvider (Winston) | ✅ FIXED | Task 4.6 addresses explicitly — keep as defensive backward compat. |
| #4c Gap tests (John) | ✅ FIXED | Credential absence test added (7.1). Deployment steps + Dependencies section updated. |
| #5 API key logging | ✅ FIXED | Task 2.2 specifies exact log fields, NEVER apiKey/text. |
| #6 batch-collector.test.ts scope | ✅ FIXED | 7.7 expanded: 12+ line references + 6 additional test files. |
| #7 Dimension mismatch warning | ⚠️ PARTIAL | Dependencies section has CRITICAL note. No startup log added, but acceptable. |
| #8 Files Changed table | ✅ FIXED | batch-collector.ts, models.yaml, llm-router.ts all present. |
| #9 config/models loader | ✅ FIXED | models.yaml cleanup cascades to loader automatically. |

### Revised Scores

| Dimension | Before | After | Rationale |
|-----------|--------|-------|-----------|
| D1 Specificity | 8 | 9 | Logging explicitly specified. SDK API corrected. Line refs comprehensive. |
| D2 Completeness | 5 | 8 | All missing files added. Gap period credential test added. Deployment steps documented. 6+ additional test files scoped. |
| D3 Accuracy | 4 | 8 | SDK import fixed (`VoyageAIClient`). LLMProviderName contradiction resolved. Line references verified. |
| D4 Implementability | 6 | 8 | Code snippets now compile-correct. All files listed. No further research needed for implementation. |
| D5 Consistency | 5 | 8 | Impact section matches Task 4.4. Files Changed table complete. No contradictions remain. |
| D6 Risk | 5 | 8 | Crash chain prevented (models.yaml). API key logging specified. Deployment steps + Dependencies gap warning. |

### Revised Weighted Average: 8.1/10 ✅ PASS

*(0.10×9 + 0.25×8 + 0.15×8 + 0.10×8 + 0.15×8 + 0.25×8 = 0.9+2.0+1.2+0.8+1.2+2.0 = 8.1)*

### Remaining Minor Notes (non-blocking)

1. **Gap period DB-level dimension mismatch test** not explicitly in Task 7.1 (e.g., "updateDocEmbedding with 1024d throws on 768d schema"). Acceptable since temporary and 22.3 follows immediately.
2. **Startup warning log** for dimension mismatch not added. Dependencies section note is sufficient for non-production app.
3. **voyage-3 model** — newer models exist (voyage-4, voyage-4-large). Architecture D31 specifies voyage-3 so this is correct per spec, but worth noting for future upgrade path.
