import { useWsStore } from '../stores/ws-store'

export function WsStatusIndicator() {
  const { isConnected, reconnectAttempt } = useWsStore()

  return (
    <div className="flex items-center gap-1.5" title={isConnected ? '실시간 연결됨' : '재연결 중...'}>
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected
            ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]'
            : 'bg-red-500 animate-pulse'
        }`}
      />
      <span className="text-[10px] text-corthex-text-secondary">
        {isConnected ? '실시간' : `재연결 중${reconnectAttempt > 0 ? ` (${reconnectAttempt})` : '...'}`}
      </span>
    </div>
  )
}
