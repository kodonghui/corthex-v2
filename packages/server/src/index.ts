import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error'
import { healthRoute } from './routes/health'
import { authRoute } from './routes/auth'
import { companiesRoute } from './routes/admin/companies'
import { usersRoute } from './routes/admin/users'
import { departmentsRoute } from './routes/admin/departments'
import { agentsRoute } from './routes/admin/agents'
import { credentialsRoute } from './routes/admin/credentials'
import { toolsRoute } from './routes/admin/tools'
import { reportLinesRoute } from './routes/admin/report-lines'
import { soulTemplatesRoute } from './routes/admin/soul-templates'
import { monitoringRoute } from './routes/admin/monitoring'
import { orgChartRoute } from './routes/admin/org-chart'
import { auditLogsRoute } from './routes/admin/audit-logs'
import { orgTemplatesRoute } from './routes/admin/org-templates'
import { toolInvocationsRoute } from './routes/admin/tool-invocations'
import { costsRoute } from './routes/admin/costs'
import { budgetRoute } from './routes/admin/budget'
import { qualityRulesRoute } from './routes/admin/quality-rules'
import { securityRoute } from './routes/admin/security'
import { employeesRoute } from './routes/admin/employees'
import { workspaceAgentsRoute } from './routes/workspace/agents'
import { chatRoute } from './routes/workspace/chat'
import { profileRoute } from './routes/workspace/profile'
import { reportsRoute } from './routes/workspace/reports'
import { jobsRoute } from './routes/workspace/jobs'
import { snsRoute } from './routes/workspace/sns'
import { snsAccountsRoute } from './routes/workspace/sns-accounts'
import { activityLogRoute } from './routes/workspace/activity-log'
import { activityTabsRoute } from './routes/workspace/activity-tabs'
import { notificationsRoute } from './routes/workspace/notifications'
import { dashboardRoute } from './routes/workspace/dashboard'
import { telegramRoute } from './routes/workspace/telegram'
import { messengerRoute } from './routes/workspace/messenger'
import { nexusRoute } from './routes/workspace/nexus'
import { strategyRoute } from './routes/workspace/strategy'
import { debatesRoute } from './routes/workspace/debates'
import { filesRoute } from './routes/workspace/files'
import { workspaceSoulTemplatesRoute } from './routes/workspace/soul-templates'
import { pushRoute } from './routes/workspace/push'
import { settingsMcpRoute } from './routes/workspace/settings-mcp'
import { invitationsRoute } from './routes/workspace/invitations'
import { workspaceCredentialsRoute } from './routes/workspace/credentials'
import { workspaceOrgChartRoute } from './routes/workspace/org-chart'
import { presetsRoute } from './routes/workspace/presets'
import { sketchesRoute } from './routes/workspace/sketches'
import { operationLogRoute } from './routes/workspace/operation-log'
import { knowledgeRoute } from './routes/workspace/knowledge'
import { argosRoute } from './routes/workspace/argos'
import { archiveRoute } from './routes/workspace/archive'
import { qualityDashboardRoute } from './routes/workspace/quality-dashboard'
import { performanceRoute } from './routes/workspace/performance'
import { workflowsRoute } from './routes/workspace/workflows'
import { conversationsRoute } from './routes/workspace/conversations'
import { workspaceTemplateMarketRoute } from './routes/workspace/template-market'
import { superAdminCompaniesRoute } from './routes/super-admin/companies'

import { commandsRoute } from './routes/commands'
import { telegramWebhookRoute } from './routes/telegram-webhook'
import { runMigrations } from './db'
import { startJobWorker, stopJobWorker } from './lib/job-queue'
import { startArgosEngine, stopArgosEngine } from './services/argos-evaluator'
import { startCronEngine, stopCronEngine } from './services/cron-execution-engine'
import { startTriggerWorker, stopTriggerWorker } from './lib/trigger-worker'
import { startSnsScheduleChecker, stopSnsScheduleChecker } from './lib/sns-schedule-checker'
import { loginRateLimit, apiRateLimit } from './middleware/rate-limit'
import { wsRoute, websocket, broadcastServerRestart } from './ws/server'
import { eventBus } from './lib/event-bus'
import { initToolPool } from './services/tool-pool-init'
import { broadcastToCompany, broadcastToChannel } from './ws/channels'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()
const isProd = process.env.NODE_ENV === 'production'

// 글로벌 미들웨어
app.use('*', logger())
app.use('*', cors({
  origin: isProd
    ? ['https://corthex-hq.com']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))

// 글로벌 에러 핸들러 (서브라우터 에러도 캐치)
app.onError(errorHandler)

// 공개 라우트 (인증 불필요) — health는 rate limit 이전에 등록
app.route('/api', healthRoute)
app.route('/api/telegram', telegramWebhookRoute)  // Telegram Webhook (공개, rate limit 적용)

// Rate Limiting (health 제외)
app.use('/api/*', apiRateLimit)          // 일반 API: 100/min
app.use('/api/auth/login', loginRateLimit)       // 로그인: 5/min
app.use('/api/auth/admin/login', loginRateLimit) // 관리자 로그인: 5/min
app.use('/api/auth/register', loginRateLimit)    // 회원가입: 5/min
app.use('/api/auth/accept-invite', loginRateLimit) // 초대 수락: 5/min

app.route('/api', authRoute)

// Super Admin 라우트 (super_admin 역할만 접근)
app.route('/api/super-admin', superAdminCompaniesRoute)

// 관리자 라우트 (각 파일 내부에서 authMiddleware + adminOnly 적용)
app.route('/api/admin', companiesRoute)
app.route('/api/admin', usersRoute)
app.route('/api/admin', departmentsRoute)
app.route('/api/admin', agentsRoute)
app.route('/api/admin', credentialsRoute)
app.route('/api/admin', toolsRoute)
app.route('/api/admin', reportLinesRoute)
app.route('/api/admin', soulTemplatesRoute)
app.route('/api/admin', monitoringRoute)
app.route('/api/admin', orgChartRoute)
app.route('/api/admin', auditLogsRoute)
app.route('/api/admin', orgTemplatesRoute)
app.route('/api/admin', toolInvocationsRoute)
app.route('/api/admin', costsRoute)
app.route('/api/admin', budgetRoute)
app.route('/api/admin', qualityRulesRoute)
app.route('/api/admin', securityRoute)
app.route('/api/admin', employeesRoute)

// 유저 워크스페이스 라우트 (각 파일 내부에서 authMiddleware 적용, 테넌트 격리)
app.route('/api/workspace', workspaceAgentsRoute)
app.route('/api/workspace/chat', chatRoute)
app.route('/api/workspace', profileRoute)
app.route('/api/workspace', reportsRoute)
app.route('/api/workspace/jobs', jobsRoute)
app.route('/api/workspace', snsRoute)
app.route('/api/workspace/sns-accounts', snsAccountsRoute)
app.route('/api/workspace', activityLogRoute)
app.route('/api/workspace', activityTabsRoute)
app.route('/api/workspace', notificationsRoute)
app.route('/api/workspace', dashboardRoute)
app.route('/api/workspace', telegramRoute)
app.route('/api/workspace/messenger', messengerRoute)
app.route('/api/workspace', nexusRoute)
app.route('/api/workspace/strategy', strategyRoute)
app.route('/api/workspace/debates', debatesRoute)
app.route('/api/workspace/files', filesRoute)
app.route('/api/workspace', workspaceSoulTemplatesRoute)
app.route('/api/workspace/push', pushRoute)
app.route('/api/workspace/settings', settingsMcpRoute)
app.route('/api/workspace', invitationsRoute)
app.route('/api/workspace', workspaceCredentialsRoute)
app.route('/api/workspace', workspaceOrgChartRoute)
app.route('/api/workspace/commands', commandsRoute)
app.route('/api/workspace/presets', presetsRoute)
app.route('/api/workspace/sketches', sketchesRoute)
app.route('/api/workspace', operationLogRoute)
app.route('/api/workspace/knowledge', knowledgeRoute)
app.route('/api/workspace/argos', argosRoute)
app.route('/api/workspace/archive', archiveRoute)
app.route('/api/workspace', qualityDashboardRoute)
app.route('/api/workspace', performanceRoute)
app.route('/api/workspace', workflowsRoute)
app.route('/api/workspace/conversations', conversationsRoute)
app.route('/api/workspace', workspaceTemplateMarketRoute)

// WebSocket 라우트
app.get('/ws', wsRoute)

// EventBus → WS 브리지
eventBus.on('activity', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'activity-log', data.payload)
})
eventBus.on('agent-status', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'agent-status', data.payload)
})
eventBus.on('notification', (data: { userId: string; payload: unknown }) => {
  broadcastToCompany(data.userId, 'notifications', data.payload)
})
eventBus.on('night-job', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'night-job', data.payload)
})
eventBus.on('command', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'command', data.payload)
})
eventBus.on('delegation', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'delegation', data.payload)
})
eventBus.on('tool', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'tool', data.payload)
})
eventBus.on('cost', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'cost', data.payload)
})
eventBus.on('argos', (data: { companyId: string; payload: unknown }) => {
  broadcastToCompany(data.companyId, 'argos', data.payload)
})
eventBus.on('debate', (data: { companyId: string; payload: unknown }) => {
  const payload = data.payload as { debateId?: string }
  if (payload?.debateId) {
    broadcastToChannel(`debate::${payload.debateId}`, data.payload)
  }
})

// 프로덕션: Bun 네이티브 정적 파일 서빙 (SPA 폴백 포함)
if (isProd) {
  const STATIC_DIR = '/app/public'

  const getMime = (p: string) => {
    if (p.endsWith('.html')) return 'text/html'
    if (p.endsWith('.js')) return 'application/javascript'
    if (p.endsWith('.css')) return 'text/css'
    if (p.endsWith('.json')) return 'application/json'
    if (p.endsWith('.png')) return 'image/png'
    if (p.endsWith('.svg')) return 'image/svg+xml'
    if (p.endsWith('.ico')) return 'image/x-icon'
    return 'application/octet-stream'
  }

  // 캐시 헤더: HTML은 no-cache, 해시된 에셋은 1년 캐시
  const cacheHeaders = (mime: string) =>
    mime === 'text/html'
      ? { 'content-type': mime, 'cache-control': 'no-cache, no-store, must-revalidate' }
      : { 'content-type': mime, 'cache-control': 'public, max-age=31536000, immutable' }

  // Admin SPA — /admin/*
  app.get('/admin/*', async (c) => {
    const sub = c.req.path.replace(/^\/admin/, '') || '/index.html'
    const file = Bun.file(`${STATIC_DIR}/admin${sub}`)
    if (await file.exists()) return new Response(file, { headers: cacheHeaders(getMime(sub)) })
    const fallback = Bun.file(`${STATIC_DIR}/admin/index.html`)
    return new Response(fallback, { headers: cacheHeaders('text/html') })
  })

  // App SPA — /*
  app.get('*', async (c) => {
    const sub = c.req.path
    const file = Bun.file(`${STATIC_DIR}/app${sub}`)
    if (await file.exists()) return new Response(file, { headers: cacheHeaders(getMime(sub)) })
    const fallback = Bun.file(`${STATIC_DIR}/app/index.html`)
    return new Response(fallback, { headers: cacheHeaders('text/html') })
  })
}

// 서버 시작
const port = Number(process.env.PORT) || 3000

console.log(`🚀 CORTHEX v2 서버 시작 — http://localhost:${port}`)

// ToolPool -> AgentRunner 연결
initToolPool()

// DB 마이그레이션 자동 적용 후 워커 시작
runMigrations().then(() => {
  startJobWorker()
  startCronEngine()
  startTriggerWorker()
  startArgosEngine()
  startSnsScheduleChecker()
})

// Graceful Shutdown — SIGTERM 시 WS 클라이언트 알림 후 종료
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM 수신 — 클라이언트 연결 종료 중...')
  stopJobWorker()
  await stopCronEngine()
  stopTriggerWorker()
  await stopArgosEngine()
  stopSnsScheduleChecker()
  broadcastServerRestart()
  setTimeout(() => {
    console.log('✅ 서버 종료')
    process.exit(0)
  }, 10_000)
})

export default {
  port,
  fetch: app.fetch,
  websocket,
}
