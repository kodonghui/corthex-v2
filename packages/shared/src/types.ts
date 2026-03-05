// === 테넌트 컨텍스트 (모든 핸들러에 자동 주입) ===
export type TenantContext = {
  companyId: string
  userId: string
  role: 'admin' | 'user'
}

// === API 응답 패턴 ===
export type ApiResponse<T> = {
  data: T
  meta?: { page: number; total: number }
}

export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// === 에이전트 상태 ===
export type AgentStatus = 'online' | 'working' | 'error' | 'offline'

// === 유저 ===
export type User = {
  id: string
  companyId: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date
}

// === 에이전트 ===
export type Agent = {
  id: string
  companyId: string
  userId: string
  name: string
  role: string
  departmentId: string | null
  soul: string
  status: AgentStatus
  createdAt: Date
}

// === 채팅 메시지 ===
export type ChatMessage = {
  id: string
  sessionId: string
  sender: 'user' | 'agent'
  content: string
  createdAt: Date
}

// === 채팅 세션 ===
export type ChatSession = {
  id: string
  userId: string
  agentId: string
  title: string
  lastMessageAt: Date
  createdAt: Date
}

// === SNS ===
export type SnsStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'failed'
export type SnsPlatform = 'instagram' | 'tistory' | 'daum_cafe'

export type SnsContent = {
  id: string
  companyId: string
  platform: SnsPlatform
  title: string
  body: string
  hashtags: string | null
  imageUrl: string | null
  status: SnsStatus
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// === 활동 로그 ===
export type ActivityLogType = 'chat' | 'delegation' | 'tool_call' | 'job' | 'sns' | 'error' | 'system' | 'login'

// === 비용 추적 ===
export type CostSummary = {
  totalCostUsd: number
  byModel: { model: string; costUsd: number; count: number }[]
  byAgent: { agentId: string; agentName: string; costUsd: number }[]
}

// === 메신저 ===
export type MessengerChannel = {
  id: string
  companyId: string
  name: string
  description: string | null
  createdBy: string
  createdAt: Date
}

// === WebSocket ===
export type WsChannel =
  | 'chat-stream'
  | 'agent-status'
  | 'notifications'
  | 'messenger'
  | 'activity-log'

export type WsInboundMessage = {
  type: 'subscribe' | 'unsubscribe'
  channel: WsChannel
  params?: Record<string, string>
}

export type WsOutboundMessage = {
  type: 'connected' | 'subscribed' | 'unsubscribed' | 'data' | 'error' | 'server-restart'
  channel?: WsChannel
  data?: unknown
  code?: string
}

// === NEXUS 캔버스 ===
export type NexusNodePosition = {
  x: number
  y: number
}

export type NexusLayoutData = {
  nodes: Record<string, NexusNodePosition>
  viewport?: { x: number; y: number; zoom: number }
}

export type NexusOrgData = {
  company: { id: string; name: string; slug: string }
  departments: {
    id: string
    name: string
    description: string | null
    agents: {
      id: string
      name: string
      role: string
      status: string
      isSecretary: boolean
    }[]
  }[]
  unassignedAgents: {
    id: string
    name: string
    role: string
    status: string
    isSecretary: boolean
  }[]
}
