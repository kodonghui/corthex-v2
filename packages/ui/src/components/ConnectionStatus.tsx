/**
 * ConnectionStatus — Shows WebSocket/SSE connection state.
 * Minimal dot in corner, expands with label on hover.
 */
import { cn } from '../utils'

export type ConnectionStateType = 'connected' | 'connecting' | 'reconnecting' | 'disconnected'

export interface ConnectionStatusProps {
  state: ConnectionStateType
  className?: string
  /** Position in viewport */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Label text override */
  label?: string
}

const stateConfig: Record<ConnectionStateType, { color: string; label: string; pulse: boolean }> = {
  connected: { color: 'bg-emerald-400', label: 'Connected', pulse: false },
  connecting: { color: 'bg-amber-400', label: 'Connecting...', pulse: true },
  reconnecting: { color: 'bg-amber-400', label: 'Reconnecting...', pulse: true },
  disconnected: { color: 'bg-red-400', label: 'Disconnected', pulse: false },
}

const positionClasses: Record<string, string> = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
}

export function ConnectionStatus({
  state,
  className,
  position = 'bottom-right',
  label,
}: ConnectionStatusProps) {
  const config = stateConfig[state]

  return (
    <div
      className={cn(
        'fixed z-40 group flex items-center gap-2 rounded-full px-2 py-1.5',
        'bg-white/80 backdrop-blur-sm border border-[#e5e1d3] shadow-sm',
        'transition-all duration-200 hover:pr-3',
        positionClasses[position],
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label || config.label}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          config.color,
          config.pulse && 'motion-safe:animate-pulse',
        )}
      />
      <span className="text-xs text-[#6b705c] font-medium max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:max-w-[120px]">
        {label || config.label}
      </span>
    </div>
  )
}
