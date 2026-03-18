import { Hono } from 'hono'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import { getDB } from '../../db/scoped-query'
import { mdToPdf } from '../../lib/tool-handlers/builtins/md-to-pdf'

import type { AppEnv } from '../../types'

// Story 19.5: Admin Agent Reports API (FR-RM5, NFR-S4)
// RBAC: Admin only. Exposes agent_reports table (AI-generated) — separate from workspace reports (human workflow).

export const adminAgentReportsRoute = new Hono<AppEnv>()

adminAgentReportsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)

// GET /api/admin/agent-reports — list all agent reports (sorted by createdAt DESC)
// Supports optional ?type= filter
adminAgentReportsRoute.get('/agent-reports', async (c) => {
  const tenant = c.get('tenant')
  const type = c.req.query('type') || undefined

  const reports = await getDB(tenant.companyId).listReports(type ? { type } : undefined)
  return c.json({ data: reports })
})

// GET /api/admin/agent-reports/:id — get single report with full content
adminAgentReportsRoute.get('/agent-reports/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const rows = await getDB(tenant.companyId).getReport(id)
  if (rows.length === 0) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'RPT_001')

  return c.json({ data: rows[0] })
})

// GET /api/admin/agent-reports/:id/pdf — download report as PDF (D27, md_to_pdf)
adminAgentReportsRoute.get('/agent-reports/:id/pdf', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const rows = await getDB(tenant.companyId).getReport(id)
  if (rows.length === 0) throw new HTTPError(404, '보고서를 찾을 수 없습니다', 'RPT_001')

  const report = rows[0]
  const dummyCtx = {
    companyId: tenant.companyId,
    agentId: '',
    sessionId: '',
    departmentId: null,
    userId: tenant.userId,
    getCredentials: async () => ({}),
  }

  const result = await mdToPdf({ content: report.content, style: 'corporate' }, dummyCtx)
  const parsed = JSON.parse(result) as { pdf?: string; error?: string }

  if (parsed.error || !parsed.pdf) {
    throw new HTTPError(500, parsed.error || 'PDF 생성에 실패했습니다', 'RPT_002')
  }

  const pdfBuffer = Buffer.from(parsed.pdf, 'base64')
  const filename = `report-${id.slice(0, 8)}.pdf`

  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `attachment; filename="${filename}"`)
  return c.body(pdfBuffer as unknown as ReadableStream)
})
