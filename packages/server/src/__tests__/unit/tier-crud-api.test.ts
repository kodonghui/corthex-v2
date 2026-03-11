import { describe, test, expect } from 'bun:test'
import { Hono } from 'hono'
import { resolve, dirname } from 'path'
import { tierConfigsRoute } from '../../routes/admin/tier-configs'

// Resolve paths relative to repo root (tests run from packages/server/)
const repoRoot = resolve(dirname(import.meta.path), '../../../../..')

describe('tier-crud-api — Story 8.2', () => {
  describe('route structure', () => {
    test('tierConfigsRoute is a valid Hono instance', () => {
      expect(tierConfigsRoute).toBeDefined()
      expect(tierConfigsRoute).toBeInstanceOf(Hono)
    })

    test('route file exports tierConfigsRoute', async () => {
      const mod = await import('../../routes/admin/tier-configs')
      expect(mod.tierConfigsRoute).toBeDefined()
    })
  })

  describe('route registration in index.ts', () => {
    test('index.ts imports and registers tierConfigsRoute', async () => {
      const indexContent = await Bun.file(resolve(repoRoot, 'packages/server/src/index.ts')).text()
      expect(indexContent).toContain("import { tierConfigsRoute } from './routes/admin/tier-configs'")
      expect(indexContent).toContain("app.route('/api/admin', tierConfigsRoute)")
    })
  })

  describe('scoped-query tier functions exist', () => {
    test('getDB exports all tier CRUD functions', async () => {
      const { getDB } = await import('../../db/scoped-query')
      const dbInstance = getDB('test-company-id')
      expect(typeof dbInstance.tierConfigs).toBe('function')
      expect(typeof dbInstance.tierConfigByLevel).toBe('function')
      expect(typeof dbInstance.insertTierConfig).toBe('function')
      expect(typeof dbInstance.updateTierConfig).toBe('function')
      expect(typeof dbInstance.deleteTierConfig).toBe('function')
    })
  })

  describe('route file follows admin pattern', () => {
    test('uses authMiddleware + adminOnly + tenantMiddleware', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain('authMiddleware')
      expect(content).toContain('adminOnly')
      expect(content).toContain('tenantMiddleware')
    })

    test('has all CRUD endpoints', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain("tierConfigsRoute.get('/tier-configs'")
      expect(content).toContain("tierConfigsRoute.post('/tier-configs'")
      expect(content).toContain("tierConfigsRoute.patch('/tier-configs/:id'")
      expect(content).toContain("tierConfigsRoute.delete('/tier-configs/:id'")
      expect(content).toContain("tierConfigsRoute.put('/tier-configs/reorder'")
    })

    test('uses getDB for tenant-scoped queries', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain('getDB(tenant.companyId)')
    })

    test('uses proper API response format', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain('success: true, data')
      expect(content).toContain('HTTPError')
    })

    test('delete checks for agents using the tier (TIER_IN_USE)', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain('TIER_IN_USE')
    })

    test('reorder uses temp offset to avoid unique constraint collision', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain('tempOffset')
    })

    test('create auto-assigns next tierLevel', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain('maxLevel')
      expect(content).toContain('newLevel')
    })
  })

  describe('frontend — tiers page', () => {
    test('tiers.tsx exists', async () => {
      const fileExists = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).exists()
      expect(fileExists).toBe(true)
    })

    test('App.tsx includes tiers route', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/App.tsx')).text()
      expect(content).toContain('TiersPage')
      expect(content).toContain('path="tiers"')
    })

    test('sidebar includes tier management link', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/components/sidebar.tsx')).text()
      expect(content).toContain("'/tiers'")
      expect(content).toContain('계층 관리')
    })

    test('tiers page uses correct API endpoints', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('/admin/tier-configs')
      expect(content).toContain('useQuery')
      expect(content).toContain('useMutation')
    })

    test('tiers page supports model selection', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('claude-opus-4-6')
      expect(content).toContain('claude-sonnet-4-6')
      expect(content).toContain('claude-haiku-4-5')
    })

    test('tiers page supports reorder (up/down)', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('handleMoveUp')
      expect(content).toContain('handleMoveDown')
      expect(content).toContain('/admin/tier-configs/reorder')
    })

    test('tiers page has create, edit, delete UI', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('createOpen')
      expect(content).toContain('editTier')
      expect(content).toContain('deleteTier')
      expect(content).toContain('Modal')
      expect(content).toContain('ConfirmDialog')
    })
  })
})

// ── TEA Risk-Based Tests (Story 8.2) ──

describe('tier-crud-api — TEA Risk Analysis', () => {
  describe('zod schema validation — create', () => {
    test('createTierConfigSchema enforces name min length', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain("z.string().min(1).max(100)")
    })

    test('createTierConfigSchema enforces maxTools min 0', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain("z.number().int().min(0)")
    })

    test('createTierConfigSchema has modelPreference default', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain(".default('claude-haiku-4-5')")
    })

    test('createTierConfigSchema has maxTools default of 10', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain(".default(10)")
    })
  })

  describe('zod schema validation — update', () => {
    test('updateTierConfigSchema makes all fields optional', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const updateSection = content.split('updateTierConfigSchema')[1]?.split('reorderSchema')[0] ?? ''
      const optionalCount = (updateSection.match(/\.optional\(\)/g) || []).length
      expect(optionalCount).toBeGreaterThanOrEqual(3)
    })
  })

  describe('zod schema validation — reorder', () => {
    test('reorderSchema requires uuid array with min 1', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain("z.array(z.string().uuid()).min(1)")
    })
  })

  describe('error code consistency', () => {
    test('TIER_001 used for 404 not found errors', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const tier001Matches = content.match(/TIER_001/g) || []
      expect(tier001Matches.length).toBeGreaterThanOrEqual(2)
    })

    test('TIER_IN_USE used for delete protection', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain("'TIER_IN_USE'")
    })

    test('TIER_002 used for invalid reorder IDs', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      expect(content).toContain("'TIER_002'")
    })
  })

  describe('tenant isolation — security critical', () => {
    test('GET uses getDB(companyId) not raw db', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const getHandler = content.split("tierConfigsRoute.get('/tier-configs'")[1]?.split("tierConfigsRoute.post")[0] ?? ''
      expect(getHandler).toContain('getDB(tenant.companyId)')
      expect(getHandler).not.toContain('db.select()')
    })

    test('POST uses getDB for insert', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const postHandler = content.split("tierConfigsRoute.post('/tier-configs'")[1]?.split("tierConfigsRoute.patch")[0] ?? ''
      expect(postHandler).toContain('getDB(tenant.companyId).insertTierConfig')
    })

    test('PATCH uses getDB for update', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const patchHandler = content.split("tierConfigsRoute.patch")[1]?.split("tierConfigsRoute.delete")[0] ?? ''
      expect(patchHandler).toContain('getDB(tenant.companyId).updateTierConfig')
    })

    test('DELETE agent count check uses scopedWhere for tenant isolation', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const deleteHandler = content.split("tierConfigsRoute.delete")[1]?.split("tierConfigsRoute.put")[0] ?? ''
      expect(deleteHandler).toContain('scopedWhere(agents.companyId, tenant.companyId')
    })

    test('reorder validates IDs belong to company', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const reorderHandler = content.split("tierConfigsRoute.put")[1] ?? ''
      expect(reorderHandler).toContain('existingIds.has(id)')
    })

    test('reorder uses scopedWhere for tier update', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const reorderHandler = content.split("tierConfigsRoute.put")[1] ?? ''
      expect(reorderHandler).toContain('scopedWhere(tierConfigs.companyId, tenant.companyId')
    })
  })

  describe('auto-assign tierLevel — edge cases', () => {
    test('POST calculates maxLevel from existing tiers', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const postHandler = content.split("tierConfigsRoute.post")[1]?.split("tierConfigsRoute.patch")[0] ?? ''
      expect(postHandler).toContain('Math.max(...existing.map(t => t.tierLevel))')
    })

    test('POST handles empty tier list (starts at level 1)', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const postHandler = content.split("tierConfigsRoute.post")[1]?.split("tierConfigsRoute.patch")[0] ?? ''
      expect(postHandler).toContain('existing.length > 0')
      expect(postHandler).toContain(': 0')
    })
  })

  describe('reorder — unique constraint safety', () => {
    test('reorder uses two-pass strategy (temp then final)', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const reorderHandler = content.split("tierConfigsRoute.put")[1] ?? ''
      const forLoops = (reorderHandler.match(/for \(let i = 0/g) || []).length
      expect(forLoops).toBe(2)
    })

    test('reorder updates agents.tierLevel when level changes', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const reorderHandler = content.split("tierConfigsRoute.put")[1] ?? ''
      expect(reorderHandler).toContain('oldLevel !== newLevel')
    })
  })

  describe('DELETE protection — only checks active agents', () => {
    test('delete filters on isActive = true', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const deleteHandler = content.split("tierConfigsRoute.delete")[1]?.split("tierConfigsRoute.put")[0] ?? ''
      expect(deleteHandler).toContain('agents.isActive')
    })
  })

  describe('PATCH sets updatedAt timestamp', () => {
    test('update includes updatedAt: new Date()', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/server/src/routes/admin/tier-configs.ts')).text()
      const patchHandler = content.split("tierConfigsRoute.patch")[1]?.split("tierConfigsRoute.delete")[0] ?? ''
      expect(patchHandler).toContain('updatedAt: new Date()')
    })
  })

  describe('frontend — UI completeness', () => {
    test('tiers page has loading skeleton state', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('isLoading')
      expect(content).toContain('Skeleton')
    })

    test('tiers page has error state with retry', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('isError')
      expect(content).toContain('refetch')
    })

    test('tiers page has empty state', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('EmptyState')
      expect(content).toContain('계층이 없습니다')
    })

    test('tiers page displays tierLevel badge', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('Lv.')
      expect(content).toContain('tier.tierLevel')
    })

    test('tiers page shows maxTools as "무제한" when 0', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('무제한')
      expect(content).toContain('maxTools === 0')
    })

    test('tiers page disables up button for first item', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('index === 0')
    })

    test('tiers page disables down button for last item', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('index === tiers.length - 1')
    })

    test('tiers form validates name is required', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('계층명을 입력하세요')
    })

    test('tiers form validates name max length', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('100자 이내')
    })

    test('tiers page uses data-testid for testing', async () => {
      const content = await Bun.file(resolve(repoRoot, 'packages/app/src/pages/tiers.tsx')).text()
      expect(content).toContain('data-testid="tiers-page"')
      expect(content).toContain('data-testid={`tier-row-')
    })
  })
})
