import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 26.2: Marketing Preset Workflows
 * References: AR40, FR-MKT2, FR-MKT5, UXR101
 *
 * Tests verify:
 * (1) Preset JSON stored in _n8n/presets/ (AR40)
 * (2) 6-stage pipeline: topic → research → card+video → approval → posting (FR-MKT2)
 * (3) Install service with auto-tag per company
 * (4) Onboarding marketing template suggestion (FR-MKT5)
 * (5) Pipeline view page (UXR101)
 * (6) Admin preset routes
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === AR40: Preset JSON in _n8n/presets/ ===

describe('26.2: AR40 — Preset workflow JSON files', () => {
  test('_n8n/presets/ directory exists', () => {
    expect(fs.existsSync('_n8n/presets')).toBe(true)
  })

  test('marketing-content-pipeline.json exists', () => {
    expect(fs.existsSync('_n8n/presets/marketing-content-pipeline.json')).toBe(true)
  })

  test('preset has valid JSON structure', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    expect(preset.presetId).toBe('marketing-content-pipeline')
    expect(preset.name).toBeTruthy()
    expect(preset.description).toBeTruthy()
    expect(preset.version).toBeTruthy()
    expect(Array.isArray(preset.stages)).toBe(true)
    expect(Array.isArray(preset.platforms)).toBe(true)
  })

  test('preset has 6 stages (FR-MKT2 pipeline)', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    expect(preset.stages.length).toBe(6)
  })
})

// === FR-MKT2: 6-Stage Pipeline ===

describe('26.2: FR-MKT2 — 6-stage marketing pipeline', () => {
  const getPreset = () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    return JSON.parse(raw)
  }

  test('Stage 1: topic input (trigger)', () => {
    const preset = getPreset()
    const stage = preset.stages[0]
    expect(stage.id).toBe('topic-input')
    expect(stage.type).toBe('trigger')
  })

  test('Stage 2: AI research (processing)', () => {
    const preset = getPreset()
    const stage = preset.stages[1]
    expect(stage.id).toBe('ai-research')
    expect(stage.type).toBe('processing')
  })

  test('Stage 3: card news generation (processing, parallel)', () => {
    const preset = getPreset()
    const stage = preset.stages[2]
    expect(stage.id).toBe('card-news')
    expect(stage.type).toBe('processing')
  })

  test('Stage 4: short-form video generation (processing, parallel)', () => {
    const preset = getPreset()
    const stage = preset.stages[3]
    expect(stage.id).toBe('short-form')
    expect(stage.type).toBe('processing')
  })

  test('Stage 5: human approval', () => {
    const preset = getPreset()
    const stage = preset.stages[4]
    expect(stage.id).toBe('human-approval')
    expect(stage.type).toBe('approval')
  })

  test('Stage 6: multi-platform posting (output)', () => {
    const preset = getPreset()
    const stage = preset.stages[5]
    expect(stage.id).toBe('multi-platform-post')
    expect(stage.type).toBe('output')
  })

  test('AI research branches to card-news AND short-form (simultaneous)', () => {
    const preset = getPreset()
    const researchStage = preset.stages.find((s: { id: string }) => s.id === 'ai-research')
    expect(researchStage.next).toContain('card-news')
    expect(researchStage.next).toContain('short-form')
    expect(researchStage.next.length).toBe(2)
  })

  test('both generation stages converge to human-approval', () => {
    const preset = getPreset()
    const cardNews = preset.stages.find((s: { id: string }) => s.id === 'card-news')
    const shortForm = preset.stages.find((s: { id: string }) => s.id === 'short-form')
    expect(cardNews.next).toContain('human-approval')
    expect(shortForm.next).toContain('human-approval')
  })

  test('platforms include Instagram, TikTok, YouTube Shorts', () => {
    const preset = getPreset()
    expect(preset.platforms).toContain('instagram')
    expect(preset.platforms).toContain('tiktok')
    expect(preset.platforms).toContain('youtube_shorts')
  })

  test('required engines: image and video', () => {
    const preset = getPreset()
    expect(preset.requiredEngines).toContain('image')
    expect(preset.requiredEngines).toContain('video')
  })
})

// === Preset Service ===

describe('26.2: Preset workflow service', () => {
  test('n8n-preset-workflows.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-preset-workflows.ts')).toBe(true)
  })

  test('listPresets function reads from _n8n/presets/', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('export function listPresets')
    expect(src).toContain('_n8n/presets')
  })

  test('getPreset function returns single preset by ID', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('export function getPreset')
    expect(src).toContain('presetId')
  })

  test('installPreset sends POST to n8n API', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('export async function installPreset')
    expect(src).toContain('/api/v1/workflows')
    expect(src).toContain("method: 'POST'")
  })

  test('auto-tags company on install (SEC-3 isolation)', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('company:${companyId}')
  })

  test('workflow starts inactive (admin activates manually)', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('active: false')
  })

  test('getPresetInstallStatus returns n8nWorkflowId (Quinn MEDIUM fix)', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('export async function getPresetInstallStatus')
    expect(src).toContain('n8nWorkflowId')
    expect(src).toContain('company:${companyId}')
  })

  test('isPresetInstalled backwards-compatible boolean check', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('export async function isPresetInstalled')
  })

  test('buildN8nWorkflow creates nodes from stages', () => {
    const src = readSrc('services/n8n-preset-workflows.ts')
    expect(src).toContain('buildN8nWorkflow')
    expect(src).toContain('nodes')
    expect(src).toContain('connections')
  })
})

// === Admin Routes ===

describe('26.2: Admin preset routes', () => {
  test('n8n-presets route file exists', () => {
    expect(fs.existsSync('packages/server/src/routes/admin/n8n-presets.ts')).toBe(true)
  })

  test('GET /n8n/presets — list presets', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain("n8nPresetsRoute.get('/n8n/presets'")
  })

  test('GET /n8n/presets/:id — get preset detail', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain("n8nPresetsRoute.get('/n8n/presets/:id'")
  })

  test('POST /n8n/presets/install — install preset', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain("'/n8n/presets/install'")
    expect(src).toContain("zValidator('json', installSchema)")
  })

  test('GET /n8n/presets/:id/status — check install status', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain("n8nPresetsRoute.get('/n8n/presets/:id/status'")
  })

  test('routes use auth + admin + tenant middleware', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain('authMiddleware, adminOnly, tenantMiddleware')
  })

  test('install route prevents duplicates (Quinn LOW fix)', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain('PRESET_ALREADY_INSTALLED')
    expect(src).toContain('getPresetInstallStatus')
  })

  test('status endpoint returns n8nWorkflowId', () => {
    const src = readSrc('routes/admin/n8n-presets.ts')
    expect(src).toContain('getPresetInstallStatus')
    // Spread result includes n8nWorkflowId
    expect(src).toContain('...status')
  })

  test('route registered in index.ts', () => {
    const src = readSrc('index.ts')
    expect(src).toContain("n8nPresetsRoute")
    expect(src).toContain("app.route('/api/admin', n8nPresetsRoute)")
  })
})

// === FR-MKT5: Onboarding Marketing Template Suggestion ===

describe('26.2: FR-MKT5 — Onboarding marketing template suggestion', () => {
  test('onboarding route has marketing-presets endpoint', () => {
    const src = readSrc('routes/onboarding.ts')
    expect(src).toContain("'/onboarding/marketing-presets'")
  })

  test('onboarding imports listPresets from preset service', () => {
    const src = readSrc('routes/onboarding.ts')
    expect(src).toContain("import { listPresets } from '../services/n8n-preset-workflows'")
  })
})

// === UXR101: Pipeline View UI ===

describe('26.2: UXR101 — Marketing Pipeline View (CEO app)', () => {
  test('marketing-pipeline page exists', () => {
    expect(fs.existsSync('packages/app/src/pages/marketing-pipeline.tsx')).toBe(true)
  })

  test('exports MarketingPipelinePage component', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-pipeline.tsx', 'utf-8')
    expect(src).toContain('export function MarketingPipelinePage')
  })

  test('has DAG pipeline visualization', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-pipeline.tsx', 'utf-8')
    expect(src).toContain('PipelineDAG')
    expect(src).toContain('StageNode')
  })

  test('fetches preset detail for DAG', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-pipeline.tsx', 'utf-8')
    expect(src).toContain('/admin/n8n/presets/')
  })

  test('shows execution history filtered by workflowId (Quinn MEDIUM fix)', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-pipeline.tsx', 'utf-8')
    expect(src).toContain('ExecutionHistory')
    expect(src).toContain('installedWorkflowId')
    expect(src).toContain('workflowId=')
  })

  test('route registered in CEO App.tsx', () => {
    const src = fs.readFileSync('packages/app/src/App.tsx', 'utf-8')
    expect(src).toContain('MarketingPipelinePage')
    expect(src).toContain('"marketing-pipeline"')
  })

  test('sidebar entry in CEO app', () => {
    const src = fs.readFileSync('packages/app/src/components/sidebar.tsx', 'utf-8')
    expect(src).toContain("'/marketing-pipeline'")
    expect(src).toContain('마케팅 파이프라인')
    expect(src).toContain('GitBranch')
  })
})

// === Stage type coverage ===

describe('26.2: Pipeline stage types', () => {
  test('all 4 stage types represented', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    const types = new Set(preset.stages.map((s: { type: string }) => s.type))
    expect(types.has('trigger')).toBe(true)
    expect(types.has('processing')).toBe(true)
    expect(types.has('approval')).toBe(true)
    expect(types.has('output')).toBe(true)
  })

  test('each stage has position for DAG layout', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    for (const stage of preset.stages) {
      expect(Array.isArray(stage.position)).toBe(true)
      expect(stage.position.length).toBe(2)
    }
  })

  test('each stage has n8nNodeType for n8n API', () => {
    const raw = fs.readFileSync('_n8n/presets/marketing-content-pipeline.json', 'utf-8')
    const preset = JSON.parse(raw)
    for (const stage of preset.stages) {
      expect(stage.n8nNodeType).toBeTruthy()
      expect(stage.n8nNodeType).toContain('n8n-nodes-base.')
    }
  })
})
