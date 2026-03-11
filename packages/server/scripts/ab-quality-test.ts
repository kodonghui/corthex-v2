/**
 * A/B Quality Test CLI — Story 12.4
 *
 * Compares v1 engine snapshots against v2 engine outputs.
 * Usage: bun run scripts/ab-quality-test.ts [--dry-run] [--prompt-id <id>]
 *
 * --dry-run: Use mock v2 results instead of real SDK calls
 * --prompt-id: Run only a specific prompt (e.g., translate-01)
 */

import { AB_PROMPTS, type ABPrompt } from '../src/__tests__/fixtures/ab-prompts'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// ─── Types ──────────────────────────────────────────────────

export interface ABSnapshot {
  promptId: string
  model: string
  response: string
  tokenCount: number
  durationMs: number
  toolCallCount: number
  handoffDepth: number
}

export interface ABDelta {
  responseLengthRatio: number
  toolCallDiff: number
  handoffDepthDiff: number
  completenessScore: number
}

export interface ABComparisonResult {
  promptId: string
  category: string
  v1: ABSnapshot
  v2: ABSnapshot
  delta: ABDelta
}

export interface ABTestReport {
  generatedAt: string
  mode: 'dry-run' | 'live'
  totalPrompts: number
  results: ABComparisonResult[]
  summary: {
    avgResponseLengthRatio: number
    avgToolCallDiff: number
    avgHandoffDepthDiff: number
    avgCompletenessScore: number
  }
}

// ─── Core Logic ─────────────────────────────────────────────

export function loadV1Snapshots(snapshotPath: string): ABSnapshot[] {
  const raw = readFileSync(snapshotPath, 'utf-8')
  const data = JSON.parse(raw)
  return data.snapshots as ABSnapshot[]
}

export function calculateDelta(v1: ABSnapshot, v2: ABSnapshot): ABDelta {
  const v1Len = v1.response.length || 1
  return {
    responseLengthRatio: Math.round((v2.response.length / v1Len) * 100) / 100,
    toolCallDiff: v2.toolCallCount - v1.toolCallCount,
    handoffDepthDiff: v2.handoffDepth - v1.handoffDepth,
    completenessScore: 0, // manual input — default 0
  }
}

export function compareResults(
  v1Snapshots: ABSnapshot[],
  v2Snapshots: ABSnapshot[],
  prompts: ABPrompt[]
): ABComparisonResult[] {
  const v1Map = new Map(v1Snapshots.map(s => [s.promptId, s]))
  const v2Map = new Map(v2Snapshots.map(s => [s.promptId, s]))

  return prompts
    .filter(p => v1Map.has(p.id) && v2Map.has(p.id))
    .map(p => {
      const v1 = v1Map.get(p.id)!
      const v2 = v2Map.get(p.id)!
      return {
        promptId: p.id,
        category: p.category,
        v1,
        v2,
        delta: calculateDelta(v1, v2),
      }
    })
}

export function generateSummary(results: ABComparisonResult[]): ABTestReport['summary'] {
  if (results.length === 0) {
    return { avgResponseLengthRatio: 0, avgToolCallDiff: 0, avgHandoffDepthDiff: 0, avgCompletenessScore: 0 }
  }
  const count = results.length
  return {
    avgResponseLengthRatio: Math.round((results.reduce((s, r) => s + r.delta.responseLengthRatio, 0) / count) * 100) / 100,
    avgToolCallDiff: Math.round((results.reduce((s, r) => s + r.delta.toolCallDiff, 0) / count) * 100) / 100,
    avgHandoffDepthDiff: Math.round((results.reduce((s, r) => s + r.delta.handoffDepthDiff, 0) / count) * 100) / 100,
    avgCompletenessScore: Math.round((results.reduce((s, r) => s + r.delta.completenessScore, 0) / count) * 100) / 100,
  }
}

export function generateDryRunV2Snapshots(prompts: ABPrompt[]): ABSnapshot[] {
  return prompts.map(p => ({
    promptId: p.id,
    model: 'claude-sonnet-4-6',
    response: `[v2 dry-run] Response for ${p.id}: ${p.expectedBehavior}`,
    tokenCount: Math.floor(Math.random() * 200) + 50,
    durationMs: Math.floor(Math.random() * 2000) + 500,
    toolCallCount: 0,
    handoffDepth: 0,
  }))
}

export function printComparisonTable(results: ABComparisonResult[]): void {
  const rows = results.map(r => ({
    'Prompt ID': r.promptId,
    'Category': r.category,
    'v1 Length': r.v1.response.length,
    'v2 Length': r.v2.response.length,
    'Length Ratio': r.delta.responseLengthRatio,
    'Tool Diff': r.delta.toolCallDiff,
    'Handoff Diff': r.delta.handoffDepthDiff,
    'Score': r.delta.completenessScore,
  }))
  console.table(rows)
}

export function saveReport(report: ABTestReport, outputDir: string): string {
  mkdirSync(outputDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `ab-results-${ts}.json`
  const filepath = join(outputDir, filename)
  writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8')
  return filepath
}

// ─── CLI Entry Point ────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const promptIdIdx = args.indexOf('--prompt-id')
  const filterPromptId = promptIdIdx >= 0 ? args[promptIdIdx + 1] : null

  console.log(`\n=== A/B Quality Test ===`)
  console.log(`Mode: ${dryRun ? 'dry-run (mock v2)' : 'live (real SDK)'}`)

  // Filter prompts if specific ID requested
  let prompts = AB_PROMPTS
  if (filterPromptId) {
    prompts = prompts.filter(p => p.id === filterPromptId)
    if (prompts.length === 0) {
      console.error(`Prompt ID "${filterPromptId}" not found`)
      process.exit(1)
    }
    console.log(`Running single prompt: ${filterPromptId}`)
  }
  console.log(`Prompts: ${prompts.length}\n`)

  // Load v1 snapshots
  const snapshotPath = join(__dirname, '../src/__tests__/fixtures/ab-snapshots/v1-baseline.json')
  const v1Snapshots = loadV1Snapshots(snapshotPath)

  // Generate v2 results
  let v2Snapshots: ABSnapshot[]
  if (dryRun) {
    v2Snapshots = generateDryRunV2Snapshots(prompts)
  } else {
    console.log('Live mode not yet implemented — use --dry-run for testing')
    console.log('Live mode will call actual SDK query() for each prompt (~$5/run)')
    process.exit(0)
  }

  // Compare
  const results = compareResults(v1Snapshots, v2Snapshots, prompts)
  const summary = generateSummary(results)

  // Output
  printComparisonTable(results)

  console.log('\n--- Summary ---')
  console.log(`Avg Response Length Ratio (v2/v1): ${summary.avgResponseLengthRatio}`)
  console.log(`Avg Tool Call Diff: ${summary.avgToolCallDiff}`)
  console.log(`Avg Handoff Depth Diff: ${summary.avgHandoffDepthDiff}`)
  console.log(`Avg Completeness Score: ${summary.avgCompletenessScore}`)

  // Save report
  const report: ABTestReport = {
    generatedAt: new Date().toISOString(),
    mode: dryRun ? 'dry-run' : 'live',
    totalPrompts: prompts.length,
    results,
    summary,
  }

  const outputDir = join(__dirname, '../ab-results')
  const savedPath = saveReport(report, outputDir)
  console.log(`\nReport saved: ${savedPath}`)
}

// Only run CLI when executed directly (not when imported for testing)
if (import.meta.main) {
  main().catch(console.error)
}
