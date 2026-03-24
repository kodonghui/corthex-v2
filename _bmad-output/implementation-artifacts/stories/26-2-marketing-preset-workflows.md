# Story 26.2: Marketing Preset Workflows

## Story
**As an** admin,
**I want** pre-built marketing automation templates,
**So that** I can start automated content creation immediately.

## References
- AR40, FR-MKT2, FR-MKT5, UXR101

## Implementation

### 1. Preset JSON Templates (AR40)
- Stored in `_n8n/presets/` directory
- `marketing-content-pipeline.json`: 6-stage pipeline definition
- Each preset includes: stages, platforms, required/optional engines, DAG positions

### 2. 6-Stage Pipeline (FR-MKT2)
| # | Stage | Type | Description |
|---|-------|------|-------------|
| 1 | 주제 입력 | trigger | Webhook/manual trigger |
| 2 | AI 리서치 | processing | Trend/keyword research via Claude API |
| 3 | 카드뉴스 생성 | processing | 5-page carousel + captions (Image AI) |
| 4 | 숏폼 영상 생성 | processing | 15-60s short-form video (Video AI) |
| 5 | 사람 승인 | approval | CEO/Admin review before posting |
| 6 | 멀티 플랫폼 게시 | output | Instagram/TikTok/YouTube Shorts/LinkedIn/X |

Stages 3 & 4 run in parallel (simultaneous generation).

### 3. Preset Install Service (`services/n8n-preset-workflows.ts`)
- `listPresets()` — Reads JSON files from `_n8n/presets/`
- `getPreset(id)` — Returns full preset with stages
- `installPreset(id, companyId)` — POST to n8n API, auto-tags `company:{id}` (SEC-3)
- `isPresetInstalled(id, companyId)` — Check by company tag
- Workflows start inactive; admin activates manually

### 4. Admin Routes (`routes/admin/n8n-presets.ts`)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/n8n/presets` | List available presets |
| GET | `/n8n/presets/:id` | Get preset detail (DAG) |
| POST | `/n8n/presets/install` | Install to n8n |
| GET | `/n8n/presets/:id/status` | Check install status |

### 5. Onboarding Suggestion (FR-MKT5)
- `GET /api/onboarding/marketing-presets` endpoint added
- Returns available marketing presets during onboarding flow

### 6. CEO Pipeline View (UXR101)
- `pages/marketing-pipeline.tsx` — DAG node graph visualization
- Stage nodes with type-based colors (trigger/processing/approval/output)
- Execution history table with status badges
- Pipeline info cards (stages, platforms, version, executions)

## Tests
- `marketing-presets-26-2.test.ts`: 41 tests, 97 assertions
