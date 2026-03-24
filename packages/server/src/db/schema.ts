import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb, integer, pgEnum, index, unique, uniqueIndex, real, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { vector } from './pgvector'

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
export const snsPlatformEnum = pgEnum('sns_platform', ['instagram', 'tistory', 'daum_cafe', 'twitter', 'facebook', 'naver_blog'])
export const activityLogTypeEnum = pgEnum('activity_log_type', ['chat', 'delegation', 'tool_call', 'job', 'sns', 'error', 'system', 'login'])
export const activityPhaseEnum = pgEnum('activity_phase', ['start', 'end', 'error'])
export const apiKeyScopeEnum = pgEnum('api_key_scope', ['company', 'user'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired', 'revoked'])
export const agentTierEnum = pgEnum('agent_tier', ['manager', 'specialist', 'worker'])

// === Phase 1 New Enums (Epic 1 Story 1) ===
export const commandTypeEnum = pgEnum('command_type', ['direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork'])
export const orchestrationTaskStatusEnum = pgEnum('orchestration_task_status', ['pending', 'running', 'completed', 'failed', 'timeout'])
export const qualityResultEnum = pgEnum('quality_result', ['pass', 'fail'])

// === Phase 2 New Enums (Epic 16 Story 1) ===
export const memoryTypeEnum = pgEnum('memory_type', ['learning', 'insight', 'preference', 'fact'])

// === Phase 2 New Enums (Epic 10 Story 1) ===
export const tradingModeEnum = pgEnum('trading_mode', ['real', 'paper'])
export const orderSideEnum = pgEnum('order_side', ['buy', 'sell'])
export const orderStatusEnum = pgEnum('order_status', ['pending_approval', 'pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed'])
export const orderTypeEnum = pgEnum('order_type', ['market', 'limit'])
export const cronRunStatusEnum = pgEnum('cron_run_status', ['running', 'success', 'failed'])
export const debateStatusEnum = pgEnum('debate_status', ['pending', 'in-progress', 'completed', 'failed'])
export const debateTypeEnum = pgEnum('debate_type', ['debate', 'deep-debate'])
export const argosEventStatusEnum = pgEnum('argos_event_status', ['detected', 'executing', 'completed', 'failed'])
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
  userId: uuid('user_id').references(() => users.id),
  departmentId: uuid('department_id').references(() => departments.id),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 200 }),
  tier: agentTierEnum('tier').notNull().default('specialist'),  // deprecated: use tierLevel (Story 8.1)
  tierLevel: integer('tier_level').notNull().default(2),  // 1=Manager, 2=Specialist, 3=Worker (dynamic N-tier)
  nameEn: varchar('name_en', { length: 100 }),
  modelName: varchar('model_name', { length: 100 }).notNull().default('claude-haiku-4-5'),
  reportTo: uuid('report_to'),  // self-reference to parent agent
  soul: text('soul'),  // 마크다운 성격 정의
  adminSoul: text('admin_soul'),  // 관리자가 설정한 원본 소울 (초기화용)
  status: agentStatusEnum('status').notNull().default('offline'),
  ownerUserId: uuid('owner_user_id').references(() => users.id),  // CLI 토큰 소유 인간직원 매핑
  isSecretary: boolean('is_secretary').notNull().default(false),
  isSystem: boolean('is_system').notNull().default(false),  // 시스템 에이전트 삭제 보호
  allowedTools: jsonb('allowed_tools').default([]),  // string[] — 허용 도구 이름 목록
  autoLearn: boolean('auto_learn').notNull().default(true),  // 자동 학습 메모리 추출 on/off
  enableSemanticCache: boolean('enable_semantic_cache').notNull().default(false),  // Story 15.3: semantic caching
  personalityTraits: jsonb('personality_traits'),  // Story 24.1: Big Five OCEAN (0-100 each), NULL = no personality
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('agents_company_idx').on(table.companyId),
}))

// === 4a. tier_configs — 회사별 N-Tier 계층 설정 (Epic 8, Story 8.1) ===
export const tierConfigs = pgTable('tier_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  tierLevel: integer('tier_level').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  modelPreference: varchar('model_preference', { length: 100 }).notNull().default('claude-haiku-4-5'),
  maxTools: integer('max_tools').notNull().default(10),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('tier_configs_company_idx').on(table.companyId),
  uniqueTierLevel: unique('tier_configs_company_level_unique').on(table.companyId, table.tierLevel),
}))

// === 4b. notification_preferences — 유저별 알림 설정 ===
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

// === 18c. night_job_triggers — 이벤트 기반 트리거 (ARGOS) ===
export const nightJobTriggers = pgTable('night_job_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  name: varchar('name', { length: 200 }),
  instruction: text('instruction').notNull(),
  triggerType: varchar('trigger_type', { length: 50 }).notNull(),
  condition: jsonb('condition').notNull(),
  cooldownMinutes: integer('cooldown_minutes').notNull().default(30),
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

// === 18e. argos_events — ARGOS 트리거 이벤트 기록 ===
export const argosEvents = pgTable('argos_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  triggerId: uuid('trigger_id').notNull().references(() => nightJobTriggers.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  eventData: jsonb('event_data'),
  status: argosEventStatusEnum('status').notNull().default('detected'),
  commandId: uuid('command_id'),
  result: text('result'),
  error: text('error'),
  durationMs: integer('duration_ms'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('argos_events_company_idx').on(table.companyId),
  triggerIdx: index('argos_events_trigger_idx').on(table.triggerId),
  statusIdx: index('argos_events_status_idx').on(table.status),
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
  priority: integer('priority').notNull().default(0),  // 높을수록 먼저 발행
  isCardNews: boolean('is_card_news').notNull().default(false),  // 카드뉴스 시리즈 여부
  cardSeriesId: uuid('card_series_id'),  // 카드뉴스 시리즈 루트 ID (self-ref)
  cardIndex: integer('card_index'),  // 시리즈 내 순서 (0-based)
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
  webhookSecret: varchar('webhook_secret', { length: 100 }),  // secret_token for webhook verification
  webhookUrl: text('webhook_url'),  // registered webhook URL
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

// === 25b. conversations — 1:1 및 그룹 대화방 (Story 19-1) ===
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  type: varchar('type', { length: 20 }).notNull(), // 'direct' | 'group'
  name: varchar('name', { length: 255 }), // 그룹 채팅방 이름
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('conversations_company_idx').on(table.companyId),
  companyActiveIdx: index('conversations_company_active_idx').on(table.companyId, table.isActive),
}));

// === 25c. conversation_participants — 대화방 참여자 (Story 19-1) ===
export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastReadAt: timestamp('last_read_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
  userConvIdx: index('conv_participants_user_conv_idx').on(table.userId, table.conversationId),
  companyUserIdx: index('conv_participants_company_user_idx').on(table.companyId, table.userId),
}));

// === 25d. messages — 1:1/그룹 대화 메시지 (Story 19-1) ===
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('text'), // 'text' | 'system' | 'ai_report'
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  convCreatedIdx: index('messages_conv_created_idx').on(table.conversationId, table.createdAt),
  companyIdx: index('messages_company_idx').on(table.companyId),
}));

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
  sortOrder: integer('sort_order').notNull().default(0),
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
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  downloadCount: integer('download_count').notNull().default(0),
  tier: varchar('tier', { length: 20 }),
  allowedTools: jsonb('allowed_tools'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('soul_templates_company_idx').on(table.companyId),
  publishedIdx: index('soul_templates_published_idx').on(table.isPublished),
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
  knowledgeDocId: uuid('knowledge_doc_id'),  // FK to knowledgeDocs — linked knowledge document (Story 11.4)
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('sketches_company_idx').on(table.companyId),
  createdByIdx: index('sketches_created_by_idx').on(table.createdBy),
}))

// === 35b. sketch_versions — SketchVibe 캔버스 버전 히스토리 ===
export const sketchVersions = pgTable('sketch_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sketchId: uuid('sketch_id').notNull().references(() => sketches.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  graphData: jsonb('graph_data').notNull().default('{"nodes":[],"edges":[]}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  sketchIdx: index('sketch_versions_sketch_idx').on(table.sketchId),
  sketchVersionUniq: unique('sketch_versions_sketch_version_uniq').on(table.sketchId, table.version),
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
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  downloadCount: integer('download_count').notNull().default(0),
  tags: jsonb('tags'),  // string[]
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('org_templates_company_idx').on(table.companyId),
  publishedIdx: index('org_templates_published_idx').on(table.isPublished),
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

// === P2-17. soul_gym_rounds — Soul Gym 진화 이력 ===
export const soulGymRounds = pgTable('soul_gym_rounds', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  roundNum: integer('round_num').notNull().default(1),
  scoreBefore: real('score_before').notNull().default(0),
  scoreAfter: real('score_after').notNull().default(0),
  improvement: real('improvement').notNull().default(0),
  winner: varchar('winner', { length: 30 }).notNull(),  // original | variantA | variantB | variantC
  costUsd: real('cost_usd').notNull().default(0),
  variantsJson: jsonb('variants_json'),  // { scores, proposals, elapsed }
  benchmarkJson: jsonb('benchmark_json'),  // { questions, responses, judgeScores }
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('soul_gym_rounds_company_idx').on(table.companyId),
  agentIdx: index('soul_gym_rounds_agent_idx').on(table.companyId, table.agentId),
}))

// === P2-18. soul_evolution_proposals — Soul Evolution 제안 ===
export const soulEvolutionProposals = pgTable('soul_evolution_proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'),  // pending | approved | rejected
  proposalText: text('proposal_text').notNull(),
  analysisJson: jsonb('analysis_json'),  // { warningsAnalyzed, patterns, reasoning }
  createdAt: timestamp('created_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
}, (table) => ({
  companyIdx: index('soul_evolution_proposals_company_idx').on(table.companyId),
  agentStatusIdx: index('soul_evolution_proposals_agent_status_idx').on(table.companyId, table.agentId, table.status),
}))

// === P2-19. soul_backups — Soul 백업 (롤백용) ===
export const soulBackups = pgTable('soul_backups', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  soulMarkdown: text('soul_markdown').notNull(),
  version: integer('version').notNull().default(1),
  source: varchar('source', { length: 30 }).notNull().default('soul-gym'),  // soul-gym | soul-evolution | manual
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  agentIdx: index('soul_backups_agent_idx').on(table.companyId, table.agentId),
}))

// === P3-20. company_api_keys — 공개 API 키 (SHA-256 해시 저장) ===
export const companyApiKeys = pgTable('company_api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
  keyHash: varchar('key_hash', { length: 64 }).notNull(),  // SHA-256 hex
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').notNull().default(true),
  scopes: jsonb('scopes').notNull().default(['read']),  // ['read'] | ['read','write'] | ['read','write','execute']
  rateLimitPerMin: integer('rate_limit_per_min').notNull().default(60),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('company_api_keys_company_idx').on(table.companyId),
  keyHashIdx: uniqueIndex('company_api_keys_key_hash_idx').on(table.keyHash),
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
  tierConfigs: many(tierConfigs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, { fields: [users.companyId], references: [companies.id] }),
  agents: many(agents),
  ownedAgents: many(agents, { relationName: 'ownedAgents' }),
  cliCredentials: many(cliCredentials),
  apiKeys: many(apiKeys),
  chatSessions: many(chatSessions),
  employeeDepartments: many(employeeDepartments),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
}))

export const agentsRelations = relations(agents, ({ one, many }) => ({
  company: one(companies, { fields: [agents.companyId], references: [companies.id] }),
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  ownerUser: one(users, { fields: [agents.ownerUserId], references: [users.id], relationName: 'ownedAgents' }),
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

export const tierConfigsRelations = relations(tierConfigs, ({ one }) => ({
  company: one(companies, { fields: [tierConfigs.companyId], references: [companies.id] }),
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
  events: many(argosEvents),
}))

export const argosEventsRelations = relations(argosEvents, ({ one }) => ({
  company: one(companies, { fields: [argosEvents.companyId], references: [companies.id] }),
  trigger: one(nightJobTriggers, { fields: [argosEvents.triggerId], references: [nightJobTriggers.id] }),
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
  cardSeriesRoot: one(snsContents, { fields: [snsContents.cardSeriesId], references: [snsContents.id], relationName: 'cardSeriesItems' }),
  cardSeriesItems: many(snsContents, { relationName: 'cardSeriesItems' }),
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

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  company: one(companies, { fields: [conversations.companyId], references: [companies.id] }),
  participants: many(conversationParticipants),
  messages: many(messages),
}))

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationParticipants.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [conversationParticipants.userId], references: [users.id] }),
  company: one(companies, { fields: [conversationParticipants.companyId], references: [companies.id] }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  company: one(companies, { fields: [messages.companyId], references: [companies.id] }),
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

export const sketchesRelations = relations(sketches, ({ one, many }) => ({
  company: one(companies, { fields: [sketches.companyId], references: [companies.id] }),
  createdByUser: one(users, { fields: [sketches.createdBy], references: [users.id] }),
  versions: many(sketchVersions),
}))

export const sketchVersionsRelations = relations(sketchVersions, ({ one }) => ({
  sketch: one(sketches, { fields: [sketchVersions.sketchId], references: [sketches.id] }),
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
  timeline: jsonb('timeline').$type<{
    event: string
    debateId: string
    timestamp: string
    [key: string]: unknown
  }[]>().notNull().default([]),
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

// === Phase 2: Knowledge Base & Agent Memory (Epic 16 Story 1) ===

// === K-1. knowledge_folders — 지식 폴더 (중첩 구조) ===
export const knowledgeFolders = pgTable('knowledge_folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  parentId: uuid('parent_id'),  // self-reference for nested folders
  departmentId: uuid('department_id').references(() => departments.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('knowledge_folders_company_idx').on(table.companyId),
  parentIdx: index('knowledge_folders_parent_idx').on(table.parentId),
  departmentIdx: index('knowledge_folders_department_idx').on(table.departmentId),
  uniqueNamePerLevel: unique('knowledge_folders_name_level_uniq').on(table.companyId, table.name, table.parentId),
}))

// === K-2. knowledge_docs — 지식 문서 ===
export const knowledgeDocs = pgTable('knowledge_docs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  folderId: uuid('folder_id').references(() => knowledgeFolders.id),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content'),  // markdown body
  contentType: varchar('content_type', { length: 50 }).notNull().default('markdown'),
  fileUrl: text('file_url'),  // uploaded file reference
  tags: jsonb('tags').$type<string[]>().default([]),
  embedding: vector('embedding', { dimensions: 1024 }),  // pgvector: Voyage AI voyage-3 1024-dim, NULL = not yet embedded
  embeddingModel: varchar('embedding_model', { length: 50 }),  // e.g. 'voyage-3'
  embeddedAt: timestamp('embedded_at'),  // last embedding timestamp
  linkedSketchId: uuid('linked_sketch_id'),  // FK to sketches — linked canvas (Story 11.4)
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('knowledge_docs_company_idx').on(table.companyId),
  folderIdx: index('knowledge_docs_folder_idx').on(table.folderId),
  createdByIdx: index('knowledge_docs_created_by_idx').on(table.createdBy),
}))

// === K-2a. doc_versions — 문서 버전 이력 ===
export const docVersions = pgTable('doc_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  docId: uuid('doc_id').notNull().references(() => knowledgeDocs.id),
  version: integer('version').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content'),
  contentType: varchar('content_type', { length: 50 }).notNull().default('markdown'),
  tags: jsonb('tags').$type<string[]>().default([]),
  editedBy: uuid('edited_by').notNull().references(() => users.id),
  changeNote: varchar('change_note', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  docIdx: index('doc_versions_doc_idx').on(table.docId),
  docVersionUniq: unique('doc_versions_doc_version_uniq').on(table.docId, table.version),
}))

// === K-3. agent_memories — 에이전트 학습 기억 (enhanced) ===
export const agentMemories = pgTable('agent_memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  memoryType: memoryTypeEnum('memory_type').notNull().default('learning'),
  key: varchar('key', { length: 200 }).notNull(),
  content: text('content').notNull(),
  context: text('context'),  // what task/situation produced this memory
  source: varchar('source', { length: 50 }).notNull().default('manual'),
  confidence: integer('confidence').notNull().default(50),  // 0-100
  embedding: vector('embedding', { dimensions: 1024 }),  // Voyage AI voyage-3 1024-dim for semantic search
  category: varchar('category', { length: 50 }),  // 'insight', 'fact', 'preference', 'skill', 'pattern', etc.
  observationIds: text('observation_ids'),  // JSON array of source observation UUIDs (e.g., '["uuid1","uuid2"]')
  usageCount: integer('usage_count').notNull().default(0),
  lastUsedAt: timestamp('last_used_at'),
  pinned: boolean('pinned').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('agent_memories_company_idx').on(table.companyId),
  agentIdx: index('agent_memories_agent_idx').on(table.agentId),
  memoryTypeIdx: index('agent_memories_type_idx').on(table.memoryType),
}))

// === Knowledge Base Relations ===
export const knowledgeFoldersRelations = relations(knowledgeFolders, ({ one, many }) => ({
  company: one(companies, { fields: [knowledgeFolders.companyId], references: [companies.id] }),
  parent: one(knowledgeFolders, { fields: [knowledgeFolders.parentId], references: [knowledgeFolders.id], relationName: 'children' }),
  children: many(knowledgeFolders, { relationName: 'children' }),
  department: one(departments, { fields: [knowledgeFolders.departmentId], references: [departments.id] }),
  creator: one(users, { fields: [knowledgeFolders.createdBy], references: [users.id] }),
  docs: many(knowledgeDocs),
}))

export const knowledgeDocsRelations = relations(knowledgeDocs, ({ one, many }) => ({
  company: one(companies, { fields: [knowledgeDocs.companyId], references: [companies.id] }),
  folder: one(knowledgeFolders, { fields: [knowledgeDocs.folderId], references: [knowledgeFolders.id] }),
  creator: one(users, { fields: [knowledgeDocs.createdBy], references: [users.id] }),
  updater: one(users, { fields: [knowledgeDocs.updatedBy], references: [users.id] }),
  versions: many(docVersions),
}))

export const docVersionsRelations = relations(docVersions, ({ one }) => ({
  doc: one(knowledgeDocs, { fields: [docVersions.docId], references: [knowledgeDocs.id] }),
  editor: one(users, { fields: [docVersions.editedBy], references: [users.id] }),
}))

export const agentMemoriesRelations = relations(agentMemories, ({ one }) => ({
  company: one(companies, { fields: [agentMemories.companyId], references: [companies.id] }),
  agent: one(agents, { fields: [agentMemories.agentId], references: [agents.id] }),
}))

// === Phase 2: Operation Log Bookmarks (Epic 17 Story 1) ===

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyUserIdx: index('bookmarks_company_user_idx').on(table.companyId, table.userId),
  companyUserCommandUniq: unique('bookmarks_company_user_command_uniq').on(table.companyId, table.userId, table.commandId),
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  company: one(companies, { fields: [bookmarks.companyId], references: [companies.id] }),
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  command: one(commands, { fields: [bookmarks.commandId], references: [commands.id] }),
}))

// === Phase 2: Archive / Classified Docs (Epic 17 Story 3) ===

export const classificationEnum = pgEnum('classification', ['public', 'internal', 'confidential', 'secret'])

// === A-1. archive_folders — 기밀문서 폴더 (중첩 구조) ===
export const archiveFolders = pgTable('archive_folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 200 }).notNull(),
  parentId: uuid('parent_id'),  // self-reference for nested folders
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('archive_folders_company_idx').on(table.companyId),
  parentIdx: index('archive_folders_parent_idx').on(table.parentId),
}))

// === A-2. archive_items — 기밀문서 아카이브 항목 ===
export const archiveItems = pgTable('archive_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  commandId: uuid('command_id').notNull().references(() => commands.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  classification: classificationEnum('classification').notNull().default('internal'),
  content: text('content'),  // 원본 result 마크다운
  summary: text('summary'),  // 사용자 작성 요약
  tags: jsonb('tags').$type<string[]>().default([]),
  folderId: uuid('folder_id').references(() => archiveFolders.id),
  qualityScore: real('quality_score'),  // 아카이브 시점 품질 점수 스냅샷
  agentId: uuid('agent_id').references(() => agents.id),
  departmentId: uuid('department_id').references(() => departments.id),
  commandType: varchar('command_type', { length: 50 }),  // 원본 명령 유형
  commandText: text('command_text'),  // 원본 명령 텍스트 (유사 문서 검색용)
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),  // soft delete
}, (table) => ({
  companyIdx: index('archive_items_company_idx').on(table.companyId),
  commandUniq: uniqueIndex('archive_items_command_uniq').on(table.companyId, table.commandId),
  classificationIdx: index('archive_items_classification_idx').on(table.companyId, table.classification),
  folderIdx: index('archive_items_folder_idx').on(table.companyId, table.folderId),
  departmentIdx: index('archive_items_department_idx').on(table.companyId, table.departmentId),
}))

// === Archive Relations ===
export const archiveFoldersRelations = relations(archiveFolders, ({ one, many }) => ({
  company: one(companies, { fields: [archiveFolders.companyId], references: [companies.id] }),
  parent: one(archiveFolders, { fields: [archiveFolders.parentId], references: [archiveFolders.id], relationName: 'archiveFolderChildren' }),
  children: many(archiveFolders, { relationName: 'archiveFolderChildren' }),
  items: many(archiveItems),
}))

export const archiveItemsRelations = relations(archiveItems, ({ one }) => ({
  company: one(companies, { fields: [archiveItems.companyId], references: [companies.id] }),
  command: one(commands, { fields: [archiveItems.commandId], references: [commands.id] }),
  user: one(users, { fields: [archiveItems.userId], references: [users.id] }),
  agent: one(agents, { fields: [archiveItems.agentId], references: [agents.id] }),
  department: one(departments, { fields: [archiveItems.departmentId], references: [departments.id] }),
  folder: one(archiveFolders, { fields: [archiveItems.folderId], references: [archiveFolders.id] }),
}))

// === Phase 2: Workflow Automation (Epic 18 Story 1) ===

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  steps: jsonb('steps').notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('workflows_company_idx').on(table.companyId),
  isActiveIdx: index('workflows_is_active_idx').on(table.companyId, table.isActive),
}))

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  company: one(companies, { fields: [workflows.companyId], references: [companies.id] }),
  creator: one(users, { fields: [workflows.createdBy], references: [users.id] }),
  executions: many(workflowExecutions),
}))

export const workflowExecutions = pgTable('workflow_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull(), // 'success', 'failed'
  totalDurationMs: integer('total_duration_ms').notNull(),
  stepSummaries: jsonb('step_summaries').notNull().default([]), // array of StepSummary
  triggeredBy: uuid('triggered_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('workflow_executions_company_idx').on(table.companyId),
  workflowIdx: index('workflow_executions_workflow_idx').on(table.workflowId),
  createdIdx: index('workflow_executions_created_idx').on(table.workflowId, table.createdAt),
}))

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  company: one(companies, { fields: [workflowExecutions.companyId], references: [companies.id] }),
  workflow: one(workflows, { fields: [workflowExecutions.workflowId], references: [workflows.id] })
}))

export const workflowSuggestions = pgTable('workflow_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  suggestedSteps: jsonb('suggested_steps').notNull().default([]),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyUserIdx: index('workflow_suggestions_company_user_idx').on(table.companyId, table.userId),
  statusIdx: index('workflow_suggestions_status_idx').on(table.companyId, table.status),
}))

export const workflowSuggestionsRelations = relations(workflowSuggestions, ({ one }) => ({
  company: one(companies, { fields: [workflowSuggestions.companyId], references: [companies.id] }),
  user: one(users, { fields: [workflowSuggestions.userId], references: [users.id] }),
}))

// === Story 16.2: credentials — Encrypted API Key Storage (D23, FR-CM1, FR-CM6) ===
export const credentials = pgTable('credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  keyName: text('key_name').notNull(),
  encryptedValue: text('encrypted_value').notNull(),
  createdByUserId: text('created_by_user_id'),
  updatedByUserId: text('updated_by_user_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('credentials_company_idx').on(table.companyId),
  companyKeyUniq: unique('credentials_company_key_uniq').on(table.companyId, table.keyName),
}))

// === Story 20.1: agent_reports — AI Agent Report Storage (D27, E15, FR-RM1~4) ===
// Distinct from human `reports` table — stores AI-generated markdown reports with distribution tracking
export const agentReports = pgTable('agent_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').references(() => agents.id),
  runId: text('run_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  distributionResults: jsonb('distribution_results').$type<Record<string, string>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyDateIdx: index('agent_reports_company_date').on(table.companyId, table.createdAt),
}))

// === Story 18.1: mcp_server_configs — MCP Server Registry (FR-MCP1~3, D25, NFR-I3) ===
// Admin-managed MCP server definitions. transport field: 'stdio' (Phase 1), 'sse'/'http' (Phase 2+).
export const mcpServerConfigs = pgTable('mcp_server_configs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   uuid('company_id').notNull().references(() => companies.id),
  displayName: text('display_name').notNull(),
  transport:   text('transport').notNull(),         // 'stdio' | 'sse' | 'http'
  command:     text('command'),                     // e.g., 'npx' (stdio only)
  args:        jsonb('args').$type<string[]>().default([]),   // e.g., ['-y', '@notionhq/notion-mcp-server']
  env:         jsonb('env').$type<Record<string, string>>().default({}),  // {'NOTION_TOKEN': '{{credential:xxx}}'}
  isActive:    boolean('is_active').notNull().default(true),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  companyIdx: index('mcp_server_configs_company_idx').on(t.companyId),
}))

// === Story 18.1: agent_mcp_access — Per-Agent MCP Access Control (FR-MCP2, D22) ===
// Composite PK (agent_id, mcp_server_id). Default OFF — must be explicitly granted by Admin.
// Both FKs use cascade delete so removing an agent or MCP server auto-cleans access rows.
export const agentMcpAccess = pgTable('agent_mcp_access', {
  agentId:     uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  mcpServerId: uuid('mcp_server_id').notNull().references(() => mcpServerConfigs.id, { onDelete: 'cascade' }),
  grantedAt:   timestamp('granted_at').notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.agentId, t.mcpServerId] }),
}))

// === Story 18.1: mcp_lifecycle_events — MCP Process Lifecycle Audit (FR-SO3, NFR-R3) ===
// Tracks spawn/init/discover/execute/teardown/error per session. Used for zombie process detection.
// NFR-R3: SELECT WHERE event != 'teardown' AND created_at < NOW() - INTERVAL '30 seconds'
//   AND session_id NOT IN (SELECT session_id WHERE event = 'teardown') → Admin alert
export const mcpLifecycleEvents = pgTable('mcp_lifecycle_events', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   uuid('company_id').notNull().references(() => companies.id),
  mcpServerId: uuid('mcp_server_id').references(() => mcpServerConfigs.id),
  sessionId:   text('session_id').notNull(),         // SessionContext.sessionId for zombie detection
  event:       text('event').notNull(),              // 'spawn'|'init'|'discover'|'execute'|'teardown'|'error'
  latencyMs:   integer('latency_ms'),                // NFR-P2 warm start latency source
  errorCode:   text('error_code'),                   // e.g., 'AGENT_MCP_CREDENTIAL_MISSING'
  createdAt:   timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idxCompanyMcp: index('mle_company_mcp').on(t.companyId, t.mcpServerId, t.createdAt),
  idxSession:    index('mle_session').on(t.sessionId),
}))

// === Story 17.1b: tool_call_events — Telemetry (D29, FR-SO2, E17) ===
// Write-only for engine; read via admin route. D29: 4 indexes for Phase 2 Audit + Pipeline Gate SQL.
export const toolCallEvents = pgTable('tool_call_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').references(() => agents.id),
  runId: text('run_id').notNull(),    // E17: groups all tool calls in one pipeline session
  toolName: text('tool_name').notNull(),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  success: boolean('success'),
  errorCode: text('error_code'),      // e.g. 'TOOL_QUOTA_EXHAUSTED', 'TOOL_NOT_ALLOWED'
  durationMs: integer('duration_ms'),
}, (t) => ({
  // D29: 3 compound indexes + run_id index (Pipeline Gate SQL: SELECT ... WHERE run_id = $1)
  idxCompanyDate:      index('tce_company_date').on(t.companyId, t.startedAt),
  idxCompanyAgentDate: index('tce_company_agent_date').on(t.companyId, t.agentId, t.startedAt),
  idxCompanyToolDate:  index('tce_company_tool_date').on(t.companyId, t.toolName, t.startedAt),
  idxRunId:            index('tce_run_id').on(t.runId),
}))

// === Story 15.3: semantic_cache — Semantic Caching (D19/D20) ===
export const semanticCache = pgTable('semantic_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull(),
  queryText: text('query_text').notNull(),
  queryEmbedding: vector('query_embedding', { dimensions: 1024 }).notNull(),  // Voyage AI voyage-3 1024-dim
  response: text('response').notNull(),
  ttlHours: integer('ttl_hours').notNull().default(24),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('semantic_cache_company_idx').on(table.companyId),
}))

// === Story 28.1: observations — Agent task execution recordings (D22, MEM-6 Layer 1) ===
export const observations = pgTable('observations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id'),
  taskExecutionId: uuid('task_execution_id'),
  content: text('content').notNull(),
  domain: varchar('domain', { length: 50 }).notNull().default('conversation'),
  outcome: varchar('outcome', { length: 20 }).notNull().default('unknown'),
  toolUsed: varchar('tool_used', { length: 100 }),
  importance: integer('importance').notNull().default(5),
  confidence: real('confidence').notNull().default(0.5),
  embedding: vector('embedding', { dimensions: 1024 }),
  reflected: boolean('reflected').notNull().default(false),
  reflectedAt: timestamp('reflected_at'),
  flagged: boolean('flagged').notNull().default(false),
  observedAt: timestamp('observed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  unreflectedIdx: index('idx_observations_unreflected')
    .on(table.companyId, table.agentId, table.importance),
  ttlIdx: index('idx_observations_ttl').on(table.reflectedAt),
}))
