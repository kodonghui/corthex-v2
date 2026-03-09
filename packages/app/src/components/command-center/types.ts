// Command Center Types

export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'F'

export type CommandStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'

export type DelegationStep = {
  agentId: string
  agentName: string
  status: 'pending' | 'working' | 'done' | 'error'
  startedAt?: string
  completedAt?: string
}

export type Deliverable = {
  id: string
  type: 'report' | 'file' | 'link' | 'code' | 'data'
  title: string
  summary?: string
  url?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  qualityGrade?: QualityGrade
  cost?: number
  durationMs?: number
  deliverables?: Deliverable[]
  delegationSteps?: DelegationStep[]
  createdAt: string
}

export type Command = {
  id: string
  title: string
  status: CommandStatus
  assignedAgentId?: string
  assignedAgentName?: string
  totalCost?: number
  qualityGrade?: QualityGrade
  messages: Message[]
  createdAt: string
  completedAt?: string
}

export type CommandPreset = {
  id: string
  name: string
  prompt: string
  targetAgentId?: string
  tags?: string[]
  createdAt: string
}

export type Agent = {
  id: string
  name: string
  role: string
  department?: string
  status: 'online' | 'working' | 'error' | 'offline'
  isSecretary: boolean
}

export type Department = {
  id: string
  name: string
  agentIds: string[]
}
