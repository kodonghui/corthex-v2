// === RBAC 역할 (4가지) ===
export type UserRole = 'super_admin' | 'company_admin' | 'ceo' | 'employee'

// === 테넌트 컨텍스트 (모든 핸들러에 자동 주입) ===
export type TenantContext = {
  companyId: string
  userId: string
  role: UserRole
  isAdminUser?: boolean  // admin_users 테이블에서 로그인한 경우 true
  departmentIds?: string[]  // employee의 할당 부서 ID 목록 (undefined = 전체 접근)
}

// RBAC 역할 헬퍼
export function isAdminLevel(role: UserRole): boolean {
  return role === 'super_admin' || role === 'company_admin'
}

export function isCeoOrAbove(role: UserRole): boolean {
  return role === 'super_admin' || role === 'company_admin' || role === 'ceo'
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

// === 앱 전환 ===
export type SwitchAppTarget = 'admin' | 'ceo'

export type SwitchAppRequest = {
  targetApp: SwitchAppTarget
  companyId?: string  // super_admin이 CEO 앱으로 전환 시 필수
}

export type SwitchAppResponse = {
  token: string
  user: { id: string; name: string; role: string; companyId?: string }
  targetUrl: string
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
export type AgentTier = 'manager' | 'specialist' | 'worker'

export type Agent = {
  id: string
  companyId: string
  userId: string
  name: string
  nameEn: string | null
  role: string
  tier: AgentTier
  tierLevel: number
  modelName: string
  departmentId: string | null
  reportTo: string | null
  soul: string
  status: AgentStatus
  createdAt: Date
}

// === Tier 설정 (Story 8.1) ===
export type TierConfig = {
  id: string
  companyId: string
  tierLevel: number
  name: string
  modelPreference: string
  maxTools: number
  description: string | null
  createdAt: Date
  updatedAt: Date
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
export type SnsPlatform = 'instagram' | 'tistory' | 'daum_cafe' | 'twitter' | 'facebook' | 'naver_blog'

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
  priority: number
  isCardNews: boolean
  cardSeriesId?: string | null
  cardIndex?: number | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type CardNewsCard = {
  index: number
  imageUrl: string
  caption: string
  layout: 'cover' | 'content' | 'closing'
}

export type CardSeriesMetadata = {
  cards: CardNewsCard[]
  totalCards: number
  seriesTitle: string
}

export type QueueStats = {
  scheduled: number
  published: number
  failed: number
  byPlatform: { platform: SnsPlatform; count: number }[]
  nextPublishAt: string | null
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

// === LLM Provider ===
export type LLMProviderName = 'anthropic' | 'openai' | 'google'

export type LLMRequest = {
  model: string
  messages: LLMMessage[]
  systemPrompt?: string
  tools?: LLMToolDefinition[]
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export type LLMMessage = {
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCallId?: string
  toolCalls?: LLMToolCall[]
}

export type LLMToolDefinition = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type LLMToolCall = {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export type LLMResponse = {
  content: string
  toolCalls: LLMToolCall[]
  usage: { inputTokens: number; outputTokens: number }
  model: string
  provider: LLMProviderName
  finishReason: 'stop' | 'tool_use' | 'max_tokens' | 'error'
}

export type LLMStreamChunk = {
  type: 'text' | 'tool_call_start' | 'tool_call_delta' | 'done'
  content?: string
  toolCall?: Partial<LLMToolCall>
  usage?: { inputTokens: number; outputTokens: number }
}

export type LLMError = {
  provider: LLMProviderName
  code: 'auth_error' | 'rate_limit' | 'timeout' | 'server_error' | 'invalid_request' | 'unknown'
  message: string
  retryable: boolean
}

// === Agent Execution ===
export type TaskRequest = {
  messages: LLMMessage[]
  context?: string
  maxToolIterations?: number
}

export type ToolCallRecord = {
  name: string
  arguments: Record<string, unknown>
  result?: string
  error?: string
  durationMs: number
}

export type TaskResponse = {
  content: string
  toolCalls: ToolCallRecord[]
  usage: { inputTokens: number; outputTokens: number }
  cost: { model: string; provider: LLMProviderName; estimatedCostMicro: number }
  finishReason: string
  iterations: number
}

export type ToolExecutor = (
  toolName: string,
  args: Record<string, unknown>,
) => Promise<{ result: string } | { error: string }>

// === Tool System (Epic 4) ===
export type ToolCategory = 'finance' | 'legal' | 'marketing' | 'tech' | 'common'

export type ToolContext = {
  companyId: string
  agentId: string
  agentName: string
}

export type ToolResult =
  | { success: true; result: string }
  | { success: false; error: string }

// === Batch Collector ===
export type BatchItemStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type BatchItem = {
  id: string
  companyId: string
  request: LLMRequest
  context: {
    companyId: string
    agentId?: string
    agentName?: string
    sessionId?: string
    source: 'chat' | 'delegation' | 'job' | 'sns'
  }
  status: BatchItemStatus
  result?: LLMResponse
  error?: string
  enqueuedAt: string
  completedAt?: string
}

export type BatchStatus = {
  pending: number
  processing: number
  completed: number
  failed: number
  totalItems: number
  estimatedSavingsMicro: number
}

export type BatchFlushResult = {
  batchId: string
  provider: LLMProviderName
  itemCount: number
  status: 'submitted' | 'failed'
  error?: string
}

// === 비용 추적 ===
export type CostSummary = {
  totalCostUsd: number
  byModel: { model: string; costUsd: number; count: number }[]
  byAgent: { agentId: string; agentName: string; costUsd: number }[]
}

// === 대시보드 집계 ===
export type DashboardSummary = {
  tasks: {
    total: number
    completed: number
    failed: number
    inProgress: number
  }
  cost: {
    todayUsd: number
    byProvider: { provider: LLMProviderName; costUsd: number }[]
    budgetUsagePercent: number
  }
  agents: {
    total: number
    active: number
    idle: number
    error: number
  }
  integrations: {
    providers: { name: LLMProviderName; status: 'up' | 'down' }[]
    toolSystemOk: boolean
  }
}

export type DashboardUsageDay = {
  date: string
  provider: LLMProviderName
  inputTokens: number
  outputTokens: number
  costUsd: number
}

export type DashboardUsage = {
  days: number
  usage: DashboardUsageDay[]
}

export type DashboardBudget = {
  currentMonthSpendUsd: number
  monthlyBudgetUsd: number
  usagePercent: number
  projectedMonthEndUsd: number
  isDefaultBudget: boolean
  byDepartment: { departmentId: string; name: string; costUsd: number }[]
}

// === 3축 비용 집계 (Admin) ===

export type AdminCostByAgent = {
  agentId: string
  agentName: string
  totalCostMicro: number
  inputTokens: number
  outputTokens: number
  callCount: number
}

export type AdminCostByModel = {
  model: string
  provider: string
  displayName: string
  totalCostMicro: number
  inputTokens: number
  outputTokens: number
  callCount: number
}

export type AdminCostByDepartment = {
  departmentId: string
  departmentName: string
  totalCostMicro: number
  agentCount: number
  callCount: number
}

export type AdminCostSummary = {
  totalCostMicro: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCalls: number
  byProvider: { provider: string; costMicro: number; callCount: number }[]
  trendPercent: number  // vs previous same-length period
}

export type AdminCostByTier = {
  tierLevel: number
  tierName: string | null
  totalCostMicro: number
  callCount: number
  agentCount: number
}

export type AdminCostDaily = {
  date: string
  costMicro: number
  inputTokens: number
  outputTokens: number
  callCount: number
}

// === 퀵 액션 + 만족도 ===

export type QuickAction = {
  id: string
  label: string
  icon: string
  command: string
  presetId?: string | null
  sortOrder: number
}

export type DashboardSatisfaction = {
  total: number
  positive: number
  negative: number
  neutral: number
  rate: number  // 0-100, percentage of positive among those with feedback
  period: '7d' | '30d' | 'all'
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
  | 'conversation'
  | 'activity-log'
  | 'strategy-notes'
  | 'night-job'
  | 'nexus'
  | 'command'
  | 'delegation'
  | 'tool'
  | 'cost'
  | 'debate'
  | 'strategy'
  | 'argos'

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

// === AGORA Debate Engine ===

export type DebateStatus = 'pending' | 'in-progress' | 'completed' | 'failed'
export type DebateType = 'debate' | 'deep-debate'
export type ConsensusResult = 'consensus' | 'dissent' | 'partial'

export type DebateSpeech = {
  agentId: string
  agentName: string
  content: string
  position: string
  createdAt: string
}

export type DebateRound = {
  roundNum: number
  speeches: DebateSpeech[]
}

export type DebateResult = {
  consensus: ConsensusResult
  summary: string
  majorityPosition: string
  minorityPosition: string
  keyArguments: string[]
  roundCount: number
}

export type Debate = {
  id: string
  companyId: string
  topic: string
  debateType: DebateType
  status: DebateStatus
  maxRounds: number
  participants: { agentId: string; agentName: string; role: string }[]
  rounds: DebateRound[]
  result: DebateResult | null
  createdBy: string
  error: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateDebateRequest = {
  topic: string
  debateType?: DebateType
  participantAgentIds: string[]
  maxRounds?: number
}

export type DebateResponse = Debate

export type DebateCommandResult = {
  debateId: string
  topic: string
  debateType: DebateType
  consensus: ConsensusResult | null
  report: string
  participants: { agentId: string; agentName: string; role: string }[]
}

// === Debate WebSocket Events (E11-S3) ===

export type DebateWsEventBase = {
  debateId: string
  timestamp: string
}

export type DebateRoundStartedEvent = DebateWsEventBase & {
  event: 'round-started'
  roundNum: number
  totalRounds: number
}

export type DebateSpeechDeliveredEvent = DebateWsEventBase & {
  event: 'speech-delivered'
  roundNum: number
  speech: {
    agentId: string
    agentName: string
    content: string
    position: string
  }
}

export type DebateRoundEndedEvent = DebateWsEventBase & {
  event: 'round-ended'
  roundNum: number
  speechCount: number
}

export type DebateCompletedEvent = DebateWsEventBase & {
  event: 'debate-completed'
  result: DebateResult
}

export type DebateFailedEvent = DebateWsEventBase & {
  event: 'debate-failed'
  error: string
}

export type DebateStartedEvent = DebateWsEventBase & {
  event: 'debate-started'
  topic: string
  totalRounds: number
}

export type DebateWsEvent =
  | DebateStartedEvent
  | DebateRoundStartedEvent
  | DebateSpeechDeliveredEvent
  | DebateRoundEndedEvent
  | DebateCompletedEvent
  | DebateFailedEvent

export type DebateTimelineEntry = DebateWsEvent

// === ARGOS Trigger System ===

export type ArgosTriggerType = 'price' | 'news' | 'schedule' | 'custom' | 'price-above' | 'price-below' | 'market-open' | 'market-close'
export type ArgosEventStatus = 'detected' | 'executing' | 'completed' | 'failed'

export type ArgosPriceCondition = {
  ticker: string
  market?: 'KR' | 'US'
  operator: 'above' | 'below' | 'change_pct_above' | 'change_pct_below'
  value: number
  dataSource?: 'cached' | 'realtime'
}

export type ArgosNewsCondition = {
  keywords: string[]
  matchMode?: 'any' | 'all'
  sources?: string[]
  excludeKeywords?: string[]
}

export type ArgosScheduleCondition = {
  intervalMinutes: number
  activeHours?: { start: number; end: number }
  activeDays?: number[]
}

export type ArgosCustomCondition = {
  field: string
  operator: string
  value: number | string
  dataSource?: string
}

export type ArgosTrigger = {
  id: string
  companyId: string
  userId: string
  agentId: string
  name: string | null
  instruction: string
  triggerType: ArgosTriggerType
  condition: ArgosPriceCondition | ArgosNewsCondition | ArgosScheduleCondition | ArgosCustomCondition | Record<string, unknown>
  cooldownMinutes: number
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
}

export type ArgosEvent = {
  id: string
  companyId: string
  triggerId: string
  eventType: string
  eventData: Record<string, unknown> | null
  status: ArgosEventStatus
  commandId: string | null
  result: string | null
  error: string | null
  durationMs: number | null
  processedAt: string | null
  createdAt: string
}

export type ArgosStatus = {
  dataOk: boolean
  aiOk: boolean
  activeTriggersCount: number
  todayCost: number
  lastCheckAt: string | null
  dataOkReason?: string
  aiOkReason?: string
  costBreakdown?: { cronCost: number; llmCost: number }
}

export type CreateArgosTriggerRequest = {
  name?: string
  agentId: string
  instruction: string
  triggerType: ArgosTriggerType
  condition: Record<string, unknown>
  cooldownMinutes?: number
}

// === CIO+VECTOR Orchestration Types ===

export type TradeProposal = {
  ticker: string
  tickerName: string
  side: 'buy' | 'sell'
  quantity: number
  price: number // 0 = market order
  reason: string
  confidence: number // 0~1
  market: 'KR' | 'US'
}

export type CIOPhase = 1 | 2 | 3

export type CIOOrchestrationResult = {
  analysisReport: string
  tradeProposals: TradeProposal[]
  phases: Array<{
    phase: CIOPhase
    durationMs: number
    agentCount: number
  }>
  totalDurationMs: number
}

export type VectorOrderResult = {
  proposal: TradeProposal
  status: 'executed' | 'skipped' | 'failed'
  orderId?: string
  kisOrderNo?: string
  reason?: string
}

export type VectorExecutionResult = {
  totalProposals: number
  executed: number
  skipped: number
  failed: number
  orders: VectorOrderResult[]
  totalDurationMs: number
}

// === Trading Settings & Risk Control (Epic 10 Story 5) ===

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive'
export type ExecutionMode = 'autonomous' | 'approval'
export type TradingMode = 'real' | 'paper'

export type RiskRange = { min: number; max: number; default: number }

export type RiskProfileConfig = {
  label: string
  emoji: string
  cashReserve: RiskRange
  maxPositionPct: RiskRange
  minConfidence: RiskRange
  defaultStopLoss: RiskRange
  defaultTakeProfit: RiskRange
  maxDailyTrades: RiskRange
  maxDailyLossPct: RiskRange
  orderSize: RiskRange
}

export type TradingModeChangeRequest = {
  mode: TradingMode
  password: string
  confirmationCode?: string
}

export type TradingSettings = {
  executionMode: ExecutionMode
  riskProfile: RiskProfile
  tradingMode: TradingMode
  initialCapital: number
  customSettings: {
    maxPositionPct?: number
    minConfidence?: number
    defaultStopLoss?: number
    defaultTakeProfit?: number
    maxDailyTrades?: number
    maxDailyLossPct?: number
    orderSize?: number
  }
  settingsHistory: Array<{
    changedAt: string
    changedBy: string
    action: string
    detail: string
    applied: Record<string, unknown>
    rejected: Record<string, unknown>
  }>
}

export type TradeApprovalAction = 'approve' | 'reject'

export type TradeApprovalResult = {
  orderId: string
  action: TradeApprovalAction
  success: boolean
  message?: string
  kisOrderNo?: string
}

// === Archive / Classified Docs (Epic 17 Story 3) ===

export type Classification = 'public' | 'internal' | 'confidential' | 'secret'

export type ArchiveItem = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  tags: string[]
  folderId: string | null
  folderName: string | null
  agentName: string | null
  departmentName: string | null
  qualityScore: number | null
  commandType: string | null
  createdAt: string
}

export type ArchiveDetail = ArchiveItem & {
  content: string | null
  commandId: string
  commandText: string | null
  delegationChain: {
    id: string
    agentId: string
    agentName: string | null
    type: string
    status: string
    durationMs: number | null
  }[]
  qualityReview: {
    id: string
    conclusion: string
    scores: Record<string, number>
    feedback: string | null
    attemptNumber: number
  } | null
  similarDocuments: SimilarDocument[]
}

export type SimilarDocument = {
  id: string
  title: string
  classification: Classification
  summary: string | null
  agentName: string | null
  qualityScore: number | null
  similarityScore: number
  createdAt: string | Date
}

export type ArchiveFolder = {
  id: string
  name: string
  parentId: string | null
  children: ArchiveFolder[]
  documentCount: number
}

export type ArchiveStats = {
  totalDocuments: number
  byClassification: Record<Classification, number>
  byDepartment: { departmentId: string; departmentName: string; count: number }[]
  recentWeekCount: number
}

// === 전력분석 (Performance Analysis) ===

export type PerformanceSummary = {
  totalAgents: number
  avgSuccessRate: number
  totalCostThisMonth: number
  avgResponseTimeMs: number
  changes: {
    agents: number
    successRate: number
    cost: number
    responseTime: number
  }
}

export type AgentPerformance = {
  id: string
  name: string
  departmentName: string
  role: string
  totalCalls: number
  successRate: number
  avgCostUsd: number
  avgResponseTimeMs: number
  soulGymStatus: 'optimal' | 'has-suggestions' | 'needs-attention'
}

export type AgentPerformanceDetail = AgentPerformance & {
  dailyMetrics: { date: string; successRate: number; costUsd: number }[]
  recentTasks: { commandText: string; status: string; costUsd: number; durationMs: number; createdAt: string }[]
  qualityDistribution: { score: number; count: number; label: string }[]
  soulInfo: { systemPromptSummary: string; allowedToolsCount: number; modelName: string }
}

export type SoulGymSuggestion = {
  id: string
  agentId: string
  agentName: string
  currentSuccessRate: number
  suggestionType: 'prompt-improve' | 'add-tool' | 'change-model'
  description: string
  confidence: number
  expectedImprovement: number
  estimatedTokens: number
}

// === Phase 2: Workflow Automation (Epic 18 Story 1) ===

export type WorkflowStepType = 'tool' | 'llm' | 'condition'

export type WorkflowStep = {
  id: string
  type: WorkflowStepType
  action: string
  params?: Record<string, unknown>
  dependsOn?: string[]
}

export type Workflow = {
  id: string
  companyId: string
  name: string
  description: string | null
  steps: WorkflowStep[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type CreateWorkflowRequest = {
  name: string
  description?: string
  steps: WorkflowStep[]
}

export type UpdateWorkflowRequest = Partial<CreateWorkflowRequest> & {
  isActive?: boolean
}

// === Messenger (Epic 19) ===
export type ConversationType = 'direct' | 'group'
export type MessageType = 'text' | 'system' | 'ai_report'

export type Conversation = {
  id: string
  companyId: string
  type: ConversationType
  name: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ConversationParticipant = {
  conversationId: string
  userId: string
  companyId: string
  joinedAt: string
  lastReadAt: string | null
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  companyId: string
  content: string
  type: MessageType
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export type ConversationListItem = {
  id: string
  type: ConversationType
  name: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastMessage: {
    content: string
    senderId: string
    createdAt: string
  } | null
  unreadCount: number
  participantCount: number
}

export type CreateConversationRequest = {
  type: ConversationType
  participantIds: string[]
  name?: string
}

export type SendMessageRequest = {
  content: string
  type?: MessageType
}

export type ConversationMessagesResponse = {
  items: Message[]
  nextCursor: string | null
  hasMore: boolean
}

export type ConversationUnreadItem = {
  conversationId: string
  unreadCount: number
}
