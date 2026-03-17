import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { companies } from '../../db/schema'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { clearBudgetCache, loadBudgetConfig } from '../../services/budget-guard'
import type { AppEnv } from '../../types'

export const budgetRoute = new Hono<AppEnv>()

budgetRoute.use('*', authMiddleware, adminOnly)

// GET /api/admin/budget — current budget settings
budgetRoute.get('/budget', async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const config = await loadBudgetConfig(companyId)

  return c.json({
    success: true,
    data: config,
  })
})

// PUT /api/admin/budget — update budget settings
const budgetUpdateSchema = z.object({
  monthlyBudget: z.number().min(0).optional(),
  dailyBudget: z.number().min(0).optional(),
  warningThreshold: z.number().min(0).max(100).optional(),
  autoBlock: z.boolean().optional(),
})

budgetRoute.put('/budget', zValidator('json', budgetUpdateSchema), async (c) => {
  const companyId = c.req.query('companyId') || c.get('tenant').companyId
  const body = c.req.valid('json')

  // Load existing settings to merge
  const [row] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!row) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } }, 404)
  }

  const existingSettings = (row.settings ?? {}) as Record<string, unknown>
  const existingBudget = (existingSettings.budgetConfig ?? {}) as Record<string, unknown>

  // Merge only provided fields
  const updatedBudgetConfig = { ...existingBudget }
  if (body.monthlyBudget !== undefined) updatedBudgetConfig.monthlyBudget = body.monthlyBudget
  if (body.dailyBudget !== undefined) updatedBudgetConfig.dailyBudget = body.dailyBudget
  if (body.warningThreshold !== undefined) updatedBudgetConfig.warningThreshold = body.warningThreshold
  if (body.autoBlock !== undefined) updatedBudgetConfig.autoBlock = body.autoBlock

  const updatedSettings = { ...existingSettings, budgetConfig: updatedBudgetConfig }

  await db
    .update(companies)
    .set({ settings: updatedSettings, updatedAt: new Date() })
    .where(eq(companies.id, companyId))

  // Invalidate budget cache
  clearBudgetCache()

  return c.json({
    success: true,
    data: updatedBudgetConfig,
  })
})
