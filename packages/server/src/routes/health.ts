import { Hono } from 'hono'

export const healthRoute = new Hono()

healthRoute.get('/health', (c) => {
  return c.json({
    data: {
      status: 'ok',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    },
  })
})
