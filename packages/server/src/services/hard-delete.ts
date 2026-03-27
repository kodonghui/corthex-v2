/**
 * Hard Delete Service — Permanently removes entities and all FK-dependent data.
 * Only works on INACTIVE entities. Uses application-level cascade in a single transaction.
 */
import { eq, and, inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import * as s from '../db/schema'

// ── Agent Hard Delete ──

export async function hardDeleteAgent(agentId: string, companyId: string) {
  const [agent] = await db.select().from(s.agents).where(and(eq(s.agents.id, agentId), eq(s.agents.companyId, companyId))).limit(1)
  if (!agent) throw Object.assign(new Error('에이전트를 찾을 수 없습니다'), { status: 404 })
  if (agent.isActive) throw Object.assign(new Error('비활성화된 에이전트만 영구 삭제할 수 있습니다'), { status: 400, code: 'HARD_DELETE_001' })
  if (agent.isSystem) throw Object.assign(new Error('시스템 에이전트는 삭제할 수 없습니다'), { status: 403, code: 'HARD_DELETE_002' })
  if (agent.isSecretary) throw Object.assign(new Error('비서 에이전트는 삭제할 수 없습니다'), { status: 403, code: 'HARD_DELETE_002' })

  await db.transaction(async (tx) => {
    // DB CASCADE tables (auto-deleted but explicit for clarity)
    await tx.delete(s.capabilityEvaluations).where(eq(s.capabilityEvaluations.agentId, agentId))
    await tx.delete(s.observations).where(eq(s.observations.agentId, agentId))
    await tx.delete(s.agentMcpAccess).where(eq(s.agentMcpAccess.agentId, agentId))

    // Leaf tables
    await tx.delete(s.soulGymRounds).where(eq(s.soulGymRounds.agentId, agentId))
    await tx.delete(s.soulEvolutionProposals).where(eq(s.soulEvolutionProposals.agentId, agentId))
    await tx.delete(s.soulBackups).where(eq(s.soulBackups.agentId, agentId))
    await tx.delete(s.agentMemories).where(eq(s.agentMemories.agentId, agentId))
    await tx.delete(s.agentMemory).where(eq(s.agentMemory.agentId, agentId))
    await tx.delete(s.agentTools).where(eq(s.agentTools.agentId, agentId))
    await tx.delete(s.toolCallEvents).where(eq(s.toolCallEvents.agentId, agentId))
    await tx.delete(s.toolCalls).where(eq(s.toolCalls.agentId, agentId))
    await tx.delete(s.costRecords).where(eq(s.costRecords.agentId, agentId))
    await tx.delete(s.activityLogs).where(eq(s.activityLogs.agentId, agentId))
    await tx.delete(s.orchestrationTasks).where(eq(s.orchestrationTasks.agentId, agentId))
    await tx.delete(s.qualityReviews).where(eq(s.qualityReviews.reviewerAgentId, agentId))
    await tx.delete(s.agentDelegationRules).where(eq(s.agentDelegationRules.sourceAgentId, agentId))
    await tx.delete(s.agentDelegationRules).where(eq(s.agentDelegationRules.targetAgentId, agentId))
    await tx.delete(s.agentReports).where(eq(s.agentReports.agentId, agentId))
    await tx.delete(s.snsContents).where(eq(s.snsContents.agentId, agentId))

    // Chat: messages first, then sessions
    const sessions = await tx.select({ id: s.chatSessions.id }).from(s.chatSessions).where(eq(s.chatSessions.agentId, agentId))
    if (sessions.length > 0) {
      const sessionIds = sessions.map((r) => r.id)
      await tx.delete(s.chatMessages).where(inArray(s.chatMessages.sessionId, sessionIds))
    }
    await tx.delete(s.chatSessions).where(eq(s.chatSessions.agentId, agentId))

    // Delegations
    await tx.delete(s.delegations).where(eq(s.delegations.secretaryAgentId, agentId))
    await tx.delete(s.delegations).where(eq(s.delegations.targetAgentId, agentId))

    // Night jobs chain: cronRuns → nightJobSchedules, argosEvents → nightJobTriggers, then nightJobs
    const schedules = await tx.select({ id: s.nightJobSchedules.id }).from(s.nightJobSchedules).where(eq(s.nightJobSchedules.agentId, agentId))
    if (schedules.length > 0) {
      await tx.delete(s.cronRuns).where(inArray(s.cronRuns.cronJobId, schedules.map((r) => r.id)))
    }
    await tx.delete(s.nightJobSchedules).where(eq(s.nightJobSchedules.agentId, agentId))

    const triggers = await tx.select({ id: s.nightJobTriggers.id }).from(s.nightJobTriggers).where(eq(s.nightJobTriggers.agentId, agentId))
    if (triggers.length > 0) {
      await tx.delete(s.argosEvents).where(inArray(s.argosEvents.triggerId, triggers.map((r) => r.id)))
    }
    await tx.delete(s.nightJobTriggers).where(eq(s.nightJobTriggers.agentId, agentId))
    await tx.delete(s.nightJobs).where(eq(s.nightJobs.agentId, agentId))

    // Nullable FKs — set null
    await tx.update(s.commands).set({ targetAgentId: sql`null` }).where(eq(s.commands.targetAgentId, agentId))
    await tx.update(s.strategyOrders).set({ agentId: sql`null` }).where(eq(s.strategyOrders.agentId, agentId))
    await tx.update(s.archiveItems).set({ agentId: sql`null` }).where(eq(s.archiveItems.agentId, agentId))

    // Finally: agent itself
    await tx.delete(s.agents).where(eq(s.agents.id, agentId))
  })

  return { id: agentId, name: agent.name }
}

// ── Employee Hard Delete ──

export async function hardDeleteEmployee(userId: string, companyId: string) {
  const [user] = await db.select().from(s.users).where(and(eq(s.users.id, userId), eq(s.users.companyId, companyId))).limit(1)
  if (!user) throw Object.assign(new Error('직원을 찾을 수 없습니다'), { status: 404 })
  if (user.isActive) throw Object.assign(new Error('비활성화된 직원만 영구 삭제할 수 있습니다'), { status: 400, code: 'HARD_DELETE_001' })

  // Find agents owned by this user
  const ownedAgents = await db.select({ id: s.agents.id, isSystem: s.agents.isSystem, isSecretary: s.agents.isSecretary, isActive: s.agents.isActive })
    .from(s.agents).where(and(eq(s.agents.userId, userId), eq(s.agents.companyId, companyId)))

  // Hard delete owned agents (skip system/secretary)
  for (const agent of ownedAgents) {
    if (agent.isSystem || agent.isSecretary) continue
    if (agent.isActive) {
      // Deactivate first
      await db.update(s.agents).set({ isActive: false, status: 'offline' }).where(eq(s.agents.id, agent.id))
    }
    await hardDeleteAgent(agent.id, companyId)
  }

  await db.transaction(async (tx) => {
    // Sessions
    await tx.delete(s.sessions).where(eq(s.sessions.userId, userId))
    await tx.delete(s.pushSubscriptions).where(eq(s.pushSubscriptions.userId, userId))
    await tx.delete(s.notificationPreferences).where(eq(s.notificationPreferences.userId, userId))
    await tx.delete(s.notifications).where(eq(s.notifications.userId, userId))
    await tx.delete(s.employeeDepartments).where(eq(s.employeeDepartments.userId, userId))
    await tx.delete(s.cliCredentials).where(eq(s.cliCredentials.userId, userId))
    await tx.delete(s.apiKeys).where(eq(s.apiKeys.userId, userId))
    await tx.delete(s.bookmarks).where(eq(s.bookmarks.userId, userId))
    await tx.delete(s.presets).where(eq(s.presets.userId, userId))

    // Strategy
    await tx.delete(s.strategyNoteShares).where(eq(s.strategyNoteShares.sharedWithUserId, userId))
    await tx.delete(s.strategyOrders).where(eq(s.strategyOrders.userId, userId))
    await tx.delete(s.strategyBacktestResults).where(eq(s.strategyBacktestResults.userId, userId))
    await tx.delete(s.strategyNotes).where(eq(s.strategyNotes.userId, userId))
    await tx.delete(s.strategyPortfolios).where(eq(s.strategyPortfolios.userId, userId))
    await tx.delete(s.strategyWatchlists).where(eq(s.strategyWatchlists.userId, userId))

    // Reports
    await tx.delete(s.reportComments).where(eq(s.reportComments.authorId, userId))
    await tx.delete(s.reports).where(eq(s.reports.authorId, userId))
    await tx.delete(s.reportLines).where(eq(s.reportLines.reporterId, userId))
    await tx.delete(s.reportLines).where(eq(s.reportLines.supervisorId, userId))

    // Files
    await tx.delete(s.files).where(eq(s.files.userId, userId))

    // Messenger
    await tx.delete(s.messengerReactions).where(eq(s.messengerReactions.userId, userId))
    await tx.delete(s.messengerMessages).where(eq(s.messengerMessages.userId, userId))
    await tx.delete(s.messengerMembers).where(eq(s.messengerMembers.userId, userId))

    // Conversations
    await tx.delete(s.conversationParticipants).where(eq(s.conversationParticipants.userId, userId))
    await tx.delete(s.messages).where(eq(s.messages.senderId, userId))

    // Chat sessions owned by user
    const userSessions = await tx.select({ id: s.chatSessions.id }).from(s.chatSessions).where(eq(s.chatSessions.userId, userId))
    if (userSessions.length > 0) {
      await tx.delete(s.chatMessages).where(inArray(s.chatMessages.sessionId, userSessions.map((r) => r.id)))
    }
    await tx.delete(s.chatSessions).where(eq(s.chatSessions.userId, userId))

    // Night jobs chain
    await tx.delete(s.nightJobs).where(eq(s.nightJobs.userId, userId))
    await tx.delete(s.nightJobSchedules).where(eq(s.nightJobSchedules.userId, userId))
    await tx.delete(s.nightJobTriggers).where(eq(s.nightJobTriggers.userId, userId))

    // Commands
    await tx.delete(s.commands).where(eq(s.commands.userId, userId))

    // Workflows
    await tx.delete(s.workflowSuggestions).where(eq(s.workflowSuggestions.userId, userId))

    // Activity/cost
    await tx.delete(s.activityLogs).where(eq(s.activityLogs.userId, userId))

    // Shared resources — SET NULL (don't destroy shared data)
    await tx.update(s.knowledgeDocs).set({ createdBy: sql`null` }).where(eq(s.knowledgeDocs.createdBy, userId))
    await tx.update(s.knowledgeDocs).set({ updatedBy: sql`null` }).where(eq(s.knowledgeDocs.updatedBy, userId))
    await tx.update(s.knowledgeFolders).set({ createdBy: sql`null` }).where(eq(s.knowledgeFolders.createdBy, userId))
    await tx.update(s.docVersions).set({ editedBy: sql`null` }).where(eq(s.docVersions.editedBy, userId))
    await tx.update(s.soulTemplates).set({ createdBy: sql`null` }).where(eq(s.soulTemplates.createdBy, userId))
    await tx.update(s.snsAccounts).set({ createdBy: sql`null` }).where(eq(s.snsAccounts.createdBy, userId))

    // Unlink owned agents (system/secretary survive)
    await tx.update(s.agents).set({ userId: sql`null` }).where(eq(s.agents.userId, userId))

    // Finally: user itself
    await tx.delete(s.users).where(eq(s.users.id, userId))
  })

  return { id: userId, name: user.name }
}

// ── Company Hard Delete ──

export async function hardDeleteCompany(companyId: string, confirmName: string) {
  const [company] = await db.select().from(s.companies).where(eq(s.companies.id, companyId)).limit(1)
  if (!company) throw Object.assign(new Error('회사를 찾을 수 없습니다'), { status: 404 })
  if (company.isActive) throw Object.assign(new Error('비활성화된 회사만 영구 삭제할 수 있습니다'), { status: 400, code: 'HARD_DELETE_001' })
  if (company.name !== confirmName) throw Object.assign(new Error('회사 이름이 일치하지 않습니다'), { status: 400, code: 'HARD_DELETE_003' })

  const cid = companyId

  await db.transaction(async (tx) => {
    // ── Layer 0: Deepest leaf tables ──
    await tx.delete(s.capabilityEvaluations).where(eq(s.capabilityEvaluations.companyId, cid))
    await tx.delete(s.observations).where(eq(s.observations.companyId, cid))
    await tx.delete(s.mcpLifecycleEvents).where(eq(s.mcpLifecycleEvents.companyId, cid))
    await tx.delete(s.toolCallEvents).where(eq(s.toolCallEvents.companyId, cid))
    await tx.delete(s.semanticCache).where(eq(s.semanticCache.companyId, cid))
    // sketchVersions has CASCADE on sketches — deleted when sketches are deleted
    await tx.delete(s.messengerReactions).where(eq(s.messengerReactions.companyId, cid))
    await tx.delete(s.strategyNoteShares).where(eq(s.strategyNoteShares.companyId, cid))
    await tx.delete(s.conversationParticipants).where(eq(s.conversationParticipants.companyId, cid))
    // docVersions FK to knowledgeDocs — delete via docId
    const docs = await tx.select({ id: s.knowledgeDocs.id }).from(s.knowledgeDocs).where(eq(s.knowledgeDocs.companyId, cid))
    if (docs.length > 0) await tx.delete(s.docVersions).where(inArray(s.docVersions.docId, docs.map((r) => r.id)))

    // cronRuns/argosEvents (FK to schedules/triggers)
    const scheds = await tx.select({ id: s.nightJobSchedules.id }).from(s.nightJobSchedules).where(eq(s.nightJobSchedules.companyId, cid))
    if (scheds.length > 0) await tx.delete(s.cronRuns).where(inArray(s.cronRuns.cronJobId, scheds.map((r) => r.id)))
    const trigs = await tx.select({ id: s.nightJobTriggers.id }).from(s.nightJobTriggers).where(eq(s.nightJobTriggers.companyId, cid))
    if (trigs.length > 0) await tx.delete(s.argosEvents).where(inArray(s.argosEvents.triggerId, trigs.map((r) => r.id)))

    // Workflow executions
    const wfs = await tx.select({ id: s.workflows.id }).from(s.workflows).where(eq(s.workflows.companyId, cid))
    if (wfs.length > 0) await tx.delete(s.workflowExecutions).where(inArray(s.workflowExecutions.workflowId, wfs.map((r) => r.id)))
    await tx.delete(s.workflowSuggestions).where(eq(s.workflowSuggestions.companyId, cid))

    // Nexus executions
    const nws = await tx.select({ id: s.nexusWorkflows.id }).from(s.nexusWorkflows).where(eq(s.nexusWorkflows.companyId, cid))
    if (nws.length > 0) await tx.delete(s.nexusExecutions).where(inArray(s.nexusExecutions.workflowId, nws.map((r) => r.id)))

    // ── Layer 1: Mid-level tables ──
    await tx.delete(s.soulGymRounds).where(eq(s.soulGymRounds.companyId, cid))
    await tx.delete(s.soulEvolutionProposals).where(eq(s.soulEvolutionProposals.companyId, cid))
    await tx.delete(s.soulBackups).where(eq(s.soulBackups.companyId, cid))
    await tx.delete(s.agentMemories).where(eq(s.agentMemories.companyId, cid))
    await tx.delete(s.agentMemory).where(eq(s.agentMemory.companyId, cid))
    await tx.delete(s.agentTools).where(eq(s.agentTools.companyId, cid))
    // agentMcpAccess has CASCADE on agents — deleted when agents are deleted
    await tx.delete(s.toolCalls).where(eq(s.toolCalls.companyId, cid))
    await tx.delete(s.costRecords).where(eq(s.costRecords.companyId, cid))
    await tx.delete(s.activityLogs).where(eq(s.activityLogs.companyId, cid))
    await tx.delete(s.chatMessages).where(eq(s.chatMessages.companyId, cid))
    await tx.delete(s.orchestrationTasks).where(eq(s.orchestrationTasks.companyId, cid))
    await tx.delete(s.qualityReviews).where(eq(s.qualityReviews.companyId, cid))
    await tx.delete(s.agentDelegationRules).where(eq(s.agentDelegationRules.companyId, cid))
    await tx.delete(s.agentReports).where(eq(s.agentReports.companyId, cid))
    await tx.delete(s.notifications).where(eq(s.notifications.companyId, cid))
    await tx.delete(s.notificationPreferences).where(eq(s.notificationPreferences.companyId, cid))
    await tx.delete(s.pushSubscriptions).where(eq(s.pushSubscriptions.companyId, cid))
    await tx.delete(s.bookmarks).where(eq(s.bookmarks.companyId, cid))
    await tx.delete(s.reportComments).where(eq(s.reportComments.companyId, cid))
    await tx.delete(s.messengerMessages).where(eq(s.messengerMessages.companyId, cid))
    await tx.delete(s.messengerMembers).where(eq(s.messengerMembers.companyId, cid))
    await tx.delete(s.messages).where(eq(s.messages.companyId, cid))
    await tx.delete(s.strategyOrders).where(eq(s.strategyOrders.companyId, cid))
    await tx.delete(s.strategyBacktestResults).where(eq(s.strategyBacktestResults.companyId, cid))
    await tx.delete(s.companyApiKeys).where(eq(s.companyApiKeys.companyId, cid))
    await tx.delete(s.snsContents).where(eq(s.snsContents.companyId, cid))

    // ── Layer 2: Relationship tables ──
    await tx.delete(s.chatSessions).where(eq(s.chatSessions.companyId, cid))
    await tx.delete(s.delegations).where(eq(s.delegations.companyId, cid))
    await tx.delete(s.nightJobSchedules).where(eq(s.nightJobSchedules.companyId, cid))
    await tx.delete(s.nightJobTriggers).where(eq(s.nightJobTriggers.companyId, cid))
    await tx.delete(s.nightJobs).where(eq(s.nightJobs.companyId, cid))
    await tx.delete(s.commands).where(eq(s.commands.companyId, cid))
    await tx.delete(s.reports).where(eq(s.reports.companyId, cid))
    await tx.delete(s.reportLines).where(eq(s.reportLines.companyId, cid))
    await tx.delete(s.messengerChannels).where(eq(s.messengerChannels.companyId, cid))
    await tx.delete(s.conversations).where(eq(s.conversations.companyId, cid))
    await tx.delete(s.snsAccounts).where(eq(s.snsAccounts.companyId, cid))
    await tx.delete(s.strategyNotes).where(eq(s.strategyNotes.companyId, cid))
    await tx.delete(s.strategyPortfolios).where(eq(s.strategyPortfolios.companyId, cid))
    await tx.delete(s.strategyWatchlists).where(eq(s.strategyWatchlists.companyId, cid))
    await tx.delete(s.files).where(eq(s.files.companyId, cid))
    await tx.delete(s.cliCredentials).where(eq(s.cliCredentials.companyId, cid))
    await tx.delete(s.apiKeys).where(eq(s.apiKeys.companyId, cid))
    await tx.delete(s.invitations).where(eq(s.invitations.companyId, cid))
    await tx.delete(s.knowledgeDocs).where(eq(s.knowledgeDocs.companyId, cid))
    await tx.delete(s.knowledgeFolders).where(eq(s.knowledgeFolders.companyId, cid))
    await tx.delete(s.sketches).where(eq(s.sketches.companyId, cid))
    await tx.delete(s.nexusWorkflows).where(eq(s.nexusWorkflows.companyId, cid))
    await tx.delete(s.workflows).where(eq(s.workflows.companyId, cid))
    await tx.delete(s.debates).where(eq(s.debates.companyId, cid))
    await tx.delete(s.presets).where(eq(s.presets.companyId, cid))
    await tx.delete(s.archiveItems).where(eq(s.archiveItems.companyId, cid))
    await tx.delete(s.archiveFolders).where(eq(s.archiveFolders.companyId, cid))
    await tx.delete(s.mcpServerConfigs).where(eq(s.mcpServerConfigs.companyId, cid))
    await tx.delete(s.mcpServers).where(eq(s.mcpServers.companyId, cid))
    await tx.delete(s.credentials).where(eq(s.credentials.companyId, cid))
    await tx.delete(s.departmentKnowledge).where(eq(s.departmentKnowledge.companyId, cid))
    await tx.delete(s.employeeDepartments).where(eq(s.employeeDepartments.companyId, cid))
    await tx.delete(s.toolDefinitions).where(eq(s.toolDefinitions.companyId, cid))

    // ── Layer 3: Core entities ──
    await tx.delete(s.agents).where(eq(s.agents.companyId, cid))
    await tx.delete(s.soulTemplates).where(eq(s.soulTemplates.companyId, cid))
    await tx.delete(s.orgTemplates).where(eq(s.orgTemplates.companyId, cid))
    // adminSessions FK to adminUsers — delete via adminUserId
    const admins = await tx.select({ id: s.adminUsers.id }).from(s.adminUsers).where(eq(s.adminUsers.companyId, cid))
    if (admins.length > 0) await tx.delete(s.adminSessions).where(inArray(s.adminSessions.adminUserId, admins.map((r) => r.id)))
    await tx.delete(s.sessions).where(eq(s.sessions.companyId, cid))
    await tx.delete(s.adminUsers).where(eq(s.adminUsers.companyId, cid))
    await tx.delete(s.users).where(eq(s.users.companyId, cid))
    await tx.delete(s.departments).where(eq(s.departments.companyId, cid))
    await tx.delete(s.tierConfigs).where(eq(s.tierConfigs.companyId, cid))
    await tx.delete(s.telegramConfigs).where(eq(s.telegramConfigs.companyId, cid))
    await tx.delete(s.canvasLayouts).where(eq(s.canvasLayouts.companyId, cid))
    await tx.delete(s.auditLogs).where(eq(s.auditLogs.companyId, cid))

    // ── Layer 4: Company itself ──
    await tx.delete(s.companies).where(eq(s.companies.id, cid))
  })

  return { id: companyId, name: company.name }
}
