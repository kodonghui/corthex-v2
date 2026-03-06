// === 테넌트 컨텍스트 (모든 핸들러에 자동 주입) ===
export type TenantContext = {
  companyId: string
  userId: string
  role: 'admin' | 'user'
  isAdminUser?: boolean  // admin_users 테이블에서 로그인한 경우 true
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
export type SnsStatus = 'draft' | 'pending' | 'approved' | 'scheduled' | 'rejected' | 'published' | 'failed'
export type SnsPlatform = 'instagram' | 'tistory' | 'daum_cafe'

export type SnsAccount = {
  id: string
  companyId: string
  platform: SnsPlatform
  accountName: string
  accountId: string
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type SnsContent = {
  id: string
  companyId: string
  platform: SnsPlatform
  title: string
  body: string
  hashtags: string | null
  imageUrl: string | null
  status: SnsStatus
  snsAccountId?: string | null
  variantOf?: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type SnsMetrics = {
  views: number
  likes: number
  shares: number
  clicks: number
  updatedAt?: string
}

export type SnsAbResult = {
  original: SnsContent
  variants: SnsContent[]
  winner: { id: string; score: number } | null
  scores: { id: string; title: string; metrics: SnsMetrics | null; score: number }[]
}

// === 소울 템플릿 ===
export type SoulTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  content: string
  category: string | null
  isBuiltin: boolean
  isActive: boolean
  createdBy: string | null
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
  | 'strategy-notes'
  | 'night-job'
  | 'nexus'

export type WsInboundMessage = {
  type: 'subscribe' | 'unsubscribe'
  channel: WsChannel
  params?: Record<string, string>
}

export type WsOutboundMessage = {
  type: 'connected' | 'subscribed' | 'unsubscribed' | 'data' | 'error' | 'server-restart'
  channel?: WsChannel
  channelKey?: string
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

export type NexusGraphNode = {
  id: string
  type: 'company' | 'department' | 'agent'
  label: string
  x: number
  y: number
  color?: string
  agentId?: string
  role?: string
  status?: string
  isSecretary?: boolean
  description?: string | null
  agentCount?: number
  slug?: string
  soul?: string | null
}

export type NexusGraphEdge = {
  id: string
  source: string
  target: string
  type: 'smoothstep' | 'bezier'
  animated?: boolean
  style?: Record<string, string | number>
}

export type NexusGraphData = {
  nodes: NexusGraphNode[]
  edges: NexusGraphEdge[]
  updatedAt: string | null
}

// === NEXUS 워크플로우 ===
export type NexusWorkflow = {
  id: string
  companyId: string
  name: string
  description: string | null
  nodes: unknown[]
  edges: unknown[]
  isTemplate: boolean
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type NexusExecution = {
  id: string
  companyId: string
  workflowId: string
  status: string
  result: unknown | null
  startedAt: string
  completedAt: string | null
}
