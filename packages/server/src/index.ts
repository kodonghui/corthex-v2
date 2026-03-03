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
import { workspaceAgentsRoute } from './routes/workspace/agents'
import { chatRoute } from './routes/workspace/chat'
import { profileRoute } from './routes/workspace/profile'
import { reportsRoute } from './routes/workspace/reports'
import { jobsRoute } from './routes/workspace/jobs'
import { snsRoute } from './routes/workspace/sns'
import { activityLogRoute } from './routes/workspace/activity-log'
import { dashboardRoute } from './routes/workspace/dashboard'
import { telegramRoute } from './routes/workspace/telegram'
import { messengerRoute } from './routes/workspace/messenger'
import { nexusRoute } from './routes/workspace/nexus'
import { startJobWorker } from './lib/job-queue'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// 글로벌 미들웨어
app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:5173',  // app dev
    'http://localhost:5174',  // admin dev
  ],
  credentials: true,
}))

// 글로벌 에러 핸들러 (서브라우터 에러도 캐치)
app.onError(errorHandler)

// 공개 라우트 (인증 불필요)
app.route('/api', healthRoute)
app.route('/api', authRoute)

// 관리자 라우트 (각 파일 내부에서 authMiddleware + adminOnly 적용)
app.route('/api/admin', companiesRoute)
app.route('/api/admin', usersRoute)
app.route('/api/admin', departmentsRoute)
app.route('/api/admin', agentsRoute)
app.route('/api/admin', credentialsRoute)
app.route('/api/admin', toolsRoute)

// 유저 워크스페이스 라우트 (각 파일 내부에서 authMiddleware 적용, 테넌트 격리)
app.route('/api/workspace', workspaceAgentsRoute)
app.route('/api/workspace/chat', chatRoute)
app.route('/api/workspace', profileRoute)
app.route('/api/workspace', reportsRoute)
app.route('/api/workspace/jobs', jobsRoute)
app.route('/api/workspace', snsRoute)
app.route('/api/workspace', activityLogRoute)
app.route('/api/workspace', dashboardRoute)
app.route('/api/workspace', telegramRoute)
app.route('/api/workspace/messenger', messengerRoute)
app.route('/api/workspace', nexusRoute)

// 서버 시작
const port = Number(process.env.PORT) || 3000

console.log(`🚀 CORTHEX v2 서버 시작 — http://localhost:${port}`)

// 야간 작업 워커 시작 (백그라운드 폴링)
startJobWorker()

export default {
  port,
  fetch: app.fetch,
}
