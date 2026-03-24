# Story 26.1 — Phase B Review: Marketing Settings & AI Engine Configuration
**Critic-A (Winston) — Architect Review**
**Date**: 2026-03-24

## Files Reviewed
1. `packages/server/src/services/marketing-settings.ts` — Service (277 lines)
2. `packages/server/src/routes/admin/company-settings.ts` — 6 new endpoints
3. `packages/admin/src/pages/marketing-settings.tsx` — Admin UI (337 lines)
4. `packages/server/src/lib/crypto.ts` — AES-256-GCM (62 lines)
5. `packages/server/src/__tests__/unit/marketing-settings-26-1.test.ts` — 44 tests
6. Route registration + sidebar (verified via grep)

## Architecture Assessment

### Engine Providers (FR-MKT1)
13 providers across 4 categories, each with typed model arrays:
- Image (4): Flux, DALL-E, Midjourney, Stable Diffusion
- Video (4): Runway, Kling, Pika, Sora
- Narration (2): ElevenLabs, PlayHT
- Subtitles (3): Whisper, AssemblyAI, Deepgram

`MARKETING_ENGINE_PROVIDERS` declared `as const` — proper TypeScript inference. `validateEngineSelection()` checks provider + model against static definition. `EngineCategory` type derived from `keyof typeof`.
- **Verdict**: Clean, extensible

### AES-256-GCM Encryption (AR39, MKT-1)
Reviewed `lib/crypto.ts`:
- Web Crypto API (`crypto.subtle`) — standard, not Node-only
- AES-GCM with 256-bit key, 12-byte IV (standard), 128-bit auth tag (standard)
- Random IV per encryption call (`crypto.getRandomValues`) — no IV reuse
- IV prepended to ciphertext, base64 encoded for JSONB storage
- Key from `ENCRYPTION_KEY` env var (min 32 chars), used directly via `importKey('raw', ...)`
- Key derivation: `.slice(0, 32)` — takes first 32 bytes. Acceptable for high-entropy env var.

Encryption flow:
1. `storeApiKey()` → `await encrypt(apiKey)` → stored as `encryptedApiKeys.{provider}` in JSONB
2. `getDecryptedApiKey()` → `await decrypt(...)` → returns plaintext for engine execution
3. `getMarketingConfig()` → returns `apiKeys: Record<string, boolean>` (boolean flags only)

**Critical**: `getMarketingConfig()` at line 111-115 converts encrypted keys to boolean flags — raw keys NEVER leave the service layer via GET. Only `getDecryptedApiKey()` returns plaintext, and it's not exposed via any route.
- **Verdict**: Cryptographically sound, proper key isolation

### Atomic JSONB Updates (AR41)

All write functions use `jsonb_set()` + `COALESCE()`:

**`updateEngineSelection()`** (lines 146-164):
```sql
settings = jsonb_set(
  jsonb_set(
    COALESCE(settings, '{}') || jsonb_build_object('marketing',
      COALESCE(settings->'marketing', '{}') || jsonb_build_object('updatedAt', ...)
    ),
    '{marketing,engines}',
    COALESCE(settings->'marketing'->'engines', '{}')
  ),
  '{marketing,engines,<category>}',
  <engineValue>::jsonb
)
```
- Handles: null settings, missing marketing key, missing engines key
- `||` at each level performs shallow merge — preserves existing keys (encryptedApiKeys, watermark)
- `category` comes from Zod `z.enum(...)` — constrained to 4 values, no injection risk

**`deleteApiKey()`** (lines 213-219):
```sql
settings = settings #- '{marketing,encryptedApiKeys,<provider>}'::text[]
WHERE ... AND settings->'marketing'->'encryptedApiKeys' ? <provider>
```
- `#-` removes key at path, `?` checks existence before update — no-op if key doesn't exist
- **Verdict**: Correct PostgreSQL JSONB patterns

### Route Layer (company-settings.ts)
- 6 new endpoints, all behind `authMiddleware, adminOnly, tenantMiddleware`
- Zod validation: `engineSchema` uses `z.enum()` for category, `apiKeySchema` validates provider + key strings
- All mutations return fresh config after update (UI sync)
- Existing `handoff-depth` endpoints untouched

**Observation (MEDIUM)**: `DELETE /api-key/:provider` at line 99-105 does NOT validate the `:provider` param against `MARKETING_ENGINE_PROVIDERS`. Unlike `storeApiKey` (which validates at the service layer), `deleteApiKey` passes the raw param through. The `#- ? ` SQL handles non-existent providers gracefully (no-op), so there's no crash or data corruption — but it's inconsistent validation between store and delete.

### Admin UI (marketing-settings.tsx)
- 4 category cards: icon (Lucide), label, description, provider + model dropdowns
- API key management: password input with Eye/EyeOff toggle, save + delete buttons
- Watermark: custom toggle switch
- Smart UX: `selectedProviders` set — only shows API key inputs for providers currently in use
- `handleProviderChange` auto-selects first model when provider changes
- React Query mutations with `invalidateQueries` on success
- Loading skeleton, error state, "API 키 등록됨"/"미등록" badges
- Design tokens: olive #283618/#5a7247, sand #e5e1d3 — Natural Organic brand ✓
- Korean throughout

### FR-MKT4: Fresh DB Read
`getMarketingConfig()` does a full DB query per call — no in-memory cache, no Redis. Engine changes take effect from the next workflow execution (which will call `getMarketingConfig` or `getDecryptedApiKey` fresh). Correct.

## Observations

| # | Severity | Issue |
|---|----------|-------|
| 1 | **MEDIUM** | `DELETE /api-key/:provider` doesn't validate provider against known providers — unlike `storeApiKey` which does. Not exploitable (admin-only, SQL is no-op for unknown providers) but inconsistent. |
| 2 | **LOW** | No mutation error handling in UI — no toast/notification on save/delete failure. Mutations silently fail. |
| 3 | **LOW** | No confirmation dialog for API key deletion — single click deletes immediately. |

## Scoring (Critic-A Weights)

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| D1 Completeness | 9 | 15% | 1.35 |
| D2 UX/Clarity | 9 | 10% | 0.90 |
| D3 Accuracy | 9 | 25% | 2.25 |
| D4 Implementability | 9 | 20% | 1.80 |
| D5 Spec Alignment | 9 | 15% | 1.35 |
| D6 Risk | 8 | 15% | 1.20 |
| **Total** | | | **8.85** |

D6 at 8: provider validation inconsistency on delete and missing UI error handling.

## Verdict: **PASS** (8.85/10)

Solid marketing configuration system. AES-256-GCM encryption correct (random IV, proper key isolation, boolean flags in GET response). Atomic JSONB updates handle all null/missing edge cases. 13 providers across 4 categories with proper validation. One MEDIUM observation on delete endpoint validation.
