import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb, integer, pgEnum, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// === Enums ===
export const userRoleEnum = pgEnum('user_role', ['admin', 'user'])
export const adminRoleEnum = pgEnum('admin_role', ['superadmin', 'admin'])
export const agentStatusEnum = pgEnum('agent_status', ['online', 'working', 'error', 'offline'])
export const messageSenderEnum = pgEnum('message_sender', ['user', 'agent'])
export const toolScopeEnum = pgEnum('tool_scope', ['platform', 'company', 'department'])
export const delegationStatusEnum = pgEnum('delegation_status', ['pending', 'processing', 'completed', 'failed'])
export const reportStatusEnum = pgEnum('report_status', ['draft', 'submitted', 'reviewed'])
export const jobStatusEnum = pgEnum('job_status', ['queued', 'processing', 'completed', 'failed'])
export const snsStatusEnum = pgEnum('sns_status', ['draft', 'pending', 'approved', 'rejected', 'published', 'failed'])
export const snsPlatformEnum = pgEnum('sns_platform', ['instagram', 'tistory', 'daum_cafe'])
export const activityLogTypeEnum = pgEnum('activity_log_type', ['chat', 'delegation', 'tool_call', 'job', 'sns', 'error', 'system', 'login'])
export const activityPhaseEnum = pgEnum('activity_phase', ['start', 'end', 'error'])
export const apiKeyScopeEnum = pgEnum('api_key_scope', ['company', 'user'])

// === 1. companies — 회사 (테넌트 최상위 단위) ===
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 2. users — 인간 유저 (CEO, H) ===
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: userRoleEnum('role').notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('users_company_idx').on(table.companyId),
}))

// === 2a. admin_users — 관리자 계정 (별도 인증) ===
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: adminRoleEnum('role').notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 2b. sessions — 유저 JWT 세션 ===
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('sessions_company_idx').on(table.companyId),
}))

// === 2c. admin_sessions — 관리자 JWT 세션 ===
export const adminSessions = pgTable('admin_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').notNull().references(() => adminUsers.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 3. departments — 부서 ===
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('departments_company_idx').on(table.companyId),
}))

// === 4. agents — AI 에이전트 ===
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  departmentId: uuid('department_id').references(() => departments.id),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 200 }),
  soul: text('soul'),  // 마크다운 성격 정의
  status: agentStatusEnum('status').notNull().default('offline'),
  isSecretary: boolean('is_secretary').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('agents_company_idx').on(table.companyId),
}))

// === 4a. notification_preferences — 유저별 알림 설정 ===
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  inApp: boolean('in_app').notNull().default(true),
  email: boolean('email').notNull().default(false),
  push: boolean('push').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('notification_prefs_company_idx').on(table.companyId),
}))

// === 5. cli_credentials — CLI 토큰 (AES-256 암호화) ===
export const cliCredentials = pgTable('cli_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  label: varchar('label', { length: 100 }).notNull(),
  encryptedToken: text('encrypted_token').notNull(),  // AES-256
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 6. api_keys — API 키/자격증명 (JSONB 암호화) ===
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').references(() => users.id),  // null = 회사 공용
  provider: varchar('provider', { length: 50 }).notNull(),  // kis, notion, email, telegram
  label: varchar('label', { length: 100 }),
  credentials: jsonb('credentials').notNull(),  // JSONB — 각 필드 AES-256-GCM 개별 암호화
  scope: apiKeyScopeEnum('scope').notNull(),  // 'company' | 'user'
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('api_keys_company_idx').on(table.companyId),
}))

// === 7. chat_sessions — 채팅 세션 ===
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  title: varchar('title', { length: 200 }).notNull().default('새 대화'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('chat_sessions_company_idx').on(table.companyId),
}))

// === 8. chat_messages — 채팅 메시지 히스토리 ===
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  sender: messageSenderEnum('sender').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  sessionCreatedIdx: index('chat_messages_session_created_idx').on(table.sessionId, table.createdAt),
  companyIdx: index('chat_messages_company_idx').on(table.companyId),
}))

// === 9. agent_memory — 에이전트 장기 기억 ===
export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  key: varchar('key', { length: 200 }).notNull(),
  value: text('value').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 10. tool_definitions — 도구 정의 ===
export const toolDefinitions = pgTable('tool_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id),  // null = 플랫폼 공통
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  scope: toolScopeEnum('scope').notNull().default('platform'),
  inputSchema: jsonb('input_schema'),  // Claude tool_use JSON Schema
  handler: varchar('handler', { length: 100 }),  // 서버 핸들러 함수명
  config: jsonb('config'),  // 도구별 설정
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('tool_definitions_company_idx').on(table.companyId),
}))

// === 11. agent_tools — 에이전트-도구 매핑 ===
export const agentTools = pgTable('agent_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  toolId: uuid('tool_id').notNull().references(() => toolDefinitions.id),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('agent_tools_company_idx').on(table.companyId),
}))

// === 12. report_lines — 보고 라인 (H → 상위자) ===
export const reportLines = pgTable('report_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),  // 보고하는 사람
  supervisorId: uuid('supervisor_id').notNull().references(() => users.id),  // 보고받는 사람
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('report_lines_company_idx').on(table.companyId),
}))

// === 13. delegations — 비서 위임 (secretary → department agent) ===
export const delegations = pgTable('delegations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  secretaryAgentId: uuid('secretary_agent_id').notNull().references(() => agents.id),
  targetAgentId: uuid('target_agent_id').notNull().references(() => agents.id),
  userMessage: text('user_message').notNull(),
  delegationPrompt: text('delegation_prompt').notNull(),
  agentResponse: text('agent_response'),
  status: delegationStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})

// === 14. reports — 보고서 ===
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull().default(''),
  status: reportStatusEnum('status').notNull().default('draft'),
  submittedTo: uuid('submitted_to').references(() => users.id),
  submittedAt: timestamp('submitted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 15. report_comments — 보고서 코멘트 (CEO ↔ H 피드백) ===
export const reportComments = pgTable('report_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  reportId: uuid('report_id').notNull().references(() => reports.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 16. department_knowledge — 본부별 지식 베이스 ===
export const departmentKnowledge = pgTable('department_knowledge', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  departmentId: uuid('department_id').notNull().references(() => departments.id),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 17. tool_calls — 도구 호출 기록 ===
export const toolCalls = pgTable('tool_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  toolId: uuid('tool_id').notNull().references(() => toolDefinitions.id),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  input: jsonb('input'),
  output: text('output'),
  status: varchar('status', { length: 20 }).notNull().default('success'),  // success, error
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 18. night_jobs — 야간 작업 큐 ===
export const nightJobs = pgTable('night_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  sessionId: uuid('session_id').references(() => chatSessions.id),
  instruction: text('instruction').notNull(),
  status: jobStatusEnum('status').notNull().default('queued'),
  result: text('result'),
  error: text('error'),
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  scheduledFor: timestamp('scheduled_for').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 19. sns_contents — SNS 콘텐츠 ===
export const snsContents = pgTable('sns_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').references(() => agents.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  platform: snsPlatformEnum('platform').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  hashtags: text('hashtags'),
  imageUrl: text('image_url'),
  status: snsStatusEnum('status').notNull().default('draft'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  rejectReason: text('reject_reason'),
  publishedUrl: text('published_url'),
  publishedAt: timestamp('published_at'),
  publishError: text('publish_error'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 20. activity_logs — 작전일지 (활동 로그) ===
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().unique(),  // idempotent INSERT용
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').references(() => users.id),
  agentId: uuid('agent_id').references(() => agents.id),
  type: activityLogTypeEnum('type').notNull(),
  phase: activityPhaseEnum('phase').notNull(),  // 'start' | 'end' | 'error'
  actorType: varchar('actor_type', { length: 20 }).notNull(),  // 'user' | 'agent' | 'system'
  actorId: uuid('actor_id'),
  actorName: varchar('actor_name', { length: 100 }),
  action: varchar('action', { length: 200 }).notNull(),
  detail: text('detail'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyCreatedIdx: index('activity_company_created_idx').on(table.companyId, table.createdAt),
  typeIdx: index('activity_type_idx').on(table.type),
  metadataGinIdx: index('activity_metadata_gin_idx').using('gin', table.metadata),
}))

// === 21. cost_records — AI 비용 기록 ===
export const costRecords = pgTable('cost_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').references(() => agents.id),
  sessionId: uuid('session_id').references(() => chatSessions.id),
  provider: varchar('provider', { length: 50 }).notNull().default('anthropic'),
  model: varchar('model', { length: 100 }).notNull(),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  costUsdMicro: integer('cost_usd_micro').notNull().default(0),  // 1 = $0.000001
  source: varchar('source', { length: 50 }),  // chat, delegation, job, sns
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 22. telegram_configs — 텔레그램 설정 ===
export const telegramConfigs = pgTable('telegram_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id).unique(),
  botToken: text('bot_token').notNull(),  // encrypted
  ceoChatId: varchar('ceo_chat_id', { length: 50 }),
  isActive: boolean('is_active').notNull().default(false),
  lastPollAt: timestamp('last_poll_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 23. messenger_channels — 사내 메신저 채널 ===
export const messengerChannels = pgTable('messenger_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 24. messenger_members — 메신저 채널 멤버 ===
export const messengerMembers = pgTable('messenger_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  channelId: uuid('channel_id').notNull().references(() => messengerChannels.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
})

// === 25. messenger_messages — 사내 메신저 메시지 ===
export const messengerMessages = pgTable('messenger_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  channelId: uuid('channel_id').notNull().references(() => messengerChannels.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 26. canvas_layouts — NEXUS 캔버스 레이아웃 ===
export const canvasLayouts = pgTable('canvas_layouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull().default('default'),
  layoutData: jsonb('layout_data').notNull().default('{}'),
  isDefault: boolean('is_default').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === Relations ===
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  departments: many(departments),
  agents: many(agents),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, { fields: [users.companyId], references: [companies.id] }),
  agents: many(agents),
  cliCredentials: many(cliCredentials),
  apiKeys: many(apiKeys),
  chatSessions: many(chatSessions),
}))

export const agentsRelations = relations(agents, ({ one, many }) => ({
  company: one(companies, { fields: [agents.companyId], references: [companies.id] }),
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  department: one(departments, { fields: [agents.departmentId], references: [departments.id] }),
  chatSessions: many(chatSessions),
  memory: many(agentMemory),
  tools: many(agentTools),
}))

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  company: one(companies, { fields: [departments.companyId], references: [companies.id] }),
  agents: many(agents),
  knowledge: many(departmentKnowledge),
}))

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  company: one(companies, { fields: [chatSessions.companyId], references: [companies.id] }),
  user: one(users, { fields: [chatSessions.userId], references: [users.id] }),
  agent: one(agents, { fields: [chatSessions.agentId], references: [agents.id] }),
  messages: many(chatMessages),
}))

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  company: one(companies, { fields: [chatMessages.companyId], references: [companies.id] }),
  session: one(chatSessions, { fields: [chatMessages.sessionId], references: [chatSessions.id] }),
}))

export const delegationsRelations = relations(delegations, ({ one }) => ({
  company: one(companies, { fields: [delegations.companyId], references: [companies.id] }),
  session: one(chatSessions, { fields: [delegations.sessionId], references: [chatSessions.id] }),
  secretaryAgent: one(agents, { fields: [delegations.secretaryAgentId], references: [agents.id] }),
  targetAgent: one(agents, { fields: [delegations.targetAgentId], references: [agents.id] }),
}))

export const reportsRelations = relations(reports, ({ one, many }) => ({
  company: one(companies, { fields: [reports.companyId], references: [companies.id] }),
  author: one(users, { fields: [reports.authorId], references: [users.id] }),
  comments: many(reportComments),
}))

export const reportCommentsRelations = relations(reportComments, ({ one }) => ({
  company: one(companies, { fields: [reportComments.companyId], references: [companies.id] }),
  report: one(reports, { fields: [reportComments.reportId], references: [reports.id] }),
  author: one(users, { fields: [reportComments.authorId], references: [users.id] }),
}))

export const departmentKnowledgeRelations = relations(departmentKnowledge, ({ one }) => ({
  company: one(companies, { fields: [departmentKnowledge.companyId], references: [companies.id] }),
  department: one(departments, { fields: [departmentKnowledge.departmentId], references: [departments.id] }),
}))

export const toolCallsRelations = relations(toolCalls, ({ one }) => ({
  company: one(companies, { fields: [toolCalls.companyId], references: [companies.id] }),
  session: one(chatSessions, { fields: [toolCalls.sessionId], references: [chatSessions.id] }),
  agent: one(agents, { fields: [toolCalls.agentId], references: [agents.id] }),
  tool: one(toolDefinitions, { fields: [toolCalls.toolId], references: [toolDefinitions.id] }),
}))

export const nightJobsRelations = relations(nightJobs, ({ one }) => ({
  company: one(companies, { fields: [nightJobs.companyId], references: [companies.id] }),
  user: one(users, { fields: [nightJobs.userId], references: [users.id] }),
  agent: one(agents, { fields: [nightJobs.agentId], references: [agents.id] }),
  session: one(chatSessions, { fields: [nightJobs.sessionId], references: [chatSessions.id] }),
}))

export const snsContentsRelations = relations(snsContents, ({ one }) => ({
  company: one(companies, { fields: [snsContents.companyId], references: [companies.id] }),
  agent: one(agents, { fields: [snsContents.agentId], references: [agents.id] }),
  creator: one(users, { fields: [snsContents.createdBy], references: [users.id] }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  company: one(companies, { fields: [activityLogs.companyId], references: [companies.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
  agent: one(agents, { fields: [activityLogs.agentId], references: [agents.id] }),
}))

export const costRecordsRelations = relations(costRecords, ({ one }) => ({
  company: one(companies, { fields: [costRecords.companyId], references: [companies.id] }),
  agent: one(agents, { fields: [costRecords.agentId], references: [agents.id] }),
  session: one(chatSessions, { fields: [costRecords.sessionId], references: [chatSessions.id] }),
}))

export const telegramConfigsRelations = relations(telegramConfigs, ({ one }) => ({
  company: one(companies, { fields: [telegramConfigs.companyId], references: [companies.id] }),
}))

export const messengerChannelsRelations = relations(messengerChannels, ({ one, many }) => ({
  company: one(companies, { fields: [messengerChannels.companyId], references: [companies.id] }),
  creator: one(users, { fields: [messengerChannels.createdBy], references: [users.id] }),
  members: many(messengerMembers),
  messages: many(messengerMessages),
}))

export const messengerMembersRelations = relations(messengerMembers, ({ one }) => ({
  company: one(companies, { fields: [messengerMembers.companyId], references: [companies.id] }),
  channel: one(messengerChannels, { fields: [messengerMembers.channelId], references: [messengerChannels.id] }),
  user: one(users, { fields: [messengerMembers.userId], references: [users.id] }),
}))

export const messengerMessagesRelations = relations(messengerMessages, ({ one }) => ({
  company: one(companies, { fields: [messengerMessages.companyId], references: [companies.id] }),
  channel: one(messengerChannels, { fields: [messengerMessages.channelId], references: [messengerChannels.id] }),
  user: one(users, { fields: [messengerMessages.userId], references: [users.id] }),
}))

export const canvasLayoutsRelations = relations(canvasLayouts, ({ one }) => ({
  company: one(companies, { fields: [canvasLayouts.companyId], references: [companies.id] }),
}))

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(adminSessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  company: one(companies, { fields: [sessions.companyId], references: [companies.id] }),
}))

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, { fields: [adminSessions.adminUserId], references: [adminUsers.id] }),
}))

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
  company: one(companies, { fields: [notificationPreferences.companyId], references: [companies.id] }),
}))
