import { create } from 'zustand'

type WsState = {
  socket: WebSocket | null
  isConnected: boolean
  connect: (token: string) => void
  disconnect: () => void
  send: (channel: string, data: unknown) => void
}

export const useWsStore = create<WsState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token: string) => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${location.host}/ws?token=${token}`)
    ws.onopen = () => set({ isConnected: true })
    ws.onclose = () => set({ isConnected: false, socket: null })
    set({ socket: ws })
  },

  disconnect: () => {
    get().socket?.close()
    set({ socket: null, isConnected: false })
  },

  send: (channel: string, data: unknown) => {
    const { socket, isConnected } = get()
    if (socket && isConnected) {
      socket.send(JSON.stringify({ channel, data }))
    }
  },
}))
