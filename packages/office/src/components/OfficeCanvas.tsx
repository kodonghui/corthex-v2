import { useEffect, useRef, useState, useCallback } from 'react'
import { Application, Container } from 'pixi.js'
import type { AgentOfficeState } from '@corthex/shared'
import { AgentSprite } from '../sprites/AgentSprite'
import { OfficeFloor } from '../sprites/OfficeFloor'
import { AgentTooltip } from './AgentTooltip'
import { ScreenReaderAnnouncer } from './ScreenReaderAnnouncer'
import { useOfficeSocket } from '../hooks/useOfficeSocket'

type TooltipState = {
  agent: AgentOfficeState
  position: { x: number; y: number }
} | null

type OfficeCanvasProps = {
  companyId?: string
  token?: string
}

export function OfficeCanvas({ companyId, token }: OfficeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const spritesRef = useRef<Map<string, AgentSprite>>(new Map())
  const agentLayerRef = useRef<Container | null>(null)
  const floorRef = useRef<OfficeFloor | null>(null)
  const focusIndexRef = useRef<number>(-1)

  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const { agents, connected } = useOfficeSocket({
    companyId: companyId || '',
    token: token || '',
  })

  const handleAgentClick = useCallback((sprite: AgentSprite) => {
    const pos = sprite.getTooltipPosition()
    setTooltip({ agent: sprite.agentState, position: pos })
  }, [])

  // Initialize PixiJS application
  useEffect(() => {
    if (!containerRef.current) return

    const app = new Application()
    appRef.current = app

    const init = async () => {
      const container = containerRef.current!
      await app.init({
        background: '#1a1a2e',
        resizeTo: container,
        antialias: true,
      })
      container.appendChild(app.canvas)

      // Office floor
      const floor = new OfficeFloor(app.screen.width, app.screen.height)
      floorRef.current = floor
      app.stage.addChild(floor)

      // Agent layer (above floor)
      const agentLayer = new Container()
      agentLayerRef.current = agentLayer
      app.stage.addChild(agentLayer)

      // Animation ticker
      app.ticker.add((ticker) => {
        for (const sprite of spritesRef.current.values()) {
          sprite.tick(ticker.deltaTime)
        }
      })
    }

    init()

    return () => {
      spritesRef.current.clear()
      agentLayerRef.current = null
      floorRef.current = null
      appRef.current = null
      app.destroy(true)
    }
  }, [])

  // Sync agents → sprites
  useEffect(() => {
    const agentLayer = agentLayerRef.current
    if (!agentLayer) return

    const sprites = spritesRef.current
    const currentIds = new Set(agents.map((a) => a.agentId))

    // Remove sprites for agents no longer present
    for (const [id, sprite] of sprites) {
      if (!currentIds.has(id)) {
        agentLayer.removeChild(sprite)
        sprite.destroy()
        sprites.delete(id)
      }
    }

    // Add or update sprites
    for (const agent of agents) {
      const existing = sprites.get(agent.agentId)
      if (existing) {
        existing.update(agent)
      } else {
        const sprite = new AgentSprite(agent)
        sprite.on('pointertap', () => handleAgentClick(sprite))
        sprites.set(agent.agentId, sprite)
        agentLayer.addChild(sprite)
      }
    }
  }, [agents, handleAgentClick])

  // Update tooltip data when agent state changes
  useEffect(() => {
    if (!tooltip) return
    const updated = agents.find((a) => a.agentId === tooltip.agent.agentId)
    if (updated && updated !== tooltip.agent) {
      setTooltip((prev) => (prev ? { ...prev, agent: updated } : null))
    }
  }, [agents, tooltip])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (agents.length === 0) return

      const sprites = spritesRef.current
      const agentIds = agents.map((a) => a.agentId)

      if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = e.shiftKey
          ? Math.max(0, focusIndexRef.current - 1)
          : Math.min(agentIds.length - 1, focusIndexRef.current + 1)
        focusIndexRef.current = next
        const agent = agents[next]
        const sprite = sprites.get(agent.agentId)
        if (sprite) {
          const pos = sprite.getTooltipPosition()
          setTooltip({ agent, position: pos })
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = Math.max(0, focusIndexRef.current - 1)
        focusIndexRef.current = prev
        const agent = agents[prev]
        const sprite = sprites.get(agent.agentId)
        if (sprite) {
          const pos = sprite.getTooltipPosition()
          setTooltip({ agent, position: pos })
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (focusIndexRef.current >= 0 && focusIndexRef.current < agents.length) {
          const agent = agents[focusIndexRef.current]
          const sprite = sprites.get(agent.agentId)
          if (sprite) {
            const pos = sprite.getTooltipPosition()
            setTooltip({ agent, position: pos })
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setTooltip(null)
        focusIndexRef.current = -1
      }
    },
    [agents],
  )

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100vh' }}
      tabIndex={0}
      role="application"
      aria-label={`Virtual Office — ${agents.length} agents`}
      onKeyDown={handleKeyDown}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Connection status indicator */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 20,
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
          color: connected ? '#22c55e' : '#ef4444',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? '#22c55e' : '#ef4444',
            display: 'inline-block',
          }}
        />
        {connected ? 'Connected' : 'Reconnecting...'}
      </div>

      {/* Agent count */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          padding: '6px 12px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: 20,
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
          color: '#9ca3af',
        }}
      >
        Agents: {agents.length}
      </div>

      {/* Tooltip overlay */}
      {tooltip && (
        <AgentTooltip
          agent={tooltip.agent}
          position={tooltip.position}
          onClose={() => setTooltip(null)}
        />
      )}

      {/* Screen reader announcements */}
      <ScreenReaderAnnouncer agents={agents} />
    </div>
  )
}
