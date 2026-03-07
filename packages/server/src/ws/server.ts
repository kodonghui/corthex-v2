import { createBunWebSocket } from 'hono/bun'
import { verify } from 'hono/jwt'
import type { ServerWebSocket } from 'bun'
import { handleSubscription } from './channels'
import type { WsInboundMessage, UserRole } from '@corthex/shared'

const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

type JwtPayload = { sub: string; companyId: string; role: UserRole }

export type WsClient = {
  ws: ServerWebSocket<unknown>
  userId: string
  companyId: string
  role: UserRole
  subscriptions: Set<string>
  connectedAt: Date
}

// userId → WsClient 배열 (최대 3개)
const clientMap = new Map<string, WsClient[]>()

export const { upgradeWebSocket, websocket } = createBunWebSocket()

export const wsRoute = upgradeWebSocket(async (c) => {
  const token = c.req.query('token')
  let tenant: JwtPayload | null = null

  try {
    if (token) {
      tenant = (await verify(token, JWT_SECRET, 'HS256')) as unknown as JwtPayload
    }
  } catch {
    // JWT 검증 실패 — onOpen에서 처리
  }

  return {
    onOpen(_event, ws) {
      if (!tenant) {
        ws.close(4001, 'Unauthorized')
        return
      }

      const client: WsClient = {
        ws: ws.raw as ServerWebSocket<unknown>,
        userId: tenant.sub,
        companyId: tenant.companyId,
        role: tenant.role,
        subscriptions: new Set(),
        connectedAt: new Date(),
      }

      // 최대 3개 연결 제한
      const existing = clientMap.get(tenant.sub) ?? []
      if (existing.length >= 3) {
        const oldest = existing.shift()!
        oldest.ws.close(4002, 'Connection limit exceeded')
      }
      existing.push(client)
      clientMap.set(tenant.sub, existing)

      ws.send(JSON.stringify({ type: 'connected', userId: tenant.sub, companyId: tenant.companyId }))
    },

    async onMessage(event, ws) {
      if (!tenant) return
      try {
        const msg = JSON.parse(String(event.data)) as WsInboundMessage
        const clients = clientMap.get(tenant.sub) ?? []
        const client = clients.find((c) => c.ws === (ws.raw as ServerWebSocket<unknown>))
        if (!client) return

        if (msg.type === 'subscribe') {
          await handleSubscription(client, msg.channel, msg.params, ws)
        } else if (msg.type === 'unsubscribe') {
          const key = msg.params?.id ? `${msg.channel}::${msg.params.id}` : msg.channel
          client.subscriptions.delete(key)
          ws.send(JSON.stringify({ type: 'unsubscribed', channel: msg.channel }))
        }
      } catch {
        // 잘못된 JSON 또는 DB 에러 — 무시
      }
    },

    onClose(_event, ws) {
      if (!tenant) return
      const clients = clientMap.get(tenant.sub) ?? []
      const updated = clients.filter((c) => c.ws !== (ws.raw as ServerWebSocket<unknown>))
      if (updated.length === 0) clientMap.delete(tenant.sub)
      else clientMap.set(tenant.sub, updated)
    },
  }
})

// 서버 재시작 브로드캐스트
export function broadcastServerRestart() {
  for (const clients of clientMap.values()) {
    for (const client of clients) {
      try {
        client.ws.send(JSON.stringify({ type: 'server-restart' }))
        client.ws.close(1001, 'Server restarting')
      } catch {
        // 이미 닫힌 연결 무시
      }
    }
  }
  clientMap.clear()
}

export { clientMap }
