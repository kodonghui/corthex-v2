# Story 26.1 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| FR-MKT1 | AI engine selection by category | PASS | `marketing-settings.ts:17-39` — 13 providers across 4 categories: image (4: Flux, DALL-E, Midjourney, SD), video (4: Runway, Kling, Pika, Sora), narration (2: ElevenLabs, PlayHT), subtitles (3: Whisper, AssemblyAI, Deepgram). Each has multiple model variants. `validateEngineSelection()` validates category+provider+model. |
| FR-MKT4 | Engine changes take effect next execution | PASS | `getMarketingConfig()` reads fresh from DB on every call — no cache layer. `getDecryptedApiKey()` also reads fresh. Comment in story doc confirms: "No caching layer — changes immediately available to next n8n execution." |
| FR-MKT6 | Copyright watermark ON/OFF toggle | PASS | `updateWatermark()` — atomic jsonb_set with boolean. Default: `watermark: true`. UI: toggle switch (lines 314-325) with olive accent color. Route: `PUT /company-settings/marketing/watermark` with Zod `z.boolean()`. |
| AR39 | AES-256 encrypted API keys | PASS | `storeApiKey()` → `encrypt(apiKey)` → stored in `encryptedApiKeys` JSONB path. `lib/crypto.ts`: AES-256-GCM, 12-byte IV, 128-bit tag, iv+ciphertext base64 encoded. `getMarketingConfig()` returns `apiKeyFlags[provider] = true` only (never raw values). |
| AR41 | Atomic jsonb_set + COALESCE | PASS | All 3 write functions (`updateEngineSelection`, `storeApiKey`, `updateWatermark`) use `jsonb_set()` for path-level atomic updates. `COALESCE(settings, '{}'::jsonb)` initializes null settings. No read-modify-write pattern. |
| MKT-1 | API keys stored encrypted | PASS | Same as AR39. `encrypt()` before SQL insert. `decrypt()` only in `getDecryptedApiKey()` for execution-time retrieval. |
| MKT-3 | Cost attribution via company keys | PASS | `getDecryptedApiKey(companyId, provider)` — queries by companyId, decrypts per-company key. Each company stores/manages their own API keys, billing goes to their accounts. |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | 13 providers with exact model names (flux-1.1-pro, gen-3-alpha, eleven_multilingual_v2). AES-256-GCM parameters specified (IV_LENGTH=12, TAG_LENGTH=128). 6 API endpoints with method+path+schema. Korean labels per category (이미지 생성, 영상 생성, 나레이션, 자막). Default engines specified per category. |
| D2 | Completeness | 8 | 20% | All 7 requirements verified. Full stack: service (5 functions) + routes (6 endpoints) + UI (selections + keys + watermark + loading/error). 44 tests. Existing handoff-depth routes preserved. Gap: no test for decrypt failure path in `getDecryptedApiKey` (returns null on catch), no error response format test for invalid engine selections. |
| D3 | Accuracy | 9 | 15% | `lib/crypto.ts` confirmed AES-256-GCM via WebCrypto API. jsonb_set SQL correct for path-level atomicity. Zod validates all write endpoints (engineSchema, apiKeySchema, watermarkSchema). `{ success, data }` response format consistent. Provider/model lists are current for 2026 market. |
| D4 | Implementability | 8 | 15% | Clean service layer. React Query mutations with `invalidateQueries` on success. Lazy-loaded route. Zod on all writes. But: `category as EngineCategory` cast in route handler (line 74) is unnecessary — Zod `z.enum()` already narrows the type. Duplicate types in UI (recurring pattern from 25.4). |
| D5 | Consistency | 9 | 10% | Extends existing `company-settings.ts` (handoff-depth pattern). Same middleware chain. Same `{ success, data }` contract. Lucide icons (Image, Video, Mic, Subtitles, Key, Shield). Natural Organic palette (#283618, #5a7247, #e5e1d3). Megaphone sidebar icon. ko-KR date formatting. |
| D6 | Risk Awareness | 8 | 20% | API keys never exposed to frontend (boolean flags). AES-256-GCM encryption. Admin-only access via middleware chain. Zod validation on writes. Provider validation on store. But: DELETE endpoint skips provider validation (inconsistent with store). `DEFAULT_CONFIG.updatedAt` is module-load time, not per-request. JSONB race condition is known deferred item. |

## Weighted Score

(9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.90 + 1.60 = **8.45 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | MEDIUM | **Duplicate types growing across admin app**: `EngineCategory`, `EngineSelection`, `MarketingConfig`, `ProvidersMap` defined independently in `marketing-settings.tsx` (lines 18-38) from server's `marketing-settings.ts` (lines 41-65). Combined with 25.4's duplicate `N8nHealthStatus`/`useN8nHealth`, the admin app now has 7+ duplicated type definitions. If the server adds a field (e.g., `engines.image.costPerUnit`), the UI won't see it until manually updated. This is the same pattern accepted in 25.4 — flagging for tracking, not blocking. |
| 2 | LOW | **DELETE endpoint inconsistent validation**: `storeApiKey()` validates provider against known list (`allProviders.find(p => p.id === provider)`), but `deleteApiKey()` doesn't — it relies solely on the SQL WHERE clause (`settings->'marketing'->'encryptedApiKeys' ? ${provider}`). Functionally safe (admin-only + idempotent), but the inconsistency creates ambiguity about which layer owns validation. |
| 3 | LOW | **`DEFAULT_CONFIG.updatedAt` is module-load time**: `new Date().toISOString()` on line 78 evaluates once at module import, not per-request. Companies with no config see the server-start timestamp. Cosmetic (default = "never configured"), but misleading. Fix: `updatedAt: ''` or compute in `getMarketingConfig()`. |

## Product Assessment

Well-structured settings story that correctly separates engine configuration from execution. The service layer is clean: 5 exported functions covering CRUD for engines, API keys, and watermark. The atomic jsonb_set() SQL avoids the read-modify-write race that CLAUDE.md already flags as a deferred concern — this is the right pattern for the current scale.

The provider catalog (13 across 4 categories) covers the major players in each space. Each provider has realistic model lists (Flux has flux-1.1-pro/dev/schnell, Runway has gen-3-alpha/gen-2, etc.). The `validateEngineSelection()` function prevents saving invalid provider+model combos.

The API key security model is correct: encrypt before storage, never expose to frontend (boolean flags only), decrypt only at execution time. The `lib/crypto.ts` AES-256-GCM implementation is solid (WebCrypto API, random IV, combined iv+ciphertext for portable storage).

The admin UI is functional: category cards with provider/model dropdowns, API key inputs with show/hide toggle, watermark switch. Korean labels are appropriate (이미지 생성, 영상 생성, 나레이션, 자막). The pattern of showing only selected providers in the API key section (via `selectedProviders` set) reduces UI noise.

Six endpoints follow the existing company-settings pattern, keeping the route file cohesive. Zod validation covers all write endpoints. The middleware chain (auth + adminOnly + tenant) matches Epic 25's pattern.

44 tests cover providers, encryption, atomic SQL, watermark, routes, UI integration, and existing handoff-depth preservation. Good breadth for a settings story.

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: The JSONB approach is consistent with the existing `company.settings` pattern (handoff-depth). The atomic jsonb_set() SQL correctly avoids the read-modify-write race. The nested COALESCE handles the cold-start case (null settings → empty object → marketing object). Note: the deferred "JSONB read-modify-write race" item in CLAUDE.md refers to the top-level settings merge, which jsonb_set() mitigates for path-level updates but doesn't fully solve for concurrent jsonb_build_object merges. This is acceptable for admin-only writes (low contention).
- **Quinn/Dana (Critic-B, QA/Security)**: The encryption uses WebCrypto API (not Node crypto), which is correct for Bun runtime. `getKey()` enforces minimum 32-character key. The SQL parameters are properly handled by Drizzle's `sql` tagged template — no injection risk from provider names in path arrays. The `#-` operator for delete is safe (no-op if path doesn't exist). One note: `apiKey: z.string().min(1).max(500)` — consider if 500 chars is sufficient for all provider key formats (some API keys include embedded metadata).

---

**Verdict: PASS (8.45/10)**
