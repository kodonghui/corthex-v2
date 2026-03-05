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
import { workspaceAgentsRoute } from './routes/workspace/agents'
import { chatRoute } from './routes/workspace/chat'
import { profileRoute } from './routes/workspace/profile'
import { reportsRoute } from './routes/workspace/reports'
import { jobsRoute } from './routes/workspace/jobs'
import { snsRoute } from './routes/workspace/sns'
import { activityLogRoute } from './routes/workspace/activity-log'
import { notificationsRoute } from './routes/workspace/notifications'
import { dashboardRoute } from './routes/workspace/dashboard'
import { telegramRoute } from './routes/workspace/telegram'
import { messengerRoute } from './routes/workspace/messenger'
import { nexusRoute } from './routes/workspace/nexus'
import { strategyRoute } from './routes/workspace/strategy'
import { schedulesRoute } from './routes/workspace/schedules'
import { triggersRoute } from './routes/workspace/triggers'
import { filesRoute } from './routes/workspace/files'
import { runMigrations } from './db'
import { startJobWorker } from './lib/job-queue'
import { startScheduleWorker } from './lib/schedule-worker'
import { startTriggerWorker } from './lib/trigger-worker'
import { loginRateLimit, apiRateLimit } from './middleware/rate-limit'
import { wsRoute, websocket, broadcastServerRestart } from './ws/server'
import { eventBus } from './lib/event-bus'
import { broadcastToCompany } from './ws/channels'
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

// Rate Limiting (health 제외)
app.use('/api/*', apiRateLimit)          // 일반 API: 100/min
app.use('/api/auth/login', loginRateLimit)       // 로그인: 5/min
app.use('/api/auth/admin/login', loginRateLimit) // 관리자 로그인: 5/min

app.route('/api', authRoute)

// 관리자 라우트 (각 파일 내부에서 authMiddleware + adminOnly 적용)
app.route('/api/admin', companiesRoute)
app.route('/api/admin', usersRoute)
app.route('/api/admin', departmentsRoute)
app.route('/api/admin', agentsRoute)
app.route('/api/admin', credentialsRoute)
app.route('/api/admin', toolsRoute)
app.route('/api/admin', reportLinesRoute)

// 유저 워크스페이스 라우트 (각 파일 내부에서 authMiddleware 적용, 테넌트 격리)
app.route('/api/workspace', workspaceAgentsRoute)
app.route('/api/workspace/chat', chatRoute)
app.route('/api/workspace', profileRoute)
app.route('/api/workspace', reportsRoute)
app.route('/api/workspace/jobs', jobsRoute)
app.route('/api/workspace', snsRoute)
app.route('/api/workspace', activityLogRoute)
app.route('/api/workspace', notificationsRoute)
app.route('/api/workspace', dashboardRoute)
app.route('/api/workspace', telegramRoute)
app.route('/api/workspace/messenger', messengerRoute)
app.route('/api/workspace', nexusRoute)
app.route('/api/workspace/strategy', strategyRoute)
app.route('/api/workspace/schedules', schedulesRoute)
app.route('/api/workspace/triggers', triggersRoute)
app.route('/api/workspace', filesRoute)

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

// DB 마이그레이션 자동 적용 후 워커 시작
runMigrations().then(() => {
  startJobWorker()
  startScheduleWorker()
  startTriggerWorker()
})

// Graceful Shutdown — SIGTERM 시 WS 클라이언트 알림 후 종료
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM 수신 — 클라이언트 연결 종료 중...')
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
