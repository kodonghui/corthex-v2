# Story 26.1: Marketing Settings & AI Engine Configuration

## Story
**As an** admin,
**I want** to select which AI tools power content creation,
**So that** I can choose the best tools for my needs and swap them without code changes.

## References
- FR-MKT1, FR-MKT4, FR-MKT6, AR39, AR41, MKT-1, MKT-3

## Implementation

### 1. Marketing Settings Service (`services/marketing-settings.ts`)

Engine provider definitions by category (FR-MKT1):
- **Image** (4 providers): Flux, DALL-E, Midjourney, Stable Diffusion
- **Video** (4 providers): Runway, Kling, Pika, Sora
- **Narration** (2 providers): ElevenLabs, PlayHT
- **Subtitles** (3 providers): Whisper, AssemblyAI, Deepgram

Each provider has multiple model variants (e.g., Flux: flux-1.1-pro, flux-dev, flux-schnell).

### 2. API Key Storage (AR39, MKT-1)
- API keys encrypted with AES-256-GCM via `lib/crypto.ts` (`encrypt()/decrypt()`)
- Stored in `company.settings.marketing.encryptedApiKeys` JSONB
- `getMarketingConfig()` returns boolean flags only (never exposes raw keys)
- `getDecryptedApiKey()` used at execution time for cost attribution (MKT-3)

### 3. Atomic JSONB Updates (AR41)
- All updates use `jsonb_set()` SQL for atomic path-level modifications
- `COALESCE(settings, '{}'::jsonb)` handles null initialization
- No read-modify-write race conditions
- `updatedAt` timestamp tracks changes

### 4. Admin Routes (company-settings.ts)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/company-settings/marketing` | Get marketing config |
| GET | `/company-settings/marketing/providers` | List available providers |
| PUT | `/company-settings/marketing/engine` | Update engine selection |
| PUT | `/company-settings/marketing/api-key` | Store encrypted API key |
| DELETE | `/company-settings/marketing/api-key/:provider` | Delete API key |
| PUT | `/company-settings/marketing/watermark` | Toggle watermark |

All routes use auth + adminOnly + tenant middleware. Zod validation on all write endpoints.

### 5. Admin UI (`pages/marketing-settings.tsx`)
- Engine selection cards per category with provider + model dropdowns
- API key management with password input, show/hide toggle, save/delete
- Watermark ON/OFF toggle switch (FR-MKT6)
- Loading states and error handling
- Sidebar entry: "마케팅 AI 엔진" with Megaphone icon

### 6. Engine Changes Take Effect Next Execution (FR-MKT4)
- Config read fresh from DB on every workflow execution
- No caching layer — changes immediately available to next n8n execution

## Tests
- `marketing-settings-26-1.test.ts`: 44 tests, 95 assertions
- Categories: FR-MKT1 providers, AR39 encryption, AR41 atomic updates, FR-MKT6 watermark, routes, UI, MKT-3 cost attribution
