import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb, integer, pgEnum, index, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// === Enums ===
export const userRoleEnum = pgEnum('user_role', ['admin', 'user'])
export const adminRoleEnum = pgEnum('admin_role', ['superadmin', 'admin'])
export const agentStatusEnum = pgEnum('agent_status', ['online', 'working', 'error', 'offline'])
export const messageSenderEnum = pgEnum('message_sender', ['user', 'agent'])
export const toolScopeEnum = pgEnum('tool_scope', ['platform', 'company', 'department'])
export const delegationStatusEnum = pgEnum('delegation_status', ['pending', 'processing', 'completed', 'failed'])
export const reportStatusEnum = pgEnum('report_status', ['draft', 'submitted', 'reviewed'])
export const jobStatusEnum = pgEnum('job_status', ['queued', 'processing', 'completed', 'failed', 'blocked'])
export const snsStatusEnum = pgEnum('sns_status', ['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed'])
export const snsPlatformEnum = pgEnum('sns_platform', ['instagram', 'tistory', 'daum_cafe'])
export const activityLogTypeEnum = pgEnum('activity_log_type', ['chat', 'delegation', 'tool_call', 'job', 'sns', 'error', 'system', 'login'])
export const activityPhaseEnum = pgEnum('activity_phase', ['start', 'end', 'error'])
export const apiKeyScopeEnum = pgEnum('api_key_scope', ['company', 'user'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired', 'revoked'])
export const agentTierEnum = pgEnum('agent_tier', ['manager', 'specialist', 'worker'])

// === Phase 1 New Enums (Epic 1 Story 1) ===
export const commandTypeEnum = pgEnum('command_type', ['direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork'])
export const orchestrationTaskStatusEnum = pgEnum('orchestration_task_status', ['pending', 'running', 'completed', 'failed', 'timeout'])
export const qualityResultEnum = pgEnum('quality_result', ['pass', 'fail'])

// === Phase 2 New Enums (Epic 10 Story 1) ===
export const tradingModeEnum = pgEnum('trading_mode', ['real', 'paper'])
export const orderSideEnum = pgEnum('order_side', ['buy', 'sell'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed'])
export const orderTypeEnum = pgEnum('order_type', ['market', 'limit'])
export const cronRunStatusEnum = pgEnum('cron_run_status', ['running', 'success', 'failed'])
export const debateStatusEnum = pgEnum('debate_status', ['pending', 'in-progress', 'completed', 'failed'])
export const debateTypeEnum = pgEnum('debate_type', ['debate', 'deep-debate'])
export const consensusResultEnum = pgEnum('consensus_result', ['consensus', 'dissent', 'partial'])

// === 1. companies — 회사 (테넌트 최상위 단위) ===
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  smtpConfig: jsonb('smtp_config'),  // { host, port, secure, user, pass }
  settings: jsonb('settings').$type<Record<string, unknown>>(),  // dashboardQuickActions 등
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
  companyId: uuid('company_id').references(() => companies.id),  // null = superadmin (플랫폼 관리자), non-null = company_admin
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
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

// === 2d. invitations — 직원 초대 ===
export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  token: varchar('token', { length: 64 }).notNull().unique(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  invitedBy: uuid('invited_by').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('invitations_company_idx').on(table.companyId),
}))

// === 2e. employee_departments — 직원-부서 매핑 ===
export const employeeDepartments = pgTable('employee_departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  departmentId: uuid('department_id').notNull().references(() => departments.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('employee_departments_company_idx').on(table.companyId),
  uniqueAssignment: unique('employee_departments_unique').on(table.userId, table.departmentId),
}))

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
  tier: agentTierEnum('tier').notNull().default('specialist'),
  nameEn: varchar('name_en', { length: 100 }),
  modelName: varchar('model_name', { length: 100 }).notNull().default('claude-haiku-4-5'),
  reportTo: uuid('report_to'),  // self-reference to parent agent
  soul: text('soul'),  // 마크다운 성격 정의
  adminSoul: text('admin_soul'),  // 관리자가 설정한 원본 소울 (초기화용)
  status: agentStatusEnum('status').notNull().default('offline'),
  isSecretary: boolean('is_secretary').notNull().default(false),
  isSystem: boolean('is_system').notNull().default(false),  // 시스템 에이전트 삭제 보호
  allowedTools: jsonb('allowed_tools').default([]),  // string[] — 허용 도구 이름 목록
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
  settings: jsonb('settings'),  // 이벤트별 세부 설정 { [eventType]: { inApp, email } }
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('notification_prefs_company_idx').on(table.companyId),
  userCompanyUniq: unique('notification_prefs_user_company_uniq').on(table.userId, table.companyId),
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
  metadata: jsonb('metadata'),  // { stockCode?, stockName? } — 전략실 등 컨텍스트
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
  attachmentIds: text('attachment_ids'),  // JSON string array of file UUIDs
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
  category: varchar('category', { length: 50 }),  // 'search', 'finance', 'content', 'utility', 'communication'
  tags: jsonb('tags'),  // string[] — ['web', 'api', 'free', 'premium']
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
  parentDelegationId: uuid('parent_delegation_id'),  // 자기참조 — 연쇄 위임 추적
  userMessage: text('user_message').notNull(),
  delegationPrompt: text('delegation_prompt').notNull(),
  agentResponse: text('agent_response'),
  status: delegationStatusEnum('status').notNull().default('pending'),
  depth: integer('depth').notNull().default(0),  // 위임 깊이 (0 = 직접, 1+ = 연쇄)
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
  sessionId: uuid('session_id').references(() => chatSessions.id),
  agentId: uuid('agent_id').references(() => agents.id),
  toolId: uuid('tool_id').references(() => toolDefinitions.id),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  input: jsonb('input'),
  output: text('output'),
  status: varchar('status', { length: 20 }).notNull().default('success'),  // success, error, timeout
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyCreatedIdx: index('tool_calls_company_created_idx').on(table.companyId, table.createdAt),
  agentIdx: index('tool_calls_agent_idx').on(table.agentId),
  toolNameIdx: index('tool_calls_tool_name_idx').on(table.toolName),
}))

// === 18. night_jobs — 야간 작업 큐 ===
export const nightJobs = pgTable('night_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  sessionId: uuid('session_id').references(() => chatSessions.id),
  scheduleId: uuid('schedule_id'),  // FK added after nightJobSchedules defined
  triggerId: uuid('trigger_id'),  // FK added after nightJobTriggers defined
  instruction: text('instruction').notNull(),
  status: jobStatusEnum('status').notNull().default('queued'),
  result: text('result'),
  resultData: jsonb('result_data'),  // 구조화된 실행 결과
  error: text('error'),
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  scheduledFor: timestamp('scheduled_for').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  isRead: boolean('is_read').notNull().default(false),
  parentJobId: uuid('parent_job_id'),  // 체인: 이전 작업 참조 (self-reference)
  chainId: uuid('chain_id'),          // 체인: 같은 그룹 식별자
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 18b. night_job_schedules — 반복 야간작업 스케줄 ===
export const nightJobSchedules = pgTable('night_job_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  name: varchar('name', { length: 200 }).notNull(),
  instruction: text('instruction').notNull(),
  cronExpression: varchar('cron_expression', { length: 100 }).notNull(),
  nextRunAt: timestamp('next_run_at'),
  lastRunAt: timestamp('last_run_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('night_schedules_company_idx').on(table.companyId),
}))

// === 18c. night_job_triggers — 이벤트 기반 트리거 ===
export const nightJobTriggers = pgTable('night_job_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  instruction: text('instruction').notNull(),
  triggerType: varchar('trigger_type', { length: 50 }).notNull(),
  condition: jsonb('condition').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('night_triggers_company_idx').on(table.companyId),
}))

// === 18d. cron_runs — 크론 작업 실행 기록 ===
export const cronRuns = pgTable('cron_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  cronJobId: uuid('cron_job_id').notNull().references(() => nightJobSchedules.id, { onDelete: 'cascade' }),
  status: cronRunStatusEnum('status').notNull().default('running'),
  commandText: text('command_text').notNull(),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  result: text('result'),
  error: text('error'),
  durationMs: integer('duration_ms'),
  tokensUsed: integer('tokens_used'),
  costMicro: integer('cost_micro'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('cron_runs_company_idx').on(table.companyId),
  cronJobIdx: index('cron_runs_cron_job_idx').on(table.cronJobId),
  statusIdx: index('cron_runs_status_idx').on(table.status),
}))

// === 19a. sns_accounts — SNS 계정 (멀티 계정 관리) ===
export const snsAccounts = pgTable('sns_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  platform: snsPlatformEnum('platform').notNull(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  accountId: varchar('account_id', { length: 200 }).notNull(),
  credentials: text('credentials'),  // AES-256-GCM 암호화 JSON
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('sns_accounts_company_idx').on(table.companyId),
}))

// === 19. sns_contents — SNS 콘텐츠 ===
export const snsContents = pgTable('sns_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').references(() => agents.id),
  snsAccountId: uuid('sns_account_id').references(() => snsAccounts.id),
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
  scheduledAt: timestamp('scheduled_at'),
  variantOf: uuid('variant_of'),  // self-ref FK — A/B 테스트 원본 연결
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

// === 20b. notifications — 사용자 알림 ===
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  type: varchar('type', { length: 30 }).notNull(),  // chat_complete, delegation_complete, tool_error, job_complete, job_error, system
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body'),
  actionUrl: varchar('action_url', { length: 500 }),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userCreatedIdx: index('notif_user_created_idx').on(table.companyId, table.userId, table.createdAt),
  userUnreadIdx: index('notif_user_unread_idx').on(table.userId, table.isRead),
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
  isBatch: boolean('is_batch').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyCreatedIdx: index('cost_records_company_created_idx').on(table.companyId, table.createdAt),
  agentIdx: index('cost_records_agent_idx').on(table.agentId),
}))

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
  lastReadAt: timestamp('last_read_at'),
})

// === 25. messenger_messages — 사내 메신저 메시지 ===
export const messengerMessages = pgTable('messenger_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  channelId: uuid('channel_id').notNull().references(() => messengerChannels.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  parentMessageId: uuid('parent_message_id'),
  content: text('content').notNull(),
  attachmentIds: text('attachment_ids'),  // JSON string array of file UUIDs
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 25a. messenger_reactions — 메시지 리액션 ===
export const messengerReactions = pgTable('messenger_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  messageId: uuid('message_id').notNull().references(() => messengerMessages.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  emoji: varchar('emoji', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueReaction: unique('messenger_reactions_unique').on(table.messageId, table.userId, table.emoji),
}))

// === 26. files — 파일 메타데이터 ===
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('files_company_idx').on(table.companyId),
}))

// === 27. strategy_watchlists — 전략실 관심 종목 ===
export const strategyWatchlists = pgTable('strategy_watchlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  stockCode: varchar('stock_code', { length: 20 }).notNull(),
  stockName: varchar('stock_name', { length: 100 }).notNull(),
  market: varchar('market', { length: 10 }).notNull().default('KOSPI'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('strategy_watchlists_company_idx').on(table.companyId),
  userStockUniq: unique('strategy_watchlists_user_stock_uniq').on(table.companyId, table.userId, table.stockCode),
}))

// === 28a. strategy_notes — 전략 메모 ===
export const strategyNotes = pgTable('strategy_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  stockCode: varchar('stock_code', { length: 20 }).notNull(),
  title: varchar('title', { length: 200 }),
  content: text('content').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userStockIdx: index('strategy_notes_user_stock_idx').on(table.companyId, table.userId, table.stockCode),
}))

// === 28a-1. strategy_note_shares — 전략 메모 공유 ===
export const strategyNoteShares = pgTable('strategy_note_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => strategyNotes.id, { onDelete: 'cascade' }),
  sharedWithUserId: uuid('shared_with_user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueShare: unique('strategy_note_shares_unique').on(table.noteId, table.sharedWithUserId),
  userIdx: index('strategy_note_shares_user_idx').on(table.companyId, table.sharedWithUserId),
}))

// === 28b. strategy_backtest_results — 백테스트 결과 ===
export const strategyBacktestResults = pgTable('strategy_backtest_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  stockCode: varchar('stock_code', { length: 20 }).notNull(),
  strategyType: varchar('strategy_type', { length: 50 }).notNull(),
  strategyParams: jsonb('strategy_params').notNull().default({}),
  signals: jsonb('signals').notNull().default([]),
  metrics: jsonb('metrics').notNull().default({}),
  dataRange: varchar('data_range', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('strategy_backtest_company_idx').on(table.companyId),
  userStockIdx: index('strategy_backtest_user_stock_idx').on(table.companyId, table.userId, table.stockCode),
}))

// === 28c. strategy_portfolios — 투자 포트폴리오 ===
export const strategyPortfolios = pgTable('strategy_portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  tradingMode: tradingModeEnum('trading_mode').notNull().default('paper'),
  initialCash: integer('initial_cash').notNull().default(50_000_000),
  cashBalance: integer('cash_balance').notNull().default(50_000_000),
  holdings: jsonb('holdings').$type<Array<{ ticker: string; name: string; market: string; quantity: number; avgPrice: number; currentPrice?: number }>>().notNull().default([]),
  totalValue: integer('total_value').notNull().default(50_000_000),
  memo: text('memo'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyUserIdx: index('strategy_portfolios_company_user_idx').on(table.companyId, table.userId),
  companyModeIdx: index('strategy_portfolios_company_mode_idx').on(table.companyId, table.userId, table.tradingMode),
}))

// === 28d. strategy_orders — 매매 주문 (영구 보존, DELETE 금지 FR62) ===
export const strategyOrders = pgTable('strategy_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  portfolioId: uuid('portfolio_id').references(() => strategyPortfolios.id),
  agentId: uuid('agent_id').references(() => agents.id),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  tickerName: varchar('ticker_name', { length: 100 }).notNull(),
  side: orderSideEnum('side').notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
  totalAmount: integer('total_amount').notNull(),
  orderType: orderTypeEnum('order_type').notNull().default('market'),
  tradingMode: tradingModeEnum('trading_mode').notNull().default('paper'),
  status: orderStatusEnum('status').notNull().default('pending'),
  reason: text('reason'),
  kisOrderNo: varchar('kis_order_no', { length: 50 }),
  executedAt: timestamp('executed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyCreatedIdx: index('strategy_orders_company_created_idx').on(table.companyId, table.createdAt),
  companyTickerIdx: index('strategy_orders_company_ticker_idx').on(table.companyId, table.ticker),
  companyModeStatusIdx: index('strategy_orders_company_mode_status_idx').on(table.companyId, table.tradingMode, table.status),
}))

// === 29. agent_delegation_rules — 에이전트 위임 규칙 ===
export const agentDelegationRules = pgTable('agent_delegation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sourceAgentId: uuid('source_agent_id').notNull().references(() => agents.id),
  targetAgentId: uuid('target_agent_id').notNull().references(() => agents.id),
  condition: jsonb('condition').notNull(),  // { keywords: string[], departmentId?: string }
  priority: integer('priority').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('delegation_rules_company_idx').on(table.companyId),
  sourceIdx: index('delegation_rules_source_idx').on(table.companyId, table.sourceAgentId),
}))

// === 28. canvas_layouts — NEXUS 캔버스 레이아웃 ===
export const canvasLayouts = pgTable('canvas_layouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull().default('default'),
  layoutData: jsonb('layout_data').notNull().default('{}'),
  isDefault: boolean('is_default').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 30. soul_templates — 소울 템플릿 라이브러리 ===
export const soulTemplates = pgTable('soul_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id),  // null = 플랫폼 내장
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }),
  isBuiltin: boolean('is_builtin').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('soul_templates_company_idx').on(table.companyId),
}))

// === 31. push_subscriptions — Web Push 구독 ===
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('push_subscriptions_user_idx').on(table.companyId, table.userId),
  endpointUniq: unique('push_subscriptions_endpoint_uniq').on(table.endpoint),
}))

// === 32. nexus_workflows — NEXUS 워크플로우 ===
export const nexusWorkflows = pgTable('nexus_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  nodes: jsonb('nodes').notNull().default([]),
  edges: jsonb('edges').notNull().default([]),
  isTemplate: boolean('is_template').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 33. nexus_executions — NEXUS 워크플로우 실행 기록 ===
export const nexusExecutions = pgTable('nexus_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  workflowId: uuid('workflow_id').notNull().references(() => nexusWorkflows.id),
  status: varchar('status', { length: 20 }).notNull().default('running'),
  result: jsonb('result'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
})

// === 34. mcp_servers — MCP 서버 연동 ===
export const mcpServers = pgTable('mcp_servers', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  url: text('url').notNull(),
  transport: varchar('transport', { length: 20 }).notNull().default('stdio'),
  config: jsonb('config'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// === 35. sketches — SketchVibe 캔버스 다이어그램 ===
export const sketches = pgTable('sketches', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 200 }).notNull(),
  graphData: jsonb('graph_data').notNull().default('{"nodes":[],"edges":[]}'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('sketches_company_idx').on(table.companyId),
  createdByIdx: index('sketches_created_by_idx').on(table.createdBy),
}))

// === Phase 1 New Tables (Epic 1 Story 1) ===

// === P1-1. commands — CEO 명령 이력 ===
export const commands = pgTable('commands', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: commandTypeEnum('type').notNull().default('direct'),
  text: text('text').notNull(),
  targetAgentId: uuid('target_agent_id').references(() => agents.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'),  // pending|processing|completed|failed|cancelled
  result: text('result'),
  metadata: jsonb('metadata'),  // 슬래시 종류, 프리셋ID 등
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  companyIdx: index('commands_company_idx').on(table.companyId),
  companyUserIdx: index('commands_company_user_idx').on(table.companyId, table.userId),
  companyCreatedIdx: index('commands_company_created_idx').on(table.companyId, table.createdAt),
}))

// === P1-2. orchestration_tasks — 오케스트레이션 작업 추적 ===
export const orchestrationTasks = pgTable('orchestration_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  parentTaskId: uuid('parent_task_id'),  // self-ref — 위임 체인 추적
  type: varchar('type', { length: 30 }).notNull(),  // classify|delegate|execute|synthesize|review
  input: text('input'),
  output: text('output'),
  status: orchestrationTaskStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  durationMs: integer('duration_ms'),
  metadata: jsonb('metadata'),  // 도구 호출 수, 토큰 수 등
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('orch_tasks_company_idx').on(table.companyId),
  companyCommandIdx: index('orch_tasks_company_command_idx').on(table.companyId, table.commandId),
  companyAgentIdx: index('orch_tasks_company_agent_idx').on(table.companyId, table.agentId),
}))

// === P1-3. quality_reviews — QA 게이트 결과 ===
export const qualityReviews = pgTable('quality_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  taskId: uuid('task_id').references(() => orchestrationTasks.id),
  reviewerAgentId: uuid('reviewer_agent_id').notNull().references(() => agents.id),
  conclusion: qualityResultEnum('conclusion').notNull(),
  scores: jsonb('scores').notNull(),  // {conclusionQuality, evidenceSources, riskAssessment, formatCompliance, logicalCoherence}
  feedback: text('feedback'),  // fail 시 재작업 지시
  attemptNumber: integer('attempt_number').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('quality_reviews_company_idx').on(table.companyId),
  companyCommandIdx: index('quality_reviews_company_command_idx').on(table.companyId, table.commandId),
}))

// === P1-4. presets — 명령 프리셋 ===
export const presets = pgTable('presets', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  command: text('command').notNull(),
  category: varchar('category', { length: 50 }),
  isGlobal: boolean('is_global').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('presets_company_idx').on(table.companyId),
  companyUserIdx: index('presets_company_user_idx').on(table.companyId, table.userId),
}))

// === P1-5. org_templates — 조직 템플릿 ===
export const orgTemplates = pgTable('org_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id),  // null = 플랫폼 내장 템플릿
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  templateData: jsonb('template_data').notNull(),  // {departments: [{name, agents: [{name, tier, modelName, soul, allowedTools}]}]}
  isBuiltin: boolean('is_builtin').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('org_templates_company_idx').on(table.companyId),
}))

// === P1-6. audit_logs — 삭제 불가 감사 로그 (INSERT ONLY) ===
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  actorType: varchar('actor_type', { length: 20 }).notNull(),  // admin_user|user|agent|system
  actorId: uuid('actor_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),  // org.department.create|credential.access|trade.order...
  targetType: varchar('target_type', { length: 50 }),  // department|agent|credential|company...
  targetId: uuid('target_id'),
  before: jsonb('before'),  // 변경 전 상태
  after: jsonb('after'),  // 변경 후 상태
  metadata: jsonb('metadata'),  // IP, userAgent 등
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // NO updatedAt — INSERT-ONLY 테이블
}, (table) => ({
  companyIdx: index('audit_logs_company_idx').on(table.companyId),
  companyActionIdx: index('audit_logs_company_action_idx').on(table.companyId, table.action),
  companyCreatedIdx: index('audit_logs_company_created_idx').on(table.companyId, table.createdAt),
  companyTargetIdx: index('audit_logs_company_target_idx').on(table.companyId, table.targetType, table.targetId),
}))

// === Relations ===
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  departments: many(departments),
  agents: many(agents),
  commands: many(commands),
  orchestrationTasks: many(orchestrationTasks),
  qualityReviews: many(qualityReviews),
  presets: many(presets),
  orgTemplates: many(orgTemplates),
  auditLogs: many(auditLogs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, { fields: [users.companyId], references: [companies.id] }),
  agents: many(agents),
  cliCredentials: many(cliCredentials),
  apiKeys: many(apiKeys),
  chatSessions: many(chatSessions),
  employeeDepartments: many(employeeDepartments),
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
  employeeDepartments: many(employeeDepartments),
}))

export const employeeDepartmentsRelations = relations(employeeDepartments, ({ one }) => ({
  user: one(users, { fields: [employeeDepartments.userId], references: [users.id] }),
  department: one(departments, { fields: [employeeDepartments.departmentId], references: [departments.id] }),
  company: one(companies, { fields: [employeeDepartments.companyId], references: [companies.id] }),
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
  parentDelegation: one(delegations, { fields: [delegations.parentDelegationId], references: [delegations.id] }),
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
  toolDefinition: one(toolDefinitions, { fields: [toolCalls.toolId], references: [toolDefinitions.id] }),
}))

export const nightJobsRelations = relations(nightJobs, ({ one }) => ({
  company: one(companies, { fields: [nightJobs.companyId], references: [companies.id] }),
  user: one(users, { fields: [nightJobs.userId], references: [users.id] }),
  agent: one(agents, { fields: [nightJobs.agentId], references: [agents.id] }),
  session: one(chatSessions, { fields: [nightJobs.sessionId], references: [chatSessions.id] }),
  schedule: one(nightJobSchedules, { fields: [nightJobs.scheduleId], references: [nightJobSchedules.id] }),
  trigger: one(nightJobTriggers, { fields: [nightJobs.triggerId], references: [nightJobTriggers.id] }),
}))

export const nightJobSchedulesRelations = relations(nightJobSchedules, ({ one, many }) => ({
  company: one(companies, { fields: [nightJobSchedules.companyId], references: [companies.id] }),
  user: one(users, { fields: [nightJobSchedules.userId], references: [users.id] }),
  agent: one(agents, { fields: [nightJobSchedules.agentId], references: [agents.id] }),
  jobs: many(nightJobs),
  runs: many(cronRuns),
}))

export const cronRunsRelations = relations(cronRuns, ({ one }) => ({
  company: one(companies, { fields: [cronRuns.companyId], references: [companies.id] }),
  cronJob: one(nightJobSchedules, { fields: [cronRuns.cronJobId], references: [nightJobSchedules.id] }),
}))

export const nightJobTriggersRelations = relations(nightJobTriggers, ({ one, many }) => ({
  company: one(companies, { fields: [nightJobTriggers.companyId], references: [companies.id] }),
  user: one(users, { fields: [nightJobTriggers.userId], references: [users.id] }),
  agent: one(agents, { fields: [nightJobTriggers.agentId], references: [agents.id] }),
  jobs: many(nightJobs),
}))

export const snsAccountsRelations = relations(snsAccounts, ({ one, many }) => ({
  company: one(companies, { fields: [snsAccounts.companyId], references: [companies.id] }),
  creator: one(users, { fields: [snsAccounts.createdBy], references: [users.id] }),
  contents: many(snsContents),
}))

export const snsContentsRelations = relations(snsContents, ({ one, many }) => ({
  company: one(companies, { fields: [snsContents.companyId], references: [companies.id] }),
  agent: one(agents, { fields: [snsContents.agentId], references: [agents.id] }),
  snsAccount: one(snsAccounts, { fields: [snsContents.snsAccountId], references: [snsAccounts.id] }),
  creator: one(users, { fields: [snsContents.createdBy], references: [users.id] }),
  original: one(snsContents, { fields: [snsContents.variantOf], references: [snsContents.id], relationName: 'variants' }),
  variants: many(snsContents, { relationName: 'variants' }),
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

export const messengerMessagesRelations = relations(messengerMessages, ({ one, many }) => ({
  company: one(companies, { fields: [messengerMessages.companyId], references: [companies.id] }),
  channel: one(messengerChannels, { fields: [messengerMessages.channelId], references: [messengerChannels.id] }),
  user: one(users, { fields: [messengerMessages.userId], references: [users.id] }),
  reactions: many(messengerReactions),
}))

export const messengerReactionsRelations = relations(messengerReactions, ({ one }) => ({
  company: one(companies, { fields: [messengerReactions.companyId], references: [companies.id] }),
  message: one(messengerMessages, { fields: [messengerReactions.messageId], references: [messengerMessages.id] }),
  user: one(users, { fields: [messengerReactions.userId], references: [users.id] }),
}))

export const filesRelations = relations(files, ({ one }) => ({
  company: one(companies, { fields: [files.companyId], references: [companies.id] }),
  user: one(users, { fields: [files.userId], references: [users.id] }),
}))

export const strategyWatchlistsRelations = relations(strategyWatchlists, ({ one }) => ({
  company: one(companies, { fields: [strategyWatchlists.companyId], references: [companies.id] }),
  user: one(users, { fields: [strategyWatchlists.userId], references: [users.id] }),
}))

export const strategyNotesRelations = relations(strategyNotes, ({ one, many }) => ({
  company: one(companies, { fields: [strategyNotes.companyId], references: [companies.id] }),
  user: one(users, { fields: [strategyNotes.userId], references: [users.id] }),
  shares: many(strategyNoteShares),
}))

export const strategyNoteSharesRelations = relations(strategyNoteShares, ({ one }) => ({
  note: one(strategyNotes, { fields: [strategyNoteShares.noteId], references: [strategyNotes.id] }),
  sharedWithUser: one(users, { fields: [strategyNoteShares.sharedWithUserId], references: [users.id] }),
  company: one(companies, { fields: [strategyNoteShares.companyId], references: [companies.id] }),
}))

export const strategyBacktestResultsRelations = relations(strategyBacktestResults, ({ one }) => ({
  company: one(companies, { fields: [strategyBacktestResults.companyId], references: [companies.id] }),
  user: one(users, { fields: [strategyBacktestResults.userId], references: [users.id] }),
}))

export const strategyPortfoliosRelations = relations(strategyPortfolios, ({ one, many }) => ({
  company: one(companies, { fields: [strategyPortfolios.companyId], references: [companies.id] }),
  user: one(users, { fields: [strategyPortfolios.userId], references: [users.id] }),
  orders: many(strategyOrders),
}))

export const strategyOrdersRelations = relations(strategyOrders, ({ one }) => ({
  company: one(companies, { fields: [strategyOrders.companyId], references: [companies.id] }),
  user: one(users, { fields: [strategyOrders.userId], references: [users.id] }),
  portfolio: one(strategyPortfolios, { fields: [strategyOrders.portfolioId], references: [strategyPortfolios.id] }),
  agent: one(agents, { fields: [strategyOrders.agentId], references: [agents.id] }),
}))

export const canvasLayoutsRelations = relations(canvasLayouts, ({ one }) => ({
  company: one(companies, { fields: [canvasLayouts.companyId], references: [companies.id] }),
}))

export const adminUsersRelations = relations(adminUsers, ({ one, many }) => ({
  company: one(companies, { fields: [adminUsers.companyId], references: [companies.id] }),
  sessions: many(adminSessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  company: one(companies, { fields: [sessions.companyId], references: [companies.id] }),
}))

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, { fields: [adminSessions.adminUserId], references: [adminUsers.id] }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  company: one(companies, { fields: [notifications.companyId], references: [companies.id] }),
}))

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
  company: one(companies, { fields: [notificationPreferences.companyId], references: [companies.id] }),
}))

export const soulTemplatesRelations = relations(soulTemplates, ({ one }) => ({
  company: one(companies, { fields: [soulTemplates.companyId], references: [companies.id] }),
  creator: one(users, { fields: [soulTemplates.createdBy], references: [users.id] }),
}))

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  company: one(companies, { fields: [pushSubscriptions.companyId], references: [companies.id] }),
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}))

export const nexusWorkflowsRelations = relations(nexusWorkflows, ({ one, many }) => ({
  company: one(companies, { fields: [nexusWorkflows.companyId], references: [companies.id] }),
  createdByUser: one(users, { fields: [nexusWorkflows.createdBy], references: [users.id] }),
  executions: many(nexusExecutions),
}))

export const nexusExecutionsRelations = relations(nexusExecutions, ({ one }) => ({
  company: one(companies, { fields: [nexusExecutions.companyId], references: [companies.id] }),
  workflow: one(nexusWorkflows, { fields: [nexusExecutions.workflowId], references: [nexusWorkflows.id] }),
}))

export const mcpServersRelations = relations(mcpServers, ({ one }) => ({
  company: one(companies, { fields: [mcpServers.companyId], references: [companies.id] }),
}))

export const sketchesRelations = relations(sketches, ({ one }) => ({
  company: one(companies, { fields: [sketches.companyId], references: [companies.id] }),
  createdByUser: one(users, { fields: [sketches.createdBy], references: [users.id] }),
}))

// === Phase 1 New Relations (Epic 1 Story 1) ===

export const commandsRelations = relations(commands, ({ one, many }) => ({
  company: one(companies, { fields: [commands.companyId], references: [companies.id] }),
  user: one(users, { fields: [commands.userId], references: [users.id] }),
  targetAgent: one(agents, { fields: [commands.targetAgentId], references: [agents.id] }),
  tasks: many(orchestrationTasks),
  qualityReviews: many(qualityReviews),
}))

export const orchestrationTasksRelations = relations(orchestrationTasks, ({ one }) => ({
  company: one(companies, { fields: [orchestrationTasks.companyId], references: [companies.id] }),
  command: one(commands, { fields: [orchestrationTasks.commandId], references: [commands.id] }),
  agent: one(agents, { fields: [orchestrationTasks.agentId], references: [agents.id] }),
  parentTask: one(orchestrationTasks, { fields: [orchestrationTasks.parentTaskId], references: [orchestrationTasks.id] }),
}))

export const qualityReviewsRelations = relations(qualityReviews, ({ one }) => ({
  company: one(companies, { fields: [qualityReviews.companyId], references: [companies.id] }),
  command: one(commands, { fields: [qualityReviews.commandId], references: [commands.id] }),
  task: one(orchestrationTasks, { fields: [qualityReviews.taskId], references: [orchestrationTasks.id] }),
  reviewerAgent: one(agents, { fields: [qualityReviews.reviewerAgentId], references: [agents.id] }),
}))

export const presetsRelations = relations(presets, ({ one }) => ({
  company: one(companies, { fields: [presets.companyId], references: [companies.id] }),
  user: one(users, { fields: [presets.userId], references: [users.id] }),
}))

export const orgTemplatesRelations = relations(orgTemplates, ({ one }) => ({
  company: one(companies, { fields: [orgTemplates.companyId], references: [companies.id] }),
  creator: one(users, { fields: [orgTemplates.createdBy], references: [users.id] }),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  company: one(companies, { fields: [auditLogs.companyId], references: [companies.id] }),
}))

// === Phase 2: AGORA Debate Engine (Epic 11 Story 1) ===

export const debates = pgTable('debates', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  topic: text('topic').notNull(),
  debateType: debateTypeEnum('debate_type').notNull().default('debate'),
  status: debateStatusEnum('status').notNull().default('pending'),
  maxRounds: integer('max_rounds').notNull().default(2),
  participants: jsonb('participants').$type<{ agentId: string; agentName: string; role: string }[]>().notNull().default([]),
  rounds: jsonb('rounds').$type<{
    roundNum: number
    speeches: {
      agentId: string
      agentName: string
      content: string
      position: string
      createdAt: string
    }[]
  }[]>().notNull().default([]),
  result: jsonb('result').$type<{
    consensus: 'consensus' | 'dissent' | 'partial'
    summary: string
    majorityPosition: string
    minorityPosition: string
    keyArguments: string[]
    roundCount: number
  } | null>(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  error: text('error'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('debates_company_idx').on(table.companyId),
  statusIdx: index('debates_status_idx').on(table.status),
}))

export const debatesRelations = relations(debates, ({ one }) => ({
  company: one(companies, { fields: [debates.companyId], references: [companies.id] }),
  creator: one(users, { fields: [debates.createdBy], references: [users.id] }),
}))
