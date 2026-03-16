import { create } from 'zustand'
import { toast } from '@corthex/ui'
import type { WsChannel, WsOutboundMessage } from '@corthex/shared'

type WsEventListener = (data: unknown) => void

const channelListeners = new Map<string, Set<WsEventListener>>()

const BACKOFF_BASE = 3000
const BACKOFF_MAX = 30000

function getBackoffDelay(attempt: number): number {
  return Math.min(BACKOFF_BASE * Math.pow(2, attempt), BACKOFF_MAX)
}

type WsState = {
  socket: WebSocket | null
  isConnected: boolean
  reconnectAttempt: number
  connect: (token: string) => void
  disconnect: () => void
  subscribe: (channel: WsChannel, params?: Record<string, string>) => void
  send: (channel: string, data: unknown) => void
  addListener: (channelKey: string, fn: WsEventListener) => void
  removeListener: (channelKey: string, fn: WsEventListener) => void
}

export const useWsStore = create<WsState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempt: 0,

  connect: (token: string) => {
    const prev = get().socket
    if (prev) {
      prev.onclose = null
      prev.close()
    }

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${location.host}/ws?token=${token}`)

    ws.onopen = () => {
      const wasDisconnected = get().reconnectAttempt > 0
      set({ isConnected: true, reconnectAttempt: 0 })
      // FR49: Toast on reconnection (not first connect)
      if (wasDisconnected) {
        toast.success('서버 연결이 복구되었습니다')
      }
    }

    let serverRestarting = false

    ws.onclose = (event) => {
      const wasConnected = get().isConnected
      set({ isConnected: false, socket: null })
      const noReconnect = [1000, 4001, 4002]
      if (!noReconnect.includes(event.code) && !serverRestarting) {
        // FR49: Toast on unexpected disconnect
        if (wasConnected) {
          toast.warning('서버 연결이 끊어졌습니다. 재연결 중...')
        }
        const attempt = get().reconnectAttempt
        const delay = getBackoffDelay(attempt)
        set({ reconnectAttempt: attempt + 1 })
        setTimeout(() => get().connect(token), delay)
      }
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsOutboundMessage
        if (msg.type === 'server-restart') {
          serverRestarting = true
          // FR49: Toast for server restart
          toast.warning('서버가 재시작됩니다. 잠시 후 자동 재연결됩니다...')
          set({ reconnectAttempt: 0 })
          setTimeout(() => get().connect(token), BACKOFF_BASE)
          return
        }

        // 채널 데이터 → 리스너에 디스패치 (full channelKey 우선, base channel 폴백)
        if (msg.type === 'data' && msg.channel) {
          const fullKey = msg.channelKey
          if (fullKey) {
            const keyListeners = channelListeners.get(fullKey)
            if (keyListeners) keyListeners.forEach((fn) => fn(msg.data))
          }
          // base channel 리스너도 호출 (하위호환)
          const baseListeners = channelListeners.get(msg.channel)
          if (baseListeners) baseListeners.forEach((fn) => fn(msg.data))
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
    set({ socket: null, isConnected: false, reconnectAttempt: 0 })
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

  addListener: (channelKey: string, fn: WsEventListener) => {
    if (!channelListeners.has(channelKey)) {
      channelListeners.set(channelKey, new Set())
    }
    channelListeners.get(channelKey)!.add(fn)
  },

  removeListener: (channelKey: string, fn: WsEventListener) => {
    channelListeners.get(channelKey)?.delete(fn)
  },
}))
