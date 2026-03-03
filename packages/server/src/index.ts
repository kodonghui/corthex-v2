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

const app = new Hono()

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

// 서버 시작
const port = Number(process.env.PORT) || 3000

console.log(`🚀 CORTHEX v2 서버 시작 — http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
