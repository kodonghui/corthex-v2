import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, sql, isNull, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '../../db'
import { nightJobs, agents } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'
import { HTTPError } from '../../middleware/error'
import { queueNightJob } from '../../lib/job-queue'
import { schedulesRoute } from './schedules'
import { triggersRoute } from './triggers'
import type { AppEnv } from '../../types'

export const jobsRoute = new Hono<AppEnv>()

// 스케줄 서브라우트 마운트
jobsRoute.route('/schedules', schedulesRoute)
jobsRoute.route('/triggers', triggersRoute)

jobsRoute.use('*', authMiddleware)

const queueJobSchema = z.object({
  agentId: z.string().uuid(),
  instruction: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
})

// POST /api/workspace/jobs — 야간 작업 등록
jobsRoute.post('/', zValidator('json', queueJobSchema), async (c) => {
  const tenant = c.get('tenant')
  const { agentId, instruction, scheduledFor } = c.req.valid('json')

  // 에이전트 소속 확인
  const [agent] = await db
    .select({ id: agents.id, name: agents.name })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, tenant.companyId)))
    .limit(1)

  if (!agent) throw new HTTPError(404, '에이전트를 찾을 수 없습니다', 'QUEUE_001')

  const job = await queueNightJob({
    companyId: tenant.companyId,
    userId: tenant.userId,
    agentId,
    instruction,
    scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
  })

  return c.json({ data: job }, 201)
})

// GET /api/workspace/jobs — 내 야간 작업 목록
jobsRoute.get('/', async (c) => {
  const tenant = c.get('tenant')

  const result = await db
    .select({
      id: nightJobs.id,
      agentId: nightJobs.agentId,
      agentName: agents.name,
      instruction: nightJobs.instruction,
      status: nightJobs.status,
      result: nightJobs.result,
      error: nightJobs.error,
      retryCount: nightJobs.retryCount,
      maxRetries: nightJobs.maxRetries,
      scheduledFor: nightJobs.scheduledFor,
      startedAt: nightJobs.startedAt,
      completedAt: nightJobs.completedAt,
      isRead: nightJobs.isRead,
      resultData: nightJobs.resultData,
      parentJobId: nightJobs.parentJobId,
      chainId: nightJobs.chainId,
      createdAt: nightJobs.createdAt,
    })
    .from(nightJobs)
    .innerJoin(agents, eq(nightJobs.agentId, agents.id))
    .where(and(
      eq(nightJobs.userId, tenant.userId),
      eq(nightJobs.companyId, tenant.companyId),
      isNull(nightJobs.scheduleId),
      isNull(nightJobs.triggerId),
    ))
    .orderBy(desc(nightJobs.createdAt))
    .limit(50)

  return c.json({ data: result })
})

// GET /api/workspace/jobs/notifications — 아침 알림 (읽지 않은 완료/실패 작업)
jobsRoute.get('/notifications', async (c) => {
  const tenant = c.get('tenant')

  const completed = await db
    .select({
      id: nightJobs.id,
      agentName: agents.name,
      instruction: nightJobs.instruction,
      status: nightJobs.status,
      result: nightJobs.result,
      error: nightJobs.error,
      resultData: nightJobs.resultData,
      completedAt: nightJobs.completedAt,
    })
    .from(nightJobs)
    .innerJoin(agents, eq(nightJobs.agentId, agents.id))
    .where(
      and(
        eq(nightJobs.userId, tenant.userId),
        eq(nightJobs.companyId, tenant.companyId),
        eq(nightJobs.isRead, false),
        sql`${nightJobs.status} IN ('completed', 'failed')`,
      ),
    )
    .orderBy(desc(nightJobs.completedAt))

  return c.json({
    data: {
      total: completed.length,
      completedCount: completed.filter((j) => j.status === 'completed').length,
      failedCount: completed.filter((j) => j.status === 'failed').length,
      jobs: completed,
    },
  })
})

// PUT /api/workspace/jobs/:id/read — 알림 읽음 처리
jobsRoute.put('/:id/read', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  const [job] = await db
    .update(nightJobs)
    .set({ isRead: true })
    .where(and(eq(nightJobs.id, id), eq(nightJobs.companyId, tenant.companyId), eq(nightJobs.userId, tenant.userId)))
    .returning()

  if (!job) throw new HTTPError(404, '작업을 찾을 수 없습니다', 'QUEUE_002')
  return c.json({ data: { updated: true } })
})

// PUT /api/workspace/jobs/read-all — 모든 알림 읽음 처리
jobsRoute.put('/read-all', async (c) => {
  const tenant = c.get('tenant')

  await db
    .update(nightJobs)
    .set({ isRead: true })
    .where(
      and(
        eq(nightJobs.userId, tenant.userId),
        eq(nightJobs.companyId, tenant.companyId),
        eq(nightJobs.isRead, false),
      ),
    )

  return c.json({ data: { updated: true } })
})

// DELETE /api/workspace/jobs/:id — 대기 중 작업 취소
jobsRoute.delete('/:id', async (c) => {
  const tenant = c.get('tenant')
  const id = c.req.param('id')

  // queued 상태인 것만 삭제 가능
  const [job] = await db
    .select({ id: nightJobs.id, status: nightJobs.status })
    .from(nightJobs)
    .where(and(eq(nightJobs.id, id), eq(nightJobs.companyId, tenant.companyId), eq(nightJobs.userId, tenant.userId)))
    .limit(1)

  if (!job) throw new HTTPError(404, '작업을 찾을 수 없습니다', 'QUEUE_002')
  if (job.status !== 'queued') {
    throw new HTTPError(400, '대기 중인 작업만 취소할 수 있습니다', 'QUEUE_003')
  }

  await db.delete(nightJobs).where(eq(nightJobs.id, id))
  return c.json({ data: { deleted: true } })
})

// POST /api/workspace/jobs/chain — 체인 작업 일괄 등록 (2~5단계)
const chainJobSchema = z.object({
  steps: z.array(z.object({
    agentId: z.string().uuid(),
    instruction: z.string().min(1),
  })).min(2).max(5),
})

jobsRoute.post('/chain', zValidator('json', chainJobSchema), async (c) => {
  const tenant = c.get('tenant')
  const { steps } = c.req.valid('json')

  // 모든 에이전트 소속 확인
  const agentIds = [...new Set(steps.map(s => s.agentId))]
  const validAgents = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(
      inArray(agents.id, agentIds),
      eq(agents.companyId, tenant.companyId),
    ))

  if (validAgents.length !== agentIds.length) {
    throw new HTTPError(404, '유효하지 않은 에이전트가 포함되어 있습니다', 'CHAIN_001')
  }

  const chainId = randomUUID()

  const createdJobs = await db.transaction(async (tx) => {
    const jobs = []
    let previousJobId: string | null = null

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const [job] = await tx
        .insert(nightJobs)
        .values({
          companyId: tenant.companyId,
          userId: tenant.userId,
          agentId: step.agentId,
          instruction: step.instruction,
          status: i === 0 ? 'queued' : 'blocked',
          scheduledFor: new Date(),
          maxRetries: 3,
          chainId,
          parentJobId: previousJobId,
        })
        .returning()

      jobs.push(job)
      previousJobId = job.id
    }
    return jobs
  })

  console.log(`🔗 체인 작업 등록: ${chainId} (${steps.length}단계)`)
  return c.json({ data: createdJobs }, 201)
})

// DELETE /api/workspace/jobs/chain/:chainId — 체인 전체 취소
jobsRoute.delete('/chain/:chainId', async (c) => {
  const tenant = c.get('tenant')
  const chainId = c.req.param('chainId')

  // 체인 내 processing 작업 확인
  const [processing] = await db
    .select({ id: nightJobs.id })
    .from(nightJobs)
    .where(and(
      eq(nightJobs.chainId, chainId),
      eq(nightJobs.companyId, tenant.companyId),
      eq(nightJobs.userId, tenant.userId),
      eq(nightJobs.status, 'processing'),
    ))
    .limit(1)

  if (processing) {
    throw new HTTPError(400, '처리 중인 작업이 포함된 체인은 취소할 수 없습니다', 'CHAIN_002')
  }

  // queued/blocked 작업 삭제
  const deleted = await db
    .delete(nightJobs)
    .where(and(
      eq(nightJobs.chainId, chainId),
      eq(nightJobs.companyId, tenant.companyId),
      eq(nightJobs.userId, tenant.userId),
      sql`${nightJobs.status} IN ('queued', 'blocked')`,
    ))
    .returning({ id: nightJobs.id })

  return c.json({ data: { deleted: deleted.length } })
})
