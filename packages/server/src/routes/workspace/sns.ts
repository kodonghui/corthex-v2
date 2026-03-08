import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, gte, sql, count, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { snsContents, snsAccounts, users, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { isCeoOrAbove } from '@corthex/shared'
import { generateAgentResponse } from '../../lib/ai'
import { publishContent } from '../../lib/sns-publisher'
import { generateSnsImage } from '../../lib/sns-image-generator'
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
  scheduledAt: z.string().datetime().optional(),
  snsAccountId: z.string().uuid().optional(),
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

const generateWithImageSchema = z.object({
  platform: z.enum(['instagram', 'tistory', 'daum_cafe']),
  agentId: z.string().uuid(),
  topic: z.string().min(1),
  imagePrompt: z.string().max(4000).optional(),
})

const generateImageSchema = z.object({
  imagePrompt: z.string().min(1).max(4000),
})

const rejectSchema = z.object({
  reason: z.string().min(1),
})

const createVariantSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  hashtags: z.string().optional(),
  imageUrl: z.string().optional(),
})

const generateVariantsSchema = z.object({
  count: z.number().int().min(2).max(5),
  strategy: z.enum(['tone', 'length', 'hashtag', 'headline', 'mixed']),
  agentId: z.string().uuid(),
})

const metricsSchema = z.object({
  views: z.number().int().min(0),
  likes: z.number().int().min(0),
  shares: z.number().int().min(0),
  clicks: z.number().int().min(0),
})

const PLATFORM_NAMES: Record<string, string> = {
  instagram: '인스타그램',
  tistory: '티스토리 블로그',
  daum_cafe: '다음 카페',
}

// GET /api/workspace/sns — 내 SNS 콘텐츠 목록
snsRoute.get('/sns', async (c) => {
  const tenant = c.get('tenant')
  const platform = c.req.query('platform')
  const status = c.req.query('status')
  const accountId = c.req.query('accountId')
  const variantOfParam = c.req.query('variantOf')

  const conditions = [eq(snsContents.companyId, tenant.companyId)]
  if (platform) conditions.push(eq(snsContents.platform, platform as 'instagram' | 'tistory' | 'daum_cafe'))
  if (status) conditions.push(eq(snsContents.status, status as 'draft' | 'pending' | 'approved' | 'scheduled' | 'rejected' | 'published' | 'failed'))
  if (accountId) conditions.push(eq(snsContents.snsAccountId, accountId))
  if (variantOfParam === 'root') {
    conditions.push(isNull(snsContents.variantOf))
  } else if (variantOfParam) {
    conditions.push(eq(snsContents.variantOf, variantOfParam))
  }

  const result = await db
    .select({
      id: snsContents.id,
      platform: snsContents.platform,
      title: snsContents.title,
      status: snsContents.status,
      snsAccountId: snsContents.snsAccountId,
      accountName: snsAccounts.accountName,
      createdBy: snsContents.createdBy,
      creatorName: users.name,
      publishedUrl: snsContents.publishedUrl,
      scheduledAt: snsContents.scheduledAt,
      variantOf: snsContents.variantOf,
      createdAt: snsContents.createdAt,
      updatedAt: snsContents.updatedAt,
    })
    .from(snsContents)
    .innerJoin(users, eq(snsContents.createdBy, users.id))
    .leftJoin(snsAccounts, eq(snsContents.snsAccountId, snsAccounts.id))
    .where(and(...conditions))
    .orderBy(desc(snsContents.updatedAt))

  return c.json({ data: result })
})

// GET /api/workspace/sns/stats — SNS 통계
snsRoute.get('/sns/stats', async (c) => {
  const tenant = c.get('tenant')
  const rawDays = Number(c.req.query('days')) || 30
  const days = Math.min(Math.max(rawDays, 1), 365)
  const since = new Date(Date.now() - days * 86400000)

  const baseWhere = and(
    eq(snsContents.companyId, tenant.companyId),
    gte(snsContents.createdAt, since),
  )

  const [totalResult, byStatusResult, byPlatformResult, dailyTrendResult] = await Promise.all([
    // 총 건수
    db.select({ count: count() }).from(snsContents).where(baseWhere),

    // 상태별 분포
    db.select({ status: snsContents.status, count: count() })
      .from(snsContents)
      .where(baseWhere)
      .groupBy(snsContents.status),

    // 플랫폼별 분포 (전체 + published)
    db.select({
      platform: snsContents.platform,
      total: count(),
      published: sql<number>`count(*) filter (where ${snsContents.status} = 'published')`,
    })
      .from(snsContents)
      .where(baseWhere)
      .groupBy(snsContents.platform),

    // 일별 생성 추이
    db.select({
      date: sql<string>`to_char(${snsContents.createdAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
      .from(snsContents)
      .where(baseWhere)
      .groupBy(sql`to_char(${snsContents.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${snsContents.createdAt}, 'YYYY-MM-DD')`),
  ])

  return c.json({
    data: {
      total: totalResult[0]?.count ?? 0,
      byStatus: byStatusResult.map((r) => ({ status: r.status, count: r.count })),
      byPlatform: byPlatformResult.map((r) => ({ platform: r.platform, total: r.total, published: Number(r.published) })),
      dailyTrend: dailyTrendResult.map((r) => ({ date: r.date, count: r.count })),
      days,
    },
  })
})

// POST /api/workspace/sns — 수동 콘텐츠 생성
snsRoute.post('/sns', zValidator('json', createSnsSchema), async (c) => {
  const tenant = c.get('tenant')
  const body = c.req.valid('json')

  if (body.scheduledAt && new Date(body.scheduledAt) <= new Date()) {
    throw new HTTPError(400, '예약 시간은 현재보다 미래여야 합니다', 'SNS_005')
  }

  // snsAccountId 유효성 검증
  if (body.snsAccountId) {
    const [acct] = await db.select({ id: snsAccounts.id }).from(snsAccounts)
      .where(and(eq(snsAccounts.id, body.snsAccountId), eq(snsAccounts.companyId, tenant.companyId)))
      .limit(1)
    if (!acct) throw new HTTPError(400, 'SNS 계정을 찾을 수 없습니다', 'SNS_ACCOUNT_001')
  }

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
      snsAccountId: body.snsAccountId || null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
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

  const prompt = `${PLATFORM_NAMES[platform]}에 게시할 SNS 콘텐츠를 작성해주세요.

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

// POST /api/workspace/sns/generate-with-image — AI 텍스트 + 이미지 생성
snsRoute.post('/sns/generate-with-image', zValidator('json', generateWithImageSchema), async (c) => {
  const tenant = c.get('tenant')
  const { platform, agentId, topic, imagePrompt } = c.req.valid('json')

  const [agent] = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  const prompt = `${PLATFORM_NAMES[platform]}에 게시할 SNS 콘텐츠를 작성해주세요.

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

  const titleMatch = aiResponse.match(/제목:\s*(.+)/)?.[1]?.trim() || topic
  const bodyMatch = aiResponse.match(/본문:\s*([\s\S]*?)(?=해시태그:|$)/)?.[1]?.trim() || aiResponse
  const hashtagMatch = aiResponse.match(/해시태그:\s*(.+)/)?.[1]?.trim()

  // 이미지 생성 (부분 실패 허용)
  let imageUrl: string | null = null
  let imageGenerationError: string | undefined
  if (imagePrompt) {
    const imageResult = await generateSnsImage(imagePrompt, tenant.companyId)
    imageUrl = imageResult.imageUrl
    imageGenerationError = imageResult.error
  }

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
      imageUrl,
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
    action: `AI SNS 콘텐츠 생성${imageUrl ? '+이미지' : ''} (${platform})`,
    detail: titleMatch,
  })

  return c.json({ data: content, imageGenerationError }, 201)
})

// POST /api/workspace/sns/:id/generate-image — 기존 콘텐츠에 AI 이미지 생성
snsRoute.post('/sns/:id/generate-image', zValidator('json', generateImageSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { imagePrompt } = c.req.valid('json')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, createdBy: snsContents.createdBy, title: snsContents.title })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.createdBy !== tenant.userId) throw new HTTPError(403, '본인만 이미지를 생성할 수 있습니다', 'AUTH_003')
  if (existing.status !== 'draft' && existing.status !== 'rejected') {
    throw new HTTPError(400, '초안/반려 상태에서만 이미지를 생성할 수 있습니다', 'SNS_002')
  }

  const imageResult = await generateSnsImage(imagePrompt, tenant.companyId)

  if (!imageResult.imageUrl) {
    throw new HTTPError(500, imageResult.error || '이미지 생성에 실패했습니다', 'SNS_007')
  }

  const [updated] = await db
    .update(snsContents)
    .set({ imageUrl: imageResult.imageUrl, updatedAt: new Date() })
    .where(eq(snsContents.id, id))
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS AI 이미지 생성',
    detail: existing.title,
  })

  return c.json({ data: updated })
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
      snsAccountId: snsContents.snsAccountId,
      accountName: snsAccounts.accountName,
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
      variantOf: snsContents.variantOf,
      metadata: snsContents.metadata,
      createdAt: snsContents.createdAt,
      updatedAt: snsContents.updatedAt,
    })
    .from(snsContents)
    .innerJoin(users, eq(snsContents.createdBy, users.id))
    .leftJoin(snsAccounts, eq(snsContents.snsAccountId, snsAccounts.id))
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!content) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  // 변형 목록 조회
  const variants = await db
    .select({
      id: snsContents.id,
      title: snsContents.title,
      status: snsContents.status,
      metadata: snsContents.metadata,
      createdAt: snsContents.createdAt,
    })
    .from(snsContents)
    .where(and(eq(snsContents.variantOf, id), eq(snsContents.companyId, tenant.companyId)))
    .orderBy(desc(snsContents.createdAt))

  return c.json({ data: { ...content, variants } })
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

  if (body.scheduledAt && new Date(body.scheduledAt) <= new Date()) {
    throw new HTTPError(400, '예약 시간은 현재보다 미래여야 합니다', 'SNS_005')
  }

  const [updated] = await db
    .update(snsContents)
    .set({
      title: body.title,
      body: body.body,
      hashtags: body.hashtags,
      imageUrl: body.imageUrl,
      ...(body.scheduledAt !== undefined ? { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null } : {}),
      status: 'draft',
      updatedAt: new Date(),
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
  if (!isCeoOrAbove(tenant.role)) throw new HTTPError(403, '관리자만 승인할 수 있습니다', 'AUTH_003')

  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, title: snsContents.title, scheduledAt: snsContents.scheduledAt })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.status !== 'pending') throw new HTTPError(400, '승인 요청 상태에서만 승인할 수 있습니다', 'SNS_003')

  const newStatus = existing.scheduledAt && existing.scheduledAt > new Date() ? 'scheduled' : 'approved'

  const [updated] = await db
    .update(snsContents)
    .set({
      status: newStatus,
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
    action: newStatus === 'scheduled' ? 'SNS 콘텐츠 예약 승인' : 'SNS 콘텐츠 승인',
    detail: existing.title,
  })

  return c.json({ data: updated })
})

// POST /api/workspace/sns/:id/reject — 반려 (admin, pending → rejected)
snsRoute.post('/sns/:id/reject', zValidator('json', rejectSchema), async (c) => {
  const tenant = c.get('tenant')
  if (!isCeoOrAbove(tenant.role)) throw new HTTPError(403, '관리자만 반려할 수 있습니다', 'AUTH_003')

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

    logActivity({
      companyId: tenant.companyId,
      type: 'sns',
      phase: 'error',
      actorType: 'system',
      action: `SNS 발행 실패 (${existing.platform})`,
      detail: `${existing.title} — ${errorMsg}`,
    })

    throw new HTTPError(500, errorMsg, 'SNS_006')
  }
})

// POST /api/workspace/sns/:id/cancel-schedule — 예약 취소 (scheduled → approved, admin만)
snsRoute.post('/sns/:id/cancel-schedule', async (c) => {
  const tenant = c.get('tenant')
  if (!isCeoOrAbove(tenant.role)) throw new HTTPError(403, '관리자만 예약을 취소할 수 있습니다', 'AUTH_003')

  const id = c.req.param('id')

  const [existing] = await db
    .select({ id: snsContents.id, status: snsContents.status, title: snsContents.title })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')
  if (existing.status !== 'scheduled') throw new HTTPError(400, '예약 상태에서만 취소할 수 있습니다', 'SNS_006')

  const [updated] = await db
    .update(snsContents)
    .set({
      status: 'approved',
      scheduledAt: null,
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
    action: 'SNS 예약 취소',
    detail: existing.title,
  })

  return c.json({ data: updated })
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

// ==================== A/B 테스트 최적화 ====================

// POST /api/workspace/sns/:id/create-variant — 수동 변형 생성
snsRoute.post('/sns/:id/create-variant', zValidator('json', createVariantSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const [original] = await db
    .select()
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!original) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  const [variant] = await db
    .insert(snsContents)
    .values({
      companyId: tenant.companyId,
      createdBy: tenant.userId,
      agentId: original.agentId,
      snsAccountId: original.snsAccountId,
      platform: original.platform,
      title: body.title || original.title,
      body: body.body || original.body,
      hashtags: body.hashtags ?? original.hashtags,
      imageUrl: body.imageUrl ?? original.imageUrl,
      variantOf: id,
      status: 'draft',
    })
    .returning()

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'user',
    actorId: tenant.userId,
    action: 'SNS A/B 변형 생성',
    detail: `${original.title} → ${variant.title}`,
  })

  return c.json({ data: variant }, 201)
})

const STRATEGY_PROMPTS: Record<string, string> = {
  tone: '같은 내용을 다른 어조(공식적/친근한/유머러스 등)로 변형해주세요.',
  length: '같은 메시지를 더 짧게 또는 길게 변형해주세요.',
  hashtag: '같은 내용에 다른 해시태그 전략을 적용해주세요.',
  headline: '같은 본문에 다른 제목/헤드라인을 적용해주세요.',
  mixed: '어조, 길이, 해시태그, 제목을 모두 다르게 변형해주세요.',
}

// POST /api/workspace/sns/:id/generate-variants — AI 변형 자동 생성
snsRoute.post('/sns/:id/generate-variants', zValidator('json', generateVariantsSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const { count: variantCount, strategy, agentId } = c.req.valid('json')

  const [original] = await db
    .select()
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!original) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  const [agent] = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'AGENT_001')

  const createdVariants = []

  for (let i = 0; i < variantCount; i++) {
    try {
      const prompt = `아래 SNS 콘텐츠의 A/B 테스트 변형 ${i + 1}/${variantCount}을 만들어주세요.

전략: ${STRATEGY_PROMPTS[strategy]}

원본 콘텐츠:
플랫폼: ${PLATFORM_NAMES[original.platform]}
제목: ${original.title}
본문: ${original.body}
해시태그: ${original.hashtags || '없음'}

다음 형식으로 작성해주세요:
제목: [변형된 제목]
본문: [변형된 본문]
해시태그: [변형된 해시태그]`

      const aiResponse = await generateAgentResponse({
        agentId,
        sessionId: '',
        companyId: tenant.companyId,
        userMessage: prompt,
        userId: tenant.userId,
      })

      const titleMatch = aiResponse.match(/제목:\s*(.+)/)?.[1]?.trim() || `${original.title} (변형 ${i + 1})`
      const bodyMatch = aiResponse.match(/본문:\s*([\s\S]*?)(?=해시태그:|$)/)?.[1]?.trim() || original.body
      const hashtagMatch = aiResponse.match(/해시태그:\s*(.+)/)?.[1]?.trim() || original.hashtags

      const [variant] = await db
        .insert(snsContents)
        .values({
          companyId: tenant.companyId,
          agentId,
          createdBy: tenant.userId,
          snsAccountId: original.snsAccountId,
          platform: original.platform,
          title: titleMatch,
          body: bodyMatch,
          hashtags: hashtagMatch,
          imageUrl: original.imageUrl,
          variantOf: id,
          status: 'draft',
        })
        .returning()

      createdVariants.push(variant)
    } catch {
      // 부분 실패 허용 — 이미 생성된 변형은 유지, 나머지 계속 시도
      continue
    }
  }

  logActivity({
    companyId: tenant.companyId,
    type: 'sns',
    phase: 'end',
    actorType: 'agent',
    actorId: agentId,
    actorName: agent.name,
    action: `AI A/B 변형 ${variantCount}개 생성 (${strategy})`,
    detail: original.title,
  })

  return c.json({ data: createdVariants }, 201)
})

// PUT /api/workspace/sns/:id/metrics — 성과 데이터 입력
snsRoute.put('/sns/:id/metrics', zValidator('json', metricsSchema), async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')
  const metrics = c.req.valid('json')

  const [existing] = await db
    .select({ id: snsContents.id, metadata: snsContents.metadata })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!existing) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  const existingMetadata = (existing.metadata as Record<string, unknown>) || {}

  const [updated] = await db
    .update(snsContents)
    .set({
      metadata: { ...existingMetadata, metrics: { ...metrics, updatedAt: new Date().toISOString() } },
      updatedAt: new Date(),
    })
    .where(eq(snsContents.id, id))
    .returning()

  return c.json({ data: updated })
})

function calcEngagement(m: { views: number; likes: number; shares: number; clicks: number }): number {
  return m.views + m.likes * 2 + m.shares * 3 + m.clicks * 2
}

// GET /api/workspace/sns/:id/ab-results — A/B 테스트 결과 비교
snsRoute.get('/sns/:id/ab-results', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [original] = await db
    .select({
      id: snsContents.id,
      title: snsContents.title,
      status: snsContents.status,
      metadata: snsContents.metadata,
      platform: snsContents.platform,
      createdAt: snsContents.createdAt,
    })
    .from(snsContents)
    .where(and(eq(snsContents.id, id), eq(snsContents.companyId, tenant.companyId)))
    .limit(1)

  if (!original) throw new HTTPError(404, 'SNS 콘텐츠를 찾을 수 없습니다', 'SNS_001')

  const variants = await db
    .select({
      id: snsContents.id,
      title: snsContents.title,
      status: snsContents.status,
      metadata: snsContents.metadata,
      createdAt: snsContents.createdAt,
    })
    .from(snsContents)
    .where(and(eq(snsContents.variantOf, id), eq(snsContents.companyId, tenant.companyId)))
    .orderBy(snsContents.createdAt)

  const allContents = [original, ...variants]

  const scores = allContents.map((item) => {
    const meta = item.metadata as Record<string, unknown> | null
    const metrics = (meta?.metrics as { views: number; likes: number; shares: number; clicks: number }) || null
    const score = metrics ? calcEngagement(metrics) : 0
    return {
      id: item.id,
      title: item.title,
      status: item.status,
      metrics,
      score,
    }
  })

  const scoredEntries = scores.filter((s) => s.metrics !== null)
  const winner = scoredEntries.length > 0
    ? scoredEntries.reduce((best, curr) => (curr.score > best.score ? curr : best))
    : null

  return c.json({
    data: {
      original,
      variants,
      winner: winner ? { id: winner.id, score: winner.score } : null,
      scores,
    },
  })
})
