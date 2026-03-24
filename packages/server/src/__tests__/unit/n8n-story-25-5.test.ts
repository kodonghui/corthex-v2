import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 25.5: Legacy Workflow Code Deletion (FR-N8N3)
 *
 * Verifies:
 * 1. Legacy server workflow files deleted
 * 2. Legacy frontend workflow pages deleted
 * 3. Legacy test files deleted
 * 4. No orphaned imports remain
 * 5. Migration files preserved
 * 6. Redirects in place for old routes
 */

// === 1. Legacy server files deleted ===

describe('25.5: Legacy server workflow code deleted', () => {
  test('routes/workspace/workflows.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/routes/workspace/workflows.ts')).toBe(false)
  })

  test('services/workflow/ directory deleted', () => {
    expect(fs.existsSync('packages/server/src/services/workflow')).toBe(false)
  })

  test('services/workflow/engine.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/services/workflow/engine.ts')).toBe(false)
  })

  test('services/workflow/execution.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/services/workflow/execution.ts')).toBe(false)
  })

  test('services/workflow/suggestion.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/services/workflow/suggestion.ts')).toBe(false)
  })

  test('services/workflow/pattern-analyzer.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/services/workflow/pattern-analyzer.ts')).toBe(false)
  })

  test('lib/workflow/ directory deleted', () => {
    expect(fs.existsSync('packages/server/src/lib/workflow')).toBe(false)
  })

  test('lib/workflow/engine.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/lib/workflow/engine.ts')).toBe(false)
  })

  test('lib/workflow/dag-solver.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/lib/workflow/dag-solver.ts')).toBe(false)
  })

  test('lib/workflow/execution-context.ts deleted', () => {
    expect(fs.existsSync('packages/server/src/lib/workflow/execution-context.ts')).toBe(false)
  })
})

// === 2. Legacy frontend files deleted ===

describe('25.5: Legacy frontend workflow pages deleted', () => {
  test('app/pages/workflows.tsx deleted', () => {
    expect(fs.existsSync('packages/app/src/pages/workflows.tsx')).toBe(false)
  })

  test('admin/pages/workflows.tsx deleted', () => {
    expect(fs.existsSync('packages/admin/src/pages/workflows.tsx')).toBe(false)
  })

  test('admin/components/workflow-canvas.tsx deleted', () => {
    expect(fs.existsSync('packages/admin/src/components/workflow-canvas.tsx')).toBe(false)
  })
})

// === 3. Legacy test files deleted ===

describe('25.5: Legacy workflow test files deleted', () => {
  const legacyTests = [
    'packages/server/src/__tests__/unit/workflow-crud.test.ts',
    'packages/server/src/__tests__/unit/workflow-crud-tea.test.ts',
    'packages/server/src/__tests__/unit/workflow-execution.test.ts',
    'packages/server/src/__tests__/unit/workflow-execution-tea.test.ts',
    'packages/server/src/__tests__/unit/workflow-pattern.test.ts',
    'packages/server/src/__tests__/unit/workflow-pattern-tea.test.ts',
    'packages/server/src/__tests__/unit/workflow-builder-ui-tea.test.ts',
    'packages/server/src/__tests__/unit/workflow-canvas-tea.test.ts',
    'packages/server/src/__tests__/unit/engine.test.ts',
    'packages/server/src/__tests__/api/workflows.test.ts',
  ]

  for (const testFile of legacyTests) {
    test(`${testFile.split('/').pop()} deleted`, () => {
      expect(fs.existsSync(testFile)).toBe(false)
    })
  }
})

// === 4. No orphaned imports ===

describe('25.5: No orphaned workflow imports', () => {
  test('server index.ts does not import workflowsRoute', () => {
    const src = fs.readFileSync('packages/server/src/index.ts', 'utf-8')
    expect(src).not.toContain("from './routes/workspace/workflows'")
    expect(src).not.toContain('workflowsRoute')
  })

  test('app App.tsx does not import WorkflowsPage', () => {
    const src = fs.readFileSync('packages/app/src/App.tsx', 'utf-8')
    expect(src).not.toContain("import('./pages/workflows')")
  })

  test('admin App.tsx does not import WorkflowsPage', () => {
    const src = fs.readFileSync('packages/admin/src/App.tsx', 'utf-8')
    expect(src).not.toContain("import('./pages/workflows')")
  })

  test('app use-queries.ts has no workflow hooks', () => {
    const src = fs.readFileSync('packages/app/src/hooks/use-queries.ts', 'utf-8')
    expect(src).not.toContain('useWorkflows')
    expect(src).not.toContain('useWorkflowDetail')
    expect(src).not.toContain('useWorkflowExecutions')
    expect(src).not.toContain('useWorkflowSuggestions')
    expect(src).not.toContain('useWorkflowMutations')
  })

  test('app sidebar has no legacy workflow entry', () => {
    const src = fs.readFileSync('packages/app/src/components/sidebar.tsx', 'utf-8')
    expect(src).not.toContain("to: '/workflows'")
  })

  test('admin sidebar has no legacy workflow entry', () => {
    const src = fs.readFileSync('packages/admin/src/components/sidebar.tsx', 'utf-8')
    expect(src).not.toContain("to: '/workflows'")
  })
})

// === 5. Migration files preserved ===

describe('25.5: Migration files preserved', () => {
  test('DB schema still has workflow tables (for migration history)', () => {
    const src = fs.readFileSync('packages/server/src/db/schema.ts', 'utf-8')
    expect(src).toContain("pgTable('workflows'")
    expect(src).toContain("pgTable('workflow_executions'")
    expect(src).toContain("pgTable('workflow_suggestions'")
  })
})

// === 6. Redirects in place ===

describe('25.5: Legacy route redirects', () => {
  test('app /workflows redirects to /n8n-workflows', () => {
    const src = fs.readFileSync('packages/app/src/App.tsx', 'utf-8')
    expect(src).toContain('path="workflows"')
    expect(src).toContain('Navigate to="/n8n-workflows"')
  })

  test('admin /workflows redirects to /n8n-editor', () => {
    const src = fs.readFileSync('packages/admin/src/App.tsx', 'utf-8')
    expect(src).toContain('path="workflows"')
    expect(src).toContain('Navigate to="/n8n-editor"')
  })
})

// === 7. n8n replacement is in place ===

describe('25.5: n8n replacement verified', () => {
  test('n8n-workflows page exists (CEO replacement)', () => {
    expect(fs.existsSync('packages/app/src/pages/n8n-workflows.tsx')).toBe(true)
  })

  test('n8n-editor page exists (Admin replacement)', () => {
    expect(fs.existsSync('packages/admin/src/pages/n8n-editor.tsx')).toBe(true)
  })

  test('n8n proxy route exists (server replacement)', () => {
    expect(fs.existsSync('packages/server/src/routes/admin/n8n-proxy.ts')).toBe(true)
  })
})
