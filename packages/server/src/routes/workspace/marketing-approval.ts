/**
 * Story 26.3: Marketing Approval — Workspace Routes
 * References: FR-MKT2, FR-MKT3
 *
 * CEO app endpoints for reviewing and approving/rejecting marketing content.
 * Approved content triggers multi-platform posting.
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware } from '../../middleware/auth'
import {
  getPendingApprovals,
  getApprovalHistory,
  getApprovalById,
  approveContent,
  rejectContent,
  postToMultiplePlatforms,
} from '../../services/marketing-approval'
import type { AppEnv } from '../../types'

export const marketingApprovalRoute = new Hono<AppEnv>()

marketingApprovalRoute.use('*', authMiddleware)

// GET /marketing/approvals/pending — Pending approval queue for CEO
marketingApprovalRoute.get('/marketing/approvals/pending', async (c) => {
  const tenant = c.get('tenant')
  const approvals = await getPendingApprovals(tenant.companyId)
  return c.json({ success: true, data: approvals })
})

// GET /marketing/approvals/history — Approval history with pagination
const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

marketingApprovalRoute.get('/marketing/approvals/history', async (c) => {
  const tenant = c.get('tenant')
  const { limit, offset } = historyQuerySchema.parse({
    limit: c.req.query('limit'),
    offset: c.req.query('offset'),
  })
  const result = await getApprovalHistory(tenant.companyId, limit, offset)
  return c.json({ success: true, data: result })
})

// POST /marketing/approvals/:id/approve — Approve content (FR-MKT3)
const approveSchema = z.object({
  channel: z.enum(['web', 'slack', 'telegram']).default('web'),
})

marketingApprovalRoute.post(
  '/marketing/approvals/:id/approve',
  zValidator('json', approveSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const approvalId = c.req.param('id')
    const { channel } = c.req.valid('json')

    const result = await approveContent(tenant.companyId, approvalId, channel, tenant.userId)
    if (!result) {
      return c.json(
        { success: false, error: { code: 'APPROVAL_NOT_FOUND', message: '승인 요청을 찾을 수 없습니다.' } },
        404,
      )
    }
    return c.json({ success: true, data: result })
  },
)

// POST /marketing/approvals/:id/reject — Reject content (FR-MKT3)
const rejectSchema = z.object({
  channel: z.enum(['web', 'slack', 'telegram']).default('web'),
  reason: z.string().max(500).optional(),
})

marketingApprovalRoute.post(
  '/marketing/approvals/:id/reject',
  zValidator('json', rejectSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const approvalId = c.req.param('id')
    const { channel, reason } = c.req.valid('json')

    const result = await rejectContent(tenant.companyId, approvalId, channel, tenant.userId, reason)
    if (!result) {
      return c.json(
        { success: false, error: { code: 'APPROVAL_NOT_FOUND', message: '승인 요청을 찾을 수 없습니다.' } },
        404,
      )
    }
    return c.json({ success: true, data: result })
  },
)

// POST /marketing/approvals/:id/post — Post approved content to platforms (FR-MKT2)
const postSchema = z.object({
  platforms: z.array(z.enum(['instagram', 'tiktok', 'youtube_shorts', 'linkedin', 'x'])).min(1),
})

marketingApprovalRoute.post(
  '/marketing/approvals/:id/post',
  zValidator('json', postSchema),
  async (c) => {
    const tenant = c.get('tenant')
    const approvalId = c.req.param('id')
    const { platforms } = c.req.valid('json')

    // Verify approval is approved before posting (John MEDIUM #2 fix)
    const approval = await getApprovalById(tenant.companyId, approvalId)
    if (!approval) {
      return c.json(
        { success: false, error: { code: 'APPROVAL_NOT_FOUND', message: '승인 요청을 찾을 수 없습니다.' } },
        404,
      )
    }
    if (approval.status !== 'approved') {
      return c.json(
        { success: false, error: { code: 'APPROVAL_NOT_APPROVED', message: '승인된 콘텐츠만 게시할 수 있습니다.' } },
        400,
      )
    }

    const result = await postToMultiplePlatforms(tenant.companyId, approvalId, platforms)
    return c.json({ success: true, data: result })
  },
)
