import { Hono } from 'hono'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { embedAllDocuments } from '../../services/voyage-embedding'
import type { AppEnv } from '../../types'

export const adminKnowledgeRoute = new Hono<AppEnv>()

adminKnowledgeRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// POST /api/admin/knowledge/embed-all — batch embed all docs without embeddings
adminKnowledgeRoute.post('/knowledge/embed-all', async (c) => {
  const tenant = c.get('tenant')

  try {
    const result = await embedAllDocuments(tenant.companyId)
    return c.json({ success: true, data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Embedding failed'
    return c.json({ success: false, error: { code: 'EMBED_001', message } }, 500)
  }
})
