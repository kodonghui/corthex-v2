# Critic-B (QA + Security) Implementation Review — Story 26.1

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 FR-MKT1: Engine selection by category | ✅ | `marketing-settings.ts:17-39`: 13 providers across 4 categories. `validateEngineSelection()` enforces valid provider+model combos. |
| AC-2 FR-MKT4: Changes take effect next execution | ✅ | `getMarketingConfig()` reads fresh from DB each call (Drizzle `db.select()`). No in-memory cache. No stale config risk. |
| AC-3 FR-MKT6: Watermark ON/OFF toggle | ✅ | `updateWatermark()` uses atomic `jsonb_set`. Default ON (`watermark: true`). UI has toggle button. |
| AC-4 AR39/MKT-1: AES-256 encrypted API keys | ✅ | `storeApiKey()` calls `encrypt(apiKey)` from `lib/crypto.ts` (AES-256-GCM). `getMarketingConfig()` returns boolean flags (`apiKeyFlags[provider] = true`), never raw keys. |
| AC-5 AR41: Atomic jsonb_set updates | ✅ | All mutations use `jsonb_set()` + `COALESCE(settings, '{}'::jsonb)`. No read-modify-write race. |
| AC-6 MKT-3: Cost attribution via company keys | ✅ | `getDecryptedApiKey(companyId, provider)` — per-company lookup with `eq(companies.id, companyId)`. Each company's API keys billed to their accounts. |
| AC-7 Route registration | ✅ | `admin/App.tsx:115`: `path="marketing-settings"`. Lazy-loaded. |
| AC-8 Sidebar entry | ✅ | `admin/sidebar.tsx:41`: `/marketing-settings`, label "마케팅 AI 엔진", Megaphone icon. |

## Security Assessment

### Server — Service Layer (marketing-settings.ts)

| Check | Status | Evidence |
|-------|--------|----------|
| API key never returned raw | ✅ SAFE | `getMarketingConfig()` converts to `{ provider: true }` flags. Only `getDecryptedApiKey()` returns plaintext (for engine execution). |
| AES-256-GCM encryption | ✅ SAFE | `lib/crypto.ts`: AES-GCM, 12-byte IV via `crypto.getRandomValues()`, 128-bit tag, IV prepended to ciphertext. |
| Engine selection validation | ✅ SAFE | `validateEngineSelection()` checks category → provider → model against hardcoded `MARKETING_ENGINE_PROVIDERS` const. |
| Provider validation on storeApiKey | ✅ SAFE | Validates against `Object.values(MARKETING_ENGINE_PROVIDERS).flat()` — only known provider IDs accepted. |
| Provider validation on deleteApiKey | ⚠️ MEDIUM | **No validation** — `provider` from URL param passed directly to JSONB path construction. See Issue #1. |
| JSONB path construction safety | ⚠️ NOTE | `${`{marketing,engines,${category}}`}::text[]` — Drizzle parameterizes the full string, so no SQL injection. But commas in `provider` value could alter array parsing. See Issue #1. |
| Decrypt error handling | ✅ SAFE | `getDecryptedApiKey()` catches decrypt failure → returns `null`. Graceful degradation if encryption key rotated. |
| COALESCE null handling | ✅ SAFE | `COALESCE(settings, '{}'::jsonb)` handles companies with null settings field. |

### Server — Routes (company-settings.ts)

| Check | Status | Evidence |
|-------|--------|----------|
| Auth middleware | ✅ SAFE | `authMiddleware, adminOnly, tenantMiddleware` on all routes. |
| Zod validation on engine update | ✅ SAFE | `z.enum(['image', 'video', 'narration', 'subtitles'])` for category. `z.string().min(1).max(50)` for provider. |
| Zod validation on API key store | ✅ SAFE | `z.string().min(1).max(500)` for apiKey. |
| Zod validation on DELETE | ⚠️ GAP | No Zod validation on `:provider` URL param. `c.req.param('provider')` used raw. |
| Zod validation on watermark | ✅ SAFE | `z.boolean()` for enabled. |
| `{ success, data }` response format | ✅ SAFE | All 6 endpoints return consistent format. |
| Handoff-depth routes preserved | ✅ SAFE | Existing GET/PUT handoff-depth routes unchanged. |

### Admin UI (marketing-settings.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| XSS via provider name | ✅ SAFE | Provider names from MARKETING_ENGINE_PROVIDERS const, rendered in JSX text. React auto-escapes. |
| API key input type | ✅ SAFE | `type="password"` by default, show/hide toggle with Eye/EyeOff. |
| API key cleared after save | ✅ SAFE | `storeKey` onSuccess: `setApiKeyInputs({})` clears all inputs. |
| API paths | ✅ SAFE | All hardcoded: `/admin/company-settings/marketing/*`. No dynamic path construction from user input. |
| Only selected providers shown | ✅ GOOD | API key section only shows providers currently selected in engine config via `selectedProviders` Set. Smart UX. |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 13 providers with specific model versions. AES-256-GCM. jsonb_set with COALESCE. Zod schemas with min/max. Korean labels throughout. |
| D2 완전성 | 25% | 8/10 | 44 tests, 95 assertions across 11 test groups. Covers providers, encryption, atomic updates, watermark, routes, UI, regression. Missing: no test for DELETE provider param validation gap. |
| D3 정확성 | 15% | 9/10 | AES-256-GCM correct. Atomic jsonb_set correct. validateEngineSelection correct. Boolean flag exposure correct. FR-MKT4 fresh read correct. |
| D4 실행가능성 | 10% | 9/10 | 44/44 pass. Type-check clean. |
| D5 일관성 | 15% | 9/10 | Natural Organic theme (olive #283618/#5a7247, sand #e5e1d3). Korean labels. `{ success, data }` format. Extends existing company-settings route cleanly. |
| D6 리스크 | 25% | 8/10 | AES-256 encryption sound. Admin-only access. Zod on mutations. But: deleteApiKey lacks provider validation + JSONB path composition with unvalidated input. WHERE clause mitigates but pattern unsafe. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(9) + 0.10(9) + 0.15(9) + 0.25(8) = 8.50/10 ✅ PASS

---

## Issues (2)

### 1. **[D6] deleteApiKey — no provider validation + JSONB path injection risk** (MEDIUM)

```typescript
// company-settings.ts:99-105 — DELETE route, no Zod on :provider
const provider = c.req.param('provider')
await deleteApiKey(tenant.companyId, provider)

// marketing-settings.ts:213-219 — unvalidated provider in JSONB path
await db.execute(sql`
  UPDATE companies
  SET settings = settings #- ${`{marketing,encryptedApiKeys,${provider}}`}::text[],
  ...
  AND settings->'marketing'->'encryptedApiKeys' ? ${provider}
`)
```

**What could happen:** If `provider` contains a comma (e.g., `a,b` via URL `a%2Cb`), PostgreSQL text array parsing interprets `{marketing,encryptedApiKeys,a,b}` as a 4-element path instead of 3. This alters the JSONB path target.

**Why mitigated:** The `WHERE ... ? ${provider}` clause checks for the literal string `a,b` as a key, which wouldn't exist (real keys are 'flux', 'dall-e' etc.), so the UPDATE is a no-op. Admin-only access limits attack surface.

**Fix:** Add provider validation to `deleteApiKey()` — same check as `storeApiKey()`:
```typescript
const allProviders = Object.values(MARKETING_ENGINE_PROVIDERS).flat()
if (!allProviders.find((p) => p.id === provider)) {
  throw new Error(`Unknown marketing provider: ${provider}`)
}
```

### 2. **[D6] JSONB path composition pattern — defense-in-depth** (LOW)

```typescript
// All jsonb_set calls use this pattern:
${`{marketing,engines,${category}}`}::text[]
${`{marketing,encryptedApiKeys,${provider}}`}::text[]
```

Drizzle parameterizes the full string (no SQL injection), but PostgreSQL parses the text array literal — special chars (commas, braces, quotes) in the interpolated value can alter path structure.

Currently safe because:
- `category` is Zod-validated against `z.enum([...])` (only 4 values)
- `provider` in storeApiKey validated against hardcoded list
- `provider` in deleteApiKey guarded by WHERE clause (see Issue #1)

But if new functions are added using this pattern without validation, the risk emerges. Consider using PostgreSQL `ARRAY[...]` constructor instead of `{...}::text[]` for safer path composition.

---

## Observations (non-scoring)

### Provider Catalog Accuracy (2026-03)
Spot-checked model versions:
- Flux: flux-1.1-pro exists. ✅
- DALL-E: dall-e-3 current. ✅
- Runway: gen-3-alpha is latest production model. ✅
- Sora: sora-1.0 — OpenAI's first video model release. ✅
- ElevenLabs: eleven_multilingual_v2 is current flagship. ✅
- Whisper: whisper-1 is OpenAI API model. Large-v3 is open-source. ✅

### Smart API Key UX
The UI only shows API key inputs for providers currently selected in engine config (via `selectedProviders` Set). This prevents confusion — users only configure keys for engines they'll actually use. When switching providers, the old key remains stored and the new provider's key section appears. Good design.

### Encryption Key Dependency
`lib/crypto.ts` uses `process.env.ENCRYPTION_KEY` (min 32 chars). If this env var is missing or changed, all stored API keys become unrecoverable. `getDecryptedApiKey` gracefully returns `null` on decrypt failure, so the system degrades to "no key configured" state rather than crashing. Good error handling.

---

## Verdict

**✅ PASS (8.50/10)**

Solid configuration story with proper AES-256-GCM encryption, atomic JSONB updates, and clean admin UI. Provider catalog is current and accurate. One medium issue: `deleteApiKey` accepts unvalidated provider from URL param — WHERE clause prevents actual exploitation but the pattern should be hardened with provider validation matching `storeApiKey`.
