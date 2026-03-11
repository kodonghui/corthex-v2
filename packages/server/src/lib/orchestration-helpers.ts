/**
 * Orchestration Helpers — shared utility functions extracted from chief-of-staff.ts
 *
 * These functions are used by:
 * - chief-of-staff.ts (deprecated — process pipeline)
 * - all-command-processor.ts (deprecated — /전체 command)
 * - sequential-command-processor.ts (deprecated — /순차 command)
 * - cio-orchestrator.ts (deprecated — CIO investment pipeline)
 * - manager-delegate.ts (deprecated — manager delegation)
 * - manager-synthesis.ts (deprecated — result synthesis)
 *
 * New engine: engine/agent-loop.ts + engine/soul-renderer.ts + routes/workspace/hub.ts
 * These helpers will be removed once all callers are migrated to the new engine.
 */

import type { AgentConfig } from '../services/agent-runner'
import type { LLMRouterContext } from '../services/llm-router'
import { db } from '../db'
import { agents, departments, orchestrationTasks } from '../db/schema'
import { eq, and } from 'drizzle-orm'

// === makeContext: creates LLMRouterContext for delegation calls ===

export function makeContext(companyId: string, agent: AgentConfig): LLMRouterContext {
  return { companyId, agentId: agent.id, agentName: agent.name, source: 'delegation' }
}

// === toAgentConfig: maps a DB row to AgentConfig ===

export function toAgentConfig(row: {
  id: string
  companyId: string
  name: string
  nameEn: string | null
  tier: string
  modelName: string | null
  soul: string | null
  [key: string]: unknown
  allowedTools: unknown
  isActive: boolean
}): AgentConfig {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    nameEn: row.nameEn,
    tier: row.tier as 'manager' | 'specialist' | 'worker',
    modelName: row.modelName ?? 'claude-sonnet-4-6',
    soul: row.soul,
    allowedTools: (row.allowedTools as string[]) ?? [],
    isActive: row.isActive,
    departmentId: (row.departmentId as string | null) ?? null,
    autoLearn: (row.autoLearn as boolean | undefined) ?? true,
  }
}

// === createOrchTask: inserts an orchestration task record ===

export async function createOrchTask(params: {
  companyId: string
  commandId: string
  agentId: string
  parentTaskId?: string | null
  type: string
  input: string
}) {
  const [task] = await db
    .insert(orchestrationTasks)
    .values({
      companyId: params.companyId,
      commandId: params.commandId,
      agentId: params.agentId,
      parentTaskId: params.parentTaskId ?? null,
      type: params.type,
      input: params.input,
      status: 'running',
      startedAt: new Date(),
    })
    .returning()
  return task
}

// === completeOrchTask: marks an orchestration task as completed/failed ===

export async function completeOrchTask(taskId: string, output: string, status: 'completed' | 'failed', startedAt: Date | null) {
  await db
    .update(orchestrationTasks)
    .set({
      output,
      status,
      completedAt: new Date(),
      durationMs: startedAt ? Date.now() - startedAt.getTime() : 0,
    })
    .where(eq(orchestrationTasks.id, taskId))
}

// === findSecretaryAgent: finds the secretary agent for a company ===

export async function findSecretaryAgent(companyId: string): Promise<AgentConfig | null> {
  const [secretary] = await db
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.companyId, companyId),
        eq(agents.isSystem, true),
        eq(agents.isSecretary, true),
        eq(agents.isActive, true),
      ),
    )
    .limit(1)

  if (!secretary) return null

  return toAgentConfig(secretary)
}

// === getActiveManagers: gets all active manager agents for a company ===

export async function getActiveManagers(companyId: string) {
  return db
    .select({
      id: agents.id,
      name: agents.name,
      nameEn: agents.nameEn,
      role: agents.role,
      departmentId: agents.departmentId,
      tier: agents.tier,
      modelName: agents.modelName,
      soul: agents.soul,
      allowedTools: agents.allowedTools,
      isActive: agents.isActive,
    })
    .from(agents)
    .where(
      and(
        eq(agents.companyId, companyId),
        eq(agents.tier, 'manager'),
        eq(agents.isActive, true),
        eq(agents.isSecretary, false),
      ),
    )
}

// === parseLLMJson: extracts JSON from LLM response (handles code blocks) ===

export function parseLLMJson<T>(raw: string): T | null {
  // Strip markdown code blocks if present
  let cleaned = raw.trim()
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim()
  }
  // Try parsing raw if not a code block
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try extracting first { ... } or [ ... ] block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T
      } catch {
        return null
      }
    }
    return null
  }
}

// === getActiveDepartments: gets all active departments for a company ===

export async function getActiveDepartments(companyId: string) {
  return db
    .select({
      id: departments.id,
      name: departments.name,
      description: departments.description,
    })
    .from(departments)
    .where(
      and(
        eq(departments.companyId, companyId),
        eq(departments.isActive, true),
      ),
    )
}

// === isInvestmentDepartment: checks if a department is investment-related ===

const INVESTMENT_KEYWORDS = ['투자', '금융', '전략', 'investment', 'finance', 'strategy', 'trading', 'cio']

export async function isInvestmentDepartment(departmentId: string, companyId: string): Promise<boolean> {
  const [dept] = await db
    .select({ name: departments.name, description: departments.description })
    .from(departments)
    .where(and(eq(departments.id, departmentId), eq(departments.companyId, companyId)))
    .limit(1)

  if (!dept) return false

  const searchText = [dept.name, dept.description].filter(Boolean).join(' ').toLowerCase()
  return INVESTMENT_KEYWORDS.some(kw => searchText.includes(kw))
}
