/**
 * Story 26.2: Marketing Preset Workflows
 * References: AR40, FR-MKT2, FR-MKT5
 *
 * Manages n8n preset workflow templates.
 * Presets stored as JSON in `_n8n/presets/` (AR40).
 * Install via n8n API with auto-tag per company.
 */

import * as fs from 'fs'
import * as path from 'path'

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://127.0.0.1:5678'
const PRESETS_DIR = path.resolve(process.cwd(), '_n8n/presets')

// === Types ===

export interface PresetStage {
  id: string
  name: string
  type: 'trigger' | 'processing' | 'approval' | 'output'
  description: string
  n8nNodeType: string
  position: [number, number]
  next: string[]
}

export interface PresetWorkflow {
  name: string
  description: string
  version: string
  presetId: string
  stages: PresetStage[]
  platforms: string[]
  requiredEngines: string[]
  optionalEngines: string[]
}

export interface PresetSummary {
  presetId: string
  name: string
  description: string
  version: string
  stageCount: number
  platforms: string[]
  requiredEngines: string[]
}

export interface InstallResult {
  presetId: string
  n8nWorkflowId?: string
  installed: boolean
  error?: string
}

// === Load presets from disk (AR40) ===

export function listPresets(): PresetSummary[] {
  if (!fs.existsSync(PRESETS_DIR)) return []

  const files = fs.readdirSync(PRESETS_DIR).filter((f) => f.endsWith('.json'))
  const summaries: PresetSummary[] = []

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(PRESETS_DIR, file), 'utf-8')
      const preset = JSON.parse(raw) as PresetWorkflow
      summaries.push({
        presetId: preset.presetId,
        name: preset.name,
        description: preset.description,
        version: preset.version,
        stageCount: preset.stages.length,
        platforms: preset.platforms,
        requiredEngines: preset.requiredEngines,
      })
    } catch {
      // Skip invalid JSON files
    }
  }

  return summaries
}

export function getPreset(presetId: string): PresetWorkflow | null {
  if (!fs.existsSync(PRESETS_DIR)) return null

  const files = fs.readdirSync(PRESETS_DIR).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(PRESETS_DIR, file), 'utf-8')
      const preset = JSON.parse(raw) as PresetWorkflow
      if (preset.presetId === presetId) return preset
    } catch {
      // Skip invalid files
    }
  }

  return null
}

// === Install preset to n8n (AR40: auto-tag per company) ===

/**
 * Build n8n workflow JSON from preset definition.
 * Creates n8n nodes based on preset stages with proper connections.
 */
function buildN8nWorkflow(preset: PresetWorkflow, companyId: string): Record<string, unknown> {
  // Build nodes from stages
  const nodes = preset.stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    type: stage.n8nNodeType,
    typeVersion: 1,
    position: stage.position,
    parameters: {
      // Webhook trigger for first stage
      ...(stage.type === 'trigger' ? { path: `marketing/${preset.presetId}` } : {}),
    },
  }))

  // Build connections from stage.next references
  const connections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }> = {}
  for (const stage of preset.stages) {
    if (stage.next.length > 0) {
      connections[stage.name] = {
        main: [stage.next.map((nextId) => {
          const nextStage = preset.stages.find((s) => s.id === nextId)
          return { node: nextStage?.name ?? nextId, type: 'main', index: 0 }
        })],
      }
    }
  }

  return {
    name: `[${companyId.slice(0, 8)}] ${preset.name}`,
    nodes,
    connections,
    active: false, // Start inactive — admin activates manually
    settings: { executionOrder: 'v1' },
    tags: [{ name: `company:${companyId}` }],
  }
}

/**
 * Install a preset workflow into n8n for a specific company.
 * Uses n8n REST API POST /api/v1/workflows.
 * Auto-tags with company:{companyId} for SEC-3 isolation.
 */
export async function installPreset(
  presetId: string,
  companyId: string,
): Promise<InstallResult> {
  const preset = getPreset(presetId)
  if (!preset) {
    return { presetId, installed: false, error: 'Preset not found' }
  }

  const workflowPayload = buildN8nWorkflow(preset, companyId)

  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(workflowPayload),
    })

    if (!response.ok) {
      const err = await response.text()
      return { presetId, installed: false, error: `n8n API error: ${response.status} — ${err}` }
    }

    const data = await response.json() as { id?: string }
    return {
      presetId,
      n8nWorkflowId: data.id,
      installed: true,
    }
  } catch (err) {
    return {
      presetId,
      installed: false,
      error: err instanceof Error ? err.message : 'n8n unreachable',
    }
  }
}

export interface PresetInstallStatus {
  installed: boolean
  n8nWorkflowId?: string
}

/**
 * Check if a preset is already installed for a company.
 * Returns install status + n8n workflow ID if found.
 */
export async function getPresetInstallStatus(
  presetId: string,
  companyId: string,
): Promise<PresetInstallStatus> {
  const preset = getPreset(presetId)
  if (!preset) return { installed: false }

  const namePrefix = `[${companyId.slice(0, 8)}]`

  try {
    const url = new URL(`${N8N_BASE_URL}/api/v1/workflows`)
    url.searchParams.set('tags', `company:${companyId}`)

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) return { installed: false }

    const data = await response.json() as { data?: Array<{ id: string; name: string }> }
    const found = (data.data ?? []).find((wf) => wf.name.startsWith(namePrefix) && wf.name.includes(preset.name))
    if (found) return { installed: true, n8nWorkflowId: found.id }
    return { installed: false }
  } catch {
    return { installed: false }
  }
}

/** Backwards-compatible boolean check */
export async function isPresetInstalled(
  presetId: string,
  companyId: string,
): Promise<boolean> {
  const status = await getPresetInstallStatus(presetId, companyId)
  return status.installed
}

// Export for testing
export const _testBuildN8nWorkflow = buildN8nWorkflow
