import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// === Enums ===
export const userRoleEnum = pgEnum('user_role', ['admin', 'user'])
export const agentStatusEnum = pgEnum('agent_status', ['online', 'working', 'error', 'offline'])
export const messageSenderEnum = pgEnum('message_sender', ['user', 'agent'])
export const toolScopeEnum = pgEnum('tool_scope', ['platform', 'company', 'department'])
export const delegationStatusEnum = pgEnum('delegation_status', ['pending', 'processing', 'completed', 'failed'])

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
})

// === 3. departments — 부서 ===
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

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
})

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

// === 6. api_keys — 개인 API key (암호화) ===
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  provider: varchar('provider', { length: 50 }).notNull(),  // kis, notion, email, telegram
  label: varchar('label', { length: 100 }),
  encryptedKey: text('encrypted_key').notNull(),  // AES-256
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 7. chat_sessions — 채팅 세션 ===
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  title: varchar('title', { length: 200 }).notNull().default('새 대화'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 8. chat_messages — 채팅 메시지 히스토리 ===
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  sender: messageSenderEnum('sender').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

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

// === 10. tools — 도구 정의 ===
export const tools = pgTable('tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id),  // null = 플랫폼 공통
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  scope: toolScopeEnum('scope').notNull().default('platform'),
  config: jsonb('config'),  // 도구별 설정
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 11. agent_tools — 에이전트-도구 매핑 ===
export const agentTools = pgTable('agent_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  toolId: uuid('tool_id').notNull().references(() => tools.id),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// === 12. report_lines — 보고 라인 (H → 상위자) ===
export const reportLines = pgTable('report_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),  // 보고하는 사람
  supervisorId: uuid('supervisor_id').notNull().references(() => users.id),  // 보고받는 사람
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

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
