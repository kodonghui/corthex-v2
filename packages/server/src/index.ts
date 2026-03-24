import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { compress } from 'hono/compress'
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
import { workspaceDepartmentsRoute } from './routes/workspace/departments'
import { workspaceTierConfigsRoute } from './routes/workspace/tier-configs'
import { workspaceEmployeesRoute } from './routes/workspace/employees'
import { chatRoute } from './routes/workspace/chat'
import { hubRoute } from './routes/workspace/hub'
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

import { conversationsRoute } from './routes/workspace/conversations'
import { workspaceTemplateMarketRoute } from './routes/workspace/template-market'
import { workspaceAgentMarketplaceRoute } from './routes/workspace/agent-marketplace'
import { marketingApprovalRoute } from './routes/workspace/marketing-approval'
import { observationsRoute } from './routes/workspace/observations'
import { publicApiKeysRoute } from './routes/admin/public-api-keys'
import { tierConfigsRoute } from './routes/admin/tier-configs'
import { companySettingsRoute } from './routes/admin/company-settings'
import { adminKnowledgeRoute } from './routes/admin/knowledge'
import { nexusLayoutRoute } from './routes/admin/nexus-layout'
import { adminAgentReportsRoute } from './routes/admin/agent-reports'
import { adminMcpServersRoute } from './routes/admin/mcp-servers'
import { toolSanitizerRoute } from './routes/admin/tool-sanitizer'
import { n8nProxyRoute } from './routes/admin/n8n-proxy'
import { n8nPresetsRoute } from './routes/admin/n8n-presets'
import { publicApiV1Route } from './routes/public-api/v1'
import { superAdminCompaniesRoute } from './routes/super-admin/companies'

import { onboardingRoute } from './routes/onboarding'
import { commandsRoute } from './routes/commands'
import { telegramWebhookRoute } from './routes/telegram-webhook'
import { runMigrations } from './db'
import { startJobWorker, stopJobWorker } from './lib/job-queue'
import { startArgosEngine, stopArgosEngine } from './services/argos-evaluator'
import { startCronEngine, stopCronEngine } from './services/cron-execution-engine'
import { startTriggerWorker, stopTriggerWorker } from './lib/trigger-worker'
import { startSnsScheduleChecker, stopSnsScheduleChecker } from './lib/sns-schedule-checker'
import { startSemanticCacheCleanup, stopSemanticCacheCleanup } from './lib/semantic-cache-cleanup'
import { startReflectionCron, stopReflectionCron } from './services/reflection-cron'
import { getActiveSessions } from './engine/agent-loop'
import { loginRateLimit, apiRateLimit } from './middleware/rate-limit'
import { wsRoute, websocket, broadcastServerRestart } from './ws/server'
import { eventBus } from './lib/event-bus'
import { initToolPool } from './services/tool-pool-init'
import { broadcastToCompany, broadcastToChannel } from './ws/channels'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()
const isProd = process.env.NODE_ENV === 'production'

/** Graceful shutdown flag — when true, new API requests get 503 (NFR-O1) */
export let isShuttingDown = false

// 글로벌 미들웨어
app.use('*', compress())
app.use('*', secureHeaders({
  strictTransportSecurity: isProd ? 'max-age=31536000; includeSubDomains' : false,
  contentSecurityPolicy: isProd ? {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://static.cloudflareinsights.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://corthex-hq.com', 'wss://corthex-hq.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  } : undefined,
}))
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

// Graceful shutdown — reject new requests with 503 (health excluded for LB/Docker)
app.use('/api/*', async (c, next) => {
  if (isShuttingDown && !c.req.path.startsWith('/api/health')) {
    return c.json({
      success: false,
      error: { code: 'SERVER_SHUTTING_DOWN', message: 'Server is shutting down, please retry' }
    }, 503)
  }
  await next()
})

// Rate Limiting (health 제외)
app.use('/api/*', apiRateLimit)          // 일반 API: 100/min
app.use('/api/auth/login', loginRateLimit)       // 로그인: 5/min
app.use('/api/auth/admin/login', loginRateLimit) // 관리자 로그인: 5/min
app.use('/api/auth/register', loginRateLimit)    // 회원가입: 5/min
app.use('/api/auth/accept-invite', loginRateLimit) // 초대 수락: 5/min

app.route('/api', authRoute)
app.route('/api', onboardingRoute)

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
app.route('/api/admin', publicApiKeysRoute)
app.route('/api/admin', tierConfigsRoute)
app.route('/api/admin', companySettingsRoute)
app.route('/api/admin', adminKnowledgeRoute)
app.route('/api/admin', nexusLayoutRoute)
app.route('/api/admin', adminAgentReportsRoute)
app.route('/api/admin', adminMcpServersRoute)
app.route('/api/admin', toolSanitizerRoute)

// n8n reverse proxy (AR35, FR-N8N1, FR-N8N6)
app.route('/api/admin', n8nProxyRoute)
// n8n preset workflows (AR40, FR-MKT2)
app.route('/api/admin', n8nPresetsRoute)

// 유저 워크스페이스 라우트 (각 파일 내부에서 authMiddleware 적용, 테넌트 격리)
app.route('/api/workspace', workspaceAgentsRoute)
app.route('/api/workspace', workspaceDepartmentsRoute)
app.route('/api/workspace', workspaceTierConfigsRoute)
app.route('/api/workspace', workspaceEmployeesRoute)
app.route('/api/workspace/chat', chatRoute)
app.route('/api/workspace/hub', hubRoute)
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

app.route('/api/workspace/conversations', conversationsRoute)
app.route('/api/workspace', workspaceTemplateMarketRoute)
app.route('/api/workspace', workspaceAgentMarketplaceRoute)
// Marketing approval (FR-MKT3)
app.route('/api/workspace', marketingApprovalRoute)
// Observations (Story 28.1, MEM-6 Layer 1)
app.route('/api/workspace', observationsRoute)

// 공개 API (API 키 인증)
app.route('/api/v1', publicApiV1Route)

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

// API 404 — SPA fallback 전에 등록하여 존재하지 않는 API 엔드포인트를 잡음
app.all('/api/*', (c) => c.json({ success: false, error: { code: 'NOT_FOUND', message: 'API endpoint not found' } }, 404))

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
  startSemanticCacheCleanup()
  startReflectionCron()
})

// Graceful Shutdown — wait for active agent sessions before exit (NFR-O1)
process.on('SIGTERM', async () => {
  isShuttingDown = true
  const sessions = getActiveSessions()
  console.log(`Graceful shutdown initiated, ${sessions.size} active sessions remaining`)

  // Stop background workers
  stopJobWorker()
  await stopCronEngine()
  stopTriggerWorker()
  await stopArgosEngine()
  stopSnsScheduleChecker()
  stopSemanticCacheCleanup()
  stopReflectionCron()
  broadcastServerRestart()

  // Force exit after 120s (NFR-P8)
  const forceTimer = setTimeout(() => {
    console.log(`Force shutdown — ${getActiveSessions().size} sessions abandoned`)
    process.exit(1)
  }, 120_000)
  // Prevent timer from keeping process alive if sessions finish
  if (forceTimer.unref) forceTimer.unref()

  // Poll every 5s until all sessions complete
  while (getActiveSessions().size > 0) {
    console.log(`Waiting for ${getActiveSessions().size} active sessions...`)
    await new Promise(r => setTimeout(r, 5_000))
  }

  clearTimeout(forceTimer)
  console.log('All sessions completed, shutting down')
  process.exit(0)
})

export default {
  port,
  fetch: app.fetch,
  websocket,
}
