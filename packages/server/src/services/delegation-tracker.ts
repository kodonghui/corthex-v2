import { eventBus } from '../lib/event-bus'

// === Event Types ===

export type DelegationEventType =
  | 'COMMAND_RECEIVED'
  | 'CLASSIFYING'
  | 'CLASSIFIED'
  | 'MANAGER_STARTED'
  | 'SPECIALIST_DISPATCHED'
  | 'SPECIALIST_COMPLETED'
  | 'SPECIALIST_FAILED'
  | 'SYNTHESIZING'
  | 'SYNTHESIS_COMPLETED'
  | 'SYNTHESIS_FAILED'
  | 'QUALITY_CHECKING'
  | 'QUALITY_PASSED'
  | 'QUALITY_FAILED'
  | 'REWORKING'
  | 'COMPLETED'
  | 'FAILED'
  | 'DEBATE_STARTED'
  | 'DEBATE_ROUND_PROGRESS'
  | 'DEBATE_COMPLETED'

export type DelegationEvent = {
  commandId: string
  event: DelegationEventType
  agentId?: string
  agentName?: string
  phase: string
  elapsed: number
  data?: Record<string, unknown>
  timestamp: string
  companyId: string
}

export type ToolEvent = {
  commandId: string
  toolName: string
  status: 'invoked' | 'completed' | 'failed'
  agentId: string
  durationMs?: number
  error?: string
  companyId: string
  timestamp: string
}

// === DelegationTracker ===

export class DelegationTracker {
  private commandTimers = new Map<string, number>()

  private elapsed(commandId: string): number {
    const start = this.commandTimers.get(commandId)
    if (!start) return 0
    return Date.now() - start
  }

  private emitCommand(companyId: string, commandId: string, event: DelegationEventType, phase: string, extra?: { agentId?: string; agentName?: string; data?: Record<string, unknown> }) {
    const payload: DelegationEvent = {
      commandId,
      event,
      phase,
      elapsed: this.elapsed(commandId),
      timestamp: new Date().toISOString(),
      companyId,
      ...extra,
    }
    eventBus.emit('command', { companyId, payload })
  }

  private emitDelegation(companyId: string, commandId: string, event: DelegationEventType, phase: string, extra?: { agentId?: string; agentName?: string; data?: Record<string, unknown> }) {
    const payload: DelegationEvent = {
      commandId,
      event,
      phase,
      elapsed: this.elapsed(commandId),
      timestamp: new Date().toISOString(),
      companyId,
      ...extra,
    }
    eventBus.emit('delegation', { companyId, payload })
  }

  // --- Command lifecycle ---

  startCommand(companyId: string, commandId: string): void {
    this.commandTimers.set(commandId, Date.now())
    this.emitCommand(companyId, commandId, 'COMMAND_RECEIVED', 'received')
  }

  classify(companyId: string, commandId: string): void {
    this.emitCommand(companyId, commandId, 'CLASSIFYING', 'classifying')
  }

  classified(companyId: string, commandId: string, data: { departmentId: string; managerId: string; confidence: number; reasoning: string }): void {
    this.emitCommand(companyId, commandId, 'CLASSIFIED', 'classified', { data: data as unknown as Record<string, unknown> })
  }

  completed(companyId: string, commandId: string): void {
    this.emitCommand(companyId, commandId, 'COMPLETED', 'completed')
    this.commandTimers.delete(commandId)
  }

  failed(companyId: string, commandId: string, error: string): void {
    this.emitCommand(companyId, commandId, 'FAILED', 'failed', { data: { error } })
    this.commandTimers.delete(commandId)
  }

  // --- Delegation chain ---

  managerStarted(companyId: string, commandId: string, agentId: string, agentName: string): void {
    this.emitDelegation(companyId, commandId, 'MANAGER_STARTED', 'manager-started', { agentId, agentName })
  }

  specialistDispatched(companyId: string, commandId: string, agentId: string, agentName: string): void {
    this.emitDelegation(companyId, commandId, 'SPECIALIST_DISPATCHED', 'specialist-dispatched', { agentId, agentName })
  }

  specialistCompleted(companyId: string, commandId: string, agentId: string, agentName: string, durationMs: number): void {
    this.emitDelegation(companyId, commandId, 'SPECIALIST_COMPLETED', 'specialist-completed', { agentId, agentName, data: { durationMs } })
  }

  specialistFailed(companyId: string, commandId: string, agentId: string, agentName: string, error: string): void {
    this.emitDelegation(companyId, commandId, 'SPECIALIST_FAILED', 'specialist-failed', { agentId, agentName, data: { error } })
  }

  synthesizing(companyId: string, commandId: string, agentId: string, agentName: string): void {
    this.emitDelegation(companyId, commandId, 'SYNTHESIZING', 'synthesizing', { agentId, agentName })
  }

  synthesisCompleted(companyId: string, commandId: string, agentId: string, agentName: string, durationMs: number): void {
    this.emitDelegation(companyId, commandId, 'SYNTHESIS_COMPLETED', 'synthesis-completed', { agentId, agentName, data: { durationMs } })
  }

  synthesisFailed(companyId: string, commandId: string, agentId: string, agentName: string, error: string): void {
    this.emitDelegation(companyId, commandId, 'SYNTHESIS_FAILED', 'synthesis-failed', { agentId, agentName, data: { error } })
  }

  // --- Quality gate ---

  qualityChecking(companyId: string, commandId: string): void {
    this.emitCommand(companyId, commandId, 'QUALITY_CHECKING', 'quality-checking')
  }

  qualityPassed(companyId: string, commandId: string, scores: Record<string, number>, totalScore: number): void {
    this.emitCommand(companyId, commandId, 'QUALITY_PASSED', 'quality-passed', { data: { scores, totalScore } })
  }

  qualityFailed(companyId: string, commandId: string, scores: Record<string, number>, totalScore: number, feedback: string): void {
    this.emitCommand(companyId, commandId, 'QUALITY_FAILED', 'quality-failed', { data: { scores, totalScore, feedback } })
  }

  reworking(companyId: string, commandId: string, attempt: number, maxAttempts: number): void {
    this.emitCommand(companyId, commandId, 'REWORKING', 'reworking', { data: { attempt, maxAttempts } })
  }

  // --- Debate tracking ---

  debateStarted(companyId: string, commandId: string, data: { debateId: string; topic: string; participants: string[] }): void {
    this.emitCommand(companyId, commandId, 'DEBATE_STARTED', 'debate-started', { data: data as unknown as Record<string, unknown> })
  }

  debateRoundProgress(companyId: string, commandId: string, data: { debateId: string; roundNum: number; totalRounds: number }): void {
    this.emitCommand(companyId, commandId, 'DEBATE_ROUND_PROGRESS', 'debate-round-progress', { data: data as unknown as Record<string, unknown> })
  }

  debateCompleted(companyId: string, commandId: string, data: { debateId: string; consensus: string; summary: string }): void {
    this.emitCommand(companyId, commandId, 'DEBATE_COMPLETED', 'debate-completed', { data: data as unknown as Record<string, unknown> })
  }

  // --- Tool tracking ---

  toolInvoked(companyId: string, commandId: string, toolName: string, agentId: string): void {
    const payload: ToolEvent = {
      commandId,
      toolName,
      status: 'invoked',
      agentId,
      companyId,
      timestamp: new Date().toISOString(),
    }
    eventBus.emit('tool', { companyId, payload })
  }

  toolCompleted(companyId: string, commandId: string, toolName: string, agentId: string, durationMs: number): void {
    const payload: ToolEvent = {
      commandId,
      toolName,
      status: 'completed',
      agentId,
      durationMs,
      companyId,
      timestamp: new Date().toISOString(),
    }
    eventBus.emit('tool', { companyId, payload })
  }

  toolFailed(companyId: string, commandId: string, toolName: string, agentId: string, error: string): void {
    const payload: ToolEvent = {
      commandId,
      toolName,
      status: 'failed',
      agentId,
      error,
      companyId,
      timestamp: new Date().toISOString(),
    }
    eventBus.emit('tool', { companyId, payload })
  }
}

// Singleton
export const delegationTracker = new DelegationTracker()
