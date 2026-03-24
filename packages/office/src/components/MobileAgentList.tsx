import type { AgentOfficeState, AgentOfficeStatus } from '@corthex/shared'

type MobileAgentListProps = {
  agents: AgentOfficeState[]
  connected: boolean
  onRefresh: () => void
}

const STATUS_COLORS: Record<AgentOfficeStatus, string> = {
  idle: '#6b7280',
  working: '#22c55e',
  reflecting: '#3b82f6',
  error: '#ef4444',
  offline: '#374151',
}

const STATUS_ORDER: Record<AgentOfficeStatus, number> = {
  working: 0,
  reflecting: 1,
  idle: 2,
  error: 3,
  offline: 4,
}

/** Sort agents: working first, then idle, then offline */
export function sortAgentsByStatus(agents: AgentOfficeState[]): AgentOfficeState[] {
  return [...agents].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] ?? 99
    const orderB = STATUS_ORDER[b.status] ?? 99
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })
}

export function MobileAgentList({ agents, connected, onRefresh }: MobileAgentListProps) {
  const sorted = sortAgentsByStatus(agents)

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#1a1a2e',
        fontFamily: 'Inter, sans-serif',
        color: '#fff',
        padding: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '8px 0',
        }}
      >
        <div style={{ fontSize: 14, color: '#9ca3af' }}>
          Agents: {agents.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: connected ? '#22c55e' : '#ef4444',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 12, color: connected ? '#22c55e' : '#ef4444' }}>
            {connected ? 'Connected' : 'Reconnecting...'}
          </span>
          <button
            onClick={onRefresh}
            aria-label="Refresh agent list"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid #4a4a6a',
              borderRadius: 6,
              padding: '4px 12px',
              color: '#9ca3af',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Agent cards */}
      <ul
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
        role="list"
        aria-label={`Agent list — ${agents.length} agents`}
      >
        {sorted.map((agent) => (
          <li key={agent.agentId} role="listitem">
            <div
              aria-label={`${agent.name}, ${agent.status}${agent.currentTask ? `, task: ${agent.currentTask}` : ''}`}
              style={{
                background: '#1e1e36',
                border: '1px solid #2a2a45',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: agent.status === 'offline' ? 0.5 : 1,
              }}
            >
              {/* Status dot */}
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: STATUS_COLORS[agent.status],
                  flexShrink: 0,
                }}
              />

              {/* Agent info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</span>
                  <span
                    style={{
                      fontSize: 10,
                      background: 'rgba(255,255,255,0.1)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: '#9ca3af',
                    }}
                  >
                    {agent.tier}
                  </span>
                </div>
                {agent.department && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
                    {agent.department}
                  </div>
                )}
                {agent.currentTask && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#22c55e',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {agent.currentTask}
                  </div>
                )}
              </div>

              {/* Status label */}
              <span
                style={{
                  fontSize: 11,
                  color: STATUS_COLORS[agent.status],
                  textTransform: 'capitalize',
                  flexShrink: 0,
                }}
              >
                {agent.status}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {agents.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 14 }}>
          No agents found
        </div>
      )}
    </div>
  )
}
