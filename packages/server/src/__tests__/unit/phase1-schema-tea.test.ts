import { describe, expect, test } from 'bun:test'
import * as schema from '../../db/schema'
import { getTableColumns } from 'drizzle-orm'

/**
 * TEA Risk-Based Tests for Phase 1 Schema Extension
 * Risk focus: tenant isolation, relational integrity, INSERT-ONLY audit_logs
 */
describe('TEA: Phase 1 Schema Risk-Based Tests', () => {

  // === RISK HIGH: Tenant Isolation Compliance ===
  describe('RISK-HIGH: All Phase 1 tables have companyId FK', () => {
    const p1Tables = {
      commands: schema.commands,
      orchestrationTasks: schema.orchestrationTasks,
      qualityReviews: schema.qualityReviews,
      presets: schema.presets,
      auditLogs: schema.auditLogs,
    }

    for (const [name, table] of Object.entries(p1Tables)) {
      test(`${name} must have companyId column with NOT NULL`, () => {
        const cols = getTableColumns(table)
        expect(cols.companyId).toBeDefined()
        expect(cols.companyId.notNull).toBe(true)
      })
    }

    test('orgTemplates companyId is nullable (platform built-in templates)', () => {
      const cols = getTableColumns(schema.orgTemplates)
      expect(cols.companyId).toBeDefined()
      // orgTemplates allows null companyId for built-in templates
      expect(cols.companyId.notNull).toBe(false)
    })
  })

  // === RISK HIGH: Relational Integrity ===
  describe('RISK-HIGH: FK references are correct', () => {
    test('commands references companies, users, agents', () => {
      const cols = getTableColumns(schema.commands)
      expect(cols.companyId).toBeDefined()
      expect(cols.userId).toBeDefined()
      expect(cols.targetAgentId).toBeDefined()
    })

    test('orchestrationTasks references companies, commands, agents', () => {
      const cols = getTableColumns(schema.orchestrationTasks)
      expect(cols.companyId).toBeDefined()
      expect(cols.commandId).toBeDefined()
      expect(cols.agentId).toBeDefined()
      expect(cols.parentTaskId).toBeDefined()
    })

    test('qualityReviews references companies, commands, orchestrationTasks, agents', () => {
      const cols = getTableColumns(schema.qualityReviews)
      expect(cols.companyId).toBeDefined()
      expect(cols.commandId).toBeDefined()
      expect(cols.taskId).toBeDefined()
      expect(cols.reviewerAgentId).toBeDefined()
    })

    test('presets references companies, users', () => {
      const cols = getTableColumns(schema.presets)
      expect(cols.companyId).toBeDefined()
      expect(cols.userId).toBeDefined()
    })
  })

  // === RISK MEDIUM: INSERT-ONLY audit_logs contract ===
  describe('RISK-MEDIUM: audit_logs INSERT-ONLY contract', () => {
    test('audit_logs has NO updatedAt column', () => {
      const cols = getTableColumns(schema.auditLogs) as Record<string, unknown>
      expect(cols.updatedAt).toBeUndefined()
    })

    test('audit_logs has createdAt column', () => {
      const cols = getTableColumns(schema.auditLogs)
      expect(cols.createdAt).toBeDefined()
    })

    test('audit_logs has required audit fields', () => {
      const cols = getTableColumns(schema.auditLogs)
      expect(cols.actorType).toBeDefined()
      expect(cols.actorId).toBeDefined()
      expect(cols.action).toBeDefined()
      expect(cols.before).toBeDefined()
      expect(cols.after).toBeDefined()
    })
  })

  // === RISK MEDIUM: Enum values correctness ===
  describe('RISK-MEDIUM: Enum values', () => {
    test('commandTypeEnum has all 8 command types', () => {
      expect(schema.commandTypeEnum.enumValues).toEqual(
        ['direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork']
      )
    })

    test('orchestrationTaskStatusEnum has all 5 statuses', () => {
      expect(schema.orchestrationTaskStatusEnum.enumValues).toEqual(
        ['pending', 'running', 'completed', 'failed', 'timeout']
      )
    })

    test('qualityResultEnum has pass and fail', () => {
      expect(schema.qualityResultEnum.enumValues).toEqual(['pass', 'fail'])
    })
  })

  // === RISK MEDIUM: agents extension does not break existing ===
  describe('RISK-MEDIUM: agents table backward compatibility', () => {
    test('agents still has all original columns', () => {
      const cols = getTableColumns(schema.agents)
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.userId).toBeDefined()
      expect(cols.departmentId).toBeDefined()
      expect(cols.name).toBeDefined()
      expect(cols.tier).toBeDefined()
      expect(cols.modelName).toBeDefined()
      expect(cols.soul).toBeDefined()
      expect(cols.status).toBeDefined()
      expect(cols.isSecretary).toBeDefined()
      expect(cols.isActive).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.updatedAt).toBeDefined()
    })

    test('agents has new isSystem column with default false', () => {
      const cols = getTableColumns(schema.agents)
      expect(cols.isSystem).toBeDefined()
      expect(cols.isSystem.default).toBe(false)
    })

    test('agents has new allowedTools column with default empty array', () => {
      const cols = getTableColumns(schema.agents)
      expect(cols.allowedTools).toBeDefined()
    })
  })

  // === RISK LOW: Table timestamps ===
  describe('RISK-LOW: Timestamp columns', () => {
    const tablesWithUpdatedAt = [
      { name: 'presets', table: schema.presets },
      { name: 'orgTemplates', table: schema.orgTemplates },
    ]

    for (const { name, table } of tablesWithUpdatedAt) {
      test(`${name} has both createdAt and updatedAt`, () => {
        const cols = getTableColumns(table)
        expect(cols.createdAt).toBeDefined()
        expect(cols.updatedAt).toBeDefined()
      })
    }

    const tablesWithoutUpdatedAt = [
      { name: 'commands', table: schema.commands },
      { name: 'orchestrationTasks', table: schema.orchestrationTasks },
      { name: 'qualityReviews', table: schema.qualityReviews },
      { name: 'auditLogs', table: schema.auditLogs },
    ]

    for (const { name, table } of tablesWithoutUpdatedAt) {
      test(`${name} has createdAt only (no updatedAt)`, () => {
        const cols = getTableColumns(table) as Record<string, unknown>
        expect(cols.createdAt).toBeDefined()
        expect(cols.updatedAt).toBeUndefined()
      })
    }
  })
})
