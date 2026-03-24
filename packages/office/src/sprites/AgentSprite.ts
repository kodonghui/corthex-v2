import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { AgentOfficeState, AgentOfficeStatus } from '@corthex/shared'

export const STATUS_COLORS: Record<AgentOfficeStatus, number> = {
  idle: 0x6b7280,
  working: 0x22c55e,
  reflecting: 0x3b82f6,
  error: 0xef4444,
  offline: 0x374151,
}

const AVATAR_RADIUS = 22
const LERP_SPEED = 0.08

const nameStyle = new TextStyle({
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  fill: 0xffffff,
  align: 'center',
})

const initialStyle = new TextStyle({
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  fontWeight: 'bold',
  fill: 0xffffff,
  align: 'center',
})

const statusStyle = new TextStyle({
  fontFamily: 'Inter, sans-serif',
  fontSize: 9,
  fill: 0x9ca3af,
  align: 'center',
})

export class AgentSprite extends Container {
  private circle: Graphics
  private glowCircle: Graphics
  private nameLabel: Text
  private initialLabel: Text
  private statusLabel: Text
  private targetX: number
  private targetY: number
  private pulsePhase: number = 0
  private currentStatus: AgentOfficeStatus

  public agentId: string
  public agentState: AgentOfficeState

  constructor(state: AgentOfficeState) {
    super()

    this.agentId = state.agentId
    this.agentState = state
    this.currentStatus = state.status
    this.targetX = state.position.x
    this.targetY = state.position.y
    this.x = state.position.x
    this.y = state.position.y

    // Glow circle (behind main circle, for pulse effect)
    this.glowCircle = new Graphics()
    this.drawGlow(0)
    this.addChild(this.glowCircle)

    // Main avatar circle
    this.circle = new Graphics()
    this.drawCircle(STATUS_COLORS[state.status])
    this.addChild(this.circle)

    // Initial letter centered in circle
    const initial = state.name.charAt(0).toUpperCase()
    this.initialLabel = new Text({ text: initial, style: initialStyle })
    this.initialLabel.anchor.set(0.5)
    this.initialLabel.y = -1
    this.addChild(this.initialLabel)

    // Name label below circle
    this.nameLabel = new Text({ text: state.name, style: nameStyle })
    this.nameLabel.anchor.set(0.5, 0)
    this.nameLabel.y = AVATAR_RADIUS + 4
    this.addChild(this.nameLabel)

    // Status text below name
    this.statusLabel = new Text({ text: state.status, style: statusStyle })
    this.statusLabel.anchor.set(0.5, 0)
    this.statusLabel.y = AVATAR_RADIUS + 18
    this.addChild(this.statusLabel)

    this.eventMode = 'static'
    this.cursor = 'pointer'
  }

  private drawCircle(color: number): void {
    this.circle.clear()
    this.circle.circle(0, 0, AVATAR_RADIUS)
    this.circle.fill({ color, alpha: 0.9 })
    this.circle.stroke({ color: 0xffffff, width: 2, alpha: 0.3 })
  }

  private drawGlow(alpha: number): void {
    this.glowCircle.clear()
    if (alpha > 0) {
      this.glowCircle.circle(0, 0, AVATAR_RADIUS + 6)
      this.glowCircle.fill({ color: STATUS_COLORS.working, alpha: alpha * 0.4 })
    }
  }

  update(state: AgentOfficeState): void {
    this.agentState = state
    this.agentId = state.agentId

    // Update target position for smooth lerp
    this.targetX = state.position.x
    this.targetY = state.position.y

    // Update visuals if status changed
    if (state.status !== this.currentStatus) {
      this.currentStatus = state.status
      this.drawCircle(STATUS_COLORS[state.status])
      this.statusLabel.text = state.status
    }

    // Update name if changed
    if (this.nameLabel.text !== state.name) {
      this.nameLabel.text = state.name
      this.initialLabel.text = state.name.charAt(0).toUpperCase()
    }

    // Dim if offline
    this.alpha = state.status === 'offline' ? 0.5 : 1
  }

  tick(delta: number): void {
    // Lerp position toward target
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this.x += dx * LERP_SPEED * delta
      this.y += dy * LERP_SPEED * delta
    } else {
      this.x = this.targetX
      this.y = this.targetY
    }

    // Pulse animation for working status
    if (this.currentStatus === 'working') {
      this.pulsePhase += 0.05 * delta
      const pulseAlpha = (Math.sin(this.pulsePhase) + 1) / 2
      this.drawGlow(pulseAlpha)
    } else if (this.pulsePhase !== 0) {
      this.pulsePhase = 0
      this.drawGlow(0)
    }
  }

  /** Get bounding position for tooltip placement */
  getTooltipPosition(): { x: number; y: number } {
    const globalPos = this.getGlobalPosition()
    return { x: globalPos.x, y: globalPos.y - AVATAR_RADIUS - 10 }
  }
}
