import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error'
import { healthRoute } from './routes/health'

const app = new Hono()

// 미들웨어
app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:5173',  // app dev
    'http://localhost:5174',  // admin dev
  ],
  credentials: true,
}))
app.use('*', errorHandler)

// 라우트
app.route('/api', healthRoute)

// 서버 시작
const port = Number(process.env.PORT) || 3000

console.log(`🚀 CORTHEX v2 서버 시작 — http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
