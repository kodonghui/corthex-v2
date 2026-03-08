import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { departmentScopeMiddleware } from '../../middleware/department-scope'
import {
  parsePaginationParams,
  getAgentActivity,
  getDelegations,
  getQualityReviews,
  getToolInvocations,
} from '../../services/activity-log-service'
import type { AppEnv } from '../../types'

export const activityTabsRoute = new Hono<AppEnv>()

activityTabsRoute.use('*', authMiddleware)
activityTabsRoute.use('*', departmentScopeMiddleware)

// GET /activity/agents — 활동 탭 (에이전트 활동 로그)
activityTabsRoute.get('/activity/agents', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const result = await getAgentActivity(tenant.companyId, {
    agentId: query.agentId,
    departmentId: query.departmentId,
    departmentIds: tenant.departmentIds,
    status: query.status,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search?.trim(),
  }, pagination)

  return c.json({ success: true, data: result })
})

// GET /activity/delegations — 통신 탭 (위임 기록)
activityTabsRoute.get('/activity/delegations', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const result = await getDelegations(tenant.companyId, {
    departmentId: query.departmentId,
    departmentIds: tenant.departmentIds,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search?.trim(),
  }, pagination)

  return c.json({ success: true, data: result })
})

// GET /activity/quality — QA 탭 (품질 검수 결과)
activityTabsRoute.get('/activity/quality', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const result = await getQualityReviews(tenant.companyId, {
    conclusion: query.conclusion as 'pass' | 'fail' | undefined,
    reviewerAgentId: query.reviewerAgentId,
    departmentIds: tenant.departmentIds,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search?.trim(),
  }, pagination)

  return c.json({ success: true, data: result })
})

// GET /activity/tools — 도구 탭 (도구 호출 기록)
activityTabsRoute.get('/activity/tools', async (c) => {
  const tenant = c.get('tenant')
  const query = c.req.query()
  const pagination = parsePaginationParams(query)

  const result = await getToolInvocations(tenant.companyId, {
    toolName: query.toolName,
    agentId: query.agentId,
    departmentIds: tenant.departmentIds,
    status: query.status,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search?.trim(),
  }, pagination)

  return c.json({ success: true, data: result })
})
