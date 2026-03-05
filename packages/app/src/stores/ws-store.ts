import { create } from 'zustand'
import type { WsChannel, WsOutboundMessage } from '@corthex/shared'

type WsState = {
  socket: WebSocket | null
  isConnected: boolean
  connect: (token: string) => void
  disconnect: () => void
  subscribe: (channel: WsChannel, params?: Record<string, string>) => void
  send: (channel: string, data: unknown) => void
}

export const useWsStore = create<WsState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token: string) => {
    // 기존 연결 정리
    const prev = get().socket
    if (prev) {
      prev.onclose = null
      prev.close()
    }

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${location.host}/ws?token=${token}`)

    ws.onopen = () => set({ isConnected: true })

    let serverRestarting = false

    ws.onclose = (event) => {
      set({ isConnected: false, socket: null })
      // 재연결하면 안 되는 코드: 정상 종료, 인증 실패, 연결 제한
      const noReconnect = [1000, 4001, 4002]
      if (!noReconnect.includes(event.code) && !serverRestarting) {
        setTimeout(() => get().connect(token), 3000)
      }
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsOutboundMessage
        if (msg.type === 'server-restart') {
          // onclose에서 중복 재연결 방지
          serverRestarting = true
          setTimeout(() => get().connect(token), 3000)
        }
      } catch {
        // 잘못된 JSON 무시
      }
    }

    set({ socket: ws })
  },

  disconnect: () => {
    const ws = get().socket
    if (ws) {
      ws.onclose = null
      ws.close()
    }
    set({ socket: null, isConnected: false })
  },

  subscribe: (channel: WsChannel, params?: Record<string, string>) => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type: 'subscribe', channel, params }))
    }
  },

  send: (channel: string, data: unknown) => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({ channel, data }))
    }
  },
}))
