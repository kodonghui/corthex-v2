import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error'
import { authMiddleware } from './middleware/auth'
import { tenantMiddleware } from './middleware/tenant'
import { healthRoute } from './routes/health'
import { authRoute } from './routes/auth'

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
app.use('*', errorHandler)

// 공개 라우트 (인증 불필요)
app.route('/api', healthRoute)
app.route('/api', authRoute)  // login은 내부에서 인증 스킵

// 인증 필요 라우트는 각 라우트 파일에서 authMiddleware 적용
// (라우트별로 세밀한 제어를 위해)

// 서버 시작
const port = Number(process.env.PORT) || 3000

console.log(`🚀 CORTHEX v2 서버 시작 — http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
