import { useEffect, useRef } from 'react'
import type { AgentOfficeState } from '@corthex/shared'

type ScreenReaderAnnouncerProps = {
  agents: AgentOfficeState[]
}

/** Build human-readable announcement for a status change */
export function buildAnnouncement(name: string, status: string, task?: string): string {
  switch (status) {
    case 'working':
      return task ? `Agent ${name} is now working on ${task}` : `Agent ${name} is now working`
    case 'idle':
      return `Agent ${name} is now idle`
    case 'reflecting':
      return `Agent ${name} is reflecting`
    case 'error':
      return `Agent ${name} encountered an error`
    case 'offline':
      return `Agent ${name} went offline`
    default:
      return `Agent ${name} status changed to ${status}`
  }
}

/**
 * Invisible live region that announces agent status changes to screen readers.
 * Uses aria-live="polite" so announcements queue without interrupting.
 */
export function ScreenReaderAnnouncer({ agents }: ScreenReaderAnnouncerProps) {
  const prevAgentsRef = useRef<Map<string, string>>(new Map())
  const announcementRef = useRef<string>('')

  useEffect(() => {
    const prev = prevAgentsRef.current
    const announcements: string[] = []

    for (const agent of agents) {
      const prevStatus = prev.get(agent.agentId)
      if (prevStatus !== undefined && prevStatus !== agent.status) {
        announcements.push(buildAnnouncement(agent.name, agent.status, agent.currentTask))
      }
    }

    // Update prev map
    const next = new Map<string, string>()
    for (const agent of agents) {
      next.set(agent.agentId, agent.status)
    }
    prevAgentsRef.current = next

    if (announcements.length > 0) {
      announcementRef.current = announcements.join('. ')
    }
  }, [agents])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {announcementRef.current}
    </div>
  )
}
