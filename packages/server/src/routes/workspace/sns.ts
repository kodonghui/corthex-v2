import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, isNotNull } from 'drizzle-orm'
import { db } from '../../db'
import { snsContents, snsAccounts, users, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { generateAgentResponse } from '../../lib/ai'
import { publishContent } from '../../lib/sns-publisher'
import { logActivity } from '../../lib/activity-logger'
import type { AppEnv } from '../../types'

export const snsRoute = new Hono<AppEnv>()

snsRoute.use('*', authMiddleware)

const createSnsSchema = z.object({
  platform: z.enum(['instagram', 'tistory', 'daum_cafe']),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  hashtags: z.string().optional(),
  imageUrl: z.string().optional(),
})

const generateSnsSchema = z.object({
  platform: z.enum(['instagram', 'tistory', 'daum_cafe']),
  agentId: z.string().uuid(),
  topic: z.string().min(1),
})

const updateSnsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  hashtags: z.string().optional(),
  imageUrl: z.string().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
})

const rejectSchema = z.object({
  reason: z.string().min(1),
})

const imageGenSchema = z.object({
  prompt: z.string().min(1),
  style: z.enum(['realistic', 'cartoon', 'minimalist']).optional(),
})

const createAccountSchema = z.object({
  platform: z.enum(['instagram', 'tistory', 'daum_cafe']),
  accountName: z.string().min(1).max(100),
})

// GET /api/workspace/sns — 내 SNS 콘텐츠 목록
snsRoute.get('/sns', async (c) => {
  const tenant = c.get('tenant')
  const platform = c.req.query('platform')
  const status = c.req.query('status')

  let query = db
    .select({
      id: snsContents.id,
      platform: snsContents.platform,
      title: snsContents.title,
      status: snsContents.status,
      createdBy: snsContents.createdBy,
      creatorName: users.name,
      publishedUrl: snsContents.publishedUrl,
      scheduledAt: snsContents.scheduledAt,
      createdAt: snsContents.createdAt,
      updatedAt: snsContents.updatedAt,
    })
    .from(snsContents)
    .innerJoin(users, eq(snsContents.createdBy, users.id))
    .where(eq(snsContents.companyId, tenant.companyId))
    .orderBy(desc(snsContents.updatedAt))
    .$dynamic()

  const result = await query

  // 클라이언트 필터링 (간단하게)
  const filtered = result.filter((r) => {
    if (platform && r.platform !== platform) return false
    if (status && r.status !== status) return false
    return true
  })

  return c.json({ data: filtered })
})

// POST /api/workspace/sns — 수동 콘텐츠 생성
snsRoute.post('/sns', zValidator('json', createSnsSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  const [content] = await db
    .insert(snsContents)
    .values({
      companyId: tenant.companyId,
      createdBy: tenant.userId,
      platform: body.platform,
      title: body.title,
      body: body.body,
      hashtags: body.hashtags,
      imageUrl: body.imageUrl,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      status: 'draft',
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: `SNS 콘텐츠 생성 (${body.platform})`,
    detail: body.title,
  })

  return c.json({ data: content }, 201)
})

// POST /api/workspace/sns/generate — AI 에이전트에게 콘텐츠 생성 요청
snsRoute.post('/sns/generate', zValidator('json', generateSnsSchema), async (c) => {
  const tenant = c.get('tenant')
  const { platform, agentId, topic } = c.req.valid('json')

  // 에이전트 소유권 확인
  const [agent] = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  const platformNames: Record<string, string> = {
    instagram: '인스타그램',
    tistory: '티스토리 블로그',
    daum_cafe: '다음 카페',
  }

  const prompt = `${platformNames[platform]}에 게시할 SNS 콘텐츠를 작성해주세요.

주제: ${topic}

다음 형식으로 작성해주세요:
제목: [제목]
본문: [본문 내용]
해시태그: [#태그1 #태그2 ...]`

  const aiResponse = await generateAgentResponse({
    agentId,
    sessionId: '',
    companyId: tenant.companyId,
    userMessage: prompt,
    userId: tenant.userId,
  })

  // AI 응답을 파싱해서 SNS 콘텐츠로 저장
  const titleMatch = aiResponse.match(/제목:\s*(.+)/)?.[1]?.trim() || topic
  const bodyMatch = aiResponse.match(/본문:\s*([\s\S]*?)(?=해시태그:|$)/)?.[1]?.trim() || aiResponse
  const hashtagMatch = aiResponse.match(/해시태그:\s*(.+)/)?.[1]?.trim()

  const [content] = await db
    .insert(snsContents)
    .values({
      companyId: tenant.companyId,
      agentId,
      createdBy: tenant.userId,
      platform,
      title: titleMatch,
      body: bodyMatch,
      hashtags: hashtagMatch,
      status: 'draft',
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'agent',
    actorId: agentId,
    actorName: agent.name,
    action: `AI SNS 콘텐츠 생성 (${platform})`,
    detail: titleMatch,
  })

  return c.json({ data: content }, 201)
})

// GET /api/workspace/sns/stats — SNS 통계
snsRoute.get('/sns/stats', async (c) => {
  const tenant = c.get('tenant')

  const all = await db
    .select({ status: snsContents.status, platform: snsContents.platform })
    .from(snsContents)
    .where(eq(snsContents.companyId, tenant.companyId))

  const stats = {
    total: all.length,
    byStatus: {} as Record<string, number>,
    byPlatform: {} as Record<string, number>,
  }

  for (const item of all) {
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1
    stats.byPlatform[item.platform] = (stats.byPlatform[item.platform] || 0) + 1
  }

  return c.json({ data: stats })
})

// GET /api/workspace/sns/accounts — SNS 계정 목록
snsRoute.get('/sns/accounts', async (c) => {
  const tenant = c.get('tenant')
  const result = await db.select().from(snsAccounts)
    .where(and(eq(snsAccounts.companyId, tenant.companyId), eq(snsAccounts.isActive, true)))
  return c.json({ data: result })
})

// POST /api/workspace/sns/accounts — SNS 계정 생성
snsRoute.post('/sns/accounts', zValidator('json', createAccountSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')
  const [account] = await db.insert(snsAccounts).values({
    companyId: tenant.companyId,
    ...body,
  }).returning()
  return c.json({ data: account }, 201)
})

// DELETE /api/workspace/sns/accounts/:id — SNS 계정 삭제 (soft delete)
snsRoute.delete('/sns/accounts/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  await db.update(snsAccounts).set({ isActive: false })
    .where(and(eq(snsAccounts.id, id), eq(snsAccounts.companyId, tenant.companyId)))
  return c.json({ data: { message: '삭제되었습니다' } })
})

// GET /api/workspace/sns/:id — 콘텐츠 상세
snsRoute.get('/sns/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [content] = await db
    .select({
      id: snsContents.id,
      platform: snsContents.platform,
      title: snsContents.title,
      body: snsContents.body,
      hashtags: snsContents.hashtags,
      imageUrl: snsContents.imageUrl,
      status: snsContents.status,
      createdBy: snsContents.createdBy,
      creatorName: users.name,
      agentId: snsContents.agentId,
      reviewedBy: snsContents.reviewedBy,
      reviewedAt: snsContents.reviewedAt,
      rejectReason: snsContents.rejectReason,
      publishedUrl: snsContents.publishedUrl,
      publishedAt: snsContents.publishedAt,
      publishError: snsContents.publishError,
      scheduledAt: snsContents.scheduledAt,
      metadata: snsContents.metadata,
      createdAt: snsContents.createdAt,
      updatedAt: snsContents.updatedAt,
    })
    .from(snsContents)
    .innerJoin(users, eq(snsContents.createdBy, users.id))
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!content) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  return c.json({ data: content })
})

// PUT /api/workspace/sns/:id — 수정 (draft/rejected만)
snsRoute.put('/sns/:id', zValidator('json', updateSnsSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, createdBy: snsContents.createdBy })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.createdBy !== tenant.userId) throw new HTTPError(403, '본인만 수정할 수 있습니다', 'AUTH_003')
  if (existing.status !== 'draft' && existing.status !== 'rejected') {
    throw new HTTPError(400, '초안/반려 상태에서만 수정할 수 있습니다', 'SNS_002')
  }

  const { scheduledAt: rawScheduled, ...rest } = body
  const [updated] = await db
    .update(snsContents)
    .set({
      ...rest,
      status: 'draft',
      updatedAt: new Date(),
      ...(rawScheduled !== undefined ? { scheduledAt: rawScheduled ? new Date(rawScheduled) : null } : {}),
    })
    .where(eq(snsContents.id, id))
    .returning()

  return c.json({ data: updated })
})

// POST /api/workspace/sns/:id/submit — 승인 요청 (draft → pending)
snsRoute.post('/sns/:id/submit', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, createdBy: snsContents.createdBy, title: snsContents.title })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.status !== 'draft' && existing.status !== 'rejected') {
    throw new HTTPError(400, '초안/반려 상태에서만 승인 요청할 수 있습니다', 'SNS_002')
  }

  const [updated] = await db
    .update(snsContents)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(snsContents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS 승인 요청',
    detail: existing.title,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/sns/:id/approve — 승인 (admin, pending → approved)
snsRoute.post('/sns/:id/approve', async (c) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') throw new HTTPError(403, '관리자만 승인할 수 있습니다', 'AUTH_003')

  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, title: snsContents.title })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.status !== 'pending') throw new HTTPError(400, '승인 요청 상태에서만 승인할 수 있습니다', 'SNS_003')

  const [updated] = await db
    .update(snsContents)
    .set({
      status: 'approved',
      reviewedBy: tenant.userId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(snsContents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS 콘텐츠 승인',
    detail: existing.title,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/sns/:id/reject — 반려 (admin, pending → rejected)
snsRoute.post('/sns/:id/reject', zValidator('json', rejectSchema), async (c) => {
  const tenant = c.get('tenant')
  if (tenant.role !== 'admin') throw new HTTPError(403, '관리자만 반려할 수 있습니다', 'AUTH_003')

  const id = c.req.param('id')
  const { reason } = c.req.valid('json')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, title: snsContents.title })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.status !== 'pending') throw new HTTPError(400, '승인 요청 상태에서만 반려할 수 있습니다', 'SNS_003')

  const [updated] = await db
    .update(snsContents)
    .set({
      status: 'rejected',
      reviewedBy: tenant.userId,
      reviewedAt: new Date(),
      rejectReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(snsContents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS 콘텐츠 반려',
    detail: `${existing.title} — 사유: ${reason}`,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/sns/:id/publish — 발행 (approved → published/failed, STUB)
snsRoute.post('/sns/:id/publish', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select()
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.status !== 'approved') throw new HTTPError(400, '승인된 콘텐츠만 발행할 수 있습니다', 'SNS_004')

  try {
    const result = await publishContent({
      id: existing.id,
      platform: existing.platform,
      title: existing.title,
      body: existing.body,
      hashtags: existing.hashtags,
      imageUrl: existing.imageUrl,
    })

    const [updated] = await db
      .update(snsContents)
      .set({
        status: 'published',
        publishedUrl: result.url,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(snsContents.id, id))
      .returning()

    logActivity({
      companyId: tenant.companyId,
      type: 'sns',
      phase: 'end',
      actorType: 'system',
      action: `SNS 발행 완료 (${existing.platform})`,
      detail: `${existing.title} → ${result.url}`,
    })

    return c.json({ data: updated })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '발행 실패'

    await db
      .update(snsContents)
      .set({ status: 'failed', publishError: errorMsg, updatedAt: new Date() })
      .where(eq(snsContents.id, id))

    throw new HTTPError(500, errorMsg, 'SNS_004')
  }
})

// GET /api/workspace/sns/calendar — 예약 콘텐츠 캘린더 뷰
snsRoute.get('/sns/calendar', async (c) => {
  const tenant = c.get('tenant')
  const result = await db
    .select({
      id: snsContents.id,
      platform: snsContents.platform,
      title: snsContents.title,
      status: snsContents.status,
      scheduledAt: snsContents.scheduledAt,
    })
    .from(snsContents)
    .where(and(
      eq(snsContents.companyId, tenant.companyId),
      isNotNull(snsContents.scheduledAt),
    ))
    .orderBy(snsContents.scheduledAt)
  return c.json({ data: result })
})

// DELETE /api/workspace/sns/:id — 삭제 (draft만)
snsRoute.delete('/sns/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, createdBy: snsContents.createdBy })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.createdBy !== tenant.userId) throw new HTTPError(403, '본인만 삭제할 수 있습니다', 'AUTH_003')
  if (existing.status !== 'draft') throw new HTTPError(400, '초안 상태에서만 삭제할 수 있습니다', 'SNS_002')

  await db.delete(snsContents).where(eq(snsContents.id, id))

  return c.json({ data: { deleted: true } })
})

// POST /api/workspace/sns/:id/generate-image — AI 이미지 생성 (stub)
snsRoute.post('/sns/:id/generate-image', zValidator('json', imageGenSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { prompt, style } = c.req.valid('json')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, companyId: snsContents.companyId })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  // Stub: 실제로는 DALL-E 3 / Stable Diffusion 호출
  const imageUrl = `https://placehold.co/1080x1080/6366f1/white?text=${encodeURIComponent(prompt.slice(0, 20))}`

  const [updated] = await db
    .update(snsContents)
    .set({ imageUrl, updatedAt: new Date() })
    .where(eq(snsContents.id, id))
    .returning()

  return c.json({ data: { imageUrl } })
})

// POST /api/workspace/sns/:id/variant — A/B 변형 생성
snsRoute.post('/sns/:id/variant', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [original] = await db.select().from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!original) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  const [variant] = await db.insert(snsContents).values({
    companyId: original.companyId,
    createdBy: tenant.userId,
    agentId: original.agentId,
    platform: original.platform,
    title: `[B] ${original.title}`,
    body: original.body,
    hashtags: original.hashtags,
    imageUrl: original.imageUrl,
    variantOf: original.id,
    status: 'draft',
  }).returning()

  return c.json({ data: variant }, 201)
})

// GET /api/workspace/sns/:id/variants — 변형 목록
snsRoute.get('/sns/:id/variants', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const variants = await db.select({
    id: snsContents.id,
    title: snsContents.title,
    status: snsContents.status,
    createdAt: snsContents.createdAt,
  }).from(snsContents)
    .where(and(
      eq(snsContents.companyId, tenant.companyId),
      eq(snsContents.variantOf, id),
    ))

  return c.json({ data: variants })
})
