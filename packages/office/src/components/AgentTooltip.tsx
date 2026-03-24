import { useEffect, useRef } from 'react'
import type { AgentOfficeState } from '@corthex/shared'

type AgentTooltipProps = {
  agent: AgentOfficeState
  position: { x: number; y: number }
  onClose: () => void
}

export function AgentTooltip({ agent, position, onClose }: AgentTooltipProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const statusColor: Record<string, string> = {
    idle: '#6b7280',
    working: '#22c55e',
    reflecting: '#3b82f6',
    error: '#ef4444',
    offline: '#374151',
  }

  const lastActive = agent.lastActiveAt
    ? new Date(agent.lastActiveAt).toLocaleTimeString()
    : 'N/A'

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        background: '#1e1e36',
        border: '1px solid #4a4a6a',
        borderRadius: 8,
        padding: '12px 16px',
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        minWidth: 200,
        pointerEvents: 'auto',
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>
        {agent.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColor[agent.status] || '#6b7280',
          }}
        />
        <span style={{ textTransform: 'capitalize' }}>{agent.status}</span>
      </div>
      {agent.currentTask && (
        <div style={{ color: '#9ca3af', marginBottom: 4 }}>
          Task: {agent.currentTask}
        </div>
      )}
      <div style={{ color: '#9ca3af', marginBottom: 2 }}>Tier: {agent.tier}</div>
      {agent.department && (
        <div style={{ color: '#9ca3af', marginBottom: 2 }}>
          Dept: {agent.department}
        </div>
      )}
      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>
        Last active: {lastActive}
      </div>
    </div>
  )
}
