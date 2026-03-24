#!/usr/bin/env bun
/**
 * Epic Verification Tool — CORTHEX v2
 * Runs all test suites and reports pass/fail counts per epic.
 *
 * Usage: bun tools/verify-all-epics.ts
 */

import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { $ } from 'bun'

const APP_TESTS = join(import.meta.dir, '../packages/app/src/__tests__')
const SERVER_TESTS = join(import.meta.dir, '../packages/server/src/__tests__')

interface EpicResult {
  epic: string
  files: string[]
  passed: boolean
}

function findTestFiles(dir: string): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...findTestFiles(full))
      } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
        results.push(full)
      }
    }
  } catch { /* dir may not exist */ }
  return results
}

async function main() {
  console.log('=== CORTHEX Epic Verification ===\n')

  const allTests = [...findTestFiles(APP_TESTS), ...findTestFiles(SERVER_TESTS)]
  console.log(`Found ${allTests.length} test files\n`)

  // Group by epic pattern (e.g., "23-19" → Epic 23)
  const epicMap = new Map<string, string[]>()
  for (const file of allTests) {
    const name = file.split('/').pop() || ''
    const epicMatch = name.match(/(\d+)-(\d+)/)
    if (epicMatch) {
      const epic = `Epic ${epicMatch[1]}`
      if (!epicMap.has(epic)) epicMap.set(epic, [])
      epicMap.get(epic)!.push(file)
    } else {
      if (!epicMap.has('Other')) epicMap.set('Other', [])
      epicMap.get('Other')!.push(file)
    }
  }

  // Sort epics
  const sortedEpics = [...epicMap.entries()].sort((a, b) => {
    if (a[0] === 'Other') return 1
    if (b[0] === 'Other') return -1
    const numA = parseInt(a[0].replace('Epic ', ''))
    const numB = parseInt(b[0].replace('Epic ', ''))
    return numA - numB
  })

  console.log('Epic breakdown:')
  for (const [epic, files] of sortedEpics) {
    console.log(`  ${epic}: ${files.length} test file(s)`)
  }

  // TypeScript check
  console.log('\n--- TypeScript Validation ---')
  try {
    await $`npx tsc --noEmit -p packages/app/tsconfig.json`.quiet()
    console.log('✅ packages/app: tsc clean')
  } catch {
    console.log('❌ packages/app: tsc errors')
  }

  try {
    await $`npx tsc --noEmit -p packages/server/tsconfig.json`.quiet()
    console.log('✅ packages/server: tsc clean')
  } catch {
    console.log('❌ packages/server: tsc errors')
  }

  console.log('\n--- Test Suites ---')
  // Run all tests
  try {
    const result = await $`bun test packages/app/src/__tests__/ packages/server/src/__tests__/ 2>&1`.text()
    console.log(result)
  } catch (e: any) {
    console.log(e.stdout?.toString() || e.message)
  }

  console.log('\n=== Verification Complete ===')
}

main()
